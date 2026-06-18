import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  UploadCloud, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  FileSpreadsheet, 
  AlertTriangle,
  Play
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../../lib/supabase';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  divisions: any[];
  onImportSuccess: (importedProcesses: any[]) => void;
}

// Field definition for process table
interface FieldConfig {
  key: string;
  label: string;
  required: boolean;
  type: 'text' | 'date' | 'integer' | 'select';
  options?: string[];
  placeholder?: string;
}

const PROCESS_FIELDS: FieldConfig[] = [
  { key: 'patdNumber', label: 'Nº PATD', required: true, type: 'text', placeholder: 'ex: 001/DIV/2026' },
  { key: 'militar', label: 'Militar Arrolado', required: true, type: 'text', placeholder: 'ex: S1 Silva' },
  { key: 'saram', label: 'SARAM', required: true, type: 'text', placeholder: 'ex: 6543210' },
  { key: 'posto', label: 'Posto do Arrolado', required: true, type: 'text', placeholder: 'ex: S1, 3S, Ten' },
  { key: 'quadro', label: 'Quadro do Arrolado', required: true, type: 'text', placeholder: 'ex: QADP, QSS, QOINT' },
  { key: 'especialidade', label: 'Especialidade', required: false, type: 'text', placeholder: 'ex: BEI, SGS' },
  { key: 'divisao', label: 'Divisão', required: true, type: 'text', placeholder: 'ex: DOA, GLOG-YS' },
  { key: 'setor', label: 'Setor', required: true, type: 'text', placeholder: 'ex: Seção de Pessoal' },
  { key: 'dataInicio', label: 'Data de Início', required: true, type: 'date', placeholder: 'AAAA-MM-DD' },
  { key: 'oficioNumero', label: 'Nº Ofício', required: false, type: 'text' },
  { key: 'protComaer', label: 'Protocolo COMAER', required: false, type: 'text' },
  { key: 'dataOficio', label: 'Data do Ofício', required: false, type: 'date' },
  { key: 'enquadramentoRdaer', label: 'Enquadramento RDAER', required: false, type: 'text' },
  { key: 'resumoFato', label: 'Resumo do Fato', required: true, type: 'text' },
  { key: 'apurador', label: 'Apurador', required: true, type: 'text' },
  { key: 'apuradorPosto', label: 'Posto Apurador', required: false, type: 'text' },
  { key: 'apuradorQuadro', label: 'Quadro Apurador', required: false, type: 'text' },
  { key: 'apuradorSaram', label: 'SARAM Apurador', required: false, type: 'text' },
  { key: 'aplicador', label: 'Aplicador', required: true, type: 'text' },
  { key: 'aplicadorPosto', label: 'Posto Aplicador', required: false, type: 'text' },
  { key: 'aplicadorQuadro', label: 'Quadro Aplicador', required: false, type: 'text' },
  { key: 'aplicadorCargo', label: 'Cargo Aplicador', required: false, type: 'text' }
];

interface ValidationError {
  rowIdx: number;
  field: string;
  label: string;
  value: any;
  message: string;
}

export default function BulkImportModal({ isOpen, onClose, currentUser, divisions, onImportSuccess }: BulkImportModalProps) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'validation' | 'importing' | 'success'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parsed raw data
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);

  // Mapping state: maps system keys to sheet headers
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});

  // Validated and formatted data for table correction
  const [validatedRows, setValidatedRows] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({});
  const [bulkField, setBulkField] = useState('');
  const [bulkValue, setBulkValue] = useState('');

  // Import states
  const [importProgress, setImportProgress] = useState(0);
  const [importStatusText, setImportStatusText] = useState('');
  const [importedCount, setImportedCount] = useState(0);

  const resetAll = () => {
    setStep('upload');
    setFile(null);
    setHeaders([]);
    setRawData([]);
    setFieldMapping({});
    setValidatedRows([]);
    setValidationErrors([]);
    setSelectedRows({});
    setBulkField('');
    setBulkValue('');
    setImportProgress(0);
    setImportStatusText('');
    setImportedCount(0);
  };

  const downloadTemplate = () => {
    // Generate headers from fields
    const headers = PROCESS_FIELDS.map(f => f.label);
    const exampleRow = PROCESS_FIELDS.reduce((acc, f) => {
      acc[f.label] = f.placeholder || '';
      return acc;
    }, {} as Record<string, string>);

    // Add actual dummy values for the template
    exampleRow['Nº PATD'] = '005/DOA/2026';
    exampleRow['Militar Arrolado'] = '3S Silva';
    exampleRow['SARAM'] = '1234567';
    exampleRow['Posto do Arrolado'] = '3S';
    exampleRow['Quadro do Arrolado'] = 'QSS';
    exampleRow['Especialidade'] = 'SGS';
    exampleRow['Divisão'] = 'DOA';
    exampleRow['Setor'] = 'Guarda do Portão';
    exampleRow['Data de Início'] = '2026-06-18';
    exampleRow['Resumo do Fato'] = 'O militar se atrasou para a passagem de serviço.';
    exampleRow['Apurador'] = 'Cap Marinho';
    exampleRow['Aplicador'] = 'Cel Rocha';

    const worksheet = XLSX.utils.json_to_sheet([exampleRow], { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Modelos_Processos');
    
    // Save file
    XLSX.writeFile(workbook, 'gpatd_template_importacao.xlsx');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) processFile(droppedFile);
  };

  const processFile = (selectedFile: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv')) {
      alert('Por favor, selecione apenas arquivos do tipo Excel (.xlsx, .xls) ou CSV.');
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      if (jsonData.length === 0) {
        alert('A planilha está vazia.');
        return;
      }

      const rawHeaders = (jsonData[0] || []).map((h: any) => String(h || '').trim());
      const rows = jsonData.slice(1).map((rowArr: any[]) => {
        const rowObj: Record<string, any> = {};
        rawHeaders.forEach((header, index) => {
          rowObj[header] = rowArr[index] !== undefined ? rowArr[index] : '';
        });
        return rowObj;
      }).filter(row => Object.values(row).some(v => v !== '')); // Remove empty rows

      setHeaders(rawHeaders);
      setRawData(rows);

      // Auto-mapping heuristics
      const initialMap: Record<string, string> = {};
      PROCESS_FIELDS.forEach(field => {
        // Find approximate match
        const match = rawHeaders.find(h => 
          h.toLowerCase() === field.key.toLowerCase() || 
          h.toLowerCase() === field.label.toLowerCase() ||
          h.toLowerCase().replace(/[^a-z0-9]/g, '') === field.label.toLowerCase().replace(/[^a-z0-9]/g, '')
        );
        if (match) {
          initialMap[field.key] = match;
        } else {
          initialMap[field.key] = '';
        }
      });
      setFieldMapping(initialMap);
      setStep('mapping');
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleMappingChange = (fieldKey: string, headerName: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [fieldKey]: headerName
    }));
  };

  const startValidation = () => {
    // Check if required fields are mapped
    const unmappedRequired = PROCESS_FIELDS.filter(f => f.required && !fieldMapping[f.key]);
    if (unmappedRequired.length > 0) {
      alert(`Os seguintes campos obrigatórios precisam estar mapeados:\n${unmappedRequired.map(f => f.label).join(', ')}`);
      return;
    }

    // Build initial validated rows from raw data
    const rows = rawData.map((rawRow, idx) => {
      const row: Record<string, any> = { _originalIdx: idx };
      PROCESS_FIELDS.forEach(field => {
        const mappedHeader = fieldMapping[field.key];
        let val = mappedHeader ? rawRow[mappedHeader] : '';
        
        // Clean values
        if (val instanceof Date) {
          val = val.toISOString().split('T')[0];
        } else if (val !== undefined && val !== null) {
          val = String(val).trim();
        } else {
          val = '';
        }
        row[field.key] = val;
      });
      return row;
    });

    validateData(rows);
    setStep('validation');
  };

  const validateData = (rowsToCheck: any[]) => {
    const errors: ValidationError[] = [];

    rowsToCheck.forEach((row, rowIdx) => {
      PROCESS_FIELDS.forEach(field => {
        const val = row[field.key];

        // 1. Required Check
        if (field.required && (!val || val === '')) {
          errors.push({
            rowIdx,
            field: field.key,
            label: field.label,
            value: val,
            message: `Campo '${field.label}' é obrigatório.`
          });
        }

        // 2. Date format check (if not empty)
        if (field.type === 'date' && val) {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          const d = new Date(val);
          if (!dateRegex.test(val) || isNaN(d.getTime())) {
            errors.push({
              rowIdx,
              field: field.key,
              label: field.label,
              value: val,
              message: `Formato de data inválido. Use AAAA-MM-DD.`
            });
          }
        }

        // 3. SARAM Check (must be digits, generally 7 digits, though we can be slightly flexible)
        if (field.key === 'saram' && val) {
          const cleanSaram = val.replace(/\D/g, '');
          if (cleanSaram.length < 6 || cleanSaram.length > 8) {
            errors.push({
              rowIdx,
              field: field.key,
              label: field.label,
              value: val,
              message: `SARAM inválido. Deve conter entre 6 e 8 dígitos numéricos.`
            });
          }
        }
      });
    });

    setValidatedRows(rowsToCheck);
    setValidationErrors(errors);
  };

  const handleCellChange = (rowIdx: number, fieldKey: string, newValue: string) => {
    const updated = [...validatedRows];
    updated[rowIdx] = {
      ...updated[rowIdx],
      [fieldKey]: newValue
    };
    validateData(updated);
  };

  const handleApplyBulk = () => {
    if (!bulkField) {
      alert('Selecione um campo para preenchimento em lote.');
      return;
    }
    const selectedIndices = Object.keys(selectedRows).map(Number);
    if (selectedIndices.length === 0) {
      alert('Selecione ao menos um processo para preenchimento em lote.');
      return;
    }
    const updated = [...validatedRows];
    selectedIndices.forEach(idx => {
      updated[idx] = {
        ...updated[idx],
        [bulkField]: bulkValue
      };
    });
    validateData(updated);
    setBulkValue('');
  };

  const startImport = async () => {
    if (validationErrors.length > 0) {
      alert('Por favor, corrija todos os erros apontados antes de prosseguir.');
      return;
    }

    setStep('importing');
    setImportProgress(0);
    setImportStatusText('Iniciando importação...');

    const totalRows = validatedRows.length;
    const batchSize = 50;
    let successCount = 0;

    for (let i = 0; i < totalRows; i += batchSize) {
      const batch = validatedRows.slice(i, i + batchSize);
      const percent = Math.round(((i + batch.length) / totalRows) * 100);
      setImportProgress(percent);
      setImportStatusText(`Processando linhas de ${i + 1} a ${Math.min(i + batch.length, totalRows)} de ${totalRows}...`);

      const payload = batch.map(row => {
        const initialHistory = [
          { 
            field: 'Criação', 
            oldValue: '—', 
            newValue: 'Processo Importado via Planilha', 
            user: currentUser?.name || 'Sistema', 
            date: new Date().toLocaleString('pt-BR') 
          }
        ];

        return {
          patd_number: row.patdNumber || '000/UNKNOWN/2026',
          militar: row.militar,
          saram: row.saram,
          posto: row.posto,
          especialidade: row.especialidade || '',
          quadro: row.quadro,
          divisao: row.divisao,
          setor: row.setor,
          data_inicio: row.dataInicio,
          status: 'Em Andamento',
          punicao: 'Em Branco',
          dias_punicao: 0,
          boletim: '',
          resumo_fato: row.resumoFato,
          apurador: row.apurador,
          apurador_posto: row.apuradorPosto || null,
          apurador_quadro: row.apuradorQuadro || null,
          apurador_saram: row.apuradorSaram || null,
          aplicador: row.aplicador,
          aplicador_posto: row.aplicadorPosto || null,
          aplicador_quadro: row.aplicadorQuadro || null,
          aplicador_cargo: row.aplicadorCargo || null,
          oficio_numero: row.oficioNumero || null,
          prot_comaer: row.protComaer || null,
          data_oficio: row.dataOficio || null,
          enquadramento_rdaer: row.enquadramentoRdaer || null,
          delegacao_doc: null,
          documents: [],
          history: initialHistory,
          n_grade: '',
          observacoes: '',
          resumo_punicao: ''
        };
      });

      try {
        const { data, error } = await supabase.from('processes').insert(payload).select();
        if (error) throw error;
        successCount += batch.length;
      } catch (err: any) {
        console.error('Error importing batch:', err);
        alert(`Falha na inserção no banco de dados para o lote iniciado na linha ${i + 1}: ${err.message || err}`);
        setStep('validation');
        return;
      }
    }

    setImportedCount(successCount);
    setStep('success');
    
    // Refresh parent state
    try {
      const { data } = await supabase.from('processes').select('*').order('created_at', { ascending: false });
      if (data) {
        const mappedData = data.map(p => ({
          ...p,
          patdNumber: p.patd_number,
          dataInicio: p.data_inicio,
          dataTermino: p.data_termino,
          dataPunicao: p.data_punicao,
          diasPunicao: p.dias_punicao,
          resumoFato: p.resumo_fato,
          nGrade: p.n_grade,
          observacoes: p.observacoes,
          resumoPunicao: p.resumo_punicao,
          apuradorPosto: p.apurador_posto,
          apuradorQuadro: p.apurador_quadro,
          apuradorSaram: p.apurador_saram,
          aplicadorPosto: p.aplicador_posto,
          aplicadorQuadro: p.aplicador_quadro,
          aplicadorCargo: p.aplicador_cargo,
          oficioNumero: p.oficio_numero,
          protComaer: p.prot_comaer,
          dataOficio: p.data_oficio,
          enquadramentoRdaer: p.enquadramento_rdaer,
          delegacaoDoc: p.delegacao_doc || null
        }));
        onImportSuccess(mappedData);
      }
    } catch (err) {
      console.error('Error refreshing processes list:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh] z-10"
        >
          {/* Header */}
          <div className="p-8 pb-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-linear-to-r from-indigo-500/5 to-purple-500/5">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
                  <FileSpreadsheet size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white leading-tight">Criar Processos em Lote</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    Upload de planilha para geração em massa de PATD
                  </p>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Stepper bar */}
          <div className="px-8 py-3 bg-slate-50 dark:bg-slate-850/50 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">
            <span className={step === 'upload' ? 'text-indigo-600 dark:text-indigo-400' : ''}>1. Envio de Arquivo</span>
            <ArrowRight size={12} />
            <span className={step === 'mapping' ? 'text-indigo-600 dark:text-indigo-400' : ''}>2. Mapeamento</span>
            <ArrowRight size={12} />
            <span className={step === 'validation' ? 'text-indigo-600 dark:text-indigo-400' : ''}>3. Validação</span>
            <ArrowRight size={12} />
            <span className={step === 'importing' ? 'text-indigo-600 dark:text-indigo-400' : ''}>4. Processamento</span>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            
            {/* STEP 1: UPLOAD */}
            {step === 'upload' && (
              <div className="space-y-6">
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`py-16 px-8 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative group/drop ${
                    isDragOver 
                      ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/10 shadow-lg shadow-indigo-500/5' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm group-hover/drop:scale-110 transition-transform">
                    <UploadCloud size={30} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Arraste e solte sua planilha aqui ou clique para selecionar
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 max-w-md">
                    Formatos suportados: Excel (.xlsx, .xls) ou CSV. Garanta que as informações essenciais como SARAM, Militar, Divisão e Nº PATD estejam preenchidas.
                  </p>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".xlsx,.xls,.csv"
                    className="hidden" 
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-3xl bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800 gap-4">
                  <div className="flex items-center gap-3.5 text-left">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Precisa do modelo padrão?</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">Use o modelo pré-configurado com as colunas corretas para agilizar o processo.</p>
                    </div>
                  </div>
                  <button 
                    onClick={downloadTemplate}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-500/10 flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <Download size={14} /> Baixar Modelo
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: MAPPING */}
            {step === 'mapping' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                  Identificamos {headers.length} colunas na sua planilha. Mapeie os campos obrigatórios e opcionais abaixo para que o GPATD entenda os cabeçalhos do seu arquivo.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                  {PROCESS_FIELDS.map(field => {
                    const isRequired = field.required;
                    return (
                      <div key={field.key} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            {field.label}
                            {isRequired && <span className="text-rose-500 font-black">*</span>}
                          </label>
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">
                            {field.key}
                          </span>
                        </div>
                        <select 
                          value={fieldMapping[field.key] || ''}
                          onChange={(e) => handleMappingChange(field.key, e.target.value)}
                          className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-indigo-500 transition-all cursor-pointer font-medium"
                        >
                          <option value="">-- Não mapeado (Ignorar/Vazio) --</option>
                          {headers.map(header => (
                            <option key={header} value={header}>{header}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: VALIDATION AND CELL EDITING */}
            {step === 'validation' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-left">
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Diagnóstico da Planilha</h5>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">
                      Encontramos {validatedRows.length} processos. {validationErrors.length === 0 ? 'Tudo certo!' : `Identificamos ${validationErrors.length} inconsistência(s) que precisam ser corrigidas.`}
                    </p>
                  </div>
                  {validationErrors.length > 0 && (
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/25 text-[10px] font-black uppercase tracking-wider animate-pulse">
                      <AlertCircle size={14} /> Corrija os Erros Abaixo
                    </div>
                  )}
                </div>

                {/* Bulk Actions Panel */}
                {Object.keys(selectedRows).length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-indigo-650 dark:bg-indigo-950 border border-indigo-500/25 text-white flex flex-wrap items-center justify-between gap-4 shadow-lg"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span className="bg-white/20 px-2.5 py-1 rounded-lg">
                        {Object.keys(selectedRows).length} selecionados
                      </span>
                      <span>Preenchimento em lote:</span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <select 
                        value={bulkField}
                        onChange={(e) => setBulkField(e.target.value)}
                        className="h-9 px-3 rounded-lg bg-white/10 border border-white/20 text-xs text-white focus:outline-hidden cursor-pointer"
                        style={{ colorScheme: 'dark' }}
                      >
                        <option value="" className="text-slate-900">-- Selecione o campo --</option>
                        {PROCESS_FIELDS.filter(f => fieldMapping[f.key]).map(f => (
                          <option key={f.key} value={f.key} className="text-slate-900">{f.label}</option>
                        ))}
                      </select>
                      
                      <input 
                        type="text" 
                        placeholder="Novo valor..." 
                        value={bulkValue}
                        onChange={(e) => setBulkValue(e.target.value)}
                        className="h-9 px-3 rounded-lg bg-white/10 border border-white/20 text-xs text-white placeholder:text-white/40 focus:outline-hidden focus:bg-white/20"
                      />
                      
                      <button
                        onClick={handleApplyBulk}
                        className="h-9 px-4 rounded-lg bg-white text-indigo-600 hover:bg-white/90 text-xs font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer"
                      >
                        Aplicar
                      </button>
                      
                      <button
                        onClick={() => setSelectedRows({})}
                        className="text-xs text-white/70 hover:text-white underline cursor-pointer"
                      >
                        Limpar seleção
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Table containing rows with validation highlights */}
                <div className="overflow-x-auto rounded-[2rem] border border-slate-100 dark:border-slate-800">
                  <table className="w-full border-collapse text-left text-xs font-medium text-slate-700 dark:text-slate-300">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-855 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        <th className="px-4 py-3.5 w-12 text-center">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            checked={validatedRows.length > 0 && Object.keys(selectedRows).length === validatedRows.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const newSel: Record<number, boolean> = {};
                                validatedRows.forEach((_, idx) => { newSel[idx] = true; });
                                setSelectedRows(newSel);
                              } else {
                                setSelectedRows({});
                              }
                            }}
                          />
                        </th>
                        <th className="px-4 py-3.5 w-16 text-center">Linha</th>
                        {PROCESS_FIELDS.filter(f => fieldMapping[f.key]).map(f => (
                          <th key={f.key} className="px-4 py-3.5 min-w-[150px]">
                            {f.label} {f.required && <span className="text-rose-500">*</span>}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {validatedRows.map((row, rowIdx) => (
                        <tr key={rowIdx} className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all ${selectedRows[rowIdx] ? 'bg-indigo-50/30 dark:bg-indigo-950/10' : ''}`}>
                          <td className="px-4 py-3 text-center border-r border-slate-100 dark:border-slate-800">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              checked={!!selectedRows[rowIdx]}
                              onChange={(e) => {
                                setSelectedRows(prev => {
                                  const next = { ...prev };
                                  if (e.target.checked) {
                                    next[rowIdx] = true;
                                  } else {
                                    delete next[rowIdx];
                                  }
                                  return next;
                                });
                              }}
                            />
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-slate-400 border-r border-slate-100 dark:border-slate-800">
                            {rowIdx + 2}
                          </td>
                          {PROCESS_FIELDS.filter(f => fieldMapping[f.key]).map(field => {
                            const val = row[field.key];
                            const cellError = validationErrors.find(e => e.rowIdx === rowIdx && e.field === field.key);
                            
                            return (
                              <td key={field.key} className="px-3 py-2 min-w-[150px]">
                                <input
                                  type="text"
                                  value={val}
                                  onChange={(e) => handleCellChange(rowIdx, field.key, e.target.value)}
                                  className={`w-full h-8 px-2.5 rounded-lg border text-xs font-semibold focus:outline-hidden transition-all ${
                                    cellError 
                                      ? 'border-rose-500 bg-rose-500/5 focus:ring-4 focus:ring-rose-500/10 text-rose-600 dark:text-rose-400' 
                                      : 'border-slate-150 dark:border-slate-800/80 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 bg-white/20'
                                  }`}
                                  title={cellError?.message}
                                />
                                {cellError && (
                                  <span className="text-[9px] font-bold text-rose-500 block mt-1 leading-tight max-w-[180px] break-words">
                                    {cellError.message}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* STEP 4: IMPORTING PROGRESS */}
            {step === 'importing' && (
              <div className="py-12 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
                <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-lg relative">
                  <RefreshCw size={30} className="animate-spin" />
                </div>
                
                <div className="space-y-2 w-full">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Importando processos...</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{importStatusText}</p>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${importProgress}%` }}
                    className="bg-indigo-600 h-full rounded-full" 
                  />
                </div>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{importProgress}%</span>
              </div>
            )}

            {/* STEP 5: SUCCESS */}
            {step === 'success' && (
              <div className="py-12 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
                <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/5">
                  <CheckCircle2 size={36} />
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-lg font-display font-bold text-slate-800 dark:text-white">Importação Concluída!</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Parabéns! Criamos com sucesso **{importedCount}** novos processos administrativos disciplinares (PATD) no banco de dados.
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-md"
                >
                  Concluir e Fechar
                </button>
              </div>
            )}

          </div>

          {/* Footer controls */}
          {step !== 'importing' && step !== 'success' && (
            <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-between shrink-0">
              <button
                onClick={step === 'upload' ? onClose : () => {
                  if (step === 'mapping') setStep('upload');
                  if (step === 'validation') setStep('mapping');
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                {step === 'upload' ? 'Cancelar' : 'Voltar'}
              </button>

              <button
                onClick={() => {
                  if (step === 'upload') {
                    if (!file) alert('Por favor, envie um arquivo primeiro.');
                  }
                  if (step === 'mapping') startValidation();
                  if (step === 'validation') startImport();
                }}
                disabled={step === 'upload' && !file}
                className={`px-6 py-2.5 rounded-xl text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                  step === 'upload' && !file 
                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none' 
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/10'
                }`}
              >
                {step === 'upload' && 'Mapear Colunas'}
                {step === 'mapping' && 'Validar Dados'}
                {step === 'validation' && (
                  <>
                    <Play size={14} /> Iniciar Importação
                  </>
                )}
                {step !== 'validation' && <ArrowRight size={14} />}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

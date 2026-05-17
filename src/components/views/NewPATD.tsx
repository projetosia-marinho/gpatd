import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  FileText, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Shield, 
  AlertTriangle, 
  Clock, 
  Save, 
  Trash2, 
  Eraser, 
  History, 
  FilePlus,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Building2,
  X,
  History as HistoryIcon
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { Division } from './Divisions';
import { supabase } from '../../lib/supabase';

const InputField = ({ label, icon: Icon, value, onChange, placeholder, disabled = false, type = "text", error }: any) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/80 transition-all group-focus-within:text-indigo-500 group-focus-within:scale-110 z-10">
        <Icon size={16} />
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full h-11 pl-10 pr-4 rounded-xl bg-white/40 dark:bg-slate-950/30 backdrop-blur-3xl border ${error ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800/80'} focus:bg-white/60 dark:focus:bg-slate-950/50 focus:outline-hidden focus:ring-4 ${error ? 'focus:ring-rose-100/30 dark:focus:ring-rose-900/20' : 'focus:ring-indigo-500/10'} focus:border-indigo-500 transition-all text-sm text-slate-900 dark:text-white placeholder:text-slate-400 font-medium tracking-tight relative z-0`}
      />
      {/* Futuristic Background Glow */}
      <div className="absolute inset-0 rounded-xl bg-linear-to-r from-indigo-500/0 via-indigo-500/0 to-purple-500/0 group-focus-within:from-indigo-500/10 group-focus-within:via-purple-500/10 group-focus-within:to-indigo-500/10 transition-all duration-700 -z-10 shadow-inner group-focus-within:shadow-indigo-500/5" />
      
      {/* Corner Brackets (Futuristic UI vibe) */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-slate-200 dark:border-slate-800 group-focus-within:border-indigo-500 transition-colors rounded-tl-sm" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-slate-200 dark:border-slate-800 group-focus-within:border-indigo-500 transition-colors rounded-br-sm" />
    </div>
    {error && (
      <motion.p 
        initial={{ opacity: 0, x: -10 }} 
        animate={{ opacity: 1, x: 0 }} 
        className="text-[10px] font-bold text-rose-500 ml-1 mt-1 animate-pulse tracking-wide uppercase"
      >
        {error}
      </motion.p>
    )}
  </div>
);

const DatePickerField = ({ label, value, onChange, error }: any) => {
  return (
    <div className="space-y-1.5 flex-1 min-w-[140px] relative">
      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group/picker">
        <input
          type="date"
          value={value || ''}
          onChange={onChange}
          className={`w-full h-11 px-4 rounded-xl bg-white/40 dark:bg-slate-950/30 backdrop-blur-3xl border ${error ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800/80'} focus:bg-white/60 dark:focus:bg-slate-950/50 focus:outline-hidden focus:ring-4 ${error ? 'focus:ring-rose-100/30 dark:focus:ring-rose-900/20' : 'focus:ring-indigo-500/10'} focus:border-indigo-500 transition-all text-sm text-slate-900 dark:text-white font-medium relative z-10 dark:[color-scheme:dark]`}
        />
        {/* Corner Brackets */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-slate-200 dark:border-slate-800 group-focus-within/picker:border-indigo-500 transition-colors rounded-tl-sm z-0" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-slate-200 dark:border-slate-800 group-focus-within/picker:border-indigo-500 transition-colors rounded-br-sm z-0" />
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="text-[10px] font-bold text-rose-500 ml-1 mt-1 animate-pulse tracking-wide uppercase"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

const SelectField = ({ label, icon: Icon, value, onChange, options, placeholder = "Selecionar", direction = "down" }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt: any) => opt.value === value);

  return (
    <div className={`space-y-1.5 flex-1 relative ${isOpen ? 'z-50' : ''}`}>
      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-11 pl-10 pr-10 rounded-xl bg-white/40 dark:bg-slate-950/30 backdrop-blur-3xl border border-slate-200 dark:border-slate-800/80 focus:bg-white/60 dark:focus:bg-slate-950/50 focus:outline-hidden focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm text-slate-900 dark:text-white text-left font-medium relative z-20 flex items-center overflow-hidden"
        >
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/80 group-focus-within:text-indigo-500">
            <Icon size={16} />
          </div>
          <span className={`truncate block w-full pr-2 ${!selectedOption ? 'text-slate-400 dark:text-slate-500' : ''}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/60 transition-transform duration-300 flex items-center ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronDown size={16} />
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-40 bg-black/5 dark:bg-black/20" 
                onClick={() => setIsOpen(false)} 
              />
              <motion.div
                initial={direction === 'up' 
                  ? { opacity: 0, y: -10, scale: 0.95 } 
                  : { opacity: 0, y: 10, scale: 0.95 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={direction === 'up'
                  ? { opacity: 0, y: -10, scale: 0.95 }
                  : { opacity: 0, y: 10, scale: 0.95 }
                }
                className={`absolute left-0 right-0 p-1.5 z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden min-w-[200px] ${
                  direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
                }`}
              >
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {options.map((opt: any) => {
                    const isSelected = opt.value === value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          onChange({ target: { value: opt.value } });
                        }}
                        className={`
                          relative w-full px-4 py-2.5 text-left text-sm font-medium transition-all duration-200 group/item rounded-lg mb-0.5 last:mb-0
                          ${isSelected 
                            ? 'bg-indigo-600 dark:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400'
                          }
                        `}
                      >
                        {/* Curved accent from image */}
                        {isSelected && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20 rounded-r-full" />
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span>{opt.label}</span>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Decorative corner accents from before */}
        <div className="absolute -top-[1px] -right-[1px] w-3 h-3 border-t-2 border-r-2 border-indigo-500/0 group-focus-within:border-indigo-500 transition-all duration-500 rounded-tr-md pointer-events-none" />
        <div className="absolute -bottom-[1px] -left-[1px] w-3 h-3 border-b-2 border-l-2 border-indigo-500/0 group-focus-within:border-indigo-500 transition-all duration-500 rounded-bl-md pointer-events-none" />
      </div>
    </div>
  );
};

const TextAreaField = ({ label, icon: Icon, value, onChange, placeholder }: any) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      {Icon && (
        <div className="absolute left-3 top-4 text-slate-400 dark:text-white/80 transition-all group-focus-within:text-indigo-500 group-focus-within:scale-110">
          <Icon size={16} />
        </div>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-xl bg-white/40 dark:bg-slate-950/30 backdrop-blur-3xl border border-slate-200 dark:border-slate-800/80 focus:bg-white/60 dark:focus:bg-slate-950/50 focus:outline-hidden focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm text-slate-900 dark:text-white placeholder:text-slate-400 resize-none font-medium`}
      />
      {/* Corner accent for textarea */}
      <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-indigo-500/0 group-focus-within:border-indigo-500/40 transition-all duration-300" />
    </div>
  </div>
);

const SectionHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="mb-6">
    <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">{title}</h3>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">{subtitle}</p>
  </div>
);

const HistoryModal = ({ isOpen, onClose, historyData }: { isOpen: boolean, onClose: () => void, historyData: any[] }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
          >
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Histórico de Alterações</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Trilha de auditoria do processo</p>
              </div>
              <button 
                onClick={onClose}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                {historyData.map((item, idx) => (
                  <div key={idx} className="group p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                        {item.field}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                        <Clock size={12} />
                        {item.date}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Valor Anterior</p>
                        <p className="text-slate-500 line-through decoration-slate-300 dark:decoration-slate-700 break-words">{item.oldValue || '—'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-tighter">Novo Valor</p>
                        <p className="text-slate-900 dark:text-white font-medium break-words">{item.newValue}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                      <User size={10} />
                      USUÁRIO: {item.user}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-sm font-bold hover:bg-slate-800 transition-colors"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default function NewPATD({ initialData, onSave, divisions = [], currentUser, processes = [] }: { initialData?: any, onSave?: (data: any) => void, divisions?: Division[], currentUser?: any, processes?: any[] }) {
  const currentYear = new Date().getFullYear();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});
  const [seqTrigger, setSeqTrigger] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<any>({
    patdNumber: `001/DIV/${currentYear}`,
    posto: '1T',
    quadro: 'QOINT',
    saram: '',
    nomeCompleto: '',
    especialidade: '',
    divisao: currentUser && currentUser.role !== 'Administrador' && currentUser.divisao ? currentUser.divisao : 'DOA',
    setor: '',
    apurador: '',
    aplicador: '',
    resumoFato: '',
    dataInicio: '',
    dataTermino: '',
    status: 'Em Andamento',
    punicao: 'Em Branco',
    qtdDias: '0',
    dataPunicao: '',
    resumoPunicao: '',
    nGrade: '',
    boletim: '',
    observacoes: '',
    documents: []
  });

  // Form memory persistence
  useEffect(() => {
    if (!initialData) {
      const saved = localStorage.getItem('new_patd_form_memory');
      if (saved) {
        setFormData(JSON.parse(saved));
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (!initialData) {
      localStorage.setItem('new_patd_form_memory', JSON.stringify(formData));
    }
  }, [formData, initialData]);

  // Populate form if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        patdNumber: initialData.patdNumber || '',
        posto: initialData.posto || '1T',
        quadro: initialData.quadro || 'QOINT',
        saram: initialData.saram || '',
        nomeCompleto: initialData.militar || '',
        especialidade: initialData.especialidade || '',
        divisao: initialData.divisao || 'DOA',
        setor: initialData.setor || '',
        apurador: initialData.apurador || '',
        aplicador: initialData.aplicador || '',
        resumoFato: initialData.resumoFato || '',
        dataInicio: initialData.dataInicio || '',
        dataTermino: initialData.dataTermino || '',
        status: initialData.status || 'Em Andamento',
        punicao: initialData.punicao || 'Em Branco',
        qtdDias: String(initialData.diasPunicao || '0'),
        dataPunicao: initialData.dataPunicao || '',
        resumoPunicao: initialData.resumoPunicao || '',
        nGrade: initialData.nGrade || '',
        boletim: initialData.boletim || '',
        observacoes: initialData.observacoes || '',
        documents: initialData.documents || []
      });
      setHistory(initialData.history || []);
    }
  }, [initialData]);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Apenas arquivos PDF são permitidos.');
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `process_docs/${fileName}`;

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      const newDoc = {
        name: file.name,
        url: urlData.publicUrl,
        uploadedAt: new Date().toLocaleDateString('pt-BR')
      };

      setFormData((prev: any) => ({
        ...prev,
        documents: [...(prev.documents || []), newDoc]
      }));

      alert('Documento PDF inserido com sucesso!');
    } catch (err: any) {
      console.error('Error uploading file:', err);
      alert(`Erro ao fazer upload do documento: ${err.message || err}`);
    }
  };

  // Auto-generate ID logic (only if not editing)
  useEffect(() => {
    if (initialData) return;

    let active = true;

    const fetchNextNumber = async () => {
      const divShort = formData.divisao.split(' ')[0].toUpperCase();
      let nextNum = 1;

      try {
        // Query active processes from database
        const { data: activeData, error: activeErr } = await supabase
          .from('processes')
          .select('patd_number');

        // Query deleted processes from database
        const { data: deletedData, error: deletedErr } = await supabase
          .from('deleted_processes')
          .select('patd_number');

        if (activeErr) console.error('Active query error:', activeErr);
        if (deletedErr) console.error('Deleted query error:', deletedErr);

        const allNumbers = [
          ...(activeData || []).map((p: any) => p.patd_number),
          ...(deletedData || []).map((p: any) => p.patd_number),
          ...processes.map((p: any) => p.patdNumber)
        ];

        let maxNum = 0;
        allNumbers.forEach((pStr: string) => {
          if (!pStr) return;
          const parts = pStr.split('/');
          if (parts.length >= 3) {
            const pDiv = parts[1].toUpperCase();
            const pYear = parseInt(parts[2], 10);
            if (pDiv === divShort && pYear === currentYear) {
              const num = parseInt(parts[0], 10);
              if (!isNaN(num) && num > maxNum) {
                maxNum = num;
              }
            }
          }
        });

        nextNum = maxNum + 1;
      } catch (err) {
        console.error('Error fetching sequential PATD number:', err);
        // Fallback using local state processes array
        let maxNum = 0;
        processes.forEach((p: any) => {
          if (!p.patdNumber) return;
          const parts = p.patdNumber.split('/');
          if (parts.length >= 3) {
            const pDiv = parts[1].toUpperCase();
            const pYear = parseInt(parts[2], 10);
            if (pDiv === divShort && pYear === currentYear) {
              const num = parseInt(parts[0], 10);
              if (!isNaN(num) && num > maxNum) {
                maxNum = num;
              }
            }
          }
        });
        nextNum = maxNum + 1;
      }

      if (active) {
        const formattedNum = String(nextNum).padStart(3, '0');
        setFormData(prev => ({
          ...prev,
          patdNumber: `${formattedNum}/${divShort}/${currentYear}`
        }));
      }
    };

    fetchNextNumber();

    return () => {
      active = false;
    };
  }, [formData.divisao, currentYear, initialData, processes, seqTrigger]);

  // Enforce division if not Admin
  useEffect(() => {
    if (!initialData && currentUser && currentUser.role !== 'Administrador' && currentUser.divisao && formData.divisao !== currentUser.divisao) {
      setFormData(prev => ({
        ...prev,
        divisao: currentUser.divisao
      }));
    }
  }, [currentUser, formData.divisao, initialData]);

  // Simplified field name map for history
  const fieldNames: any = {
    patdNumber: 'Nº PATD',
    posto: 'Posto',
    quadro: 'Quadro',
    saram: 'SARAM',
    nomeCompleto: 'Nome Completo',
    especialidade: 'Especialidade',
    divisao: 'Divisão',
    setor: 'Setor',
    apurador: 'Apurador',
    aplicador: 'Aplicador',
    resumoFato: 'Resumo do Fato',
    dataInicio: 'Data de Início',
    dataTermino: 'Data de Término',
    status: 'Status',
    punicao: 'Punição',
    qtdDias: 'Qtd Dias',
    dataPunicao: 'Data da Punição',
    resumoPunicao: 'Resumo da Punição',
    nGrade: 'Nº Grade',
    boletim: 'Boletim',
    observacoes: 'Observações'
  };

  const validateDates = (updatedData: any) => {
    const newErrors = { ...errors };
    const start = updatedData.dataInicio ? new Date(updatedData.dataInicio) : null;
    const end = updatedData.dataTermino ? new Date(updatedData.dataTermino) : null;
    const punishment = updatedData.dataPunicao ? new Date(updatedData.dataPunicao) : null;

    if (start && end && end < start) {
      newErrors.dataTermino = 'Término deve ser posterior ao Início';
    } else {
      delete newErrors.dataTermino;
    }

    if (start && punishment && punishment < start) {
      newErrors.dataPunicao = 'Punição deve ser posterior ao Início';
    } else {
      delete newErrors.dataPunicao;
    }

    setErrors(newErrors);
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let newValue = e.target.value;

    // SARAM Restriction: only numbers, max 7
    if (field === 'saram') {
      newValue = newValue.replace(/\D/g, '').slice(0, 7);
    }

    const oldValue = (formData as any)[field];
    
    if (oldValue !== newValue) {
      const newHistoryItem = {
        field: fieldNames[field] || field,
        oldValue: oldValue,
        newValue: newValue,
        user: currentUser?.name || 'Sistema',
        date: new Date().toLocaleString('pt-BR')
      };
      setHistory(prev => [newHistoryItem, ...prev]);
    }

    let updatedData = { ...formData, [field]: newValue };

    // Reset sector if division changes
    if (field === 'divisao') {
      updatedData = { ...updatedData, setor: '' };
    }

    setFormData(updatedData);

    const newErrors = { ...errors };
    if (field === 'saram' && newValue) {
      delete newErrors.saram;
    }
    if (field === 'nomeCompleto' && newValue) {
      delete newErrors.nomeCompleto;
    }
    if (field === 'dataInicio' && newValue) {
      delete newErrors.dataInicio;
    }
    setErrors(newErrors);

    validateDates(updatedData);
  };

  const handleClear = () => {
    if (confirm('Deseja realmente limpar todos os campos?')) {
      const emptyForm = {
        patdNumber: `001/DIV/${currentYear}`,
        posto: '1T',
        quadro: 'QOINT',
        saram: '',
        nomeCompleto: '',
        especialidade: '',
        divisao: currentUser && currentUser.role !== 'Administrador' && currentUser.divisao ? currentUser.divisao : 'DOA',
        setor: '',
        apurador: '',
        aplicador: '',
        resumoFato: '',
        dataInicio: '',
        dataTermino: '',
        status: 'Em Andamento',
        punicao: 'Em Branco',
        qtdDias: '0',
        dataPunicao: '',
        resumoPunicao: '',
        nGrade: '',
        boletim: '',
        observacoes: '',
        documents: []
      };
      setFormData(emptyForm);
      setSeqTrigger(prev => prev + 1);
      setErrors({});
      if (!initialData) {
        localStorage.removeItem('new_patd_form_memory');
      }
    }
  };

  const handleSave = () => {
    const newErrors: any = {};
    if (!formData.saram) {
      newErrors.saram = 'O campo SARAM é obrigatório';
    }
    if (!formData.nomeCompleto) {
      newErrors.nomeCompleto = 'O campo Nome Completo é obrigatório';
    }
    if (!formData.dataInicio) {
      newErrors.dataInicio = 'O campo Data de Início é obrigatório';
    }

    // Merge with any existing date sequence validation errors
    const start = formData.dataInicio ? new Date(formData.dataInicio) : null;
    const end = formData.dataTermino ? new Date(formData.dataTermino) : null;
    const punishment = formData.dataPunicao ? new Date(formData.dataPunicao) : null;

    if (start && end && end < start) {
      newErrors.dataTermino = 'Término deve ser posterior ao Início';
    }
    if (start && punishment && punishment < start) {
      newErrors.dataPunicao = 'Punição deve ser posterior ao Início';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    setIsSaving(true);
    // Simulate API delay
    setTimeout(() => {
      onSave?.({ ...formData, history });
      if (!initialData) {
        localStorage.removeItem('new_patd_form_memory');
      }
      setIsSaving(false);
    }, 800);
  };

  const optionsPosto = [
    { value: 'BR', label: 'BR' },
    { value: 'CL', label: 'CL' },
    { value: 'TC', label: 'TC' },
    { value: 'MJ', label: 'MJ' },
    { value: 'CP', label: 'CP' },
    { value: '1T', label: '1T' },
    { value: '2T', label: '2T' },
    { value: 'AP', label: 'AP' },
    { value: 'CD', label: 'CD' },
    { value: 'SO', label: 'SO' },
    { value: '1S', label: '1S' },
    { value: '2S', label: '2S' },
    { value: '3S', label: '3S' },
    { value: 'AL', label: 'AL' },
    { value: 'CB', label: 'CB' },
    { value: 'TM', label: 'TM' },
    { value: 'S1', label: 'S1' },
    { value: 'T1', label: 'T1' },
    { value: 'S2', label: 'S2' },
    { value: 'T2', label: 'T2' },
  ];

  const optionsQuadro = [
    { value: 'QOAV', label: 'QOAV' },
    { value: 'QOINT', label: 'QOINT' },
    { value: 'QOINF', label: 'QOINF' },
    { value: 'QOAP', label: 'QOAP' },
    { value: 'QOMED', label: 'QOMED' },
    { value: 'QOCON', label: 'QOCON' },
    { value: 'QSS', label: 'QSS' },
    { value: 'QSCON', label: 'QSCON' },
    { value: 'QESA', label: 'QESA' },
    { value: 'QCB', label: 'QCB' },
    { value: 'QCBCON', label: 'QCBCON' },
    { value: 'QTA', label: 'QTA' },
    { value: 'QSD', label: 'QSD' },
  ];

  const filteredDivsList = (divisions.length > 0 ? divisions : [
    { name: 'DOA', description: 'Divisão de Operações Aéreas' },
    { name: 'GLOG-YS', description: 'Grupo de Logística de Pirassununga' },
    { name: 'GSD-YS', description: 'Grupo de Segurança e Defesa de Pirassununga' },
    { name: 'CCAER', description: 'Corpo de Cadetes da Aeronáutica' },
    { name: 'GSAU-YS', description: 'Grupo de Saúde de Pirassununga' },
    { name: 'CDEF', description: 'Comissão de Desporto de Educação Física' },
    { name: 'EC', description: 'Esquadrão de Comando' }
  ]).filter(d => !currentUser || currentUser.role === 'Administrador' || d.name === currentUser.divisao);

  const optionsDivisao = filteredDivsList.map(d => ({ value: d.name, label: `${d.name} - ${d.description}` }));

  const selectedDivision = divisions.find(d => d.name === formData.divisao);
  const optionsSetor = selectedDivision?.sectors?.map(s => ({ value: s, label: s })) || [];

  const optionsStatus = [
    { value: 'Concluído', label: 'Concluído' },
    { value: 'Em Andamento', label: 'Em Andamento' },
    { value: 'Suspenso', label: 'Suspenso' },
    { value: 'Arquivado', label: 'Arquivado' },
  ];

  const optionsPunicao = [
    { value: 'Em Branco', label: 'Em Branco' },
    { value: 'Prisão Fazendo Svç', label: 'Prisão Fazendo Svç' },
    { value: 'Prisão Sem Svç', label: 'Prisão Sem Svç' },
    { value: 'Detenção', label: 'Detenção' },
    { value: 'Repreensão Escrito', label: 'Repreensão Escrito' },
    { value: 'Repreensão Verbal', label: 'Repreensão Verbal' },
    { value: 'Justificado', label: 'Justificado' },
    { value: 'Arquivado', label: 'Arquivado' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header and Top Actions */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSave?.(null)}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-500 transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </motion.button>
          <SectionHeader title={initialData ? "Editar Processo" : "Novo Cadastro"} subtitle="INCLUSÃO DE PROCESSO" />
        </div>
        
        <div className="flex flex-wrap gap-3 overflow-x-auto pb-2 scrollbar-none">
          <motion.button 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all shadow-lg shadow-black/5 group shrink-0"
          >
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
              <HistoryIcon size={18} />
            </div>
            <div className="text-left">
              <p className="leading-none">Histórico</p>
              <p className="text-[9px] opacity-50 lowercase font-medium mt-1">registro de alterações</p>
            </div>
          </motion.button>
          
          <motion.button 
            type="button"
            onClick={handleFileClick}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all shadow-lg shadow-black/5 group shrink-0"
          >
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all">
              <FilePlus size={18} />
            </div>
            <div className="text-left">
              <p className="leading-none">Inserir Documentos</p>
              <p className="text-[9px] opacity-50 lowercase font-medium mt-1">anexos e arquivos pdf</p>
            </div>
          </motion.button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".pdf" 
            className="hidden" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          {/* IDENTIFICAÇÃO DO MILITAR ARROLADO */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-[2rem] bg-white dark:bg-[#0f172b] border border-slate-200 dark:border-slate-800/60 shadow-sm relative z-20 group/card"
          >
            {/* Ambient Background Pattern - Moved to separate container for overflow control */}
            <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover/card:bg-indigo-500/10 transition-colors" />
            </div>
            
            <h4 className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              / Identificação do Militar Arrolado
            </h4>
            
            <div className="relative z-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField label="Nº do PATD" icon={FileText} value={formData.patdNumber} onChange={handleChange('patdNumber')} />
                <SelectField label="Posto" icon={Shield} value={formData.posto} onChange={handleChange('posto')} options={optionsPosto} />
                <SelectField label="Quadro" icon={Briefcase} value={formData.quadro} onChange={handleChange('quadro')} options={optionsQuadro} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="SARAM *" icon={User} value={formData.saram} onChange={handleChange('saram')} placeholder="0000000" error={errors.saram} />
                <InputField label="Nome Completo *" icon={User} value={formData.nomeCompleto} onChange={handleChange('nomeCompleto')} placeholder="Digite o nome completo do militar" error={errors.nomeCompleto} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Especialidade" icon={Briefcase} value={formData.especialidade} onChange={handleChange('especialidade')} />
                <div className="hidden md:block" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField label="Divisão" icon={Building2} value={formData.divisao} onChange={handleChange('divisao')} options={optionsDivisao} />
                <SelectField label="Setor" icon={MapPin} value={formData.setor} onChange={handleChange('setor')} options={optionsSetor} placeholder="Selecione o setor..." />
              </div>
            </div>
          </motion.div>

          {/* DETALHES DO FATO */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-[2rem] bg-white dark:bg-[#0f172b] border border-slate-200 dark:border-slate-800/60 shadow-sm relative z-10 group/card"
          >
            {/* Ambient Background Pattern - Moved to separate container for overflow control */}
            <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -ml-16 -mb-16 group-hover/card:bg-purple-500/10 transition-colors" />
            </div>

            <h4 className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              / Detalhes do Fato
            </h4>
            
            <div className="relative z-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Apurador" icon={User} value={formData.apurador} onChange={handleChange('apurador')} />
                <InputField label="Aplicador" icon={User} value={formData.aplicador} onChange={handleChange('aplicador')} />
              </div>

              <TextAreaField label="Resumo do Fato" value={formData.resumoFato} onChange={handleChange('resumoFato')} placeholder="Descreva os fatos ocorridos..." />

              <div className="flex flex-wrap md:flex-nowrap gap-6">
                <DatePickerField label="Início *" value={formData.dataInicio} onChange={handleChange('dataInicio')} error={errors.dataInicio} />
                <DatePickerField label="Término" value={formData.dataTermino} onChange={handleChange('dataTermino')} error={errors.dataTermino} />
                <div className="flex-1 min-w-[200px]">
                  <SelectField label="Status" icon={AlertTriangle} value={formData.status} onChange={handleChange('status')} options={optionsStatus} direction="up" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* SANÇÃO DISCIPLINAR */}
        <div className="lg:col-span-5 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-[2rem] bg-white dark:bg-[#0f172b] text-slate-900 dark:text-white shadow-2xl shadow-indigo-200/50 dark:shadow-none relative group/card border border-slate-200 dark:border-slate-800/60"
          >
            {/* Pulsing Core Background - Moved to separate container for overflow control */}
            <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[100px] group-hover/card:bg-indigo-500/15 transition-all duration-700" />
            </div>
            
            <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3 relative z-10">
              <div className="w-2 h-2 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]" />
              / Sanção Disciplinar
            </h4>
            
            <div className="relative z-10 space-y-6">
              <SelectField label="Punição" icon={Clock} value={formData.punicao} onChange={handleChange('punicao')} options={optionsPunicao} />
              
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Qtd Dias" icon={Clock} value={formData.qtdDias} onChange={handleChange('qtdDias')} />
                <DatePickerField label="Data da Punição" value={formData.dataPunicao} onChange={handleChange('dataPunicao')} error={errors.dataPunicao} />
              </div>

              <TextAreaField label="Resumo da Punição" value={formData.resumoPunicao} onChange={handleChange('resumoPunicao')} />
              
              <div className="grid grid-cols-2 gap-4">
                <InputField label="N da Grade" icon={FileText} value={formData.nGrade} onChange={handleChange('nGrade')} />
                <InputField label="Boletim" icon={FileText} value={formData.boletim} onChange={handleChange('boletim')} />
              </div>

              <TextAreaField label="Observações" value={formData.observacoes} onChange={handleChange('observacoes')} />

              {formData.documents && formData.documents.length > 0 && (
                <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Documentos Anexados</p>
                  <div className="space-y-1.5">
                    {formData.documents.map((doc: any, docIdx: number) => (
                      <div key={docIdx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 group/doc">
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline truncate pr-4"
                        >
                          <FileText size={14} className="shrink-0" />
                          <span className="truncate">{doc.name}</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev: any) => ({
                              ...prev,
                              documents: prev.documents.filter((_: any, idx: number) => idx !== docIdx)
                            }));
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-all opacity-0 group-hover/doc:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <motion.button 
              whileHover={{ scale: 1.02, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-3 py-4.5 rounded-2xl bg-linear-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold transition-all shadow-xl shadow-indigo-500/20 dark:shadow-none border border-indigo-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={20} className="animate-pulse" />
                  {initialData ? 'Salvar Alterações' : 'Salvar Registro'}
                </>
              )}
            </motion.button>

            <div className="grid grid-cols-2 gap-4">
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSave?.(null)}
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
              >
                <ChevronLeft size={18} />
                Voltar
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleClear}
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-500/10 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-500 hover:text-white transition-all border border-slate-500/20"
              >
                <Eraser size={18} />
                Limpar
              </motion.button>
            </div>
          </div>
        </div>
      </div>
      <HistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        historyData={history} 
      />
    </div>
  );
}



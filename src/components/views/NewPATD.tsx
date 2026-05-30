import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  History as HistoryIcon, 
  Download,
  Printer
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

const AutocompleteInputField = ({ label, icon: Icon, value, onChange, placeholder, disabled = false, type = "text", error, fieldName }: any) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load options from localStorage
  useEffect(() => {
    const key = `patd_field_memory_${fieldName}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        setSuggestions(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error parsing autocomplete options:', e);
    }
  }, [fieldName, showDropdown]);

  // Filter options when value changes
  useEffect(() => {
    if (!value) {
      setFilteredSuggestions(suggestions);
    } else {
      const lowVal = value.toLowerCase();
      setFilteredSuggestions(
        suggestions.filter((opt) => opt.toLowerCase().includes(lowVal) && opt.toLowerCase() !== lowVal)
      );
    }
  }, [value, suggestions]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange({ target: { value: val } });
    setShowDropdown(false);
  };

  return (
    <div ref={containerRef} className="space-y-1.5 flex-1 relative">
      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/80 transition-all group-focus-within:text-indigo-500 group-focus-within:scale-110 z-10">
          <Icon size={16} />
        </div>
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setShowDropdown(true)}
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

      <AnimatePresence>
        {showDropdown && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 p-1.5 z-50 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 max-h-48 overflow-y-auto custom-scrollbar"
          >
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSelect(suggestion)}
                className="w-full px-3 py-2 text-left text-xs font-semibold rounded-lg hover:bg-indigo-500 hover:text-white text-slate-700 dark:text-slate-300 dark:hover:bg-indigo-650 transition-all block"
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

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
  const downloadHistory = () => {
    if (!historyData || historyData.length === 0) {
      alert('Não há histórico para exportar.');
      return;
    }
    const header = "HISTÓRICO DE ALTERAÇÕES - GPATD\n" +
                   `Exportado em: ${new Date().toLocaleString('pt-BR')}\n` +
                   "==================================================\n\n";
    const content = historyData.map((item, idx) => {
      return `[${idx + 1}] Campo: ${item.field}\n` +
             `Data: ${item.date}\n` +
             `Valor Anterior: ${item.oldValue || '—'}\n` +
             `Novo Valor: ${item.newValue || '—'}\n` +
             `Usuário: ${item.user}\n` +
             "--------------------------------------------------";
    }).join('\n\n');
    
    const blob = new Blob([header + content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historico_alteracoes_${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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

            <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button 
                onClick={downloadHistory}
                className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
              >
                <Download size={16} /> Exportar
              </button>
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
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [activeDocTab, setActiveDocTab] = useState<'capa' | 'despacho' | 'fatd'>('capa');
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
    apuradorPosto: '1T',
    apuradorQuadro: 'QOINT',
    apuradorSaram: '',
    aplicador: '',
    aplicadorPosto: 'TC',
    aplicadorQuadro: 'QOAV',
    oficioNumero: '',
    protComaer: '',
    dataOficio: '',
    enquadramentoRdaer: '',
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

  const printDocument = (type: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const formatDateStr = (dateStr: string) => {
      if (!dateStr) return '___/___/_____';
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    };

    const getDocHTML = () => {
      switch(type) {
        case 'capa':
          return `
            <div class="sheet capa font-serif" style="padding: 15mm 20mm 15mm 20mm !important;">
              <!-- Outside the bordered frame -->
              <div class="capa-header text-center" style="margin-bottom: 8mm !important;">
                <p style="font-size: 14px; font-weight: bold; color: #000000; margin: 0 0 6px 0;">Anexo C - Capa</p>
                <p class="text-red" style="font-size: 16px; font-weight: bold; margin: 0 0 4px 0; letter-spacing: 0.5px;">INFORMAÇÃO PESSOAL – ACESSO RESTRITO</p>
                <p class="text-red" style="font-size: 12px; margin: 0 0 2px 0; font-weight: 500;">Art. 5º, Inciso X, da Constituição Federal do Brasil, de 1988</p>
                <p class="text-red" style="font-size: 12px; margin: 0 0 2px 0; font-weight: 500;">Art. 31 da Lei nº 12.527, de 2011</p>
                <p class="text-red" style="font-size: 12px; margin: 0; font-weight: 500;">Arts. 55 a 62 do Decreto nº 7.724, de 2012</p>
              </div>

              <!-- Bordered Frame -->
              <div class="capa-frame">
                <!-- Top Emblem and Headers -->
                <div class="w-full text-center flex flex-col items-center">
                  <img src="${window.location.origin}/brasao.png" width="75" height="75" style="margin-bottom: 12px; display: block; margin-left: auto; margin-right: auto;" />
                  <p style="font-size: 16px; font-weight: bold; color: #000000; margin: 0 0 4px 0; text-transform: uppercase;">Ministério da Defesa</p>
                  <p style="font-size: 16px; font-weight: bold; color: #000000; margin: 0 0 4px 0; text-transform: uppercase;">Comando da Aeronáutica</p>
                  <p class="text-black underline" style="font-size: 16px; font-weight: bold; margin: 0; text-transform: uppercase;">Academia da Força Aérea</p>
                </div>

                <!-- Process Title -->
                <div class="w-full text-center" style="margin-top: 12mm; margin-bottom: 12mm;">
                  <p style="font-size: 13px; font-weight: bold; color: #000000; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap;">PROCESSO DE APURAÇÃO DE TRANSGRESSÃO DISCIPLINAR</p>
                  <p style="font-size: 15px; font-weight: bold; color: #000000; margin: 0;">Nº <span class="text-black">${formData.patdNumber || '___/___/_____'}</span></p>
                </div>

                <!-- Footer/Sections inside Frame -->
                <div class="w-full" style="margin-bottom: 5mm;">
                  <!-- Militar Arrolado -->
                  <div class="text-center" style="margin-bottom: 15mm;">
                    <p style="font-size: 15px; font-weight: bold; color: #000000; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Militar Arrolado</p>
                    <p class="text-black" style="font-size: 15px; font-weight: bold; margin: 8px 0 0 0; text-transform: uppercase;">${formData.nomeCompleto || '___________________________'} - ${formData.posto} ${formData.quadro}</p>
                    <div class="line-accent" style="margin-top: 5px !important;"></div>
                  </div>

                  <!-- Oficial Apurador -->
                  <div class="text-center">
                    <p style="font-size: 15px; font-weight: bold; color: #000000; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Oficial Apurador</p>
                    <p class="text-black" style="font-size: 15px; font-weight: bold; margin: 8px 0 0 0; text-transform: uppercase;">${formData.apurador || '___________________________'} - ${formData.apuradorPosto} ${formData.apuradorQuadro}</p>
                    <div class="line-accent" style="margin-top: 5px !important;"></div>
                  </div>
                </div>
              </div>
            </div>
          `;
        case 'despacho':
          return `
            <div class="sheet despacho font-serif" style="padding: 20mm 15mm 20mm 20mm !important; font-family: 'Times New Roman', Times, serif;">
              <!-- Header inside the printable sheet -->
              <div class="text-center font-bold" style="margin-bottom: 2mm;">
                <p style="font-size: 14px; font-weight: bold; color: #000000; margin: 0 0 6px 0;">Anexo B - Despacho de Abertura e Designação de Apurador</p>
                <p class="text-red" style="font-size: 16px; font-weight: bold; margin: 0 0 4px 0; letter-spacing: 0.5px;">INFORMAÇÃO PESSOAL – ACESSO RESTRITO</p>
                <p class="text-red" style="font-size: 12px; margin: 0 0 2px 0; font-weight: 500;">Art. 5º, Inciso X, da Constituição Federal do Brasil, de 1988</p>
                <p class="text-red" style="font-size: 12px; margin: 0 0 2px 0; font-weight: 500;">Art. 31 da Lei nº 12.527, de 2011</p>
                <p class="text-red" style="font-size: 12px; margin: 0 0 10px 0; font-weight: 500;">Arts. 55 a 62 do Decreto nº 7.724, de 2012</p>
              </div>

              <!-- Top Emblem and Headers -->
              <div class="w-full text-center flex flex-col items-center" style="margin-bottom: 25px;">
                <img src="${window.location.origin}/brasao.png" width="65" height="65" style="margin-bottom: 12px; display: block; margin-left: auto; margin-right: auto;" />
                <p style="font-size: 14px; font-weight: bold; color: #000000; margin: 0 0 3px 0; text-transform: uppercase;">Ministério da Defesa</p>
                <p style="font-size: 14px; font-weight: bold; color: #000000; margin: 0 0 3px 0; text-transform: uppercase;">Comando da Aeronáutica</p>
                <p class="text-red underline" style="font-size: 14px; font-weight: bold; margin: 0; text-transform: uppercase;">Academia da Força Aérea</p>
              </div>

              <div class="body-text text-justify" style="font-size: 13px; line-height: 1.6;">
                <p style="text-indent: 3rem; margin-top: 15px; text-align: justify;">
                  Considerando o disposto no art. 1º da Portaria nº 853/SIJ, de 27 de abril de 2026, publicada no Boletim Interno Ostensivo n º 75, de 29 de abril de 2026, que designa oficiais para apurar transgressão disciplinar e autoridades para aplicar punição disciplinar, no âmbito desta Organização Militar, c/c o item 3.1 da ICA 111-6, aprovada pela Portaria GABAER nº 120/GC3 de 9 de julho de 2021, determino a abertura de Processo de Apuração de Transgressão Disciplinar (PATD), com a finalidade de apurar os fatos relatados no Ofício nº <strong>${formData.oficioNumero || '_______'}</strong>, (Prot. COMAER nº <strong>${formData.protComaer || '_______'}</strong>), de <strong>${formatDateStr(formData.dataOficio)}</strong>.
                </p>
                
                <p style="text-indent: 3rem; margin-top: 15px; text-align: justify;">
                  Designo o <strong>${formData.apuradorPosto || ''} ${formData.apuradorQuadro || ''} ${formData.apurador || '___________________________'}</strong> para, na condição de Oficial Apurador, efetuar a apuração da suposta transgressão disciplinar e propor solução à autoridade competente, com estrita observância dos procedimentos previstos na ICA 111-6, aprovada pela Portaria GABAER nº 120/GC3 de 9 de julho de 2021, e no Decreto nº 76.322, de 22 de setembro de 1975 (RDAER); sem prejuízo das demais funções.
                </p>
                
                <p style="text-indent: 3rem; margin-top: 15px; text-align: justify;">
                  Após apurados os fatos, voltem-me os autos para decisão.
                </p>
              </div>

              <div class="text-right" style="margin-top: 25mm; font-size: 13px; font-weight: 550; text-align: right;">
                <p>Pirassununga, ${new Date().toLocaleDateString('pt-BR', {day: 'numeric', month: 'long', year: 'numeric'})}.</p>
              </div>

              <div class="signature-box text-center" style="margin-top: 30mm;">
                <div class="line mx-auto w-64 border-bottom mb-2" style="border-bottom: 1px solid #000000; width: 250px; margin-left: auto; margin-right: auto;"></div>
                <p class="font-bold uppercase" style="margin: 0 0 2px 0; font-size: 13px;">${formData.aplicadorPosto || ''} ${formData.aplicadorQuadro || ''} ${formData.aplicador || '___________________________'}</p>
                <p class="text-xs uppercase text-slate-500" style="margin: 0; font-size: 10px;">Autoridade Aplicadora / Competente</p>
              </div>
            </div>
          `;
        case 'fatd':
          return `
            <div class="sheet fatd font-serif">
              <div class="header text-center font-bold">
                <p class="uppercase font-black text-sm">Ministério da Defesa</p>
                <p class="uppercase font-black text-sm">Comando da Aeronáutica</p>
                <p class="uppercase font-black text-sm">${formData.divisao || 'Divisão Cadastrada'}</p>
              </div>
              
              <div class="divider"></div>
              
              <div class="title text-center font-bold uppercase mt-6">
                <h2 class="text-md font-black">FORMULÁRIO DE APURAÇÃO DE TRANSGRESSÃO DISCIPLINAR (FATD)</h2>
                <h3 class="patd-num text-sm mt-1">PATD Nº ${formData.patdNumber || '___/___/_____'}</h3>
              </div>
              
              <div class="section-title mt-8 font-bold text-xs uppercase tracking-wider bg-slate-100 p-1">1. IDENTIFICAÇÃO DO MILITAR ACUSADO</div>
              <table class="w-full text-xs mt-2 border-collapse">
                <tr>
                  <td class="p-2 border" colspan="2"><strong>NOME COMPLETO:</strong> ${formData.nomeCompleto || '___________________________'}</td>
                  <td class="p-2 border"><strong>SARAM:</strong> ${formData.saram || '_______'}</td>
                </tr>
                <tr>
                  <td class="p-2 border"><strong>POSTO/GRAD:</strong> ${formData.posto}</td>
                  <td class="p-2 border"><strong>QUADRO:</strong> ${formData.quadro}</td>
                  <td class="p-2 border"><strong>ESPECIALIDADE:</strong> ${formData.especialidade || '________'}</td>
                </tr>
                <tr>
                  <td class="p-2 border" colspan="2"><strong>DIVISÃO:</strong> ${formData.divisao}</td>
                  <td class="p-2 border"><strong>SETOR:</strong> ${formData.setor || '_______'}</td>
                </tr>
              </table>

              <div class="section-title mt-6 font-bold text-xs uppercase tracking-wider bg-slate-100 p-1">1.2. DADOS DA APURAÇÃO E DOCUMENTAÇÃO ORIGINÁRIA</div>
              <table class="w-full text-xs mt-2 border-collapse">
                <tr>
                  <td class="p-2 border"><strong>APURADOR (ENCARREGADO):</strong> ${formData.apuradorPosto || ''} ${formData.apuradorQuadro || ''} ${formData.apurador || '___________________________'}</td>
                  <td class="p-2 border"><strong>SARAM:</strong> ${formData.apuradorSaram || '_______'}</td>
                </tr>
                <tr>
                  <td class="p-2 border" colspan="2"><strong>AUTORIDADE APLICADORA:</strong> ${formData.aplicadorPosto || ''} ${formData.aplicadorQuadro || ''} ${formData.aplicador || '___________________________'}</td>
                </tr>
                <tr>
                  <td class="p-2 border"><strong>OFÍCIO Nº:</strong> ${formData.oficioNumero || '_______'}</td>
                  <td class="p-2 border"><strong>PROT. COMAER:</strong> ${formData.protComaer || '_______'}</td>
                </tr>
                <tr>
                  <td class="p-2 border"><strong>DATA DO DOCUMENTO:</strong> ${formatDateStr(formData.dataOficio)}</td>
                  <td class="p-2 border"><strong>ENQUADRAMENTO RDAER:</strong> ${formData.enquadramentoRdaer || '_______'}</td>
                </tr>
              </table>

              <div class="section-title mt-6 font-bold text-xs uppercase tracking-wider bg-slate-100 p-1">2. DESCRIÇÃO DO FATO DISCIPLINAR (SÍNTESE)</div>
              <div class="p-3 border text-xs text-justify leading-relaxed min-h-24 bg-slate-50 italic">
                ${formData.resumoFato || 'Sem fatos cadastrados até o momento.'}
              </div>

              <div class="section-title mt-6 font-bold text-xs uppercase tracking-wider bg-slate-100 p-1">3. CIENTIFICAÇÃO E PRAZO PARA DEFESA</div>
              <div class="p-3 border text-xs text-justify leading-relaxed">
                Fica o militar arrolado cientificado do fato que lhe é imputado, bem como de que dispõe do prazo regulamentar de <strong>03 (três) dias úteis</strong>, a contar do recebimento deste formulário, para apresentar por escrito sua justificativa de defesa (Defesa Prévia), caso queira, perante o encarregado da apuração.
              </div>

              <div class="grid grid-cols-2 gap-4 mt-8 text-xs">
                <div class="p-3 border rounded-lg">
                  <p class="font-bold">NOTIFICAÇÃO DO ACUSADO:</p>
                  <p class="mt-4">Ciente em: ____/____/________</p>
                  <div class="line mt-8 border-bottom w-full"></div>
                  <p class="text-center mt-1 text-[10px] text-slate-400">Assinatura do Acusado</p>
                </div>
                
                <div class="p-3 border rounded-lg">
                  <p class="font-bold">ENTREGA PELO ENCARREGADO:</p>
                  <p class="mt-4">Entregue em: ____/____/________</p>
                  <div class="line mt-8 border-bottom w-full"></div>
                  <p class="text-center mt-1 text-[10px] text-slate-400">Assinatura do Encarregado (${formData.apuradorPosto || ''} ${formData.apuradorQuadro || ''} ${formData.apurador || 'Apurador'})</p>
                </div>
              </div>
            </div>
          `;
        default:
          return '';
      }
    };

    const css = `
      body {
        background-color: #f1f5f9;
        margin: 0;
        padding: 40px 20px;
        font-family: 'Times New Roman', Times, serif;
        display: flex;
        justify-content: center;
      }
      .sheet {
        background-color: #ffffff;
        width: 210mm;
        min-height: 297mm;
        padding: 30mm 20mm 20mm 20mm;
        box-sizing: border-box;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        position: relative;
      }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .text-justify { text-align: justify; }
      .font-bold { font-weight: bold; }
      .uppercase { text-transform: uppercase; }
      .mt-4 { margin-top: 1rem; }
      .mt-8 { margin-top: 2rem; }
      .mt-12 { margin-top: 3rem; }
      .mt-16 { margin-top: 4rem; }
      .mt-24 { margin-top: 6rem; }
      .mt-32 { margin-top: 8rem; }
      .text-sm { font-size: 0.875rem; }
      .text-xs { font-size: 0.75rem; }
      .text-md { font-size: 1.125rem; }
      .text-xl { font-size: 1.25rem; }
      .w-full { width: 100%; }
      .w-64 { width: 16rem; }
      .mx-auto { margin-left: auto; margin-right: auto; }
      .grid { display: grid; }
      .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .gap-4 { gap: 1rem; }
      .border { border: 1px solid #cbd5e1; }
      .border-collapse { border-collapse: collapse; }
      .p-2 { padding: 0.5rem; }
      .p-3 { padding: 0.75rem; }
      .divider {
        margin: 20px 0;
        border-bottom: 2px double #000;
      }
      .border-bottom {
        border-bottom: 1px solid #000;
      }
      .border-top {
        border-top: 1px solid #e2e8f0;
      }
      .pt-4 { padding-top: 1rem; }
      .indent-12 { text-indent: 3rem; }
      .leading-relaxed { line-height: 1.625; }
      .section-title {
        font-family: sans-serif;
        border-left: 4px solid #4f46e5;
        padding-left: 8px;
      }
      .bg-slate-100 { background-color: #f1f5f9; }
      .bg-slate-50 { background-color: #f8fafc; }
      .min-h-24 { min-height: 6rem; }
      .italic { font-style: italic; }
      .rounded-lg { border-radius: 0.5rem; }
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          background-color: transparent;
          padding: 0;
        }
        .sheet {
          box-shadow: none;
          width: auto;
          min-height: auto;
          padding: 10mm 10mm 10mm 10mm;
        }
      }
      .text-red {
        color: #ff0000 !important;
      }
      .text-black {
        color: #000000 !important;
      }
      .capa-header {
        text-align: center;
        font-family: 'Times New Roman', Times, serif;
      }
      .capa-frame {
        border: 2px solid #000000 !important;
        padding: 10mm 15mm;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        height: 212mm;
        box-sizing: border-box;
        font-family: 'Times New Roman', Times, serif;
      }
      .line-accent {
        width: 100%;
        border-bottom: 2px solid #000000 !important;
        margin-top: 15px;
        margin-bottom: 5px;
      }
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>${type.toUpperCase()} - ${formData.patdNumber || 'PATD'}</title>
          <style>${css}</style>
        </head>
        <body>
          ${getDocHTML()}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const printAllDocuments = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const formatDateStr = (dateStr: string) => {
      if (!dateStr) return '___/___/_____';
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    };

    const css = `
      body {
        background-color: #f1f5f9;
        margin: 0;
        padding: 40px 20px;
        font-family: 'Times New Roman', Times, serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 40px;
      }
      .sheet {
        background-color: #ffffff;
        width: 210mm;
        min-height: 297mm;
        padding: 30mm 20mm 20mm 20mm;
        box-sizing: border-box;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        position: relative;
        page-break-after: always;
      }
      .sheet:last-child {
        page-break-after: avoid;
      }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .text-justify { text-align: justify; }
      .font-bold { font-weight: bold; }
      .uppercase { text-transform: uppercase; }
      .mt-4 { margin-top: 1rem; }
      .mt-6 { margin-top: 1.5rem; }
      .mt-8 { margin-top: 2rem; }
      .mt-12 { margin-top: 3rem; }
      .mt-16 { margin-top: 4rem; }
      .mt-24 { margin-top: 6rem; }
      .mt-32 { margin-top: 8rem; }
      .text-sm { font-size: 0.875rem; }
      .text-xs { font-size: 0.75rem; }
      .text-md { font-size: 1.125rem; }
      .text-xl { font-size: 1.25rem; }
      .w-full { width: 100%; }
      .w-64 { width: 16rem; }
      .mx-auto { margin-left: auto; margin-right: auto; }
      .grid { display: grid; }
      .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .gap-4 { gap: 1rem; }
      .border { border: 1px solid #cbd5e1; }
      .border-collapse { border-collapse: collapse; }
      .p-1 { padding: 0.25rem; }
      .p-2 { padding: 0.5rem; }
      .p-3 { padding: 0.75rem; }
      .divider {
        margin: 20px 0;
        border-bottom: 2px double #000;
      }
      .border-bottom {
        border-bottom: 1px solid #000;
      }
      .border-top {
        border-top: 1px solid #e2e8f0;
      }
      .pt-4 { padding-top: 1rem; }
      .indent-12 { text-indent: 3rem; }
      .leading-relaxed { line-height: 1.625; }
      .section-title {
        font-family: sans-serif;
        border-left: 4px solid #4f46e5;
        padding-left: 8px;
      }
      .bg-slate-100 { background-color: #f1f5f9; }
      .bg-slate-50 { background-color: #f8fafc; }
      .min-h-24 { min-height: 6rem; }
      .italic { font-style: italic; }
      .rounded-lg { border-radius: 0.5rem; }
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          background-color: transparent;
          padding: 0;
          gap: 0;
        }
        .sheet {
          box-shadow: none;
          width: auto;
          min-height: auto;
          padding: 10mm 10mm 10mm 10mm;
        }
      }
      .text-red {
        color: #ff0000 !important;
      }
      .text-black {
        color: #000000 !important;
      }
      .capa-header {
        text-align: center;
        font-family: 'Times New Roman', Times, serif;
      }
      .capa-frame {
        border: 2px solid #000000 !important;
        padding: 10mm 15mm;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        height: 212mm;
        box-sizing: border-box;
        font-family: 'Times New Roman', Times, serif;
      }
      .line-accent {
        width: 100%;
        border-bottom: 2px solid #000000 !important;
        margin-top: 15px;
        margin-bottom: 5px;
      }
    `;

    const capaHTML = `
      <div class="sheet capa font-serif" style="padding: 15mm 20mm 15mm 20mm !important;">
        <!-- Outside the bordered frame -->
        <div class="capa-header text-center" style="margin-bottom: 8mm !important;">
          <p style="font-size: 14px; font-weight: bold; color: #000000; margin: 0 0 6px 0;">Anexo C - Capa</p>
          <p class="text-red" style="font-size: 16px; font-weight: bold; margin: 0 0 4px 0; letter-spacing: 0.5px;">INFORMAÇÃO PESSOAL – ACESSO RESTRITO</p>
          <p class="text-red" style="font-size: 12px; margin: 0 0 2px 0; font-weight: 500;">Art. 5º, Inciso X, da Constituição Federal do Brasil, de 1988</p>
          <p class="text-red" style="font-size: 12px; margin: 0 0 2px 0; font-weight: 500;">Art. 31 da Lei nº 12.527, de 2011</p>
          <p class="text-red" style="font-size: 12px; margin: 0; font-weight: 500;">Arts. 55 a 62 do Decreto nº 7.724, de 2012</p>
        </div>

        <!-- Bordered Frame -->
        <div class="capa-frame">
          <!-- Top Emblem and Headers -->
          <div class="w-full text-center flex flex-col items-center">
            <img src="${window.location.origin}/brasao.png" width="75" height="75" style="margin-bottom: 12px; display: block; margin-left: auto; margin-right: auto;" />
            <p style="font-size: 16px; font-weight: bold; color: #000000; margin: 0 0 4px 0; text-transform: uppercase;">Ministério da Defesa</p>
            <p style="font-size: 16px; font-weight: bold; color: #000000; margin: 0 0 4px 0; text-transform: uppercase;">Comando da Aeronáutica</p>
            <p class="text-black underline" style="font-size: 16px; font-weight: bold; margin: 0; text-transform: uppercase;">Academia da Força Aérea</p>
          </div>

          <!-- Process Title -->
          <div class="w-full text-center" style="margin-top: 12mm; margin-bottom: 12mm;">
            <p style="font-size: 13px; font-weight: bold; color: #000000; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap;">PROCESSO DE APURAÇÃO DE TRANSGRESSÃO DISCIPLINAR</p>
            <p style="font-size: 15px; font-weight: bold; color: #000000; margin: 0;">Nº <span class="text-black">${formData.patdNumber || '___/___/_____'}</span></p>
          </div>

          <!-- Footer/Sections inside Frame -->
          <div class="w-full" style="margin-bottom: 5mm;">
            <!-- Militar Arrolado -->
            <div class="text-center" style="margin-bottom: 15mm;">
              <p style="font-size: 15px; font-weight: bold; color: #000000; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Militar Arrolado</p>
              <p class="text-black" style="font-size: 15px; font-weight: bold; margin: 8px 0 0 0; text-transform: uppercase;">${formData.nomeCompleto || '___________________________'} - ${formData.posto} ${formData.quadro}</p>
              <div class="line-accent" style="margin-top: 5px !important;"></div>
            </div>

            <!-- Oficial Apurador -->
            <div class="text-center">
              <p style="font-size: 15px; font-weight: bold; color: #000000; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Oficial Apurador</p>
              <p class="text-black" style="font-size: 15px; font-weight: bold; margin: 8px 0 0 0; text-transform: uppercase;">${formData.apurador || '___________________________'} - ${formData.apuradorPosto} ${formData.apuradorQuadro}</p>
              <div class="line-accent" style="margin-top: 5px !important;"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    const despachoHTML = `
      <div class="sheet despacho font-serif" style="padding: 20mm 15mm 20mm 20mm !important; font-family: 'Times New Roman', Times, serif;">
        <!-- Header inside the printable sheet -->
        <div class="text-center font-bold" style="margin-bottom: 2mm;">
          <p style="font-size: 14px; font-weight: bold; color: #000000; margin: 0 0 6px 0;">Anexo B - Despacho de Abertura e Designação de Apurador</p>
          <p class="text-red" style="font-size: 16px; font-weight: bold; margin: 0 0 4px 0; letter-spacing: 0.5px;">INFORMAÇÃO PESSOAL – ACESSO RESTRITO</p>
          <p class="text-red" style="font-size: 12px; margin: 0 0 2px 0; font-weight: 500;">Art. 5º, Inciso X, da Constituição Federal do Brasil, de 1988</p>
          <p class="text-red" style="font-size: 12px; margin: 0 0 2px 0; font-weight: 500;">Art. 31 da Lei nº 12.527, de 2011</p>
          <p class="text-red" style="font-size: 12px; margin: 0 0 10px 0; font-weight: 500;">Arts. 55 a 62 do Decreto nº 7.724, de 2012</p>
        </div>

        <!-- Top Emblem and Headers -->
        <div class="w-full text-center flex flex-col items-center" style="margin-bottom: 25px;">
          <img src="${window.location.origin}/brasao.png" width="65" height="65" style="margin-bottom: 12px; display: block; margin-left: auto; margin-right: auto;" />
          <p style="font-size: 14px; font-weight: bold; color: #000000; margin: 0 0 3px 0; text-transform: uppercase;">Ministério da Defesa</p>
          <p style="font-size: 14px; font-weight: bold; color: #000000; margin: 0 0 3px 0; text-transform: uppercase;">Comando da Aeronáutica</p>
          <p class="text-red underline" style="font-size: 14px; font-weight: bold; margin: 0; text-transform: uppercase;">Academia da Força Aérea</p>
        </div>

        <div class="body-text text-justify" style="font-size: 13px; line-height: 1.6;">
          <p style="text-indent: 3rem; margin-top: 15px; text-align: justify;">
            Considerando o disposto no art. 1º da Portaria nº 853/SIJ, de 27 de abril de 2026, publicada no Boletim Interno Ostensivo n º 75, de 29 de abril de 2026, que designa oficiais para apurar transgressão disciplinar e autoridades para aplicar punição disciplinar, no âmbito desta Organização Militar, c/c o item 3.1 da ICA 111-6, aprovada pela Portaria GABAER nº 120/GC3 de 9 de julho de 2021, determino a abertura de Processo de Apuração de Transgressão Disciplinar (PATD), com a finalidade de apurar os fatos relatados no Ofício nº <strong>${formData.oficioNumero || '_______'}</strong>, (Prot. COMAER nº <strong>${formData.protComaer || '_______'}</strong>), de <strong>${formatDateStr(formData.dataOficio)}</strong>.
          </p>
          
          <p style="text-indent: 3rem; margin-top: 15px; text-align: justify;">
            Designo o <strong>${formData.apuradorPosto || ''} ${formData.apuradorQuadro || ''} ${formData.apurador || '___________________________'}</strong> para, na condição de Oficial Apurador, efetuar a apuração da suposta transgressão disciplinar e propor solução à autoridade competente, com estrita observância dos procedimentos previstos na ICA 111-6, aprovada pela Portaria GABAER nº 120/GC3 de 9 de julho de 2021, e no Decreto nº 76.322, de 22 de setembro de 1975 (RDAER); sem prejuízo das demais funções.
          </p>
          
          <p style="text-indent: 3rem; margin-top: 15px; text-align: justify;">
            Após apurados os fatos, voltem-me os autos para decisão.
          </p>
        </div>

        <div class="text-right" style="margin-top: 25mm; font-size: 13px; font-weight: 550; text-align: right;">
          <p>Pirassununga, ${new Date().toLocaleDateString('pt-BR', {day: 'numeric', month: 'long', year: 'numeric'})}.</p>
        </div>

        <div class="signature-box text-center" style="margin-top: 30mm;">
          <div class="line mx-auto w-64 border-bottom mb-2" style="border-bottom: 1px solid #000000; width: 250px; margin-left: auto; margin-right: auto;"></div>
          <p class="font-bold uppercase" style="margin: 0 0 2px 0; font-size: 13px;">${formData.aplicadorPosto || ''} ${formData.aplicadorQuadro || ''} ${formData.aplicador || '___________________________'}</p>
          <p class="text-xs uppercase text-slate-500" style="margin: 0; font-size: 10px;">Autoridade Aplicadora / Competente</p>
        </div>
      </div>
    `;

    const fatdHTML = `
      <div class="sheet fatd font-serif">
        <div class="header text-center font-bold">
          <p class="uppercase font-black text-sm">Ministério da Defesa</p>
          <p class="uppercase font-black text-sm">Comando da Aeronáutica</p>
          <p class="uppercase font-black text-sm">${formData.divisao || 'Divisão Cadastrada'}</p>
        </div>
        
        <div class="divider"></div>
        
        <div class="title text-center font-bold uppercase mt-6">
          <h2 class="text-md font-black">FORMULÁRIO DE APURAÇÃO DE TRANSGRESSÃO DISCIPLINAR (FATD)</h2>
          <h3 class="patd-num text-sm mt-1">PATD Nº ${formData.patdNumber || '___/___/_____'}</h3>
        </div>
        
        <div class="section-title mt-8 font-bold text-xs uppercase tracking-wider bg-slate-100 p-1">1. IDENTIFICAÇÃO DO MILITAR ACUSADO</div>
        <table class="w-full text-xs mt-2 border-collapse">
          <tr>
            <td class="p-2 border" colspan="2"><strong>NOME COMPLETO:</strong> ${formData.nomeCompleto || '___________________________'}</td>
            <td class="p-2 border"><strong>SARAM:</strong> ${formData.saram || '_______'}</td>
          </tr>
          <tr>
            <td class="p-2 border"><strong>POSTO/GRAD:</strong> ${formData.posto}</td>
            <td class="p-2 border"><strong>QUADRO:</strong> ${formData.quadro}</td>
            <td class="p-2 border"><strong>ESPECIALIDADE:</strong> ${formData.especialidade || '________'}</td>
          </tr>
          <tr>
            <td class="p-2 border" colspan="2"><strong>DIVISÃO:</strong> ${formData.divisao}</td>
            <td class="p-2 border"><strong>SETOR:</strong> ${formData.setor || '_______'}</td>
          </tr>
        </table>

        <div class="section-title mt-6 font-bold text-xs uppercase tracking-wider bg-slate-100 p-1">1.2. DADOS DA APURAÇÃO E DOCUMENTAÇÃO ORIGINÁRIA</div>
        <table class="w-full text-xs mt-2 border-collapse">
          <tr>
            <td class="p-2 border"><strong>APURADOR (ENCARREGADO):</strong> ${formData.apuradorPosto || ''} ${formData.apuradorQuadro || ''} ${formData.apurador || '___________________________'}</td>
            <td class="p-2 border"><strong>SARAM:</strong> ${formData.apuradorSaram || '_______'}</td>
          </tr>
          <tr>
            <td class="p-2 border" colspan="2"><strong>AUTORIDADE APLICADORA:</strong> ${formData.aplicadorPosto || ''} ${formData.aplicadorQuadro || ''} ${formData.aplicador || '___________________________'}</td>
          </tr>
          <tr>
            <td class="p-2 border"><strong>OFÍCIO Nº:</strong> ${formData.oficioNumero || '_______'}</td>
            <td class="p-2 border"><strong>PROT. COMAER:</strong> ${formData.protComaer || '_______'}</td>
          </tr>
          <tr>
            <td class="p-2 border"><strong>DATA DO DOCUMENTO:</strong> ${formatDateStr(formData.dataOficio)}</td>
            <td class="p-2 border"><strong>ENQUADRAMENTO RDAER:</strong> ${formData.enquadramentoRdaer || '_______'}</td>
          </tr>
        </table>

        <div class="section-title mt-6 font-bold text-xs uppercase tracking-wider bg-slate-100 p-1">2. DESCRIÇÃO DO FATO DISCIPLINAR (SÍNTESE)</div>
        <div class="p-3 border text-xs text-justify leading-relaxed min-h-24 bg-slate-50 italic">
          ${formData.resumoFato || 'Sem fatos cadastrados até o momento.'}
        </div>

        <div class="section-title mt-6 font-bold text-xs uppercase tracking-wider bg-slate-100 p-1">3. CIENTIFICAÇÃO E PRAZO PARA DEFESA</div>
        <div class="p-3 border text-xs text-justify leading-relaxed">
          Fica o militar arrolado cientificado do fato que lhe é imputado, bem como de que dispõe do prazo regulamentar de <strong>03 (três) dias úteis</strong>, a contar do recebimento deste formulário, para apresentar por escrito sua justificativa de defesa (Defesa Prévia), caso queira, perante o encarregado da apuração.
        </div>

        <div class="grid grid-cols-2 gap-4 mt-8 text-xs">
          <div class="p-3 border rounded-lg">
            <p class="font-bold">NOTIFICAÇÃO DO ACUSADO:</p>
            <p class="mt-4">Ciente em: ____/____/________</p>
            <div class="line mt-8 border-bottom w-full"></div>
            <p class="text-center mt-1 text-[10px] text-slate-400">Assinatura do Acusado</p>
          </div>
          
          <div class="p-3 border rounded-lg">
            <p class="font-bold">ENTREGA PELO ENCARREGADO:</p>
            <p class="mt-4">Entregue em: ____/____/________</p>
            <div class="line mt-8 border-bottom w-full"></div>
            <p class="text-center mt-1 text-[10px] text-slate-400">Assinatura do Encarregado (${formData.apuradorPosto || ''} ${formData.apuradorQuadro || ''} ${formData.apurador || 'Apurador'})</p>
          </div>
        </div>
      </div>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>PROCESSO COMPLETO - ${formData.patdNumber || 'PATD'}</title>
          <style>${css}</style>
        </head>
        <body>
          ${capaHTML}
          ${despachoHTML}
          ${fatdHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getAllowedQuadros = (posto: string) => {
    if (['BR', 'CL', 'TC', 'MJ', 'CP', '1T', '2T', 'AP'].includes(posto)) {
      return ['QOAV', 'QOINF', 'QOINT', 'QOAP', 'QOMED', 'QOCON'];
    }
    if (['CD'].includes(posto)) {
      return ['QOAV', 'QOINF', 'QOINT'];
    }
    if (['SO', '1S', '2S', '3S', 'AL'].includes(posto)) {
      return ['QSS', 'QSCON', 'QESA'];
    }
    if (['CB'].includes(posto)) {
      return ['QCB', 'QCBCON'];
    }
    if (['TM', 'T1', 'T2'].includes(posto)) {
      return ['QTA'];
    }
    if (['S1', 'S2'].includes(posto)) {
      return ['QSD'];
    }
    return [];
  };

  const allowedQuadros = useMemo(() => {
    const allowed = getAllowedQuadros(formData.posto);
    const baseQuadros = [
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
    if (allowed.length === 0) return baseQuadros;
    return baseQuadros.filter(q => allowed.includes(q.value));
  }, [formData.posto]);

  useEffect(() => {
    const allowed = getAllowedQuadros(formData.posto);
    if (allowed.length > 0 && !allowed.includes(formData.quadro)) {
      setFormData(prev => ({
        ...prev,
        quadro: allowed[0]
      }));
    }
  }, [formData.posto]);

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
        apuradorPosto: initialData.apuradorPosto || '1T',
        apuradorQuadro: initialData.apuradorQuadro || 'QOINT',
        apuradorSaram: initialData.apuradorSaram || '',
        aplicador: initialData.aplicador || '',
        aplicadorPosto: initialData.aplicadorPosto || 'TC',
        aplicadorQuadro: initialData.aplicadorQuadro || 'QOAV',
        oficioNumero: initialData.oficioNumero || '',
        protComaer: initialData.protComaer || '',
        dataOficio: initialData.dataOficio || '',
        enquadramentoRdaer: initialData.enquadramentoRdaer || '',
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

    if (file.size > 20 * 1024 * 1024) {
      alert('O arquivo não pode exceder o limite máximo de 20MB.');
      return;
    }

    if (formData.documents && formData.documents.length > 0) {
      alert('Já existe um documento anexado a este processo. Remova-o antes de enviar um novo arquivo.');
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

      const newHistoryItem = {
        field: 'Documento PDF',
        oldValue: '—',
        newValue: `Adicionado: ${file.name}`,
        user: currentUser?.name || 'Sistema',
        date: new Date().toLocaleString('pt-BR')
      };

      setHistory((prev: any) => [newHistoryItem, ...prev]);

      setFormData((prev: any) => ({
        ...prev,
        documents: [...(prev.documents || []), newDoc]
      }));
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

        if (activeErr) console.error('Active query error:', activeErr);

        const allNumbers = [
          ...(activeData || []).map((p: any) => p.patd_number),
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
    apuradorPosto: 'Posto do Apurador',
    apuradorQuadro: 'Quadro do Apurador',
    apuradorSaram: 'SARAM do Apurador',
    aplicador: 'Aplicador',
    aplicadorPosto: 'Posto do Aplicador',
    aplicadorQuadro: 'Quadro do Aplicador',
    oficioNumero: 'Nº do Ofício',
    protComaer: 'Prot. COMAER nº',
    dataOficio: 'Data do Ofício/Protocolo',
    enquadramentoRdaer: 'Enquadramento RDAER',
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
    if (field === 'saram' || field === 'apuradorSaram') {
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
    if (field === 'apuradorSaram' && newValue) {
      delete newErrors.apuradorSaram;
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
        apuradorPosto: '1T',
        apuradorQuadro: 'QOINT',
        apuradorSaram: '',
        aplicador: '',
        aplicadorPosto: 'TC',
        aplicadorQuadro: 'QOAV',
        oficioNumero: '',
        protComaer: '',
        dataOficio: '',
        enquadramentoRdaer: '',
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

    // Save field memory for autocomplete
    const fieldsToRemember = ['nomeCompleto', 'saram', 'especialidade', 'apurador', 'aplicador'];
    fieldsToRemember.forEach(field => {
      const val = formData[field]?.trim();
      if (val) {
        const key = `patd_field_memory_${field}`;
        try {
          const saved = localStorage.getItem(key);
          let list: string[] = saved ? JSON.parse(saved) : [];
          if (!list.includes(val)) {
            list.unshift(val);
            list = list.slice(0, 10);
            localStorage.setItem(key, JSON.stringify(list));
          }
        } catch (e) {
          console.error(`Error saving field memory for ${field}:`, e);
        }
      }
    });

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
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all shadow-lg shadow-black/5 group shrink-0 ${formData.documents && formData.documents.length > 0 ? 'ring-2 ring-inset ring-emerald-500' : ''}`}
          >
            <div className={`p-2 rounded-lg transition-all ${formData.documents && formData.documents.length > 0 ? 'bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white'}`}>
              {formData.documents && formData.documents.length > 0 ? <FileText size={18} /> : <FilePlus size={18} />}
            </div>
            <div className="text-left">
              <p className="leading-none">{formData.documents && formData.documents.length > 0 ? 'PDF Anexado' : 'Inserir Documentos'}</p>
              <p className="text-[9px] opacity-50 lowercase font-medium mt-1">
                {formData.documents && formData.documents.length > 0 ? '1 documento' : 'anexos e arquivos pdf'}
              </p>
            </div>
          </motion.button>
          
          <motion.button 
            type="button"
            onClick={() => setIsDocModalOpen(true)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 group shrink-0"
          >
            <div className="p-2 rounded-lg bg-white/10 text-white group-hover:scale-110 transition-transform">
              <Printer size={18} />
            </div>
            <div className="text-left">
              <p className="leading-none">Gerar Documentos</p>
              <p className="text-[9px] text-indigo-200 lowercase font-medium mt-1">Capa, Despacho e FATD</p>
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
                <SelectField label="Quadro" icon={Briefcase} value={formData.quadro} onChange={handleChange('quadro')} options={allowedQuadros} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AutocompleteInputField label="SARAM *" icon={User} value={formData.saram} onChange={handleChange('saram')} placeholder="0000000" error={errors.saram} fieldName="saram" />
                <AutocompleteInputField label="Nome Completo *" icon={User} value={formData.nomeCompleto} onChange={handleChange('nomeCompleto')} placeholder="Digite o nome completo do militar" error={errors.nomeCompleto} fieldName="nomeCompleto" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AutocompleteInputField label="Especialidade" icon={Briefcase} value={formData.especialidade} onChange={handleChange('especialidade')} fieldName="especialidade" />
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
              {/* Seção Apurador */}
              <div className="border-b border-slate-100 dark:border-slate-850/50 pb-6 space-y-4">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider ml-1">Identificação do Apurador</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-2">
                    <AutocompleteInputField label="Apurador (Encarregado)" icon={User} value={formData.apurador} onChange={handleChange('apurador')} fieldName="apurador" />
                  </div>
                  <SelectField label="Posto (Apurador)" icon={Shield} value={formData.apuradorPosto} onChange={handleChange('apuradorPosto')} options={optionsPosto} />
                  <SelectField label="Quadro (Apurador)" icon={Briefcase} value={formData.apuradorQuadro} onChange={handleChange('apuradorQuadro')} options={optionsQuadro} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <InputField label="SARAM (Apurador)" icon={User} value={formData.apuradorSaram} onChange={handleChange('apuradorSaram')} placeholder="0000000" error={errors.apuradorSaram} />
                  <div className="hidden md:block md:col-span-3" />
                </div>
              </div>

              {/* Seção Aplicador */}
              <div className="border-b border-slate-100 dark:border-slate-850/50 pb-6 space-y-4">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider ml-1">Identificação do Aplicador</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-2">
                    <AutocompleteInputField label="Autoridade Aplicadora" icon={User} value={formData.aplicador} onChange={handleChange('aplicador')} fieldName="aplicador" />
                  </div>
                  <SelectField label="Posto (Aplicador)" icon={Shield} value={formData.aplicadorPosto} onChange={handleChange('aplicadorPosto')} options={optionsPosto} />
                  <SelectField label="Quadro (Aplicador)" icon={Briefcase} value={formData.aplicadorQuadro} onChange={handleChange('aplicadorQuadro')} options={optionsQuadro} />
                </div>
              </div>

              {/* Seção Documentos de Entrada e Enquadramento */}
              <div className="border-b border-slate-100 dark:border-slate-850/50 pb-6 space-y-4">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider ml-1">Documentação e Enquadramento</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField label="Ofício nº" icon={FileText} value={formData.oficioNumero} onChange={handleChange('oficioNumero')} placeholder="Ex: 123/SEC/2026" />
                  <InputField label="Prot. COMAER nº" icon={FileText} value={formData.protComaer} onChange={handleChange('protComaer')} placeholder="Ex: 60000.000000/2026-00" />
                  <DatePickerField label="Data" value={formData.dataOficio} onChange={handleChange('dataOficio')} />
                </div>
                <TextAreaField label="Enquadramento RDAER" value={formData.enquadramentoRdaer} onChange={handleChange('enquadramentoRdaer')} placeholder="Ex: Artigo 10, item 12, do RDAER (Regulamento de Disciplina da Aeronáutica)..." />
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
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate pr-4">
                          <FileText size={14} className="shrink-0" />
                          <span className="truncate">{doc.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => window.open(doc.url, '_blank')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 transition-all"
                            title="Visualizar Documento"
                          >
                            <FileText size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const url = new URL(doc.url);
                              url.searchParams.append('download', '');
                              window.open(url.toString(), '_blank');
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-500/10 dark:hover:bg-sky-500/20 transition-all"
                            title="Baixar Documento"
                          >
                            <Download size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newHistoryItem = {
                                field: 'Documento PDF',
                                oldValue: `Removido: ${doc.name}`,
                                newValue: '—',
                                user: currentUser?.name || 'Sistema',
                                date: new Date().toLocaleString('pt-BR')
                              };
                              setHistory((prev: any) => [newHistoryItem, ...prev]);

                              setFormData((prev: any) => ({
                                ...prev,
                                documents: prev.documents.filter((_: any, idx: number) => idx !== docIdx)
                              }));
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-all"
                            title="Excluir Documento"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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
      <AnimatePresence>
        {isDocModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDocModalOpen(false)}
              className="absolute inset-0"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl h-[85vh] bg-slate-50 dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col animate-in fade-in zoom-in-95 duration-200"
            >
              {/* Modal Header */}
              <div className="p-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Printer className="text-indigo-600 dark:text-indigo-400" size={20} />
                    Gerador de Documentos Oficiais
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                    Preenchimento automático do PATD e geração de PDF/Impressão
                  </p>
                </div>
                <button 
                  onClick={() => setIsDocModalOpen(false)}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-850 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 flex flex-col md:flex-row min-h-0">
                {/* Tabs Sidebar */}
                <div className="w-full md:w-64 bg-white dark:bg-slate-950/50 p-4 border-r border-slate-200 dark:border-slate-850 flex flex-col justify-between shrink-0">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-2 mb-2">Selecione o Documento</p>
                    <button
                      onClick={() => setActiveDocTab('capa')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-bold transition-all ${
                        activeDocTab === 'capa'
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 font-black scale-102'
                          : 'text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                      }`}
                    >
                      <FileText size={16} />
                      Capa do Processo
                    </button>
                    <button
                      onClick={() => setActiveDocTab('despacho')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-bold transition-all ${
                        activeDocTab === 'despacho'
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 font-black scale-102'
                          : 'text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                      }`}
                    >
                      <FileText size={16} />
                      Despacho de Abertura
                    </button>
                    <button
                      onClick={() => setActiveDocTab('fatd')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-bold transition-all ${
                        activeDocTab === 'fatd'
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 font-black scale-102'
                          : 'text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                      }`}
                    >
                      <FileText size={16} />
                      Formulário FATD
                    </button>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-850/50 hidden md:block">
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal italic">
                      As informações inseridas no formulário ao lado são injetadas em tempo real nos modelos acima configurados conforme os padrões do Comando da Aeronáutica.
                    </p>
                  </div>
                </div>

                {/* Preview Container */}
                <div className="flex-1 bg-slate-100 dark:bg-slate-900/40 p-6 overflow-y-auto custom-scrollbar flex items-center justify-center min-h-0">
                  {(() => {
                    const formatDateStr = (dateStr: string) => {
                      if (!dateStr) return '___/___/_____';
                      const [year, month, day] = dateStr.split('-');
                      return `${day}/${month}/${year}`;
                    };

                    switch(activeDocTab) {
                      case 'capa':
                        return (
                          <div className="bg-white dark:bg-slate-950 p-8 shadow-2xl rounded-2xl text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-850 w-full max-w-[650px] aspect-[1/1.41] flex flex-col justify-between overflow-y-auto my-4" style={{ padding: '10mm 15mm', fontFamily: "'Times New Roman', Times, serif" }}>
                            {/* Outside the bordered frame */}
                            <div className="text-center" style={{ marginBottom: '6mm' }}>
                              <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#000000', margin: '0 0 4px 0' }} className="dark:text-white">Anexo C - Capa</p>
                              <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#ff0000', margin: '0 0 3px 0', letterSpacing: '0.5px' }}>INFORMAÇÃO PESSOAL – ACESSO RESTRITO</p>
                              <p style={{ fontSize: '11px', color: '#ff0000', margin: '0 0 1px 0', fontWeight: 500 }}>Art. 5º, Inciso X, da Constituição Federal do Brasil, de 1988</p>
                              <p style={{ fontSize: '11px', color: '#ff0000', margin: '0 0 1px 0', fontWeight: 500 }}>Art. 31 da Lei nº 12.527, de 2011</p>
                              <p style={{ fontSize: '11px', color: '#ff0000', margin: 0, fontWeight: 500 }}>Arts. 55 a 62 do Decreto nº 7.724, de 2012</p>
                            </div>

                            {/* Bordered Frame */}
                            <div className="border-2 border-black dark:border-slate-800 p-8 flex flex-col justify-between items-center w-full flex-1" style={{ boxSizing: 'border-box' }}>
                              {/* Top Emblem and Headers */}
                              <div className="w-full text-center flex flex-col items-center">
                                <img src="/brasao.png" width="60" height="60" style={{ marginBottom: '8px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
                                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000', margin: '0 0 3px 0', textTransform: 'uppercase' }} className="dark:text-white">Ministério da Defesa</p>
                                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000', margin: '0 0 3px 0', textTransform: 'uppercase' }} className="dark:text-white">Comando da Aeronáutica</p>
                                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000', margin: 0, textTransform: 'uppercase', textDecoration: 'underline' }} className="dark:text-white">Academia da Força Aérea</p>
                              </div>

                              {/* Process Title */}
                              <div className="w-full text-center" style={{ marginTop: '5mm', marginBottom: '5mm' }}>
                                <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#000000', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }} className="dark:text-white">PROCESSO DE APURAÇÃO DE TRANSGRESSÃO DISCIPLINAR</p>
                                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000', margin: 0 }} className="dark:text-white">Nº <span style={{ color: '#000000' }} className="dark:text-white">{formData.patdNumber || '___/___/_____'}</span></p>
                              </div>

                              {/* Footer/Sections inside Frame */}
                              <div className="w-full" style={{ marginBottom: '2mm' }}>
                                {/* Militar Arrolado */}
                                <div className="text-center" style={{ marginBottom: '8mm' }}>
                                  <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#000000', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }} className="dark:text-white">Militar Arrolado</p>
                                  <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#000000', margin: '6px 0 2px 0', textTransform: 'uppercase' }} className="dark:text-white">{formData.nomeCompleto || '___________________________'} - {formData.posto} {formData.quadro}</p>
                                  <div className="border-b border-black dark:border-slate-800 mt-1 mb-1 w-full"></div>
                                </div>

                                {/* Oficial Apurador */}
                                <div className="text-center">
                                  <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#000000', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }} className="dark:text-white">Oficial Apurador</p>
                                  <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#000000', margin: '6px 0 2px 0', textTransform: 'uppercase' }} className="dark:text-white">{formData.apurador || '___________________________'} - {formData.apuradorPosto} {formData.apuradorQuadro}</p>
                                  <div className="border-b border-black dark:border-slate-800 mt-1 mb-1 w-full"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      case 'despacho':
                        return (
                          <div className="bg-white dark:bg-slate-950 shadow-2xl rounded-2xl text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-850 w-full max-w-[650px] aspect-[1/1.41] text-left flex flex-col justify-between overflow-y-auto my-4" style={{ padding: '20mm 15mm 20mm 20mm', fontFamily: "'Times New Roman', Times, serif" }}>
                            <div>
                              <div className="text-center font-bold" style={{ marginBottom: '2mm' }}>
                                <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#000000', margin: '0 0 4px 0' }} className="dark:text-white">Anexo B - Despacho de Abertura e Designação de Apurador</p>
                                <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#ff0000', margin: '0 0 3px 0', letterSpacing: '0.5px' }}>INFORMAÇÃO PESSOAL – ACESSO RESTRITO</p>
                                <p style={{ fontSize: '9px', color: '#ff0000', margin: '0 0 1px 0', fontWeight: 500 }}>Art. 5º, Inciso X, da Constituição Federal do Brasil, de 1988</p>
                                <p style={{ fontSize: '9px', color: '#ff0000', margin: '0 0 1px 0', fontWeight: 500 }}>Art. 31 da Lei nº 12.527, de 2011</p>
                                <p style={{ fontSize: '9px', color: '#ff0000', margin: 0, fontWeight: 500 }}>Arts. 55 a 62 do Decreto nº 7.724, de 2012</p>
                              </div>

                              <div className="w-full text-center flex flex-col items-center" style={{ marginBottom: '15px' }}>
                                <img src="/brasao.png" width="50" height="50" style={{ marginBottom: '8px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
                                <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000', margin: '0 0 2px 0', textTransform: 'uppercase' }} className="dark:text-white">Ministério da Defesa</p>
                                <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000', margin: '0 0 2px 0', textTransform: 'uppercase' }} className="dark:text-white">Comando da Aeronáutica</p>
                                <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#ff0000', margin: 0, textTransform: 'uppercase', textDecoration: 'underline' }} className="dark:text-white">Academia da Força Aérea</p>
                              </div>

                              <div className="body-text text-justify" style={{ fontSize: '12px', lineHeight: '1.5' }}>
                                <p style={{ textIndent: '2.5rem', marginTop: '10px', textAlign: 'justify' }} className="dark:text-white">
                                  Considerando o disposto no art. 1º da Portaria nº 853/SIJ, de 27 de abril de 2026, publicada no Boletim Interno Ostensivo n º 75, de 29 de abril de 2026, que designa oficiais para apurar transgressão disciplinar e autoridades para aplicar punição disciplinar, no âmbito desta Organização Militar, c/c o item 3.1 da ICA 111-6, aprovada pela Portaria GABAER nº 120/GC3 de 9 de julho de 2021, determino a abertura de Processo de Apuração de Transgressão Disciplinar (PATD), com a finalidade de apurar os fatos relatados no Ofício nº <strong>{formData.oficioNumero || '_______'}</strong>, (Prot. COMAER nº <strong>{formData.protComaer || '_______'}</strong>), de <strong>{formatDateStr(formData.dataOficio)}</strong>.
                                </p>
                                
                                <p style={{ textIndent: '2.5rem', marginTop: '10px', textAlign: 'justify' }} className="dark:text-white">
                                  Designo o <strong>{formData.apuradorPosto || ''} {formData.apuradorQuadro || ''} {formData.apurador || '___________________________'}</strong> para, na condição de Oficial Apurador, efetuar a apuração da suposta transgressão disciplinar e propor solução à autoridade competente, com estrita observância dos procedimentos previstos na ICA 111-6, aprovada pela Portaria GABAER nº 120/GC3 de 9 de julho de 2021, e no Decreto nº 76.322, de 22 de setembro de 1975 (RDAER); sem prejuízo das demais funções.
                                </p>
                                
                                <p style={{ textIndent: '2.5rem', marginTop: '10px', textAlign: 'justify' }} className="dark:text-white">
                                  Após apurados os fatos, voltem-me os autos para decisão.
                                </p>
                              </div>

                              <div className="text-right dark:text-white" style={{ marginTop: '15mm', fontSize: '12px', textAlign: 'right' }}>
                                <p>Pirassununga, {new Date().toLocaleDateString('pt-BR', {day: 'numeric', month: 'long', year: 'numeric'})}.</p>
                              </div>
                            </div>
                            
                            <div className="text-center mt-12">
                              <div className="w-56 border-b border-slate-350 dark:border-slate-800 mx-auto mb-2" style={{ width: '200px', marginLeft: 'auto', marginRight: 'auto' }} />
                              <p className="font-bold uppercase text-[12px] text-slate-850 dark:text-slate-100">{formData.aplicadorPosto || ''} {formData.aplicadorQuadro || ''} {formData.aplicador || '___________________________'}</p>
                              <p className="text-[9px] uppercase text-slate-400">Autoridade Aplicadora / Competente</p>
                            </div>
                          </div>
                        );
                      case 'fatd':
                        return (
                          <div className="bg-white dark:bg-slate-950 p-12 shadow-2xl rounded-2xl text-slate-800 dark:text-slate-200 font-serif border border-slate-200 dark:border-slate-850 w-full max-w-[650px] aspect-[1/1.41] text-left flex flex-col justify-between overflow-y-auto my-4">
                            <div>
                              <div className="text-center font-bold">
                                <p className="uppercase text-xs leading-tight tracking-widest text-slate-400 dark:text-slate-500">Ministério da Defesa</p>
                                <p className="uppercase text-sm leading-snug">Comando da Aeronáutica</p>
                                <p className="uppercase text-sm leading-snug text-indigo-600 dark:text-indigo-400 font-black">{formData.divisao || 'Divisão Cadastrada'}</p>
                              </div>
                              
                              <div className="border-b-2 border-double border-slate-350 dark:border-slate-800 my-4" />
                              
                              <div className="text-center font-bold uppercase mt-4">
                                <h3 className="text-xs text-slate-900 dark:text-white font-black">FORMULÁRIO DE APURAÇÃO DE TRANSGRESSÃO DISCIPLINAR (FATD)</h3>
                                <h4 className="text-xs mt-1 text-slate-400 dark:text-slate-500">PATD Nº {formData.patdNumber || '___/___/_____'}</h4>
                              </div>
                              
                              <div className="mt-6 font-bold text-[9px] uppercase tracking-wider bg-slate-100 dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-850">1. IDENTIFICAÇÃO DO MILITAR ACUSADO</div>
                              <table className="w-full text-xs mt-1 border-collapse border border-slate-200 dark:border-slate-850">
                                <tbody>
                                  <tr className="border-b border-slate-200 dark:border-slate-850">
                                    <td className="p-2 border-r border-slate-200 dark:border-slate-850 font-medium" colSpan={2}><strong>NOME COMPLETO:</strong> {formData.nomeCompleto || '___________________________'}</td>
                                    <td className="p-2 font-medium"><strong>SARAM:</strong> {formData.saram || '_______'}</td>
                                  </tr>
                                  <tr className="border-b border-slate-200 dark:border-slate-850">
                                    <td className="p-2 border-r border-slate-200 dark:border-slate-850 font-medium"><strong>POSTO:</strong> {formData.posto}</td>
                                    <td className="p-2 border-r border-slate-200 dark:border-slate-850 font-medium"><strong>QUADRO:</strong> {formData.quadro}</td>
                                    <td className="p-2 font-medium"><strong>ESPECIALIDADE:</strong> {formData.especialidade || '________'}</td>
                                  </tr>
                                  <tr>
                                    <td className="p-2 border-r border-slate-200 dark:border-slate-850 font-medium" colSpan={2}><strong>DIVISÃO:</strong> {formData.divisao}</td>
                                    <td className="p-2 font-medium"><strong>SETOR:</strong> {formData.setor || '_______'}</td>
                                  </tr>
                                </tbody>
                              </table>

                              <div className="mt-6 font-bold text-[9px] uppercase tracking-wider bg-slate-100 dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-850">1.2. DADOS DA APURAÇÃO E DOCUMENTAÇÃO ORIGINÁRIA</div>
                              <table className="w-full text-xs mt-1 border-collapse border border-slate-200 dark:border-slate-850">
                                <tbody>
                                  <tr className="border-b border-slate-200 dark:border-slate-850">
                                    <td className="p-2 border-r border-slate-200 dark:border-slate-850 font-medium"><strong>APURADOR (ENCARREGADO):</strong> {formData.apuradorPosto || ''} {formData.apuradorQuadro || ''} {formData.apurador || '___________________________'}</td>
                                    <td className="p-2 font-medium"><strong>SARAM:</strong> {formData.apuradorSaram || '_______'}</td>
                                  </tr>
                                  <tr className="border-b border-slate-200 dark:border-slate-850">
                                    <td className="p-2 font-medium" colSpan={2}><strong>AUTORIDADE APLICADORA:</strong> {formData.aplicadorPosto || ''} {formData.aplicadorQuadro || ''} {formData.aplicador || '___________________________'}</td>
                                  </tr>
                                  <tr className="border-b border-slate-200 dark:border-slate-850">
                                    <td className="p-2 border-r border-slate-200 dark:border-slate-850 font-medium"><strong>OFÍCIO Nº:</strong> {formData.oficioNumero || '_______'}</td>
                                    <td className="p-2 font-medium"><strong>PROT. COMAER:</strong> {formData.protComaer || '_______'}</td>
                                  </tr>
                                  <tr>
                                    <td className="p-2 border-r border-slate-200 dark:border-slate-850 font-medium"><strong>DATA DO DOCUMENTO:</strong> {formatDateStr(formData.dataOficio)}</td>
                                    <td className="p-2 font-medium"><strong>ENQUADRAMENTO RDAER:</strong> {formData.enquadramentoRdaer || '_______'}</td>
                                  </tr>
                                </tbody>
                              </table>

                              <div className="mt-6 font-bold text-[9px] uppercase tracking-wider bg-slate-100 dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-850">2. DESCRIÇÃO DO FATO DISCIPLINAR (SÍNTESE)</div>
                              <div className="p-3 border border-slate-200 dark:border-slate-850 text-xs text-justify leading-relaxed bg-slate-50 dark:bg-slate-900/50 italic min-h-16 mt-1">
                                {formData.resumoFato || 'Sem fatos cadastrados até o momento.'}
                              </div>

                              <div className="mt-6 font-bold text-[9px] uppercase tracking-wider bg-slate-100 dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-850">3. CIENTIFICAÇÃO E PRAZO PARA DEFESA</div>
                              <div className="p-3 border border-slate-200 dark:border-slate-850 text-xs text-justify leading-relaxed mt-1">
                                Fica o militar arrolado cientificado do fato que lhe é imputado, bem como de que dispõe do prazo regulamentar de <strong>03 (três) dias úteis</strong>, a contar do recebimento deste formulário, para apresentar por escrito sua justificativa de defesa (Defesa Prévia), caso queira, perante o encarregado da apuração.
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mt-8 text-xs">
                              <div className="p-3 border border-slate-200 dark:border-slate-850 rounded-xl">
                                <p className="font-bold">NOTIFICAÇÃO DO ACUSADO:</p>
                                <p className="mt-3">Ciente em: ____/____/________</p>
                                <div className="border-b border-slate-350 dark:border-slate-700 mt-8 w-full" />
                                <p className="text-center mt-1.5 text-[9px] text-slate-400 uppercase tracking-wider">Assinatura do Acusado</p>
                              </div>
                              
                              <div className="p-3 border border-slate-200 dark:border-slate-850 rounded-xl">
                                <p className="font-bold">ENTREGA PELO ENCARREGADO:</p>
                                <p className="mt-3">Entregue em: ____/____/________</p>
                                <div className="border-b border-slate-350 dark:border-slate-700 mt-8 w-full" />
                                <p className="text-center mt-1.5 text-[9px] text-slate-400 uppercase tracking-wider">Assinatura do Encarregado ({formData.apuradorPosto || ''} {formData.apuradorQuadro || ''} {formData.apurador || 'Apurador'})</p>
                              </div>
                            </div>
                          </div>
                        );
                      default:
                        return null;
                    }
                  })()}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-850 flex flex-col sm:flex-row justify-between gap-4 shrink-0">
                <button
                  type="button"
                  onClick={printAllDocuments}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <Printer size={16} />
                  Imprimir Todo o Processo (3 Páginas)
                </button>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => printDocument(activeDocTab)}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
                  >
                    <Printer size={16} />
                    Imprimir Documento Atual
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDocModalOpen(false)}
                    className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}



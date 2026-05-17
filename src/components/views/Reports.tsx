import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart as BarChartIcon, 
  Calendar, 
  Download, 
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Building2,
  User,
  ShieldAlert,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  X,
  ChevronDown
} from 'lucide-react';
import { Process } from './Processes';

const FilterDropdown = ({ label, value, options, onChange }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSelect = (val: string) => {
    setIsOpen(false);
    onChange(val);
  };
  
  return (
    <div className="relative">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold text-[10px] uppercase tracking-wider shadow-sm"
      >
        {label}: <span className="text-indigo-600 dark:text-indigo-400">{value || 'Todos'}</span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/5 dark:bg-black/10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full mt-2 p-1.5 z-50 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 min-w-[180px] max-h-64 overflow-y-auto custom-scrollbar"
            >
              <button 
                type="button"
                onClick={() => handleSelect('')}
                className={`w-full px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${!value ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'}`}
              >
                Todos
              </button>
              {options.map((opt: string) => (
                <button 
                  key={opt}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={`w-full px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all mt-1 ${value === opt ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'}`}
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

interface ReportsProps {
  processes: Process[];
  globalSearchTerm?: string;
  currentUser: any;
}

export default function Reports({ processes, globalSearchTerm = '', currentUser }: ReportsProps) {
  const canFilterAllDivisions = currentUser.role === 'Administrador' || currentUser.role === 'Visualizador';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDivisao, setFilterDivisao] = useState(canFilterAllDivisions ? '' : currentUser.divisao);
  const [filterAno, setFilterAno] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPosto, setFilterPosto] = useState('');
  const [filterPunicao, setFilterPunicao] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Stats calculation
  const stats = useMemo(() => {
    const total = processes.length;
    const completed = processes.filter(p => p.status === 'Concluído').length;
    const inProgress = processes.filter(p => p.status === 'Em Andamento').length;
    const suspended = processes.filter(p => p.status === 'Suspenso').length;
    
    return [
      { label: 'Total de PATDs', value: total, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
      { label: 'Em Andamento', value: inProgress, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
      { label: 'Concluídos', value: completed, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
      { label: 'Suspensos', value: suspended, icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    ];
  }, [processes]);

  // Unique values for filters
  const filterOptions = useMemo(() => ({
    divisoes: Array.from(new Set(processes.map(p => p.divisao))).sort(),
    anos: Array.from(new Set(processes.map(p => new Date(p.dataInicio).getFullYear().toString()))).sort((a, b) => b.localeCompare(a)),
    status: Array.from(new Set(processes.map(p => p.status))).sort(),
    postos: Array.from(new Set(processes.map(p => p.posto))).sort(),
    punicoes: Array.from(new Set(processes.map(p => p.punicao))).filter(Boolean).sort() as string[],
  }), [processes]);

  // Filtered Logic
  const filteredProcesses = useMemo(() => {
    return processes.filter(p => {
      const pAno = new Date(p.dataInicio).getFullYear().toString();
      const pDate = new Date(p.dataInicio).getTime();
      const start = startDate ? new Date(startDate).getTime() : null;
      const end = endDate ? new Date(endDate).getTime() : null;

      const effectiveSearch = globalSearchTerm || searchTerm;

      return (
        (effectiveSearch === '' || p.patdNumber.toLowerCase().includes(effectiveSearch.toLowerCase()) || p.militar.toLowerCase().includes(effectiveSearch.toLowerCase())) &&
        (filterDivisao === '' || p.divisao === filterDivisao) &&
        (filterAno === '' || pAno === filterAno) &&
        (filterStatus === '' || p.status === filterStatus) &&
        (filterPosto === '' || p.posto === filterPosto) &&
        (filterPunicao === '' || p.punicao === filterPunicao) &&
        (!start || pDate >= start) &&
        (!end || pDate <= end)
      );
    });
  }, [processes, searchTerm, globalSearchTerm, filterDivisao, filterAno, filterStatus, filterPosto, filterPunicao, startDate, endDate]);

  const getStatusStyle = (status: Process['status']) => {
    switch (status) {
      case 'Em Andamento': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Concluído': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Suspenso': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const clearFilters = () => {
    setFilterDivisao(canFilterAllDivisions ? '' : currentUser.divisao);
    setFilterAno('');
    setFilterStatus('');
    setFilterPosto('');
    setFilterPunicao('');
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Relatórios e Listagem</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gere relatórios detalhados com filtros avançados de processos.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setShowPreview(true)}
            className="h-11 px-5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-lg active:scale-95 shrink-0 whitespace-nowrap w-full sm:w-auto justify-center"
          >
            <Download size={18} />
            Exportar PDF
          </button>
        </div>
      </header>

      {/* Print Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-5xl h-full overflow-hidden rounded-3xl shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                    <FileText size={18} />
                  </div>
                  <h3 className="font-display font-bold text-slate-800 dark:text-white">Pré-visualização do Relatório</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.print()}
                    className="h-10 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                  >
                    <Download size={16} /> Imprimir / PDF
                  </button>
                  <button 
                    onClick={() => setShowPreview(false)}
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors border border-slate-200 dark:border-slate-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-12 bg-slate-200 dark:bg-slate-950 custom-scrollbar">
                {/* Visual A4 Page */}
                <div className="mx-auto bg-white text-slate-900 w-[210mm] min-h-[297mm] shadow-[0_0_50px_rgba(0,0,0,0.1)] p-[20mm] flex flex-col print:shadow-none print:m-0" id="report-content">
                  {/* Document Header */}
                  <div className="flex flex-col items-center text-center space-y-4 mb-8 border-b-2 border-slate-900 pb-6">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-900 p-1">
                      <img 
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Projetos" 
                        alt="User" 
                        className="w-full h-full object-cover rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="space-y-1">
                      <h1 className="text-xl font-black uppercase tracking-[0.2em]" style={{ fontFamily: 'Arial' }}>Academia da Força Aérea</h1>
                      <h2 className="text-lg uppercase tracking-widest text-slate-700 font-normal" style={{ fontFamily: 'Arial' }}>
                        {filterDivisao || "Relatório Geral de Processos"}
                      </h2>
                    </div>
                    <div className="w-full flex justify-between text-[8px] font-bold text-slate-500 uppercase mt-2">
                      <span>Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</span>
                      <span>Total de Registros: {filteredProcesses.length}</span>
                    </div>
                  </div>

                  {/* PDF Stats Cards */}
                  <div className="grid grid-cols-4 gap-3 mb-8">
                    {stats.map((stat, idx) => {
                      const bgColors = ['#d7e5ff', '#fff1bf', '#caffd6', '#ffc4c4'];
                      return (
                        <div 
                          key={stat.label} 
                          className="p-3 border border-slate-200 rounded-xl flex flex-col items-center text-center"
                          style={{ backgroundColor: bgColors[idx] }}
                        >
                          <p 
                            className={`text-[7px] uppercase tracking-widest mb-1 ${idx === 3 ? 'font-bold' : 'font-black'}`}
                            style={{ color: '#000000' }}
                          >
                            {stat.label}
                          </p>
                          <h3 className="text-sm font-bold text-slate-900">{stat.value}</h3>
                        </div>
                      );
                    })}
                  </div>

                  {/* Document Content Table */}
                  <div className="flex-1">
                    <table className="w-full text-[7px] border-collapse">
                      <thead>
                        <tr className="border-y border-slate-900 bg-slate-50">
                          <th className="py-1.5 px-0.5 text-left font-black uppercase whitespace-nowrap">PATD</th>
                          <th className="py-1.5 px-0.5 text-left font-black uppercase whitespace-nowrap">Divisão/Setor</th>
                          <th className="py-1.5 px-0.5 text-left font-black uppercase whitespace-nowrap">Posto/Esp</th>
                          <th className="py-1.5 px-0.5 text-left font-black uppercase whitespace-nowrap">Militar/SARAM</th>
                          <th className="py-1.5 px-0.5 text-left font-black uppercase whitespace-nowrap">Resumo do Fato</th>
                          <th className="py-1.5 px-0.5 text-left font-black uppercase whitespace-nowrap">Responsáveis</th>
                          <th className="py-1.5 px-0.5 text-left font-black uppercase whitespace-nowrap">Início/Térm</th>
                          <th className="py-1.5 px-0.5 text-center font-black uppercase whitespace-nowrap">Status</th>
                          <th className="py-1.5 px-0.5 text-left font-black uppercase whitespace-nowrap">Punição</th>
                          <th className="py-1.5 px-0.5 text-left font-black uppercase whitespace-nowrap">Data/Bol</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 border-b border-slate-900">
                        {filteredProcesses.map(p => (
                          <tr key={p.id} className="border-b border-slate-100">
                            <td className="py-2 px-0.5 font-bold whitespace-nowrap">{p.patdNumber}</td>
                            <td className="py-2 px-0.5">
                              <div className="flex flex-col leading-tight">
                                <span className="font-bold">{p.divisao}</span>
                                <span className="text-[6px] text-slate-500">{p.setor}</span>
                              </div>
                            </td>
                            <td className="py-2 px-0.5">
                              <div className="flex flex-col leading-tight">
                                <span className="font-bold">{p.posto}</span>
                                <span className="text-[6px] text-indigo-600 font-bold">{p.especialidade}</span>
                              </div>
                            </td>
                            <td className="py-2 px-0.5">
                              <div className="flex flex-col leading-tight">
                                <span className="font-bold">{p.militar}</span>
                                <span className="text-[6px] text-slate-500">{p.saram}</span>
                              </div>
                            </td>
                            <td className="py-2 px-0.5 max-w-[150px]">
                              <p className="italic opacity-80 leading-tight break-words whitespace-normal">{p.resumoFato}</p>
                            </td>
                            <td className="py-2 px-0.5">
                              <div className="flex flex-col gap-0.5 leading-none">
                                <p><span className="font-black text-[5px] uppercase">Ap:</span> {p.apurador}</p>
                                <p><span className="font-black text-[5px] uppercase">Al:</span> {p.aplicador}</p>
                              </div>
                            </td>
                            <td className="py-2 px-0.5 italic whitespace-nowrap">
                              {new Date(p.dataInicio).toLocaleDateString('pt-BR')}<br/>
                              {p.dataTermino ? new Date(p.dataTermino).toLocaleDateString('pt-BR') : '—'}
                            </td>
                            <td className="py-2 px-0.5 text-center">
                              <span className="font-black text-[6px] uppercase px-1 border border-slate-200 rounded-sm inline-block">
                                {p.status}
                              </span>
                            </td>
                            <td className="py-2 px-0.5">
                              <div className="flex flex-col leading-tight">
                                <span className="font-bold text-rose-600 uppercase">{p.punicao || '—'}</span>
                                {p.diasPunicao > 0 && <span className="text-[6px] text-slate-400">{p.diasPunicao} DIAS</span>}
                              </div>
                            </td>
                            <td className="py-2 px-0.5 italic whitespace-nowrap">
                              {p.dataPunicao ? new Date(p.dataPunicao).toLocaleDateString('pt-BR') : '—'}<br/>
                              <span className="font-bold text-slate-900">{p.boletim || '—'}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Document Footer */}
                  <div className="mt-auto pt-8 border-t border-slate-200">
                    <div className="flex justify-between items-end text-[8px] text-slate-500 uppercase font-bold">
                      <div className="flex flex-col gap-1">
                        <span>Impresso por: {currentUser.name}</span>
                        <span>Posto/Cargo: {currentUser.role}</span>
                      </div>
                      <div className="text-right">
                        <p>Documento para uso interno - Academia da Força Aérea</p>
                        <p className="mt-1">Página 1 de 1</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Panel - Always Visible */}
      <div className="p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          {/* Main Filters Group */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-3 bg-indigo-500 rounded-full" />
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtros Categóricos</h3>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {canFilterAllDivisions ? (
                <FilterDropdown 
                  label="Divisão" 
                  value={filterDivisao} 
                  options={filterOptions.divisoes} 
                  onChange={setFilterDivisao} 
                />
              ) : (
                <div className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider shadow-sm opacity-80 cursor-not-allowed">
                  Divisão: <span className="text-slate-700 dark:text-slate-200">{currentUser.divisao}</span>
                </div>
              )}
              <FilterDropdown 
                label="Ano" 
                value={filterAno} 
                options={filterOptions.anos} 
                onChange={setFilterAno} 
              />
              <FilterDropdown 
                label="Status" 
                value={filterStatus} 
                options={filterOptions.status} 
                onChange={setFilterStatus} 
              />
              <FilterDropdown 
                label="Posto" 
                value={filterPosto} 
                options={filterOptions.postos} 
                onChange={setFilterPosto} 
              />
              <FilterDropdown 
                label="Punição" 
                value={filterPunicao} 
                options={filterOptions.punicoes} 
                onChange={setFilterPunicao} 
              />
            </div>
          </div>

          {/* Temporal Group */}
          <div className="space-y-4 pt-6 xl:pt-0 border-t xl:border-t-0 xl:border-l border-slate-100 dark:border-slate-800 xl:pl-6">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={14} className="text-indigo-500" />
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intervalo Temporal</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-all focus-within:border-indigo-500 group">
                <span className="text-[10px] font-black text-slate-400 uppercase">De</span>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent border-none outline-hidden text-[10px] font-bold text-slate-700 dark:text-slate-200 p-0 w-28 uppercase"
                />
              </div>

              <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-all focus-within:border-indigo-500 group">
                <span className="text-[10px] font-black text-slate-400 uppercase">Até</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-none outline-hidden text-[10px] font-bold text-slate-700 dark:text-slate-200 p-0 w-28 uppercase"
                />
              </div>

              {(filterDivisao || filterAno || filterStatus || filterPosto || filterPunicao || startDate || endDate) && (
                <button 
                  onClick={clearFilters}
                  className="h-10 px-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-rose-100 dark:border-rose-900/30"
                  title="Limpar todos os filtros"
                >
                  <X size={14} />
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden relative group"
          >
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${stat.bg} blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700`} />
            <div className={`h-12 w-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 relative z-10`}>
              <stat.icon size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest relative z-10">{stat.label}</p>
            <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white mt-1 relative z-10">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Process List */}
      <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Resultados do Relatório</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredProcesses.length} PATDs encontradas</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Nº PATD</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Divisão</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Posto</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Militar</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Resumo do Fato</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Responsáveis</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Início</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Término</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Punição</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Data Punição</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Boletim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredProcesses.map((p) => (
                <tr key={p.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-4">
                    <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{p.patdNumber}</span>
                  </td>
                  <td className="py-4 px-4">
                     <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight">{p.divisao}</span>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{p.setor}</span>
                     </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase border border-slate-200 dark:border-slate-700 w-fit">
                        {p.posto}
                      </span>
                      <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-tighter mt-0.5">{p.especialidade}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                       <span className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight">{p.militar}</span>
                       <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">SARAM: {p.saram}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 max-w-[200px]">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 italic leading-tight">
                      {p.resumoFato}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Apurador:</span>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 leading-none">{p.apurador}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Aplicador:</span>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 leading-none">{p.aplicador}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[10px] font-bold text-slate-500 whitespace-nowrap">
                    {new Date(p.dataInicio).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-4 px-4 text-[10px] font-bold text-slate-500 whitespace-nowrap">
                    {p.dataTermino ? new Date(p.dataTermino).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border whitespace-nowrap ${getStatusStyle(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {p.punicao ? (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-rose-500">
                          <ShieldAlert size={14} />
                          <span className="text-[10px] font-black uppercase tracking-tighter whitespace-nowrap">{p.punicao}</span>
                        </div>
                        {p.diasPunicao > 0 && (
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5 whitespace-nowrap">
                            {p.diasPunicao} dias de punição
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-300 dark:text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-[10px] font-bold text-slate-500 whitespace-nowrap">
                    {p.dataPunicao ? new Date(p.dataPunicao).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="py-4 px-4 text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase whitespace-nowrap">
                    {p.boletim || '—'}
                  </td>
                </tr>
              ))}
              {filteredProcesses.length === 0 && (
                <tr>
                  <td colSpan={12} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <FileText size={40} className="mb-4" />
                      <p className="text-sm font-bold uppercase tracking-widest">Nenhum processo encontrado para os filtros selecionados</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

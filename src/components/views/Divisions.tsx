import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Upload,
  ShieldCheck,
  Search,
  Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export interface Division {
  id: string;
  name: string;
  description: string;
  image?: string;
  sectors?: string[];
}

interface DivisionsProps {
  divisions: Division[];
  setDivisions: React.Dispatch<React.SetStateAction<Division[]>>;
  isAdmin?: boolean;
  globalSearchTerm?: string;
}

export default function Divisions({ divisions, setDivisions, isAdmin = true, globalSearchTerm = '' }: DivisionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSectorName, setNewSectorName] = useState<{[key: string]: string}>({});
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    sectors: [] as string[]
  });

  const handleOpenModal = (division?: Division) => {
    if (!isAdmin) return;
    if (division) {
      setEditingDivision(division);
      setFormData({
        name: division.name,
        description: division.description,
        image: division.image || '',
        sectors: division.sectors || []
      });
    } else {
      setEditingDivision(null);
      setFormData({ name: '', description: '', image: '', sectors: [] });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDivision(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('divisions')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('divisions')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image: publicUrl }));
    } catch (error) {
      console.error('Error uploading image: ', error);
      alert('Erro ao fazer upload da imagem. Verifique se o bucket "divisions" existe e está configurado corretamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!isAdmin || !formData.name) return;

    try {
      if (editingDivision) {
        const { error } = await supabase.from('divisions').update(formData).eq('id', editingDivision.id);
        if (error) throw error;
        setDivisions(prev => prev.map(d => d.id === editingDivision.id ? { ...d, ...formData } : d));
      } else {
        const { data, error } = await supabase.from('divisions').insert(formData).select().single();
        if (error) throw error;
        if (data) setDivisions(prev => [...prev, data]);
      }
      handleCloseModal();
    } catch (err) {
      console.error('Error saving division:', err);
      alert('Erro ao salvar divisão.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (confirm('Tem certeza que deseja excluir esta divisão? Isso pode afetar processos vinculados.')) {
      try {
        const { error } = await supabase.from('divisions').delete().eq('id', id);
        if (error) throw error;
        setDivisions(prev => prev.filter(d => d.id !== id));
      } catch (err) {
        console.error('Error deleting division:', err);
        alert('Erro ao excluir divisão.');
      }
    }
  };

  const handleAddSector = async (divisionId: string) => {
    if (!isAdmin) return;
    const sectorName = newSectorName[divisionId];
    if (!sectorName?.trim()) return;

    const division = divisions.find(d => d.id === divisionId);
    if (!division) return;
    
    const newSectors = [...(division.sectors || []), sectorName.trim()];

    try {
      const { error } = await supabase.from('divisions').update({ sectors: newSectors }).eq('id', divisionId);
      if (error) throw error;
      
      setDivisions(prev => prev.map(d => d.id === divisionId ? { ...d, sectors: newSectors } : d));
      setNewSectorName(prev => ({ ...prev, [divisionId]: '' }));
    } catch (err) {
      console.error('Error adding sector:', err);
      alert('Erro ao adicionar setor.');
    }
  };

  const handleRemoveSector = async (divisionId: string, sectorIndex: number) => {
    if (!isAdmin) return;
    
    const division = divisions.find(d => d.id === divisionId);
    if (!division) return;
    
    const newSectors = [...(division.sectors || [])];
    newSectors.splice(sectorIndex, 1);

    try {
      const { error } = await supabase.from('divisions').update({ sectors: newSectors }).eq('id', divisionId);
      if (error) throw error;
      
      setDivisions(prev => prev.map(d => d.id === divisionId ? { ...d, sectors: newSectors } : d));
    } catch (err) {
      console.error('Error removing sector:', err);
      alert('Erro ao remover setor.');
    }
  };

  const filteredDivisions = divisions.filter(d => {
    const effectiveSearch = globalSearchTerm || searchTerm;
    return (
      d.name.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      d.description.toLowerCase().includes(effectiveSearch.toLowerCase())
    );
  });

  return (
    <div id="divisions-view" className="max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Building2 className="text-indigo-600" />
            Gerenciamento de Divisões
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Administre as organizações, divisões e sub-unidades do sistema.</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-200 dark:shadow-none font-display uppercase tracking-widest text-xs"
          >
            <Plus size={18} />
            Nova Divisão
          </button>
        )}
      </header>

      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Pesquisar divisões por nome ou sigla..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-14 pl-12 pr-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm focus:outline-hidden focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200 font-medium"
        />
      </div>

      {!isAdmin && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 text-amber-700 dark:text-amber-400 text-sm">
          <ShieldCheck size={20} />
          <p>Apenas administradores podem criar, editar ou excluir divisões. Seu acesso atual é de visualização.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDivisions.map((division) => (
          <motion.div 
            key={division.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative flex flex-col rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all h-[340px]"
          >
            {/* Header Area with Image (Smaller) */}
            <div className="relative h-32 shrink-0 overflow-hidden">
              {division.image ? (
                <img 
                  src={division.image} 
                  alt={division.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-indigo-100 to-indigo-50 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                  <Building2 size={40} className="text-indigo-200 dark:text-slate-700" />
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-4 text-white">
                <h3 className="text-xl font-bold font-display">{division.name}</h3>
                <p className="text-[10px] text-white/70 uppercase tracking-widest font-black truncate max-w-[200px]">{division.description}</p>
              </div>

              {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenModal(division)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-indigo-600 transition-all font-display uppercase tracking-widest"
                  >
                    <Pencil size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(division.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/20 backdrop-blur-md text-white hover:bg-rose-500 transition-all font-display uppercase tracking-widest"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Sectors Content Section */}
            <div className="flex-1 p-4 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Setores Cadastrados</h4>
                <span className="text-[10px] font-bold text-indigo-500">{(division.sectors?.length || 0)} setores</span>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-1.5 mb-3">
                {division.sectors && division.sectors.length > 0 ? (
                  division.sectors.map((sector, sIdx) => (
                    <div key={sIdx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group/sector">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{sector}</span>
                      {isAdmin && (
                        <button 
                          onClick={() => handleRemoveSector(division.id, sIdx)}
                          className="opacity-0 group-hover/sector:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-60 py-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Nenhum setor</p>
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="mt-auto pt-3 border-t border-slate-50 dark:border-slate-800">
                  <div className="relative group/input">
                    <input 
                      type="text"
                      placeholder="Novo setor..."
                      value={newSectorName[division.id] || ''}
                      onChange={(e) => setNewSectorName(prev => ({ ...prev, [division.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSector(division.id)}
                      className="w-full h-9 pl-3 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    />
                    <button 
                      onClick={() => handleAddSector(division.id)}
                      className="absolute right-1 top-1 h-7 w-7 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-sm"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                  {editingDivision ? 'Editar Divisão' : 'Nova Divisão'}
                </h3>
                <button 
                  onClick={handleCloseModal}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="relative group">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Imagem em JPEG, PNG</label>
                    <div className="h-40 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-800 relative group-hover:border-indigo-400 dark:group-hover:border-indigo-500 transition-all overflow-hidden flex flex-col items-center justify-center text-slate-400">
                      {isUploading ? (
                        <div className="flex flex-col items-center justify-center">
                          <Loader2 className="animate-spin mb-2 text-indigo-500" size={32} />
                          <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">Enviando...</p>
                        </div>
                      ) : formData.image ? (
                        <>
                          <img src={formData.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                          <button 
                            onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                            className="absolute top-2 right-2 h-8 w-8 rounded-lg bg-black/50 text-white flex items-center justify-center hover:bg-rose-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <Upload size={32} className="mb-2" />
                          <p className="text-xs font-bold uppercase tracking-wider">Clique para Upload</p>
                          <input 
                            type="file" 
                            accept="image/jpeg, image/png"
                            onChange={handleImageUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome/Sigla da Divisão</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                      placeholder="Ex: DOA, GLOG-YS"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descrição</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full h-24 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium resize-none"
                      placeholder="Breve descrição da divisão..."
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleCloseModal}
                    className="flex-1 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-200 transition-all font-display uppercase tracking-widest"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isUploading}
                    className="flex-1 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 font-display uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Salvar
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

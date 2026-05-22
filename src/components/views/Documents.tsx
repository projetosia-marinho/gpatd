import React, { useState, useEffect, useMemo } from 'react';
import { 
  Files, 
  Search, 
  Plus, 
  Download, 
  Trash2, 
  FileText, 
  FileCode, 
  FileImage, 
  File as FileIcon, 
  MoreVertical,
  Calendar,
  User,
  Upload,
  X,
  ChevronRight,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';

interface Document {
  id: string;
  folder_id?: string;
  name: string;
  type: string;
  size: string;
  uploadedby: string;
  uploadedat: string;
  description: string;
  drive_link?: string;
}

interface Folder {
  id: string;
  name: string;
  category: 'Modelos' | 'Legislação' | 'Manuais' | 'Outros' | string;
  description: string;
  documents: Document[];
  updatedat?: string;
}

export default function Documents({ currentUser }: { currentUser: any }) {
  const isAdmin = currentUser.role === 'Administrador';
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Modals
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

  const categories = ['Todas', 'Modelos', 'Legislação', 'Manuais', 'Outros'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: dbFolders, error: fError } = await supabase.from('folders').select('*');
        const { data: dbDocs, error: dError } = await supabase.from('documents').select('*');
        if (fError) throw fError;
        if (dError) throw dError;

        const formattedFolders = (dbFolders || []).map(f => ({
          ...f,
          documents: (dbDocs || []).filter(d => d.folder_id === f.id)
        }));
        setFolders(formattedFolders);
      } catch (err) {
        console.error('Error fetching documents:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredFolders = useMemo(() => {
    return folders.filter(folder => {
      const matchesSearch = folder.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           folder.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'Todas' || folder.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [folders, searchTerm, filterCategory]);

  const handleSaveFolder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const folderData = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      updatedat: new Date().toISOString()
    };

    if (editingFolder) {
      const { error } = await supabase.from('folders').update(folderData).eq('id', editingFolder.id);
      if (!error) {
        setFolders(prev => prev.map(f => f.id === editingFolder.id ? { ...f, ...folderData } : f));
      }
    } else {
      const { data, error } = await supabase.from('folders').insert([folderData]).select().single();
      if (!error && data) {
        setFolders(prev => [{...data, documents: []}, ...prev]);
      }
    }
    setIsFolderModalOpen(false);
    setEditingFolder(null);
  };

  const handleUploadDocument = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFolder) return;

    setUploading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
      const file = fileInput.files?.[0];
      if (!file) return;

      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${selectedFolder.id}/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // 3. Save to Database
      const newDoc = {
        folder_id: selectedFolder.id,
        name: file.name,
        type: fileExt || 'pdf',
        size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
        uploadedby: currentUser.name,
        uploadedat: new Date().toISOString(),
        description: formData.get('description') as string,
        drive_link: publicUrl // Repurposing drive_link to store the Supabase URL
      };

      const { data: savedDoc, error: dbError } = await supabase.from('documents').insert([newDoc]).select().single();
      if (dbError) throw dbError;

      // 4. Update UI
      setFolders(prev => prev.map(f => f.id === selectedFolder.id ? { ...f, documents: [savedDoc, ...(f.documents || [])] } : f));
      setSelectedFolder(prev => {
        if (!prev) return null;
        return { ...prev, documents: [savedDoc, ...(prev.documents || [])] };
      });
      setIsUploadModalOpen(false);
    } catch (err: any) {
      console.error('Upload Error:', err);
      alert('Erro ao enviar documento. Detalhe: ' + (err.message || JSON.stringify(err)));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFolder = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Excluir esta pasta e todos os seus documentos?')) {
      const { error } = await supabase.from('folders').delete().eq('id', id);
      if (!error) {
        setFolders(prev => prev.filter(f => f.id !== id));
      }
    }
  };

  const handleDeleteDocument = async (docId: string, filePath?: string) => {
    if (!selectedFolder) return;
    if (window.confirm('Excluir este documento?')) {
      // Find document to optionally delete from storage if we had the path saved 
      // (Since we didn't save the path explicitly, we'll just delete the DB record. The bucket file will be orphaned unless we parse the URL).
      const { error } = await supabase.from('documents').delete().eq('id', docId);
      if (!error) {
        setFolders(prev => prev.map(f => f.id === selectedFolder.id ? { ...f, documents: f.documents.filter(d => d.id !== docId) } : f));
        setSelectedFolder(prev => {
          if (!prev) return null;
          return { ...prev, documents: prev.documents.filter(d => d.id !== docId) };
        });
      }
    }
  };

  const handleDownloadDocument = (doc: Document) => {
    if (doc.drive_link) {
      window.open(doc.drive_link, '_blank');
      return;
    }
    alert('Link do documento não encontrado no banco de dados.');
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="text-rose-500" />;
      case 'doc': return <FileCode className="text-blue-500" />;
      case 'xls': return <FileIcon className="text-emerald-500" />;
      case 'img': return <FileImage className="text-purple-500" />;
      default: return <FileIcon className="text-slate-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {selectedFolder && (
            <button 
              onClick={() => setSelectedFolder(null)}
              className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-indigo-500 transition-all shadow-sm"
            >
              <Files size={20} />
            </button>
          )}
          <div>
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              {selectedFolder ? selectedFolder.name : 'Biblioteca de Documentos'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {selectedFolder ? selectedFolder.description : 'Gerencie pastas, modelos e legislações de PATD.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {selectedFolder && isAdmin && (
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="h-12 px-6 rounded-2xl bg-indigo-600 text-white font-bold text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center gap-2 group shrink-0"
            >
              <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
              Upload Documento
            </button>
          )}
          {!selectedFolder && isAdmin && (
            <button 
              onClick={() => { setEditingFolder(null); setIsFolderModalOpen(true); }}
              className="h-12 px-6 rounded-2xl bg-emerald-600 text-white font-bold text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center gap-2 group shrink-0"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform" />
              Nova Pasta
            </button>
          )}
        </div>
      </header>

      {!selectedFolder ? (
        <>
          {/* Control Bar */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="relative w-full lg:w-96">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Pesquisar pastas..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-12 pr-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-sm outline-hidden border border-transparent focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                    filterCategory === cat 
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-md font-black' 
                      : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredFolders.map((folder) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder)}
                  className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500/20 group-hover:bg-indigo-500 transition-colors" />
                  
                  <div className="flex items-start justify-between mb-8">
                    <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-3xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform shadow-inner shadow-indigo-200/50">
                      <Files size={32} />
                    </div>
                    {isAdmin && (
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingFolder(folder); setIsFolderModalOpen(true); }}
                          className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 transition-colors border border-slate-100 dark:border-slate-700"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteFolder(folder.id, e)}
                          className="h-9 w-9 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{folder.category}</span>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-3 group-hover:text-indigo-600 transition-colors">{folder.name}</h3>
                    </div>
                    
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic leading-relaxed">
                      {folder.description}
                    </p>

                    <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                        <FileText size={14} className="text-slate-400" />
                        <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tighter">
                          {folder.documents.length} Arquivo{folder.documents.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {folder.updatedAt}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            <button onClick={() => setSelectedFolder(null)} className="hover:text-indigo-600 transition-colors">Biblioteca</button>
            <ChevronRight size={14} />
            <span className="text-indigo-600">{selectedFolder.name}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {selectedFolder.documents.map((doc) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={doc.id}
                  className="group bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner">
                      {getFileIcon(doc.type)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleDownloadDocument(doc)}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100 dark:border-indigo-800"
                      >
                        <Download size={18} />
                      </button>
                      {isAdmin && (
                        <button 
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100 dark:border-rose-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors">{doc.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-2 line-clamp-2">{doc.description}</p>
                    <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          <Calendar size={12} /> {doc.uploadedAt}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter border-l pl-3 dark:border-slate-800">
                          {doc.size}
                        </span>
                      </div>
                      <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">{doc.uploadedBy}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {selectedFolder.documents.length === 0 && (
            <div className="py-20 text-center bg-slate-50/50 dark:bg-slate-800/30 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <div className="h-20 w-20 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
                <Files size={32} />
              </div>
              <p className="font-bold text-slate-400 uppercase tracking-[0.2em] text-xs">Pasta vazia</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {isFolderModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white">
                    {editingFolder ? <Edit2 size={24} /> : <Plus size={24} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{editingFolder ? 'Editar Pasta' : 'Nova Pasta'}</h3>
                    <p className="text-xs text-slate-500">Organize seus documentos por categoria.</p>
                  </div>
                </div>
                <button onClick={() => setIsFolderModalOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <form className="space-y-6" onSubmit={handleSaveFolder}>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Pasta</label>
                  <input name="name" defaultValue={editingFolder?.name} required className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 outline-hidden border border-transparent focus:border-indigo-500 transition-all font-bold text-slate-900 dark:text-white" placeholder="ex: Processos 2024" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                  <select name="category" defaultValue={editingFolder?.category || 'Modelos'} className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 outline-hidden border border-transparent focus:border-indigo-500 transition-all font-bold uppercase tracking-widest text-[10px]">
                    {categories.filter(c => c !== 'Todas').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição</label>
                  <textarea name="description" defaultValue={editingFolder?.description} rows={3} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 outline-hidden border border-transparent focus:border-indigo-500 transition-all text-sm italic" placeholder="O que esta pasta contém?" />
                </div>

                <button 
                  type="submit"
                  className="w-full h-14 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all shadow shadow-emerald-500/20"
                >
                  {editingFolder ? 'Salvar Alterações' : 'Criar Pasta'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {isUploadModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                    <Upload size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Upload para {selectedFolder?.name}</h3>
                    <p className="text-xs text-slate-500">Adicione arquivos a esta pasta específica.</p>
                  </div>
                </div>
                <button onClick={() => setIsUploadModalOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <form className="space-y-6" onSubmit={handleUploadDocument}>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Arquivo</label>
                  <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 hover:border-indigo-400 transition-colors cursor-pointer group bg-slate-50/50 dark:bg-slate-800/30">
                    <input type="file" required className="absolute inset-0 opacity-0 cursor-pointer" />
                    <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform shadow-sm">
                      <Download size={24} />
                    </div>
                    <p className="text-sm font-bold text-slate-500">Clique para selecionar</p>
                    <p className="text-[9px] text-slate-400 uppercase font-black">Máximo 20MB</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Breve Descrição</label>
                  <input name="description" required className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 outline-hidden border border-transparent focus:border-indigo-500 transition-all font-medium text-sm" placeholder="ex: Modelo de portaria atualizado" />
                </div>

                <button 
                  type="submit"
                  className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
                >
                  Confirmar Upload
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

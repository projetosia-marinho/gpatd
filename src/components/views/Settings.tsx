import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  User, Bell, Shield, Settings as SettingsIcon, Save, Moon, Sun,
  Mail, Phone, Hash, Building2, CheckCircle2, Eye, EyeOff, Lock
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface SettingsProps {
  currentUser: any;
  onProfileUpdate?: (updated: any) => void;
}

export default function Settings({ currentUser, onProfileUpdate }: SettingsProps) {
  const { theme, toggleTheme } = useTheme();
  const { session } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    name: currentUser?.name || '',
    posto: currentUser?.posto || '',
    saram: currentUser?.saram || '',
    email: currentUser?.email || session?.user?.email || '',
    telefone: currentUser?.telefone || '',
    ramal: currentUser?.ramal || '',
    divisao: currentUser?.divisao || '',
  });

  // Password state
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });

  // Notification state
  const [notifications, setNotifications] = useState({
    enabled: true,
    emailNotifications: false,
    criticalAlerts: true,
    processUpdates: true,
  });

  // Workspace state
  const [workspace, setWorkspace] = useState({
    autoSave: true,
    itemsPerPage: 20,
    dateFormat: 'DD/MM/YYYY',
    language: 'pt-BR',
  });

  // Load settings from Supabase
  useEffect(() => {
    if (!session?.user?.id) return;
    const load = async () => {
      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      if (data) {
        setNotifications(prev => ({
          ...prev,
          enabled: data.notifications_enabled ?? true,
          emailNotifications: data.email_notifications ?? false,
        }));
        setWorkspace(prev => ({
          ...prev,
          autoSave: data.auto_save ?? true,
          itemsPerPage: data.items_per_page ?? 20,
          dateFormat: data.date_format ?? 'DD/MM/YYYY',
          language: data.language ?? 'pt-BR',
        }));
      }
    };
    load();
  }, [session]);

  useEffect(() => {
    if (currentUser) {
      setProfile({
        name: currentUser.name || '',
        posto: currentUser.posto || '',
        saram: currentUser.saram || '',
        email: currentUser.email || session?.user?.email || '',
        telefone: currentUser.telefone || '',
        ramal: currentUser.ramal || '',
        divisao: currentUser.divisao || '',
      });
    }
  }, [currentUser, session]);

  const showSaveMessage = (msg: string) => {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          telefone: profile.telefone,
          ramal: profile.ramal,
        })
        .eq('id', currentUser.id);
      if (error) throw error;
      onProfileUpdate?.({ ...currentUser, ...profile });
      showSaveMessage('Perfil atualizado com sucesso!');
    } catch (err: any) {
      showSaveMessage(`Erro: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword.length < 6) {
      showSaveMessage('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showSaveMessage('As senhas não coincidem.');
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
      if (error) throw error;
      setPasswordData({ newPassword: '', confirmPassword: '' });
      showSaveMessage('Senha alterada com sucesso!');
    } catch (err: any) {
      showSaveMessage(`Erro: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!session?.user?.id) return;
    setIsSaving(true);
    try {
      const payload = {
        user_id: session.user.id,
        notifications_enabled: notifications.enabled,
        email_notifications: notifications.emailNotifications,
        auto_save: workspace.autoSave,
        items_per_page: workspace.itemsPerPage,
        date_format: workspace.dateFormat,
        language: workspace.language,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from('user_settings')
        .upsert(payload, { onConflict: 'user_id' });
      if (error) throw error;
      showSaveMessage('Configurações salvas com sucesso!');
    } catch (err: any) {
      showSaveMessage(`Erro: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    { id: 'profile', icon: User, title: 'Perfil', desc: 'Informações pessoais' },
    { id: 'security', icon: Shield, title: 'Segurança', desc: 'Senha e acesso' },
    { id: 'notifications', icon: Bell, title: 'Notificações', desc: 'Alertas e avisos' },
    { id: 'workspace', icon: SettingsIcon, title: 'Espaço de Trabalho', desc: 'Preferências do app' },
  ];

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div id="settings-view" className="max-w-5xl mx-auto space-y-8 pb-10">
      <header>
        <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-white">Configurações</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure as preferências do seu espaço de trabalho.</p>
      </header>

      {/* Save Message */}
      {saveMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-2 ${saveMsg.startsWith('Erro') ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 border border-rose-200 dark:border-rose-800' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-200 dark:border-emerald-800'}`}
        >
          <CheckCircle2 size={18} />
          {saveMsg}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all text-left ${
                activeSection === s.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800'
              }`}
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                activeSection === s.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
              }`}>
                <s.icon size={20} />
              </div>
              <div>
                <p className={`text-sm font-bold ${activeSection === s.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>{s.title}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
          >
            {/* PROFILE SECTION */}
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-display font-bold text-slate-800 dark:text-white">Perfil</h3>
                  <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Gerencie suas informações pessoais</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Nome Completo</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input value={profile.name} onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">E-mail</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input value={profile.email} disabled
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-500 cursor-not-allowed" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Posto</label>
                    <div className="relative">
                      <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input value={profile.posto} disabled
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-500 cursor-not-allowed" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">SARAM</label>
                    <div className="relative">
                      <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input value={profile.saram} disabled
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-500 cursor-not-allowed" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Telefone</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input value={profile.telefone} onChange={(e) => setProfile(p => ({ ...p, telefone: e.target.value }))} placeholder="(00) 00000-0000"
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Ramal</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input value={profile.ramal} onChange={(e) => setProfile(p => ({ ...p, ramal: e.target.value }))} placeholder="0000"
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Divisão</label>
                    <div className="relative">
                      <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input value={profile.divisao} disabled
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-500 cursor-not-allowed" />
                    </div>
                  </div>
                </div>
                <button onClick={handleSaveProfile} disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50">
                  <Save size={16} /> {isSaving ? 'Salvando...' : 'Salvar Perfil'}
                </button>
              </div>
            )}

            {/* SECURITY SECTION */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-display font-bold text-slate-800 dark:text-white">Segurança</h3>
                  <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Altere sua senha de acesso</p>
                </div>
                <div className="max-w-md space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Nova Senha</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type={showPassword ? 'text' : 'password'} value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(p => ({ ...p, newPassword: e.target.value }))} placeholder="Mínimo 6 caracteres"
                        className="w-full h-11 pl-10 pr-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Confirmar Senha</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type={showPassword ? 'text' : 'password'} value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="Repita a nova senha"
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                    </div>
                  </div>
                </div>
                <button onClick={handleChangePassword} disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50">
                  <Shield size={16} /> {isSaving ? 'Salvando...' : 'Alterar Senha'}
                </button>
              </div>
            )}

            {/* NOTIFICATIONS SECTION */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-display font-bold text-slate-800 dark:text-white">Notificações</h3>
                  <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Configure alertas e atualizações</p>
                </div>
                <div className="space-y-4">
                  {[
                    { key: 'enabled', label: 'Notificações do Sistema', desc: 'Receba alertas dentro do aplicativo.' },
                    { key: 'criticalAlerts', label: 'Alertas Críticos', desc: 'Notificações sobre processos com atraso ou suspensos.' },
                    { key: 'processUpdates', label: 'Atualizações de Processos', desc: 'Aviso quando um processo for alterado.' },
                    { key: 'emailNotifications', label: 'Notificações por E-mail', desc: 'Receba resumos por e-mail (quando disponível).' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.label}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{item.desc}</p>
                      </div>
                      <Toggle checked={(notifications as any)[item.key]} onChange={(v) => setNotifications(prev => ({ ...prev, [item.key]: v }))} />
                    </div>
                  ))}
                </div>
                <button onClick={handleSaveSettings} disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50">
                  <Save size={16} /> {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                </button>
              </div>
            )}

            {/* WORKSPACE SECTION */}
            {activeSection === 'workspace' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-display font-bold text-slate-800 dark:text-white">Espaço de Trabalho</h3>
                  <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Preferências globais do aplicativo</p>
                </div>

                {/* Theme Toggle */}
                <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-amber-100 text-amber-600'}`}>
                      {theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Tema da Interface</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        Atual: {theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
                      </p>
                    </div>
                  </div>
                  <button onClick={toggleTheme}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all">
                    Alternar Tema
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Salvamento Automático</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Salvar rascunhos automaticamente ao preencher formulários.</p>
                    </div>
                    <Toggle checked={workspace.autoSave} onChange={(v) => setWorkspace(prev => ({ ...prev, autoSave: v }))} />
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Itens por Página</label>
                    <select value={workspace.itemsPerPage} onChange={(e) => setWorkspace(prev => ({ ...prev, itemsPerPage: Number(e.target.value) }))}
                      className="mt-2 w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                      <option value={10}>10 itens</option>
                      <option value={20}>20 itens</option>
                      <option value={50}>50 itens</option>
                      <option value={100}>100 itens</option>
                    </select>
                  </div>
                </div>

                <button onClick={handleSaveSettings} disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50">
                  <Save size={16} /> {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

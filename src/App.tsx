import React, { useState, useEffect } from 'react';
import Shell from './components/layout/Shell';
import Dashboard from './components/layout/Dashboard';
import AIChat from './components/ai/AIChat';
import Tasks from './components/tasks/Tasks';
import NewPATD from './components/views/NewPATD';
import Processes from './components/views/Processes';
import Divisions, { Division } from './components/views/Divisions';
import Users from './components/views/Users';
import Reports from './components/views/Reports';
import Documents from './components/views/Documents';
import { User as UserType } from './components/views/Users';
import { Shield, Bell, User, Files } from 'lucide-react';
import Settings from './components/views/Settings';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import { supabase } from './lib/supabase';

// Settings component imported from ./components/views/Settings

import { HistoryItem, Process } from './components/views/Processes';

const initialMockProcesses: Process[] = [
  { 
    id: '1', 
    patdNumber: '001/DOA/2024', 
    militar: 'S1 Silva', 
    saram: '6543210', 
    posto: 'S1', 
    especialidade: 'BEI', 
    quadro: 'QADP',
    divisao: 'DOA', 
    setor: 'Seção de Pessoal', 
    dataInicio: '2024-01-10', 
    dataTermino: '2024-01-25',
    dataPunicao: '2024-01-25',
    status: 'Concluído', 
    punicao: 'Repreensão Escrito', 
    diasPunicao: 0,
    boletim: 'BI 12/2024',
    resumoFato: 'O militar em tela deixou de realizar a conferência do material de serviço conforme as normas vigentes da seção, resultando em um atraso na passagem do turno subsequente.',
    apurador: 'Maj Freitas',
    aplicador: 'TC Arantes',
    history: [
      { id: 'h1', date: '2024-01-10', action: 'Abertura', description: 'PATD iniciado por infração disciplinar leve.', user: 'Sgt Ferreira' },
      { id: 'h2', date: '2024-01-15', action: 'Defesa Apresentada', description: 'O militar apresentou justificativas alegando sobrecarga no setor.', user: 'S1 Silva' },
      { id: 'h3', date: '2024-01-20', action: 'Julgamento', description: 'Justificativas não aceitas integralmente.', user: 'Maj Freitas' },
      { id: 'h4', date: '2024-01-25', action: 'Conclusão', description: 'Aplicação de sanção: Repreensão por Escrito.', user: 'TC Arantes' },
    ]
  },
  { 
    id: '2', 
    patdNumber: '002/GLOG/2024', 
    militar: 'S2 Oliveira', 
    saram: '7654321', 
    posto: 'S2', 
    especialidade: 'BMT',
    quadro: 'QADP',
    divisao: 'GLOG-YS', 
    setor: 'Oficina de Motores', 
    dataInicio: '2024-02-15', 
    status: 'Em Andamento', 
    punicao: 'Em Branco', 
    diasPunicao: 0,
    boletim: '',
    resumoFato: 'Indício de irregularidade na prestação de contas de peças sobressalentes da oficina de motores no período de 01 a 10 de fevereiro.',
    apurador: 'Cap Mendonça',
    aplicador: 'Maj Antunes',
    history: [
      { id: 'h1', date: '2024-02-15', action: 'Abertura', description: 'Início da apuração de fatos.', user: 'Ten Costa' },
      { id: 'h2', date: '2024-02-20', action: 'Oitiva', description: 'Ouvido o militar sobre as divergências encontradas.', user: 'Cap Mendonça' },
    ]
  },
  { 
    id: '3', 
    patdNumber: '003/GSD/2024', 
    militar: '3S Costa', 
    saram: '8765432', 
    posto: '3S', 
    especialidade: 'SGS',
    quadro: 'QSS',
    divisao: 'GSD-YS', 
    setor: 'Guarda do Portão', 
    dataInicio: '2024-03-05', 
    dataTermino: '2024-03-15',
    dataPunicao: '2024-03-10',
    status: 'Suspenso', 
    punicao: 'Prisão Sem Svç', 
    diasPunicao: 8,
    boletim: 'BI 45/2024',
    resumoFato: 'Abandono de posto de serviço no portão principal por período superior a 30 minutos sem autorização do oficial de dia.',
    apurador: 'Maj Borges',
    aplicador: 'Cel Rocha',
    history: [
      { id: 'h1', date: '2024-03-05', action: 'Abertura', description: 'Flagrante de abandono de posto.', user: 'Ten Moura' },
      { id: 'h2', date: '2024-03-10', action: 'Suspensão', description: 'Processo suspenso aguardando laudo pericial.', user: 'Maj Borges' },
    ]
  },
  { 
    id: '4', 
    patdNumber: '004/CCAER/2024', 
    militar: 'CD Almeida', 
    saram: '9876543', 
    posto: 'CD', 
    especialidade: 'ALU',
    quadro: 'CFO',
    divisao: 'CCAER', 
    setor: 'Corpo de Alunos', 
    dataInicio: '2024-03-12', 
    status: 'Em Andamento', 
    punicao: 'Em Branco', 
    diasPunicao: 0,
    boletim: '',
    resumoFato: 'Apresentação com uniforme em desalinho reiteradas vezes após advertências verbais.',
    apurador: 'Ten Braga',
    aplicador: 'Cap Nunes',
    history: [
      { id: 'h1', date: '2024-03-12', action: 'Abertura', description: 'Infração disciplinar cometida no pátio de formaturas.', user: 'Ten Braga' },
    ]
  },
];

const initialDivisions: Division[] = [
  { id: '1', name: 'DOA', description: 'Divisão de Operações Aéreas', sectors: ['Seção de Pessoal', 'Seção de Operações', 'Seção de Inteligência'] },
  { id: '2', name: 'GLOG-YS', description: 'Grupo de Logística de Pirassununga', sectors: ['Oficina de Motores', 'Seção de Suprimento', 'Transporte'] },
  { id: '3', name: 'GSD-YS', description: 'Grupo de Segurança e Defesa de Pirassununga', sectors: ['Guarda do Portão', 'Canil', 'Pelotão de Operações Especiais'] },
  { id: '4', name: 'CCAER', description: 'Corpo de Cadetes da Aeronáutica', sectors: ['Corpo de Alunos', 'Seção de Instrução Prática'] },
  { id: '5', name: 'GSAU-YS', description: 'Grupo de Saúde de Pirassununga', sectors: ['Ambulatório', 'Farmácia', 'Fisioterapia'] },
  { id: '6', name: 'CDEF', description: 'Comissão de Desporto de Educação Física', sectors: ['Ginásio', 'Piscina'] },
  { id: '7', name: 'EC', description: 'Esquadrão de Comando', sectors: ['Secretaria', 'Ajudância'] },
];

const initialUsers: UserType[] = [
  { id: '1', name: 'Cap Marinho', posto: 'Cap', saram: '1234567', divisao: 'Comando', role: 'Administrador', status: 'Ativo', lastAccess: '2024-05-15 10:30' },
  { id: '2', name: 'Maj Freitas', posto: 'Maj', saram: '6543210', divisao: 'DOA', role: 'Operador', status: 'Ativo', lastAccess: '2024-05-14 16:45' },
  { id: '3', name: 'Ten Costa', posto: 'Ten', saram: '7654321', divisao: 'GLOG-YS', role: 'Operador', status: 'Ativo', lastAccess: '2024-05-15 08:15' },
  { id: '4', name: 'Sgt Ferreira', posto: 'Sgt', saram: '8765432', divisao: 'DOA', role: 'Operador', status: 'Inativo', lastAccess: '2024-04-20 09:00' },
  { id: '5', name: 'Cel Rocha', posto: 'Cel', saram: '2345678', divisao: 'Comando', role: 'Visualizador', status: 'Ativo', lastAccess: '2024-05-10 14:20' },
];

export default function App() {
  const { session, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [processes, setProcesses] = useState<Process[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    if (!session) return;
    
    const fetchData = async () => {
      try {
        const [divsRes, profilesRes, procRes] = await Promise.all([
          supabase.from('divisions').select('*').order('created_at', { ascending: true }),
          supabase.from('profiles').select('*').order('created_at', { ascending: true }),
          supabase.from('processes').select('*').order('created_at', { ascending: false })
        ]);
        
        if (divsRes.data) setDivisions(divsRes.data);
        if (profilesRes.data) {
          // Map to match frontend camelCase if needed, here frontend uses lowercase names like 'name', 'posto', 'saram' which match DB except last_access
          setUsers(profilesRes.data.map(u => ({
            ...u,
            lastAccess: u.last_access ? new Date(u.last_access).toLocaleString() : 'Nunca'
          })));
        }
        if (procRes.data) {
          setProcesses(procRes.data.map(p => ({
            ...p,
            patdNumber: p.patd_number,
            dataInicio: p.data_inicio,
            dataTermino: p.data_termino,
            dataPunicao: p.data_punicao,
            diasPunicao: p.dias_punicao,
            resumoFato: p.resumo_fato,
            nGrade: p.n_grade,
            observacoes: p.observacoes,
            resumoPunicao: p.resumo_punicao
          })));
        }
      } catch (err) {
        console.error('Error fetching data from Supabase:', err);
      }
    };
    
    fetchData();

    const processChannel = supabase.channel('public:processes')
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'processes' }, (payload) => {
        setProcesses(prev => prev.filter(p => p.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(processChannel);
    };
  }, [session]);
  const [editingProcess, setEditingProcess] = useState<any>(null);
  const [processFilter, setProcessFilter] = useState<string>('');
  
  // Create a dynamic current user based on the authenticated email
  const currentUser = React.useMemo<UserType>(() => {
    const defaultUser: UserType = {
      id: session?.user?.id || 'guest',
      name: 'Guest',
      posto: '',
      saram: '',
      divisao: '',
      role: 'Visualizador',
      status: 'Ativo',
      lastAccess: 'Nunca'
    };
    if (!session?.user?.email) return defaultUser;
    
    // Check if there is a registered user with this email
    const registeredUser = users.find(u => u.email?.toLowerCase() === session.user.email?.toLowerCase() || u.id === session.user.id);
    
    if (registeredUser) {
      return registeredUser;
    }
    
    // Fallback: create name from email if not registered
    const emailParts = session.user.email.split('@')[0];
    const formattedName = emailParts
      .split(/[._-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    return {
      ...defaultUser,
      name: formattedName,
      email: session.user.email
    };
  }, [session, users]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  const handleEditProcess = (process: any) => {
    if (currentUser.role === 'Visualizador') return;
    setEditingProcess(process);
    setActiveTab('novo-patd');
  };

  const handleNewPATD = () => {
    if (currentUser.role === 'Visualizador') return;
    setEditingProcess(null);
    setActiveTab('novo-patd');
  };

  const handleSaveProcess = async (newProcessData: any) => {
    // Cancellation
    if (newProcessData === null) {
      setActiveTab('processos');
      return;
    }

    try {
      const dbPayload = {
        patd_number: newProcessData.patdNumber || '000/UNKNOWN/2024',
        militar: newProcessData.nomeCompleto || newProcessData.militar,
        saram: newProcessData.saram,
        posto: newProcessData.posto,
        especialidade: newProcessData.especialidade,
        quadro: newProcessData.quadro,
        divisao: newProcessData.divisao,
        setor: newProcessData.setor,
        data_inicio: newProcessData.dataInicio || new Date().toISOString().split('T')[0],
        data_termino: newProcessData.dataTermino || null,
        data_punicao: newProcessData.dataPunicao || null,
        status: newProcessData.status,
        punicao: newProcessData.punicao,
        dias_punicao: Number(newProcessData.qtdDias) || Number(newProcessData.diasPunicao) || 0,
        boletim: newProcessData.boletim || '',
        resumo_fato: newProcessData.resumoFato,
        apurador: newProcessData.apurador,
        aplicador: newProcessData.aplicador,
        documents: newProcessData.documents || [],
        history: newProcessData.history || [],
        n_grade: newProcessData.nGrade || '',
        observacoes: newProcessData.observacoes || '',
        resumo_punicao: newProcessData.resumoPunicao || ''
      };

      if (editingProcess) {
        // Update existing process
        const { error } = await supabase.from('processes').update(dbPayload).eq('id', editingProcess.id);
        if (error) throw error;
        
        setProcesses(prev => prev.map(p => p.id === editingProcess.id ? { 
          ...p, 
          ...newProcessData,
          militar: dbPayload.militar,
          diasPunicao: dbPayload.dias_punicao,
          documents: dbPayload.documents,
          history: dbPayload.history
        } : p));
      } else {
        // Create new process
        const initialHistory = [
          { 
            field: 'Criação', 
            oldValue: '—', 
            newValue: 'Processo Criado', 
            user: currentUser?.name || 'Sistema', 
            date: new Date().toLocaleString('pt-BR') 
          }
        ];
        
        const insertPayload = {
          ...dbPayload,
          history: initialHistory
        };
        
        const { data, error } = await supabase.from('processes').insert(insertPayload).select().single();
        if (error) throw error;

        const newProcess: Process = {
          ...newProcessData,
          id: data.id,
          patdNumber: data.patd_number,
          diasPunicao: data.dias_punicao,
          documents: data.documents || [],
          history: data.history || initialHistory
        };
        setProcesses(prev => [newProcess, ...prev]);
      }
      setActiveTab('processos');
    } catch (err) {
      console.error('Error saving process:', err);
      alert('Erro ao salvar processo no banco de dados.');
    }
  };

  const handleTabChange = (tab: string, filter?: string) => {
    if (currentUser.role === 'Visualizador' && (tab === 'processos' || tab === 'novo-patd')) {
      return;
    }
    if (tab === 'novo-patd') {
      setEditingProcess(null);
    }
    if (filter !== undefined) {
      setProcessFilter(filter);
    }
    setSearchTerm(''); // Clear global search when changing tabs
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard processes={processes} setActiveTab={handleTabChange} onSelectProcess={handleEditProcess} globalSearchTerm={searchTerm} currentUser={currentUser} />;
      case 'processos':
        return <Processes processes={processes} setProcesses={setProcesses} divisions={divisions} setActiveTab={handleTabChange} onEdit={handleEditProcess} onNew={handleNewPATD} initialFilter={processFilter} onClearFilter={() => setProcessFilter('')} globalSearchTerm={searchTerm} currentUser={currentUser} />;
      case 'divisoes':
        return <Divisions divisions={divisions} setDivisions={setDivisions} isAdmin={currentUser.role === 'Administrador'} globalSearchTerm={searchTerm} />;
      case 'usuarios':
        return <Users users={users} setUsers={setUsers} divisions={divisions} globalSearchTerm={searchTerm} isAdmin={currentUser.role === 'Administrador'} loggedUser={currentUser} />;
      case 'relatorio':
        return <Reports processes={processes} globalSearchTerm={searchTerm} currentUser={currentUser} />;
      case 'chat':
        return <AIChat />;
      case 'tasks':
        return <Tasks />;
      case 'novo-patd':
        return <NewPATD initialData={editingProcess} onSave={handleSaveProcess} divisions={divisions} currentUser={currentUser} processes={processes} />;
      case 'settings':
        return <Settings currentUser={currentUser} onProfileUpdate={(updated) => setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))} />;
      case 'documentos':
        return <Documents currentUser={currentUser} />;
      default:
        return <Dashboard processes={processes} setActiveTab={handleTabChange} onSelectProcess={handleEditProcess} globalSearchTerm={searchTerm} currentUser={currentUser} />;
    }
  };

  return (
    <ThemeProvider>
      <Shell 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        processes={processes} 
        onNotificationClick={handleEditProcess}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentUser={currentUser}
        divisions={divisions}
      >
        {renderContent()}
      </Shell>
    </ThemeProvider>
  );
}

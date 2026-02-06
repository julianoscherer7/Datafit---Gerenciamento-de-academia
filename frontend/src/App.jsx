import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { Sidebar, Header, MainLayout } from './components/sections';
import { ToastContainer } from './components/common';
import { useToast } from './hooks';
import { LoadingScreen } from './components/common/LoadingSpinner';

// Import Pages - Core (carregamento imediato)
import { DashboardPage } from './pages/DashboardPage';
import { TreinosPage } from './pages/TreinosPage';
import { AmigosPage } from './pages/AmigosPage';
import { PerfilPage } from './pages/PerfilPage';
import { EditPerfilPage } from './pages/EditPerfilPage';
import { ConfigsPage } from './pages/ConfigsPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ExecucaoPage } from './pages/ExecucaoPage';
import { HistoricoPage } from './pages/HistoricoPage';
import { AIChatPage } from './pages/AIChatPage';
import { CoachDashboardPage } from './pages/CoachDashboardPage';
import { CoachTreinosPage } from './pages/CoachTreinosPage';
import { ConnectionPage } from './pages/ConnectionPage';

// Import Pages - Lazy Loading (carregamento sob demanda)
const ProgressoPage = lazy(() => import('./pages/ProgressoPage'));

const AppContent = () => {
  const { user, token, loading } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  // SEMPRE iniciar na landing page - o useEffect redireciona se tiver token
  const [currentPage, setCurrentPage] = useState('landing');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageParams, setPageParams] = useState({});

  // Atualiza página inicial baseado no token
  useEffect(() => {
    // Se tem token E está em página pública, vai para dashboard
    if (token && ['landing', 'login', 'register'].includes(currentPage)) {
      setCurrentPage('dashboard');
    } 
    // Se NÃO tem token E está em página protegida, volta para landing
    else if (!token && !['landing', 'login', 'register'].includes(currentPage)) {
      setCurrentPage('landing');
    }
  }, [token, currentPage]);

  const handleNavigate = (page, params = {}) => {
    setPageParams(params);
    setCurrentPage(page);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  // Renderizar páginas de autenticação
  if (!token) {
    return (
      <AnimatePresence mode="wait">
        {currentPage === 'landing' && <LandingPage onNavigate={setCurrentPage} />}
        {currentPage === 'login' && <LoginPage onNavigate={setCurrentPage} />}
        {currentPage === 'register' && <RegisterPage onNavigate={setCurrentPage} />}
      </AnimatePresence>
    );
  }

  // Renderizar layout protegido
  const pages = {
    dashboard: <DashboardPage onNavigate={handleNavigate} />,
    treinos: <TreinosPage onNavigate={handleNavigate} />,
    execucao: <ExecucaoPage treinoId={pageParams.treinoId} validationData={pageParams.validationData} onNavigate={handleNavigate} />,
    historico: <HistoricoPage onNavigate={handleNavigate} />,
    progresso: <Suspense fallback={<LoadingScreen />}><ProgressoPage /></Suspense>,
    amigos: <AmigosPage onNavigate={handleNavigate} />,
    perfil: <PerfilPage onNavigate={handleNavigate} />,
    editPerfil: <EditPerfilPage onNavigate={handleNavigate} />,
    configs: <ConfigsPage onNavigate={handleNavigate} />,
    chat: <AIChatPage onNavigate={handleNavigate} />,
    coachDashboard: <CoachDashboardPage onNavigate={handleNavigate} />,
    coachTreinos: <CoachTreinosPage onNavigate={handleNavigate} studentId={pageParams.studentId} studentName={pageParams.studentName} />,
    connection: <ConnectionPage onNavigate={handleNavigate} />,
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <Header 
          onProfileClick={() => setCurrentPage('perfil')} 
          onSettingsClick={() => setCurrentPage('configs')}
        />
        
        <MainLayout sidebarOpen={sidebarOpen}>
          <AnimatePresence mode="wait">
            {pages[currentPage] || <DashboardPage />}
          </AnimatePresence>
        </MainLayout>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default AppContent;

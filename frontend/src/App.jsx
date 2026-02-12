import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { Sidebar, Header, MainLayout } from './components/sections';
import { ToastContainer } from './components/common';
import { useToast } from './hooks';
import { LoadingScreen } from './components/common/LoadingSpinner';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { TreinosPage } from './pages/TreinosPage';
import { EvolucaoPage } from './pages/EvolucaoPage';
import { AmigosPage } from './pages/AmigosPage';
import { PerfilPage } from './pages/PerfilPage';
import { EditPerfilPage } from './pages/EditPerfilPage';
import { ConfigsPage } from './pages/ConfigsPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ExecucaoPage } from './pages/ExecucaoPage';
import { HistoricoPage } from './pages/HistoricoPage';

import { ChatPage } from './pages/ChatPage';
import { CoachDashboardPage } from './pages/CoachDashboardPage';
import { CoachTreinosPage } from './pages/CoachTreinosPage';
import { ConnectionPage } from './pages/ConnectionPage';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15 } },
};

const AppContent = () => {
  const { user, token, loading } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [currentPage, setCurrentPage] = useState('landing');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageParams, setPageParams] = useState({});

  useEffect(() => {
    if (token && ['landing', 'login', 'register'].includes(currentPage)) {
      setCurrentPage('dashboard');
    } else if (!token && !['landing', 'login', 'register'].includes(currentPage)) {
      setCurrentPage('landing');
    }
  }, [token, currentPage]);

  const handleNavigate = (page, params = {}) => {
    setPageParams(params);
    setCurrentPage(page);
  };

  if (loading) return <LoadingScreen />;

  // Auth pages
  if (!token) {
    return (
      <AnimatePresence mode="wait">
        {currentPage === 'landing' && <LandingPage onNavigate={setCurrentPage} />}
        {currentPage === 'login' && <LoginPage onNavigate={setCurrentPage} />}
        {currentPage === 'register' && <RegisterPage onNavigate={setCurrentPage} />}
      </AnimatePresence>
    );
  }

  // Protected pages
  const pages = {
    dashboard: <DashboardPage onNavigate={handleNavigate} />,
    treinos: <TreinosPage onNavigate={handleNavigate} />,
    evolucao: <EvolucaoPage onNavigate={handleNavigate} />,
    execucao: <ExecucaoPage treino={pageParams.treino} treinoId={pageParams.treinoId} validationData={pageParams.validationData} onNavigate={handleNavigate} />,
    historico: <HistoricoPage onNavigate={handleNavigate} />,
    amigos: <AmigosPage onNavigate={handleNavigate} />,
    perfil: <PerfilPage onNavigate={handleNavigate} />,
    editPerfil: <EditPerfilPage onNavigate={handleNavigate} />,
    configs: <ConfigsPage onNavigate={handleNavigate} />,
    chat: <ChatPage onNavigate={handleNavigate} participanteId={pageParams.participanteId} participanteNome={pageParams.participanteNome} />,
    coachDashboard: <CoachDashboardPage onNavigate={handleNavigate} />,
    coachTreinos: <CoachTreinosPage onNavigate={handleNavigate} studentId={pageParams.studentId} studentName={pageParams.studentName} />,
    connection: <ConnectionPage onNavigate={handleNavigate} />,
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0c0f1a' }}>
      <Sidebar 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden md:ml-[260px]">
        <Header 
          onProfileClick={() => setCurrentPage('perfil')} 
        />
        
        <MainLayout>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {pages[currentPage] || <DashboardPage onNavigate={handleNavigate} />}
            </motion.div>
          </AnimatePresence>
        </MainLayout>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default AppContent;

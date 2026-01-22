import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { Sidebar, Header, MainLayout } from './components/sections';
import { ToastContainer } from './components/common';
import { useToast } from './hooks';
import { LoadingScreen } from './components/common/LoadingSpinner';

// Import Pages
import { DashboardPage } from './pages/DashboardPage';
import { TreinosPage } from './pages/TreinosPage';
import { DesafiosPage } from './pages/DesafiosPage';
import { AmigosPage } from './pages/AmigosPage';
import { BadgesPage } from './pages/BadgesPage';
import { HistoricoPage } from './pages/HistoricoPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ConfigsPage } from './pages/ConfigsPage';
import { PerfilPage } from './pages/PerfilPage';
import { ExecucaoPage } from './pages/ExecucaoPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

const AppContent = () => {
  const { user, token, loading } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [currentPage, setCurrentPage] = useState(token ? 'dashboard' : 'landing');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    dashboard: <DashboardPage />,
    treinos: <TreinosPage />,
    desafios: <DesafiosPage />,
    amigos: <AmigosPage />,
    badges: <BadgesPage />,
    historico: <HistoricoPage />,
    analytics: <AnalyticsPage />,
    configs: <ConfigsPage />,
    perfil: <PerfilPage />,
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onProfileClick={() => setCurrentPage('perfil')} />
        
        <MainLayout sidebarOpen={sidebarOpen}>
          <AnimatePresence mode="wait">
            {pages[currentPage]}
          </AnimatePresence>
        </MainLayout>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default AppContent;

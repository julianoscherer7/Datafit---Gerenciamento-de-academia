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
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Import Pages - Lazy Loading (carregamento sob demanda)
const ProgressoPage = lazy(() => import('./pages/ProgressoPage'));

const AppContent = () => {
  const { user, token, loading } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [currentPage, setCurrentPage] = useState('landing');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Atualiza página inicial baseado no token
  useEffect(() => {
    if (token && currentPage === 'landing') {
      setCurrentPage('dashboard');
    } else if (!token && !['landing', 'login', 'register'].includes(currentPage)) {
      setCurrentPage('landing');
    }
  }, [token]);

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

  // Renderizar layout protegido - Menu simplificado com 5 páginas
  const pages = {
    dashboard: <DashboardPage />,
    treinos: <TreinosPage />,
    progresso: <Suspense fallback={<LoadingScreen />}><ProgressoPage /></Suspense>,
    amigos: <AmigosPage />,
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

import React, { useState } from 'react';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { ProfilePage } from './pages/ProfilePage';
import { ResultsPage } from './pages/ResultsPage';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export type Route = 'home' | 'auth' | 'analysis' | 'profile' | 'results';

export const Router: React.FC = () => {
  const { user } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<Route>('home');

  const navigateTo = (route: Route) => {
    setCurrentRoute(route);
  };

  const renderPage = () => {
    switch (currentRoute) {
      case 'home':
        return <HomePage onNavigate={navigateTo} />;
      case 'auth':
        return <AuthPage onNavigate={navigateTo} />;
      case 'analysis':
        return <AnalysisPage onNavigate={navigateTo} />;
      case 'profile':
        return user ? <ProfilePage onNavigate={navigateTo} /> : <AuthPage onNavigate={navigateTo} />;
      case 'results':
        return <ResultsPage onNavigate={navigateTo} />;
      default:
        return <HomePage onNavigate={navigateTo} />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentRoute}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen"
      >
        {renderPage()}
      </motion.div>
    </AnimatePresence>
  );
};
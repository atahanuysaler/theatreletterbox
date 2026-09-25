import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import SiteHeader from './components/redesign/SiteHeader';
import Footer from './components/redesign/Footer';
import MobileTabBar from './components/redesign/MobileTabBar';

import CatalogPage from './pages/CatalogPage';
import IzlediklerimPage from './pages/IzlediklerimPage';
import LeaderboardPage from './pages/LeaderboardPage';
import PlayDetailPage from './pages/PlayDetailPage';
import AdminPage from './pages/AdminPage';
import BulmacalarPage from './pages/BulmacalarPage';
import ListsPage from './pages/ListsPage';
import ProfilePage from './pages/ProfilePage';
import ContactPage from './pages/ContactPage';
import AddPlayPage from './pages/AddPlayPage';
import NotFoundPage from './pages/NotFoundPage';
import LogModal from './components/LogModal';
import DailyQuoteModal from './components/DailyQuoteModal';
import { AuthProvider, useAuthSafe } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import type { Play } from './types';

const AppContent: React.FC = () => {
  const location = useLocation();
  const authContext = useAuthSafe();
  const user = authContext?.user;
  const loginWithGoogle = authContext?.loginWithGoogle;

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logModalPlay, setLogModalPlay] = useState<Play | null>(null);
  const [isDailyQuoteOpen, setIsDailyQuoteOpen] = useState(false);

  const handleOpenLogModal = async (play?: Play | null) => {
    if (!user) {
      try {
        await loginWithGoogle?.();
        setLogModalPlay(play || null);
        setIsLogModalOpen(true);
      } catch (err) {
        console.log('[App] Google sign-in cancelled or failed:', err);
      }
      return;
    }
    setLogModalPlay(play || null);
    setIsLogModalOpen(true);
  };

  const handleOpenDailyQuote = () => setIsDailyQuoteOpen(true);

  const isPlayDetailPage = location.pathname.startsWith('/oyun/');

  return (
    <div className="min-h-screen w-full bg-tn-page text-tn-text font-serif p-2 sm:p-2.5 box-border flex flex-col items-center selection:bg-tn-red selection:text-white">
      {/* 1440px max width container with 22px border-radius matching DESIGN.md */}
      <div className="w-full max-w-[1440px] bg-white dark:bg-tn-surface rounded-[22px] p-3 sm:p-4.5 box-border flex flex-col gap-1.5 shadow-sm min-h-screen">
        {/* Editorial Header */}
        <SiteHeader
          onOpenLogModal={() => handleOpenLogModal()}
          onOpenDailyQuote={handleOpenDailyQuote}
        />

        {/* Main Viewport Content */}
        <main className="flex-1 w-full pb-16 md:pb-2">
          <Routes>
            <Route
              path="/"
              element={
                <CatalogPage
                  onOpenLogModal={handleOpenLogModal}
                  onOpenDailyQuote={handleOpenDailyQuote}
                />
              }
            />
            <Route path="/izlediklerim" element={<IzlediklerimPage />} />
            <Route
              path="/izlemek-istediklerim"
              element={
                <ProfilePage
                  initialTab="izlemek-istediklerim"
                  onOpenDailyQuote={handleOpenDailyQuote}
                />
              }
            />
            <Route path="/listeler" element={<ListsPage onOpenLogModal={handleOpenLogModal} />} />
            <Route path="/liderler" element={<LeaderboardPage />} />
            <Route
              path="/oyun/:id"
              element={<PlayDetailPage onOpenLogModal={handleOpenLogModal} />}
            />
            <Route path="/profil" element={<ProfilePage onOpenDailyQuote={handleOpenDailyQuote} />} />
            <Route
              path="/profil/:userId"
              element={<ProfilePage onOpenDailyQuote={handleOpenDailyQuote} />}
            />
            <Route
              path="/kullanici/:userId"
              element={<ProfilePage onOpenDailyQuote={handleOpenDailyQuote} />}
            />
            <Route
              path="/bulmacalar"
              element={<BulmacalarPage onOpenDailyQuote={handleOpenDailyQuote} />}
            />
            <Route path="/iletisim" element={<ContactPage />} />
            <Route path="/oyun-ekle" element={<AddPlayPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </main>

        {/* Editorial Footer */}
        <Footer />
      </div>

      {/* Mobile Tab Bar (Bottom Nav - hidden on PlayDetail where StickyActionBar is used) */}
      {!isPlayDetailPage && (
        <MobileTabBar onOpenLogModal={() => handleOpenLogModal()} />
      )}

      {/* Global Modals */}
      <LogModal
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          setLogModalPlay(null);
        }}
        preselectedPlay={logModalPlay}
      />
      <DailyQuoteModal isOpen={isDailyQuoteOpen} onClose={() => setIsDailyQuoteOpen(false)} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;

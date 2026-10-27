import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import SiteHeader from './components/redesign/SiteHeader';
import Footer from './components/redesign/Footer';
import MobileTabBar from './components/redesign/MobileTabBar';

import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import IzlediklerimPage from './pages/IzlediklerimPage';
import LeaderboardPage from './pages/LeaderboardPage';
import PlayDetailPage from './pages/PlayDetailPage';
import AdminPage from './pages/AdminPage';
import BulmacalarPage from './pages/BulmacalarPage';
import ListsPage from './pages/ListsPage';
import ProfilePage from './pages/ProfilePage';
import IzlemekIstediklerimPage from './pages/IzlemekIstediklerimPage';
import ContactPage from './pages/ContactPage';
import AddPlayPage from './pages/AddPlayPage';
import KesfetPage from './pages/KesfetPage';
import NotFoundPage from './pages/NotFoundPage';
import DevComponentsPage from './pages/DevComponentsPage';
import LogModal from './components/LogModal';
import DailyQuoteModal from './components/DailyQuoteModal';
import { AuthProvider, useAuthSafe } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import type { Play, ReviewEntry } from './types';

const AppContent: React.FC = () => {
  const location = useLocation();
  const authContext = useAuthSafe();
  const user = authContext?.user;
  const loginWithGoogle = authContext?.loginWithGoogle;

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logModalPlay, setLogModalPlay] = useState<Play | null>(null);
  const [logModalReviewToEdit, setLogModalReviewToEdit] = useState<ReviewEntry | null>(null);
  const [isDailyQuoteOpen, setIsDailyQuoteOpen] = useState(false);

  const handleOpenLogModal = async (play?: Play | null, reviewToEdit?: ReviewEntry | null) => {
    if (!user) {
      try {
        await loginWithGoogle?.();
        setLogModalPlay(play || null);
        setLogModalReviewToEdit(reviewToEdit || null);
        setIsLogModalOpen(true);
      } catch (err) {
        console.log('[App] Google sign-in cancelled or failed:', err);
      }
      return;
    }
    setLogModalPlay(play || null);
    setLogModalReviewToEdit(reviewToEdit || null);
    setIsLogModalOpen(true);
  };

  const handleOpenDailyQuote = () => setIsDailyQuoteOpen(true);

  // Always scroll to top on page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  const isKesfetPage = location.pathname === '/kesfet';

  return (
    <div className="min-h-screen w-full bg-white dark:bg-tn-container md:bg-tn-page text-tn-text font-sans p-0 md:p-[10px] box-border flex flex-col items-center selection:bg-tn-red selection:text-white">
      {/* 1440px max width container with 22px border-radius matching DESIGN.md */}
      <div className={`w-full max-w-[1440px] bg-white dark:bg-tn-container ${isKesfetPage ? 'p-0 md:p-0 rounded-none' : 'rounded-none md:rounded-[22px] p-2 md:p-[18px_16px_16px]'} box-border flex flex-col gap-1.5 shadow-none md:shadow-sm min-h-screen border-none ${isKesfetPage ? '' : 'md:border md:border-tn-line/40'}`}>
        {/* Editorial Header - hidden on full-screen Kesfet stage feed */}
        {!isKesfetPage && (
          <SiteHeader
            onOpenLogModal={() => handleOpenLogModal()}
            onOpenDailyQuote={handleOpenDailyQuote}
          />
        )}

        {/* Main Viewport Content */}
        <main className={`flex-1 w-full ${isKesfetPage ? 'pb-0' : 'pb-4 md:pb-2'}`}>
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  onOpenLogModal={handleOpenLogModal}
                  onOpenDailyQuote={handleOpenDailyQuote}
                />
              }
            />
            <Route
              path="/kesfet"
              element={<KesfetPage onOpenLogModal={handleOpenLogModal} />}
            />
            <Route
              path="/katalog"
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
              element={<IzlemekIstediklerimPage onOpenLogModal={handleOpenLogModal} />}
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
            <Route path="/dev/components" element={<DevComponentsPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </main>

        {/* Editorial Footer - hidden on full-screen Kesfet feed */}
        {!isKesfetPage && (
          <div className="w-full pb-[100px] md:pb-0">
            <Footer />
          </div>
        )}
      </div>

      {/* Mobile Tab Bar (Bottom Nav - visible on all pages including PlayDetail, matching HomePage) */}
      <MobileTabBar onOpenLogModal={() => handleOpenLogModal()} />

      {/* Global Modals */}
      <LogModal
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          setLogModalPlay(null);
          setLogModalReviewToEdit(null);
        }}
        preselectedPlay={logModalPlay}
        reviewToEdit={logModalReviewToEdit}
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

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import MobileDock from './components/layout/MobileDock';
import Footer from './components/layout/Footer';
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
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import type { Play } from './types';

export const App: React.FC = () => {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logModalPlay, setLogModalPlay] = useState<Play | null>(null);
  const [isDailyQuoteOpen, setIsDailyQuoteOpen] = useState(false);

  const handleOpenLogModal = (play?: Play | null) => {
    setLogModalPlay(play || null);
    setIsLogModalOpen(true);
  };
  const handleOpenDailyQuote = () => setIsDailyQuoteOpen(true);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-canvas text-text-primary antialiased font-sans selection:bg-theatre-curtain selection:text-white">

          {/* Editorial Header */}
          <Header onOpenLogModal={() => handleOpenLogModal()} onOpenDailyQuote={handleOpenDailyQuote} />

          {/* Main Viewport Content */}
          <main className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pb-8">
            <Routes>
              <Route path="/" element={<CatalogPage onOpenLogModal={handleOpenLogModal} onOpenDailyQuote={handleOpenDailyQuote} />} />
              <Route path="/izlediklerim" element={<IzlediklerimPage />} />
              <Route path="/izlemek-istediklerim" element={<ProfilePage initialTab="izlemek-istediklerim" onOpenDailyQuote={handleOpenDailyQuote} />} />
              <Route path="/listeler" element={<ListsPage onOpenLogModal={handleOpenLogModal} />} />
              <Route path="/liderler" element={<LeaderboardPage />} />
              <Route path="/oyun/:id" element={<PlayDetailPage onOpenLogModal={handleOpenLogModal} />} />
              <Route path="/profil" element={<ProfilePage onOpenDailyQuote={handleOpenDailyQuote} />} />
              <Route path="/profil/:userId" element={<ProfilePage onOpenDailyQuote={handleOpenDailyQuote} />} />
              <Route path="/kullanici/:userId" element={<ProfilePage onOpenDailyQuote={handleOpenDailyQuote} />} />
              <Route path="/bulmacalar" element={<BulmacalarPage onOpenDailyQuote={handleOpenDailyQuote} />} />
              <Route path="/iletisim" element={<ContactPage />} />
              <Route path="/oyun-ekle" element={<AddPlayPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </main>

          {/* Editorial Footer */}
          <Footer />

          {/* Mobile Sticky Bottom Dock */}
          <MobileDock onOpenLogModal={() => handleOpenLogModal()} onOpenDailyQuote={handleOpenDailyQuote} />

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
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;

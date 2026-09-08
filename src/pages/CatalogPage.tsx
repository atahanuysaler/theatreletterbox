import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Compass, 
  Search, 
  SlidersHorizontal, 
  Plus, 
  RotateCcw, 
  CheckCircle2, 
  ArrowUpDown,
  Theater,
  Check
} from 'lucide-react';
import { Play } from '../types';
import PlayCard from '../components/catalog/PlayCard';
import FilterSidebar from '../components/catalog/FilterSidebar';
import { storageService } from '../services/storage';
import { useAuthSafe } from '../context/AuthContext';

interface CatalogPageProps {
  onOpenLogModal?: () => void;
  onOpenDailyQuote?: () => void;
}

type SortOption = 'rating' | 'reviews' | 'year' | 'title';

export const CatalogPage: React.FC<CatalogPageProps> = ({ onOpenLogModal, onOpenDailyQuote }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearchQuery = searchParams.get('q') || '';
  const authContext = useAuthSafe();
  const activeUserId = authContext?.user?.uid;

  // Plays and User State
  const [plays, setPlays] = useState<Play[]>([]);
  const [seenPlayIds, setSeenPlayIds] = useState<string[]>([]);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [selectedIntermission, setSelectedIntermission] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sync searchQuery when URL ?q= updates from Header
  useEffect(() => {
    if (urlSearchQuery !== searchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [urlSearchQuery]);

  // Load live plays and seen plays from Firebase storage
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const loadedPlays = await storageService.getPlays();
        if (loadedPlays && isMounted) {
          setPlays(loadedPlays);
        }
        if (activeUserId) {
          const user = await storageService.getUserProfile(activeUserId);
          if (user && user.seenPlayIds && isMounted) {
            setSeenPlayIds(user.seenPlayIds);
          }
        } else if (isMounted) {
          setSeenPlayIds([]);
        }
      } catch (err) {
        console.error('[CatalogPage] Failed to load plays from Firebase:', err);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [activeUserId]);

  // Extract dynamic filter lists from catalog
  const genres = useMemo(() => {

    const set = new Set<string>();
    plays.forEach((p) => {
      if (p.genre) set.add(p.genre);
    });
    return Array.from(set).sort();
  }, [plays]);

  const companies = useMemo(() => {
    const set = new Set<string>();
    plays.forEach((p) => {
      if (p.company) set.add(p.company);
    });
    return Array.from(set).sort();
  }, [plays]);

  const venues = useMemo(() => {
    const set = new Set<string>();
    plays.forEach((p) => {
      if (p.venue) set.add(p.venue);
    });
    return Array.from(set).sort();
  }, [plays]);

  // Filter & Search Logic with Turkish character normalization
  const filteredPlays = useMemo(() => {
    const normalizedQuery = searchQuery
      .toLocaleLowerCase('tr-TR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    return plays
      .filter((play) => {
        // 1. Search query match
        if (normalizedQuery) {
          const searchableText = [
            play.title,
            play.originalTitle,
            play.playwright,
            play.director,
            play.company,
            play.venue,
            play.genre,
            ...(play.cast || []),
            ...(play.tags || []),
          ]
            .filter(Boolean)
            .join(' ')
            .toLocaleLowerCase('tr-TR')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

          if (!searchableText.includes(normalizedQuery)) {
            return false;
          }
        }

        // 2. Genre filter
        if (selectedGenre && play.genre !== selectedGenre) {
          return false;
        }

        // 3. Company filter
        if (selectedCompany && play.company !== selectedCompany) {
          return false;
        }

        // 4. Venue filter
        if (selectedVenue && play.venue !== selectedVenue) {
          return false;
        }

        // 5. Intermission filter
        if (selectedIntermission === 'intermission' && !play.hasIntermission) {
          return false;
        }
        if (selectedIntermission === 'single' && play.hasIntermission) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'reviews') return (b.reviewCount || 0) - (a.reviewCount || 0);
        if (sortBy === 'year') return b.year - a.year;
        if (sortBy === 'title') return a.title.localeCompare(b.title, 'tr-TR');
        return 0;
      });
  }, [
    plays,
    searchQuery,
    selectedGenre,
    selectedCompany,
    selectedVenue,
    selectedIntermission,
    sortBy,
  ]);

  // Limit number of plays displayed on the front page to 40
  const FRONT_PAGE_LIMIT = 40;
  const displayedPlays = useMemo(() => {
    return filteredPlays.slice(0, FRONT_PAGE_LIMIT);
  }, [filteredPlays]);

  // Handle "Gördüm" Toggle with Confetti & Storage Update
  const handleToggleSeen = async (playId: string) => {
    const isCurrentlySeen = seenPlayIds.includes(playId);
    const targetPlay = plays.find((p) => p.id === playId);
    const playTitle = targetPlay ? targetPlay.title : 'Oyun';

    if (!isCurrentlySeen) {
      setSeenPlayIds((prev) => [...prev, playId]);
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#BA1B23', '#F1C21B', '#198038'],
      });
      setFeedbackToast(`+10 XP! "${playTitle}" izlendi olarak işaretlendi.`);
    } else {
      setSeenPlayIds((prev) => prev.filter((id) => id !== playId));
      setFeedbackToast(`"${playTitle}" izlediklerim listesinden kaldırıldı.`);
    }

    if (!activeUserId) {
      setFeedbackToast('Oyunları işaretlemek için lütfen giriş yapın.');
      setTimeout(() => setFeedbackToast(null), 3000);
      return;
    }

    try {
      await storageService.toggleSeenPlay(activeUserId, playId);
      if (authContext?.refreshUser) {
        await authContext.refreshUser();
      }
    } catch (e) {
      console.warn('[CatalogPage] Could not persist toggle to storage:', e);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('');
    setSelectedCompany('');
    setSelectedVenue('');
    setSelectedIntermission('all');
    setSearchParams({});
  };

  const seenPercentage = plays.length > 0 ? Math.round((seenPlayIds.length / plays.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Toast Feedback Notification */}
      {feedbackToast && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 bg-text-primary text-text-inverse text-xs px-4 py-2.5 rounded-sm shadow-modal flex items-center gap-2 border border-border-strong animate-fade-in font-mono">
          <Check className="w-4 h-4 text-stage-spotlight" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Editorial Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-subtle pb-5">
        <div>
          <div className="flex items-center gap-2 text-theatre-curtain text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Oyun Kataloğu · Repertuar</span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
            Türkiye Tiyatro Sahnesi
          </h1>
          <p className="text-sm text-text-secondary mt-1 max-w-2xl font-sans">
            Klasik ve çağdaş Türk tiyatrosundan seçkin yapımlar, ayrıntılı künyeler ve seyirci notları.
          </p>
        </div>

        {/* Repertoire Stats & Action */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="font-mono text-xs text-text-secondary bg-layer-01 px-3 py-1.5 border border-border-subtle rounded-sm flex items-center gap-2">
            <span>{plays.length} Repertuar Oyunu</span>
            <span className="text-border-strong">·</span>
            <span className="text-theatre-curtain font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {seenPlayIds.length} İzlendi (%{seenPercentage})
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenLogModal}
            className="inline-flex items-center gap-1.5 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white px-3.5 py-1.5 text-xs font-medium rounded-sm shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Not Al</span>
          </button>
        </div>
      </div>

      {/* Daily Quote Teaser Banner */}
      {onOpenDailyQuote && (
        <div className="bg-layer-01 border border-border-subtle p-4 sm:p-5 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-sm bg-theatre-curtain text-white flex items-center justify-center flex-shrink-0 text-lg shadow-sm">
              🎭
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm sm:text-base text-text-primary">
                  Günün Repliği: Türk Tiyatrosu Bulmacası
                </span>
                <span className="text-[10px] font-mono bg-theatre-curtain/10 text-theatre-curtain font-bold px-1.5 py-0.5 rounded-sm">
                  +30 XP
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Bugünün repliğini 3 tahminde bil, seriyi koru ve tiyatrosever kademeni yükselt.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenDailyQuote}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-canvas hover:bg-layer-02 border border-border-strong px-4 py-2 text-xs font-mono font-semibold text-text-primary rounded-sm transition-colors cursor-pointer flex-shrink-0"
          >
            <span>Bulmacayı Başlat</span>
            <span className="text-theatre-curtain font-bold">→</span>
          </button>
        </div>
      )}

      {/* Catalog Search & Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-layer-01 p-3 border border-border-subtle rounded-sm">
        {/* Real-time In-Page Search */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value) {
                setSearchParams({ q: e.target.value });
              } else {
                setSearchParams({});
              }
            }}
            placeholder="Oyun, yazar, yönetmen veya oyuncu ara..."
            className="w-full bg-canvas border border-border-subtle hover:border-border-strong focus:border-theatre-curtain text-xs sm:text-sm pl-9 pr-8 py-2 rounded-sm outline-none transition-colors text-text-primary placeholder:text-text-tertiary font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchParams({});
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary text-xs cursor-pointer"
              aria-label="Aramayı temizle"
            >
              ×
            </button>
          )}
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-2 justify-end">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-canvas border border-border-subtle px-2.5 py-1.5 rounded-sm text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-text-tertiary" />
            <span className="text-text-secondary hidden sm:inline">Sırala:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-text-primary font-medium outline-none cursor-pointer text-xs"
            >
              <option value="rating">En Yüksek Puan</option>
              <option value="reviews">En Çok Not Alan</option>
              <option value="year">Prömiyer Yılı</option>
              <option value="title">Alfabetik (A-Z)</option>
            </select>
          </div>

          {/* Mobile Filter Button (< 1024px) */}
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden inline-flex items-center gap-1.5 bg-canvas hover:bg-layer-02 border border-border-subtle text-text-primary px-3 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-theatre-curtain" />
            <span>Filtrele</span>
            {(selectedGenre || selectedCompany || selectedVenue || selectedIntermission !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-theatre-curtain" />
            )}
          </button>
        </div>
      </div>

      {/* Main Layout: Sidebar + Repertoire Grid */}
      <div className="flex items-start gap-6">
        {/* Left Filter Sidebar */}
        <FilterSidebar
          genres={genres}
          companies={companies}
          venues={venues}
          selectedGenre={selectedGenre}
          selectedCompany={selectedCompany}
          selectedVenue={selectedVenue}
          selectedIntermission={selectedIntermission}
          onSelectGenre={setSelectedGenre}
          onSelectCompany={setSelectedCompany}
          onSelectVenue={setSelectedVenue}
          onSelectIntermission={setSelectedIntermission}
          onResetFilters={handleResetFilters}
          totalPlaysCount={plays.length}
          filteredPlaysCount={displayedPlays.length}
          isMobileOpen={isMobileFiltersOpen}
          onCloseMobile={() => setIsMobileFiltersOpen(false)}
        />

        {/* Right Repertoire Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Active Filter Tags Bar */}
          {(selectedGenre || selectedCompany || selectedVenue || selectedIntermission !== 'all' || searchQuery) && (
            <div className="flex items-center gap-2 flex-wrap text-xs bg-layer-01/60 p-2.5 border border-border-subtle rounded-sm">
              <span className="text-text-secondary font-mono">Aktif Filtreler:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-canvas border border-border-subtle px-2 py-0.5 rounded-sm">
                  <span>Arama: "{searchQuery}"</span>
                  <button type="button" onClick={() => setSearchQuery('')} className="text-text-tertiary hover:text-theatre-curtain cursor-pointer">
                    ×
                  </button>
                </span>
              )}
              {selectedGenre && (
                <span className="inline-flex items-center gap-1 bg-canvas border border-border-subtle px-2 py-0.5 rounded-sm">
                  <span>Tür: {selectedGenre}</span>
                  <button type="button" onClick={() => setSelectedGenre('')} className="text-text-tertiary hover:text-theatre-curtain cursor-pointer">
                    ×
                  </button>
                </span>
              )}
              {selectedCompany && (
                <span className="inline-flex items-center gap-1 bg-canvas border border-border-subtle px-2 py-0.5 rounded-sm">
                  <span>Topluluk: {selectedCompany}</span>
                  <button type="button" onClick={() => setSelectedCompany('')} className="text-text-tertiary hover:text-theatre-curtain cursor-pointer">
                    ×
                  </button>
                </span>
              )}
              {selectedVenue && (
                <span className="inline-flex items-center gap-1 bg-canvas border border-border-subtle px-2 py-0.5 rounded-sm">
                  <span>Sahne: {selectedVenue}</span>
                  <button type="button" onClick={() => setSelectedVenue('')} className="text-text-tertiary hover:text-theatre-curtain cursor-pointer">
                    ×
                  </button>
                </span>
              )}
              {selectedIntermission !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-canvas border border-border-subtle px-2 py-0.5 rounded-sm">
                  <span>{selectedIntermission === 'intermission' ? '2 Perde' : 'Tek Perde'}</span>
                  <button type="button" onClick={() => setSelectedIntermission('all')} className="text-text-tertiary hover:text-theatre-curtain cursor-pointer">
                    ×
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-theatre-curtain hover:underline text-xs ml-auto font-mono cursor-pointer"
              >
                Tümünü Temizle
              </button>
            </div>
          )}

          {/* Repertoire Grid: Max 40 Plays */}
          {displayedPlays.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {displayedPlays.map((play) => (
                  <PlayCard
                    key={play.id}
                    play={play}
                    isSeen={seenPlayIds.includes(play.id)}
                    onToggleSeen={handleToggleSeen}
                    onOpenLogModal={() => onOpenLogModal?.()}
                  />
                ))}
              </div>

              {filteredPlays.length > FRONT_PAGE_LIMIT && (
                <div className="bg-layer-01 border border-border-subtle rounded-sm p-4 text-center">
                  <p className="text-xs font-mono text-text-secondary">
                    Ön sayfada en fazla {FRONT_PAGE_LIMIT} oyun gösterilmektedir (toplam {filteredPlays.length} sonuç arasından). İstediğiniz yapımlara erişmek için arama veya filtreleri daraltabilirsiniz.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-canvas border border-border-subtle rounded-sm p-12 text-center space-y-4">
              <Theater className="w-12 h-12 mx-auto text-theatre-curtain/60" />
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-lg text-text-primary">
                  Eşleşen Oyun Bulunamadı
                </h3>
                <p className="text-xs text-text-secondary max-w-md mx-auto">
                  Arama kriterlerinize veya seçilen filtrelere uygun yapım repertuarda bulunamadı. Lütfen filtrelerinizi gevşetin.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 bg-layer-01 hover:bg-layer-02 border border-border-subtle text-text-primary px-4 py-2 text-xs font-medium rounded-sm transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Filtreleri Temizle</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;

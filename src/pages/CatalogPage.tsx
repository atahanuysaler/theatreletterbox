import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Compass, 
  Plus, 
  RotateCcw, 
  CheckCircle2, 
  Theater,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Play } from '../types';
import PlayCard from '../components/catalog/PlayCard';
import FilterBar, { SortOption, GenreItem } from '../components/catalog/FilterBar';
import { storageService } from '../services/storage';
import { useAuthSafe } from '../context/AuthContext';

interface CatalogPageProps {
  onOpenLogModal?: (play?: Play | null) => void;
  onOpenDailyQuote?: () => void;
}

/**
 * Calculates page size dynamically based on responsive columns
 * so that the last row is always full (target ~30 plays):
 * - xl (>=1280px): 5 columns -> 6 rows * 5 = 30
 * - lg (1024px - 1279px): 4 columns -> 8 rows * 4 = 32
 * - md (768px - 1023px): 3 columns -> 10 rows * 3 = 30
 * - sm / mobile (<768px): 2 columns -> 15 rows * 2 = 30
 */
const getResponsivePageSize = (): number => {
  if (typeof window === 'undefined') return 30;
  const width = window.innerWidth;
  if (width >= 1280) return 30;
  if (width >= 1024) return 32;
  if (width >= 768) return 30;
  return 30;
};

export const CatalogPage: React.FC<CatalogPageProps> = ({ onOpenLogModal, onOpenDailyQuote }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearchQuery = searchParams.get('q') || '';
  const authContext = useAuthSafe();
  const activeUserId = authContext?.user?.uid;

  // Plays and User State
  const [plays, setPlays] = useState<Play[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [seenPlayIds, setSeenPlayIds] = useState<string[]>([]);
  const [watchlistPlayIds, setWatchlistPlayIds] = useState<string[]>([]);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedActor, setSelectedActor] = useState('');
  const [selectedCrewMember, setSelectedCrewMember] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('rating');

  // Pagination State - dynamic page size based on screen columns so rows are always full
  const [pageSize, setPageSize] = useState<number>(getResponsivePageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const catalogGridRef = useRef<HTMLDivElement>(null);

  // Update page size on screen resize
  useEffect(() => {
    const handleResize = () => {
      const newSize = getResponsivePageSize();
      setPageSize((prev) => (prev !== newSize ? newSize : prev));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync searchQuery when URL ?q= updates from navigation
  useEffect(() => {
    if (urlSearchQuery !== searchQuery) {
      setSearchQuery(urlSearchQuery);
      setCurrentPage(1);
    }
  }, [urlSearchQuery]);

  // Reset page to 1 when filters or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGenre, selectedCompany, selectedActor, selectedCrewMember, sortBy]);

  // Load live plays and seen plays from storage
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
          if (user && isMounted) {
            setSeenPlayIds(user.seenPlayIds || []);
            setWatchlistPlayIds(user.watchlistPlayIds || []);
          }
        } else if (isMounted) {
          setSeenPlayIds([]);
          setWatchlistPlayIds([]);
        }
      } catch (err) {
        console.error('[CatalogPage] Failed to load plays from storage:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [activeUserId]);

  const handleToggleWatchlist = async (playId: string) => {
    if (!activeUserId) {
      setFeedbackToast('İzleme listesine eklemek için lütfen giriş yapın.');
      setTimeout(() => setFeedbackToast(null), 3000);
      return;
    }
    const targetPlay = plays.find((p) => p.id === playId);
    const playTitle = targetPlay ? targetPlay.title : 'Oyun';
    const isCurrentlyWatchlisted = watchlistPlayIds.includes(playId);
    try {
      const updatedList = await storageService.toggleWatchlistPlay(activeUserId, playId);
      setWatchlistPlayIds(updatedList);
      if (authContext?.updateProfile) {
        await authContext.updateProfile({ watchlistPlayIds: updatedList });
      }
      setFeedbackToast(
        !isCurrentlyWatchlisted
          ? `"${playTitle}" izleme listene eklendi.`
          : `"${playTitle}" izleme listenden kaldırıldı.`
      );
      setTimeout(() => setFeedbackToast(null), 3000);
    } catch (err) {
      console.error('[CatalogPage] Failed to toggle watchlist play:', err);
    }
  };

  // Deduplicate and normalize genres into clean, atomic category items with counts
  const genres = useMemo((): GenreItem[] => {
    const genreCategories = [
      { key: 'Dram', match: ['dram', 'trajedi'] },
      { key: 'Komedi', match: ['komedi', 'fars'] },
      { key: 'Müzikal', match: ['müzikal', 'operet', 'kabare'] },
      { key: 'Klasik', match: ['klasik'] },
      { key: 'Tek Kişilik', match: ['tek kişilik', 'monolog', 'monodram'] },
      { key: 'Epik', match: ['epik'] },
      { key: 'Absürt', match: ['absürt'] },
      { key: 'Biyografik', match: ['biyografi', 'biyografik'] },
      { key: 'Belgesel', match: ['belgesel'] },
    ];

    const result: GenreItem[] = [];
    genreCategories.forEach((cat) => {
      const count = plays.filter((p) => {
        const g = (p.genre || '').toLocaleLowerCase('tr-TR');
        const tags = (p.tags || []).map((t) => t.toLocaleLowerCase('tr-TR'));
        return cat.match.some((m) => g.includes(m) || tags.some((t) => t.includes(m)));
      }).length;

      if (count > 0) {
        result.push({ name: cat.key, count });
      }
    });

    return result;
  }, [plays]);

  // Extract unique companies sorted alphabetically
  const companies = useMemo(() => {
    const set = new Set<string>();
    plays.forEach((p) => {
      if (p.company && p.company.trim()) set.add(p.company.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr-TR'));
  }, [plays]);

  // Extract unique cast members sorted alphabetically
  const actors = useMemo(() => {
    const set = new Set<string>();
    plays.forEach((p) => {
      (p.cast || []).forEach((actor) => {
        const trimmed = actor.trim();
        if (trimmed) set.add(trimmed);
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr-TR'));
  }, [plays]);

  // Extract unique production crew members (playwright, director, translator) sorted alphabetically
  const crewMembers = useMemo(() => {
    const set = new Set<string>();
    plays.forEach((p) => {
      if (p.playwright && p.playwright.trim()) set.add(p.playwright.trim());
      if (p.director && p.director.trim()) set.add(p.director.trim());
      const ext = p as any;
      if (ext.translator && typeof ext.translator === 'string' && ext.translator.trim()) {
        set.add(ext.translator.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr-TR'));
  }, [plays]);

  // Universal Filter & Omni-Search Logic
  const filteredPlays = useMemo(() => {
    const normalizedQuery = searchQuery
      .toLocaleLowerCase('tr-TR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    return plays
      .filter((play) => {
        // 1. Universal Omni-Search (Searches across play name, company, cast, playwright, director, etc.)
        if (normalizedQuery) {
          const searchableText = [
            play.title,
            play.originalTitle,
            play.playwright,
            play.director,
            play.company,
            play.genre,
            ...(play.cast || []),
            ...(play.tags || []),
            play.synopsis,
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

        // 2. Deduplicated Genre filter
        if (selectedGenre) {
          const g = (play.genre || '').toLocaleLowerCase('tr-TR');
          const tags = (play.tags || []).map((t) => t.toLocaleLowerCase('tr-TR'));
          const genreKeyLower = selectedGenre.toLocaleLowerCase('tr-TR');

          let matches = g.includes(genreKeyLower) || tags.some((t) => t.includes(genreKeyLower));
          if (selectedGenre === 'Dram') {
            matches = g.includes('dram') || g.includes('trajedi') || tags.some((t) => t.includes('dram'));
          } else if (selectedGenre === 'Komedi') {
            matches = g.includes('komedi') || g.includes('fars') || tags.some((t) => t.includes('komedi'));
          } else if (selectedGenre === 'Müzikal') {
            matches = g.includes('müzikal') || g.includes('operet') || g.includes('kabare');
          } else if (selectedGenre === 'Tek Kişilik') {
            matches = g.includes('tek kişilik') || g.includes('monolog') || g.includes('monodram');
          }
          if (!matches) return false;
        }

        // 3. Company filter
        if (selectedCompany && play.company !== selectedCompany) {
          return false;
        }

        // 4. Actor filter
        if (selectedActor) {
          const hasActor = (play.cast || []).some(
            (a) => a.toLocaleLowerCase('tr-TR') === selectedActor.toLocaleLowerCase('tr-TR')
          );
          if (!hasActor) return false;
        }

        // 5. Production Crew filter (director, playwright, translator)
        if (selectedCrewMember) {
          const target = selectedCrewMember.toLocaleLowerCase('tr-TR');
          const pw = (play.playwright || '').toLocaleLowerCase('tr-TR');
          const dir = (play.director || '').toLocaleLowerCase('tr-TR');
          const trans = ((play as any).translator || '').toLocaleLowerCase('tr-TR');
          const matchesCrew = pw === target || dir === target || trans === target;
          if (!matchesCrew) return false;
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
    selectedActor,
    selectedCrewMember,
    sortBy,
  ]);

  // Pagination calculations: dynamic plays per page based on screen size
  const totalPages = Math.max(1, Math.ceil(filteredPlays.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const displayedPlays = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredPlays.slice(startIndex, startIndex + pageSize);
  }, [filteredPlays, safeCurrentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== safeCurrentPage) {
      setCurrentPage(newPage);
      catalogGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle "İzledim" Toggle with Confetti & Storage Update
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

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query) {
      setSearchParams({ q: query });
    } else {
      setSearchParams({});
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('');
    setSelectedCompany('');
    setSelectedActor('');
    setSelectedCrewMember('');
    setSearchParams({});
  };

  const seenPercentage = plays.length > 0 ? Math.round((seenPlayIds.length / plays.length) * 100) : 0;
  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedGenre ||
    selectedCompany ||
    selectedActor ||
    selectedCrewMember
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Toast Feedback Notification */}
      {feedbackToast && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 bg-text-primary text-text-inverse text-xs px-4 py-2.5 rounded-sm shadow-modal flex items-center gap-2 border border-border-strong animate-fade-in font-mono">
          <Check className="w-4 h-4 text-stage-spotlight" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Modern Horizontal Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        genres={genres}
        selectedGenre={selectedGenre}
        onSelectGenre={setSelectedGenre}
        companies={companies}
        selectedCompany={selectedCompany}
        onSelectCompany={setSelectedCompany}
        actors={actors}
        selectedActor={selectedActor}
        onSelectActor={setSelectedActor}
        crewMembers={crewMembers}
        selectedCrewMember={selectedCrewMember}
        onSelectCrewMember={setSelectedCrewMember}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onResetFilters={handleResetFilters}
        totalPlaysCount={plays.length}
        filteredPlaysCount={filteredPlays.length}
      />

      {/* Active Filter Badges Bar */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap text-xs bg-layer-01/60 p-2.5 border border-border-subtle rounded-sm">
          <span className="text-text-secondary font-mono">Aktif Filtreler:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 bg-canvas border border-border-subtle px-2 py-0.5 rounded-sm">
              <span>Arama: "{searchQuery}"</span>
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="text-text-tertiary hover:text-theatre-curtain cursor-pointer"
              >
                ×
              </button>
            </span>
          )}
          {selectedGenre && (
            <span className="inline-flex items-center gap-1 bg-canvas border border-border-subtle px-2 py-0.5 rounded-sm">
              <span>Tür: {selectedGenre}</span>
              <button
                type="button"
                onClick={() => setSelectedGenre('')}
                className="text-text-tertiary hover:text-theatre-curtain cursor-pointer"
              >
                ×
              </button>
            </span>
          )}
          {selectedCompany && (
            <span className="inline-flex items-center gap-1 bg-canvas border border-border-subtle px-2 py-0.5 rounded-sm">
              <span>Topluluk: {selectedCompany}</span>
              <button
                type="button"
                onClick={() => setSelectedCompany('')}
                className="text-text-tertiary hover:text-theatre-curtain cursor-pointer"
              >
                ×
              </button>
            </span>
          )}
          {selectedActor && (
            <span className="inline-flex items-center gap-1 bg-canvas border border-border-subtle px-2 py-0.5 rounded-sm">
              <span>Oyuncu: {selectedActor}</span>
              <button
                type="button"
                onClick={() => setSelectedActor('')}
                className="text-text-tertiary hover:text-theatre-curtain cursor-pointer"
              >
                ×
              </button>
            </span>
          )}
          {selectedCrewMember && (
            <span className="inline-flex items-center gap-1 bg-canvas border border-border-subtle px-2 py-0.5 rounded-sm">
              <span>Yapım Ekibi: {selectedCrewMember}</span>
              <button
                type="button"
                onClick={() => setSelectedCrewMember('')}
                className="text-text-tertiary hover:text-theatre-curtain cursor-pointer"
              >
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

      {/* Expansive Full-Width Repertoire Grid */}
      <div ref={catalogGridRef} className="scroll-mt-6">
        {isLoading ? (
          /* Skeleton Loading Cards Grid */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: pageSize }).map((_, index) => (
              <div
                key={index}
                className="bg-canvas border border-border-subtle rounded-sm overflow-hidden flex flex-col pointer-events-none animate-pulse"
              >
                {/* Skeleton Poster Container */}
                <div className="relative aspect-[2/3] w-full bg-layer-01 border-b border-border-subtle flex items-center justify-center overflow-hidden">
                  <Theater className="w-8 h-8 text-text-tertiary/20" />
                  <div className="absolute top-2 right-2 w-9 h-5 bg-layer-02 rounded-sm" />
                </div>
                {/* Skeleton Meta Lines */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="h-4 bg-layer-02 rounded-xs w-3/4" />
                    <div className="h-3 bg-layer-01 rounded-xs w-1/2" />
                    <div className="h-2.5 bg-layer-01 rounded-xs w-2/3" />
                  </div>
                  <div className="pt-2 border-t border-border-subtle flex justify-end">
                    <div className="h-3 bg-layer-01 rounded-xs w-8" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedPlays.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {displayedPlays.map((play) => (
                <PlayCard
                  key={play.id}
                  play={play}
                  isSeen={seenPlayIds.includes(play.id)}
                  isWatchlisted={watchlistPlayIds.includes(play.id)}
                  onToggleSeen={handleToggleSeen}
                  onToggleWatchlist={handleToggleWatchlist}
                  onOpenLogModal={(p) => onOpenLogModal?.(p)}
                />
              ))}
            </div>

            {/* Pagination Bar (Responsive Page Size) */}
            {totalPages > 1 && (
              <div className="border-t border-border-subtle pt-6 pb-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Results count indicator */}
                <div className="text-xs font-mono text-text-secondary">
                  Toplam <strong className="text-text-primary">{filteredPlays.length}</strong> oyun arasından{' '}
                  <strong className="text-text-primary">
                    {(safeCurrentPage - 1) * pageSize + 1} - {Math.min(safeCurrentPage * pageSize, filteredPlays.length)}
                  </strong>{' '}
                  arası gösteriliyor (Sayfa {safeCurrentPage} / {totalPages})
                </div>

                {/* Page Navigation Controls */}
                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    type="button"
                    disabled={safeCurrentPage === 1}
                    onClick={() => handlePageChange(safeCurrentPage - 1)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-sm border transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-canvas hover:bg-layer-01 border-border-subtle text-text-primary"
                    aria-label="Önceki Sayfa"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Önceki</span>
                  </button>

                  {/* Page Indicator */}
                  <div className="px-3 py-1.5 text-xs font-mono font-medium text-text-secondary bg-layer-01 border border-border-subtle rounded-sm select-none">
                    Sayfa <strong className="text-text-primary">{safeCurrentPage}</strong> / {totalPages}
                  </div>

                  {/* Next Button */}
                  <button
                    type="button"
                    disabled={safeCurrentPage === totalPages}
                    onClick={() => handlePageChange(safeCurrentPage + 1)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-sm border transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-canvas hover:bg-layer-01 border-border-subtle text-text-primary"
                    aria-label="Sonraki Sayfa"
                  >
                    <span>Sonraki</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
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
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 bg-layer-01 hover:bg-layer-02 border border-border-subtle text-text-primary px-4 py-2 text-xs font-medium rounded-sm transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Filtreleri Temizle</span>
              </button>
              <Link
                to="/oyun-ekle"
                className="inline-flex items-center gap-1.5 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white px-4 py-2 text-xs font-medium rounded-sm transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Oyunu Kataloğa Ekle</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;

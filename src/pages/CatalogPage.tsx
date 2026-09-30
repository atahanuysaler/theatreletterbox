import React, { useState, useEffect, useMemo, useDeferredValue } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import type { Play } from '../types';
import { storageService } from '../services/storage';
import { normalizeSearchText } from '../utils/textUtils';

// Redesign components
import SearchBar from '../components/redesign/SearchBar';
import FilterRow, { SortOption, SORT_OPTIONS } from '../components/redesign/FilterRow';
import CatalogCard from '../components/redesign/CatalogCard';
import Pagination from '../components/redesign/Pagination';
import LoadMoreButton from '../components/redesign/LoadMoreButton';

const GENRES = [
  'Trajedi & Dram',
  'Komedi',
  'Müzikal & Kabare',
  'Deneysel & Absürd',
  'Performans',
  'Gösteri',
  'Çocuk & Genç',
  'Kukla',
  'Karakomedi',
  'Fiziksel Tiyatro',
];

interface CatalogPageProps {
  onOpenLogModal?: (play?: Play | null) => void;
  onOpenDailyQuote?: () => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const shouldAutoFocus = Boolean((location.state as { autoFocus?: boolean } | null)?.autoFocus);

  const urlSearchQuery = searchParams.get('q') || '';
  const urlGenreQuery = searchParams.get('genre') || searchParams.get('tur') || '';
  const urlCompanyQuery = searchParams.get('company') || searchParams.get('topluluk') || '';
  const urlActorQuery = searchParams.get('actor') || searchParams.get('oyuncu') || '';
  const urlSortParam = searchParams.get('sort');
  const urlSortQuery = (urlSortParam as SortOption) || 'rating_desc';
  const urlFiltersOpen = searchParams.get('filters') === 'open';

  // Data states
  const [plays, setPlays] = useState<Play[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [isFiltersOpen, setIsFiltersOpen] = useState(urlFiltersOpen);
  const [selectedGenre, setSelectedGenre] = useState(urlGenreQuery);
  const [selectedCompany, setSelectedCompany] = useState(urlCompanyQuery);
  const deferredCompanyQuery = useDeferredValue(selectedCompany);
  const [selectedActor, setSelectedActor] = useState(urlActorQuery);
  const deferredActorQuery = useDeferredValue(selectedActor);
  const [sortBy, setSortBy] = useState<SortOption>(urlSortQuery);
  const [isSortActive, setIsSortActive] = useState<boolean>(Boolean(urlSortParam));

  // Pagination & Progressive Loading
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileVisibleCount, setMobileVisibleCount] = useState(10);
  const pageSize = 30;

  // Clear autoFocus state after consumption
  useEffect(() => {
    if (shouldAutoFocus) {
      window.history.replaceState({}, document.title);
    }
  }, [shouldAutoFocus]);

  // Synchronize search query if URL changes externally
  useEffect(() => {
    if (urlSearchQuery !== searchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [urlSearchQuery]);

  // Synchronize state with URL query parameters
  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchQuery) params.q = searchQuery;
    if (selectedGenre) params.genre = selectedGenre;
    if (selectedCompany) params.company = selectedCompany;
    if (selectedActor) params.actor = selectedActor;
    if (isSortActive && sortBy) params.sort = sortBy;
    if (isFiltersOpen) params.filters = 'open';
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedGenre, selectedCompany, selectedActor, sortBy, isSortActive, isFiltersOpen, setSearchParams]);

  // Initial load
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const loadedPlays = await storageService.getPlays();
        if (isMounted) {
          setPlays(loadedPlays || []);
        }
      } catch (err) {
        console.error('[CatalogPage] Failed to fetch plays:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
    setMobileVisibleCount(10);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setIsSortActive(true);
    setCurrentPage(1);
    setMobileVisibleCount(10);
  };

  const handleResetSort = () => {
    setSortBy('rating_desc');
    setIsSortActive(false);
    setCurrentPage(1);
    setMobileVisibleCount(10);
  };

  const handleClearFilters = () => {
    setSelectedGenre('');
    setSelectedCompany('');
    setSelectedActor('');
    setSearchQuery('');
    setSortBy('rating_desc');
    setIsSortActive(false);
    setIsFiltersOpen(false);
    setSearchParams({}, { replace: true });
    setCurrentPage(1);
    setMobileVisibleCount(10);
  };

  // Derive filter options
  const companyOptions = useMemo(() => {
    const set = new Set<string>();
    plays.forEach((p) => {
      if (p.company?.trim() && p.company.trim().toLowerCase() !== 'belirtilmemiş') {
        set.add(p.company.trim());
      }
      if (p.director?.trim() && p.director.trim().toLowerCase() !== 'belirtilmemiş') {
        set.add(p.director.trim());
      }
      if (p.playwright?.trim() && p.playwright.trim().toLowerCase() !== 'belirtilmemiş') {
        set.add(p.playwright.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [plays]);

  const actorOptions = useMemo(() => {
    const set = new Set<string>();
    plays.forEach((p) => {
      p.cast?.forEach((c) => {
        if (c?.trim() && c.trim().toLowerCase() !== 'belirtilmemiş') {
          set.add(c.trim());
        }
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [plays]);

  // Standard Filtered & Sorted Plays (used for both search and browsing)
  const filteredPlays = useMemo(() => {
    let result = [...plays];

    // Text search query
    if (deferredSearchQuery.trim()) {
      const q = normalizeSearchText(deferredSearchQuery);
      result = result.filter((p) => {
        const titleMatch = normalizeSearchText(p.title).includes(q);
        const playwrightMatch = p.playwright ? normalizeSearchText(p.playwright).includes(q) : false;
        const companyMatch = p.company ? normalizeSearchText(p.company).includes(q) : false;
        const castMatch = p.cast ? p.cast.some((c) => normalizeSearchText(c).includes(q)) : false;
        const directorMatch = p.director ? normalizeSearchText(p.director).includes(q) : false;
        const synopsisMatch = p.synopsis ? normalizeSearchText(p.synopsis).includes(q) : false;
        return titleMatch || playwrightMatch || companyMatch || castMatch || directorMatch || synopsisMatch;
      });
    }

    // Genre filter
    if (selectedGenre) {
      const normalizedGenre = normalizeSearchText(selectedGenre);
      result = result.filter((p) => {
        if (!p.genre) return false;
        return normalizeSearchText(p.genre).includes(normalizedGenre);
      });
    }

    // Production / Company / Director / Playwright filter
    if (deferredCompanyQuery.trim()) {
      const q = normalizeSearchText(deferredCompanyQuery);
      result = result.filter((p) => {
        const companyMatch = p.company ? normalizeSearchText(p.company).includes(q) : false;
        const directorMatch = p.director ? normalizeSearchText(p.director).includes(q) : false;
        const playwrightMatch = p.playwright ? normalizeSearchText(p.playwright).includes(q) : false;
        return companyMatch || directorMatch || playwrightMatch;
      });
    }

    // Actor / Play's Cast filter
    if (deferredActorQuery.trim()) {
      const q = normalizeSearchText(deferredActorQuery);
      result = result.filter((p) => {
        if (!p.cast || p.cast.length === 0) return false;
        return p.cast.some((c) => c && normalizeSearchText(c).includes(q));
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'rating_desc') {
        const scoreA = (a.rating || 0) * 1000 + (a.reviewCount || 0);
        const scoreB = (b.rating || 0) * 1000 + (b.reviewCount || 0);
        return scoreB - scoreA;
      }
      if (sortBy === 'rating_asc') {
        return (a.rating || 0) - (b.rating || 0);
      }
      if (sortBy === 'year_desc') {
        return (b.year || 0) - (a.year || 0);
      }
      if (sortBy === 'reviews_desc') {
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      }
      if (sortBy === 'title_asc') {
        return a.title.localeCompare(b.title, 'tr');
      }
      return 0;
    });

    return result;
  }, [plays, deferredSearchQuery, selectedGenre, deferredCompanyQuery, deferredActorQuery, sortBy]);

  // Paginated Catalog (Desktop)
  const totalPages = Math.ceil(filteredPlays.length / pageSize);
  const paginatedPlays = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPlays.slice(start, start + pageSize);
  }, [filteredPlays, currentPage, pageSize]);

  // Mobile Catalog Progressive Slice
  const mobilePlays = useMemo(() => {
    return filteredPlays.slice(0, mobileVisibleCount);
  }, [filteredPlays, mobileVisibleCount]);

  const currentSortLabel = SORT_OPTIONS.find((s) => s.key === sortBy)?.label || 'En Yüksek Puan';

  return (
    <div className="w-full flex flex-col gap-2.5 sm:gap-3.5 font-serif text-tn-text">
      {/* 1. Dedicated Header */}
      <section className="flex justify-between items-end gap-5 py-1.5 sm:py-3 px-1 sm:px-1.5">
        <div>
          <h1 className="m-0 font-extrabold text-4xl sm:text-5xl lg:text-[56px] leading-[0.96] tracking-tight">
            Katalog
          </h1>
          <p className="m-0 text-tn-muted italic text-base sm:text-lg mt-1">
            Türk tiyatrosundaki tüm oyunlar, topluluklar ve yapımlar.
          </p>
        </div>
      </section>

      {/* 2. Search Bar with Controls */}
      <SearchBar
        value={searchQuery}
        onChange={handleSearchChange}
        autoFocus={shouldAutoFocus}
        totalCount={plays.length}
        isFiltersOpen={isFiltersOpen}
        onToggleFilters={() => setIsFiltersOpen(!isFiltersOpen)}
        activeFiltersCount={
          (selectedGenre ? 1 : 0) + (selectedCompany.trim() ? 1 : 0) + (selectedActor.trim() ? 1 : 0)
        }
        selectedSort={sortBy}
        onSortChange={handleSortChange}
        isSortActive={isSortActive}
        onResetSort={handleResetSort}
        onClearFilters={handleClearFilters}
      />

      {/* 3. Filter Row (collapsible genre chips panel) */}
      <FilterRow
        isOpen={isFiltersOpen}
        onToggleFilters={() => setIsFiltersOpen(!isFiltersOpen)}
        totalCount={filteredPlays.length}
        selectedGenre={selectedGenre}
        onGenreChange={(genre) => {
          setSelectedGenre(genre);
          setCurrentPage(1);
          setMobileVisibleCount(10);
        }}
        genreOptions={GENRES}
        selectedCompany={selectedCompany}
        onCompanyChange={(company) => {
          setSelectedCompany(company);
          setCurrentPage(1);
          setMobileVisibleCount(10);
        }}
        companyOptions={companyOptions}
        selectedActor={selectedActor}
        onActorChange={(actor) => {
          setSelectedActor(actor);
          setCurrentPage(1);
          setMobileVisibleCount(10);
        }}
        actorOptions={actorOptions}
        selectedSort={sortBy}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
      />

      {/* 4. Full Catalog Grid */}
      <section className="flex flex-col gap-1.5 mt-2 sm:mt-4">
        <div className="flex justify-between items-end px-1 sm:px-1.5 pb-2">
          <div>
            <h2 className="m-0 font-normal text-2xl sm:text-3xl leading-none tracking-tight">
              <span className="font-extrabold">{filteredPlays.length}</span>{' '}
              <span className="italic text-tn-muted">
                {searchQuery.trim() ? 'oyun bulundu' : 'oyun listeleniyor'}
              </span>
            </h2>
            <div className="sm:hidden italic text-sm text-tn-muted mt-1">
              Sıralama: {currentSortLabel}
            </div>
          </div>

          {/* Desktop count indicator */}
          <span className="hidden sm:inline text-xs sm:text-sm text-tn-muted">
            <span className="italic">Toplam</span>{' '}
            <span className="font-extrabold text-tn-text">{filteredPlays.length}</span>{' '}
            <span className="italic">
              oyun arasından {filteredPlays.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–
              {Math.min(currentPage * pageSize, filteredPlays.length)}
            </span>
          </span>
        </div>

        {/* Catalog plays listing */}
        {filteredPlays.length > 0 ? (
          <>
            {/* Desktop / Tablet Grid: 30 plays per page */}
            <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5">
              {paginatedPlays.map((play) => (
                <CatalogCard key={play.id} play={play} />
              ))}
            </div>

            {/* Mobile Grid: 2 columns, continuous slice */}
            <div className="sm:hidden grid grid-cols-2 gap-1.5">
              {mobilePlays.map((play) => (
                <CatalogCard key={play.id} play={play} />
              ))}
            </div>

            {/* Desktop Pagination */}
            {totalPages > 1 && (
              <div className="hidden sm:block mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                  }}
                />
              </div>
            )}

            {/* Mobile Load More Button */}
            {mobileVisibleCount < filteredPlays.length && (
              <div className="sm:hidden w-full pt-2">
                <LoadMoreButton
                  onClick={() => setMobileVisibleCount((prev) => prev + 10)}
                  remainingCount={Math.max(0, filteredPlays.length - mobileVisibleCount)}
                />
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-tn-line p-10 flex flex-col items-center justify-center text-center gap-2 font-serif min-h-[220px]">
            <span className="font-extrabold text-2xl text-tn-text">
              Aradığınız kriterlere uygun oyun bulunamadı.
            </span>
            <span className="italic text-base text-tn-muted max-w-md">
              {searchQuery.trim()
                ? `"${searchQuery}" terimiyle eşleşen sonuç bulunamadı. Farklı bir terim deneyebilir veya filtreleri temizleyebilirsiniz.`
                : 'Farklı filtre kriterleri deneyebilir veya filtreleri temizleyebilirsiniz.'}
            </span>
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={handleClearFilters}
                className="h-10 px-5 rounded-full bg-tn-surface hover:bg-tn-line/70 border border-tn-line text-tn-text text-sm font-semibold cursor-pointer transition-colors"
              >
                Filtreleri Temizle
              </button>
              <Link
                to="/oyun-ekle"
                className="h-10 px-5 rounded-full bg-tn-red text-white text-sm font-semibold flex items-center justify-center no-underline hover:bg-tn-red/90 transition-colors shadow-2xs"
              >
                Oyun Ekle
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default CatalogPage;

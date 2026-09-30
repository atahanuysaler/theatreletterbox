import React, { useState, useEffect, useMemo, useDeferredValue } from 'react';
import { useSearchParams, useLocation, Link, useNavigate } from 'react-router-dom';
import type { Play } from '../types';
import { storageService } from '../services/storage';
import { normalizeSearchText } from '../utils/textUtils';

// Redesign components
import SearchBar from '../components/redesign/SearchBar';
import FilterRow, { SortOption, SORT_OPTIONS } from '../components/redesign/FilterRow';
import CatalogCard from '../components/redesign/CatalogCard';
import Pagination from '../components/redesign/Pagination';
import LoadMoreButton from '../components/redesign/LoadMoreButton';
import CircleArrowButton from '../components/redesign/CircleArrowButton';

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

const QUICK_SEARCH_CHIPS = [
  { name: '#Trajedi & Dram', genre: 'Trajedi & Dram', bg: 'bg-tn-red text-white' },
  { name: '#Komedi', genre: 'Komedi', bg: 'bg-[#F6E3E3] text-tn-text border border-tn-line/40' },
  { name: '#Müzikal & Kabare', genre: 'Müzikal & Kabare', bg: 'bg-tn-ink text-white' },
  { name: '#Deneysel & Absürd', genre: 'Deneysel & Absürd', bg: 'bg-[#F1E3C4] text-tn-text border border-tn-line/40' },
  { name: '#Kukla', genre: 'Kukla', bg: 'bg-[#EDE7F6] text-tn-text border border-tn-line/40' },
];

interface SearchPerson {
  name: string;
  roles: string[];
  playCount: number;
}

interface SearchCompany {
  name: string;
  playCount: number;
}

interface CatalogPageProps {
  onOpenLogModal?: (play?: Play | null) => void;
  onOpenDailyQuote?: () => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = () => {
  const navigate = useNavigate();
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
  const [searchCategory, setSearchCategory] = useState<'all' | 'plays' | 'people' | 'companies'>('all');
  const [isFiltersOpen, setIsFiltersOpen] = useState(urlFiltersOpen);
  const [selectedGenre, setSelectedGenre] = useState(urlGenreQuery);
  const [selectedCompany, setSelectedCompany] = useState(urlCompanyQuery);
  const deferredCompanyQuery = useDeferredValue(selectedCompany);
  const [selectedActor, setSelectedActor] = useState(urlActorQuery);
  const deferredActorQuery = useDeferredValue(selectedActor);
  const [sortBy, setSortBy] = useState<SortOption>(urlSortQuery);
  const [isSortActive, setIsSortActive] = useState<boolean>(Boolean(urlSortParam));

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

  // Pagination & Progressive Loading
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileVisibleCount, setMobileVisibleCount] = useState(10);
  const pageSize = 30;

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
    setSearchCategory('all');
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
    setSearchCategory('all');
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

  // Dedicated Search Results Computation (for screenshots 08 & 09)
  const searchResults = useMemo(() => {
    const q = normalizeSearchText(deferredSearchQuery.trim());
    if (!q) {
      return { people: [], plays: [], companies: [], totalCount: 0 };
    }

    // Matching Plays
    const mPlays = plays.filter((p) => {
      const titleMatch = normalizeSearchText(p.title).includes(q);
      const playwrightMatch = p.playwright ? normalizeSearchText(p.playwright).includes(q) : false;
      const directorMatch = p.director ? normalizeSearchText(p.director).includes(q) : false;
      const companyMatch = p.company ? normalizeSearchText(p.company).includes(q) : false;
      const castMatch = p.cast ? p.cast.some((c) => normalizeSearchText(c).includes(q)) : false;
      const synopsisMatch = p.synopsis ? normalizeSearchText(p.synopsis).includes(q) : false;
      return titleMatch || playwrightMatch || directorMatch || companyMatch || castMatch || synopsisMatch;
    });

    // Matching People
    const peopleMap = new Map<string, { roles: Set<string>; playCount: number }>();
    plays.forEach((p) => {
      if (p.playwright && p.playwright.toLowerCase() !== 'belirtilmemiş') {
        if (normalizeSearchText(p.playwright).includes(q)) {
          const item = peopleMap.get(p.playwright) || { roles: new Set(), playCount: 0 };
          item.roles.add('Yazar');
          item.playCount += 1;
          peopleMap.set(p.playwright, item);
        }
      }
      if (p.director && p.director.toLowerCase() !== 'belirtilmemiş') {
        if (normalizeSearchText(p.director).includes(q)) {
          const item = peopleMap.get(p.director) || { roles: new Set(), playCount: 0 };
          item.roles.add('Yönetmen');
          item.playCount += 1;
          peopleMap.set(p.director, item);
        }
      }
      p.cast?.forEach((actor) => {
        if (actor && actor.toLowerCase() !== 'belirtilmemiş') {
          if (normalizeSearchText(actor).includes(q)) {
            const item = peopleMap.get(actor) || { roles: new Set(), playCount: 0 };
            item.roles.add('Oyuncu');
            item.playCount += 1;
            peopleMap.set(actor, item);
          }
        }
      });
    });

    const mPeople: SearchPerson[] = Array.from(peopleMap.entries()).map(([name, data]) => ({
      name,
      roles: Array.from(data.roles),
      playCount: data.playCount,
    }));

    // Matching Companies
    const companyMap = new Map<string, number>();
    plays.forEach((p) => {
      if (p.company && p.company.toLowerCase() !== 'belirtilmemiş') {
        if (normalizeSearchText(p.company).includes(q)) {
          companyMap.set(p.company, (companyMap.get(p.company) || 0) + 1);
        }
      }
    });

    const mCompanies: SearchCompany[] = Array.from(companyMap.entries()).map(([name, count]) => ({
      name,
      playCount: count,
    }));

    const total = mPlays.length + mPeople.length + mCompanies.length;
    return {
      people: mPeople,
      plays: mPlays,
      companies: mCompanies,
      totalCount: total,
    };
  }, [plays, deferredSearchQuery]);

  // Standard Filtered & Sorted Plays (for general catalog browsing)
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
        return titleMatch || playwrightMatch || companyMatch || castMatch || directorMatch;
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

  const renderInitials = (name?: string) => {
    if (!name) return 'TN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const playCardTints = ['#F6E3E3', '#EDE7F6', '#F7F2E7', '#E5ECE4'];

  const isSearchActive = Boolean(searchQuery.trim());

  return (
    <div className="w-full flex flex-col gap-2.5 sm:gap-3.5 font-serif text-tn-text">
      {/* 1. Dedicated Header (only when not searching) */}
      {!isSearchActive && (
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
      )}

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

      {/* 3. DEDICATED SEARCH RESULTS VIEW (Screenshots 08 & 09) */}
      {isSearchActive ? (
        <div className="flex flex-col gap-5 pt-2">
          {searchResults.totalCount > 0 ? (
            /* Screenshot 08: Arama Sonuçları */
            <>
              {/* Summary and Filter Pills */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 px-1">
                <span className="italic text-sm sm:text-lg text-tn-muted">
                  "{searchQuery}" için <strong className="text-tn-text not-italic">{searchResults.totalCount} sonuç</strong>
                </span>

                {/* Filter Pills (horizontally scrollable on mobile) */}
                <div className="flex gap-1.5 items-center overflow-x-auto no-scrollbar -mx-1 px-1 py-0.5">
                  <button
                    type="button"
                    onClick={() => setSearchCategory('all')}
                    className={`h-8 px-3.5 sm:px-4 rounded-full font-serif text-xs font-semibold cursor-pointer transition-colors border whitespace-nowrap shrink-0 ${
                      searchCategory === 'all'
                        ? 'bg-tn-ink text-white border-tn-ink shadow-2xs'
                        : 'bg-tn-surface text-tn-text border-tn-line hover:bg-tn-line/40'
                    }`}
                  >
                    Tümü {searchResults.totalCount}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSearchCategory('plays')}
                    className={`h-8 px-3.5 sm:px-4 rounded-full font-serif text-xs font-semibold cursor-pointer transition-colors border whitespace-nowrap shrink-0 ${
                      searchCategory === 'plays'
                        ? 'bg-tn-ink text-white border-tn-ink shadow-2xs'
                        : 'bg-tn-surface text-tn-text border-tn-line hover:bg-tn-line/40'
                    }`}
                  >
                    Oyunlar {searchResults.plays.length}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSearchCategory('people')}
                    className={`h-8 px-3.5 sm:px-4 rounded-full font-serif text-xs font-semibold cursor-pointer transition-colors border whitespace-nowrap shrink-0 ${
                      searchCategory === 'people'
                        ? 'bg-tn-ink text-white border-tn-ink shadow-2xs'
                        : 'bg-tn-surface text-tn-text border-tn-line hover:bg-tn-line/40'
                    }`}
                  >
                    Kişiler {searchResults.people.length}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSearchCategory('companies')}
                    className={`h-8 px-3.5 sm:px-4 rounded-full font-serif text-xs font-semibold cursor-pointer transition-colors border whitespace-nowrap shrink-0 ${
                      searchCategory === 'companies'
                        ? 'bg-tn-ink text-white border-tn-ink shadow-2xs'
                        : 'bg-tn-surface text-tn-text border-tn-line hover:bg-tn-line/40'
                    }`}
                  >
                    Topluluklar {searchResults.companies.length}
                  </button>
                </div>
              </div>

              {/* Kişiler Section */}
              {(searchCategory === 'all' || searchCategory === 'people') && searchResults.people.length > 0 && (
                <section className="flex flex-col gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-tn-muted px-1">
                    Kişiler · {searchResults.people.length}
                  </span>

                  <div className="flex flex-col gap-2">
                    {searchResults.people.map((person, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedActor(person.name);
                          setSearchQuery('');
                        }}
                        className="rounded-2xl bg-tn-ink text-white p-4 sm:p-5 flex items-center justify-between shadow-2xs cursor-pointer hover:bg-tn-ink/90 transition-all group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className="w-11 h-11 rounded-full bg-white text-tn-ink font-extrabold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                            {renderInitials(person.name)}
                          </span>

                          <div className="flex flex-col min-w-0">
                            <span className="font-extrabold text-lg sm:text-xl truncate text-white group-hover:text-tn-red transition-colors">
                              {person.name}
                            </span>
                            <span className="text-xs italic text-tn-on-dark-muted truncate">
                              {person.roles.join(' · ')} · Kataloğunda {person.playCount} oyun
                            </span>
                          </div>
                        </div>

                        <div className="w-9 h-9 rounded-full bg-white/10 group-hover:bg-white text-white group-hover:text-tn-ink flex items-center justify-center transition-all shrink-0">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M13 6l6 6-6 6" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Topluluklar Section */}
              {(searchCategory === 'all' || searchCategory === 'companies') && searchResults.companies.length > 0 && (
                <section className="flex flex-col gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-tn-muted px-1">
                    Topluluklar · {searchResults.companies.length}
                  </span>

                  <div className="flex flex-col gap-2">
                    {searchResults.companies.map((company, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedCompany(company.name);
                          setSearchQuery('');
                        }}
                        className="rounded-2xl bg-tn-ink text-white p-4 sm:p-5 flex items-center justify-between shadow-2xs cursor-pointer hover:bg-tn-ink/90 transition-all group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className="w-11 h-11 rounded-full bg-tn-sand text-tn-text font-extrabold text-sm flex items-center justify-center shrink-0 shadow-2xs border border-white/20">
                            {renderInitials(company.name)}
                          </span>

                          <div className="flex flex-col min-w-0">
                            <span className="font-extrabold text-lg sm:text-xl truncate text-white group-hover:text-tn-red transition-colors">
                              {company.name}
                            </span>
                            <span className="text-xs italic text-tn-on-dark-muted truncate">
                              Topluluk · Kataloğunda {company.playCount} oyun
                            </span>
                          </div>
                        </div>

                        <div className="w-9 h-9 rounded-full bg-white/10 group-hover:bg-white text-white group-hover:text-tn-ink flex items-center justify-center transition-all shrink-0">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M13 6l6 6-6 6" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Oyunlar Section */}
              {(searchCategory === 'all' || searchCategory === 'plays') && searchResults.plays.length > 0 && (
                <section className="flex flex-col gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-tn-muted px-1">
                    Oyunlar · {searchResults.plays.length}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {searchResults.plays.map((play, idx) => {
                      const bgTint = playCardTints[idx % playCardTints.length];
                      return (
                        <Link
                          key={play.id}
                          to={`/oyun/${play.id}`}
                          style={{ backgroundColor: bgTint }}
                          className="rounded-2xl p-5 sm:p-6 flex flex-col justify-between min-h-[200px] border border-tn-line/40 text-tn-text no-underline group hover:scale-[1.01] transition-transform shadow-2xs"
                        >
                          {/* Rating Pill */}
                          <div className="self-start">
                            <span className="h-6 px-2.5 rounded-full bg-white/85 dark:bg-black/20 border border-tn-line/40 text-xs font-bold text-tn-text flex items-center gap-1 shadow-2xs">
                              ★ {play.rating ? play.rating.toFixed(1) : '5.0'}
                            </span>
                          </div>

                          {/* Title & Subtitle */}
                          <div className="my-3">
                            <h3 className="m-0 font-extrabold text-xl sm:text-2xl leading-tight text-tn-text group-hover:text-tn-red transition-colors line-clamp-1">
                              {play.title}
                            </h3>
                            <div className="text-xs sm:text-sm italic text-tn-muted truncate mt-0.5">
                              {play.playwright || play.director || ''}
                              {play.company ? ` / ${play.company}` : ''}
                            </div>
                          </div>

                          {/* Genre & Year */}
                          <div className="flex justify-between items-center text-[11px] font-extrabold uppercase tracking-wider text-tn-muted border-t border-tn-line/30 pt-2.5">
                            <span>{play.genre?.toUpperCase() || 'KOMEDİ'}</span>
                            <span>{play.year || '2024'}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}
            </>
          ) : (
            /* Screenshot 09: Arama - Sonuç Yok */
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl bg-tn-surface border border-tn-line p-10 sm:p-14 text-center flex flex-col items-center gap-3 font-serif shadow-2xs">
                <h2 className="m-0 text-3xl sm:text-4xl text-tn-text">
                  <span className="font-extrabold">Sahnede</span> <span className="italic font-normal">kimse yok.</span>
                </h2>

                <p className="m-0 italic text-sm sm:text-base text-tn-muted max-w-lg leading-relaxed pt-1">
                  "{searchQuery}" için katalogla eşleşen oyun, kişi ya da topluluk bulamadık. Yazımı kontrol et ya da daha kısa bir kelime dene.
                </p>

                {/* Quick Genre Chips */}
                <div className="flex flex-wrap justify-center gap-2 pt-3">
                  {QUICK_SEARCH_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedGenre(chip.genre);
                        setSearchQuery('');
                      }}
                      className={`h-8 px-4 rounded-full font-serif text-xs font-semibold cursor-pointer transition-transform hover:scale-105 ${chip.bg}`}
                    >
                      {chip.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Banner Card: Aradığın oyun katalogda yok mu? */}
              <div className="rounded-2xl bg-tn-surface border border-tn-line p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-2xs">
                <div>
                  <div className="font-extrabold text-base sm:text-lg text-tn-text">
                    Aradığın oyun katalogda yok mu?
                  </div>
                  <div className="italic text-xs sm:text-sm text-tn-muted mt-0.5">
                    Kütüphaneye ekle, editör onayıyla kataloğa girsin.
                  </div>
                </div>

                <Link
                  to="/oyun-ekle"
                  className="w-full sm:w-auto h-10 sm:h-9 px-6 rounded-full bg-tn-red text-white hover:bg-tn-red/90 font-serif text-sm font-semibold flex items-center justify-center no-underline transition-colors shadow-2xs shrink-0 text-center"
                >
                  Oyun Ekle
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* STANDARD CATALOG BROWSING (when no search query) */
        <>
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
                  <span className="italic text-tn-muted">oyun listeleniyor</span>
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
                  oyun arasından {(currentPage - 1) * pageSize + 1}–
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
              </>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-tn-line p-10 flex flex-col items-center justify-center text-center gap-2 font-serif min-h-[220px]">
                <span className="font-extrabold text-2xl text-tn-text">
                  Aradığınız kriterlere uygun oyun bulunamadı.
                </span>
                <span className="italic text-base text-tn-muted">
                  Farklı bir arama terimi deneyebilir veya filtreleri temizleyebilirsiniz.
                </span>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-3 h-10 px-5 rounded-full bg-tn-red text-white text-sm font-semibold cursor-pointer border-none hover:bg-tn-red/90 transition-colors"
                >
                  Filtreleri Temizle
                </button>
              </div>
            )}

            {/* Desktop Pagination */}
            <div className="hidden sm:block">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  setCurrentPage(page);
                }}
              />
            </div>

            {/* Mobile Load More Button */}
            {mobileVisibleCount < filteredPlays.length && (
              <div className="sm:hidden w-full pt-2">
                <LoadMoreButton
                  onClick={() => setMobileVisibleCount((prev) => prev + 10)}
                  remainingCount={Math.max(0, filteredPlays.length - mobileVisibleCount)}
                />
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default CatalogPage;

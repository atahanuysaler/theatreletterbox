import React, { useState, useEffect, useMemo, useRef, useDeferredValue } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import type { Play, ReviewEntry, UserProfile, CuratedList } from '../types';
import { storageService } from '../services/storage';
import { useAuthSafe } from '../context/AuthContext';
import { normalizeSearchText } from '../utils/textUtils';

// Redesign components
import SiteHeader from '../components/redesign/SiteHeader';
import SearchBar from '../components/redesign/SearchBar';
import FilterRow, { SortOption } from '../components/redesign/FilterRow';
import HashtagChip from '../components/redesign/HashtagChip';
import FeaturedCard from '../components/redesign/FeaturedCard';
import SplitCard from '../components/redesign/SplitCard';
import SenDeYazOval from '../components/redesign/SenDeYazOval';
import TicketNote from '../components/redesign/TicketNote';
import PuzzleCard from '../components/redesign/PuzzleCard';
import LeaderboardSnippet from '../components/redesign/LeaderboardSnippet';
import CuratedListCard from '../components/redesign/CuratedListCard';
import CatalogCard from '../components/redesign/CatalogCard';
import Pagination from '../components/redesign/Pagination';
import Footer from '../components/redesign/Footer';
import MobileTabBar from '../components/redesign/MobileTabBar';

// Interactive Modals
import DailyQuoteModal from '../components/DailyQuoteModal';
import OyuncuDedektifiModal from '../components/OyuncuDedektifiModal';
import TriviaModal from '../components/TriviaModal';
import WordPuzzleModal from '../components/WordPuzzleModal';
import SocialShareModal from '../components/SocialShareModal';

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

export const CatalogPage: React.FC<CatalogPageProps> = ({
  onOpenLogModal,
  onOpenDailyQuote,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearchQuery = searchParams.get('q') || '';
  const urlGenreQuery = searchParams.get('genre') || '';

  const auth = useAuthSafe();
  const activeUserId = auth?.user?.uid;

  // Data states
  const [plays, setPlays] = useState<Play[]>([]);
  const [reviews, setReviews] = useState<ReviewEntry[]>([]);
  const [curatedLists, setCuratedLists] = useState<CuratedList[]>([]);
  const [topUsers, setTopUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(urlGenreQuery);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedActor, setSelectedActor] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('rating_desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 30;

  // Modals state
  const [isDailyQuoteOpen, setIsDailyQuoteOpen] = useState(false);
  const [isActorDetectiveOpen, setIsActorDetectiveOpen] = useState(false);
  const [isTriviaOpen, setIsTriviaOpen] = useState(false);
  const [isWordPuzzleOpen, setIsWordPuzzleOpen] = useState(false);
  const [shareReview, setShareReview] = useState<ReviewEntry | null>(null);

  // Initial load
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [loadedPlays, loadedReviews, loadedLists, loadedUsers] = await Promise.all([
          storageService.getPlays(),
          storageService.getReviews(),
          storageService.getCuratedLists().catch(() => []),
          storageService.getAllUsers().catch(() => []),
        ]);

        if (isMounted) {
          setPlays(loadedPlays || []);
          setReviews(loadedReviews || []);
          setCuratedLists(loadedLists || []);
          setTopUsers(loadedUsers || []);
        }
      } catch (err) {
        console.error('[CatalogPage] Failed to fetch data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync with search URL
  useEffect(() => {
    if (urlSearchQuery !== searchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [urlSearchQuery]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
    if (val.trim()) {
      setSearchParams({ q: val }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const handleGenreChipClick = (genre: string) => {
    if (selectedGenre === genre) {
      setSelectedGenre('');
    } else {
      setSelectedGenre(genre);
    }
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedGenre('');
    setSelectedCompany('');
    setSelectedActor('');
    setSearchQuery('');
    setSearchParams({}, { replace: true });
    setCurrentPage(1);
  };

  // Derive filter options
  const companyOptions = useMemo(() => {
    const set = new Set<string>();
    plays.forEach((p) => {
      if (p.company?.trim()) set.add(p.company.trim());
    });
    return Array.from(set).sort();
  }, [plays]);

  const actorOptions = useMemo(() => {
    const set = new Set<string>();
    plays.forEach((p) => {
      p.cast?.forEach((c) => {
        if (c?.trim()) set.add(c.trim());
      });
    });
    return Array.from(set).slice(0, 50).sort();
  }, [plays]);

  // Filtering & Sorting
  const filteredPlays = useMemo(() => {
    let result = [...plays];

    // Search query
    const q = normalizeSearchText(deferredSearchQuery.trim());
    if (q) {
      result = result.filter((p) => {
        const titleNorm = normalizeSearchText(p.title);
        const origTitleNorm = normalizeSearchText(p.originalTitle || '');
        const writerNorm = normalizeSearchText(p.playwright || '');
        const directorNorm = normalizeSearchText(p.director || '');
        const companyNorm = normalizeSearchText(p.company || '');
        const castNorm = (p.cast || []).map((c) => normalizeSearchText(c));

        if (titleNorm.includes(q)) return true;
        if (origTitleNorm.includes(q)) return true;
        if (writerNorm.includes(q)) return true;
        if (directorNorm.includes(q)) return true;
        if (companyNorm.includes(q)) return true;
        if (castNorm.some((c) => c.includes(q))) return true;

        return false;
      });
    }

    // Genre filter
    if (selectedGenre) {
      const gNorm = normalizeSearchText(selectedGenre);
      result = result.filter((p) => {
        const pGenre = normalizeSearchText(p.genre || '');
        const tags = (p.tags || []).map((t) => normalizeSearchText(t));
        return pGenre.includes(gNorm) || tags.some((t) => t.includes(gNorm));
      });
    }

    // Company filter
    if (selectedCompany) {
      result = result.filter((p) => p.company === selectedCompany);
    }

    // Actor filter
    if (selectedActor) {
      result = result.filter((p) => p.cast?.includes(selectedActor));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'rating_desc') {
        const diff = (b.rating || 0) - (a.rating || 0);
        if (diff !== 0) return diff;
        return (b.reviewCount || 0) - (a.reviewCount || 0);
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
  }, [plays, deferredSearchQuery, selectedGenre, selectedCompany, selectedActor, sortBy]);

  // Paginated Catalog
  const totalPages = Math.ceil(filteredPlays.length / pageSize);
  const paginatedPlays = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPlays.slice(start, start + pageSize);
  }, [filteredPlays, currentPage, pageSize]);

  // Bento highlights
  const featuredPlay = useMemo(() => {
    return plays.find((p) => p.rating === 5 && p.posterUrl) || plays[0];
  }, [plays]);

  const splitCardPlays = useMemo(() => {
    return plays
      .filter((p) => p.id !== featuredPlay?.id && p.posterUrl)
      .slice(0, 3);
  }, [plays, featuredPlay]);

  const recentReviews = useMemo(() => {
    return reviews.slice(0, 2);
  }, [reviews]);

  return (
    <div className="w-full flex flex-col gap-1.5 font-serif text-tn-text">
      {/* 2. Intro Slogan */}
      <section className="flex justify-between items-end gap-10 py-2.5 sm:py-4 px-1 sm:px-1.5">
        <h1 className="m-0 font-normal text-3xl sm:text-5xl lg:text-[64px] leading-[0.95] tracking-tight max-w-[900px]">
          Türk tiyatrosunun <span className="font-extrabold">kataloğu,</span> senin{' '}
          <span className="italic text-tn-red">sahne not defterin.</span>
        </h1>
      </section>

      {/* 3. Search Bar with Controls */}
      <SearchBar
        value={searchQuery}
        onChange={handleSearchChange}
        totalCount={plays.length}
        isFiltersOpen={isFiltersOpen}
        onToggleFilters={() => setIsFiltersOpen(!isFiltersOpen)}
        activeFiltersCount={
          (selectedGenre ? 1 : 0) + (selectedCompany ? 1 : 0) + (selectedActor ? 1 : 0)
        }
        selectedSort={sortBy}
        onSortChange={setSortBy}
        onClearFilters={handleClearFilters}
      />

      {/* 4. Collapsible Filter Row (Contains genres, company, actor, and active filter pills) */}
      <FilterRow
        isOpen={isFiltersOpen}
        selectedGenre={selectedGenre}
        onGenreChange={setSelectedGenre}
        genreOptions={GENRES}
        selectedCompany={selectedCompany}
        onCompanyChange={setSelectedCompany}
        companyOptions={companyOptions}
        selectedActor={selectedActor}
        onActorChange={setSelectedActor}
        actorOptions={actorOptions}
        selectedSort={sortBy}
        onSortChange={setSortBy}
        onClearFilters={handleClearFilters}
      />

      {/* 6. Bento Grid (visible when not searching) */}
      {!searchQuery && !selectedGenre && !selectedCompany && !selectedActor && (
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-1.5">
          {/* Row 1: Col 1 Featured, Col 2-3 Scene / Wide Preview */}
          {featuredPlay && (
            <div className="lg:col-span-1 min-h-[440px]">
              <FeaturedCard play={featuredPlay} badgeText="Ayakta Alkış" />
            </div>
          )}

          {featuredPlay && (
            <Link
              to={`/oyun/${featuredPlay.id}`}
              className="lg:col-span-2 rounded-2xl p-5 flex flex-col justify-between min-h-[320px] lg:min-h-[440px] bg-cover bg-center relative overflow-hidden no-underline text-white group cursor-pointer hover:shadow-md transition-shadow"
              style={{
                backgroundColor: '#DDD5CB',
                backgroundImage: featuredPlay.posterUrl ? `url(${featuredPlay.posterUrl})` : undefined,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 group-hover:from-black/90 transition-colors pointer-events-none" />

              <span className="self-end relative z-10 h-7.5 px-3 flex items-center rounded-full bg-white/80 dark:bg-tn-container/80 backdrop-blur-xs text-xs sm:text-[13px] italic text-[#5E5852] dark:text-tn-text">
                Sahne fotoğrafı · {featuredPlay.title}
              </span>

              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
                <span className="text-sm sm:text-base text-white/95 max-w-[520px] italic drop-shadow-sm line-clamp-3 group-hover:underline">
                  {featuredPlay.synopsis ||
                    'Gece yarısı iki çocuğuyla sığınacak yer arayan Aydan, bir lunaparkta çalışan Hasret’in evine girer…'}
                </span>
                {featuredPlay.cast && featuredPlay.cast.length > 0 && (
                  <span className="h-7.5 px-3 flex items-center rounded-full bg-white/90 dark:bg-tn-container/90 text-xs sm:text-[13px] font-semibold text-tn-text whitespace-nowrap shadow-xs">
                    {featuredPlay.cast.slice(0, 2).join(' · ')}
                  </span>
                )}
              </div>
            </Link>
          )}

          {/* Row 2: 3 Split Cards */}
          {splitCardPlays.map((p, idx) => {
            const variants: Array<'blush' | 'sage' | 'sand'> = ['blush', 'sage', 'sand'];
            return (
              <div key={p.id} className="min-h-[460px]">
                <SplitCard play={p} colorVariant={variants[idx % 3]} />
              </div>
            );
          })}

          {/* Row 3: Col 1 SEN DE YAZ oval, Col 2-3 Latest Ticket Notes */}
          <div className="lg:col-span-1 min-h-[380px]">
            <SenDeYazOval onClick={() => onOpenLogModal?.(null)} />
          </div>

          <section className="lg:col-span-2 rounded-2xl bg-tn-ink text-white p-5 sm:p-5.5 flex flex-col gap-3.5 shadow-sm min-h-[380px]">
            <div className="flex justify-between items-baseline">
              <h2 className="m-0 font-normal text-3xl sm:text-[42px] leading-none text-white">
                Son <span className="font-extrabold">Seyirci</span>{' '}
                <span className="italic text-[#E2DCD4]">Notları</span>
              </h2>
              <span className="italic text-sm text-[#B8B0A8]">Seyirci Günlüğü’nden</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 flex-grow">
              {recentReviews.length > 0 ? (
                recentReviews.map((r) => (
                  <TicketNote
                    key={r.id}
                    review={r}
                    variant="horizontal"
                    onShare={(rev) => setShareReview(rev)}
                  />
                ))
              ) : (
                <div className="col-span-2 rounded-xl border border-white/20 p-6 flex flex-col items-center justify-center text-center">
                  <span className="italic text-base text-white/80">
                    Henüz seyirci notu bırakılmamış. İlk notu sen yaz!
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Row 4: Col 1-2 Daily Puzzles, Col 3 Leaders */}
          <section
            id="bulmacalar"
            className="lg:col-span-2 rounded-2xl bg-[#F1E3C4] p-5 sm:p-5.5 flex flex-col gap-3.5 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
              <div>
                <span className="text-xs font-extrabold tracking-wider text-tn-text">
                  GÜNLÜK TİYATRO BULMACALARI
                </span>
                <h2 className="m-0 mt-1 font-extrabold text-3xl sm:text-[40px] leading-tight">
                  Bulmacalar{' '}
                  <span className="font-normal italic text-lg sm:text-2xl text-[#4A4541]">
                    — sahne hafızanı tazele, XP kazan.
                  </span>
                </h2>
              </div>
              <span className="italic text-xs sm:text-sm text-[#5E5852] whitespace-nowrap">
                Her gece 00:00’da yenilenir
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 flex-grow">
              <PuzzleCard
                title="Günün Repliği"
                subtitle="Replik Tahmin Bulmacası"
                description="Kült oyunlardan seçilen unutulmaz repliği en az tahminle ve ipuçlarıyla bul."
                badge="HER GÜN YENİ"
                xpReward={30}
                estimatedTime="~2 dk"
                bgVariant="cream"
                onClick={() => setIsDailyQuoteOpen(true)}
              />
              <PuzzleCard
                title="Oyuncu Dedektifi"
                subtitle="Usta Oyuncu Tahmini"
                description="Usta oyuncuları rolleri, efsane tiradları ve kariyer ipuçlarıyla keşfet."
                badge="YENİ"
                xpReward={30}
                estimatedTime="2 dk"
                bgVariant="sand"
                onClick={() => setIsActorDetectiveOpen(true)}
              />
              <PuzzleCard
                title="Sahne Trivia"
                subtitle="Günlük Tiyatro Bilgi Testi"
                description="Tiyatro tarihi, yazarlar, prömiyerler ve sahne arkası üzerine 5 soru."
                badge="BİLGİ YARIŞI"
                xpReward={25}
                estimatedTime="2 dk"
                bgVariant="sand"
                onClick={() => setIsTriviaOpen(true)}
              />
              <PuzzleCard
                title="Perde Arkası: Kelime"
                subtitle="Tiyatro Jargonu & Terimler"
                description="Tirad, fuaye, sufle, kulis… sahne jargonunu harf ve anlam ipuçlarıyla çöz."
                badge="KELİME OYUNU"
                xpReward={25}
                estimatedTime="2 dk"
                bgVariant="cream"
                onClick={() => setIsWordPuzzleOpen(true)}
              />
            </div>
          </section>

          <div className="lg:col-span-1">
            <LeaderboardSnippet topUsers={topUsers} />
          </div>
        </main>
      )}

      {/* 7. Curated Lists (when not filtered) */}
      {!searchQuery && !selectedGenre && !selectedCompany && !selectedActor && (
        <section id="listeler" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 my-2">
          <CuratedListCard
            category="BÖLGE & MEKÂN"
            playCount={4}
            title="Kadıköy Sahnelerinde Bu Sezon"
            description="Moda Sahnesi, Oyun Atölyesi, Kadıköy Emek ve Boa Sahne’de parlayan alternatif ve bağımsız seçki."
            curator="— Tiyatronot Editör Masası"
            colorVariant="ink"
          />
          <CuratedListCard
            category="PERFORMANS"
            playCount={3}
            title="Tek Kişilik Dev Performanslar"
            description="Bütün sahneyi tek bir nefesle dolduran çağdaş ve klasik monolog başyapıtları."
            curator="— Tiyatro Kulübü"
            colorVariant="lilac"
          />
          <CuratedListCard
            category="YERLİ METİN"
            playCount={3}
            title="Çağdaş Türk Tiyatrosu Seçkisi"
            description="Haldun Taner, Turgut Özakman ve yeni kuşak yerli yazarların unutulmaz metinleri."
            curator="— Dramaturg Gözü"
            colorVariant="sage"
          />
          <CuratedListCard
            category="DÜNYA KLASİĞİ"
            playCount={3}
            title="Klasiklerin Çağdaş Yorumları"
            description="Shakespeare, Çehov, Beckett ve Molière’in günümüz yönetmenlerince cesur yorumları."
            curator="— Sahne Notu"
            colorVariant="red"
          />
        </section>
      )}

      {/* 8. Full Catalog Grid */}
      <section className="flex flex-col gap-1.5 mt-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-1 px-1.5 pb-2">
          <h2 className="m-0 font-normal text-3xl sm:text-5xl leading-none tracking-tight">
            <span className="font-extrabold">Katalog</span>{' '}
            <span className="italic text-tn-muted">
              {searchQuery ? `— "${searchQuery}" için sonuçlar` : '— tüm oyunlar'}
            </span>
          </h2>
          <span className="text-xs sm:text-sm text-tn-muted">
            <span className="italic">Toplam</span>{' '}
            <span className="font-extrabold text-tn-text">{filteredPlays.length}</span>{' '}
            <span className="italic">
              oyun arasından {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filteredPlays.length)}
            </span>
          </span>
        </div>

        {/* 6-column grid on desktop, 2-column on mobile */}
        {paginatedPlays.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5">
            {paginatedPlays.map((play) => (
              <CatalogCard key={play.id} play={play} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-tn-border p-10 flex flex-col items-center justify-center text-center gap-2 font-serif min-h-[220px]">
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

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 600, behavior: 'smooth' });
          }}
          onLoadMore={() => {
            if (currentPage < totalPages) {
              setCurrentPage((p) => p + 1);
            }
          }}
          hasMore={currentPage < totalPages}
        />
      </section>

      {/* Modals */}
      <DailyQuoteModal isOpen={isDailyQuoteOpen} onClose={() => setIsDailyQuoteOpen(false)} />
      <OyuncuDedektifiModal isOpen={isActorDetectiveOpen} onClose={() => setIsActorDetectiveOpen(false)} />
      <TriviaModal isOpen={isTriviaOpen} onClose={() => setIsTriviaOpen(false)} />
      <WordPuzzleModal isOpen={isWordPuzzleOpen} onClose={() => setIsWordPuzzleOpen(false)} />
      {shareReview && (
        <SocialShareModal
          isOpen={Boolean(shareReview)}
          onClose={() => setShareReview(null)}
          review={shareReview}
          play={
            plays.find((p) => p.id === shareReview.playId) || {
              id: shareReview.playId,
              title: shareReview.playTitle,
              originalTitle: '',
              playwright: '',
              director: '',
              cast: [],
              company: '',
              duration: 90,
              hasIntermission: false,
              year: 2026,
              genre: 'Tiyatro',
              venue: shareReview.venue || '',
              posterUrl: shareReview.playPosterUrl || '',
              synopsis: '',
              rating: shareReview.rating || 5,
              reviewCount: 1,
              tags: [],
            }
          }
        />
      )}
    </div>
  );
};

export default CatalogPage;

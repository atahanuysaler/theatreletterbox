import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Play, ReviewEntry, UserProfile, CuratedList } from '../types';
import { storageService } from '../services/storage';
import { CURATED_LISTS } from '../data/curatedListsData';

// Redesign components
import SearchBar from '../components/redesign/SearchBar';
import SplitCard from '../components/redesign/SplitCard';
import SenDeYazOval from '../components/redesign/SenDeYazOval';
import TicketNote from '../components/redesign/TicketNote';
import PuzzleCard from '../components/redesign/PuzzleCard';
import LeaderboardSnippet from '../components/redesign/LeaderboardSnippet';
import CuratedListCard from '../components/redesign/CuratedListCard';

// Interactive Modals
import DailyQuoteModal from '../components/DailyQuoteModal';
import OyuncuDedektifiModal from '../components/OyuncuDedektifiModal';
import TriviaModal from '../components/TriviaModal';
import WordPuzzleModal from '../components/WordPuzzleModal';
import SocialShareModal from '../components/SocialShareModal';

interface HomePageProps {
  onOpenLogModal?: (play?: Play | null) => void;
  onOpenDailyQuote?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenLogModal,
  onOpenDailyQuote,
}) => {
  const navigate = useNavigate();

  // Data states
  const [plays, setPlays] = useState<Play[]>([]);
  const [reviews, setReviews] = useState<ReviewEntry[]>([]);
  const [curatedLists, setCuratedLists] = useState<CuratedList[]>([]);
  const [topUsers, setTopUsers] = useState<UserProfile[]>([]);
  const [featuredPlayIds, setFeaturedPlayIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search input on home forwards to catalog
  const [searchQuery, setSearchQuery] = useState('');

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
        const [loadedPlays, loadedReviews, loadedLists, loadedUsers, loadedFeaturedIds] = await Promise.all([
          storageService.getPlays(),
          storageService.getReviews(),
          storageService.getCuratedLists().catch(() => []),
          storageService.getAllUsers().catch(() => []),
          storageService.getHomepageFeaturedPlayIds().catch(() => []),
        ]);

        if (isMounted) {
          setPlays(loadedPlays || []);
          setReviews(loadedReviews || []);
          setCuratedLists(loadedLists && loadedLists.length > 0 ? loadedLists : CURATED_LISTS);
          const sortedUsers = (loadedUsers || []).sort((a, b) => (b.xp || 0) - (a.xp || 0));
          setTopUsers(sortedUsers);
          setFeaturedPlayIds(loadedFeaturedIds || []);
        }
      } catch (err) {
        console.error('[HomePage] Failed to fetch data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for admin changes to highlighted plays
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<string[]>;
      if (customEvent.detail) setFeaturedPlayIds(customEvent.detail);
    };
    window.addEventListener('tiyatronot:homepage-featured-updated', handleUpdate);
    return () => window.removeEventListener('tiyatronot:homepage-featured-updated', handleUpdate);
  }, []);

  // Highlighted plays (1 featured hero + 3 secondary split cards = 4 highlighted plays)
  const { featuredPlay, splitCardPlays } = useMemo(() => {
    if (plays.length === 0) return { featuredPlay: null, splitCardPlays: [] };

    // If custom IDs are configured, resolve them in order
    if (featuredPlayIds.length > 0) {
      const playMap = new Map(plays.map(p => [p.id, p]));
      const resolved = featuredPlayIds.map(id => playMap.get(id)).filter(Boolean) as Play[];
      if (resolved.length > 0) {
        const hero = resolved[0];
        const secondary = resolved.slice(1, 4);
        if (secondary.length < 3) {
          const used = new Set([hero.id, ...secondary.map(p => p.id)]);
          const remaining = plays.filter(p => !used.has(p.id) && p.posterUrl);
          secondary.push(...remaining.slice(0, 3 - secondary.length));
        }
        return { featuredPlay: hero, splitCardPlays: secondary };
      }
    }

    // Default fallback
    const hero = plays.find((p) => p.rating === 5 && p.posterUrl) || plays[0];
    const secondary = plays
      .filter((p) => p.id !== hero?.id && p.posterUrl)
      .slice(0, 3);
    return { featuredPlay: hero, splitCardPlays: secondary };
  }, [plays, featuredPlayIds]);

  const recentReviews = useMemo(() => {
    const playMap = new Map(plays.map((p) => [p.id, p]));
    const saticininOlumuPlay = plays.find(
      (p) => p.title.toLowerCase().includes('satıcı') || p.title.toLowerCase().includes('ölümü')
    );
    const clownJamPlay = plays.find((p) => p.title.toLowerCase().includes('clown'));

    const fallbackReviews: ReviewEntry[] = [
      {
        id: 'mock-rev-1',
        playId: saticininOlumuPlay?.id || 'p-saticinin-olumu',
        playTitle: saticininOlumuPlay?.title || 'Satıcının Ölümü',
        playPosterUrl:
          saticininOlumuPlay?.posterUrl ||
          'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400&q=80',
        userId: 'u-1',
        userName: 'Atahan Uysaler',
        rating: 5.0,
        reviewText: 'gözlerimi arda ergulden alamadım maalesef..',
        performanceDate: '10 Eyl',
        hasSpoilers: false,
        likes: 12,
        createdAt: '2026-09-10T20:00:00Z',
      },
      {
        id: 'mock-rev-2',
        playId: clownJamPlay?.id || 'p-clown-jam',
        playTitle: clownJamPlay?.title || 'Clown Jam',
        playPosterUrl:
          clownJamPlay?.posterUrl ||
          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
        userId: 'u-1',
        userName: 'Atahan Uysaler',
        rating: 5.0,
        reviewText: 'cemre kaboglu zaveyo performansı.. yorumsuz',
        performanceDate: '10 Eyl',
        hasSpoilers: false,
        likes: 8,
        createdAt: '2026-09-10T20:00:00Z',
      },
    ];

    if (!reviews || reviews.length === 0) {
      return fallbackReviews;
    }

    const mapped = reviews.slice(0, 2).map((r) => {
      const play = playMap.get(r.playId);
      return {
        ...r,
        playPosterUrl: r.playPosterUrl || play?.posterUrl || '',
      };
    });

    if (mapped.length < 2) {
      mapped.push(fallbackReviews[1]);
    }
    return mapped;
  }, [reviews, plays]);

  const sharePlay = useMemo(() => {
    if (!shareReview) return null;
    return plays.find((p) => p.id === shareReview.playId) || null;
  }, [shareReview, plays]);

  const handleSearchFocus = () => {
    navigate('/katalog', { state: { autoFocus: true } });
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.trim()) {
      navigate(`/katalog?q=${encodeURIComponent(val)}`, { state: { autoFocus: true } });
    }
  };

  const handleToggleFilters = () => {
    navigate('/katalog?filters=open');
  };

  return (
    <div className="w-full flex flex-col gap-2 sm:gap-2.5 font-sans text-tn-text">
      {/* 1. Intro Slogan */}
      <section className="flex justify-between items-end gap-5 sm:gap-10 py-1.5 sm:py-3 px-1 sm:px-1.5">
        <h1 className="m-0 font-display font-normal text-[32px] sm:text-[40px] md:text-[clamp(40px,6vw,88px)] leading-[0.96] md:leading-[0.92] tracking-[-0.04em] max-w-[960px]">
          Türk tiyatrosunun <span className="font-extrabold">kataloğu,</span> senin{' '}
          <span className="font-accent italic font-normal text-tn-red">sahne not defterin.</span>
        </h1>
      </section>

      {/* 2. Search Bar */}
      <SearchBar
        value={searchQuery}
        onChange={handleSearchChange}
        onFocus={handleSearchFocus}
        onSubmit={() => navigate(searchQuery.trim() ? `/katalog?q=${encodeURIComponent(searchQuery.trim())}` : '/katalog', { state: { autoFocus: true } })}
        totalCount={plays.length}
        isFiltersOpen={false}
        onToggleFilters={handleToggleFilters}
        onSortChange={(sort) => navigate(`/katalog?sort=${sort}`)}
        placeholder="Oyun, topluluk, yazar veya oyuncu ara…"
      />

      {/* 3. DESKTOP BENTO GRID */}
      <main className="hidden md:grid md:grid-cols-3 gap-1.5 mt-1">
        {/* Row 1: Featured Play Card */}
        {featuredPlay && (
          <div className="col-span-3 h-[400px] lg:h-[450px]">
            <SplitCard play={featuredPlay} variant="hero" colorVariant="red" />
          </div>
        )}

        {/* Row 2: 3 Showcased Split Cards with different colors */}
        {splitCardPlays.map((p, idx) => {
          const colors: Array<'ink' | 'lilac' | 'sage'> = ['ink', 'lilac', 'sage'];
          return (
            <div key={p.id} className="col-span-1 h-[260px] sm:h-[270px]">
              <SplitCard play={p} colorVariant={colors[idx % colors.length]} />
            </div>
          );
        })}

        {/* Row 3: Col 1 SEN DE YAZ, Col 2-3 Son Seyirci Notları */}
        <div className="col-span-1 min-h-[380px]">
          <SenDeYazOval onClick={() => onOpenLogModal?.(null)} />
        </div>

        <section
          aria-label="Son seyirci notları"
          className="col-span-2 rounded-[24px] bg-[#1C1A1B] text-white p-5 sm:p-6 lg:p-7 flex flex-col gap-3.5 sm:gap-4 shadow-sm"
        >
          <div>
            <h2 className="m-0 font-display font-extrabold text-[22px] sm:text-[28px] lg:text-[34px] leading-normal text-white tracking-[-0.03em]">
              Son seyirci <span className="font-accent italic font-normal text-[#E2DCD4]">notları</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {recentReviews.map((r) => (
              <TicketNote
                key={r.id}
                review={r}
                variant="bento"
                onShare={(rev) => setShareReview(rev)}
              />
            ))}
          </div>
        </section>

        {/* Row 4: Col 1-2 Bulmacalar (4 columns), Col 3 Sahne Liderleri */}
        <section className="col-span-2 rounded-[24px] bg-[#F1E3C4] dark:bg-[#251E17] text-[#1C1A1B] dark:text-[#F3EFEA] p-5 sm:p-6 lg:p-7 flex flex-col justify-between shadow-sm min-h-[380px] border border-[#E5D5B3] dark:border-[#382E24]">
          {/* Header */}
          <div>
            <div className="flex justify-between items-center gap-2">
              <Link
                to="/bulmacalar"
                className="m-0 font-display font-extrabold text-[22px] sm:text-[28px] lg:text-[34px] leading-normal text-[#1C1A1B] dark:text-white tracking-[-0.03em] hover:text-tn-red transition-colors no-underline block"
              >
                Günün <span className="font-accent italic font-normal">bulmacaları</span>
              </Link>
              {/* Desktop Header Pills */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#2E2824] text-[#1C1A1B] dark:text-white font-sans text-xs font-semibold shadow-xs">
                  <span>🔥</span>
                  <span>3 gün seri</span>
                </div>
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1C1A1B] text-white dark:bg-white dark:text-[#1C1A1B] font-sans text-xs font-semibold shadow-xs">
                  <span className="text-[#F1C40F]">★</span>
                  <span>110 XP</span>
                </div>
              </div>
            </div>

            {/* Segmented Progress */}
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className="w-7 h-1.5 rounded-full bg-[#1C1A1B] dark:bg-white" />
              <span className="w-7 h-1.5 rounded-full bg-[#1C1A1B]/15 dark:bg-white/20" />
              <span className="w-7 h-1.5 rounded-full bg-[#1C1A1B]/15 dark:bg-white/20" />
              <span className="w-7 h-1.5 rounded-full bg-[#1C1A1B]/15 dark:bg-white/20" />
              <span className="font-sans font-medium text-xs sm:text-[13px] text-[#1C1A1B]/70 dark:text-white/70 ml-2">
                1 / 4 tamamlandı
              </span>
            </div>
          </div>

          {/* Cards Grid: 4 columns in 1 row */}
          <div className="grid grid-cols-4 gap-2.5 mt-4">
            <PuzzleCard
              title="Günün Repliği"
              colorVariant="red"
              xpReward={30}
              isCompleted={true}
              statusText="Tamamlandı"
              onClick={() => setIsDailyQuoteOpen(true)}
            />
            <PuzzleCard
              title="Oyuncu Dedektifi"
              colorVariant="dark"
              xpReward={30}
              onClick={() => setIsActorDetectiveOpen(true)}
            />
            <PuzzleCard
              title="Sahne Trivia"
              colorVariant="lilac"
              xpReward={25}
              onClick={() => setIsTriviaOpen(true)}
            />
            <PuzzleCard
              title="Perde Arkası"
              colorVariant="sage"
              xpReward={25}
              onClick={() => setIsWordPuzzleOpen(true)}
            />
          </div>
        </section>

        <div className="col-span-1 h-full">
          <LeaderboardSnippet topUsers={topUsers} />
        </div>
      </main>

      {/* 4. MOBILE VERTICAL BENTO */}
      <div className="md:hidden flex flex-col gap-2.5 mt-1">
        {/* Mobile Featured Card */}
        {featuredPlay && (
          <div className="w-full h-[200px] sm:h-[250px]">
            <SplitCard play={featuredPlay} variant="hero" colorVariant="red" />
          </div>
        )}

        {/* Mobile Split Cards Carousel */}
        <div className="flex gap-2.5 overflow-x-auto -mx-2 px-2 no-scrollbar snap-x snap-mandatory pt-1 pb-1">
          {splitCardPlays.map((p, idx) => {
            const colors: Array<'ink' | 'lilac' | 'sage'> = ['ink', 'lilac', 'sage'];
            return (
              <div key={p.id} className="flex-shrink-0 w-[285px] sm:w-[330px] h-[195px] sm:h-[240px] snap-center">
                <SplitCard play={p} colorVariant={colors[idx % colors.length]} />
              </div>
            );
          })}

          {/* 4th Card: Go to Catalog */}
          <div className="flex-shrink-0 w-[240px] sm:w-[280px] h-[195px] sm:h-[240px] snap-center">
            <Link
              to="/katalog"
              className="w-full h-full rounded-[20px] bg-[#1C1A1B] text-white p-5 flex flex-col justify-between no-underline shadow-sm transition-all hover:scale-[1.01] hover:shadow-md border border-white/10 group"
            >
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0 group-hover:bg-tn-red group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0l-7-7m7 7l-7 7" />
                  </svg>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-[#E2DCD4] text-[11px] font-sans font-semibold">
                  {plays.length}+ Oyun
                </span>
              </div>

              <div>
                <div className="font-display font-extrabold text-[20px] sm:text-[22px] leading-tight text-white tracking-[-0.02em]">
                  Tüm Kataloğu<br />
                  <span className="font-accent italic font-normal text-[#E2DCD4]">Keşfet</span>
                </div>
                <div className="font-sans text-xs text-white/70 mt-1.5 flex items-center gap-1 group-hover:text-tn-red transition-colors font-medium">
                  <span>Kataloğa git</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Mobile Sen De Yaz */}
        <SenDeYazOval onClick={() => onOpenLogModal?.(null)} />

        {/* Mobile Seyirci Notları */}
        <section className="rounded-[20px] sm:rounded-[24px] bg-[#1C1A1B] text-white pt-4 pb-3.5 px-3.5 sm:p-6 flex flex-col gap-2.5 shadow-sm">
          <div className="pt-0.5">
            <h2 className="m-0 font-display font-extrabold text-[20px] sm:text-[26px] lg:text-[32px] leading-normal text-white tracking-[-0.03em]">
              Son seyirci <span className="font-accent italic font-normal text-[#E2DCD4]">notları</span>
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            {recentReviews.map((r) => (
              <TicketNote
                key={r.id}
                review={r}
                variant="bento"
                onShare={(rev) => setShareReview(rev)}
              />
            ))}
          </div>
        </section>

        {/* Mobile Bulmacalar */}
        <section className="rounded-[20px] sm:rounded-[24px] bg-[#F1E3C4] dark:bg-[#251E17] text-[#1C1A1B] dark:text-[#F3EFEA] pt-4 pb-3.5 px-3.5 sm:p-6 flex flex-col gap-2 sm:gap-2.5 shadow-sm border border-[#E5D5B3] dark:border-[#382E24]">
          <div>
            <div className="flex justify-between items-center gap-2">
              <div className="pt-0.5">
                <Link
                  to="/bulmacalar"
                  className="m-0 font-display font-extrabold text-[20px] sm:text-[26px] lg:text-[32px] leading-normal text-[#1C1A1B] dark:text-white tracking-[-0.03em] hover:text-tn-red transition-colors no-underline block"
                >
                  Günün <span className="font-accent italic font-normal">bulmacaları</span>
                </Link>
              </div>
              {/* Mobile Header Pills */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white dark:bg-[#2E2824] text-[#1C1A1B] dark:text-white font-sans text-[11px] sm:text-xs font-semibold shadow-xs">
                  <span>🔥</span>
                  <span>3</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1C1A1B] text-white dark:bg-white dark:text-[#1C1A1B] font-sans text-[11px] sm:text-xs font-semibold shadow-xs">
                  <span className="text-[#F1C40F]">★</span>
                  <span>110</span>
                </div>
              </div>
            </div>

            {/* Subheader: Segments on left, 1 / 4 tamamlandı on right */}
            <div className="flex justify-between items-center mt-1.5 sm:mt-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-5 sm:w-6 h-1 sm:h-1.5 rounded-full bg-[#1C1A1B] dark:bg-white" />
                <span className="w-5 sm:w-6 h-1 sm:h-1.5 rounded-full bg-[#1C1A1B]/15 dark:bg-white/20" />
                <span className="w-5 sm:w-6 h-1 sm:h-1.5 rounded-full bg-[#1C1A1B]/15 dark:bg-white/20" />
                <span className="w-5 sm:w-6 h-1 sm:h-1.5 rounded-full bg-[#1C1A1B]/15 dark:bg-white/20" />
              </div>
              <span className="font-sans font-medium text-[11px] sm:text-xs text-[#1C1A1B]/75 dark:text-white/75">
                1 / 4 tamamlandı
              </span>
            </div>
          </div>

          {/* Mobile 2x2 Grid */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
            <PuzzleCard
              title="Günün Repliği"
              colorVariant="red"
              xpReward={30}
              isCompleted={true}
              statusText="Tamamlandı"
              onClick={() => setIsDailyQuoteOpen(true)}
            />
            <PuzzleCard
              title="Oyuncu Dedektifi"
              colorVariant="dark"
              xpReward={30}
              onClick={() => setIsActorDetectiveOpen(true)}
            />
            <PuzzleCard
              title="Sahne Trivia"
              colorVariant="lilac"
              xpReward={25}
              onClick={() => setIsTriviaOpen(true)}
            />
            <PuzzleCard
              title="Perde Arkası"
              colorVariant="sage"
              xpReward={25}
              onClick={() => setIsWordPuzzleOpen(true)}
            />
          </div>
        </section>

        {/* Mobile Sahne Liderleri */}
        <LeaderboardSnippet topUsers={topUsers} />
      </div>

      {/* 5. Curated Lists */}
      <section id="listeler" className="my-2 sm:my-3">
        <div className="flex justify-between items-center mb-2.5 sm:mb-3 px-1">
          <Link
            to="/listeler"
            className="group inline-flex items-center no-underline"
          >
            <h2 className="m-0 font-display font-extrabold text-[20px] sm:text-[26px] lg:text-[32px] leading-normal text-tn-text dark:text-white tracking-[-0.03em] group-hover:text-tn-red transition-colors">
              Küratörlü <span className="font-accent italic font-normal">listeler</span>
            </h2>
          </Link>
        </div>

        {/* Desktop Curated Lists Grid (4 columns) */}
        <div className="hidden md:grid md:grid-cols-4 gap-3">
          {curatedLists.slice(0, 4).map((list, idx) => {
            const variants: Array<'ink' | 'lilac' | 'sage' | 'red'> = ['ink', 'lilac', 'sage', 'red'];
            return (
              <CuratedListCard
                key={list.id}
                id={list.id}
                category={list.category || 'SEÇKİ'}
                playCount={list.playIds?.length || 4}
                title={list.title}
                description={list.description}
                curator={list.curator || 'Tiyatronot'}
                colorVariant={variants[idx % 4]}
              />
            );
          })}
        </div>

        {/* Mobile Curated Lists 2x2 Grid (matches Image 4) */}
        <div className="md:hidden grid grid-cols-2 gap-2.5">
          {curatedLists.slice(0, 4).map((list, idx) => {
            const variants: Array<'ink' | 'lilac' | 'sage' | 'red'> = ['ink', 'lilac', 'sage', 'red'];
            return (
              <CuratedListCard
                key={list.id}
                id={list.id}
                category={list.category || 'SEÇKİ'}
                playCount={list.playIds?.length || 4}
                title={list.title}
                description={list.description}
                curator={list.curator || 'Tiyatronot'}
                colorVariant={variants[idx % 4]}
              />
            );
          })}
        </div>
      </section>

      {/* 6. Callout: Go to Full Catalogue */}
      <section className="my-4 sm:my-6 p-6 sm:p-8 rounded-2xl bg-tn-surface border border-tn-line/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
        <div>
          <h3 className="m-0 text-2xl sm:text-3xl font-display font-extrabold tracking-[-0.03em]">
            Tüm Oyunları ve Toplulukları Keşfet
          </h3>
          <p className="m-0 text-tn-muted font-accent italic font-normal text-base mt-1">
            Yüzlerce sahne eseri, filtreleme ve sıralama seçenekleriyle katalog sayfasında seni bekliyor.
          </p>
        </div>
        <Link
          to="/katalog"
          className="h-12 px-7 rounded-xl bg-tn-ink text-white font-sans font-semibold text-base inline-flex items-center justify-center hover:bg-black/90 transition-all no-underline shadow-sm flex-shrink-0"
        >
          Kataloğa Git
        </Link>
      </section>

      {/* Modals */}
      <DailyQuoteModal isOpen={isDailyQuoteOpen} onClose={() => setIsDailyQuoteOpen(false)} />
      <OyuncuDedektifiModal isOpen={isActorDetectiveOpen} onClose={() => setIsActorDetectiveOpen(false)} />
      <TriviaModal isOpen={isTriviaOpen} onClose={() => setIsTriviaOpen(false)} />
      <WordPuzzleModal isOpen={isWordPuzzleOpen} onClose={() => setIsWordPuzzleOpen(false)} />
      {shareReview && sharePlay && (
        <SocialShareModal
          isOpen={Boolean(shareReview)}
          onClose={() => setShareReview(null)}
          review={shareReview}
          play={sharePlay}
        />
      )}
    </div>
  );
};

export default HomePage;

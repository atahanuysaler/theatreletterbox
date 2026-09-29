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
        const [loadedPlays, loadedReviews, loadedLists, loadedUsers] = await Promise.all([
          storageService.getPlays(),
          storageService.getReviews(),
          storageService.getCuratedLists().catch(() => []),
          storageService.getAllUsers().catch(() => []),
        ]);

        if (isMounted) {
          setPlays(loadedPlays || []);
          setReviews(loadedReviews || []);
          setCuratedLists(loadedLists && loadedLists.length > 0 ? loadedLists : CURATED_LISTS);
          setTopUsers(loadedUsers || []);
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

  // Featured and Split cards
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
    <div className="w-full flex flex-col gap-2 sm:gap-2.5 font-serif text-tn-text">
      {/* 1. Intro Slogan */}
      <section className="flex justify-between items-end gap-5 sm:gap-10 py-1.5 sm:py-3 px-1 sm:px-1.5">
        <h1 className="m-0 font-normal text-[38px] sm:text-5xl lg:text-[64px] leading-[0.96] sm:leading-[0.95] tracking-tight max-w-[900px]">
          Türk tiyatrosunun <span className="font-extrabold">kataloğu,</span> senin{' '}
          <span className="italic text-tn-red">sahne not defterin.</span>
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
        {/* Row 1: Unified Featured Play Card */}
        {featuredPlay && (
          <Link
            to={`/oyun/${featuredPlay.id}`}
            className="col-span-3 rounded-2xl overflow-hidden bg-tn-red text-white flex flex-col lg:flex-row no-underline group shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 min-h-[440px] cursor-pointer"
            aria-label={`${featuredPlay.title} oyun detayına git`}
          >
            {/* Left: Editorial Content & Description */}
            <div className="w-full lg:w-[42%] p-6 sm:p-7 flex flex-col justify-between font-serif z-10 bg-tn-red flex-shrink-0">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="h-6.5 px-3 flex items-center border border-white/75 rounded-full text-[13px] italic bg-white/10 backdrop-blur-xs">
                    Ayakta Alkış
                  </span>
                  <span className="text-base font-semibold">
                    ★ {featuredPlay.rating ? featuredPlay.rating.toFixed(1) : '5.0'}{' '}
                    <span className="font-normal italic opacity-85">
                      ({featuredPlay.reviewCount || 1} not)
                    </span>
                  </span>
                </div>

                <div>
                  <h2 className="m-0 font-extrabold text-4xl sm:text-5xl lg:text-[54px] leading-[0.92] tracking-tight group-hover:text-white transition-colors">
                    {featuredPlay.title}
                  </h2>
                  {featuredPlay.playwright && !featuredPlay.playwright.toLowerCase().includes('belirtilme') && (
                    <div className="italic text-xl sm:text-2xl leading-tight mt-1 opacity-95">
                      {featuredPlay.playwright}
                    </div>
                  )}
                </div>

                <p className="m-0 text-sm sm:text-[15px] opacity-85 italic">
                  {featuredPlay.genre || 'Tiyatro'}
                  {featuredPlay.duration ? ` · ${featuredPlay.duration} dk` : ''}
                  {featuredPlay.year ? ` — ${featuredPlay.year}` : ''}
                </p>

                {/* Shortened Game Description on Left */}
                {featuredPlay.synopsis && (
                  <p className="m-0 text-sm sm:text-[15px] leading-snug text-white/90 italic line-clamp-3 sm:line-clamp-4 drop-shadow-xs pt-1">
                    {featuredPlay.synopsis}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Scene photo with arrow on bottom right */}
            <div
              className="w-full lg:w-[58%] min-h-[300px] lg:min-h-[440px] p-6 flex flex-col justify-between relative overflow-hidden text-white"
              style={{
                backgroundColor: '#2B2927',
              }}
            >
              {/* Background photo with hover zoom */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{
                  backgroundImage: featuredPlay.posterUrl ? `url(${featuredPlay.posterUrl})` : undefined,
                }}
              />
              {/* Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/15 pointer-events-none" />
              <div className="hidden lg:block absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-tn-red via-tn-red/60 to-transparent pointer-events-none" />

              {/* Top Badge */}
              <span className="self-end relative z-10 h-7.5 px-3 flex items-center rounded-full bg-black/60 backdrop-blur-md text-xs sm:text-[13px] italic text-white/95 shadow-xs border border-white/20">
                Sahne fotoğrafı · {featuredPlay.title}
              </span>

              {/* Bottom Right: Circular Arrow Button */}
              <div className="relative z-10 self-end">
                <div className="w-12 h-12 rounded-full bg-tn-ink text-white flex items-center justify-center group-hover:bg-white group-hover:text-tn-ink group-hover:scale-105 transition-all duration-300 shadow-lg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Row 2: 3 Split Cards (blush, sage, sand) */}
        {splitCardPlays.map((p, idx) => {
          const variants: Array<'blush' | 'sage' | 'sand'> = ['blush', 'sage', 'sand'];
          return (
            <div key={p.id} className="h-[460px]">
              <SplitCard play={p} colorVariant={variants[idx % 3]} />
            </div>
          );
        })}

        {/* Row 3: Col 1 SEN DE YAZ, Col 2-3 Son Seyirci Notları */}
        <div className="col-span-1 min-h-[380px]">
          <SenDeYazOval onClick={() => onOpenLogModal?.(null)} />
        </div>

        <section
          aria-label="Son seyirci notları"
          className="col-span-2 rounded-2xl bg-tn-ink text-white p-6 sm:p-7 flex flex-col justify-between shadow-sm min-h-[380px]"
        >
          <div className="flex flex-col gap-3">
            <h2 className="m-0 font-normal text-3xl sm:text-[38px] leading-tight text-white tracking-tight">
              Son <span className="font-extrabold">Seyirci</span> <span className="italic text-[#E2DCD4]">Notları</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
              {recentReviews.length > 0 ? (
                recentReviews.map((r) => (
                  <TicketNote key={r.id} review={r} onShare={(rev) => setShareReview(rev)} />
                ))
              ) : (
                <div className="col-span-2 rounded-xl border border-white/20 p-6 text-center">
                  <span className="italic text-base text-white/80">
                    Henüz seyirci notu bırakılmamış. İlk notu sen yaz!
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-3">
            <span className="italic text-sm text-tn-on-dark-muted">
              Tiyatroseverlerin son paylaştığı izlenimler
            </span>
            <Link
              to="/izlediklerim"
              className="text-sm font-semibold text-white hover:text-tn-red transition-colors no-underline"
            >
              Tüm Notları Gör →
            </Link>
          </div>
        </section>

        {/* Row 4: Col 1-2 Bulmacalar (2x2 grid), Col 3 Sahne Liderleri */}
        <section className="col-span-2 rounded-[20px] bg-[#F1E3C4] dark:bg-[#251E17] text-[#1C1A1B] dark:text-[#F3EFEA] p-3.5 sm:p-7 flex flex-col gap-3 sm:gap-4 shadow-sm min-h-[380px] sm:min-h-[460px] border border-[#E5D5B3] dark:border-[#382E24]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 sm:gap-2 pb-1 border-b border-[#1C1A1B]/10 dark:border-white/10">
            <div>
              <span className="text-[10.5px] sm:text-[12px] font-extrabold tracking-wider uppercase text-[#1C1A1B] dark:text-[#F3EFEA]">
                GÜNLÜK TİYATRO BULMACALARI
              </span>
              <h2 className="m-0 mt-0.5 sm:mt-1 font-extrabold text-2xl sm:text-[40px] leading-tight text-[#1C1A1B] dark:text-[#FFFFFF]">
                Bulmacalar <span className="font-normal italic text-lg sm:text-[24px] text-[#1C1A1B]/80 dark:text-[#F3EFEA]/80 hidden sm:inline">— sahne hafızanı tazele, XP kazan.</span>
              </h2>
              <p className="sm:hidden m-0 mt-0.5 text-xs italic text-[#5E5852] dark:text-[#A8A199]">
                Sahne hafızanı tazele, XP kazan. Her gece 00:00’da yenilenir.
              </p>
            </div>
            <span className="italic text-sm sm:text-[15px] text-[#5E5852] dark:text-[#A8A199] hidden sm:inline">
              Her gece 00:00’da yenilenir
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <PuzzleCard
              title="Günün Repliği"
              subtitle="Replik Tahmin Oyunu"
              description="Kült oyunlardan unutulmaz repliği tahmin et, hafızanı tazele."
              badge="YENİ"
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

        <div className="col-span-1">
          <LeaderboardSnippet topUsers={topUsers} />
        </div>
      </main>

      {/* 4. MOBILE VERTICAL BENTO */}
      <div className="md:hidden flex flex-col gap-1.5 mt-1">
        {/* Mobile Featured Card */}
        {featuredPlay && (
          <Link
            to={`/oyun/${featuredPlay.id}`}
            className="rounded-2xl overflow-hidden bg-tn-red text-white flex flex-col font-serif shadow-sm no-underline active:scale-[0.99] transition-all group"
            aria-label={`${featuredPlay.title} detayına git`}
          >
            <div className="pt-6 pb-4 px-5 flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="h-6.5 px-3 flex items-center border border-white/75 rounded-full text-[13px] italic bg-white/10 backdrop-blur-xs">
                  Ayakta Alkış
                </span>
                <span className="text-[15px] font-semibold">
                  ★ {featuredPlay.rating ? featuredPlay.rating.toFixed(1) : '5.0'}{' '}
                  <span className="font-normal italic opacity-85">
                    ({featuredPlay.reviewCount || 1} not)
                  </span>
                </span>
              </div>
              <div>
                <h2 className="m-0 font-extrabold text-[32px] sm:text-4xl leading-tight tracking-tight">
                  {featuredPlay.title}
                </h2>
                {featuredPlay.playwright && !featuredPlay.playwright.toLowerCase().includes('belirtilme') && (
                  <div className="italic text-lg sm:text-xl leading-snug mt-1 opacity-95">
                    {featuredPlay.playwright}
                  </div>
                )}
              </div>
              <p className="m-0 text-sm opacity-85 italic">
                {featuredPlay.genre || 'Tiyatro'}
                {featuredPlay.duration ? ` · ${featuredPlay.duration} dk` : ''}
                {featuredPlay.year ? ` — ${featuredPlay.year}` : ''}
              </p>
              {featuredPlay.synopsis && (
                <p className="m-0 text-sm leading-snug opacity-90 italic line-clamp-3 pt-1">
                  {featuredPlay.synopsis}
                </p>
              )}
            </div>

            {/* Seamless Scene Photo Section */}
            <div
              className="relative w-full h-[220px] p-4 box-border flex justify-between items-end bg-cover bg-center overflow-hidden"
              style={{
                backgroundColor: '#2B2927',
                backgroundImage: featuredPlay.posterUrl ? `url(${featuredPlay.posterUrl})` : undefined,
              }}
            >
              {/* Soft gradient blend from red header down into photo */}
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-tn-red via-tn-red/60 to-transparent pointer-events-none z-10" />

              {/* Bottom gradient overlay for caption and button contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

              {/* Caption badge */}
              <span className="relative z-20 h-7 px-3 flex items-center rounded-full bg-black/60 backdrop-blur-md text-[13px] italic text-white/95 shadow-xs border border-white/20">
                Sahne fotoğrafı · {featuredPlay.title}
              </span>

              {/* Circular arrow button */}
              <div className="relative z-20 w-11 h-11 rounded-full bg-tn-ink text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </div>
            </div>
          </Link>
        )}

        {/* Mobile Split Cards Carousel */}
        <div className="flex justify-between items-baseline px-1.5 pt-3 pb-1">
          <h2 className="m-0 text-2xl sm:text-[28px] leading-tight">
            <span className="font-extrabold">Öne</span> <span className="italic">çıkanlar</span>
          </h2>
          <span className="text-xs sm:text-sm italic text-tn-muted">kaydır →</span>
        </div>
        <div className="flex gap-2.5 overflow-x-auto -mx-2 px-2 no-scrollbar snap-x snap-mandatory py-1">
          {splitCardPlays.map((p, idx) => {
            const variants: Array<'blush' | 'sage' | 'sand'> = ['blush', 'sage', 'sand'];
            return (
              <div key={p.id} className="flex-shrink-0 w-[295px] h-[420px] snap-center">
                <SplitCard play={p} colorVariant={variants[idx % 3]} />
              </div>
            );
          })}
        </div>

        {/* Mobile Sen De Yaz */}
        <SenDeYazOval onClick={() => onOpenLogModal?.(null)} />

        {/* Mobile Seyirci Notları */}
        <section className="rounded-2xl bg-tn-ink text-white pt-6 pb-5 px-4.5 sm:p-6 flex flex-col gap-3 shadow-sm">
          <div className="px-1 text-center flex flex-col items-center">
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-tn-on-dark-muted block mb-1">
              SEYİRCİ GÜNLÜĞÜ
            </span>
            <h2 className="m-0 font-normal text-2xl sm:text-[28px] leading-tight text-white tracking-tight">
              Son <span className="font-extrabold">Seyirci</span> <span className="italic text-[#E2DCD4]">Notları</span>
            </h2>
          </div>
          <div className="flex flex-col gap-1.5">
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
              <div className="rounded-xl border border-white/20 p-5 text-center">
                <span className="italic text-sm text-white/80">
                  Henüz seyirci notu bırakılmamış. İlk notu sen yaz!
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Mobile Bulmacalar */}
        <section className="rounded-2xl bg-tn-sand pt-6 pb-5 px-4.5 sm:p-6 flex flex-col gap-3 shadow-sm">
          <div className="px-1 text-center flex flex-col items-center">
            <span className="text-[11px] font-extrabold tracking-wider text-tn-text/80 uppercase block mb-1">
              GÜNLÜK TİYATRO BULMACALARI
            </span>
            <h2 className="m-0 font-extrabold text-2xl sm:text-[28px] leading-tight text-tn-text tracking-tight">
              Bulmacalar
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <PuzzleCard
              title="Günün Repliği"
              subtitle="Replik Tahmin"
              description="Kült oyunlardan unutulmaz repliği çöz."
              badge="YENİ"
              xpReward={30}
              estimatedTime="~2 dk"
              bgVariant="cream"
              onClick={() => setIsDailyQuoteOpen(true)}
            />
            <PuzzleCard
              title="Oyuncu Dedektifi"
              subtitle="Usta Oyuncu"
              description="Oyuncuyu rolleri ve tiradlarıyla keşfet."
              badge="YENİ"
              xpReward={30}
              estimatedTime="2 dk"
              bgVariant="sand"
              onClick={() => setIsActorDetectiveOpen(true)}
            />
            <PuzzleCard
              title="Sahne Trivia"
              subtitle="Bilgi Testi"
              description="Tiyatro tarihi üzerine 5 soru."
              badge="YARIŞ"
              xpReward={25}
              estimatedTime="2 dk"
              bgVariant="sand"
              onClick={() => setIsTriviaOpen(true)}
            />
            <PuzzleCard
              title="Perde Arkası"
              subtitle="Kelime Oyunu"
              description="Tiyatro jargonunu harflerle bul."
              badge="KELİME"
              xpReward={25}
              estimatedTime="2 dk"
              bgVariant="cream"
              onClick={() => setIsWordPuzzleOpen(true)}
            />
          </div>
        </section>

        {/* Mobile Sahne Liderleri */}
        <LeaderboardSnippet topUsers={topUsers} />
      </div>

      {/* 5. Curated Lists */}
      <section id="listeler" className="my-2 sm:my-3">
        {/* Desktop Curated Lists Grid */}
        <div className="hidden md:grid md:grid-cols-4 gap-1.5">
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

        {/* Mobile Curated Lists Carousel */}
        <div className="md:hidden flex flex-col gap-2">
          <div className="flex justify-between items-baseline px-1.5 pt-3 pb-1">
            <h2 className="m-0 text-2xl sm:text-[28px] leading-tight">
              <span className="font-extrabold">Küratörlü</span> <span className="italic">seçkiler</span>
            </h2>
            <span className="text-xs sm:text-sm italic text-tn-muted">kaydır →</span>
          </div>
          <div className="flex gap-2 overflow-x-auto -mx-2 px-2 no-scrollbar">
            {curatedLists.slice(0, 4).map((list, idx) => {
              const variants: Array<'ink' | 'lilac' | 'sage' | 'red'> = ['ink', 'lilac', 'sage', 'red'];
              return (
                <div key={list.id} className="flex-shrink-0 w-[295px] h-[300px]">
                  <CuratedListCard
                    id={list.id}
                    category={list.category || 'SEÇKİ'}
                    playCount={list.playIds?.length || 4}
                    title={list.title}
                    description={list.description}
                    curator={list.curator || 'Tiyatronot'}
                    colorVariant={variants[idx % 4]}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Callout: Go to Full Catalogue */}
      <section className="my-4 sm:my-6 p-6 sm:p-8 rounded-2xl bg-tn-surface border border-tn-line/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
        <div>
          <h3 className="m-0 text-2xl sm:text-3xl font-extrabold tracking-tight">
            Tüm Oyunları ve Toplulukları Keşfet
          </h3>
          <p className="m-0 text-tn-muted italic text-base mt-1">
            Yüzlerce sahne eseri, filtreleme ve sıralama seçenekleriyle katalog sayfasında seni bekliyor.
          </p>
        </div>
        <Link
          to="/katalog"
          className="h-12 px-7 rounded-xl bg-tn-ink text-white font-semibold text-base inline-flex items-center justify-center hover:bg-black/90 transition-all no-underline shadow-sm flex-shrink-0"
        >
          Kataloğa Git →
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

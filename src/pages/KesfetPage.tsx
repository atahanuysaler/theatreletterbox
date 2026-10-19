import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storage';
import { useAuthSafe } from '../context/AuthContext';
import {
  getIstanbulDateString,
  selectDailyPlays,
  getTimeUntilNextIstanbulMidnight,
} from '../services/stageFeedService';
import StageFeedCard from '../components/feed/StageFeedCard';
import StageFeedEndCard from '../components/feed/StageFeedEndCard';
import SocialShareModal from '../components/SocialShareModal';
import type { Play } from '../types';

interface KesfetPageProps {
  onOpenLogModal: (play: Play) => void;
}

type FeedFilter = 'all' | 'popular' | 'new' | 'nearby';

export const KesfetPage: React.FC<KesfetPageProps> = ({ onOpenLogModal }) => {
  const navigate = useNavigate();
  const authContext = useAuthSafe();
  const user = authContext?.user;
  const loginWithGoogle = authContext?.loginWithGoogle;

  const [allPlays, setAllPlays] = useState<Play[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('all');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Watchlist state
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());
  const [lastAddedPlayId, setLastAddedPlayId] = useState<string | null>(null);
  const [recentlyAddedInSession, setRecentlyAddedInSession] = useState<Set<string>>(new Set());

  // Share Modal state
  const [sharePlay, setSharePlay] = useState<Play | null>(null);

  // Daily XP awarded state for completing the 10 plays feed
  const [xpAwarded, setXpAwarded] = useState(0);

  // Countdown state
  const [countdown, setCountdown] = useState(getTimeUntilNextIstanbulMidnight());

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 1. Load Plays and user watchlist
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const plays = await storageService.getPlays();
        if (isMounted) {
          setAllPlays(plays);
          setLoading(false);
        }
      } catch (err) {
        console.error('[KesfetPage] Failed to load plays:', err);
        if (isMounted) setLoading(false);
      }
    }
    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update watchlist from user profile
  useEffect(() => {
    if (user?.watchlistPlayIds) {
      setWatchlistIds(new Set(user.watchlistPlayIds));
    }
  }, [user]);

  // Update countdown every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilNextIstanbulMidnight());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // 2. Select 10 Daily Plays (deterministic by today's Europe/Istanbul date)
  const todayStr = useMemo(() => getIstanbulDateString(), []);

  const dailyPlays = useMemo(() => {
    if (allPlays.length === 0) return [];
    const base10 = selectDailyPlays(allPlays, todayStr);

    if (activeFilter === 'popular') {
      return [...base10].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }
    if (activeFilter === 'new') {
      return [...base10].sort((a, b) => (b.year || 0) - (a.year || 0));
    }
    if (activeFilter === 'nearby') {
      // Prioritize Kadıköy / Beyoğlu / Zorlu
      return [...base10].sort((a, b) => {
        const venueA = (a.venue || '').toLowerCase();
        const venueB = (b.venue || '').toLowerCase();
        const aNearby = venueA.includes('kadıköy') || venueA.includes('zorlu');
        const bNearby = venueB.includes('kadıköy') || venueB.includes('zorlu');
        return (bNearby ? 1 : 0) - (aNearby ? 1 : 0);
      });
    }
    return base10;
  }, [allPlays, todayStr, activeFilter]);

  // 3. Scroll tracking & IntersectionObserver for active index
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const height = container.clientHeight || window.innerHeight;
      const index = Math.round(scrollTop / height);
      setCurrentIndex(Math.max(0, Math.min(index, dailyPlays.length))); // 10 is the end card
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [dailyPlays.length]);

  // Award +15 XP when user reaches the end card (index === 10) for the first time today
  useEffect(() => {
    if (currentIndex >= dailyPlays.length && dailyPlays.length > 0) {
      const feedKey = `tiyatronot_stage_feed_reward_${todayStr}`;
      const alreadyClaimed = localStorage.getItem(feedKey);
      if (!alreadyClaimed) {
        setXpAwarded(15);
        localStorage.setItem(feedKey, '15');
        // If logged in, award XP to profile
        if (user && !user.uid.startsWith('guest-')) {
          storageService
            .updateUserProfile(user.uid, { xp: (user.xp || 0) + 15 })
            .catch(err => console.warn('[KesfetPage] Failed to award feed XP:', err));
        }
      } else {
        setXpAwarded(15);
      }
    }
  }, [currentIndex, dailyPlays.length, todayStr, user]);

  // 4. Watchlist Toggle Handler
  const handleToggleWatchlist = async (play: Play) => {
    const activeUserId = user?.uid || 'guest-user';
    const isCurrentlyWatchlisted = watchlistIds.has(play.id);

    // Optimistic update
    const nextSet = new Set(watchlistIds);
    if (isCurrentlyWatchlisted) {
      nextSet.delete(play.id);
      setRecentlyAddedInSession(prev => {
        const copy = new Set(prev);
        copy.delete(play.id);
        return copy;
      });
      setLastAddedPlayId(null);
    } else {
      nextSet.add(play.id);
      setRecentlyAddedInSession(prev => new Set(prev).add(play.id));
      setLastAddedPlayId(play.id);
    }
    setWatchlistIds(nextSet);

    if (!user) {
      // Local fallback for guest
      try {
        localStorage.setItem('tiyatronot_guest_watchlist', JSON.stringify(Array.from(nextSet)));
      } catch {}
      return;
    }

    try {
      await storageService.toggleWatchlistPlay(activeUserId, play.id);
    } catch (err) {
      console.error('[KesfetPage] Error toggling watchlist:', err);
    }
  };

  const handleUndoWatchlist = async (play: Play) => {
    if (watchlistIds.has(play.id)) {
      await handleToggleWatchlist(play);
    }
    setLastAddedPlayId(null);
  };

  const totalCards = dailyPlays.length; // 10
  const isEndCard = currentIndex >= totalCards;

  if (loading) {
    return (
      <div className="w-full h-[100dvh] bg-[#1C1A1B] flex flex-col items-center justify-center text-white gap-3">
        <div className="w-10 h-10 border-3 border-tn-red border-t-transparent rounded-full animate-spin" />
        <span className="font-display font-semibold text-sm tracking-wide text-white/70">
          Sahne Akışı Hazırlanıyor...
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden select-none">
      {/* 10-Segment Progress Bar at the Very Top */}
      <div className="absolute top-0 inset-x-0 z-50 px-3 pt-3 pb-2 flex gap-1.5 pointer-events-none bg-gradient-to-b from-black/80 via-black/30 to-transparent">
        {Array.from({ length: 10 }).map((_, i) => {
          const isPassed = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div
              key={i}
              className="h-1 flex-1 rounded-full bg-white/20 overflow-hidden backdrop-blur-xs"
            >
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isPassed
                    ? 'w-full bg-white'
                    : isCurrent
                    ? 'w-full bg-tn-red'
                    : 'w-0 bg-transparent'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Floating Filter Pills on Top (Senin için, Çok konuşulan, Yeni eklenen, Yakınında) */}
      {!isEndCard && (
        <div className="absolute top-7 inset-x-0 z-40 px-3 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-sans font-semibold transition-all shadow-xs cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-white text-black'
                  : 'bg-black/40 text-white/80 hover:bg-black/60 backdrop-blur-md border border-white/10'
              }`}
            >
              Senin için
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('popular')}
              className={`px-3 py-1 rounded-full text-xs font-sans font-semibold transition-all shadow-xs cursor-pointer ${
                activeFilter === 'popular'
                  ? 'bg-white text-black'
                  : 'bg-black/40 text-white/80 hover:bg-black/60 backdrop-blur-md border border-white/10'
              }`}
            >
              Çok konuşulan
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('new')}
              className={`px-3 py-1 rounded-full text-xs font-sans font-semibold transition-all shadow-xs cursor-pointer ${
                activeFilter === 'new'
                  ? 'bg-white text-black'
                  : 'bg-black/40 text-white/80 hover:bg-black/60 backdrop-blur-md border border-white/10'
              }`}
            >
              Yeni eklenen
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('nearby')}
              className={`px-3 py-1 rounded-full text-xs font-sans font-semibold transition-all shadow-xs cursor-pointer ${
                activeFilter === 'nearby'
                  ? 'bg-white text-black'
                  : 'bg-black/40 text-white/80 hover:bg-black/60 backdrop-blur-md border border-white/10'
              }`}
            >
              Yakınında
            </button>
          </div>
        </div>
      )}

      {/* Full-screen Vertical Scroll Container with CSS Scroll-Snap */}
      <div
        ref={containerRef}
        className="snap-feed-container w-full h-[100dvh] overflow-y-scroll overflow-x-hidden no-scrollbar"
      >
        {dailyPlays.map((play, idx) => {
          // Virtualization: Keep current card + previous 2 + next 2 mounted (~5 cards)
          const isMounted = Math.abs(idx - currentIndex) <= 2;
          // Lazy-load posters: current card + next 2 only
          const shouldLoadPoster = idx <= currentIndex + 2;

          if (!isMounted) {
            return (
              <div
                key={play.id}
                className="snap-feed-card w-full h-[100dvh] bg-[#1C1A1B] flex items-center justify-center text-white/20 font-mono text-xs"
                data-card-index={idx}
              >
                Sahne {idx + 1}
              </div>
            );
          }

          return (
            <StageFeedCard
              key={play.id}
              play={play}
              index={idx}
              total={totalCards}
              isWatchlisted={watchlistIds.has(play.id)}
              onToggleWatchlist={handleToggleWatchlist}
              onOpenLogModal={onOpenLogModal}
              onShare={setSharePlay}
              shouldLoadPoster={shouldLoadPoster}
              onUndoWatchlist={handleUndoWatchlist}
              showUndoToast={lastAddedPlayId === play.id}
            />
          );
        })}

        {/* 11th Screen: End Card ("Bugünlük perde kapandı") */}
        <StageFeedEndCard
          totalPlays={totalCards}
          watchlistAddedCount={recentlyAddedInSession.size}
          xpAwarded={xpAwarded}
          plays={dailyPlays}
          hoursUntilRefresh={countdown.hours}
          minutesUntilRefresh={countdown.minutes}
          onExploreCatalog={() => navigate('/katalog')}
        />
      </div>

      {/* Share Modal */}
      {sharePlay && (
        <SocialShareModal
          isOpen={!!sharePlay}
          onClose={() => setSharePlay(null)}
          play={sharePlay}
        />
      )}
    </div>
  );
};

export default KesfetPage;

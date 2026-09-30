import React, { useEffect, useState, useMemo } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Star, 
  Shield, 
  LogOut, 
  LogIn, 
  Theater, 
  Lock, 
  ArrowLeft,
  Sparkles,
  Bookmark,
  X,
  Search,
  MoreHorizontal,
  ChevronRight,
  Share2,
  Edit2,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { storageService } from '../services/storage';
import { getTierProgress, calculateLevel, TIERS } from '../services/gamification';
import type { Play, ReviewEntry, Badge, UserProfile, LeaderboardUser } from '../types';
import SocialShareModal from '../components/SocialShareModal';
import SeasonWrappedModal from '../components/SeasonWrappedModal';
import LogModal from '../components/LogModal';
import CatalogCard from '../components/redesign/CatalogCard';

export type ProfileTabType = 'pasaport' | 'izlediklerim' | 'notlar' | 'izlemek-istediklerim';

interface ProfilePageProps {
  onOpenDailyQuote?: () => void;
  initialTab?: ProfileTabType;
}

const TURKISH_MONTHS = ['OCA', 'ŞUB', 'MAR', 'NİS', 'MAY', 'HAZ', 'TEM', 'AĞU', 'EYL', 'EKİ', 'KAS', 'ARA'];
const TURKISH_MONTH_FULL = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

const PASTEL_BG_CYCLE = [
  'bg-[#FCEAE6] dark:bg-[#2C1E1D]', // Light Pink
  'bg-[#F6EEDA] dark:bg-[#262118]', // Light Yellow / Sand
  'bg-[#E7EFE7] dark:bg-[#1A251C]', // Light Mint / Green
];

export const ProfilePage: React.FC<ProfilePageProps> = ({ onOpenDailyQuote, initialTab }) => {
  const { user, role, loginWithGoogle, logout, updateProfile } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const { userId } = useParams<{ userId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryTab = searchParams.get('tab') as ProfileTabType | null;

  // Determine if viewing own profile or another user's public profile
  const isOwnProfile = !userId || (!!user && user.uid === userId);

  const [plays, setPlays] = useState<Play[]>([]);
  const [reviews, setReviews] = useState<ReviewEntry[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Target user profile state when viewing another user's public profile
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
  const [targetUserLoading, setTargetUserLoading] = useState<boolean>(!isOwnProfile);

  const [activeTab, setActiveTab] = useState<ProfileTabType>(
    initialTab || queryTab || (!isOwnProfile ? 'notlar' : 'pasaport')
  );

  // Filter for Biletlerim: 'all' | 'notlu' | 'notu-eksik'
  const [ticketFilter, setTicketFilter] = useState<'all' | 'notlu' | 'notu-eksik'>('all');

  // Modals state
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [shareReview, setShareReview] = useState<ReviewEntry | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewEntry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newLogPlay, setNewLogPlay] = useState<Play | null>(null);
  const [isNewLogOpen, setIsNewLogOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    } else if (queryTab) {
      setActiveTab(queryTab);
    } else if (!isOwnProfile) {
      setActiveTab('notlar');
    }
  }, [initialTab, queryTab, isOwnProfile]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      storageService.getPlays(),
      storageService.getReviews(),
      storageService.getBadges(),
      storageService.getLeaderboard(),
    ]).then(([pList, rList, bList, lList]) => {
      if (!isMounted) return;
      setPlays(pList);
      setReviews(rList);
      setAllBadges(bList);
      setLeaderboard(lList);
      setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  // Fetch or synthesize target user's profile when visiting another user's page
  useEffect(() => {
    if (isOwnProfile) {
      setTargetUser(user ?? null);
      setTargetUserLoading(false);
      return;
    }

    let isMounted = true;
    setTargetUserLoading(true);

    const targetUid = userId!;
    storageService.getUserProfile(targetUid).then((profile) => {
      if (!isMounted) return;
      if (profile) {
        setTargetUser(profile);
      } else {
        const matchingReviews = reviews.filter(r => r.userId === targetUid);
        if (matchingReviews.length > 0) {
          const firstRev = matchingReviews[0];
          const calculatedXp = matchingReviews.length * 10;
          setTargetUser({
            uid: targetUid,
            email: '',
            displayName: firstRev.userName || 'Tiyatrosever',
            photoURL: firstRev.userAvatar || '',
            role: 'user',
            xp: calculatedXp,
            level: calculateLevel(calculatedXp),
            seenPlayIds: Array.from(new Set(matchingReviews.map(r => r.playId))),
            watchlistPlayIds: [],
            badges: [],
            createdAt: firstRev.createdAt || new Date().toISOString()
          });
        } else {
          setTargetUser(null);
        }
      }
      setTargetUserLoading(false);
    }).catch(err => {
      console.error('[ProfilePage] Failed to fetch user profile:', err);
      if (isMounted) setTargetUserLoading(false);
    });

    return () => { isMounted = false; };
  }, [userId, isOwnProfile, user, reviews]);

  const activeProfile = isOwnProfile ? user : targetUser;
  const xp = activeProfile?.xp ?? 0;
  const level = activeProfile?.level ?? 'Fuaye Meraklısı';
  const tierProgress = getTierProgress(xp);

  // Rank in leaderboard
  const userRank = useMemo(() => {
    if (!activeProfile?.uid || xp === 0) return null;
    const sorted = [...leaderboard].sort((a, b) => b.xp - a.xp);
    const index = sorted.findIndex(u => u.uid === activeProfile.uid);
    if (index === -1) {
      // If user not in server leaderboard list yet, estimate based on XP rank
      const higherCount = sorted.filter(u => u.xp > xp).length;
      return higherCount + 1;
    }
    return index + 1;
  }, [leaderboard, activeProfile?.uid, xp]);

  const isLeaderRank1 = userRank === 1;

  const [seenSearchQuery, setSeenSearchQuery] = useState('');

  const seenPlays = useMemo(() => {
    if (!activeProfile?.seenPlayIds) return [];
    return plays.filter(p => activeProfile.seenPlayIds.includes(p.id));
  }, [plays, activeProfile?.seenPlayIds]);

  const filteredSeenPlays = useMemo(() => {
    if (!seenSearchQuery.trim()) return seenPlays;
    const q = seenSearchQuery.toLowerCase().trim();
    return seenPlays.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.playwright?.toLowerCase().includes(q) ||
      p.venue?.toLowerCase().includes(q) ||
      p.company?.toLowerCase().includes(q)
    );
  }, [seenPlays, seenSearchQuery]);

  const watchlistPlays = useMemo(() => {
    const list = activeProfile?.watchlistPlayIds;
    if (!list) return [];
    return plays.filter(p => list.includes(p.id));
  }, [plays, activeProfile?.watchlistPlayIds]);

  const userReviews = useMemo(() => {
    if (!activeProfile?.uid) return [];
    return reviews.filter(r => r.userId === activeProfile.uid);
  }, [reviews, activeProfile?.uid]);

  const unlockedBadgeIds = useMemo(() => {
    return new Set(activeProfile?.badges || []);
  }, [activeProfile?.badges]);

  // Combined tickets (both reviewed plays and plays marked as seen without note)
  const combinedTickets = useMemo(() => {
    const list: Array<{
      id: string;
      playId: string;
      playTitle: string;
      venue: string;
      performanceDate: string;
      sessionType?: 'matine' | 'suare';
      seatInfo?: string;
      rating: number;
      reviewText?: string;
      hasSpoilers?: boolean;
      review?: ReviewEntry;
      isMissingNote: boolean;
    }> = [];

    // First add all user reviews
    const reviewedPlayIds = new Set<string>();
    for (const rev of userReviews) {
      reviewedPlayIds.add(rev.playId);
      list.push({
        id: rev.id,
        playId: rev.playId,
        playTitle: rev.playTitle,
        venue: rev.venue || 'Sahne',
        performanceDate: rev.performanceDate || rev.createdAt?.slice(0, 10) || '2026-09-10',
        sessionType: rev.sessionType || 'suare',
        seatInfo: rev.seatInfo,
        rating: rev.rating || 5.0,
        reviewText: rev.reviewText,
        hasSpoilers: rev.hasSpoilers,
        review: rev,
        isMissingNote: !rev.reviewText || rev.reviewText.trim().length === 0,
      });
    }

    // Then add seen plays that don't have a review yet
    for (const play of seenPlays) {
      if (!reviewedPlayIds.has(play.id)) {
        list.push({
          id: `seen-${play.id}`,
          playId: play.id,
          playTitle: play.title,
          venue: play.venue,
          performanceDate: '2026-09-10',
          sessionType: 'suare',
          rating: play.rating || 5.0,
          isMissingNote: true,
        });
      }
    }

    // Sort by date descending
    return list.sort((a, b) => b.performanceDate.localeCompare(a.performanceDate));
  }, [userReviews, seenPlays]);

  // Group tickets by month for Biletlerim Archive
  const groupedTickets = useMemo(() => {
    const filtered = combinedTickets.filter(item => {
      if (ticketFilter === 'notlu') return !item.isMissingNote;
      if (ticketFilter === 'notu-eksik') return item.isMissingNote;
      return true;
    });

    const groups: Record<string, typeof filtered> = {};
    for (const item of filtered) {
      const date = new Date(item.performanceDate);
      const monthIdx = isNaN(date.getMonth()) ? 8 : date.getMonth();
      const year = isNaN(date.getFullYear()) ? 2026 : date.getFullYear();
      const key = `${TURKISH_MONTH_FULL[monthIdx]} ${year}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    return groups;
  }, [combinedTickets, ticketFilter]);

  // Badge calculations for Progress & Info
  const badgeStats = useMemo(() => {
    const kadikoyVenues = ['Alan Kadıköy', 'Oyun Atölyesi Moda', 'Craft Kadıköy', 'Moda Sahnesi', 'Kadıköy', 'Moda'];
    const kadikoySeen = seenPlays.filter(play => 
      kadikoyVenues.some(v => play.venue.toLowerCase().includes(v.toLowerCase()))
    ).length;

    const klasikSeen = seenPlays.filter(play =>
      (play.tags && play.tags.some(t => t.toLowerCase().includes('klasik'))) ||
      (play.genre && play.genre.toLowerCase().includes('klasik'))
    ).length;

    return {
      dramaturg: {
        current: Math.min(5, userReviews.length),
        target: 5,
        unit: 'not',
        xp: 150,
        sealCode: 'KALEM',
        title: 'Dramaturg Kalemi',
        description: 'Topluluk için 5 detaylı eleştiri ve oyun notu yaz.'
      },
      'kadikoy-muhtari': {
        current: Math.min(3, kadikoySeen),
        target: 3,
        unit: 'oyun',
        xp: 100,
        sealCode: 'KADIKÖY',
        title: 'Kadıköy Sahneleri Müdavimi',
        description: 'Kadıköy\'deki sahnelerden en az 3 farklı oyunu günlüğüne ekle.'
      },
      klasiksever: {
        current: Math.min(3, klasikSeen),
        target: 3,
        unit: 'oyun',
        xp: 75,
        sealCode: 'KLASİK',
        title: 'Klasik Tiyatro Tutkunu',
        description: 'Tarihi ve klasikleşmiş en az 3 oyunu değerlendir.'
      },
      'sahne-tozu': {
        current: Math.min(5, seenPlays.length),
        target: 5,
        unit: 'oyun',
        xp: 50,
        sealCode: 'SAHNE TOZU',
        title: 'Sahne Tozu Yutan',
        description: 'Platformda ilk 5 oyununu izlendi olarak kaydet.'
      }
    };
  }, [seenPlays, userReviews]);

  // Handle Remove from Watchlist
  const handleRemoveFromWatchlist = async (playId: string) => {
    if (!user) return;
    try {
      const updated = await storageService.toggleWatchlistPlay(user.uid, playId);
      await updateProfile({ watchlistPlayIds: updated });
    } catch (err) {
      console.error('[ProfilePage] Failed to remove watchlist play:', err);
    }
  };

  // Handle Copy Profile Link
  const handleCopyProfileLink = async () => {
    const url = `${window.location.origin}/profil/${activeProfile?.uid || ''}`;
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Handle Save Display Name
  const handleSaveDisplayName = async () => {
    if (!user || !newDisplayName.trim()) return;
    try {
      await updateProfile({ displayName: newDisplayName.trim() });
      setIsEditingDisplayName(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Not Logged in View
  if (isOwnProfile && !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6 font-serif">
        <div className="w-16 h-16 rounded-full bg-[#BA1B23]/10 text-[#BA1B23] flex items-center justify-center mx-auto">
          <Theater className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-extrabold text-2xl sm:text-3xl text-[#1C1A1B] dark:text-[#F3EFEA]">
            Tiyatro Pasaportuna Giriş Yap
          </h1>
          <p className="text-sm text-[#6E6862] dark:text-[#A8A199] leading-relaxed italic">
            İzlediğin oyunları kaydetmek, pasaport mühürleri toplamak ve Sahne Liderleri sıralamasına katılmak için oturum aç.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loginWithGoogle()}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#BA1B23] hover:bg-[#9E1B22] text-white py-3.5 text-sm font-bold rounded-full shadow-sm transition-all cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Google ile Giriş Yap</span>
        </button>
      </div>
    );
  }

  // Loading state
  if (!isOwnProfile && targetUserLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4 font-serif">
        <div className="w-16 h-16 bg-[#F1EDE7] dark:bg-[#2A2729] rounded-full mx-auto animate-pulse" />
        <div className="h-6 bg-[#F1EDE7] dark:bg-[#2A2729] rounded-full w-48 mx-auto animate-pulse" />
        <p className="text-xs italic text-[#6E6862] dark:text-[#A8A199]">Tiyatrosever profili yükleniyor...</p>
      </div>
    );
  }

  // Not found state
  if (!isOwnProfile && !targetUserLoading && !activeProfile) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4 font-serif">
        <Theater className="w-12 h-12 text-[#6E6862] dark:text-[#A8A199] mx-auto opacity-60" />
        <h2 className="font-extrabold text-2xl text-[#1C1A1B] dark:text-[#F3EFEA]">
          Kullanıcı Bulunamadı
        </h2>
        <p className="text-sm text-[#6E6862] dark:text-[#A8A199] italic">
          Aradığınız tiyatrosever profili mevcut değil veya henüz herkese açık bir içerik paylaşmamış.
        </p>
        <div className="pt-3 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F1EDE7] dark:bg-[#2A2729] hover:bg-[#E2DCD4] dark:hover:bg-[#332F31] border border-[#E2DCD4] dark:border-[#332F31] text-[#1C1A1B] dark:text-[#F3EFEA] text-xs font-semibold rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Geri Dön</span>
          </button>
        </div>
      </div>
    );
  }

  if (!activeProfile) return null;

  const initials = activeProfile.displayName
    ? activeProfile.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'TN';

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 font-serif">
      
      {/* ============================================================== */}
      {/* 1. TOP BENTO GRID (User Identity Card + 4 Stat Bento Blocks)     */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        
        {/* Left: User Identity Block (lg:col-span-5) */}
        <div 
          className={`lg:col-span-5 rounded-[22px] p-5 sm:p-6 flex flex-col justify-between min-h-[220px] transition-colors relative ${
            isLeaderRank1 && !isOwnProfile
              ? 'bg-[#1C1A1B] text-white'
              : 'bg-[#F9DDD5] dark:bg-[#2C1D1E] text-[#1C1A1B] dark:text-[#F3EFEA]'
          }`}
        >
          {/* Top row: Avatar & Action button */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              {activeProfile.photoURL ? (
                <img
                  src={activeProfile.photoURL}
                  alt={activeProfile.displayName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white/40 shadow-sm"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#D7CBBC] text-[#1C1A1B] font-extrabold text-xl flex items-center justify-center shadow-xs">
                  {initials}
                </div>
              )}
            </div>

            {/* If Rank 1 on someone else's profile: Golden Leader Badge */}
            {isLeaderRank1 && !isOwnProfile && (
              <span className="bg-[#F2B93B] text-[#1C1A1B] text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                #1 Sahne Liderleri
              </span>
            )}

            {/* More Menu (...) for own profile */}
            {isOwnProfile && (
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen(true)}
                className="w-8 h-8 rounded-full bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-[#1C1A1B] dark:text-[#F3EFEA] flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                title="Hesap Menüsü"
                aria-label="Hesap Menüsü"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            )}

            {!isOwnProfile && (
              <button
                type="button"
                onClick={() => window.history.back()}
                className="w-8 h-8 rounded-full bg-white/80 dark:bg-white/10 text-[#1C1A1B] dark:text-[#F3EFEA] flex items-center justify-center cursor-pointer transition-colors"
                title="Geri Dön"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* User Name & Level */}
          <div className="my-3">
            <h1 className="font-extrabold text-2xl sm:text-3xl tracking-tight leading-tight">
              {activeProfile.displayName}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
              <span className="px-2.5 py-0.5 rounded-full border text-[11px] font-semibold border-[#1C1A1B]/20 dark:border-white/20 text-[#1C1A1B]/80 dark:text-white/80 bg-white/30 dark:bg-white/5">
                {level}
              </span>
              <span className="italic opacity-70">
                Katılım: {new Date(activeProfile.createdAt || Date.now()).toLocaleDateString('tr-TR')}
              </span>
            </div>
          </div>

          {/* Bottom Button: Sezon Özeti - Wrapped */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsWrappedOpen(true)}
              className="px-5 py-2.5 rounded-full bg-[#1C1A1B] dark:bg-[#F3EFEA] text-white dark:text-[#1C1A1B] hover:bg-black dark:hover:bg-white transition-all text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer shadow-md select-none w-fit"
            >
              <span>Sezon Özeti</span>
              <span className="italic font-normal opacity-90">- Wrapped</span>
            </button>
          </div>
        </div>

        {/* Right: 4 Bento Stat Cards (lg:col-span-7, 2x2 Grid) */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-3 sm:gap-4">
          
          {/* Card 1: Toplam Deneyim (Sand/Yellow) */}
          <div className="bg-[#F7EEDB] dark:bg-[#262118] text-[#1C1A1B] dark:text-[#F3EFEA] rounded-[22px] p-4 sm:p-5 flex flex-col justify-between min-h-[105px]">
            <span className="italic text-xs text-[#6E6862] dark:text-[#A8A199]">Toplam deneyim</span>
            <div className="flex items-baseline mt-2">
              <span className="font-extrabold text-3xl sm:text-4xl">{xp}</span>
              <span className="italic text-xs ml-1.5 text-[#6E6862] dark:text-[#A8A199]">XP</span>
            </div>
          </div>

          {/* Card 2: Tiyatro İndeksi (Lavender/Lilac) */}
          <div className="bg-[#E7E3F4] dark:bg-[#201C2B] text-[#1C1A1B] dark:text-[#F3EFEA] rounded-[22px] p-4 sm:p-5 flex flex-col justify-between min-h-[105px]">
            <span className="italic text-xs text-[#6E6862] dark:text-[#A8A199]">
              {isOwnProfile ? 'Tiyatro İndeksi' : 'İzlenen'}
            </span>
            <div className="flex items-baseline mt-2">
              <span className="font-extrabold text-3xl sm:text-4xl">{seenPlays.length}</span>
              <span className="italic text-xs sm:text-sm ml-1.5 text-[#6E6862] dark:text-[#A8A199]">
                / {plays.length || 1854}
              </span>
            </div>
          </div>

          {/* Card 3: Pasaport (Mint/Sage) */}
          <div className="bg-[#E7EFE7] dark:bg-[#1A251C] text-[#1C1A1B] dark:text-[#F3EFEA] rounded-[22px] p-4 sm:p-5 flex flex-col justify-between min-h-[105px]">
            <span className="italic text-xs text-[#6E6862] dark:text-[#A8A199]">Pasaport</span>
            <div className="flex items-baseline mt-2">
              <span className="font-extrabold text-3xl sm:text-4xl">{unlockedBadgeIds.size}</span>
              <span className="italic text-xs sm:text-sm ml-1.5 text-[#6E6862] dark:text-[#A8A199]">
                / 4 mühür
              </span>
            </div>
          </div>

          {/* Card 4: Sahne Liderleri (Black or Red if #1) */}
          <div 
            className={`rounded-[22px] p-4 sm:p-5 flex flex-col justify-between min-h-[105px] text-white ${
              userRank === 1 ? 'bg-[#BA1B23]' : 'bg-[#1C1A1B]'
            }`}
          >
            <span className="italic text-xs text-white/70">Sahne Liderleri</span>
            <div className="mt-2">
              {xp > 0 && userRank ? (
                <div className="flex items-baseline">
                  <span className="font-extrabold text-3xl sm:text-4xl">#{userRank}</span>
                  <span className="italic text-xs ml-1.5 text-white/70">
                    {userRank === 1 ? 'tüm zamanlar' : 'sıralama'}
                  </span>
                </div>
              ) : (
                <span className="italic text-xs sm:text-sm text-white/70">— henüz sırada değil</span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. KADEME YOLCULUĞU (Tier Progress Bar & 5 Step Boxes)          */}
      {/* ============================================================== */}
      <div className="space-y-2 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
          <h3 className="font-extrabold text-base text-[#1C1A1B] dark:text-[#F3EFEA]">
            Kademe <span className="italic font-normal">yolculuğu</span>
          </h3>
          <span className="italic text-[#6E6862] dark:text-[#A8A199]">
            {tierProgress.nextTier ? (
              <>Sonraki: <strong className="not-italic text-[#1C1A1B] dark:text-[#F3EFEA]">{tierProgress.nextTier}</strong> · {tierProgress.xpToNextTier} XP kaldı</>
            ) : (
              <strong className="text-[#BA1B23]">En Üst Kademe (Tiyatro Duayeni)</strong>
            )}
          </span>
        </div>

        {/* Top continuous thin progress bar */}
        <div className="w-full bg-[#E2DCD4] dark:bg-[#332F31] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#BA1B23] h-full transition-all duration-500 rounded-full"
            style={{ width: `${tierProgress.progressPercent}%` }}
          />
        </div>

        {/* 5 Step Blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {TIERS.map((t, idx) => {
            const isCompleted = xp > (t.maxXp || Infinity);
            const isCurrent = level === t.title;
            return (
              <div
                key={t.title}
                className={`p-2.5 rounded-[12px] text-center border transition-all ${
                  isCurrent
                    ? 'bg-[#BA1B23] text-white border-[#BA1B23] font-bold shadow-xs'
                    : isCompleted
                    ? 'bg-[#1C1A1B] text-white border-[#1C1A1B]'
                    : 'bg-[#FFFFFF] dark:bg-[#1E1C1D] text-[#6E6862] dark:text-[#A8A199] border-[#E2DCD4] dark:border-[#332F31]'
                }`}
              >
                <div className="text-[10px] tracking-wider uppercase opacity-80">
                  {idx + 1}. KADEME
                </div>
                <div className="font-bold text-xs truncate mt-0.5">
                  {t.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* ============================================================== */}
      {/* 3. TABS (Pasaport, İzlediklerim, Biletlerim, İzleyeceklerim)     */}
      {/* ============================================================== */}
      <div className="flex items-center gap-4 sm:gap-6 border-b border-[#E2DCD4] dark:border-[#332F31] pb-2 text-sm pt-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('pasaport')}
          className={`pb-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'pasaport'
              ? 'font-bold text-[#1C1A1B] dark:text-[#F3EFEA] border-b-2 border-[#1C1A1B] dark:border-[#F3EFEA] -mb-[10px]'
              : 'text-[#6E6862] dark:text-[#A8A199] hover:text-[#1C1A1B] dark:hover:text-[#F3EFEA]'
          }`}
        >
          <span>Pasaport</span>
          <span className="text-xs opacity-75">{unlockedBadgeIds.size}/4</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('izlediklerim')}
          className={`pb-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'izlediklerim'
              ? 'font-bold text-[#1C1A1B] dark:text-[#F3EFEA] border-b-2 border-[#1C1A1B] dark:border-[#F3EFEA] -mb-[10px]'
              : 'text-[#6E6862] dark:text-[#A8A199] hover:text-[#1C1A1B] dark:hover:text-[#F3EFEA]'
          }`}
        >
          <span>İzlediklerim</span>
          <span className="text-xs opacity-75">{seenPlays.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notlar')}
          className={`pb-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'notlar'
              ? 'font-bold text-[#1C1A1B] dark:text-[#F3EFEA] border-b-2 border-[#1C1A1B] dark:border-[#F3EFEA] -mb-[10px]'
              : 'text-[#6E6862] dark:text-[#A8A199] hover:text-[#1C1A1B] dark:hover:text-[#F3EFEA]'
          }`}
        >
          <span>Biletlerim</span>
          <span className="text-xs opacity-75">{combinedTickets.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('izlemek-istediklerim')}
          className={`pb-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'izlemek-istediklerim'
              ? 'font-bold text-[#1C1A1B] dark:text-[#F3EFEA] border-b-2 border-[#1C1A1B] dark:border-[#F3EFEA] -mb-[10px]'
              : 'text-[#6E6862] dark:text-[#A8A199] hover:text-[#1C1A1B] dark:hover:text-[#F3EFEA]'
          }`}
        >
          <span>İzleyeceklerim</span>
          <span className="text-xs opacity-75">{watchlistPlays.length}</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 4. TAB CONTENTS                                                */}
      {/* ============================================================== */}

      {/* -------------------------------------------------------------- */}
      {/* TAB: İZLEDİKLERİM                                              */}
      {/* -------------------------------------------------------------- */}
      {activeTab === 'izlediklerim' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <span className="text-sm italic text-[#6E6862] dark:text-[#A8A199]">
              Toplam {seenPlays.length} oyun izlendi
            </span>

            {/* Search Bar */}
            {seenPlays.length > 0 && (
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6862] pointer-events-none" />
                <input
                  type="text"
                  value={seenSearchQuery}
                  onChange={(e) => setSeenSearchQuery(e.target.value)}
                  placeholder="İzlediklerinde ara…"
                  className="w-full h-9 pl-9 pr-8 rounded-full bg-white dark:bg-[#1E1C1D] border border-[#E2DCD4] dark:border-[#332F31] focus:border-[#BA1B23] focus:outline-none text-xs font-serif text-[#1C1A1B] dark:text-[#F3EFEA] placeholder:text-[#6E6862]/70 shadow-2xs transition-colors"
                />
                {seenSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setSeenSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#E2DCD4] dark:bg-[#332F31] flex items-center justify-center text-[#6E6862] cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {filteredSeenPlays.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {filteredSeenPlays.map((play) => (
                <CatalogCard key={play.id} play={play} />
              ))}
            </div>
          ) : seenPlays.length > 0 ? (
            <div className="p-8 text-center border border-dashed border-[#E2DCD4] dark:border-[#332F31] rounded-2xl bg-white/40 dark:bg-black/20">
              <Search className="w-6 h-6 text-[#6E6862] mx-auto opacity-50 mb-2" />
              <p className="font-extrabold text-sm mb-1 text-[#1C1A1B] dark:text-[#F3EFEA]">
                "{seenSearchQuery}" ile eşleşen izlenmiş oyun bulunamadı
              </p>
              <button
                type="button"
                onClick={() => setSeenSearchQuery('')}
                className="mt-2 text-xs text-[#BA1B23] font-semibold underline cursor-pointer"
              >
                Aramayı Temizle
              </button>
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-[#E2DCD4] dark:border-[#332F31] rounded-2xl bg-white/40 dark:bg-black/20">
              <span className="text-3xl mb-2 block">🎭</span>
              <p className="font-extrabold text-base mb-1 text-[#1C1A1B] dark:text-[#F3EFEA]">Henüz izlenen oyun bulunmuyor</p>
              <p className="text-xs italic text-[#6E6862] dark:text-[#A8A199] mb-4">
                İzlediğin oyunları işaretleyerek profilinde toplayabilirsin.
              </p>
              <Link
                to="/katalog"
                className="inline-flex h-9 px-4 rounded-full bg-[#1C1A1B] dark:bg-white text-white dark:text-[#1C1A1B] text-xs font-semibold items-center justify-center no-underline hover:opacity-90 transition-opacity"
              >
                Oyun Kataloğunu İncele
              </Link>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------- */}
      {/* TAB 1: PASAPORT (4 Mühür Kartı)                                 */}
      {/* -------------------------------------------------------------- */}
      {activeTab === 'pasaport' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {(['dramaturg', 'kadikoy-muhtari', 'klasiksever', 'sahne-tozu'] as const).map((key) => {
              const info = badgeStats[key];
              const isUnlocked = unlockedBadgeIds.has(key);
              const badgeObj = allBadges.find(b => b.id === key) || {
                id: key,
                name: info.title,
                description: info.description,
                icon: '',
                xpBonus: info.xp
              };

              return (
                <div
                  key={key}
                  onClick={() => setSelectedBadge(badgeObj)}
                  className={`p-4 sm:p-5 rounded-[18px] border transition-all cursor-pointer flex flex-col justify-between min-h-[220px] ${
                    isUnlocked
                      ? 'bg-[#FFFCF7] dark:bg-[#1A1819] border-[#BA1B23]/40 shadow-xs hover:border-[#BA1B23]'
                      : 'bg-[#FAF8F5] dark:bg-[#161415] border-dashed border-[#E2DCD4] dark:border-[#332F31] opacity-75 hover:opacity-100'
                  }`}
                >
                  {/* Seal Stamp Circle */}
                  <div className="h-20 flex items-center justify-center">
                    {isUnlocked ? (
                      <div className="w-18 h-18 rounded-full border-2 border-[#BA1B23] text-[#BA1B23] flex items-center justify-center -rotate-6 select-none shadow-xs px-1 text-center font-extrabold text-xs">
                        {info.sealCode}
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full border border-dashed border-[#A8A199] text-[#6E6862] dark:text-[#A8A199] flex items-center justify-center select-none text-[11px] font-semibold opacity-70">
                        {info.sealCode}
                      </div>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="my-2 space-y-1">
                    <h4 className="font-extrabold text-sm text-[#1C1A1B] dark:text-[#F3EFEA] leading-snug">
                      {info.title}
                    </h4>
                    <p className="text-xs text-[#6E6862] dark:text-[#A8A199] italic leading-tight">
                      {info.description}
                    </p>
                  </div>

                  {/* Footer status / progress */}
                  <div className="pt-2 border-t border-[#E2DCD4]/60 dark:border-[#332F31]/60 flex items-center justify-between text-xs">
                    {isUnlocked ? (
                      <>
                        <span className="text-[11px] text-[#6E6862] dark:text-[#A8A199] italic">
                          Açıldı
                        </span>
                        <span className="font-bold text-[#BA1B23]">
                          +{info.xp} XP
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[11px] text-[#6E6862] dark:text-[#A8A199]">
                          {info.current} / {info.target} {info.unit}
                        </span>
                        <span className="font-bold text-[#BA1B23]">
                          +{info.xp} XP
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------- */}
      {/* TAB 2: BİLETLERİM · ARŞİV                                       */}
      {/* -------------------------------------------------------------- */}
      {activeTab === 'notlar' && (
        <div className="space-y-6">
          {/* Sub Header: Filters & Season Selector */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-[#F1EDE7] dark:bg-[#2A2729] p-1 rounded-full border border-[#E2DCD4] dark:border-[#332F31]">
              <button
                type="button"
                onClick={() => setTicketFilter('all')}
                className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  ticketFilter === 'all'
                    ? 'bg-[#1C1A1B] text-white dark:bg-[#F3EFEA] dark:text-[#1C1A1B] shadow-xs'
                    : 'text-[#6E6862] dark:text-[#A8A199]'
                }`}
              >
                Tümü
              </button>
              <button
                type="button"
                onClick={() => setTicketFilter('notlu')}
                className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  ticketFilter === 'notlu'
                    ? 'bg-[#1C1A1B] text-white dark:bg-[#F3EFEA] dark:text-[#1C1A1B] shadow-xs'
                    : 'text-[#6E6862] dark:text-[#A8A199]'
                }`}
              >
                Notlu
              </button>
              <button
                type="button"
                onClick={() => setTicketFilter('notu-eksik')}
                className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  ticketFilter === 'notu-eksik'
                    ? 'bg-[#1C1A1B] text-white dark:bg-[#F3EFEA] dark:text-[#1C1A1B] shadow-xs'
                    : 'text-[#6E6862] dark:text-[#A8A199]'
                }`}
              >
                Notu eksik
              </button>
            </div>

            <div className="text-xs text-[#6E6862] dark:text-[#A8A199] italic">
              Sezon: <strong>2025–2026</strong>
            </div>
          </div>

          {/* Grouped Tickets List */}
          {Object.keys(groupedTickets).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedTickets).map(([monthGroup, items]) => (
                <div key={monthGroup} className="space-y-3">
                  <div className="text-xs font-bold text-[#1C1A1B] dark:text-[#F3EFEA]">
                    {monthGroup} <span className="italic font-normal opacity-70">· {items.length} bilet</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {items.map((item) => {
                      const dateObj = new Date(item.performanceDate);
                      const dayStr = isNaN(dateObj.getDate()) ? '10' : dateObj.getDate();
                      const monthAbbr = isNaN(dateObj.getMonth()) ? 'EYL' : TURKISH_MONTHS[dateObj.getMonth()];

                      return (
                        <div
                          key={item.id}
                          className="bg-[#FFFFFF] dark:bg-[#1A1819] border border-[#E2DCD4] dark:border-[#332F31] rounded-[18px] p-4 flex gap-3.5 transition-all shadow-xs"
                        >
                          {/* Left Date Column */}
                          <div className="flex flex-col items-center justify-center w-12 shrink-0 border-r border-[#E2DCD4] dark:border-[#332F31] pr-3 select-none">
                            <span className="font-extrabold text-2xl text-[#1C1A1B] dark:text-[#F3EFEA] leading-none">
                              {dayStr}
                            </span>
                            <span className="text-[10px] tracking-wider uppercase font-semibold text-[#6E6862] dark:text-[#A8A199] mt-0.5">
                              {monthAbbr}
                            </span>
                          </div>

                          {/* Middle Content */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <Link
                                  to={`/oyun/${item.playId}`}
                                  className="font-extrabold text-base text-[#1C1A1B] dark:text-[#F3EFEA] hover:text-[#BA1B23] transition-colors truncate"
                                >
                                  {item.playTitle}
                                </Link>
                                <span className="font-extrabold text-sm text-[#1C1A1B] dark:text-[#F3EFEA] shrink-0">
                                  {item.rating.toFixed(1)}
                                </span>
                              </div>

                              <div className="text-xs italic text-[#6E6862] dark:text-[#A8A199] truncate mt-0.5">
                                {item.venue} · {item.sessionType === 'matine' ? 'Öğle Matinesi' : 'Akşam Suaresi'}
                              </div>

                              {item.reviewText ? (
                                <p className="text-xs italic text-[#1C1A1B] dark:text-[#F3EFEA] line-clamp-2 mt-1.5 opacity-90">
                                  “{item.reviewText}”
                                </p>
                              ) : (
                                <div className="mt-2 space-y-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const p = plays.find(x => x.id === item.playId);
                                      if (p) setNewLogPlay(p);
                                      setIsNewLogOpen(true);
                                    }}
                                    className="px-3 py-1 rounded-full border border-[#BA1B23] text-[#BA1B23] hover:bg-[#BA1B23] hover:text-white transition-colors text-xs font-semibold cursor-pointer"
                                  >
                                    + Not ekle, bileti tamamla
                                  </button>
                                  <div className="text-[11px] text-[#6E6862] dark:text-[#A8A199] italic">
                                    Not bekliyor
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Badges / Actions Row */}
                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E2DCD4]/60 dark:border-[#332F31]/60 mt-2 text-xs">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {item.seatInfo && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F1EDE7] dark:bg-[#2A2729] text-[#6E6862] dark:text-[#A8A199]">
                                    Koltuk: {item.seatInfo}
                                  </span>
                                )}
                                {item.rating >= 4.5 && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#BA1B23]/10 text-[#BA1B23] font-semibold">
                                    Ayakta Alkış
                                  </span>
                                )}
                              </div>

                              {item.review && (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingReview(item.review!);
                                      setIsEditModalOpen(true);
                                    }}
                                    className="text-[11px] text-[#6E6862] hover:text-[#1C1A1B] dark:hover:text-[#F3EFEA] cursor-pointer"
                                  >
                                    Düzenle
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShareReview(item.review!);
                                      setIsShareOpen(true);
                                    }}
                                    className="text-[11px] text-[#BA1B23] hover:underline font-semibold cursor-pointer"
                                  >
                                    Paylaş
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* 05 Biletlerim · Boş Durum */
            <div className="bg-[#FFFFFF] dark:bg-[#1A1819] border border-dashed border-[#E2DCD4] dark:border-[#332F31] p-12 text-center space-y-4 rounded-[22px]">
              <div className="w-14 h-14 rounded-full bg-[#FCEAE6] dark:bg-[#2C1D1E] text-[#BA1B23] flex items-center justify-center mx-auto">
                <Edit2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-[#1C1A1B] dark:text-[#F3EFEA]">
                  Henüz izlenen oyun işaretlenmedi
                </h3>
                <p className="text-xs sm:text-sm text-[#6E6862] dark:text-[#A8A199] max-w-sm mx-auto italic">
                  Katalogdaki oyunların detay sayfalarından "İzledim" butonuna basarak tiyatro pasaportunu doldurmaya başlayabilirsin.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-6 py-2.5 rounded-full bg-[#1C1A1B] text-white hover:bg-black transition-colors text-xs font-bold cursor-pointer shadow-sm"
                >
                  Kataloğu Keşfet
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------- */}
      {/* TAB 3: İZLEYECEKLERİM                                           */}
      {/* -------------------------------------------------------------- */}
      {activeTab === 'izlemek-istediklerim' && (
        <div className="space-y-4">
          {watchlistPlays.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {watchlistPlays.map((play, index) => {
                const pastelBg = PASTEL_BG_CYCLE[index % PASTEL_BG_CYCLE.length];
                return (
                  <div
                    key={play.id}
                    className={`${pastelBg} rounded-[20px] p-5 flex flex-col justify-between min-h-[175px] shadow-xs transition-transform hover:-translate-y-0.5`}
                  >
                    <div>
                      {/* Top row: Rating & Remove button */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/70 dark:bg-black/40 text-[#1C1A1B] dark:text-[#F3EFEA] flex items-center gap-1">
                          <Star className="w-3 h-3 text-[#E4B33A] fill-[#E4B33A]" />
                          <span>{play.rating.toFixed(1)}</span>
                        </span>

                        {isOwnProfile && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFromWatchlist(play.id)}
                            className="w-6 h-6 rounded-full bg-white/60 dark:bg-black/30 hover:bg-white dark:hover:bg-black/60 flex items-center justify-center text-[#6E6862] dark:text-[#A8A199] transition-colors cursor-pointer"
                            title="Listeden Kaldır"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Play Info */}
                      <div className="mt-3">
                        <Link
                          to={`/oyun/${play.id}`}
                          className="font-extrabold text-base text-[#1C1A1B] dark:text-[#F3EFEA] hover:underline line-clamp-1"
                        >
                          {play.title}
                        </Link>
                        <p className="text-xs italic text-[#6E6862] dark:text-[#A8A199] truncate mt-0.5">
                          {play.playwright}
                        </p>
                        <p className="text-[11px] text-[#6E6862] dark:text-[#A8A199] truncate">
                          {play.company || play.venue}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action: İzledim · Bilet Kes */}
                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setNewLogPlay(play);
                          setIsNewLogOpen(true);
                        }}
                        className="w-full py-2.5 px-4 rounded-full bg-[#BA1B23] hover:bg-[#9E1B22] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>İzledim · Bilet Kes</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty Watchlist */
            <div className="bg-[#FFFFFF] dark:bg-[#1A1819] border border-dashed border-[#E2DCD4] dark:border-[#332F31] p-12 text-center space-y-4 rounded-[22px]">
              <div className="w-14 h-14 rounded-full bg-[#E7EFE7] dark:bg-[#1A251C] text-[#2563EB] flex items-center justify-center mx-auto">
                <Bookmark className="w-6 h-6 text-[#2D6A4F]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-[#1C1A1B] dark:text-[#F3EFEA]">
                  İzleyeceğin oyunlar listen henüz boş
                </h3>
                <p className="text-xs sm:text-sm text-[#6E6862] dark:text-[#A8A199] max-w-sm mx-auto italic">
                  Katalogdaki oyunları inceleyerek merak ettiğin oyunları "İzlemek İstiyorum" olarak listene kaydedebilirsin.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-6 py-2.5 rounded-full bg-[#1C1A1B] text-white hover:bg-black transition-colors text-xs font-bold cursor-pointer shadow-sm"
                >
                  Kataloğu Keşfet
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. POP-UPS & MODALS                                            */}
      {/* ============================================================== */}

      {/* 03 Mühür Detayı Pop-up */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedBadge(null)}
          />
          <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#1A1819] border border-[#E2DCD4] dark:border-[#332F31] rounded-[24px] p-6 sm:p-7 shadow-2xl animate-fade-in font-serif text-center space-y-4">
            <button
              type="button"
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F1EDE7] dark:bg-[#2A2729] flex items-center justify-center text-[#1C1A1B] dark:text-[#F3EFEA] hover:bg-[#E2DCD4] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Seal Graphic */}
            <div className="pt-2 flex justify-center">
              {unlockedBadgeIds.has(selectedBadge.id) ? (
                <div className="w-24 h-24 rounded-full border-3 border-[#BA1B23] text-[#BA1B23] flex items-center justify-center -rotate-6 font-extrabold text-sm shadow-sm">
                  {badgeStats[selectedBadge.id as keyof typeof badgeStats]?.sealCode || 'MÜHÜR'}
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#A8A199] text-[#6E6862] dark:text-[#A8A199] flex items-center justify-center font-bold text-xs opacity-75">
                  {badgeStats[selectedBadge.id as keyof typeof badgeStats]?.sealCode || 'MÜHÜR'}
                </div>
              )}
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#BA1B23]">
                {unlockedBadgeIds.has(selectedBadge.id) ? 'TİYATRO PASAPORTU · MÜHÜRLENDİ' : 'TİYATRO PASAPORTU · KİLİTLİ'}
              </span>
              <h3 className="font-extrabold text-2xl text-[#1C1A1B] dark:text-[#F3EFEA] mt-1">
                {selectedBadge.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#6E6862] dark:text-[#A8A199] italic mt-1 leading-relaxed">
                {selectedBadge.description}
              </p>
            </div>

            {/* Progress Box */}
            {badgeStats[selectedBadge.id as keyof typeof badgeStats] && (
              <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#141414] rounded-2xl border border-[#E2DCD4] dark:border-[#332F31] space-y-2 text-left">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>
                    İlerleme: {badgeStats[selectedBadge.id as keyof typeof badgeStats].current} / {badgeStats[selectedBadge.id as keyof typeof badgeStats].target} {badgeStats[selectedBadge.id as keyof typeof badgeStats].unit}
                  </span>
                  <span className="font-bold text-[#BA1B23]">
                    +{selectedBadge.xpBonus} XP
                  </span>
                </div>
                <div className="w-full bg-[#E2DCD4] dark:bg-[#332F31] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#BA1B23] h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (badgeStats[selectedBadge.id as keyof typeof badgeStats].current /
                          badgeStats[selectedBadge.id as keyof typeof badgeStats].target) *
                          100
                      )}%`
                    }}
                  />
                </div>
                <p className="text-[10px] text-[#6E6862] dark:text-[#A8A199] italic">
                  Hedefe ulaşınca mühür otomatik basılır ve XP hesabına eklenir.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setSelectedBadge(null);
                navigate('/');
              }}
              className="w-full py-3 rounded-full bg-[#1C1A1B] text-white hover:bg-black transition-colors font-bold text-xs shadow-sm cursor-pointer"
            >
              Kataloğa git
            </button>
          </div>
        </div>
      )}

      {/* 08 Hesap Menüsü (Drawer / Modal) */}
      {isAccountMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsAccountMenuOpen(false)}
          />
          <div className="relative z-10 w-full sm:max-w-md bg-white dark:bg-[#1A1819] border border-[#E2DCD4] dark:border-[#332F31] rounded-t-[28px] sm:rounded-[24px] p-6 shadow-2xl animate-fade-in font-serif space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DCD4] dark:border-[#332F31]">
              <div>
                <h3 className="font-extrabold text-xl text-[#1C1A1B] dark:text-[#F3EFEA]">
                  Hesabın
                </h3>
                <p className="text-xs italic text-[#6E6862] dark:text-[#A8A199]">
                  {activeProfile.email || `@${activeProfile.displayName}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F1EDE7] dark:bg-[#2A2729] flex items-center justify-center text-[#1C1A1B] dark:text-[#F3EFEA] hover:bg-[#E2DCD4] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="space-y-1">
              
              {/* Sezon Özeti */}
              <button
                type="button"
                onClick={() => {
                  setIsAccountMenuOpen(false);
                  setIsWrappedOpen(true);
                }}
                className="w-full p-3 rounded-xl hover:bg-[#F1EDE7] dark:hover:bg-[#2A2729] flex items-center justify-between text-left transition-colors cursor-pointer group"
              >
                <div>
                  <div className="font-extrabold text-sm text-[#1C1A1B] dark:text-[#F3EFEA] group-hover:text-[#BA1B23] transition-colors">
                    Sezon Özeti
                  </div>
                  <div className="text-xs italic text-[#6E6862] dark:text-[#A8A199]">
                    Tiyatronot Wrapped 2025–2026
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#6E6862] group-hover:text-[#BA1B23]" />
              </button>

              {/* Profili Düzenle */}
              <button
                type="button"
                onClick={() => {
                  setNewDisplayName(activeProfile.displayName);
                  setIsEditingDisplayName(true);
                }}
                className="w-full p-3 rounded-xl hover:bg-[#F1EDE7] dark:hover:bg-[#2A2729] flex items-center justify-between text-left transition-colors cursor-pointer group"
              >
                <div>
                  <div className="font-extrabold text-sm text-[#1C1A1B] dark:text-[#F3EFEA] group-hover:text-[#BA1B23] transition-colors">
                    Profili düzenle
                  </div>
                  <div className="text-xs italic text-[#6E6862] dark:text-[#A8A199]">
                    Ad, profil fotoğrafı, gizlilik
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#6E6862] group-hover:text-[#BA1B23]" />
              </button>

              {/* Inline Edit Display Name form */}
              {isEditingDisplayName && (
                <div className="p-3 bg-[#FAF8F5] dark:bg-[#141414] rounded-xl border border-[#E2DCD4] dark:border-[#332F31] space-y-2">
                  <label className="text-xs font-bold block">Görünen Adın</label>
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-serif rounded-lg border border-[#E2DCD4] dark:border-[#332F31] bg-white dark:bg-[#1A1819] text-[#1C1A1B] dark:text-[#F3EFEA]"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEditingDisplayName(false)}
                      className="px-3 py-1 text-xs rounded-full border border-[#E2DCD4] text-[#6E6862]"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDisplayName}
                      className="px-3 py-1 text-xs rounded-full bg-[#BA1B23] text-white font-bold"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              )}

              {/* Profil Bağlantısını Paylaş */}
              <button
                type="button"
                onClick={handleCopyProfileLink}
                className="w-full p-3 rounded-xl hover:bg-[#F1EDE7] dark:hover:bg-[#2A2729] flex items-center justify-between text-left transition-colors cursor-pointer group"
              >
                <div>
                  <div className="font-extrabold text-sm text-[#1C1A1B] dark:text-[#F3EFEA] group-hover:text-[#BA1B23] transition-colors">
                    {copiedLink ? 'Bağlantı Kopyalandı!' : 'Profil bağlantısını paylaş'}
                  </div>
                  <div className="text-xs italic text-[#6E6862] dark:text-[#A8A199]">
                    Herkese açık profilin
                  </div>
                </div>
                <Share2 className="w-4 h-4 text-[#6E6862] group-hover:text-[#BA1B23]" />
              </button>

              {/* Yönetici Paneli (if admin) */}
              {role === 'admin' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    navigate('/admin');
                  }}
                  className="w-full p-3 rounded-xl hover:bg-[#F1EDE7] dark:hover:bg-[#2A2729] flex items-center justify-between text-left transition-colors cursor-pointer group"
                >
                  <div>
                    <div className="font-extrabold text-sm text-[#1C1A1B] dark:text-[#F3EFEA] group-hover:text-[#BA1B23] transition-colors">
                      Yönetici Paneli
                    </div>
                    <div className="text-xs italic text-[#6E6862] dark:text-[#A8A199]">
                      Yalnızca yöneticiler görür
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#6E6862] group-hover:text-[#BA1B23]" />
                </button>
              )}

              {/* Görünüm: Aydınlık / Karanlık */}
              <div className="p-3 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-sm text-[#1C1A1B] dark:text-[#F3EFEA]">
                    Görünüm: {isDark ? 'Karanlık' : 'Aydınlık'}
                  </div>
                  <div className="text-xs italic text-[#6E6862] dark:text-[#A8A199]">
                    Arayüz renk teması
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    isDark ? 'bg-[#BA1B23]' : 'bg-[#E2DCD4]'
                  }`}
                  aria-label="Tema Değiştir"
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform flex items-center justify-center ${
                      isDark ? 'right-0.5' : 'left-0.5'
                    }`}
                  >
                    {isDark ? <Moon className="w-3 h-3 text-[#BA1B23]" /> : <Sun className="w-3 h-3 text-amber-500" />}
                  </span>
                </button>
              </div>

            </div>

            {/* Bottom Button: Çıkış Yap */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAccountMenuOpen(false);
                  logout();
                }}
                className="w-full py-3 rounded-full bg-[#FCEAE6] hover:bg-[#F8D2CC] dark:bg-[#341B1C] dark:hover:bg-[#452224] text-[#BA1B23] font-bold text-xs transition-colors cursor-pointer text-center"
              >
                Çıkış Yap
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Social Story Modal */}
      {isShareOpen && shareReview && (
        <SocialShareModal
          isOpen={isShareOpen}
          onClose={() => {
            setIsShareOpen(false);
            setShareReview(null);
          }}
          review={shareReview}
          play={plays.find(p => p.id === shareReview.playId) || {
            id: shareReview.playId,
            title: shareReview.playTitle,
            originalTitle: shareReview.playTitle,
            playwright: 'Türk Tiyatrosu',
            director: '',
            cast: [],
            company: '',
            duration: 100,
            hasIntermission: true,
            year: 2026,
            genre: 'Tiyatro',
            venue: shareReview.venue || '',
            posterUrl: shareReview.playPosterUrl || '',
            synopsis: shareReview.reviewText,
            rating: shareReview.rating,
            reviewCount: 1,
            tags: []
          }}
        />
      )}

      {/* Edit Review Modal */}
      {isEditModalOpen && editingReview && (
        <LogModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingReview(null);
          }}
          reviewToEdit={editingReview}
          onReviewSaved={(updated) => {
            setReviews(prev => prev.map(r => r.id === updated.id ? updated : r));
            if (shareReview?.id === updated.id) {
              setShareReview(updated);
            }
          }}
        />
      )}

      {/* New Log Modal (from Watchlist or incomplete tickets) */}
      {isNewLogOpen && (
        <LogModal
          isOpen={isNewLogOpen}
          onClose={() => {
            setIsNewLogOpen(false);
            setNewLogPlay(null);
          }}
          preselectedPlay={newLogPlay}
          onReviewSaved={(newReview) => {
            setReviews(prev => [newReview, ...prev]);
            setActiveTab('notlar');
          }}
        />
      )}

      {/* Season Wrapped Modal */}
      {isWrappedOpen && activeProfile && (
        <SeasonWrappedModal
          isOpen={isWrappedOpen}
          onClose={() => setIsWrappedOpen(false)}
          user={activeProfile}
          seenPlays={seenPlays}
          reviews={userReviews}
        />
      )}

    </div>
  );
};

export default ProfilePage;

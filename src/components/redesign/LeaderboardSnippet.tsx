import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuthSafe } from '../../context/AuthContext';
import type { UserProfile } from '../../types';

interface LeaderboardSnippetProps {
  topUsers?: UserProfile[];
}

interface DisplayUser {
  uid: string;
  rank: number;
  displayName: string;
  initials: string;
  avatarBg: string;
  avatarTextColor: string;
  xp: number;
  xpFormatted: string;
  isCurrentUser: boolean;
}

const DEFAULT_LEADERS: Omit<DisplayUser, 'rank' | 'isCurrentUser'>[] = [
  {
    uid: 'leader-1',
    displayName: 'Deniz Kara',
    initials: 'DK',
    avatarBg: '#A61E22',
    avatarTextColor: '#FFFFFF',
    xp: 2450,
    xpFormatted: '2.450 XP',
  },
  {
    uid: 'leader-2',
    displayName: 'Ece Yalçın',
    initials: 'EY',
    avatarBg: '#D7CEF7',
    avatarTextColor: '#553EB0',
    xp: 1980,
    xpFormatted: '1.980 XP',
  },
  {
    uid: 'leader-3',
    displayName: 'Mert Aydın',
    initials: 'MA',
    avatarBg: '#D2E2D5',
    avatarTextColor: '#2F5E39',
    xp: 1720,
    xpFormatted: '1.720 XP',
  },
  {
    uid: 'leader-4',
    displayName: 'Selin Tunç',
    initials: 'ST',
    avatarBg: '#EFE3C8',
    avatarTextColor: '#745B25',
    xp: 1410,
    xpFormatted: '1.410 XP',
  },
  {
    uid: 'leader-5',
    displayName: 'Burak Özer',
    initials: 'BÖ',
    avatarBg: '#1C1A1B',
    avatarTextColor: '#FFFFFF',
    xp: 1180,
    xpFormatted: '1.180 XP',
  },
];

export const LeaderboardSnippet: React.FC<LeaderboardSnippetProps> = ({
  topUsers = [],
}) => {
  const auth = useAuthSafe();
  const currentUser = auth?.user || null;

  // 1. Sort all users strictly descending by XP
  const { displayTop5, currentUserRank, isUserInTop5 } = useMemo(() => {
    const colorPresets = [
      { bg: '#A61E22', text: '#FFFFFF' },
      { bg: '#D7CEF7', text: '#553EB0' },
      { bg: '#D2E2D5', text: '#2F5E39' },
      { bg: '#EFE3C8', text: '#745B25' },
      { bg: '#1C1A1B', text: '#FFFFFF' },
    ];

    // Combine topUsers and ensure currentUser is present
    const userMap = new Map<string, UserProfile>();
    for (const u of topUsers) {
      if (u.uid) userMap.set(u.uid, u);
    }
    if (currentUser?.uid) {
      const existing = userMap.get(currentUser.uid);
      userMap.set(currentUser.uid, {
        ...existing,
        ...currentUser,
        xp: currentUser.xp ?? existing?.xp ?? 0,
      });
    }

    let allList = Array.from(userMap.values());

    // Sort strictly descending by XP: highest XP first
    allList.sort((a, b) => {
      const xpA = a.xp ?? 0;
      const xpB = b.xp ?? 0;
      if (xpB !== xpA) return xpB - xpA;
      const seenA = (a.seenPlayIds || []).length;
      const seenB = (b.seenPlayIds || []).length;
      if (seenB !== seenA) return seenB - seenA;
      return (a.displayName || '').localeCompare(b.displayName || '');
    });

    // If completely empty, fallback to DEFAULT_LEADERS
    if (allList.length === 0) {
      const fallback = DEFAULT_LEADERS.map((d, i) => ({
        ...d,
        rank: i + 1,
        isCurrentUser: false,
      }));
      return {
        displayTop5: fallback,
        currentUserRank: null,
        isUserInTop5: false,
      };
    }

    // Determine current user rank in the full sorted list
    let userRank: number | null = null;
    let userInTop5 = false;

    if (currentUser?.uid) {
      const userIndex = allList.findIndex((u) => u.uid === currentUser.uid);
      if (userIndex !== -1) {
        userRank = userIndex + 1;
        userInTop5 = userRank <= 5;
      }
    }

    // Map top 5
    const top5Slice = allList.slice(0, 5);
    const mappedTop5: DisplayUser[] = top5Slice.map((u, i) => {
      const isCurrent = Boolean(currentUser?.uid && u.uid === currentUser.uid);
      const name = u.displayName || 'Tiyatrosever';
      const parts = name.trim().split(/\s+/);
      const initials = parts.length > 1
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase();
      const preset = colorPresets[i % colorPresets.length];
      const xpVal = u.xp ?? 0;

      return {
        uid: u.uid,
        rank: i + 1,
        displayName: isCurrent ? 'Sen' : name,
        initials: isCurrent ? (currentUser?.displayName?.[0]?.toUpperCase() || 'M') : initials,
        avatarBg: isCurrent ? '#386D44' : preset.bg,
        avatarTextColor: '#FFFFFF',
        xp: xpVal,
        xpFormatted: `${xpVal.toLocaleString('tr-TR')} XP`,
        isCurrentUser: isCurrent,
      };
    });

    // If fewer than 5 users exist, pad with defaults while preserving user ranking
    if (mappedTop5.length < 5) {
      const usedNames = new Set(mappedTop5.map((m) => m.displayName.toLowerCase()));
      for (const d of DEFAULT_LEADERS) {
        if (mappedTop5.length >= 5) break;
        if (!usedNames.has(d.displayName.toLowerCase())) {
          mappedTop5.push({
            ...d,
            rank: mappedTop5.length + 1,
            isCurrentUser: false,
          });
        }
      }
    }

    return {
      displayTop5: mappedTop5,
      currentUserRank: userRank,
      isUserInTop5: userInTop5,
    };
  }, [topUsers, currentUser]);

  const renderRankBadge = (rank: number, isCurrentUser: boolean) => {
    if (rank === 1) {
      return (
        <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#D4A328] text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 shadow-xs">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#C5BFB8] text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 shadow-xs">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#D59A6D] text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 shadow-xs">
          3
        </span>
      );
    }
    return (
      <span
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-transparent flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 ${
          isCurrentUser ? 'text-white' : 'text-[#1C1A1B] dark:text-white'
        }`}
      >
        {rank}
      </span>
    );
  };

  const currentUserInitial = currentUser?.displayName
    ? currentUser.displayName.trim()[0].toUpperCase()
    : 'M';
  const currentUserXpVal = currentUser?.xp ?? 0;
  const currentUserXpFormatted = `${currentUserXpVal.toLocaleString('tr-TR')} XP`;

  return (
    <section
      id="liderler"
      className="rounded-[20px] sm:rounded-[24px] bg-[#F7DDD6] dark:bg-[#2A1E1D] pt-4 pb-3.5 px-3.5 sm:p-6 lg:p-7 flex flex-col justify-between font-sans text-tn-text h-full shadow-sm border border-[#F0CEC4] dark:border-[#3E2C2A]"
    >
      <div>
        <div className="pt-0.5">
          <Link
            to="/liderler"
            className="m-0 font-display font-extrabold text-[20px] sm:text-[26px] lg:text-[32px] leading-normal tracking-[-0.03em] text-[#1C1A1B] dark:text-white hover:text-tn-red transition-colors no-underline block"
          >
            Sahne <span className="font-accent italic font-normal">liderleri</span>
          </Link>
        </div>

        {/* Rows 1-5 Capsules */}
        <div className="flex flex-col gap-1.5 sm:gap-2 mt-2 sm:mt-4">
          {displayTop5.map((item) => {
            const isHighlight = item.isCurrentUser;
            const containerStyle = isHighlight
              ? 'bg-[#1C1A1B] text-white hover:bg-black shadow-sm'
              : 'bg-white dark:bg-[#1E1A1A] hover:bg-white/95 dark:hover:bg-[#262020] text-[#1C1A1B] dark:text-white shadow-xs border border-black/5 dark:border-white/5';

            return (
              <Link
                key={item.uid}
                to={isHighlight ? '/profil' : (item.uid.startsWith('leader-') ? '/liderler' : `/profil/${item.uid}`)}
                className={`flex items-center justify-between px-3 py-1.5 sm:px-3.5 sm:py-2.5 rounded-full transition-transform hover:scale-[1.01] no-underline ${containerStyle}`}
              >
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  {renderRankBadge(item.rank, isHighlight)}
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0"
                    style={{ backgroundColor: item.avatarBg, color: item.avatarTextColor }}
                  >
                    {item.initials}
                  </div>
                  <span
                    className={`font-sans font-bold text-sm sm:text-[14.5px] truncate ${
                      isHighlight ? 'text-white' : 'text-[#1C1A1B] dark:text-white'
                    }`}
                  >
                    {item.displayName}
                  </span>
                </div>
                <span
                  className={`font-sans font-bold text-xs sm:text-[13px] shrink-0 ml-2 ${
                    isHighlight ? 'text-white' : 'text-[#1C1A1B] dark:text-white'
                  }`}
                >
                  {item.xpFormatted}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 
        6th Pinned Bottom Row:
        ONLY shown if the user is logged in AND NOT in the top 5
      */}
      {currentUser && !isUserInTop5 && (
        <Link
          to="/profil"
          className="flex items-center justify-between px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-full bg-[#1C1A1B] text-white hover:bg-black transition-transform hover:scale-[1.01] no-underline mt-2 sm:mt-3.5 shadow-sm"
        >
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="font-sans font-bold text-xs sm:text-sm text-white/90 w-7 sm:w-8 text-center shrink-0">
              {currentUserRank || 6}
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#386D44] text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
              {currentUserInitial}
            </div>
            <span className="font-sans font-bold text-sm sm:text-[14.5px] text-white">
              Sen
            </span>
          </div>
          <span className="font-sans font-bold text-xs sm:text-[13px] text-white shrink-0">
            {currentUserXpFormatted}
          </span>
        </Link>
      )}
    </section>
  );
};

export default LeaderboardSnippet;

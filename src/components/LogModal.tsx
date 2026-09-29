import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, Check, Share2, Scissors, Search, ChevronLeft, Sparkles, Theater } from 'lucide-react';
import confetti from 'canvas-confetti';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import type { Play, ReviewEntry } from '../types';
import { matchesSearchQuery } from '../utils/textUtils';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPlay?: Play | null;
  reviewToEdit?: ReviewEntry | null;
  onReviewSaved?: (review: ReviewEntry) => void;
}

type Step = 1 | 2 | 3 | 4; // 1: Oyun & Tarih, 2: Alkış, 3: İzlenimin, 4: Bilet kesildi

const getOvationInfo = (score: number) => {
  if (score >= 5.0) return { title: 'Ayakta Alkış', quote: 'Biten bitendir — salon ayağa kalktı.' };
  if (score >= 4.5) return { title: 'Muazzam Reji & Sahne', quote: 'Salonun büyülendiği anlar, güçlü bir reji.' };
  if (score >= 4.0) return { title: 'Çok İyi', quote: 'Güçlü oyunculuklar, salondan memnun ayrıldık.' };
  if (score >= 3.5) return { title: 'Etkileyici Performans', quote: 'Bazı sahneler parıldadı, izlemeye değer.' };
  if (score >= 3.0) return { title: 'Orta Karar', quote: 'Kötü değil ama akılda kalıcı bir anı da bırakmadı.' };
  if (score >= 2.5) return { title: 'İzlenebilir', quote: 'İyi niyetli bir deneme ama tempo düşüktü.' };
  if (score >= 2.0) return { title: 'Zayıf', quote: 'Metin vardı ama sahne ruhunu bulamadı.' };
  if (score >= 1.5) return { title: 'Eksik Kalan Prodüksiyon', quote: 'Potansiyeli olan ancak sahneye yansımayan bir yapım.' };
  return { title: 'Hayal Kırıklığı', quote: 'Işıklar yandı, salondan ilk çıkan ben oldum.' };
};

const BAR_LEVELS = [
  { level: 1, heightClass: 'h-14 sm:h-16' },
  { level: 2, heightClass: 'h-20 sm:h-22' },
  { level: 3, heightClass: 'h-26 sm:h-28' },
  { level: 4, heightClass: 'h-32 sm:h-34' },
  { level: 5, heightClass: 'h-38 sm:h-40' },
];

const HIGHLIGHT_TAGS = ['Oyunculuk', 'Metin', 'Reji', 'Işık', 'Müzik', 'Dekor & Kostüm'];

export const LogModal: React.FC<LogModalProps> = ({
  isOpen,
  onClose,
  preselectedPlay,
  reviewToEdit,
  onReviewSaved,
}) => {
  const { user } = useAuth();
  const [plays, setPlays] = useState<Play[]>([]);
  const [step, setStep] = useState<Step>(1);

  // Form State
  const [selectedPlay, setSelectedPlay] = useState<Play | null>(null);
  const [isChangingPlay, setIsChangingPlay] = useState(false);
  const [playSearch, setPlaySearch] = useState('');

  // Step 1: Oyun & Tarih
  const [dateMode, setDateMode] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [performanceDate, setPerformanceDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Step 2: Alkış ölçeği & alt kırılımlar
  const [rating, setRating] = useState<number>(5);
  const [performanceRating, setPerformanceRating] = useState<number>(0); // Cast / Oyunculuk (Purple)
  const [technicalRating, setTechnicalRating] = useState<number>(0); // Production / Reji & Sahne (Blue)

  // Step 3: İzlenimin
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState('');
  const [hasSpoilers, setHasSpoilers] = useState(false);

  // Status & UI State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(reviewToEdit);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Load plays
  useEffect(() => {
    if (!isOpen) return;
    storageService.getPlays().then(setPlays);
  }, [isOpen]);

  // Initialize or reset values on open
  useEffect(() => {
    if (!isOpen) return;

    if (reviewToEdit) {
      setStep(1);
      setRating(reviewToEdit.rating || 5);
      setPerformanceRating(reviewToEdit.performanceRating || 0);
      setTechnicalRating(reviewToEdit.technicalRating || 0);
      setPerformanceDate(reviewToEdit.performanceDate || new Date().toISOString().slice(0, 10));
      setReviewText(reviewToEdit.reviewText || '');
      setHasSpoilers(Boolean(reviewToEdit.hasSpoilers));

      storageService.getPlayById(reviewToEdit.playId).then(p => {
        if (p) {
          setSelectedPlay(p);
        } else {
          setSelectedPlay({
            id: reviewToEdit.playId,
            title: reviewToEdit.playTitle,
            originalTitle: reviewToEdit.playTitle,
            playwright: '',
            director: '',
            cast: [],
            company: '',
            duration: 100,
            hasIntermission: false,
            year: 2026,
            genre: 'Tiyatro',
            venue: reviewToEdit.venue || '',
            posterUrl: reviewToEdit.playPosterUrl || '',
            synopsis: '',
            rating: reviewToEdit.rating,
            reviewCount: 1,
            tags: [],
          });
        }
      });
      setIsChangingPlay(false);
    } else if (preselectedPlay) {
      setSelectedPlay(preselectedPlay);
      setIsChangingPlay(false);
      setStep(1);
      setRating(5);
      setPerformanceRating(0);
      setTechnicalRating(0);
      setDateMode('today');
      setPerformanceDate(new Date().toISOString().slice(0, 10));
      setSelectedTags([]);
      setReviewText('');
      setHasSpoilers(false);
      setError(null);
    } else {
      setSelectedPlay(null);
      setIsChangingPlay(true);
      setStep(1);
      setRating(5);
      setPerformanceRating(0);
      setTechnicalRating(0);
      setDateMode('today');
      setPerformanceDate(new Date().toISOString().slice(0, 10));
      setSelectedTags([]);
      setReviewText('');
      setHasSpoilers(false);
      setError(null);
    }
  }, [isOpen, preselectedPlay, reviewToEdit]);

  const resetForm = useCallback(() => {
    setStep(1);
    setSelectedPlay(null);
    setIsChangingPlay(false);
    setPlaySearch('');
    setRating(5);
    setPerformanceRating(0);
    setTechnicalRating(0);
    setDateMode('today');
    setPerformanceDate(new Date().toISOString().slice(0, 10));
    setSelectedTags([]);
    setReviewText('');
    setHasSpoilers(false);
    setError(null);
    setCopiedShare(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // Date selection helpers
  const handleDateModeChange = (mode: 'today' | 'yesterday' | 'custom') => {
    setDateMode(mode);
    if (mode === 'today') {
      setPerformanceDate(new Date().toISOString().slice(0, 10));
    } else if (mode === 'yesterday') {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      setPerformanceDate(yesterday);
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const formatTicketDate = (isoStr: string) => {
    try {
      const [year, month, day] = isoStr.split('-');
      if (year && month && day) {
        return `${day}.${month}.${year}`;
      }
      return isoStr;
    } catch {
      return isoStr;
    }
  };

  const ticketNo = `IST-TN-2026-${(selectedPlay?.id || 'MN8A').slice(-4).toUpperCase()}`;

  const currentOvation = getOvationInfo(rating);

  const filteredPlays = playSearch.trim().length >= 1
    ? plays.filter(p => matchesSearchQuery([p.title, p.playwright, p.venue || ''], playSearch)).slice(0, 6)
    : plays.slice(0, 6);

  // Dynamic typography for long play titles
  const playTitleLength = (selectedPlay?.title || '').length;
  const playTitleSizeClass =
    playTitleLength > 36
      ? 'text-sm sm:text-base leading-snug'
      : playTitleLength > 22
      ? 'text-base sm:text-lg leading-tight'
      : 'text-lg sm:text-2xl leading-tight';

  // Submit / Finalize review
  const handleBiletiKes = async () => {
    if (!user) {
      setError('Bilet kesmek için lütfen giriş yapın.');
      return;
    }
    if (!selectedPlay) {
      setError('Lütfen bir oyun seçin.');
      setStep(1);
      return;
    }
    if (rating === 0) {
      setError('Lütfen bir alkış derecesi seçin.');
      setStep(2);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (isEditing && reviewToEdit) {
        const updatePayload: Partial<ReviewEntry> = {
          rating,
          technicalRating: technicalRating > 0 ? technicalRating : undefined,
          performanceRating: performanceRating > 0 ? performanceRating : undefined,
          reviewText: reviewText.trim(),
          performanceDate,
          hasSpoilers,
        };
        const saved = await storageService.updateReview(reviewToEdit.id, updatePayload);
        onReviewSaved?.(saved);
        window.dispatchEvent(new CustomEvent('tiyatronot:review-updated', { detail: saved }));
        setStep(4);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        // Check 1 review per play per user constraint
        const existingReviews = await storageService.getReviews(selectedPlay.id);
        const alreadyReviewed = existingReviews.some(r => r.userId === user.uid);
        if (alreadyReviewed) {
          setError('Bu oyun için zaten bir biletiniz kesilmiş.');
          setSubmitting(false);
          return;
        }

        const reviewPayload = {
          playId: selectedPlay.id,
          playTitle: selectedPlay.title,
          playPosterUrl: selectedPlay.posterUrl,
          userId: user.uid,
          userName: user.displayName || 'Tiyatrosever',
          userAvatar: user.photoURL || undefined,
          rating,
          technicalRating: technicalRating > 0 ? technicalRating : undefined,
          performanceRating: performanceRating > 0 ? performanceRating : undefined,
          reviewText: reviewText.trim(),
          performanceDate,
          hasSpoilers,
        };

        const saved = await storageService.createReview(reviewPayload);
        onReviewSaved?.(saved);
        window.dispatchEvent(new CustomEvent('tiyatronot:review-updated', { detail: saved }));
        setStep(4);
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#BA1B23', '#8B5CF6', '#2563EB', '#E4B33A'],
        });
      }
    } catch (err) {
      console.error('[LogModal] Error saving ticket review:', err);
      setError('Bilet kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShareTicket = () => {
    const playUrl = `${window.location.origin}/oyun/${selectedPlay?.id || ''}`;
    navigator.clipboard.writeText(playUrl).then(() => {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }).catch(() => {});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-5xl bg-[#FFFCF7] dark:bg-[#1A1819] rounded-t-[28px] sm:rounded-[24px] overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 flex flex-col lg:grid lg:grid-cols-[430px_minmax(0,1fr)] max-h-[95vh] sm:max-h-[90vh] my-auto animate-fade-in font-serif transition-colors duration-200">

        {/* DESKTOP LEFT COLUMN: THEATRICAL BACKDROP & LIVE TICKET STUB */}
        <div className="hidden lg:flex bg-[#181617] dark:bg-[#121011] p-6 lg:p-7 flex-col justify-between items-center relative overflow-hidden select-none border-r border-[#2A2628] dark:border-[#221F21]">
          {/* Subtle Stage Spotlight Radial Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(186,27,35,0.18)_0%,rgba(24,22,23,0)_75%)] pointer-events-none" />

          {/* Top Stage Logo */}
          <div className="w-full flex items-center justify-between text-white/80 z-10">
            <span className="font-serif font-extrabold tracking-[0.2em] text-xs uppercase text-white/90">
              TİYATRO NOT
            </span>
            <span className="text-[10px] font-mono tracking-widest text-[#8E8780] uppercase">
              {step === 4 ? 'ONAYLANDI' : `PERDE ${['I', 'II', 'III'][step - 1] || 'III'}`}
            </span>
          </div>

          {/* Center Area: Ticket Preview */}
          <div className="my-auto w-full py-4 z-10 flex flex-col items-center">
            {/* Live Indicator Hint */}
            <p className="italic text-xs text-[#9C948A] mb-3 text-center">
              {step === 4 ? 'Biletin basıldı ve günlüğe işlendi.' : 'Biletin sen yazdıkça basılıyor.'}
            </p>

            {/* THE TICKET STUB (DESKTOP HORIZONTAL STUB) */}
            <div
              className={`w-full max-w-[380px] bg-[#FFFCF7] dark:bg-[#201D1E] text-[#1C1A1B] dark:text-[#F3EFEA] rounded-2xl shadow-2xl overflow-hidden border border-[#E8DFD5] dark:border-[#383336] transition-all duration-300 relative flex ${
                step === 4 ? 'rotate-[-1deg] scale-[1.02]' : ''
              }`}
            >
              {/* LEFT PART: TICKET BODY (~72%) */}
              <div className="flex-[2.8] p-4 flex flex-col justify-between min-w-0">
                {/* Header Row */}
                <div className="flex items-center justify-between gap-1 text-[10px] mb-1">
                  <span className="italic font-semibold text-[#BA1B23]">
                    TİYATRO·NOT <span className="text-[#6E6862] dark:text-[#9A928A] font-normal">seyirci bileti</span>
                  </span>
                  <span className="font-mono text-[9px] text-[#8E8780] tracking-wider uppercase truncate">
                    {ticketNo}
                  </span>
                </div>

                {/* Play Title & Playwright (Dynamic fit for long titles) */}
                <div className="my-1.5 min-w-0">
                  <div
                    className={`font-bold text-[#1C1A1B] dark:text-white line-clamp-2 break-words ${playTitleSizeClass}`}
                    title={selectedPlay?.title || 'Oyun Seçiniz'}
                  >
                    {selectedPlay?.title || 'Oyun Seçiniz'}
                  </div>
                  <div className="italic text-xs text-[#6E6862] dark:text-[#A8A29E] truncate mt-0.5">
                    {selectedPlay?.playwright || 'Yazar Belirtilmemiş'}
                  </div>
                </div>

                {/* Specs Strip: Tarih + (İsteğe bağlı) Oyunculuk & Prodüksiyon */}
                <div className="flex items-center justify-between gap-1.5 py-2 my-1 border-t border-b border-[#E8E2D9] dark:border-[#353033] text-left">
                  <div>
                    <span className="block text-[8px] font-bold tracking-wider text-[#8E8780] uppercase">
                      TARİH
                    </span>
                    <span className="text-[11px] font-bold text-[#1C1A1B] dark:text-white truncate block">
                      {formatTicketDate(performanceDate)}
                    </span>
                  </div>
                  {performanceRating > 0 && (
                    <div>
                      <span className="block text-[8px] font-bold tracking-wider text-[#8B5CF6] uppercase">
                        OYUNCULUK
                      </span>
                      <span className="text-[11px] font-bold text-[#8B5CF6] truncate block">
                        {performanceRating} / 5
                      </span>
                    </div>
                  )}
                  {technicalRating > 0 && (
                    <div>
                      <span className="block text-[8px] font-bold tracking-wider text-[#2563EB] uppercase">
                        PRODÜKSİYON
                      </span>
                      <span className="text-[11px] font-bold text-[#2563EB] truncate block">
                        {technicalRating} / 5
                      </span>
                    </div>
                  )}
                </div>

                {/* İzlenim / Quote Excerpt */}
                <div className="mt-1 min-h-[38px] flex flex-col justify-end">
                  <span className="text-[8px] font-bold tracking-wider text-[#8E8780] uppercase block">
                    İZLENİM
                  </span>
                  <p
                    className={`text-[11px] leading-tight m-0 text-[#1C1A1B] dark:text-[#E2DDD5] line-clamp-2 transition-all ${
                      hasSpoilers ? 'filter blur-[2.5px]' : 'italic'
                    }`}
                  >
                    {reviewText.trim() ? `"${reviewText.trim()}"` : 'İzlenimin burada basılacak…'}
                  </p>
                  {selectedTags.length > 0 && (
                    <span className="text-[9px] text-[#6E6862] dark:text-[#9A928A] italic mt-0.5 truncate">
                      {selectedTags.join(' · ').toLowerCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* PERFORATION NOTCH DIVIDER */}
              <div className="relative border-r-2 border-dashed border-[#D8D2CA] dark:border-[#3F3A3D] flex flex-col justify-between">
                <div className="absolute -top-2.5 -right-[7px] w-3.5 h-3.5 rounded-full bg-[#181617] dark:bg-[#121011] z-20" />
                <div className="absolute -bottom-2.5 -right-[7px] w-3.5 h-3.5 rounded-full bg-[#181617] dark:bg-[#121011] z-20" />
              </div>

              {/* RIGHT PART: STUB (~28%) */}
              <div
                className={`flex-1 p-3 bg-[#FAF7F0] dark:bg-[#272325] flex flex-col justify-between items-center text-center transition-transform ${
                  step === 4 ? 'translate-y-0.5' : ''
                }`}
              >
                <div>
                  <span className="text-[9px] font-bold tracking-widest text-[#8E8780] uppercase block">
                    ALKIŞ
                  </span>
                  {rating > 0 ? (
                    <div className="mt-1">
                      <div className="font-extrabold text-2xl text-[#1C1A1B] dark:text-white leading-none">
                        {rating.toFixed(1)}
                      </div>
                      <div className="text-[10px] font-medium text-[#BA1B23] italic leading-tight mt-0.5">
                        {currentOvation.title}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-[#8E8780] italic">
                      —<br />henüz yok
                    </div>
                  )}
                </div>

                {/* Rubber Stamp for Step 4 / Completed */}
                {step === 4 && (
                  <div className="border-[1.5px] border-[#BA1B23] text-[#BA1B23] font-serif font-black text-[9px] tracking-widest uppercase px-1 py-0.5 rounded -rotate-6 select-none shadow-2xs my-1 animate-scale-in">
                    GİRİŞ ONAYLI
                  </div>
                )}

                {/* Authentic Barcode Strip */}
                <div className="w-full flex items-end justify-center gap-0.5 h-8 opacity-75 dark:opacity-85 mt-auto pt-1" aria-hidden="true">
                  <span className="w-1 bg-[#1C1A1B] dark:bg-white h-full" />
                  <span className="w-0.5 bg-[#1C1A1B] dark:bg-white h-full" />
                  <span className="w-1.5 bg-[#1C1A1B] dark:bg-white h-full" />
                  <span className="w-0.5 bg-[#1C1A1B] dark:bg-white h-full" />
                  <span className="w-1 bg-[#1C1A1B] dark:bg-white h-full" />
                  <span className="w-2 bg-[#1C1A1B] dark:bg-white h-full" />
                  <span className="w-0.5 bg-[#1C1A1B] dark:bg-white h-full" />
                  <span className="w-1 bg-[#1C1A1B] dark:bg-white h-full" />
                  <span className="w-1.5 bg-[#1C1A1B] dark:bg-white h-full" />
                  <span className="w-0.5 bg-[#1C1A1B] dark:bg-white h-full" />
                  <span className="w-1 bg-[#1C1A1B] dark:bg-white h-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom subtle watermark */}
          <div className="text-[10px] text-white/30 font-mono tracking-wider z-10">
            TİYATRONOT · DİJİTAL SAHNE KOÇANI
          </div>
        </div>

        {/* RIGHT COLUMN (DESKTOP) / FULL MODAL (MOBILE) */}
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col justify-between overflow-y-auto max-h-[95vh] sm:max-h-[90vh] bg-[#FFFCF7] dark:bg-[#1A1819] text-[#1C1A1B] dark:text-[#F3EFEA] transition-colors duration-200">
          
          {/* Top Header & Close Button */}
          <div className="flex items-center justify-between pb-3 border-b border-[#EADBCA]/60 dark:border-[#332E31]">
            <h2 className="font-serif font-bold text-lg sm:text-xl text-[#1C1A1B] dark:text-white">
              Bilet Kes
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-[#F1EDE7] hover:bg-[#E5E0D8] dark:bg-[#2C272A] dark:hover:bg-[#383236] text-[#1C1A1B] dark:text-[#F3EFEA] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* MOBILE TICKET STUB (Matches media_1790716477831.png) */}
          <div className="block lg:hidden my-2.5 bg-[#181617] dark:bg-[#121011] p-2.5 rounded-2xl border border-[#2A2628] shadow-inner select-none">
            <div className="w-full bg-[#FFFCF7] dark:bg-[#201D1E] text-[#1C1A1B] dark:text-[#F3EFEA] rounded-xl shadow-md border border-[#E8DFD5] dark:border-[#383336] overflow-hidden relative">
              {/* Top Ticket Body */}
              <div className="p-3 flex flex-col justify-between gap-1">
                {/* Header */}
                <div className="flex items-center justify-between text-[9px]">
                  <span className="italic font-semibold text-[#BA1B23]">
                    TİYATRO·NOT <span className="text-[#6E6862] dark:text-[#9A928A] font-normal">seyirci bileti</span>
                  </span>
                  <span className="font-mono text-[8px] text-[#8E8780] tracking-wider uppercase truncate">
                    {ticketNo}
                  </span>
                </div>

                {/* Title & Author */}
                <div className="min-w-0">
                  <div
                    className={`font-bold text-[#1C1A1B] dark:text-white line-clamp-2 break-words ${playTitleSizeClass}`}
                    title={selectedPlay?.title || 'Oyun Seçiniz'}
                  >
                    {selectedPlay?.title || 'Oyun Seçiniz'}
                  </div>
                  <div className="italic text-[11px] text-[#6E6862] dark:text-[#A8A29E] truncate">
                    {selectedPlay?.playwright || 'Yazar Belirtilmemiş'}
                  </div>
                </div>

                {/* Specs Strip: Tarih + (İsteğe bağlı) Oyunculuk & Prodüksiyon */}
                <div className="flex items-center justify-between gap-1 py-1 border-t border-b border-[#E8E2D9] dark:border-[#353033] text-left">
                  <div>
                    <span className="block text-[7px] font-bold tracking-wider text-[#8E8780] uppercase">
                      TARİH
                    </span>
                    <span className="text-[10px] font-bold text-[#1C1A1B] dark:text-white truncate block">
                      {formatTicketDate(performanceDate)}
                    </span>
                  </div>
                  {performanceRating > 0 && (
                    <div>
                      <span className="block text-[7px] font-bold tracking-wider text-[#8B5CF6] uppercase">
                        OYUNCULUK
                      </span>
                      <span className="text-[10px] font-bold text-[#8B5CF6] truncate block">
                        {performanceRating} / 5
                      </span>
                    </div>
                  )}
                  {technicalRating > 0 && (
                    <div>
                      <span className="block text-[7px] font-bold tracking-wider text-[#2563EB] uppercase">
                        PRODÜKSİYON
                      </span>
                      <span className="text-[10px] font-bold text-[#2563EB] truncate block">
                        {technicalRating} / 5
                      </span>
                    </div>
                  )}
                </div>

                {/* İzlenim / Quote Excerpt */}
                <div className="min-h-[24px] flex flex-col justify-end">
                  <span className="text-[7px] font-bold tracking-wider text-[#8E8780] uppercase block">
                    İZLENİM
                  </span>
                  <p
                    className={`text-[10px] leading-tight m-0 text-[#1C1A1B] dark:text-[#E2DDD5] line-clamp-1 transition-all ${
                      hasSpoilers ? 'filter blur-[2.5px]' : 'italic'
                    }`}
                  >
                    {reviewText.trim() ? `"${reviewText.trim()}"` : 'İzlenimin burada basılacak…'}
                  </p>
                  {selectedTags.length > 0 && (
                    <span className="text-[8px] text-[#6E6862] dark:text-[#9A928A] italic truncate">
                      {selectedTags.join(' · ').toLowerCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Perforation Line (Horizontal with Left/Right Circular Notches) */}
              <div className="relative border-b-2 border-dashed border-[#D8D2CA] dark:border-[#3F3A3D]">
                <div className="absolute -left-2 -top-2 w-3.5 h-3.5 rounded-full bg-[#181617] dark:bg-[#121011] z-20" />
                <div className="absolute -right-2 -top-2 w-3.5 h-3.5 rounded-full bg-[#181617] dark:bg-[#121011] z-20" />
              </div>

              {/* Bottom Stub */}
              <div
                className={`p-2 px-3 bg-[#FAF7F0] dark:bg-[#272325] flex items-center justify-between gap-2 transition-transform ${
                  step === 4 ? 'translate-y-0.5' : ''
                }`}
              >
                <div>
                  <span className="text-[7px] font-bold tracking-widest text-[#8E8780] uppercase block">
                    ALKIŞ
                  </span>
                  {rating > 0 ? (
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-extrabold text-lg text-[#1C1A1B] dark:text-white leading-none">
                        {rating.toFixed(1)}
                      </span>
                      <span className="text-[9px] font-medium text-[#BA1B23] italic">
                        {currentOvation.title}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-[#8E8780] italic">— henüz yok</span>
                  )}
                </div>

                {/* Rubber Stamp for Step 4 */}
                {step === 4 && (
                  <div className="border-[1.5px] border-[#BA1B23] text-[#BA1B23] font-serif font-black text-[9px] tracking-widest uppercase px-1.5 py-0.5 rounded -rotate-6 select-none shadow-2xs animate-scale-in">
                    GİRİŞ ONAYLI
                  </div>
                )}

                {/* Right Barcode */}
                <div className="flex items-end justify-end gap-0.5 h-5 opacity-75 dark:opacity-85" aria-hidden="true">
                  <span className="w-0.5 bg-[#1C1A1B] dark:bg-white h-full" />
                  <span className="w-1 bg-[#1C1A1B] dark:bg-white h-full" />
                  <span className="w-0.5 bg-[#1C1A1B] dark:bg-white h-full" />
                  <span className="w-1.5 bg-[#1C1A1B] dark:bg-white h-full" />
                  <span className="w-0.5 bg-[#1C1A1B] dark:bg-white h-full" />
                  <span className="w-1 bg-[#1C1A1B] dark:bg-white h-full" />
                  <span className="w-1.5 bg-[#1C1A1B] dark:bg-white h-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Stepper Tabs Bar (Steps 1 to 3) */}
          {step <= 3 && (
            <div className="pt-1 sm:pt-2">
              <div className="flex items-center justify-between text-xs font-serif border-b border-[#EADBCA]/50 dark:border-[#332E31] pb-2">
                {[
                  { num: 1, label: 'I · Oyun & Tarih' },
                  { num: 2, label: 'II · Alkış' },
                  { num: 3, label: 'III · İzlenimin' },
                ].map(item => (
                  <button
                    key={item.num}
                    type="button"
                    onClick={() => {
                      if (item.num <= step || selectedPlay) {
                        setStep(item.num as Step);
                      }
                    }}
                    className={`transition-colors cursor-pointer pb-0.5 text-xs sm:text-sm ${
                      step === item.num
                        ? 'font-bold text-[#1C1A1B] dark:text-white border-b-2 border-[#BA1B23]'
                        : item.num < step
                        ? 'text-[#6E6862] dark:text-[#9A928A] hover:text-[#1C1A1B] dark:hover:text-white'
                        : 'text-[#B8B0A8] dark:text-[#524C50] cursor-default'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Subheading Badge */}
              <div className="mt-2.5 sm:mt-3">
                <span className="text-[10px] font-bold text-[#BA1B23] tracking-widest uppercase">
                  PERDE {['I', 'II', 'III'][step - 1]} / III
                </span>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#1C1A1B] dark:text-white leading-tight">
                  {step === 1 && 'Oyun & Tarih'}
                  {step === 2 && 'Alkış ölçeği'}
                  {step === 3 && 'İzlenimin'}
                </h3>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="my-2 p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-[#BA1B23] text-xs font-serif rounded-xl">
              {error}
            </div>
          )}

          {/* STEP 1: PERDE I - OYUN & TARİH */}
          {step === 1 && (
            <div className="space-y-4 py-3 my-auto">
              {/* Play Selection Card */}
              {selectedPlay && !isChangingPlay ? (
                <div className="bg-[#FBF9F5] dark:bg-[#232022] border border-[#EADBCA] dark:border-[#383235] rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="min-w-0">
                    <h4 className="font-serif font-bold text-sm sm:text-base text-[#1C1A1B] dark:text-white truncate">
                      {selectedPlay.title}
                    </h4>
                    <p className="italic text-xs text-[#6E6862] dark:text-[#9A928A] truncate mt-0.5">
                      {selectedPlay.playwright || 'Arthur Miller'} {selectedPlay.company ? `· ${selectedPlay.company}` : ''}
                    </p>
                  </div>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPlay(true);
                        setTimeout(() => searchInputRef.current?.focus(), 50);
                      }}
                      className="px-3 py-1.5 bg-white dark:bg-[#2C272A] hover:bg-[#F1EDE7] dark:hover:bg-[#383236] text-[#1C1A1B] dark:text-white text-xs font-serif font-medium rounded-full border border-[#D8D2CA] dark:border-[#443E42] shadow-2xs transition-colors shrink-0 cursor-pointer"
                    >
                      Değiştir
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2 bg-[#FBF9F5] dark:bg-[#232022] p-3 rounded-2xl border border-[#EADBCA] dark:border-[#383235]">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8780]" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={playSearch}
                      onChange={e => setPlaySearch(e.target.value)}
                      placeholder="Oyun adı veya yazar ara..."
                      className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#2A2628] rounded-xl border border-[#D8D2CA] dark:border-[#3F3A3D] text-sm font-serif text-[#1C1A1B] dark:text-white placeholder:text-[#9A928A] focus:outline-none focus:ring-1 focus:ring-[#BA1B23]"
                    />
                  </div>
                  {/* Results list */}
                  <div className="max-h-36 overflow-y-auto divide-y divide-[#EADBCA]/60 dark:divide-[#383235] rounded-xl bg-white dark:bg-[#2A2628] border border-[#EADBCA]/50 dark:border-[#383235]">
                    {filteredPlays.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPlay(p);
                          setIsChangingPlay(false);
                          setPlaySearch('');
                        }}
                        className="w-full p-2 text-left hover:bg-[#F6F3EE] dark:hover:bg-[#342F32] flex items-center justify-between text-xs font-serif transition-colors cursor-pointer"
                      >
                        <span className="font-bold text-[#1C1A1B] dark:text-white truncate">{p.title}</span>
                        <span className="italic text-[#6E6862] dark:text-[#9A928A] text-[11px] truncate ml-2">
                          {p.playwright}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ne zaman izledin? Date options */}
              <div className="space-y-1.5">
                <label className="text-xs font-serif text-[#6E6862] dark:text-[#A8A29E] italic block">
                  Ne zaman izledin?
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDateModeChange('today')}
                    className={`flex-1 py-2 px-2.5 rounded-xl font-serif text-xs transition-colors cursor-pointer ${
                      dateMode === 'today'
                        ? 'bg-[#1C1A1B] text-white dark:bg-white dark:text-[#1C1A1B] font-medium shadow-sm'
                        : 'bg-[#F1EDE7] dark:bg-[#282426] text-[#1C1A1B] dark:text-[#DDD7CF] hover:bg-[#E8E2D9] dark:hover:bg-[#332E31]'
                    }`}
                  >
                    Bugün
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDateModeChange('yesterday')}
                    className={`flex-1 py-2 px-2.5 rounded-xl font-serif text-xs transition-colors cursor-pointer ${
                      dateMode === 'yesterday'
                        ? 'bg-[#1C1A1B] text-white dark:bg-white dark:text-[#1C1A1B] font-medium shadow-sm'
                        : 'bg-[#F1EDE7] dark:bg-[#282426] text-[#1C1A1B] dark:text-[#DDD7CF] hover:bg-[#E8E2D9] dark:hover:bg-[#332E31]'
                    }`}
                  >
                    Dün
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDateModeChange('custom')}
                    className={`flex-1 py-2 px-2.5 rounded-xl font-serif text-xs transition-colors cursor-pointer ${
                      dateMode === 'custom'
                        ? 'bg-[#1C1A1B] text-white dark:bg-white dark:text-[#1C1A1B] font-medium shadow-sm'
                        : 'bg-[#F1EDE7] dark:bg-[#282426] text-[#1C1A1B] dark:text-[#DDD7CF] hover:bg-[#E8E2D9] dark:hover:bg-[#332E31]'
                    }`}
                  >
                    Tarih seç
                  </button>
                </div>
                {dateMode === 'custom' && (
                  <input
                    type="date"
                    value={performanceDate}
                    onChange={e => setPerformanceDate(e.target.value)}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-[#F1EDE7] dark:bg-[#282426] border-0 text-sm font-serif text-[#1C1A1B] dark:text-white focus:ring-2 focus:ring-[#BA1B23]"
                  />
                )}
              </div>
            </div>
          )}

          {/* STEP 2: PERDE II - ALKIŞ ÖLÇEĞİ & AYRINTILI PERFORMANS PUANLARI */}
          {step === 2 && (
            <div className="space-y-4 py-2 my-auto flex flex-col items-center">
              {/* 5 Vertical Height-staggered Ovation Bars (Supports Half-Stars) */}
              <div className="w-full">
                <div className="flex items-end justify-center gap-2 sm:gap-3.5 h-32 sm:h-36 w-full max-w-sm mx-auto px-2">
                  {BAR_LEVELS.map(({ level, heightClass }) => {
                    const isFull = rating >= level;
                    const isHalf = !isFull && rating >= level - 0.5;

                    return (
                      <div
                        key={level}
                        className={`relative flex-1 rounded-t-xl transition-all duration-200 flex flex-col justify-end items-center pb-2 select-none overflow-hidden ${heightClass} ${
                          isFull
                            ? 'bg-[#BA1B23] text-white shadow-md'
                            : isHalf
                            ? 'bg-[linear-gradient(to_right,#BA1B23_50%,#EADBCA_50%)] dark:bg-[linear-gradient(to_right,#BA1B23_50%,#353033_50%)] text-white shadow-sm'
                            : 'bg-[#EADBCA] dark:bg-[#353033] text-[#6E6862] dark:text-[#8E8780]'
                        }`}
                      >
                        {/* Left half clickable zone (sets level - 0.5) */}
                        <button
                          type="button"
                          onClick={() => setRating(level - 0.5)}
                          title={`${level - 0.5} Puan`}
                          className="absolute left-0 top-0 w-1/2 h-full z-10 cursor-pointer focus:outline-none"
                          aria-label={`${level - 0.5} Puan`}
                        />

                        {/* Right half clickable zone (sets level) */}
                        <button
                          type="button"
                          onClick={() => setRating(level)}
                          title={`${level} Puan`}
                          className="absolute right-0 top-0 w-1/2 h-full z-10 cursor-pointer focus:outline-none"
                          aria-label={`${level} Puan`}
                        />

                        {/* Bar number indicator at the bottom */}
                        <span className="font-serif font-bold text-xs sm:text-sm pointer-events-none z-0">
                          {level}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Theatrical Rating Name & Poetic Subtitle & Quick Half-Step Adjuster */}
                <div className="text-center space-y-1 mt-2.5">
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-serif font-extrabold text-2xl sm:text-3xl text-[#1C1A1B] dark:text-white leading-none">
                      {rating.toFixed(1)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setRating(prev => (prev % 1 === 0 ? Math.max(0.5, prev - 0.5) : Math.min(5, Math.floor(prev) + 1)))}
                      className="px-2 py-0.5 rounded-full text-xs font-serif border border-[#D8D2CA] dark:border-[#443E42] bg-white dark:bg-[#2C2729] text-[#BA1B23] font-bold hover:bg-[#F1EDE7] cursor-pointer transition-colors shadow-2xs"
                      title="Yarım puan ekle / çıkar"
                    >
                      {rating % 1 === 0 ? '½ Puan Düşür' : 'Tam Puana Yuvarla'}
                    </button>
                  </div>
                  <div className="font-serif font-bold text-base sm:text-lg text-[#BA1B23]">
                    {currentOvation.title}
                  </div>
                  <div className="font-serif italic text-xs text-[#6E6862] dark:text-[#A8A29E]">
                    "{currentOvation.quote}"
                  </div>
                </div>
              </div>

              {/* Optional Sub-Ratings: Cast Performance & Production Performance */}
              <div className="w-full space-y-2 pt-2 border-t border-[#EADBCA]/60 dark:border-[#332E31]">
                {/* 1. Oyuncuların Performansı (Purple - İsteğe bağlı) */}
                <div className="bg-[#FAF7F2] dark:bg-[#232022] p-2.5 sm:p-3 rounded-2xl border border-[#EADBCA]/70 dark:border-[#383235] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <Theater className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-serif font-bold text-xs text-[#1C1A1B] dark:text-white flex items-center gap-1.5 truncate">
                        <span>Oyuncuların Performansı</span>
                        <span className="text-[10px] text-[#8E8780] font-normal italic">(İsteğe bağlı)</span>
                      </div>
                      <div className="text-[10px] text-[#6E6862] dark:text-[#9A928A] italic truncate">
                        Kadro, sahne enerjisi & oyunculuk
                      </div>
                    </div>
                  </div>

                  {/* 5-step Purple score buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    {[1, 2, 3, 4, 5].map(score => {
                      const isActive = performanceRating === score;
                      return (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setPerformanceRating(performanceRating === score ? 0 : score)}
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer flex items-center justify-center ${
                            isActive
                              ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-400/40'
                              : 'bg-[#F1EDE7] dark:bg-[#2C2729] text-[#6E6862] dark:text-[#9A928A] hover:bg-purple-50 dark:hover:bg-purple-950/40'
                          }`}
                        >
                          {score}
                        </button>
                      );
                    })}
                    {performanceRating > 0 && (
                      <button
                        type="button"
                        onClick={() => setPerformanceRating(0)}
                        className="text-[10px] font-serif text-[#8E8780] hover:text-[#BA1B23] px-1 underline cursor-pointer"
                        title="Puanı kaldır"
                      >
                        Sıfırla
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Prodüksiyon & Sahneleme (Blue - İsteğe bağlı) */}
                <div className="bg-[#FAF7F2] dark:bg-[#232022] p-2.5 sm:p-3 rounded-2xl border border-[#EADBCA]/70 dark:border-[#383235] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-serif font-bold text-xs text-[#1C1A1B] dark:text-white flex items-center gap-1.5 truncate">
                        <span>Prodüksiyon & Reji</span>
                        <span className="text-[10px] text-[#8E8780] font-normal italic">(İsteğe bağlı)</span>
                      </div>
                      <div className="text-[10px] text-[#6E6862] dark:text-[#9A928A] italic truncate">
                        Reji, dekor, ışık & sahne tasarımı
                      </div>
                    </div>
                  </div>

                  {/* 5-step Blue score buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    {[1, 2, 3, 4, 5].map(score => {
                      const isActive = technicalRating === score;
                      return (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setTechnicalRating(technicalRating === score ? 0 : score)}
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer flex items-center justify-center ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40'
                              : 'bg-[#F1EDE7] dark:bg-[#2C2729] text-[#6E6862] dark:text-[#9A928A] hover:bg-blue-50 dark:hover:bg-blue-950/40'
                          }`}
                        >
                          {score}
                        </button>
                      );
                    })}
                    {technicalRating > 0 && (
                      <button
                        type="button"
                        onClick={() => setTechnicalRating(0)}
                        className="text-[10px] font-serif text-[#8E8780] hover:text-[#BA1B23] px-1 underline cursor-pointer"
                        title="Puanı kaldır"
                      >
                        Sıfırla
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PERDE III - İZLENİMİN */}
          {step === 3 && (
            <div className="space-y-3 py-2 my-auto">
              {/* Highlight tags */}
              <div className="space-y-1.5">
                <label className="text-xs font-serif text-[#6E6862] dark:text-[#A8A29E] italic block">
                  Sence en çok ne öne çıktı?
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {HIGHLIGHT_TAGS.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1 rounded-full text-xs font-serif transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#1C1A1B] text-white dark:bg-white dark:text-[#1C1A1B] font-medium'
                            : 'bg-[#F1EDE7] dark:bg-[#282426] text-[#1C1A1B] dark:text-[#DDD7CF] hover:bg-[#E8E2D9] dark:hover:bg-[#332E31]'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Review Textarea */}
              <div className="space-y-1">
                <label className="text-xs font-serif text-[#6E6862] dark:text-[#A8A29E] italic block">
                  İzlenimin
                </label>
                <div className="bg-[#F1EDE7] dark:bg-[#242022] rounded-2xl p-3 border border-[#EADBCA]/50 dark:border-[#383235]">
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value.slice(0, 1000))}
                    rows={3}
                    placeholder="Sahne deneyimin, oyunculuk, reji, izlenimlerin…"
                    className="w-full bg-transparent border-0 font-serif italic text-sm text-[#1C1A1B] dark:text-white placeholder:text-[#9A928A] focus:outline-none resize-none"
                  />
                  <div className="text-[10px] font-mono text-[#8E8780] text-right">
                    {reviewText.length} / 1000
                  </div>
                </div>
              </div>

              {/* Spoiler Switch */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="font-serif text-sm text-[#1C1A1B] dark:text-white">
                    Spoiler içeriyor
                  </span>
                  <span className="italic text-xs text-[#8E8780] ml-1.5">
                    Bölüm bulanık görünür
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={hasSpoilers}
                  onClick={() => setHasSpoilers(!hasSpoilers)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                    hasSpoilers ? 'bg-[#BA1B23]' : 'bg-[#D8D2CA] dark:bg-[#3E383B]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      hasSpoilers ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS / BILET KESILDI */}
          {step === 4 && (
            <div className="space-y-5 py-4 my-auto text-left">
              <div>
                <span className="text-[11px] font-bold text-[#BA1B23] tracking-widest uppercase block">
                  SONSUZ SAHNE GÜNLÜĞÜ EKLENDİ
                </span>
                <h3 className="font-serif font-extrabold text-2xl sm:text-4xl text-[#1C1A1B] dark:text-white mt-1 mb-2">
                  Biletin <span className="italic font-normal">kesildi.</span>
                </h3>
                <p className="font-serif text-xs sm:text-sm text-[#6E6862] dark:text-[#A8A29E] leading-relaxed max-w-md">
                  Koçanı sende kaldı. Tiyatro İndeksi: 1 / 10.04; Sahne Tozu Yazarı rütbesine 1/5.
                </p>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleShareTicket}
                  className="bg-[#F1EDE7] hover:bg-[#E8E2D9] dark:bg-[#282426] dark:hover:bg-[#332E31] text-[#1C1A1B] dark:text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-serif font-medium text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Share2 className="w-4 h-4 text-[#BA1B23]" />
                  {copiedShare ? 'Bağlantı Kopyalandı!' : 'Bileti Paylaş'}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="bg-[#BA1B23] hover:bg-[#9E171E] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-serif font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  Tamam
                </button>
              </div>
            </div>
          )}

          {/* Bottom Action Footer for Steps 1-3 */}
          {step <= 3 && (
            <div className="pt-3 sm:pt-4 border-t border-[#EADBCA]/60 dark:border-[#332E31] flex items-center justify-between gap-3 mt-auto">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((step - 1) as Step)}
                  className="bg-[#F1EDE7] hover:bg-[#E8E2D9] dark:bg-[#282426] dark:hover:bg-[#332E31] text-[#1C1A1B] dark:text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-serif text-xs sm:text-sm font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Geri
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  disabled={!selectedPlay}
                  onClick={() => {
                    if (selectedPlay) setStep((step + 1) as Step);
                  }}
                  className="bg-[#1C1A1B] hover:bg-black text-white dark:bg-white dark:hover:bg-gray-100 dark:text-[#1C1A1B] disabled:bg-[#A8A29E] px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-serif text-xs sm:text-sm font-medium flex-1 ml-3 cursor-pointer transition-colors text-center"
                >
                  Devam
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting || !selectedPlay}
                  onClick={handleBiletiKes}
                  className="bg-[#BA1B23] hover:bg-[#9E171E] disabled:bg-[#A8A29E] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-serif font-bold text-sm sm:text-base flex-1 ml-3 flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Scissors className="w-4 h-4" />
                  {submitting ? 'Kesiliyor...' : isEditing ? 'Bileti Güncelle ✂' : 'Bileti Kes ✂'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogModal;

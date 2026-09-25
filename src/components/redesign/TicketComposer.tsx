import React, { useState } from 'react';

interface TicketComposerProps {
  playTitle: string;
  defaultVenue?: string;
  onCancel: () => void;
  onSubmit: (data: {
    rating: number;
    reviewText: string;
    performanceDate: string;
    venue: string;
    seatInfo: string;
    hasSpoilers: boolean;
  }) => Promise<void> | void;
  isSubmitting?: boolean;
}

export const TicketComposer: React.FC<TicketComposerProps> = ({
  playTitle,
  defaultVenue = '',
  onCancel,
  onSubmit,
  isSubmitting = false,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [performanceDate, setPerformanceDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [venue, setVenue] = useState<string>(defaultVenue);
  const [seatInfo, setSeatInfo] = useState<'Kusursuz' | 'İyi' | 'Kısıtlı'>('Kusursuz');
  const [reviewText, setReviewText] = useState<string>('');
  const [hasSpoilers, setHasSpoilers] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    await onSubmit({
      rating,
      reviewText: reviewText.trim(),
      performanceDate,
      venue: venue.trim(),
      seatInfo,
      hasSpoilers,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-tn-ticket border-2 border-tn-lilac-strong p-5 box-border flex flex-col gap-3 font-serif text-tn-text shadow-sm h-full"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold tracking-wider text-tn-muted truncate max-w-[70%]">
          YENİ BİLET · {playTitle.toUpperCase()}
        </span>
        <button
          type="button"
          data-action="stopCompose"
          onClick={onCancel}
          className="h-8 px-3 rounded-full border border-tn-line bg-tn-surface text-tn-text font-serif text-sm cursor-pointer hover:bg-tn-line transition-colors"
        >
          Vazgeç
        </button>
      </div>

      {/* Date & Venue */}
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-xs sm:text-sm italic text-tn-muted">
          Temsil tarihi
          <input
            type="date"
            value={performanceDate}
            onChange={(e) => setPerformanceDate(e.target.value)}
            className="h-10 border border-tn-line rounded-xl bg-tn-surface font-serif text-sm text-tn-text px-3 focus:outline-none focus:ring-1 focus:ring-tn-red"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs sm:text-sm italic text-tn-muted">
          Sahne
          <input
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="Sahne adı"
            className="h-10 border border-tn-line rounded-xl bg-tn-surface font-serif text-sm text-tn-text px-3 focus:outline-none focus:ring-1 focus:ring-tn-red"
          />
        </label>
      </div>

      {/* Star Rating Picker */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            data-action="s.pick"
            aria-label={`${star} yıldız`}
            onClick={() => setRating(star)}
            className={`w-10 h-10 border-none bg-transparent p-0 text-3xl leading-none cursor-pointer transition-transform hover:scale-110 ${
              star <= rating ? 'text-tn-red' : 'text-tn-line-strong'
            }`}
          >
            ★
          </button>
        ))}
        <span className="font-extrabold text-2xl ml-2 text-tn-text">{rating}.0</span>
      </div>

      {/* Koltuk Görüşü Segmented Control */}
      <div
        role="radiogroup"
        aria-label="Koltuk görüşü"
        className="flex gap-1 p-1 rounded-xl bg-tn-surface border border-tn-line/50 text-sm"
      >
        {(['Kusursuz', 'İyi', 'Kısıtlı'] as const).map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={seatInfo === option}
            onClick={() => setSeatInfo(option)}
            className={`flex-grow h-9 border-none rounded-lg font-serif text-sm cursor-pointer transition-all ${
              seatInfo === option
                ? 'bg-white dark:bg-tn-card shadow-xs font-bold text-tn-text'
                : 'bg-transparent text-tn-muted hover:text-tn-text'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Review Textarea */}
      <label htmlFor="ticket-review-text" className="sr-only">
        İzlenimlerin
      </label>
      <textarea
        id="ticket-review-text"
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        placeholder="Sahne deneyimin, koltuk görüşün, izlenimlerin…"
        required
        className="flex-grow min-h-[90px] border border-tn-line rounded-xl bg-tn-surface font-serif italic text-base p-3 resize-none text-tn-text focus:outline-none focus:ring-1 focus:ring-tn-red placeholder:text-tn-muted"
      />

      {/* Footer: Spoiler switch + submit */}
      <div className="flex justify-between items-center pt-1">
        <button
          type="button"
          role="switch"
          aria-checked={hasSpoilers}
          onClick={() => setHasSpoilers(!hasSpoilers)}
          className="flex items-center gap-2 h-10 border-none bg-transparent p-0 font-serif text-sm text-tn-text cursor-pointer"
        >
          <span
            className={`w-10 h-6 rounded-full p-0.5 flex items-center transition-colors ${
              hasSpoilers ? 'bg-tn-red justify-end' : 'bg-tn-line-strong justify-start'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
          </span>
          <span className="italic text-xs sm:text-sm">Spoiler içeriyor</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting || !reviewText.trim()}
          className="h-10 px-5 rounded-xl bg-tn-red text-white border-none font-serif text-base font-semibold cursor-pointer hover:bg-tn-red/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
        >
          {isSubmitting ? 'Kaydediliyor…' : 'Bileti Kaydet'}
        </button>
      </div>
    </form>
  );
};

export default TicketComposer;

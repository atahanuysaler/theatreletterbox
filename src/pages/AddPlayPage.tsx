import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, X, Plus } from 'lucide-react';
import { storageService } from '../services/storage';
import { useAuthSafe } from '../context/AuthContext';

const GENRE_OPTIONS = [
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

const CREW_ROLES = [
  'Işık tasarımı',
  'Dekor tasarımı',
  'Kostüm tasarımı',
  'Müzik',
  'Dramaturg',
  'Koreografi',
  'Yönetmen yardımcısı',
  'Ses tasarımı',
  'Afiş tasarımı',
  'Yapımcı',
  'Diğer',
];

interface CrewMember {
  role: string;
  name: string;
}

export const AddPlayPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuthSafe();
  const user = auth?.user;

  // Multi-step state: 1, 2, 3 or 'submitted'
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields - Step 1: Temel Bilgiler
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [playwright, setPlaywright] = useState('');
  const [director, setDirector] = useState('');
  const [company, setCompany] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [genre, setGenre] = useState('Trajedi & Dram');
  const [duration, setDuration] = useState<number>(90);

  // Form Fields - Step 2: Kadro & Yaratıcı Ekip
  const [actors, setActors] = useState<string[]>([]);
  const [actorInput, setActorInput] = useState('');
  const [crew, setCrew] = useState<CrewMember[]>([{ role: 'Işık tasarımı', name: '' }]);

  // Form Fields - Step 3: Tanıtım & Afiş
  const [synopsis, setSynopsis] = useState('');
  const [posterUrl, setPosterUrl] = useState('');

  // Handle actor chip input
  const handleAddActor = () => {
    const trimmed = actorInput.trim();
    if (trimmed && !actors.includes(trimmed)) {
      setActors([...actors, trimmed]);
      setActorInput('');
    }
  };

  const handleActorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddActor();
    }
  };

  const handleRemoveActor = (indexToRemove: number) => {
    setActors(actors.filter((_, idx) => idx !== indexToRemove));
  };

  // Handle crew rows
  const handleAddCrewRow = () => {
    setCrew([...crew, { role: 'Işık tasarımı', name: '' }]);
  };

  const handleCrewChange = (index: number, field: 'role' | 'name', value: string) => {
    const updated = [...crew];
    updated[index][field] = value;
    setCrew(updated);
  };

  const handleRemoveCrewRow = (index: number) => {
    if (crew.length > 1) {
      setCrew(crew.filter((_, idx) => idx !== index));
    } else {
      setCrew([{ role: 'Işık tasarımı', name: '' }]);
    }
  };

  // Step 1 Validation
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !playwright.trim() || !director.trim() || !company.trim()) {
      setError('Lütfen zorunlu alanları (*) eksiksiz doldurun.');
      return;
    }
    setError(null);
    setStep(2);
  };

  // Step 2 Next
  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (actorInput.trim()) {
      handleAddActor();
    }
    setError(null);
    setStep(3);
  };

  // Final Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await storageService.submitPlay({
        title: title.trim(),
        originalTitle: originalTitle.trim() || undefined,
        playwright: playwright.trim(),
        director: director.trim(),
        company: company.trim(),
        year: Number(year) || new Date().getFullYear(),
        genre: genre.trim() || 'Trajedi & Dram',
        cast: actors,
        posterUrl: posterUrl.trim() || undefined,
        synopsis: synopsis.trim() || undefined,
        duration: Number(duration) || 90,
        submittedBy: user?.displayName || 'Anonim Tiyatrosever',
        submittedByEmail: user?.email || undefined,
      });

      setSubmitted(true);
    } catch (err) {
      console.error('[AddPlayPage] submission error:', err);
      setError('Öneri kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setOriginalTitle('');
    setPlaywright('');
    setDirector('');
    setCompany('');
    setYear(new Date().getFullYear());
    setGenre('Trajedi & Dram');
    setDuration(90);
    setActors([]);
    setActorInput('');
    setCrew([{ role: 'Işık tasarımı', name: '' }]);
    setSynopsis('');
    setPosterUrl('');
    setStep(1);
    setSubmitted(false);
    setError(null);
  };

  return (
    <div className="w-full flex flex-col gap-5 sm:gap-6 py-2 sm:py-4 font-serif text-tn-text">
      {/* 1. Header with Eyebrow, Title and Description */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-tn-line pb-4">
        <div>
          <span className="text-xs font-extrabold tracking-wider text-tn-red uppercase">
            TOPLULUK KATKISI
          </span>
          <h1 className="m-0 mt-1 font-extrabold text-3xl sm:text-5xl leading-tight tracking-tight">
            Repertuara Oyun Ekle
          </h1>
        </div>

        <p className="m-0 text-sm sm:text-base italic text-tn-muted max-w-sm self-start sm:self-end leading-relaxed">
          Tiyatronot kataloğunda eksik olduğunu düşündüğün oyunu künye detaylarıyla ekle.
        </p>
      </div>

      {/* 2. Main Card Container */}
      <div className="w-full max-w-3xl mx-auto rounded-2xl bg-tn-surface border border-tn-line p-4 sm:p-9 shadow-2xs">
        {submitted ? (
          /* Step 4 / Success State (06 Oyun Ekle - gönderildi) */
          <div className="py-8 sm:py-12 flex flex-col items-center text-center gap-3 font-serif">
            <div className="w-14 h-14 rounded-full bg-[#E6F4EA] text-[#137333] flex items-center justify-center mb-1">
              <Check className="w-7 h-7 stroke-[2.5]" />
            </div>

            <h2 className="m-0 font-extrabold text-2xl sm:text-3xl text-tn-text">
              Repertuara gönderildi.
            </h2>

            <p className="m-0 text-sm sm:text-base italic text-tn-muted max-w-md leading-relaxed">
              Gönderilen oyunlar editör onayı sonrası kataloğa ve tiyatro hafızasına dahil edilir. Onaylandığında sana haber vereceğiz.
            </p>

            <div className="flex items-center gap-3 pt-5">
              <button
                type="button"
                onClick={resetForm}
                className="h-10 px-5 rounded-full border border-tn-line bg-white dark:bg-tn-container text-tn-text hover:bg-tn-line/40 font-serif text-sm font-semibold cursor-pointer transition-colors shadow-2xs"
              >
                Bir oyun daha ekle
              </button>

              <button
                type="button"
                onClick={() => navigate('/katalog')}
                className="h-10 px-6 rounded-full border-none bg-tn-red text-white hover:bg-tn-red/90 font-serif text-sm font-semibold cursor-pointer transition-colors shadow-2xs"
              >
                Kataloğa dön
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5 sm:gap-6">
            {/* Stepper Indicator */}
            <div className="flex items-center gap-4 sm:gap-8 border-b border-tn-line/80 pb-3 text-xs sm:text-[13px] font-semibold overflow-x-auto no-scrollbar whitespace-nowrap">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`border-none bg-transparent cursor-pointer p-0 font-serif transition-colors relative pb-1 ${
                  step === 1
                    ? 'text-tn-text font-bold after:content-[""] after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[2px] after:bg-tn-red'
                    : 'text-tn-muted hover:text-tn-text'
                }`}
              >
                1. Temel oyun bilgileri
              </button>

              <button
                type="button"
                onClick={() => (title.trim() ? setStep(2) : null)}
                className={`border-none bg-transparent cursor-pointer p-0 font-serif transition-colors relative pb-1 ${
                  step === 2
                    ? 'text-tn-text font-bold after:content-[""] after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[2px] after:bg-tn-red'
                    : 'text-tn-muted hover:text-tn-text'
                }`}
              >
                2. Kadro & yaratıcı ekip
              </button>

              <button
                type="button"
                onClick={() => (title.trim() ? setStep(3) : null)}
                className={`border-none bg-transparent cursor-pointer p-0 font-serif transition-colors relative pb-1 ${
                  step === 3
                    ? 'text-tn-text font-bold after:content-[""] after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[2px] after:bg-tn-red'
                    : 'text-tn-muted hover:text-tn-text'
                }`}
              >
                3. Tanıtım & afiş
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs rounded-xl">
                {error}
              </div>
            )}

            {/* STEP 1: Temel Bilgiler (04 Oyun Ekle - canlı) */}
            {step === 1 && (
              <form onSubmit={handleStep1Next} className="flex flex-col gap-4 sm:gap-5">
                <h2 className="m-0 font-extrabold text-xl sm:text-2xl tracking-tight">
                  1. Temel oyun bilgileri
                </h2>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-tn-muted">
                    Oyun başlığı *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Örn. Lüküs Hayat, Keşanlı Ali Destanı..."
                    className="w-full h-11 px-4 rounded-xl border border-tn-line bg-white/70 dark:bg-tn-container font-serif text-sm sm:text-base text-tn-text placeholder:text-tn-muted/60 focus:outline-none focus:border-tn-red focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-tn-muted">
                    Orijinal başlık
                  </label>
                  <input
                    type="text"
                    value={originalTitle}
                    onChange={(e) => setOriginalTitle(e.target.value)}
                    placeholder="Varsa orijinal dildeki adı..."
                    className="w-full h-11 px-4 rounded-xl border border-tn-line bg-white/70 dark:bg-tn-container font-serif text-sm sm:text-base text-tn-text placeholder:text-tn-muted/60 focus:outline-none focus:border-tn-red focus:bg-white transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-tn-muted">
                      Yazar *
                    </label>
                    <input
                      type="text"
                      required
                      value={playwright}
                      onChange={(e) => setPlaywright(e.target.value)}
                      placeholder="Örn. Haldun Taner"
                      className="w-full h-11 px-4 rounded-xl border border-tn-line bg-white/70 dark:bg-tn-container font-serif text-sm sm:text-base text-tn-text placeholder:text-tn-muted/60 focus:outline-none focus:border-tn-red focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-tn-muted">
                      Yönetmen *
                    </label>
                    <input
                      type="text"
                      required
                      value={director}
                      onChange={(e) => setDirector(e.target.value)}
                      placeholder="Örn. Genco Erkal"
                      className="w-full h-11 px-4 rounded-xl border border-tn-line bg-white/70 dark:bg-tn-container font-serif text-sm sm:text-base text-tn-text placeholder:text-tn-muted/60 focus:outline-none focus:border-tn-red focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-tn-muted">
                      Topluluk / Tiyatro *
                    </label>
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Örn. Dostlar Tiyatrosu, Şehir Tiyatroları"
                      className="w-full h-11 px-4 rounded-xl border border-tn-line bg-white/70 dark:bg-tn-container font-serif text-sm sm:text-base text-tn-text placeholder:text-tn-muted/60 focus:outline-none focus:border-tn-red focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-tn-muted">
                      Prömiyer yılı *
                    </label>
                    <input
                      type="number"
                      required
                      min={1900}
                      max={2100}
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      placeholder="2026"
                      className="w-full h-11 px-4 rounded-xl border border-tn-line bg-white/70 dark:bg-tn-container font-serif text-sm sm:text-base text-tn-text placeholder:text-tn-muted/60 focus:outline-none focus:border-tn-red focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-tn-muted">
                      Oyun türü *
                    </label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-tn-line bg-white/70 dark:bg-tn-container font-serif text-sm sm:text-base text-tn-text focus:outline-none focus:border-tn-red focus:bg-white transition-colors cursor-pointer"
                    >
                      {GENRE_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-tn-muted">
                      Yaklaşık süre (dakika)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={360}
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      placeholder="90"
                      className="w-full h-11 px-4 rounded-xl border border-tn-line bg-white/70 dark:bg-tn-container font-serif text-sm sm:text-base text-tn-text placeholder:text-tn-muted/60 focus:outline-none focus:border-tn-red focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Footer with * zorunlu alan and Devam */}
                <div className="flex justify-between items-center pt-5 border-t border-tn-line/60 mt-2">
                  <span className="text-xs italic text-tn-muted">
                    * zorunlu alan
                  </span>

                  <button
                    type="submit"
                    className="h-10 px-7 rounded-xl bg-tn-red text-white hover:bg-tn-red/90 font-serif text-sm font-semibold border-none cursor-pointer transition-colors shadow-2xs"
                  >
                    Devam
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Kadro & Yaratıcı Ekip (05 Oyun Ekle - adım 2) */}
            {step === 2 && (
              <form onSubmit={handleStep2Next} className="flex flex-col gap-5">
                <h2 className="m-0 font-extrabold text-xl sm:text-2xl tracking-tight">
                  2. Kadro & yaratıcı ekip
                </h2>

                {/* Oyuncular Tag/Chip Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-tn-muted">
                    Oyuncular
                  </label>
                  <div className="min-h-[48px] p-2 rounded-xl border border-tn-line bg-white/70 dark:bg-tn-container flex flex-wrap items-center gap-1.5 focus-within:border-tn-red focus-within:bg-white transition-colors">
                    {actors.map((actor, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tn-surface border border-tn-line text-xs font-medium text-tn-text"
                      >
                        <span>{actor}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveActor(idx)}
                          className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-tn-line/80 border-none bg-transparent cursor-pointer p-0 text-tn-muted hover:text-tn-red"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={actorInput}
                      onChange={(e) => setActorInput(e.target.value)}
                      onKeyDown={handleActorKeyDown}
                      onBlur={handleAddActor}
                      placeholder={actors.length === 0 ? 'İsim yaz, Enter’a bas...' : 'Yeni isim ekle...'}
                      className="flex-1 min-w-[150px] border-none bg-transparent px-2 py-1 font-serif text-sm text-tn-text placeholder:text-tn-muted/60 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Yaratıcı Ekip Dynamic Rows */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-tn-muted block">
                    Yaratıcı ekip (rol ve kişi)
                  </label>

                  <div className="space-y-2">
                    {crew.map((member, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <select
                          value={member.role}
                          onChange={(e) => handleCrewChange(idx, 'role', e.target.value)}
                          className="w-[125px] sm:w-[210px] h-10 px-2 sm:px-3 rounded-xl border border-tn-line bg-white/70 dark:bg-tn-container font-serif text-xs sm:text-sm text-tn-text focus:outline-none focus:border-tn-red transition-colors cursor-pointer shrink-0"
                        >
                          {CREW_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>

                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => handleCrewChange(idx, 'name', e.target.value)}
                          placeholder="Kişinin adı"
                          className="flex-1 h-10 px-3.5 rounded-xl border border-tn-line bg-white/70 dark:bg-tn-container font-serif text-sm text-tn-text placeholder:text-tn-muted/60 focus:outline-none focus:border-tn-red focus:bg-white transition-colors"
                        />

                        {crew.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCrewRow(idx)}
                            className="p-2 text-tn-muted hover:text-tn-red border-none bg-transparent cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCrewRow}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-tn-red hover:underline border-none bg-transparent p-0 cursor-pointer pt-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Rol ekle</span>
                  </button>
                </div>

                {/* Footer with Geri and Devam */}
                <div className="flex justify-between items-center pt-5 border-t border-tn-line/60 mt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="h-10 px-5 rounded-xl border border-tn-line bg-white dark:bg-tn-container text-tn-text font-serif text-sm font-semibold cursor-pointer hover:bg-tn-line/40 transition-colors"
                  >
                    Geri
                  </button>

                  <div className="flex items-center gap-4">
                    <span className="text-xs italic text-tn-muted">
                      * zorunlu alan
                    </span>

                    <button
                      type="submit"
                      className="h-10 px-7 rounded-xl bg-tn-red text-white hover:bg-tn-red/90 font-serif text-sm font-semibold border-none cursor-pointer transition-colors shadow-2xs"
                    >
                      Devam
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* STEP 3: Tanıtım & Afiş */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <h2 className="m-0 font-extrabold text-xl sm:text-2xl tracking-tight">
                  3. Tanıtım & afiş
                </h2>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-tn-muted">
                    Oyun özeti <span className="italic text-tn-muted/70">(isteğe bağlı)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={synopsis}
                    onChange={(e) => setSynopsis(e.target.value)}
                    placeholder="Oyunun konusu, teması ve seyircinin bilmesi gerekenler..."
                    className="w-full p-4 rounded-xl border border-tn-line bg-white/70 dark:bg-tn-container font-serif text-sm sm:text-base text-tn-text placeholder:text-tn-muted/60 focus:outline-none focus:border-tn-red focus:bg-white transition-colors resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-tn-muted">
                    Afiş görseli URL <span className="italic text-tn-muted/70">(isteğe bağlı)</span>
                  </label>
                  <input
                    type="text"
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    placeholder="https://... afiş görsel bağlantısı"
                    className="w-full h-11 px-4 rounded-xl border border-tn-line bg-white/70 dark:bg-tn-container font-serif text-sm sm:text-base text-tn-text placeholder:text-tn-muted/60 focus:outline-none focus:border-tn-red focus:bg-white transition-colors"
                  />
                  {posterUrl && (
                    <div className="mt-2 flex items-center gap-3 p-3 bg-tn-surface border border-tn-line rounded-xl">
                      <img
                        src={posterUrl}
                        alt="Afiş önizleme"
                        className="w-14 h-20 object-cover rounded-lg border border-tn-line"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="text-xs italic text-tn-muted">Afiş önizlemesi</span>
                    </div>
                  )}
                </div>

                {/* Footer with Geri and Oyunu Gönder */}
                <div className="flex justify-between items-center pt-5 border-t border-tn-line/60 mt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="h-10 px-5 rounded-xl border border-tn-line bg-white dark:bg-tn-container text-tn-text font-serif text-sm font-semibold cursor-pointer hover:bg-tn-line/40 transition-colors"
                  >
                    Geri
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-10 px-7 rounded-xl bg-tn-red text-white hover:bg-tn-red/90 disabled:opacity-50 font-serif text-sm font-semibold border-none cursor-pointer transition-colors shadow-2xs"
                  >
                    {submitting ? 'Gönderiliyor...' : 'Oyunu Gönder'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddPlayPage;

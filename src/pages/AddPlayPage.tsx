import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Theater, Sparkles, Send, Image as ImageIcon } from 'lucide-react';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';

const GENRE_OPTIONS = [
  'Dram',
  'Komedi',
  'Müzikal',
  'Trajedi',
  'Absürt',
  'Tarihi',
  'Klasik',
  'Hiciv / Parodi',
  'Monodram / Tek Kişilik',
  'Çağdaş'
];

export const AddPlayPage: React.FC = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [playwright, setPlaywright] = useState('');
  const [director, setDirector] = useState('');
  const [company, setCompany] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [genre, setGenre] = useState('Dram');
  const [castRaw, setCastRaw] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [duration, setDuration] = useState<number>(90);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !playwright.trim() || !director.trim() || !company.trim()) {
      setError('Lütfen oyun başlığı, yazar, yönetmen ve topluluk bilgilerini eksiksiz doldurun.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const castArray = castRaw
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      await storageService.submitPlay({
        title: title.trim(),
        originalTitle: originalTitle.trim() || undefined,
        playwright: playwright.trim(),
        director: director.trim(),
        company: company.trim(),
        year: Number(year) || new Date().getFullYear(),
        genre: genre.trim() || 'Dram',
        cast: castArray,
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
    setGenre('Dram');
    setCastRaw('');
    setPosterUrl('');
    setSynopsis('');
    setDuration(90);
    setSubmitted(false);
    setError(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Navigation link */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-text-tertiary hover:text-theatre-curtain transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kataloğa Dön</span>
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-border-subtle pb-6 mb-8">
        <div className="font-mono text-xs text-theatre-curtain uppercase tracking-widest font-semibold mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-theatre-curtain" />
          <span>Topluluk Katkısı</span>
        </div>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
          Repertuara Oyun Ekle
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-text-secondary font-serif leading-relaxed max-w-xl">
          Tiyatronot kataloğunda eksik olduğunu düşündüğünüz oyunu künye detaylarıyla ekleyin.
          Gönderilen oyunlar editör onayı sonrası kataloğa ve tiyatro hafızasına dahil edilir.
        </p>
      </div>

      {submitted ? (
        <div className="p-8 sm:p-12 bg-layer-01 border border-border-subtle rounded-sm text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
          <h2 className="font-serif font-bold text-xl text-text-primary">
            Oyun Başarıyla Gönderildi!
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary font-mono max-w-md mx-auto leading-relaxed">
            "{title}" öneriniz moderasyon kuyruğuna iletildi. Yönetici onayından sonra doğrudan katalogda yer alacaktır.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-xs font-semibold bg-theatre-curtain text-white hover:bg-theatre-curtain-hover transition-colors rounded-sm cursor-pointer"
            >
              Başka Bir Oyun Ekle
            </button>
            <Link
              to="/"
              className="px-4 py-2 text-xs font-semibold bg-canvas border border-border-strong text-text-primary hover:bg-layer-02 transition-colors rounded-sm"
            >
              Kataloğa Dön
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 bg-layer-01 border border-border-subtle p-5 sm:p-8 rounded-sm">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-mono rounded-sm">
              {error}
            </div>
          )}

          {/* Section 1: Temel Bilgiler */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase text-theatre-curtain tracking-wider border-b border-border-subtle pb-2">
              1. Temel Oyun Bilgileri
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                  Oyun Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Örn. Lüküs Hayat, Keşanlı Ali Destanı..."
                  className="w-full border border-border-strong bg-canvas px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theatre-curtain transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                  Yazar *
                </label>
                <input
                  type="text"
                  required
                  value={playwright}
                  onChange={e => setPlaywright(e.target.value)}
                  placeholder="Örn. Haldun Taner"
                  className="w-full border border-border-strong bg-canvas px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theatre-curtain transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                  Yönetmen *
                </label>
                <input
                  type="text"
                  required
                  value={director}
                  onChange={e => setDirector(e.target.value)}
                  placeholder="Örn. Genco Erkal"
                  className="w-full border border-border-strong bg-canvas px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theatre-curtain transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                  Topluluk / Tiyatro *
                </label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="Örn. Dostlar Tiyatrosu, Şehir Tiyatroları..."
                  className="w-full border border-border-strong bg-canvas px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theatre-curtain transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                  Prömiyer Yılı *
                </label>
                <input
                  type="number"
                  required
                  min={1900}
                  max={2100}
                  value={year}
                  onChange={e => setYear(Number(e.target.value))}
                  className="w-full border border-border-strong bg-canvas px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-theatre-curtain transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                  Oyun Türü *
                </label>
                <select
                  value={genre}
                  onChange={e => setGenre(e.target.value)}
                  className="w-full border border-border-strong bg-canvas px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-theatre-curtain transition-colors cursor-pointer"
                >
                  {GENRE_OPTIONS.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                  Yaklaşık Süre (Dakika)
                </label>
                <input
                  type="number"
                  min={10}
                  max={360}
                  value={duration}
                  onChange={e => setDuration(Number(e.target.value))}
                  className="w-full border border-border-strong bg-canvas px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-theatre-curtain transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Kadro ve Detaylar */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-mono font-bold uppercase text-theatre-curtain tracking-wider border-b border-border-subtle pb-2">
              2. Kadro & İçerik Bilgileri
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                  Oyuncu Kadrosu <span className="text-text-tertiary font-normal lowercase">(virgülle ayırarak yazın)</span>
                </label>
                <input
                  type="text"
                  value={castRaw}
                  onChange={e => setCastRaw(e.target.value)}
                  placeholder="Örn. Şener Şen, Zerrin Tekindor, Haluk Bilginer"
                  className="w-full border border-border-strong bg-canvas px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theatre-curtain transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-text-secondary uppercase flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-theatre-curtain" />
                  <span>Afiş Görseli URL <span className="text-text-tertiary font-normal lowercase">(isteğe bağlı)</span></span>
                </label>
                <input
                  type="url"
                  value={posterUrl}
                  onChange={e => setPosterUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-border-strong bg-canvas px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theatre-curtain transition-colors"
                />
                {posterUrl && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-canvas border border-border-subtle rounded-sm">
                    <img
                      src={posterUrl}
                      alt="Afiş önizleme"
                      className="w-12 h-16 object-cover rounded-sm border border-border-subtle"
                      onError={e => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="text-xs text-text-tertiary font-mono">Afiş önizlemesi</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                  Oyun Özeti <span className="text-text-tertiary font-normal lowercase">(isteğe bağlı)</span>
                </label>
                <textarea
                  rows={4}
                  value={synopsis}
                  onChange={e => setSynopsis(e.target.value)}
                  placeholder="Oyunun konusu ve teması hakkında kısa bilgi..."
                  className="w-full border border-border-strong bg-canvas px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theatre-curtain transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-theatre-curtain text-white py-3 text-xs sm:text-sm font-semibold hover:bg-theatre-curtain-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer rounded-sm"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Gönderiliyor...' : 'Oyunu Onaya Gönder'}</span>
          </button>
        </form>
      )}
    </div>
  );
};

export default AddPlayPage;

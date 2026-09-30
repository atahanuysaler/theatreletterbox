import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { storageService } from '../services/storage';

const TOPIC_OPTIONS = ['Öneri', 'Oyun / sahne ekleme', 'İş birliği', 'Diğer'];

export const ContactPage: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState('Öneri');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('tiyatronotiletisim@gmail.com');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard denied
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) {
      setError('Lütfen zorunlu alanları (*) doldurun.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await storageService.saveContactMessage({
        name: name.trim() || 'İsimsiz Tiyatrosever',
        email: email.trim(),
        message: `[Konu: ${selectedTopic}]\n\n${message.trim()}`,
      });
      setSubmitted(true);
    } catch (err) {
      console.error('[ContactPage] Error submitting message:', err);
      setError('Mesaj kaydedilirken bir hata oluştu. Lütfen tekrar deneyin veya doğrudan e-posta adresimiz üzerinden yazın.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 sm:gap-6 py-2 sm:py-4 font-serif text-tn-text">
      {/* 1. Header with Eyebrow, Title and Description */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-tn-line pb-4">
        <div>
          <span className="text-xs font-extrabold tracking-wider text-tn-red uppercase">
            İLETİŞİM & GERİ BİLDİRİM
          </span>
          <h1 className="m-0 mt-1 font-extrabold text-3xl sm:text-5xl leading-tight tracking-tight">
            Bizimle <span className="italic font-extrabold">İletişime Geçin</span>
          </h1>
        </div>

        <p className="m-0 text-sm sm:text-base italic text-tn-muted max-w-sm self-start sm:self-end leading-relaxed">
          Tiyatronot ile ilgili önerileriniz, sahne veya oyun ekleme taleplerin ya da iş birliği mesajların için bize ulaşabilirsin.
        </p>
      </div>

      {/* 2. Content 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-start pt-2">
        {/* Left Column: E-posta & Konum cards */}
        <div className="md:col-span-4 flex flex-col gap-3">
          {/* Card 1: E-POSTA */}
          <div className="rounded-2xl bg-tn-ticket border border-tn-line p-5 sm:p-6 flex flex-col gap-2.5 shadow-2xs">
            <span className="text-xs font-extrabold tracking-wider text-tn-muted uppercase">
              E-POSTA
            </span>
            <p className="m-0 text-xs sm:text-[13px] italic text-tn-muted leading-relaxed">
              Doğrudan e-posta yoluyla bize yazabilirsin.
            </p>

            <div className="mt-2 p-2.5 px-3 rounded-xl bg-white dark:bg-tn-container border border-tn-line flex items-center justify-between gap-2 shadow-2xs">
              <span className="font-semibold text-xs sm:text-[13px] text-tn-text truncate" title="tiyatronotiletisim@gmail.com">
                tiyatronotiletisim@gmail.com
              </span>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="h-7 px-3 rounded-full border border-tn-line bg-tn-surface text-tn-text hover:bg-tn-line font-serif text-xs font-semibold cursor-pointer transition-colors shrink-0 flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-tn-muted" />}
                <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
              </button>
            </div>
          </div>

          {/* Card 2: KONUM */}
          <div className="rounded-2xl bg-[#E5ECE4] border border-tn-line/40 p-5 sm:p-6 flex flex-col gap-1 shadow-2xs text-[#1C1A1B]">
            <span className="text-xs font-extrabold tracking-wider uppercase opacity-75">
              KONUM
            </span>
            <h3 className="m-0 font-extrabold text-xl sm:text-2xl tracking-tight text-[#1C1A1B]">
              İstanbul, Türkiye
            </h3>
            <span className="text-xs sm:text-[13px] italic text-[#1C1A1B]/70 pt-0.5">
              Dijital Tiyatro Günlüğü
            </span>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="md:col-span-8">
          <div className="rounded-2xl bg-tn-surface border border-tn-line p-6 sm:p-7 shadow-2xs">
            {submitted ? (
              <div className="py-10 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#E6F4EA] text-[#137333] flex items-center justify-center">
                  <Check className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h3 className="m-0 font-extrabold text-2xl text-tn-text">
                  Mesajınız Alındı!
                </h3>
                <p className="m-0 italic text-sm sm:text-base text-tn-muted max-w-md leading-relaxed">
                  Geri bildiriminiz başarıyla iletildi. En kısa sürede <strong className="text-tn-text not-italic font-semibold">{email}</strong> adresinize dönüş yapacağız.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setMessage('');
                  }}
                  className="mt-3 h-10 px-6 rounded-full border border-tn-line bg-white dark:bg-tn-container text-tn-text hover:bg-tn-line/40 font-serif text-sm font-semibold cursor-pointer transition-colors shadow-2xs"
                >
                  Yeni mesaj gönder
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Topic Switcher Pills */}
                <div className="flex flex-wrap gap-2 items-center">
                  {TOPIC_OPTIONS.map((topic) => {
                    const isSelected = selectedTopic === topic;
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => setSelectedTopic(topic)}
                        className={`h-8 px-4 rounded-full font-serif text-xs font-semibold cursor-pointer transition-colors border ${
                          isSelected
                            ? 'bg-tn-ink text-white border-tn-ink'
                            : 'bg-white dark:bg-tn-container text-tn-text border-tn-line hover:bg-tn-line/40'
                        }`}
                      >
                        {topic}
                      </button>
                    );
                  })}
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs rounded-xl">
                    {error}
                  </div>
                )}

                {/* 2 Columns: Adın ve E-posta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-tn-muted">
                      Adın
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Adın ve soyadın"
                      className="w-full h-11 px-4 rounded-xl border border-tn-line bg-white/70 dark:bg-tn-container font-serif text-sm sm:text-base text-tn-text placeholder:text-tn-muted/60 focus:outline-none focus:border-tn-red focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-tn-muted">
                      E-posta adresin *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@eposta.com"
                      className="w-full h-11 px-4 rounded-xl border border-tn-line bg-white/70 dark:bg-tn-container font-serif text-sm sm:text-base text-tn-text placeholder:text-tn-muted/60 focus:outline-none focus:border-tn-red focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Mesajın textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-tn-muted">
                    Mesajın *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Mesajını veya geri bildirimini buraya yaz..."
                    className="w-full p-4 rounded-xl border border-tn-line bg-white/70 dark:bg-tn-container font-serif text-sm sm:text-base text-tn-text placeholder:text-tn-muted/60 focus:outline-none focus:border-tn-red focus:bg-white transition-colors resize-none leading-relaxed"
                  />
                </div>

                {/* Submit button: Red solid full-width pill */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 rounded-xl bg-tn-red text-white hover:bg-tn-red/90 disabled:opacity-50 font-serif font-semibold text-sm sm:text-base border-none cursor-pointer transition-colors shadow-2xs mt-1"
                >
                  {submitting ? 'Gönderiliyor...' : 'Mesajı Gönder'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

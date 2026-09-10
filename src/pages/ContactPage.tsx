import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send, CheckCircle2, ArrowLeft, MapPin, Copy, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { storageService } from '../services/storage';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('tiyatronotiletisim@gmail.com');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await storageService.saveContactMessage({
        name: name.trim() || 'İsimsiz Tiyatrosever',
        email: email.trim(),
        message: message.trim(),
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Breadcrumb / Back link */}
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
        <div className="font-mono text-xs text-theatre-curtain uppercase tracking-widest font-semibold mb-1">
          İletişim & Geri Bildirim
        </div>
        <h1 className="font-serif font-bold text-3xl text-text-primary tracking-tight">
          Bizimle İletişime Geçin
        </h1>
        <p className="mt-2 text-sm text-text-secondary max-w-xl font-serif leading-relaxed">
          Tiyatronot ile ilgili önerileriniz, sahne veya oyun ekleme talepleriniz ya da iş birliği mesajlarınız için bize ulaşabilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Information & Channels */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-4 sm:p-5 bg-layer-01 border border-border-subtle rounded-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-text-primary">
              <Mail className="w-4 h-4 text-theatre-curtain shrink-0" />
              <span>E-Posta</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Doğrudan e-posta yoluyla bize yazabilirsiniz:
            </p>
            <div className="flex items-center justify-between gap-2 p-2.5 bg-canvas border border-border-subtle rounded-sm">
              <a
                href="mailto:tiyatronotiletisim@gmail.com"
                className="text-[11.5px] sm:text-xs font-mono font-semibold text-theatre-curtain hover:underline whitespace-nowrap overflow-hidden text-ellipsis min-w-0"
                title="tiyatronotiletisim@gmail.com"
              >
                tiyatronotiletisim@gmail.com
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-1 text-text-tertiary hover:text-text-primary hover:bg-layer-01 rounded-xs transition-colors cursor-pointer shrink-0"
                title={copied ? 'Kopyalandı!' : 'Adresi Kopyala'}
                aria-label="E-posta adresini kopyala"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="p-4 bg-layer-01 border border-border-subtle rounded-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-text-primary">
              <MapPin className="w-4 h-4 text-theatre-curtain" />
              <span>Konum</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              İstanbul, Türkiye
            </p>
            <p className="text-[11px] text-text-tertiary font-mono">
              Dijital Tiyatro Günlüğü
            </p>
          </div>
        </div>

        {/* Contact Form / Placeholder */}
        <div className="lg:col-span-7">
          {submitted ? (
            <div className="p-8 bg-layer-01 border border-border-subtle rounded-sm text-center space-y-4 animate-fade-in">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-xl text-text-primary">Mesajınız Alındı!</h3>
                <p className="text-xs text-text-secondary font-mono max-w-md mx-auto leading-relaxed">
                  Geri bildiriminiz başarıyla kaydedildi. En kısa sürede <strong className="text-text-primary">{email}</strong> adresinize dönüş yapacağız.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setName('');
                    setEmail('');
                    setMessage('');
                    setError(null);
                  }}
                  className="px-4 py-2 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer"
                >
                  Yeni bir mesaj gönder
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-layer-01 border border-border-subtle rounded-sm">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs font-mono flex items-center gap-2 rounded-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                  Adınız
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adınız ve soyadınız"
                  disabled={submitting}
                  className="w-full border border-border-strong bg-canvas px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theatre-curtain transition-colors disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                  E-Posta Adresiniz *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@posta.com"
                  disabled={submitting}
                  className="w-full border border-border-strong bg-canvas px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theatre-curtain transition-colors disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                  Mesajınız *
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mesajınızı veya geri bildiriminizi buraya yazın..."
                  disabled={submitting}
                  className="w-full border border-border-strong bg-canvas px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theatre-curtain transition-colors resize-none disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 w-full bg-theatre-curtain text-white py-2.5 text-xs font-semibold hover:bg-theatre-curtain-hover active:bg-theatre-curtain/90 transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Gönderiliyor...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Mesajı Gönder</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

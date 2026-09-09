import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send, CheckCircle2, ArrowLeft, MapPin } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Information & Channels */}
        <div className="md:col-span-1 space-y-6">
          <div className="p-4 bg-layer-01 border border-border-subtle rounded-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-text-primary">
              <Mail className="w-4 h-4 text-theatre-curtain" />
              <span>E-Posta</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Doğrudan e-posta yoluyla bize yazabilirsiniz:
            </p>
            <a
              href="mailto:iletisim@tiyatronot.com"
              className="block text-xs font-mono text-theatre-curtain hover:underline break-all"
            >
              iletisim@tiyatronot.com
            </a>
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
        <div className="md:col-span-2">
          {submitted ? (
            <div className="p-8 bg-layer-01 border border-border-subtle rounded-sm text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
              <h3 className="font-serif font-bold text-lg text-text-primary">Mesajınız Alındı</h3>
              <p className="text-xs text-text-secondary font-mono max-w-md mx-auto">
                Geri bildiriminiz için teşekkür ederiz. En kısa sürede sizinle iletişime geçeceğiz.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setEmail('');
                  setMessage('');
                }}
                className="mt-4 text-xs font-mono text-theatre-curtain hover:underline cursor-pointer"
              >
                Yeni bir mesaj gönder
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-layer-01 border border-border-subtle rounded-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                  Adınız
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adınız ve soyadınız"
                  className="w-full border border-border-strong bg-canvas px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theatre-curtain transition-colors"
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
                  className="w-full border border-border-strong bg-canvas px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theatre-curtain transition-colors"
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
                  className="w-full border border-border-strong bg-canvas px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theatre-curtain transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 w-full bg-theatre-curtain text-white py-2.5 text-xs font-semibold hover:bg-theatre-curtain-hover transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Mesajı Gönder</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

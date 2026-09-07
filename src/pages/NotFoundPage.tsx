import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
      <div className="font-mono text-xs text-theatre-curtain uppercase tracking-widest font-semibold">
        Perde Kapalı · 404
      </div>
      <h1 className="font-serif font-bold text-3xl text-text-primary">
        Sahne Boş
      </h1>
      <p className="text-sm text-text-secondary leading-relaxed">
        Aradığınız sahne veya oyun sayfası bulunamadı. Repertuardaki oyunlara dönmek için kataloğu ziyaret edebilirsiniz.
      </p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white px-4 py-2 text-xs font-medium rounded-sm transition-colors"
        >
          <Compass className="w-4 h-4" />
          <span>Kataloğa Geri Dön</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

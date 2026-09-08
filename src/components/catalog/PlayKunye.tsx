import React from 'react';
import { 
  FileText, 
  User, 
  Users, 
  Clock, 
  Layers, 
  Calendar, 
  Building2, 
  MapPin, 
  Languages, 
  Tag, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Play } from '../../types';

export interface PlayWithDetails extends Play {
  translator?: string;
}

interface PlayKunyeProps {
  play: PlayWithDetails;
  className?: string;
}

// Famous Turkish translators dictionary for classical and foreign theatre works
export const DEFAULT_TRANSLATORS: Record<string, string> = {
  'bir-delinin-hatira-defteri': 'Genco Erkal (Uyarlayan & Çeviren)',
  'cimri': 'Sabahattin Eyüboğlu',
  'kel-diva': 'Hasan Anamur',
  'amadeus': 'Nüvit Özdoğru',
  'kizlar-ve-oglanlar': 'Hira Tekindor',
};

export const PlayKunye: React.FC<PlayKunyeProps> = ({ play, className = '' }) => {
  const translator = play.translator || DEFAULT_TRANSLATORS[play.id] || null;

  return (
    <div className={`theatrical-kunye bg-canvas border border-border-subtle rounded-sm p-5 sm:p-7 space-y-6 ${className}`}>
      {/* Künye Certificate Header */}
      <div className="border-b border-border-subtle pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-theatre-curtain text-[11px] font-mono font-bold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            <span>Tiyatro Künyesi & Prodüksiyon Belgesi</span>
          </div>
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-text-primary tracking-tight mt-0.5">
            {play.title}
          </h2>
          {play.originalTitle && play.originalTitle !== play.title && (
            <p className="font-serif italic text-xs text-text-secondary mt-0.5">
              Orijinal Eser: {play.originalTitle}
            </p>
          )}
        </div>
        <div className="font-mono text-xs text-text-tertiary bg-layer-01 px-2.5 py-1 border border-border-subtle rounded-sm self-start sm:self-auto">
          {play.year} Yapımı · {play.genre}
        </div>
      </div>

      {/* Structured Künye Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
        {/* Yazar */}
        <div className="flex items-start gap-3 py-1.5 border-b border-border-subtle/70">
          <BookOpen className="w-4 h-4 text-theatre-curtain flex-shrink-0 mt-0.5" />
          <div className="flex-1 flex justify-between gap-2">
            <span className="font-mono uppercase text-text-secondary">Yazar</span>
            <span className="font-semibold text-text-primary text-right font-serif text-sm">
              {play.playwright}
            </span>
          </div>
        </div>

        {/* Çevirmen / Uyarlayan (Foreign plays) */}
        {translator ? (
          <div className="flex items-start gap-3 py-1.5 border-b border-border-subtle/70">
            <Languages className="w-4 h-4 text-theatre-curtain flex-shrink-0 mt-0.5" />
            <div className="flex-1 flex justify-between gap-2">
              <span className="font-mono uppercase text-text-secondary">Çevirmen</span>
              <span className="font-medium text-text-primary text-right">
                {translator}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 py-1.5 border-b border-border-subtle/70">
            <Languages className="w-4 h-4 text-text-tertiary flex-shrink-0 mt-0.5" />
            <div className="flex-1 flex justify-between gap-2">
              <span className="font-mono uppercase text-text-secondary">Metin</span>
              <span className="font-medium text-text-secondary text-right">
                Türkçe Orijinal Metin
              </span>
            </div>
          </div>
        )}

        {/* Yönetmen */}
        <div className="flex items-start gap-3 py-1.5 border-b border-border-subtle/70">
          <User className="w-4 h-4 text-theatre-curtain flex-shrink-0 mt-0.5" />
          <div className="flex-1 flex justify-between gap-2">
            <span className="font-mono uppercase text-text-secondary">Yönetmen</span>
            <span className="font-medium text-text-primary text-right">
              {play.director}
            </span>
          </div>
        </div>

        {/* Yapımcı Topluluk */}
        <div className="flex items-start gap-3 py-1.5 border-b border-border-subtle/70">
          <Building2 className="w-4 h-4 text-theatre-curtain flex-shrink-0 mt-0.5" />
          <div className="flex-1 flex justify-between gap-2">
            <span className="font-mono uppercase text-text-secondary">Topluluk</span>
            <span className="font-medium text-text-primary text-right">
              {play.company}
            </span>
          </div>
        </div>

        {/* Süre */}
        <div className="flex items-start gap-3 py-1.5 border-b border-border-subtle/70">
          <Clock className="w-4 h-4 text-theatre-curtain flex-shrink-0 mt-0.5" />
          <div className="flex-1 flex justify-between gap-2">
            <span className="font-mono uppercase text-text-secondary">Süre</span>
            <span className="font-mono font-medium text-text-primary text-right">
              {play.duration} Dakika
            </span>
          </div>
        </div>

        {/* Perde Sayısı & Ara */}
        <div className="flex items-start gap-3 py-1.5 border-b border-border-subtle/70">
          <Layers className="w-4 h-4 text-theatre-curtain flex-shrink-0 mt-0.5" />
          <div className="flex-1 flex justify-between gap-2">
            <span className="font-mono uppercase text-text-secondary">Perde Düzeni</span>
            <span className="font-medium text-text-primary text-right">
              {play.hasIntermission ? '2 Perde (Ara Var)' : 'Tek Perde (Ara Yok)'}
            </span>
          </div>
        </div>

        {/* Sahne / Salon */}
        <div className="flex items-start gap-3 py-1.5 border-b border-border-subtle/70">
          <MapPin className="w-4 h-4 text-theatre-curtain flex-shrink-0 mt-0.5" />
          <div className="flex-1 flex justify-between gap-2">
            <span className="font-mono uppercase text-text-secondary">Sahne</span>
            <span className="font-medium text-text-primary text-right truncate max-w-[220px]">
              {play.venue}
            </span>
          </div>
        </div>

        {/* Prömiyer Yılı */}
        <div className="flex items-start gap-3 py-1.5 border-b border-border-subtle/70">
          <Calendar className="w-4 h-4 text-theatre-curtain flex-shrink-0 mt-0.5" />
          <div className="flex-1 flex justify-between gap-2">
            <span className="font-mono uppercase text-text-secondary">Prömiyer / Yıl</span>
            <span className="font-mono font-medium text-text-primary text-right">
              {play.year}
            </span>
          </div>
        </div>
      </div>

      {/* KONDÜVİT DEFTERİ & SAHNE AMİRİ TEKNİK RAPORU (Prompt-Book Box) */}
      <div className="bg-layer-01 border border-border-strong/40 rounded-sm p-4 sm:p-5 space-y-3 font-mono text-xs shadow-subtle">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2">
          <div className="flex items-center gap-2 text-theatre-curtain font-bold text-[11px] uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Kondüvit Defteri · Sahne Amiri Notları</span>
          </div>
          <span className="text-[10px] text-text-tertiary uppercase">REJİ KODU: TN-{play.year}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
          {/* Perde ve Zamanlama */}
          <div className="bg-canvas border border-border-subtle p-2.5 rounded-xs space-y-1">
            <span className="text-text-tertiary uppercase text-[10px]">Perde Dağılımı</span>
            <div className="font-semibold text-text-primary">
              {play.hasIntermission ? (
                <span>
                  1. Perde: ~{Math.round(play.duration * 0.52)}' <span className="text-theatre-curtain">·</span> Ara: 15' <span className="text-theatre-curtain">·</span> 2. Perde: ~{Math.round(play.duration * 0.48)}'
                </span>
              ) : (
                <span>Tek Perde (Kesintisiz {play.duration} Dakika)</span>
              )}
            </div>
          </div>

          {/* Sahne Formatı */}
          <div className="bg-canvas border border-border-subtle p-2.5 rounded-xs space-y-1">
            <span className="text-text-tertiary uppercase text-[10px]">Sahne Düzeni</span>
            <div className="font-semibold text-text-primary truncate">
              {play.venue.toLowerCase().includes('moda') || play.venue.toLowerCase().includes('craft')
                ? 'Black Box (Yakın Plan)'
                : 'İtalyan Çerçeve (Proscenium)'}
            </div>
          </div>

          {/* Suflör & Giriş Ritüeli */}
          <div className="bg-canvas border border-border-subtle p-2.5 rounded-xs space-y-1">
            <span className="text-text-tertiary uppercase text-[10px]">Temsil Kuralları</span>
            <div className="font-semibold text-text-primary">
              Suflörsüz · 3. Zilde Başlar
            </div>
          </div>
        </div>
      </div>

      {/* Oyuncu Kadrosu (Cast Tags) */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-semibold text-text-primary tracking-wider">
          <Users className="w-3.5 h-3.5 text-theatre-curtain" />
          <span>Oyuncu Kadrosu ({play.cast.length})</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {play.cast.map((actor) => (
            <span
              key={actor}
              className="inline-flex items-center gap-1.5 bg-layer-01 hover:bg-layer-02 border border-border-subtle px-2.5 py-1 rounded-sm text-xs font-medium text-text-primary transition-colors cursor-default"
            >
              <User className="w-3 h-3 text-text-tertiary" />
              <span>{actor}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Prodüksiyon Etiketleri */}
      {play.tags && play.tags.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-semibold text-text-primary tracking-wider">
            <Tag className="w-3.5 h-3.5 text-theatre-curtain" />
            <span>Prodüksiyon Etiketleri</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {play.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[11px] bg-canvas border border-border-subtle px-2 py-0.5 rounded-sm text-text-secondary"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Oyun Özeti & Dramaturji Notu */}
      <div className="space-y-2.5 pt-2 border-t border-border-subtle">
        <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-semibold text-theatre-curtain tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Oyun Özeti & Dramaturji Notu</span>
        </div>
        <div className="border-l-2 border-theatre-curtain pl-4 py-2 bg-layer-01/60 rounded-r-sm">
          <p className="font-serif italic text-sm text-text-primary leading-relaxed">
            "{play.synopsis}"
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlayKunye;

import React from 'react';
import { 
  FileText, 
  User, 
  Users, 
  Clock, 
  Building2, 
  Tag, 
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

export const PlayKunye: React.FC<PlayKunyeProps> = ({ play, className = '' }) => {
  return (
    <div className={`theatrical-kunye bg-canvas border border-border-subtle rounded-sm p-5 sm:p-7 space-y-6 ${className}`}>
      {/* Künye Section Header */}
      <div className="border-b border-border-subtle pb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-theatre-curtain text-xs font-mono font-bold uppercase tracking-wider">
          <FileText className="w-4 h-4" />
          <span>Tiyatro Künyesi</span>
        </div>
        {play.originalTitle && play.originalTitle !== play.title && (
          <span className="font-serif italic text-xs text-text-tertiary">
            Orijinal: {play.originalTitle}
          </span>
        )}
      </div>

      {/* Structured Künye Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
        {/* Yazar */}
        <div className="flex items-start gap-3 py-2 border-b border-border-subtle/70">
          <BookOpen className="w-4 h-4 text-theatre-curtain flex-shrink-0 mt-0.5" />
          <div className="flex-1 flex justify-between gap-2">
            <span className="font-mono uppercase text-text-secondary">Yazar</span>
            <span className="font-semibold text-text-primary text-right font-serif text-sm">
              {play.playwright}
            </span>
          </div>
        </div>

        {/* Yönetmen */}
        <div className="flex items-start gap-3 py-2 border-b border-border-subtle/70">
          <User className="w-4 h-4 text-theatre-curtain flex-shrink-0 mt-0.5" />
          <div className="flex-1 flex justify-between gap-2">
            <span className="font-mono uppercase text-text-secondary">Yönetmen</span>
            <span className="font-medium text-text-primary text-right">
              {play.director}
            </span>
          </div>
        </div>

        {/* Yapımcı Topluluk */}
        <div className="flex items-start gap-3 py-2 border-b border-border-subtle/70">
          <Building2 className="w-4 h-4 text-theatre-curtain flex-shrink-0 mt-0.5" />
          <div className="flex-1 flex justify-between gap-2">
            <span className="font-mono uppercase text-text-secondary">Topluluk</span>
            <span className="font-medium text-text-primary text-right">
              {play.company}
            </span>
          </div>
        </div>

        {/* Süre */}
        <div className="flex items-start gap-3 py-2 border-b border-border-subtle/70">
          <Clock className="w-4 h-4 text-theatre-curtain flex-shrink-0 mt-0.5" />
          <div className="flex-1 flex justify-between gap-2">
            <span className="font-mono uppercase text-text-secondary">Süre</span>
            <span className="font-mono font-medium text-text-primary text-right">
              {play.duration} Dakika
            </span>
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
              <User className="w-3 h-3 text-theatre-curtain/70" />
              <span>{actor}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Production Tags */}
      {play.tags && play.tags.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border-subtle">
          <div className="flex items-center gap-1 text-[11px] font-mono uppercase text-text-tertiary">
            <Tag className="w-3 h-3 text-theatre-curtain" />
            <span>Katalog Etiketleri</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {play.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] bg-canvas border border-border-subtle text-text-secondary px-2 py-0.5 rounded-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayKunye;

import React from 'react';
import { Link } from 'react-router-dom';
import type { Play } from '../../types';
import CircleArrowButton from './CircleArrowButton';

interface FeaturedCardProps {
  play: Play;
  badgeText?: string;
}

export const FeaturedCard: React.FC<FeaturedCardProps> = ({
  play,
  badgeText = 'Ayakta Alkış',
}) => {
  return (
    <article className="rounded-2xl bg-tn-red text-white p-6 box-border flex flex-col justify-between shadow-sm min-h-[440px] h-full font-serif">
      <div className="flex flex-col gap-4">
        {/* Top Badges */}
        <div className="flex justify-between items-center">
          <span className="h-6.5 px-3 flex items-center border border-white/75 rounded-full text-[13px] italic">
            {badgeText}
          </span>
          <span className="text-base font-semibold">
            ★ {play.rating ? play.rating.toFixed(1) : '5.0'}{' '}
            <span className="font-normal italic opacity-85">
              ({play.reviewCount || 1} not)
            </span>
          </span>
        </div>

        {/* Title & Author */}
        <div>
          <h2 className="m-0 font-extrabold text-4xl sm:text-5xl lg:text-[60px] leading-[0.92] tracking-tight">
            {play.title}
          </h2>
          <div className="italic text-xl sm:text-2xl lg:text-[28px] leading-tight mt-1 opacity-95">
            {play.playwright || 'Yazar belirtilmemiş'}
          </div>
        </div>

        {/* Meta Info */}
        <p className="m-0 text-base sm:text-[17px] leading-snug opacity-90">
          {play.director ? `Yön. ${play.director}` : ''}
          {play.company ? ` · ${play.company}` : ''}
          {play.duration ? ` · ${play.duration} dk` : ''}
          <br />
          <span className="italic">
            {play.genre || 'Tiyatro'} {play.year ? `— ${play.year}` : ''}
          </span>
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="flex justify-between items-center pt-4">
        <span className="text-sm font-semibold tracking-wider">OYUNA GİT</span>
        <Link to={`/oyun/${play.id}`} aria-label={`${play.title} oyun detay sayfası`}>
          <CircleArrowButton size="lg" variant="black" aria-label={`${play.title} detayına git`} />
        </Link>
      </div>
    </article>
  );
};

export default FeaturedCard;

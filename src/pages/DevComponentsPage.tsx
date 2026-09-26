import React, { useState } from 'react';
import SiteHeader from '../components/redesign/SiteHeader';
import SearchBar from '../components/redesign/SearchBar';
import FilterRow from '../components/redesign/FilterRow';
import HashtagChip, { COLOR_CYCLE } from '../components/redesign/HashtagChip';
import FeaturedCard from '../components/redesign/FeaturedCard';
import SplitCard from '../components/redesign/SplitCard';
import CircleArrowButton from '../components/redesign/CircleArrowButton';
import TicketNote from '../components/redesign/TicketNote';
import SenDeYazOval from '../components/redesign/SenDeYazOval';
import TicketComposer from '../components/redesign/TicketComposer';
import SegmentedControl from '../components/redesign/SegmentedControl';
import Switch from '../components/redesign/Switch';
import RatingSummary from '../components/redesign/RatingSummary';
import PuzzleCard from '../components/redesign/PuzzleCard';
import LeaderboardEmpty from '../components/redesign/LeaderboardEmpty';
import CuratedListCard from '../components/redesign/CuratedListCard';
import CatalogCard from '../components/redesign/CatalogCard';
import CastChip from '../components/redesign/CastChip';
import Pagination from '../components/redesign/Pagination';
import LoadMoreButton from '../components/redesign/LoadMoreButton';
import MobileTabBar from '../components/redesign/MobileTabBar';
import StickyActionBar from '../components/redesign/StickyActionBar';
import Footer from '../components/redesign/Footer';
import type { Play, ReviewEntry } from '../types';

const mockPlay: Play = {
  id: 'saticinin-olumu-2',
  title: 'Satıcının Ölümü',
  originalTitle: 'Death of a Salesman',
  playwright: 'Arthur Miller',
  director: 'Rufus Norris',
  company: 'Zorlu PSM',
  duration: 90,
  hasIntermission: false,
  year: 2026,
  genre: 'Trajedi & Dram',
  venue: 'Zorlu PSM',
  posterUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=600&q=80',
  synopsis: 'Büyük Buhran döneminde ailesine iyi bir hayat sunmaya çalışan Willy Loman’ın Amerikan Rüyası ile yüzleşmesi.',
  rating: 5.0,
  reviewCount: 1,
  tags: ['Trajedi & Dram', 'Zorlu PSM'],
  cast: ['Ahmet Mümtaz Taylan', 'Zerrin Tekindor'],
};

const mockReview: ReviewEntry = {
  id: 'mn8a',
  playId: 'saticinin-olumu-2',
  playTitle: 'Satıcının Ölümü',
  playPosterUrl: mockPlay.posterUrl,
  userId: 'u1',
  userName: 'Atahan Uysaler',
  rating: 5.0,
  reviewText: 'gözlerimi arda ergülden alamadım maalesef..',
  performanceDate: '10.09.2026',
  sessionType: 'suare',
  venue: 'Zorlu PSM',
  hasSpoilers: false,
  likes: 12,
  createdAt: '2026-09-10T20:00:00Z',
};

export const DevComponentsPage: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [isSwitchOn, setIsSwitchOn] = useState(true);
  const [segmentedVal, setSegmentedVal] = useState('İyi');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="w-full flex flex-col gap-10 font-serif p-4 sm:p-8 bg-tn-container rounded-2xl">
      <div className="border-b border-tn-line pb-4">
        <h1 className="text-4xl font-extrabold text-tn-text">Tiyatronot Bileşen Kütüphanesi</h1>
        <p className="italic text-tn-muted text-base mt-1">
          DESIGN.md §7'deki tüm component'ler, durumlar ve tasarım token'ları.
        </p>
      </div>

      {/* Buttons & Switches */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold border-b border-tn-line/40 pb-2">1. Kontroller (Switch, Segmented, CircleArrow)</h2>
        <div className="flex flex-wrap items-center gap-6">
          <Switch
            checked={isSwitchOn}
            onChange={setIsSwitchOn}
            label={`Switch: ${isSwitchOn ? 'Açık' : 'Kapalı'}`}
          />
          <SegmentedControl
            options={['Kusursuz', 'İyi', 'Kısıtlı']}
            value={segmentedVal}
            onChange={setSegmentedVal}
          />
          <div className="flex items-center gap-3">
            <CircleArrowButton size="sm" variant="black" aria-label="Small" />
            <CircleArrowButton size="md" variant="white" aria-label="Medium" />
            <CircleArrowButton size="lg" variant="black" aria-label="Large" />
          </div>
        </div>
      </section>

      {/* Hashtag Chips */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold border-b border-tn-line/40 pb-2">2. HashtagChip Renk Döngüsü</h2>
        <div className="flex flex-wrap gap-2">
          {COLOR_CYCLE.map((color, i) => (
            <HashtagChip key={color} label={`Etiket #${i + 1}`} color={color} />
          ))}
        </div>
      </section>

      {/* Search & Filter */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold border-b border-tn-line/40 pb-2">3. SearchBar & FilterRow</h2>
        <SearchBar
          value={searchValue}
          onChange={setSearchValue}
          totalCount={1854}
          isFiltersOpen={isFiltersOpen}
          onToggleFilters={() => setIsFiltersOpen(!isFiltersOpen)}
        />
        <FilterRow
          isOpen={isFiltersOpen}
          selectedGenre={selectedGenre}
          onGenreChange={setSelectedGenre}
          genreOptions={['Trajedi & Dram', 'Komedi', 'Müzikal', 'Performans']}
          selectedCompany=""
          onCompanyChange={() => {}}
          companyOptions={['Zorlu PSM', 'Şehir Tiyatroları']}
          selectedActor=""
          onActorChange={() => {}}
          actorOptions={['Haluk Bilginer', 'Zerrin Tekindor']}
          selectedSort="rating_desc"
          onSortChange={() => {}}
        />
      </section>

      {/* Cards Grid */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold border-b border-tn-line/40 pb-2">4. Kartlar (FeaturedCard, SplitCard, CatalogCard, CuratedListCard)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeaturedCard play={mockPlay} />
          <SplitCard play={mockPlay} colorVariant="blush" />
          <CuratedListCard
            category="TRAJEDİ & DRAM"
            playCount={12}
            title="Kadıköy Sahnelerinde Bu Ay"
            description="Moda Sahnesi ve Kadıköy Emek Tiyatrosu seçkisi."
            curator="Atahan Uysaler"
            colorVariant="sage"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-4">
          <CatalogCard play={mockPlay} />
          <CatalogCard play={{ ...mockPlay, id: '2', title: 'Clown Jam', genre: 'KOMEDİ', rating: 4.8 }} />
          <CatalogCard play={{ ...mockPlay, id: '3', title: 'Gecede Yaşayanlar', genre: 'DRAM', rating: 4.6 }} />
        </div>
      </section>

      {/* Tickets & Composer */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold border-b border-tn-line/40 pb-2">5. Biletler (TicketNote Yatay / Dikey, SenDeYazOval, TicketComposer)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[380px]">
          <TicketNote review={mockReview} variant="horizontal" />
          {isComposerOpen ? (
            <TicketComposer
              playTitle={mockPlay.title}
              defaultVenue={mockPlay.venue}
              onCancel={() => setIsComposerOpen(false)}
              onSubmit={() => setIsComposerOpen(false)}
            />
          ) : (
            <SenDeYazOval onClick={() => setIsComposerOpen(true)} />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <TicketNote review={mockReview} variant="vertical" />
          <RatingSummary rating={5.0} reviewCount={1} />
          <div className="flex flex-col gap-3">
            <LeaderboardEmpty />
            <PuzzleCard
              title="Günün Repliği"
              subtitle="Replikten oyunu tahmin et"
              description="Her gün yenilenen tiyatro replikleriyle hafızanı sına."
              badge="GÜNLÜK"
              xpReward={30}
              onClick={() => {}}
            />
          </div>
        </div>
      </section>

      {/* Pagination & Load More */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold border-b border-tn-line/40 pb-2">6. Sayfalama & Daha Fazla Yükle</h2>
        <Pagination
          currentPage={currentPage}
          totalPages={62}
          onPageChange={setCurrentPage}
        />
        <div className="max-w-md mx-auto w-full pt-2">
          <LoadMoreButton onClick={() => {}} remainingCount={1824} />
        </div>
      </section>
    </div>
  );
};

export default DevComponentsPage;

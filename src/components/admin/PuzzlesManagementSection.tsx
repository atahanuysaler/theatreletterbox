import React, { useEffect, useState, useCallback } from 'react';
import {
  Puzzle,
  Plus,
  CheckCircle2,
  Star,
  Edit2,
  Trash2,
  Theater,
  BookOpen,
  HelpCircle,
  X
} from 'lucide-react';
import { storageService } from '../../services/storage';
import type {
  PuzzleGameConfig,
  DailyQuote,
  ActorDetectiveItem,
  TriviaQuestionItem,
  TheatreWordItem
} from '../../types';

export function PuzzlesManagementSection() {
  const [subTab, setSubTab] = useState<'games' | 'quotes' | 'actors' | 'trivia' | 'words'>('games');
  const [games, setGames] = useState<PuzzleGameConfig[]>([]);
  const [quotes, setQuotes] = useState<DailyQuote[]>([]);
  const [actors, setActors] = useState<ActorDetectiveItem[]>([]);
  const [triviaQuestions, setTriviaQuestions] = useState<TriviaQuestionItem[]>([]);
  const [theatreWords, setTheatreWords] = useState<TheatreWordItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Puzzle Game Modal State
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<PuzzleGameConfig | null>(null);
  const [gameTitle, setGameTitle] = useState('');
  const [gameSubtitle, setGameSubtitle] = useState('');
  const [gameDescription, setGameDescription] = useState('');
  const [gameCategory, setGameCategory] = useState<'daily' | 'trivia' | 'visual' | 'word'>('daily');
  const [gameXpReward, setGameXpReward] = useState<number>(25);
  const [gameStatus, setGameStatus] = useState<'active' | 'coming_soon'>('active');
  const [gameBadge, setGameBadge] = useState('');
  const [gameIcon, setGameIcon] = useState('🎭');
  const [gameEstimatedTime, setGameEstimatedTime] = useState('2 dk');
  const [gameIsFeatured, setGameIsFeatured] = useState(false);
  const [gameSubmitting, setGameSubmitting] = useState(false);

  // Quote Add Form State
  const [showAddQuote, setShowAddQuote] = useState(false);
  const [quoteText, setQuoteText] = useState('');
  const [quotePlayTitle, setQuotePlayTitle] = useState('');
  const [quoteCharacter, setQuoteCharacter] = useState('');
  const [quotePlaywright, setQuotePlaywright] = useState('');
  const [quoteHint, setQuoteHint] = useState('');
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);

  // Actor Detective Form State
  const [showAddActor, setShowAddActor] = useState(false);
  const [actorName, setActorName] = useState('');
  const [actorTitle, setActorTitle] = useState('');
  const [actorPlays, setActorPlays] = useState('');
  const [actorClue1, setActorClue1] = useState('');
  const [actorClue2, setActorClue2] = useState('');
  const [actorClue3, setActorClue3] = useState('');
  const [actorHint, setActorHint] = useState('');
  const [actorSubmitting, setActorSubmitting] = useState(false);

  // Trivia Form State
  const [showAddTrivia, setShowAddTrivia] = useState(false);
  const [triviaQuestion, setTriviaQuestion] = useState('');
  const [triviaOpt0, setTriviaOpt0] = useState('');
  const [triviaOpt1, setTriviaOpt1] = useState('');
  const [triviaOpt2, setTriviaOpt2] = useState('');
  const [triviaOpt3, setTriviaOpt3] = useState('');
  const [triviaCorrectIdx, setTriviaCorrectIdx] = useState(0);
  const [triviaExplanation, setTriviaExplanation] = useState('');
  const [triviaSubmitting, setTriviaSubmitting] = useState(false);

  // Word Form State
  const [showAddWord, setShowAddWord] = useState(false);
  const [wordText, setWordText] = useState('');
  const [wordDefinition, setWordDefinition] = useState('');
  const [wordClue, setWordClue] = useState('');
  const [wordCategory, setWordCategory] = useState('');
  const [wordSubmitting, setWordSubmitting] = useState(false);

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [gList, qList, aList, tList, wList] = await Promise.all([
        storageService.getPuzzleGames(),
        storageService.getQuotes(),
        storageService.getActorDetectives(),
        storageService.getTriviaQuestions(),
        storageService.getTheatreWords()
      ]);
      setGames(gList);
      setQuotes(qList);
      setActors(aList);
      setTriviaQuestions(tList);
      setTheatreWords(wList);
    } catch {
      setGames([]);
      setQuotes([]);
      setActors([]);
      setTriviaQuestions([]);
      setTheatreWords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Current active of the day for each pool
  const todayActor = actors.find(a => a.isToday) || actors[0];
  const todayQuote = quotes.find(q => q.isToday) || quotes[0];
  const todayTrivia = triviaQuestions.find(t => t.isToday) || triviaQuestions[0];
  const todayWord = theatreWords.find(w => w.isToday) || theatreWords[0];

  // Set Active Item of the Day Handlers
  const handleSetActiveActor = async (id: string) => {
    try {
      await storageService.setActiveActorDetective(id);
      setStatusMsg({ type: 'success', text: 'Günün aktif dedektif oyuncusu başarıyla belirlendi.' });
      await loadData();
    } catch {
      setStatusMsg({ type: 'error', text: 'Günün oyuncusu belirlenirken hata oluştu.' });
    }
  };

  const handleSetActiveQuote = async (id: string) => {
    try {
      await storageService.setActiveQuote(id);
      setStatusMsg({ type: 'success', text: 'Günün aktif repliği başarıyla belirlendi.' });
      await loadData();
    } catch {
      setStatusMsg({ type: 'error', text: 'Günün repliği belirlenirken hata oluştu.' });
    }
  };

  const handleSetActiveTrivia = async (id: string) => {
    try {
      await storageService.setActiveTriviaQuestion(id);
      setStatusMsg({ type: 'success', text: 'Günün aktif trivia sorusu başarıyla belirlendi.' });
      await loadData();
    } catch {
      setStatusMsg({ type: 'error', text: 'Günün trivia sorusu belirlenirken hata oluştu.' });
    }
  };

  const handleSetActiveWord = async (id: string) => {
    try {
      await storageService.setActiveTheatreWord(id);
      setStatusMsg({ type: 'success', text: 'Günün aktif tiyatro kelimesi başarıyla belirlendi.' });
      await loadData();
    } catch {
      setStatusMsg({ type: 'error', text: 'Günün kelimesi belirlenirken hata oluştu.' });
    }
  };

  // Open Game Modal
  const handleOpenGameCreate = () => {
    setEditingGame(null);
    setGameTitle('');
    setGameSubtitle('');
    setGameDescription('');
    setGameCategory('daily');
    setGameXpReward(25);
    setGameStatus('active');
    setGameBadge('Yeni Bulmaca');
    setGameIcon('🧩');
    setGameEstimatedTime('2 dk');
    setGameIsFeatured(false);
    setStatusMsg(null);
    setIsGameModalOpen(true);
  };

  const handleOpenGameEdit = (game: PuzzleGameConfig) => {
    setEditingGame(game);
    setGameTitle(game.title);
    setGameSubtitle(game.subtitle);
    setGameDescription(game.description);
    setGameCategory(game.category);
    setGameXpReward(game.xpReward);
    setGameStatus(game.status);
    setGameBadge(game.badge || '');
    setGameIcon(game.icon);
    setGameEstimatedTime(game.estimatedTime);
    setGameIsFeatured(!!game.isFeatured);
    setStatusMsg(null);
    setIsGameModalOpen(true);
  };

  const handleToggleGameStatus = async (game: PuzzleGameConfig) => {
    const newStatus = game.status === 'active' ? 'coming_soon' : 'active';
    try {
      await storageService.updatePuzzleGame(game.id, {
        status: newStatus,
        badge: newStatus === 'active' ? (game.badge === 'Çok Yakında' ? 'Aktif' : game.badge) : 'Çok Yakında'
      });
      setStatusMsg({
        type: 'success',
        text: `"${game.title}" durumu "${newStatus === 'active' ? 'Aktif' : 'Yakında'}" olarak güncellendi.`
      });
      await loadData();
    } catch {
      setStatusMsg({ type: 'error', text: 'Durum güncellenirken hata oluştu.' });
    }
  };

  const handleSetFeaturedGame = async (targetGame: PuzzleGameConfig) => {
    try {
      await Promise.all(
        games.map(g =>
          storageService.updatePuzzleGame(g.id, {
            isFeatured: g.id === targetGame.id
          })
        )
      );
      setStatusMsg({
        type: 'success',
        text: `"${targetGame.title}" günün öne çıkan bulmacası olarak belirlendi.`
      });
      await loadData();
    } catch {
      setStatusMsg({ type: 'error', text: 'Öne çıkan bulmaca belirlenirken hata oluştu.' });
    }
  };

  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameTitle.trim() || !gameDescription.trim()) {
      setStatusMsg({ type: 'error', text: 'Başlık ve açıklama alanları zorunludur.' });
      return;
    }
    setGameSubmitting(true);
    setStatusMsg(null);
    try {
      if (editingGame) {
        await storageService.updatePuzzleGame(editingGame.id, {
          title: gameTitle.trim(),
          subtitle: gameSubtitle.trim(),
          description: gameDescription.trim(),
          category: gameCategory,
          xpReward: Number(gameXpReward) || 20,
          status: gameStatus,
          badge: gameBadge.trim() || undefined,
          icon: gameIcon.trim() || '🎭',
          estimatedTime: gameEstimatedTime.trim() || '2 dk',
          isFeatured: gameIsFeatured
        });
        setStatusMsg({ type: 'success', text: `"${gameTitle}" bulmacası güncellendi.` });
      } else {
        await storageService.createPuzzleGame({
          title: gameTitle.trim(),
          subtitle: gameSubtitle.trim(),
          description: gameDescription.trim(),
          category: gameCategory,
          xpReward: Number(gameXpReward) || 20,
          status: gameStatus,
          badge: gameBadge.trim() || undefined,
          icon: gameIcon.trim() || '🎭',
          estimatedTime: gameEstimatedTime.trim() || '2 dk',
          isFeatured: gameIsFeatured
        });
        setStatusMsg({ type: 'success', text: `"${gameTitle}" bulmacası başarıyla eklendi.` });
      }
      setIsGameModalOpen(false);
      await loadData();
    } catch {
      setStatusMsg({ type: 'error', text: 'Bulmaca kaydedilirken hata oluştu.' });
    } finally {
      setGameSubmitting(false);
    }
  };

  const handleDeleteGame = async (game: PuzzleGameConfig) => {
    if (!window.confirm(`"${game.title}" bulmacasını silmek istediğinizden emin misiniz?`)) return;
    try {
      await storageService.deletePuzzleGame(game.id);
      setStatusMsg({ type: 'success', text: `"${game.title}" bulmacası silindi.` });
      await loadData();
    } catch {
      setStatusMsg({ type: 'error', text: 'Bulmaca silinirken hata oluştu.' });
    }
  };

  // Quote Handlers
  const handleAddQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteText.trim() || !quotePlayTitle.trim()) return;
    setQuoteSubmitting(true);
    try {
      await storageService.createQuote({
        quote: quoteText.trim(),
        playTitle: quotePlayTitle.trim(),
        character: quoteCharacter.trim(),
        playwright: quotePlaywright.trim(),
        hint: quoteHint.trim(),
      });
      setQuoteText('');
      setQuotePlayTitle('');
      setQuoteCharacter('');
      setQuotePlaywright('');
      setQuoteHint('');
      setShowAddQuote(false);
      setStatusMsg({ type: 'success', text: 'Replik havuzuna yeni replik eklendi.' });
      await loadData();
    } catch {
      setStatusMsg({ type: 'error', text: 'Replik eklenirken hata oluştu.' });
    } finally {
      setQuoteSubmitting(false);
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (!window.confirm('Bu replik silinsin mi?')) return;
    try {
      await storageService.deleteQuote(id);
      setStatusMsg({ type: 'success', text: 'Replik silindi.' });
      await loadData();
    } catch {
      setStatusMsg({ type: 'error', text: 'Replik silinirken hata oluştu.' });
    }
  };

  // Actor Handlers
  const handleAddActor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actorName.trim() || !actorClue1.trim()) return;
    setActorSubmitting(true);
    try {
      const clues = [actorClue1.trim()];
      if (actorClue2.trim()) clues.push(actorClue2.trim());
      if (actorClue3.trim()) clues.push(actorClue3.trim());

      const famousPlays = actorPlays
        .split(',')
        .map(p => p.trim())
        .filter(Boolean);

      await storageService.createActorDetective({
        actorName: actorName.trim(),
        title: actorTitle.trim() || `${actorName.trim()} - Usta Sanatçı`,
        famousPlays,
        clues,
        hint: actorHint.trim() || undefined
      });

      setActorName('');
      setActorTitle('');
      setActorPlays('');
      setActorClue1('');
      setActorClue2('');
      setActorClue3('');
      setActorHint('');
      setShowAddActor(false);
      setStatusMsg({ type: 'success', text: 'Yeni usta tiyatro oyuncusu başarıyla eklendi.' });
      await loadData();
    } catch {
      setStatusMsg({ type: 'error', text: 'Oyuncu eklenirken hata oluştu.' });
    } finally {
      setActorSubmitting(false);
    }
  };

  const handleDeleteActor = async (id: string) => {
    if (!window.confirm('Bu oyuncu silinsin mi?')) return;
    try {
      await storageService.deleteActorDetective(id);
      setStatusMsg({ type: 'success', text: 'Oyuncu silindi.' });
      await loadData();
    } catch {
      setStatusMsg({ type: 'error', text: 'Oyuncu silinirken hata oluştu.' });
    }
  };

  // Trivia Handlers
  const handleAddTrivia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!triviaQuestion.trim() || !triviaOpt0.trim() || !triviaOpt1.trim()) return;
    setTriviaSubmitting(true);
    try {
      const options = [
        triviaOpt0.trim(),
        triviaOpt1.trim(),
        triviaOpt2.trim() || 'Diğer',
        triviaOpt3.trim() || 'Hiçbiri'
      ];

      const chosenIdx = Math.max(0, Math.min(3, Number(triviaCorrectIdx) || 0));
      const correctAnswer = options[chosenIdx] || options[0];

      await storageService.createTriviaQuestion({
        question: triviaQuestion.trim(),
        options,
        correctAnswer,
        explanation: triviaExplanation.trim() || 'Tiyatro tarihi genel kültür bilgisi'
      });

      setTriviaQuestion('');
      setTriviaOpt0('');
      setTriviaOpt1('');
      setTriviaOpt2('');
      setTriviaOpt3('');
      setTriviaCorrectIdx(0);
      setTriviaExplanation('');
      setShowAddTrivia(false);
      setStatusMsg({ type: 'success', text: 'Yeni trivia sorusu eklendi.' });
      await loadData();
    } catch {
      setStatusMsg({ type: 'error', text: 'Trivia sorusu eklenirken hata oluştu.' });
    } finally {
      setTriviaSubmitting(false);
    }
  };

  const handleDeleteTrivia = async (id: string) => {
    if (!window.confirm('Bu soru silinsin mi?')) return;
    try {
      await storageService.deleteTriviaQuestion(id);
      setStatusMsg({ type: 'success', text: 'Soru silindi.' });
      await loadData();
    } catch {
      setStatusMsg({ type: 'error', text: 'Soru silinirken hata oluştu.' });
    }
  };

  // Word Handlers
  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordText.trim() || !wordDefinition.trim()) return;
    setWordSubmitting(true);
    try {
      await storageService.createTheatreWord({
        word: wordText.trim().toUpperCase(),
        definition: wordDefinition.trim(),
        clue: wordClue.trim() || 'Tiyatro sahne terimi',
        category: wordCategory.trim() || 'Sahne & Oyunculuk'
      });

      setWordText('');
      setWordDefinition('');
      setWordClue('');
      setWordCategory('');
      setShowAddWord(false);
      setStatusMsg({ type: 'success', text: 'Tiyatro sözlüğüne yeni kelime eklendi.' });
      await loadData();
    } catch {
      setStatusMsg({ type: 'error', text: 'Kelime eklenirken hata oluştu.' });
    } finally {
      setWordSubmitting(false);
    }
  };

  const handleDeleteWord = async (id: string) => {
    if (!window.confirm('Bu terim silinsin mi?')) return;
    try {
      await storageService.deleteTheatreWord(id);
      setStatusMsg({ type: 'success', text: 'Terim silindi.' });
      await loadData();
    } catch {
      setStatusMsg({ type: 'error', text: 'Terim silinirken hata oluştu.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <Puzzle className="w-5 h-5 text-theatre-curtain" />
            <h2 className="font-serif font-bold text-lg text-text-primary">
              Bulmaca & Oyun Yönetimi
            </h2>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Her bulmaca için günün aktif sorusunu/oyuncusunu belirleyin ve içerik havuzunu yönetin.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex flex-wrap items-center bg-layer-01 border border-border-subtle p-1 rounded-sm gap-1">
          <button
            type="button"
            onClick={() => setSubTab('games')}
            className={`px-3 py-1.5 text-xs font-mono rounded-xs transition-colors cursor-pointer ${
              subTab === 'games'
                ? 'bg-theatre-curtain text-white font-semibold shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Aktif Bulmacalar ({games.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('actors')}
            className={`px-3 py-1.5 text-xs font-mono rounded-xs transition-colors cursor-pointer ${
              subTab === 'actors'
                ? 'bg-theatre-curtain text-white font-semibold shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Oyuncu Dedektifi ({actors.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('quotes')}
            className={`px-3 py-1.5 text-xs font-mono rounded-xs transition-colors cursor-pointer ${
              subTab === 'quotes'
                ? 'bg-theatre-curtain text-white font-semibold shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Günün Repliği ({quotes.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('trivia')}
            className={`px-3 py-1.5 text-xs font-mono rounded-xs transition-colors cursor-pointer ${
              subTab === 'trivia'
                ? 'bg-theatre-curtain text-white font-semibold shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Sahne Trivia ({triviaQuestions.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('words')}
            className={`px-3 py-1.5 text-xs font-mono rounded-xs transition-colors cursor-pointer ${
              subTab === 'words'
                ? 'bg-theatre-curtain text-white font-semibold shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Tiyatro Sözlüğü ({theatreWords.length})
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-3 text-xs font-mono rounded-sm border ${
          statusMsg.type === 'success'
            ? 'bg-success-mint/10 border-success-mint/30 text-success-mint'
            : 'bg-red-500/10 border-red-500/30 text-red-600'
        }`}>
          {statusMsg.text}
        </div>
      )}

      {/* ── SUB-TAB 1: PUZZLE GAMES & ACTIVE SELECTION ── */}
      {subTab === 'games' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-layer-01 border border-border-subtle p-4 rounded-sm">
            <div>
              <h3 className="font-serif font-bold text-sm text-text-primary">
                Aktif Bulmaca ve Öne Çıkarma Seçimi
              </h3>
              <p className="text-xs text-text-tertiary mt-0.5">
                Kullanıcıların /bulmacalar sayfasında göreceği ve oynayabileceği oyunları buradan açıp kapatabilirsiniz.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenGameCreate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Bulmaca Modülü</span>
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs font-mono text-text-tertiary">Yükleniyor...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {games.map(game => {
                const isActive = game.status === 'active';
                const isFeatured = !!game.isFeatured;

                return (
                  <div
                    key={game.id}
                    className={`border rounded-sm p-4 flex flex-col justify-between space-y-4 transition-all ${
                      isActive
                        ? isFeatured
                          ? 'bg-layer-01 border-theatre-gold/60 shadow-sm ring-1 ring-theatre-gold/30'
                          : 'bg-layer-01 border-border-subtle shadow-xs'
                        : 'bg-layer-01/50 border-border-subtle/60 opacity-80'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl p-1 bg-canvas border border-border-subtle rounded-sm">
                            {game.icon}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-serif font-bold text-sm text-text-primary">
                                {game.title}
                              </h4>
                              {isFeatured && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xs">
                                  <Star className="w-2.5 h-2.5 fill-current" />
                                  Günün Öne Çıkanı
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-text-tertiary font-sans block">
                              {game.subtitle}
                            </span>
                          </div>
                        </div>

                        {/* Status Chip */}
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider shrink-0 ${
                            isActive
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-layer-02 text-text-tertiary border border-border-subtle'
                          }`}
                        >
                          {isActive ? 'Aktif' : 'Pasif / Yakında'}
                        </span>
                      </div>

                      <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 my-2">
                        {game.description}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] font-mono text-text-tertiary">
                        <span className="text-theatre-curtain font-semibold">+{game.xpReward} XP</span>
                        <span>·</span>
                        <span>{game.estimatedTime}</span>
                        <span>·</span>
                        <span className="uppercase text-[10px]">{game.category}</span>
                      </div>
                    </div>

                    {/* Action Controls: Toggle Active, Spotlight, Edit, Delete */}
                    <div className="pt-3 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleGameStatus(game)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-xs border transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/20'
                              : 'bg-layer-02 border-border-subtle text-text-secondary hover:text-text-primary'
                          }`}
                          title={isActive ? 'Bulmacayı Pasife Al' : 'Bulmacayı Aktif Et'}
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-500' : 'text-text-tertiary'}`} />
                          <span>{isActive ? 'Aktif' : 'Aktif Et'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetFeaturedGame(game)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded-xs border transition-colors cursor-pointer ${
                            isFeatured
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 font-semibold'
                              : 'bg-layer-01 border-border-subtle text-text-secondary hover:text-amber-600 hover:border-amber-500/30'
                          }`}
                          title="Bu oyunu ana sayfada günün öne çıkanı yap"
                        >
                          <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-current' : ''}`} />
                          <span>{isFeatured ? 'Öne Çıkarıldı' : 'Öne Çıkar'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenGameEdit(game)}
                          className="p-1.5 text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
                          title="Düzenle"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGame(game)}
                          className="p-1.5 text-text-tertiary hover:text-red-600 transition-colors cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SUB-TAB 2: OYUNCU DEDEKTİFİ ── */}
      {subTab === 'actors' && (
        <div className="space-y-4">
          {/* Active Actor Notice Banner */}
          {todayActor && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-sm p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-amber-500 fill-current shrink-0" />
                <div>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[11px] mr-2">
                    Bugünün Aktif Oyuncusu:
                  </span>
                  <strong className="text-text-primary text-sm font-serif">{todayActor.actorName}</strong>
                  {todayActor.title && <span className="text-text-tertiary text-xs ml-2">({todayActor.title})</span>}
                </div>
              </div>
              <span className="text-[10px] font-mono text-text-tertiary hidden sm:inline">
                Oyuna giren kullanıcılar bugün bu usta oyuncuyu tahmin eder
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-layer-01 border border-border-subtle p-4 rounded-sm">
            <div>
              <div className="flex items-center gap-2">
                <Theater className="w-4 h-4 text-theatre-curtain" />
                <h3 className="font-serif font-bold text-sm text-text-primary">
                  Oyuncu Dedektifi (Usta Tiyatro & Sinema Oyuncuları)
                </h3>
              </div>
              <p className="text-xs text-text-tertiary mt-0.5">
                Günün aktif oyuncusunu seçin ("Günün Oyuncusu Yap" butonuna tıklayarak) veya yeni oyuncu ekleyin.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddActor(!showAddActor)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddActor ? 'Formu Kapat' : 'Yeni Usta Oyuncu Ekle'}</span>
            </button>
          </div>

          {/* Add Actor Form */}
          {showAddActor && (
            <form onSubmit={handleAddActor} className="bg-layer-01 border border-border-subtle p-4 rounded-sm space-y-3">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
                Yeni Usta Oyuncu Tanımı
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-text-tertiary mb-1">
                    Oyuncu Adı Soyadı *
                  </label>
                  <input
                    type="text"
                    value={actorName}
                    onChange={e => setActorName(e.target.value)}
                    placeholder="örn: Haluk Bilginer"
                    required
                    className="w-full bg-layer-02 border border-border-subtle px-3 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-text-tertiary mb-1">
                    Başlık / Sahne Ünvanı (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={actorTitle}
                    onChange={e => setActorTitle(e.target.value)}
                    placeholder="örn: Sahne Devi, Kral Lear yorumcusu"
                    className="w-full bg-layer-02 border border-border-subtle px-3 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-text-tertiary mb-1">
                  Bilinen Tiyatro Oyunları (Virgülle ayırın)
                </label>
                <input
                  type="text"
                  value={actorPlays}
                  onChange={e => setActorPlays(e.target.value)}
                  placeholder="örn: Kral Lear, Antonius ile Kleopatra, Nehir"
                  className="w-full bg-layer-02 border border-border-subtle px-3 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-text-tertiary mb-1">
                  1. İpucu (Zor Seviye - Erken dönem veya genel sahne bilgisi) *
                </label>
                <input
                  type="text"
                  value={actorClue1}
                  onChange={e => setActorClue1(e.target.value)}
                  placeholder="örn: 1954 doğumlu usta sanatçı, tiyatro eğitimini Ankara Devlet Konservatuvarı ve LAMDA'da tamamladı."
                  required
                  className="w-full bg-layer-02 border border-border-subtle px-3 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-text-tertiary mb-1">
                  2. İpucu (Orta Seviye - Topluluk veya dönüm noktası oyunu)
                </label>
                <input
                  type="text"
                  value={actorClue2}
                  onChange={e => setActorClue2(e.target.value)}
                  placeholder="örn: Moda Sahnesi ve Oyun Atölyesi kurucularındandır; Shakespeare rollerindeki ustalığıyla bilinir."
                  className="w-full bg-layer-02 border border-border-subtle px-3 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-text-tertiary mb-1">
                  3. İpucu (Kolay Seviye - İkonik rol veya ödül)
                </label>
                <input
                  type="text"
                  value={actorClue3}
                  onChange={e => setActorClue3(e.target.value)}
                  placeholder="örn: Uluslararası Emmy En İyi Erkek Oyuncu Ödülü kazandı, Kral Lear performansı efsaneleşti."
                  className="w-full bg-layer-02 border border-border-subtle px-3 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-text-tertiary mb-1">
                  Kısa Ek İpucu (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={actorHint}
                  onChange={e => setActorHint(e.target.value)}
                  placeholder="örn: Oyun Atölyesi kurucusu usta aktör"
                  className="w-full bg-layer-02 border border-border-subtle px-3 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddActor(false)}
                  className="px-3 py-1.5 text-xs font-mono text-text-tertiary hover:text-text-primary cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={actorSubmitting}
                  className="px-4 py-1.5 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer"
                >
                  {actorSubmitting ? 'Kaydediliyor...' : 'Oyuncuyu Havuza Ekle'}
                </button>
              </div>
            </form>
          )}

          {/* Actor Detective Items List */}
          {loading ? (
            <div className="p-8 text-center text-xs font-mono text-text-tertiary">Yükleniyor...</div>
          ) : actors.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-text-tertiary">Kayıtlı oyuncu yok.</div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {actors.map((actor, idx) => {
                const isTodayActive = actor.id === todayActor?.id;

                return (
                  <div
                    key={actor.id}
                    className={`p-4 rounded-sm border transition-all flex items-start justify-between gap-4 ${
                      isTodayActive
                        ? 'bg-layer-01 border-amber-500/50 shadow-sm ring-1 ring-amber-500/20'
                        : 'bg-layer-01 border-border-subtle hover:border-theatre-curtain/40'
                    }`}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-theatre-curtain/10 text-theatre-curtain text-xs font-mono font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="font-serif font-bold text-base text-text-primary">
                          {actor.actorName}
                        </h4>
                        {isTodayActive && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xs">
                            <Star className="w-3 h-3 fill-current" />
                            Günün Aktif Oyuncusu
                          </span>
                        )}
                        {actor.hint && (
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-canvas border border-border-subtle text-text-tertiary rounded-xs">
                            {actor.hint}
                          </span>
                        )}
                      </div>

                      {actor.famousPlays && actor.famousPlays.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] font-mono text-text-tertiary">Bilinen Oyunlar:</span>
                          {actor.famousPlays.map((play, pIdx) => (
                            <span
                              key={pIdx}
                              className="text-[10px] font-mono px-2 py-0.5 bg-theatre-curtain/5 border border-theatre-curtain/20 text-theatre-curtain rounded-xs"
                            >
                              {play}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="space-y-1 pt-1">
                        {actor.clues.map((clue, cIdx) => (
                          <div key={cIdx} className="text-xs text-text-secondary flex items-start gap-2">
                            <span className="text-[10px] font-mono font-bold text-theatre-gold shrink-0 mt-0.5">
                              İpucu {cIdx + 1}:
                            </span>
                            <span>{clue}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSetActiveActor(actor.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded-xs border transition-colors cursor-pointer ${
                          isTodayActive
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold'
                            : 'bg-layer-02 border-border-subtle text-text-secondary hover:text-amber-600 hover:border-amber-500/30'
                        }`}
                        title="Bu oyuncuyu günün aktif dedektif oyunu yap"
                      >
                        <Star className={`w-3.5 h-3.5 ${isTodayActive ? 'fill-current text-amber-500' : ''}`} />
                        <span>{isTodayActive ? 'Günün Oyuncusu' : 'Günün Oyuncusu Yap'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteActor(actor.id)}
                        className="p-1.5 text-text-tertiary hover:text-red-600 transition-colors cursor-pointer"
                        title="Oyuncuyu Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SUB-TAB 3: GÜNÜN REPLİĞİ ── */}
      {subTab === 'quotes' && (
        <div className="space-y-4">
          {/* Active Quote Notice Banner */}
          {todayQuote && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-sm p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-amber-500 fill-current shrink-0" />
                <div>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[11px] mr-2">
                    Bugünün Aktif Repliği:
                  </span>
                  <strong className="text-text-primary text-sm font-serif">{todayQuote.playTitle}</strong>
                  <span className="text-text-tertiary text-xs ml-2">({todayQuote.playwright}{todayQuote.character ? ` · ${todayQuote.character}` : ''})</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-text-tertiary hidden sm:inline">
                Oyuna giren kullanıcılar bugün bu repliği tahmin eder
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-layer-01 border border-border-subtle p-4 rounded-sm">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-theatre-curtain" />
                <h3 className="font-serif font-bold text-sm text-text-primary">
                  Günün Repliği Soru Havuzu
                </h3>
              </div>
              <p className="text-xs text-text-tertiary mt-0.5">
                Günün aktif repliğini seçin ("Günün Repliği Yap" butonuna tıklayarak) veya yeni replik ekleyin.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddQuote(!showAddQuote)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddQuote ? 'Formu Kapat' : 'Yeni Replik Ekle'}</span>
            </button>
          </div>

          {/* Add Quote Form */}
          {showAddQuote && (
            <form onSubmit={handleAddQuote} className="bg-layer-01 border border-border-subtle p-4 rounded-sm space-y-3">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
                Yeni Replik Ekle
              </h4>
              <div>
                <label className="block text-[11px] font-mono text-text-tertiary mb-1">Replik Metni *</label>
                <textarea
                  value={quoteText}
                  onChange={e => setQuoteText(e.target.value)}
                  placeholder="örn: 'Olmak ya da olmamak, işte bütün mesele bu...'"
                  rows={2}
                  required
                  className="w-full bg-layer-02 border border-border-subtle p-2 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-text-tertiary mb-1">Oyun Adı *</label>
                  <input
                    type="text"
                    value={quotePlayTitle}
                    onChange={e => setQuotePlayTitle(e.target.value)}
                    placeholder="örn: Hamlet"
                    required
                    className="w-full bg-layer-02 border border-border-subtle px-3 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-text-tertiary mb-1">Karakter</label>
                  <input
                    type="text"
                    value={quoteCharacter}
                    onChange={e => setQuoteCharacter(e.target.value)}
                    placeholder="örn: Prens Hamlet"
                    className="w-full bg-layer-02 border border-border-subtle px-3 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-text-tertiary mb-1">Yazar</label>
                  <input
                    type="text"
                    value={quotePlaywright}
                    onChange={e => setQuotePlaywright(e.target.value)}
                    placeholder="örn: William Shakespeare"
                    className="w-full bg-layer-02 border border-border-subtle px-3 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-text-tertiary mb-1">İpucu</label>
                <input
                  type="text"
                  value={quoteHint}
                  onChange={e => setQuoteHint(e.target.value)}
                  placeholder="örn: Danimarka sarayında geçen trajedi"
                  className="w-full bg-layer-02 border border-border-subtle px-3 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddQuote(false)}
                  className="px-3 py-1.5 text-xs font-mono text-text-tertiary hover:text-text-primary cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={quoteSubmitting}
                  className="px-4 py-1.5 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer"
                >
                  {quoteSubmitting ? 'Kaydediliyor...' : 'Repliği Havuza Ekle'}
                </button>
              </div>
            </form>
          )}

          {/* Quotes List */}
          {loading ? (
            <div className="p-8 text-center text-xs font-mono text-text-tertiary">Yükleniyor...</div>
          ) : quotes.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-text-tertiary">Kayıtlı replik yok.</div>
          ) : (
            <div className="border border-border-subtle divide-y divide-border-subtle bg-layer-01 rounded-sm overflow-hidden">
              {quotes.map(q => {
                const isTodayActive = q.id === todayQuote?.id;

                return (
                  <div
                    key={q.id}
                    className={`p-3.5 flex items-start justify-between gap-3 transition-colors ${
                      isTodayActive
                        ? 'bg-amber-500/5 dark:bg-amber-500/10'
                        : 'hover:bg-canvas'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {isTodayActive && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xs">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            Günün Aktif Repliği
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-serif italic text-text-primary">
                        "{q.quote}"
                      </p>
                      <div className="text-[10px] font-mono text-text-tertiary mt-1">
                        <strong>{q.playTitle}</strong> {q.character ? `(${q.character})` : ''} · {q.playwright}
                        {q.hint && <span className="ml-2 text-theatre-gold">· İpucu: {q.hint}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSetActiveQuote(q.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded-xs border transition-colors cursor-pointer ${
                          isTodayActive
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold'
                            : 'bg-layer-02 border-border-subtle text-text-secondary hover:text-amber-600 hover:border-amber-500/30'
                        }`}
                        title="Bu repliği günün aktif oyunu yap"
                      >
                        <Star className={`w-3.5 h-3.5 ${isTodayActive ? 'fill-current text-amber-500' : ''}`} />
                        <span>{isTodayActive ? 'Günün Repliği' : 'Günün Repliği Yap'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteQuote(q.id)}
                        className="p-1.5 text-text-tertiary hover:text-red-600 transition-colors cursor-pointer"
                        title="Repliği Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SUB-TAB 4: SAHNE TRIVIA ── */}
      {subTab === 'trivia' && (
        <div className="space-y-4">
          {/* Active Trivia Notice Banner */}
          {todayTrivia && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-sm p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-amber-500 fill-current shrink-0" />
                <div>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[11px] mr-2">
                    Bugünün 1. Trivia Sorusu:
                  </span>
                  <strong className="text-text-primary text-xs font-sans line-clamp-1">{todayTrivia.question}</strong>
                </div>
              </div>
              <span className="text-[10px] font-mono text-text-tertiary hidden sm:inline">
                Kullanıcılar trivia oyununda ilk olarak bu soruyla başlar
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-layer-01 border border-border-subtle p-4 rounded-sm">
            <div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-theatre-curtain" />
                <h3 className="font-serif font-bold text-sm text-text-primary">
                  Sahne Trivia Soru Havuzu
                </h3>
              </div>
              <p className="text-xs text-text-tertiary mt-0.5">
                Günün öne çıkan trivia sorusunu seçin ("Günün Sorusu Yap" butonu ile) veya yeni soru ekleyin.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddTrivia(!showAddTrivia)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddTrivia ? 'Formu Kapat' : 'Yeni Trivia Sorusu Ekle'}</span>
            </button>
          </div>

          {/* Add Trivia Form */}
          {showAddTrivia && (
            <form onSubmit={handleAddTrivia} className="bg-layer-01 border border-border-subtle p-4 rounded-sm space-y-3">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
                Yeni Trivia Sorusu Ekle
              </h4>
              <div>
                <label className="block text-[11px] font-mono text-text-tertiary mb-1">Soru Metni *</label>
                <textarea
                  value={triviaQuestion}
                  onChange={e => setTriviaQuestion(e.target.value)}
                  placeholder="örn: Batılı anlamda ilk Türk tiyatro oyunu olan 'Şair Evlenmesi' kime aittir?"
                  rows={2}
                  required
                  className="w-full bg-layer-02 border border-border-subtle p-2 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-text-tertiary mb-1">Seçenek A *</label>
                  <input
                    type="text"
                    value={triviaOpt0}
                    onChange={e => setTriviaOpt0(e.target.value)}
                    required
                    className="w-full bg-layer-02 border border-border-subtle px-3 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-text-tertiary mb-1">Seçenek B *</label>
                  <input
                    type="text"
                    value={triviaOpt1}
                    onChange={e => setTriviaOpt1(e.target.value)}
                    required
                    className="w-full bg-layer-02 border border-border-subtle px-3 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-text-tertiary mb-1">Seçenek C</label>
                  <input
                    type="text"
                    value={triviaOpt2}
                    onChange={e => setTriviaOpt2(e.target.value)}
                    className="w-full bg-layer-02 border border-border-subtle px-3 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-text-tertiary mb-1">Seçenek D</label>
                  <input
                    type="text"
                    value={triviaOpt3}
                    onChange={e => setTriviaOpt3(e.target.value)}
                    className="w-full bg-layer-02 border border-border-subtle px-3 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-text-tertiary mb-1">Doğru Seçenek</label>
                  <select
                    value={triviaCorrectIdx}
                    onChange={e => setTriviaCorrectIdx(Number(e.target.value))}
                    className="w-full bg-layer-02 border border-border-subtle px-3 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                  >
                    <option value={0}>Seçenek A</option>
                    <option value={1}>Seçenek B</option>
                    <option value={2}>Seçenek C</option>
                    <option value={3}>Seçenek D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-text-tertiary mb-1">Açıklama / Bilgi Notu</label>
                  <input
                    type="text"
                    value={triviaExplanation}
                    onChange={e => setTriviaExplanation(e.target.value)}
                    placeholder="örn: Şinasi tarafından 1859'da kaleme alınmıştır."
                    className="w-full bg-layer-02 border border-border-subtle px-3 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTrivia(false)}
                  className="px-3 py-1.5 text-xs font-mono text-text-tertiary hover:text-text-primary cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={triviaSubmitting}
                  className="px-4 py-1.5 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer"
                >
                  {triviaSubmitting ? 'Kaydediliyor...' : 'Soruyu Havuza Ekle'}
                </button>
              </div>
            </form>
          )}

          {/* Trivia List */}
          {loading ? (
            <div className="p-8 text-center text-xs font-mono text-text-tertiary">Yükleniyor...</div>
          ) : triviaQuestions.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-text-tertiary">Kayıtlı soru yok.</div>
          ) : (
            <div className="space-y-3">
              {triviaQuestions.map((q, idx) => {
                const isTodayActive = q.id === todayTrivia?.id;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-sm border transition-all flex items-start justify-between gap-4 ${
                      isTodayActive
                        ? 'bg-layer-01 border-amber-500/50 shadow-sm ring-1 ring-amber-500/20'
                        : 'bg-layer-01 border-border-subtle hover:border-theatre-curtain/40'
                    }`}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-theatre-curtain/10 text-theatre-curtain text-[11px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="space-y-1">
                          {isTodayActive && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xs mb-1">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              Günün 1. Trivia Sorusu
                            </span>
                          )}
                          <p className="text-xs font-semibold text-text-primary leading-snug">
                            {q.question}
                          </p>
                        </div>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-2 gap-2 pl-7 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`text-xs px-2.5 py-1 rounded-xs border font-mono ${
                              opt === q.correctAnswer
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold'
                                : 'bg-layer-02 border-border-subtle text-text-secondary'
                            }`}
                          >
                            <span className="mr-1.5 text-text-tertiary">{String.fromCharCode(65 + oIdx)})</span>
                            {opt}
                            {opt === q.correctAnswer && <span className="ml-1 text-[10px]">✓</span>}
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <p className="text-[11px] font-sans text-text-tertiary pl-7 italic">
                          Not: {q.explanation}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSetActiveTrivia(q.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded-xs border transition-colors cursor-pointer ${
                          isTodayActive
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold'
                            : 'bg-layer-02 border-border-subtle text-text-secondary hover:text-amber-600 hover:border-amber-500/30'
                        }`}
                        title="Bu soruyu günün ilk trivia sorusu yap"
                      >
                        <Star className={`w-3.5 h-3.5 ${isTodayActive ? 'fill-current text-amber-500' : ''}`} />
                        <span>{isTodayActive ? 'Günün Sorusu' : 'Günün Sorusu Yap'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTrivia(q.id)}
                        className="p-1.5 text-text-tertiary hover:text-red-600 transition-colors cursor-pointer"
                        title="Soruyu Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SUB-TAB 5: TİYATRO SÖZLÜĞÜ ── */}
      {subTab === 'words' && (
        <div className="space-y-4">
          {/* Active Word Notice Banner */}
          {todayWord && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-sm p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-amber-500 fill-current shrink-0" />
                <div>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[11px] mr-2">
                    Bugünün Aktif Kelimesi:
                  </span>
                  <strong className="text-text-primary text-sm font-mono tracking-wider">{todayWord.word}</strong>
                  {todayWord.category && <span className="text-text-tertiary text-xs ml-2">({todayWord.category})</span>}
                </div>
              </div>
              <span className="text-[10px] font-mono text-text-tertiary hidden sm:inline">
                Oyuna giren kullanıcılar bugün bu terimi tahmin eder
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-layer-01 border border-border-subtle p-4 rounded-sm">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-theatre-curtain" />
                <h3 className="font-serif font-bold text-sm text-text-primary">
                  Tiyatro Sözlüğü (Perde Arkası: Kelime)
                </h3>
              </div>
              <p className="text-xs text-text-tertiary mt-0.5">
                Günün aktif kelimesini seçin ("Günün Kelimesi Yap" butonu ile) veya yeni terim ekleyin.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddWord(!showAddWord)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddWord ? 'Formu Kapat' : 'Yeni Terim Ekle'}</span>
            </button>
          </div>

          {/* Add Word Form */}
          {showAddWord && (
            <form onSubmit={handleAddWord} className="bg-layer-01 border border-border-subtle p-4 rounded-sm space-y-3">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
                Yeni Terim Ekle
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-text-tertiary mb-1">Kelime / Terim *</label>
                  <input
                    type="text"
                    value={wordText}
                    onChange={e => setWordText(e.target.value)}
                    placeholder="örn: TİRAD"
                    required
                    className="w-full bg-layer-02 border border-border-subtle px-3 py-1.5 text-xs text-text-primary uppercase font-mono rounded-sm focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-text-tertiary mb-1">Kategori</label>
                  <input
                    type="text"
                    value={wordCategory}
                    onChange={e => setWordCategory(e.target.value)}
                    placeholder="örn: Sahne & Oyunculuk"
                    className="w-full bg-layer-02 border border-border-subtle px-3 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-text-tertiary mb-1">Tanım *</label>
                <textarea
                  value={wordDefinition}
                  onChange={e => setWordDefinition(e.target.value)}
                  placeholder="örn: Bir tiyatro oyununda oyuncunun tek başına yaptığı uzun ve kesintisiz konuşma."
                  rows={2}
                  required
                  className="w-full bg-layer-02 border border-border-subtle p-2 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-text-tertiary mb-1">İpucu (Opsiyonel)</label>
                <input
                  type="text"
                  value={wordClue}
                  onChange={e => setWordClue(e.target.value)}
                  placeholder="örn: Uzun monolog / tek nefeste söz"
                  className="w-full bg-layer-02 border border-border-subtle px-3 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddWord(false)}
                  className="px-3 py-1.5 text-xs font-mono text-text-tertiary hover:text-text-primary cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={wordSubmitting}
                  className="px-4 py-1.5 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer"
                >
                  {wordSubmitting ? 'Kaydediliyor...' : 'Terimi Havuza Ekle'}
                </button>
              </div>
            </form>
          )}

          {/* Words List */}
          {loading ? (
            <div className="p-8 text-center text-xs font-mono text-text-tertiary">Yükleniyor...</div>
          ) : theatreWords.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-text-tertiary">Kayıtlı terim yok.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {theatreWords.map(item => {
                const isTodayActive = item.id === todayWord?.id;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-sm border transition-all flex items-start justify-between gap-3 ${
                      isTodayActive
                        ? 'bg-layer-01 border-amber-500/50 shadow-sm ring-1 ring-amber-500/20'
                        : 'bg-layer-01 border-border-subtle hover:border-theatre-curtain/40'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-sm tracking-wider text-theatre-curtain bg-theatre-curtain/10 px-2 py-0.5 rounded-xs">
                          {item.word}
                        </span>
                        {isTodayActive && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xs">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            Günün Aktif Kelimesi
                          </span>
                        )}
                        {item.category && (
                          <span className="text-[10px] font-mono text-text-tertiary">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary leading-snug">
                        {item.definition}
                      </p>
                      {item.clue && (
                        <p className="text-[11px] font-mono text-text-tertiary">
                          İpucu: <span className="text-text-secondary">{item.clue}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSetActiveWord(item.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded-xs border transition-colors cursor-pointer ${
                          isTodayActive
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold'
                            : 'bg-layer-02 border-border-subtle text-text-secondary hover:text-amber-600 hover:border-amber-500/30'
                        }`}
                        title="Bu kelimeyi günün aktif kelime oyunu yap"
                      >
                        <Star className={`w-3.5 h-3.5 ${isTodayActive ? 'fill-current text-amber-500' : ''}`} />
                        <span>{isTodayActive ? 'Günün Kelimesi' : 'Günün Kelimesi Yap'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteWord(item.id)}
                        className="p-1.5 text-text-tertiary hover:text-red-600 transition-colors cursor-pointer"
                        title="Terimi Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: CREATE / EDIT PUZZLE GAME CONFIG ── */}
      {isGameModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-canvas border border-border-subtle rounded-sm max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="font-serif font-bold text-base text-text-primary">
                {editingGame ? 'Bulmaca Modülünü Düzenle' : 'Yeni Bulmaca Modülü Ekle'}
              </h3>
              <button
                type="button"
                onClick={() => setIsGameModalOpen(false)}
                className="p-1 text-text-tertiary hover:text-text-primary cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGame} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-text-tertiary mb-1">Başlık *</label>
                  <input
                    type="text"
                    value={gameTitle}
                    onChange={e => setGameTitle(e.target.value)}
                    placeholder="örn: Oyuncu Dedektifi"
                    required
                    className="w-full bg-layer-01 border border-border-subtle px-3 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-text-tertiary mb-1">Alt Başlık</label>
                  <input
                    type="text"
                    value={gameSubtitle}
                    onChange={e => setGameSubtitle(e.target.value)}
                    placeholder="örn: Usta Oyuncuyu Bul"
                    className="w-full bg-layer-01 border border-border-subtle px-3 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-text-tertiary mb-1">Açıklama *</label>
                <textarea
                  value={gameDescription}
                  onChange={e => setGameDescription(e.target.value)}
                  placeholder="Kullanıcıya gösterilecek oyun kuralları ve tanımı..."
                  rows={2}
                  required
                  className="w-full bg-layer-01 border border-border-subtle p-2 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-text-tertiary mb-1">Kategori</label>
                  <select
                    value={gameCategory}
                    onChange={e => setGameCategory(e.target.value as any)}
                    className="w-full bg-layer-01 border border-border-subtle px-2 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                  >
                    <option value="daily">Günlük</option>
                    <option value="trivia">Trivia</option>
                    <option value="visual">Görsel / Oyuncu</option>
                    <option value="word">Kelime</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-text-tertiary mb-1">Durum</label>
                  <select
                    value={gameStatus}
                    onChange={e => setGameStatus(e.target.value as any)}
                    className="w-full bg-layer-01 border border-border-subtle px-2 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                  >
                    <option value="active">Aktif</option>
                    <option value="coming_soon">Yakında</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-text-tertiary mb-1">XP Ödülü</label>
                  <input
                    type="number"
                    value={gameXpReward}
                    onChange={e => setGameXpReward(Number(e.target.value))}
                    min={5}
                    max={100}
                    className="w-full bg-layer-01 border border-border-subtle px-3 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-text-tertiary mb-1">İkon (Emoji)</label>
                  <input
                    type="text"
                    value={gameIcon}
                    onChange={e => setGameIcon(e.target.value)}
                    className="w-full bg-layer-01 border border-border-subtle px-3 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-text-tertiary mb-1">Tahmini Süre</label>
                  <input
                    type="text"
                    value={gameEstimatedTime}
                    onChange={e => setGameEstimatedTime(e.target.value)}
                    placeholder="örn: 2 dk"
                    className="w-full bg-layer-01 border border-border-subtle px-3 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-text-tertiary mb-1">Rozet Metni</label>
                  <input
                    type="text"
                    value={gameBadge}
                    onChange={e => setGameBadge(e.target.value)}
                    placeholder="örn: Yeni, Popüler"
                    className="w-full bg-layer-01 border border-border-subtle px-3 py-1.5 text-xs text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
              </div>

              {/* Is Featured Checkbox */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="gameIsFeatured"
                  checked={gameIsFeatured}
                  onChange={e => setGameIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded-xs border-border-subtle text-theatre-curtain focus:ring-0"
                />
                <label htmlFor="gameIsFeatured" className="text-xs font-mono text-text-primary cursor-pointer select-none">
                  Bu oyunu günün öne çıkan (Spotlight) bulmacası yap
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsGameModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-mono text-text-tertiary hover:text-text-primary cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={gameSubmitting}
                  className="px-4 py-1.5 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer"
                >
                  {gameSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

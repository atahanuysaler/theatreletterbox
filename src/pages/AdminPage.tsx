import React, { useEffect, useState, useCallback } from 'react';
import {
  Shield,
  Plus,
  BookOpen,
  MessageSquare,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  Library,
  Edit2,
  X,
  Puzzle
} from 'lucide-react';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import type { Play, DailyQuote, PlaySubmission, CuratedList, PuzzleGameConfig } from '../types';

// ── Access Denied ────────────────────────────────────────────────────────────
function AccessDenied() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
      <Shield className="w-10 h-10 text-border-strong mx-auto" />
      <h1 className="font-serif font-bold text-2xl text-text-primary">Erişim Yetkisi Gerekli</h1>
      <p className="text-sm text-text-secondary font-mono">Bu sayfaya sadece yönetici rolündeki kullanıcılar erişebilir.</p>
    </div>
  );
}

// ── Submissions Review Section ───────────────────────────────────────────────
function SubmissionsSection({ onPlayApproved }: { onPlayApproved: () => void }) {
  const [submissions, setSubmissions] = useState<PlaySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const all = await storageService.getPlaySubmissions('pending');
      setSubmissions(all);
    } catch {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const handleApprove = async (sub: PlaySubmission) => {
    setActionId(sub.id);
    try {
      await storageService.approvePlaySubmission(sub.id);
      setStatusMsg({ type: 'success', text: `"${sub.title}" başarıyla onaylandı ve kataloğa eklendi.` });
      await loadSubmissions();
      onPlayApproved();
    } catch {
      setStatusMsg({ type: 'error', text: 'Onaylama sırasında hata oluştu.' });
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (sub: PlaySubmission) => {
    if (!window.confirm(`"${sub.title}" önerisi reddedilsin mi?`)) return;
    setActionId(sub.id);
    try {
      await storageService.rejectPlaySubmission(sub.id);
      setStatusMsg({ type: 'success', text: `"${sub.title}" önerisi reddedildi.` });
      await loadSubmissions();
    } catch {
      setStatusMsg({ type: 'error', text: 'Reddetme sırasında hata oluştu.' });
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-theatre-curtain" />
          <h2 className="font-serif font-bold text-base text-text-primary">
            Onay Bekleyen Oyun Önerileri
          </h2>
          <span className="font-mono text-xs text-text-tertiary">
            ({submissions.length} bekleyen)
          </span>
        </div>
        <button
          type="button"
          onClick={loadSubmissions}
          className="text-xs font-mono text-theatre-curtain hover:underline cursor-pointer"
        >
          Yenile
        </button>
      </div>

      {statusMsg && (
        <div className={`p-3 rounded-sm text-xs font-mono flex items-center justify-between gap-2 border ${
          statusMsg.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
          <button type="button" onClick={() => setStatusMsg(null)} className="text-text-tertiary hover:text-text-primary">✕</button>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-xs font-mono text-text-tertiary">Öneriler yükleniyor...</div>
      ) : submissions.length === 0 ? (
        <div className="p-8 bg-layer-01 border border-border-subtle rounded-sm text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto" />
          <div className="font-serif font-semibold text-text-primary text-sm">
            Onay bekleyen oyun önerisi bulunmuyor.
          </div>
          <p className="text-xs text-text-tertiary font-mono">
            Kullanıcılar yeni bir oyun eklediğinde burada listelenecektir.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map(sub => (
            <div
              key={sub.id}
              className="p-4 bg-layer-01 border border-border-subtle hover:border-border-strong transition-colors rounded-sm flex flex-col sm:flex-row items-start gap-4"
            >
              {/* Poster or Icon */}
              {sub.posterUrl ? (
                <img
                  src={sub.posterUrl}
                  alt=""
                  className="w-16 h-22 object-cover rounded-sm border border-border-subtle flex-shrink-0 shadow-xs"
                />
              ) : (
                <div className="w-16 h-22 bg-canvas border border-border-subtle flex items-center justify-center flex-shrink-0 text-text-tertiary rounded-sm">
                  <BookOpen className="w-6 h-6 opacity-40" />
                </div>
              )}

              {/* Main Information */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="font-serif font-bold text-base text-text-primary">
                    {sub.title}
                  </h3>
                  <span className="font-mono text-xs text-theatre-curtain font-semibold">
                    {sub.year}
                  </span>
                  <span className="px-1.5 py-0.5 bg-layer-02 text-text-secondary text-[10px] font-mono rounded-xs">
                    {sub.genre}
                  </span>
                </div>

                <div className="text-xs font-mono text-text-secondary space-y-0.5">
                  <div>
                    <span className="text-text-tertiary">Yazar:</span> <strong>{sub.playwright}</strong>
                    <span className="mx-2 text-border-subtle">·</span>
                    <span className="text-text-tertiary">Yönetmen:</span> <strong>{sub.director}</strong>
                  </div>
                  <div>
                    <span className="text-text-tertiary">Topluluk:</span> <strong>{sub.company}</strong>
                    {sub.duration && (
                      <>
                        <span className="mx-2 text-border-subtle">·</span>
                        <span className="text-text-tertiary">Süre:</span> {sub.duration} dk
                      </>
                    )}
                  </div>
                </div>

                {sub.cast && sub.cast.length > 0 && (
                  <div className="text-xs text-text-secondary font-mono flex flex-wrap gap-1 pt-1">
                    <span className="text-text-tertiary">Kadro:</span>
                    {sub.cast.map((c, i) => (
                      <span key={i} className="bg-canvas border border-border-subtle px-1.5 py-0.2 rounded-xs text-[11px]">
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {sub.synopsis && (
                  <p className="text-xs text-text-secondary font-serif line-clamp-2 pt-1">
                    {sub.synopsis}
                  </p>
                )}

                <div className="text-[10px] text-text-tertiary font-mono pt-1">
                  Öneren: <strong>{sub.submittedBy || 'Anonim'}</strong> · {new Date(sub.createdAt).toLocaleDateString('tr-TR')}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                <button
                  type="button"
                  disabled={actionId === sub.id}
                  onClick={() => handleApprove(sub)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-green-700 hover:bg-green-800 text-white rounded-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Onayla & Ekle</span>
                </button>
                <button
                  type="button"
                  disabled={actionId === sub.id}
                  onClick={() => handleReject(sub)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-canvas hover:bg-layer-02 text-red-600 border border-red-200 rounded-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reddet</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Published Plays Section ──────────────────────────────────────────────────
function PublishedPlaysSection() {
  const [plays, setPlays] = useState<Play[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Play Edit / Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlay, setEditingPlay] = useState<Play | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formOriginalTitle, setFormOriginalTitle] = useState('');
  const [formPlaywright, setFormPlaywright] = useState('');
  const [formDirector, setFormDirector] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formVenue, setFormVenue] = useState('');
  const [formYear, setFormYear] = useState<number>(new Date().getFullYear());
  const [formDuration, setFormDuration] = useState<number>(90);
  const [formHasIntermission, setFormHasIntermission] = useState<boolean>(false);
  const [formGenre, setFormGenre] = useState('Dram');
  const [formPosterUrl, setFormPosterUrl] = useState('');
  const [formCast, setFormCast] = useState('');
  const [formSynopsis, setFormSynopsis] = useState('');
  const [formTags, setFormTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const PAGE_SIZE = 10;

  const loadPlays = useCallback(async () => {
    setLoading(true);
    try {
      const all = await storageService.getPlays();
      setPlays(all);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlays();
  }, [loadPlays]);

  const handleOpenCreate = () => {
    setEditingPlay(null);
    setFormTitle('');
    setFormOriginalTitle('');
    setFormPlaywright('');
    setFormDirector('');
    setFormCompany('');
    setFormVenue('');
    setFormYear(new Date().getFullYear());
    setFormDuration(90);
    setFormHasIntermission(false);
    setFormGenre('Dram');
    setFormPosterUrl('');
    setFormCast('');
    setFormSynopsis('');
    setFormTags('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (play: Play) => {
    setEditingPlay(play);
    setFormTitle(play.title || '');
    setFormOriginalTitle(play.originalTitle || '');
    setFormPlaywright(play.playwright || '');
    setFormDirector(play.director || '');
    setFormCompany(play.company || '');
    setFormVenue(play.venue || '');
    setFormYear(play.year || new Date().getFullYear());
    setFormDuration(play.duration || 90);
    setFormHasIntermission(Boolean(play.hasIntermission));
    setFormGenre(play.genre || 'Dram');
    setFormPosterUrl(play.posterUrl || '');
    setFormCast(Array.isArray(play.cast) ? play.cast.join(', ') : '');
    setFormSynopsis(play.synopsis || '');
    setFormTags(Array.isArray(play.tags) ? play.tags.join(', ') : '');
    setIsModalOpen(true);
  };

  const handleSavePlay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formPlaywright.trim() || !formCompany.trim()) {
      alert('Lütfen zorunlu alanları (Oyun Adı, Yazar, Topluluk) doldurun.');
      return;
    }

    setSaving(true);
    try {
      const castArray = formCast
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const tagsArray = formTags
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      if (editingPlay) {
        // Update existing play
        await storageService.updatePlay(editingPlay.id, {
          title: formTitle.trim(),
          originalTitle: formOriginalTitle.trim() || formTitle.trim(),
          playwright: formPlaywright.trim(),
          director: formDirector.trim(),
          company: formCompany.trim(),
          venue: formVenue.trim() || 'Sahne',
          year: Number(formYear) || new Date().getFullYear(),
          duration: Number(formDuration) || 90,
          hasIntermission: formHasIntermission,
          genre: formGenre.trim() || 'Dram',
          posterUrl: formPosterUrl.trim() || editingPlay.posterUrl,
          cast: castArray,
          synopsis: formSynopsis.trim(),
          tags: tagsArray
        });
        setStatusMsg({ type: 'success', text: `"${formTitle.trim()}" oyunu başarıyla güncellendi.` });
      } else {
        // Create new play
        await storageService.createPlay({
          title: formTitle.trim(),
          originalTitle: formOriginalTitle.trim() || formTitle.trim(),
          playwright: formPlaywright.trim(),
          director: formDirector.trim(),
          company: formCompany.trim(),
          venue: formVenue.trim() || 'Sahne',
          year: Number(formYear) || new Date().getFullYear(),
          duration: Number(formDuration) || 90,
          hasIntermission: formHasIntermission,
          genre: formGenre.trim() || 'Dram',
          posterUrl: formPosterUrl.trim() || 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
          cast: castArray,
          synopsis: formSynopsis.trim(),
          tags: tagsArray
        });
        setStatusMsg({ type: 'success', text: `"${formTitle.trim()}" oyunu kataloğa başarıyla eklendi.` });
      }

      setIsModalOpen(false);
      await loadPlays();
    } catch (err) {
      console.error('[PublishedPlaysSection] Save error:', err);
      setStatusMsg({ type: 'error', text: 'Oyun kaydedilirken bir hata oluştu.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (play: Play) => {
    if (!window.confirm(`"${play.title}" oyununu katalogdan silmek istediğinize emin misiniz?`)) return;
    setDeletingId(play.id);
    try {
      await storageService.deletePlay(play.id);
      setStatusMsg({ type: 'success', text: `"${play.title}" oyunu katalogdan silindi.` });
      await loadPlays();
    } catch {
      setStatusMsg({ type: 'error', text: 'Silme sırasında bir hata oluştu.' });
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = plays.filter(p =>
    p.title.toLocaleLowerCase('tr').includes(search.toLocaleLowerCase('tr')) ||
    p.playwright.toLocaleLowerCase('tr').includes(search.toLocaleLowerCase('tr')) ||
    p.company.toLocaleLowerCase('tr').includes(search.toLocaleLowerCase('tr'))
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedPlays = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Alert message if any */}
      {statusMsg && (
        <div
          className={`p-3 rounded-sm text-xs font-mono flex items-center justify-between ${
            statusMsg.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900'
              : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMsg(null)}
            className="p-1 text-text-tertiary hover:text-text-primary"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-theatre-curtain" />
          <h2 className="font-serif font-bold text-base text-text-primary">
            Katalogdaki Oyunlar
          </h2>
          <span className="font-mono text-xs text-text-tertiary">
            ({plays.length} oyun)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-text-tertiary absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Katalogda ara..."
              className="w-full bg-canvas border border-border-strong pl-8 pr-3 py-1.5 text-xs font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theatre-curtain rounded-sm"
            />
          </div>

          {/* New Play Button */}
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Oyun Ekle</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs font-mono text-text-tertiary">Yükleniyor...</div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-xs font-mono text-text-tertiary">Eşleşen oyun bulunamadı.</div>
      ) : (
        <div className="space-y-3">
          <div className="border border-border-subtle divide-y divide-border-subtle bg-layer-01 rounded-sm overflow-hidden">
            {paginatedPlays.map(play => (
              <div
                key={play.id}
                className="p-3 hover:bg-canvas transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {play.posterUrl ? (
                    <img
                      src={play.posterUrl}
                      alt=""
                      className="w-9 h-12 object-cover rounded-xs border border-border-subtle flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-12 bg-layer-02 border border-border-subtle rounded-xs flex items-center justify-center text-text-tertiary flex-shrink-0 font-mono text-[10px]">
                      Afiş
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-serif font-semibold text-xs sm:text-sm text-text-primary truncate flex items-center gap-2">
                      <span>{play.title}</span>
                      <span className="font-mono text-xs text-text-tertiary font-normal">({play.year})</span>
                      {play.genre && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-layer-02 text-text-secondary border border-border-subtle rounded-xs">
                          {play.genre}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-text-secondary truncate mt-0.5">
                      <span>Yazar: <strong>{play.playwright}</strong></span>
                      {play.director && <span> · Yönetmen: {play.director}</span>}
                      <span> · Topluluk: {play.company}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline text-[11px] font-mono text-theatre-curtain font-semibold">
                    ★ {play.rating?.toFixed(1) ?? '—'}
                  </span>
                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(play)}
                    className="p-1.5 text-text-tertiary hover:text-theatre-curtain transition-colors cursor-pointer rounded-xs hover:bg-layer-02"
                    title="Oyunu Düzenle"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {/* Delete Button */}
                  <button
                    type="button"
                    disabled={deletingId === play.id}
                    onClick={() => handleDelete(play)}
                    className="p-1.5 text-text-tertiary hover:text-red-600 transition-colors disabled:opacity-40 cursor-pointer rounded-xs hover:bg-layer-02"
                    title="Oyunu Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Simple Clean Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border-subtle/60 text-xs font-mono">
              <div className="text-text-tertiary">
                Toplam {filtered.length} oyun · Sayfa <strong className="text-text-primary">{safePage}</strong> / {totalPages}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-canvas hover:bg-layer-01 border border-border-subtle rounded-sm text-text-primary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Önceki</span>
                </button>

                <div className="px-3 py-1.5 bg-layer-01 border border-border-subtle rounded-sm text-text-primary font-semibold select-none">
                  {safePage} / {totalPages}
                </div>

                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-canvas hover:bg-layer-01 border border-border-subtle rounded-sm text-text-primary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <span>Sonraki</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Play Edit & Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-canvas border border-border-strong rounded-md shadow-modal w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-border-subtle flex items-center justify-between bg-layer-01">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-theatre-curtain" />
                <h3 className="font-serif font-bold text-sm sm:text-base text-text-primary">
                  {editingPlay ? `Oyunu Düzenle: ${editingPlay.title}` : 'Yeni Oyun Ekle'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-text-tertiary hover:text-text-primary rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePlay} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-text-secondary uppercase">
                    Oyun Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="Örn. Lüküs Hayat"
                    className="w-full bg-layer-01 border border-border-strong px-3 py-2 text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-text-secondary uppercase">
                    Orijinal Başlık
                  </label>
                  <input
                    type="text"
                    value={formOriginalTitle}
                    onChange={e => setFormOriginalTitle(e.target.value)}
                    placeholder="Varsa orijinal dildeki adı..."
                    className="w-full bg-layer-01 border border-border-strong px-3 py-2 text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-text-secondary uppercase">
                    Yazar *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPlaywright}
                    onChange={e => setFormPlaywright(e.target.value)}
                    placeholder="Örn. Haldun Taner"
                    className="w-full bg-layer-01 border border-border-strong px-3 py-2 text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-text-secondary uppercase">
                    Yönetmen
                  </label>
                  <input
                    type="text"
                    value={formDirector}
                    onChange={e => setFormDirector(e.target.value)}
                    placeholder="Örn. Muhsin Ertuğrul"
                    className="w-full bg-layer-01 border border-border-strong px-3 py-2 text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-text-secondary uppercase">
                    Topluluk / Tiyatro Ekibi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={e => setFormCompany(e.target.value)}
                    placeholder="Örn. Şehir Tiyatroları, Moda Sahnesi..."
                    className="w-full bg-layer-01 border border-border-strong px-3 py-2 text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-text-secondary uppercase">
                    Sahne / Mekân
                  </label>
                  <input
                    type="text"
                    value={formVenue}
                    onChange={e => setFormVenue(e.target.value)}
                    placeholder="Örn. Harbiye Muhsin Ertuğrul Sahnesi"
                    className="w-full bg-layer-01 border border-border-strong px-3 py-2 text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-text-secondary uppercase">
                    Prömiyer Yılı
                  </label>
                  <input
                    type="number"
                    value={formYear}
                    onChange={e => setFormYear(Number(e.target.value))}
                    className="w-full bg-layer-01 border border-border-strong px-3 py-2 text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-text-secondary uppercase">
                    Süre (Dk)
                  </label>
                  <input
                    type="number"
                    value={formDuration}
                    onChange={e => setFormDuration(Number(e.target.value))}
                    className="w-full bg-layer-01 border border-border-strong px-3 py-2 text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-text-secondary uppercase">
                    Perde Durumu
                  </label>
                  <select
                    value={formHasIntermission ? 'true' : 'false'}
                    onChange={e => setFormHasIntermission(e.target.value === 'true')}
                    className="w-full bg-layer-01 border border-border-strong px-3 py-2 text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain"
                  >
                    <option value="false">Tek Perde</option>
                    <option value="true">2 Perde (Aralı)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-text-secondary uppercase">
                    Tür
                  </label>
                  <input
                    type="text"
                    value={formGenre}
                    onChange={e => setFormGenre(e.target.value)}
                    placeholder="Örn. Dram, Komedi, Müzikal, Absürt..."
                    className="w-full bg-layer-01 border border-border-strong px-3 py-2 text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-text-secondary uppercase">
                    Afiş Görsel URL'si
                  </label>
                  <input
                    type="url"
                    value={formPosterUrl}
                    onChange={e => setFormPosterUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-layer-01 border border-border-strong px-3 py-2 text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
              </div>

              {/* Poster Preview if valid URL */}
              {formPosterUrl && (
                <div className="p-2 bg-layer-01 border border-border-subtle rounded-sm flex items-center gap-3">
                  <img
                    src={formPosterUrl}
                    alt="Afiş Önizleme"
                    className="w-12 h-16 object-cover rounded-xs border border-border-subtle"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="text-[11px] text-text-secondary">
                    <span className="font-semibold text-text-primary">Afiş Önizleme:</span> Görsel bağlantısı geçerli.
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-text-secondary uppercase">
                  Oyuncu Kadrosu (Virgülle ayırarak giriniz)
                </label>
                <input
                  type="text"
                  value={formCast}
                  onChange={e => setFormCast(e.target.value)}
                  placeholder="Örn. Haluk Bilginer, Zerrin Tekindor, Şener Şen..."
                  className="w-full bg-layer-01 border border-border-strong px-3 py-2 text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-text-secondary uppercase">
                  Oyun Özeti & Konusu
                </label>
                <textarea
                  rows={4}
                  value={formSynopsis}
                  onChange={e => setFormSynopsis(e.target.value)}
                  placeholder="Oyunun konusu ve sahneleme notları..."
                  className="w-full bg-layer-01 border border-border-strong px-3 py-2 text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain resize-none font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-text-secondary uppercase">
                  Etiketler (Virgülle ayırarak giriniz)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={e => setFormTags(e.target.value)}
                  placeholder="Örn. Klasik, Ödüllü, Tek Kişilik, Kadıköy..."
                  className="w-full bg-layer-01 border border-border-strong px-3 py-2 text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border-subtle bg-canvas hover:bg-layer-01 text-text-secondary rounded-sm font-semibold transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white rounded-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {saving ? 'Kaydediliyor...' : editingPlay ? 'Değişiklikleri Kaydet' : 'Oyunu Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Puzzles Management Section ───────────────────────────────────────────────
function PuzzlesManagementSection() {
  const [subTab, setSubTab] = useState<'games' | 'quotes'>('games');
  const [games, setGames] = useState<PuzzleGameConfig[]>([]);
  const [quotes, setQuotes] = useState<DailyQuote[]>([]);
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
  const [gameSubmitting, setGameSubmitting] = useState(false);

  // Quote Add Form State
  const [showAddQuote, setShowAddQuote] = useState(false);
  const [quoteText, setQuoteText] = useState('');
  const [quotePlayTitle, setQuotePlayTitle] = useState('');
  const [quoteCharacter, setQuoteCharacter] = useState('');
  const [quotePlaywright, setQuotePlaywright] = useState('');
  const [quoteHint, setQuoteHint] = useState('');
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [gList, qList] = await Promise.all([
        storageService.getPuzzleGames(),
        storageService.getQuotes()
      ]);
      setGames(gList);
      setQuotes(qList);
    } catch {
      setGames([]);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
          estimatedTime: gameEstimatedTime.trim() || '2 dk'
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
          estimatedTime: gameEstimatedTime.trim() || '2 dk'
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

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <Puzzle className="w-4 h-4 text-theatre-curtain" />
            <h2 className="font-serif font-bold text-base text-text-primary">
              Bulmaca & Oyun Yönetimi
            </h2>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Sitede sergilenen tiyatro bulmaca modüllerini ve Günün Repliği soru havuzunu düzenleyin.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="inline-flex items-center bg-layer-01 border border-border-subtle p-0.5 rounded-sm self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSubTab('games')}
            className={`px-3 py-1.5 text-xs font-mono rounded-xs transition-colors cursor-pointer ${
              subTab === 'games'
                ? 'bg-theatre-curtain text-white font-semibold shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Bulmaca Modülleri ({games.length})
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
            Replik Havuzu ({quotes.length})
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

      {/* ── SUB-TAB 1: PUZZLE GAMES ── */}
      {subTab === 'games' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-text-tertiary">
              Tüm oyunlar sitedeki /bulmacalar sayfasında listelenir.
            </span>
            <button
              type="button"
              onClick={handleOpenGameCreate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Bulmaca Ekle</span>
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs font-mono text-text-tertiary">Yükleniyor...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {games.map(game => {
                const isActive = game.status === 'active';

                return (
                  <div
                    key={game.id}
                    className={`border rounded-sm p-4 flex flex-col justify-between space-y-3 transition-colors ${
                      isActive
                        ? 'bg-layer-01 border-border-subtle shadow-xs'
                        : 'bg-layer-01/60 border-border-subtle/70 opacity-90'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{game.icon}</span>
                          <div>
                            <h3 className="font-serif font-bold text-base text-text-primary leading-tight">
                              {game.title}
                            </h3>
                            <span className="text-xs text-text-tertiary font-sans">
                              {game.subtitle}
                            </span>
                          </div>
                        </div>

                        {/* Status badge */}
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-layer-02 text-text-tertiary border border-border-subtle'
                          }`}
                        >
                          {isActive ? 'Aktif' : 'Yakında'}
                        </span>
                      </div>

                      <p className="text-xs text-text-secondary line-clamp-2 mt-1">
                        {game.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border-subtle/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-mono text-text-tertiary text-[11px]">
                        <span className="text-theatre-curtain font-bold">+{game.xpReward} XP</span>
                        <span>·</span>
                        <span>{game.estimatedTime}</span>
                        <span>·</span>
                        <span className="capitalize">{game.category}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Quick Toggle Status */}
                        <button
                          type="button"
                          onClick={() => handleToggleGameStatus(game)}
                          className={`px-2 py-1 text-[11px] font-mono rounded-sm border transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-layer-02 text-text-secondary hover:text-amber-600 border-border-subtle'
                              : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/30 font-semibold'
                          }`}
                          title={isActive ? 'Hazırlanıyor yap' : 'Aktif yap'}
                        >
                          {isActive ? 'Pasife Al' : 'Aktif Et'}
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenGameEdit(game)}
                          className="p-1.5 text-text-secondary hover:text-theatre-curtain hover:bg-layer-02 rounded transition-colors cursor-pointer"
                          title="Bulmacayı Düzenle"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteGame(game)}
                          className="p-1.5 text-text-secondary hover:text-red-600 hover:bg-layer-02 rounded transition-colors cursor-pointer"
                          title="Bulmacayı Sil"
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

          {/* Puzzle Game Edit/Create Modal */}
          {isGameModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-xs">
              <div className="bg-canvas border border-border-strong rounded-md shadow-modal w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
                <div className="px-5 py-3.5 border-b border-border-subtle flex items-center justify-between bg-layer-01">
                  <div className="flex items-center gap-2">
                    <Puzzle className="w-4 h-4 text-theatre-curtain" />
                    <h3 className="font-serif font-bold text-sm sm:text-base text-text-primary">
                      {editingGame ? `Bulmacayı Düzenle: ${editingGame.title}` : 'Yeni Bulmaca Modülü'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsGameModalOpen(false)}
                    className="p-1 text-text-tertiary hover:text-text-primary rounded cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveGame} className="flex-1 overflow-y-auto p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                        Bulmaca Başlığı *
                      </label>
                      <input
                        type="text"
                        required
                        value={gameTitle}
                        onChange={e => setGameTitle(e.target.value)}
                        placeholder="Örn. Afiş Dedektifi"
                        className="w-full bg-layer-01 border border-border-strong px-3 py-2 text-xs font-mono text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                        İkon (Emoji)
                      </label>
                      <input
                        type="text"
                        value={gameIcon}
                        onChange={e => setGameIcon(e.target.value)}
                        placeholder="🎭, 🖼️, 💡..."
                        className="w-full bg-layer-01 border border-border-strong px-3 py-2 text-xs font-mono text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain text-center text-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                        Alt Başlık
                      </label>
                      <input
                        type="text"
                        value={gameSubtitle}
                        onChange={e => setGameSubtitle(e.target.value)}
                        placeholder="Örn. Görsel Sahne Tahmini"
                        className="w-full bg-layer-01 border border-border-strong px-3 py-2 text-xs font-mono text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                        Rozet Metni (Badge)
                      </label>
                      <input
                        type="text"
                        value={gameBadge}
                        onChange={e => setGameBadge(e.target.value)}
                        placeholder="Örn. Her Gün Yeni, Yakında"
                        className="w-full bg-layer-01 border border-border-strong px-3 py-2 text-xs font-mono text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                      Açıklama *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={gameDescription}
                      onChange={e => setGameDescription(e.target.value)}
                      placeholder="Bulmacanın oynanış şekli ve amacı..."
                      className="w-full bg-layer-01 border border-border-strong px-3 py-2 text-xs font-sans text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                        Durum
                      </label>
                      <select
                        value={gameStatus}
                        onChange={e => setGameStatus(e.target.value as 'active' | 'coming_soon')}
                        className="w-full bg-layer-01 border border-border-strong px-2.5 py-2 text-xs font-mono text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain cursor-pointer"
                      >
                        <option value="active">Aktif (Oynanabilir)</option>
                        <option value="coming_soon">Çok Yakında (Kilitli)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                        Kategori
                      </label>
                      <select
                        value={gameCategory}
                        onChange={e => setGameCategory(e.target.value as any)}
                        className="w-full bg-layer-01 border border-border-strong px-2.5 py-2 text-xs font-mono text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain cursor-pointer"
                      >
                        <option value="daily">Günlük (Daily)</option>
                        <option value="trivia">Test (Trivia)</option>
                        <option value="visual">Görsel (Visual)</option>
                        <option value="word">Kelime (Word)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                        XP Ödülü
                      </label>
                      <input
                        type="number"
                        min={5}
                        max={100}
                        value={gameXpReward}
                        onChange={e => setGameXpReward(Number(e.target.value))}
                        className="w-full bg-layer-01 border border-border-strong px-3 py-2 text-xs font-mono text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                        Tahmini Süre
                      </label>
                      <input
                        type="text"
                        value={gameEstimatedTime}
                        onChange={e => setGameEstimatedTime(e.target.value)}
                        placeholder="2 dk"
                        className="w-full bg-layer-01 border border-border-strong px-3 py-2 text-xs font-mono text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
                    <button
                      type="button"
                      onClick={() => setIsGameModalOpen(false)}
                      className="px-4 py-2 text-xs font-mono border border-border-subtle hover:bg-layer-01 text-text-secondary rounded-xs cursor-pointer"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={gameSubmitting}
                      className="px-5 py-2 text-xs font-semibold bg-theatre-curtain hover:bg-theatre-curtain-hover text-white rounded-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {gameSubmitting ? 'Kaydediliyor...' : editingGame ? 'Güncelle' : 'Bulmaca Ekle'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SUB-TAB 2: QUOTES POOL ── */}
      {subTab === 'quotes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <span className="text-xs font-mono text-text-tertiary">
              "Günün Repliği" bulmacasında günlere göre gösterilen replik havuzu ({quotes.length} replik).
            </span>
            <button
              type="button"
              onClick={() => setShowAddQuote(!showAddQuote)}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-layer-01 hover:bg-layer-02 border border-border-subtle text-text-primary rounded-sm transition-colors cursor-pointer"
            >
              {showAddQuote ? <ChevronUp className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{showAddQuote ? 'Kapat' : 'Yeni Replik Ekle'}</span>
            </button>
          </div>

          {showAddQuote && (
            <form onSubmit={handleAddQuote} className="p-4 bg-layer-01 border border-border-subtle space-y-3 rounded-sm">
              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-text-secondary uppercase">Replik Metni *</label>
                <textarea
                  rows={2}
                  required
                  value={quoteText}
                  onChange={e => setQuoteText(e.target.value)}
                  placeholder="Replik metnini yazın..."
                  className="w-full bg-canvas border border-border-strong p-2 text-xs font-serif text-text-primary focus:outline-none focus:border-theatre-curtain resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-semibold text-text-secondary uppercase">Oyun Adı *</label>
                  <input
                    type="text"
                    required
                    value={quotePlayTitle}
                    onChange={e => setQuotePlayTitle(e.target.value)}
                    placeholder="Örn. Keşanlı Ali Destanı"
                    className="w-full bg-canvas border border-border-strong px-2.5 py-1.5 text-xs font-mono text-text-primary focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono font-semibold text-text-secondary uppercase">Karakter</label>
                  <input
                    type="text"
                    value={quoteCharacter}
                    onChange={e => setQuoteCharacter(e.target.value)}
                    placeholder="Örn. Zilha"
                    className="w-full bg-canvas border border-border-strong px-2.5 py-1.5 text-xs font-mono text-text-primary focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono font-semibold text-text-secondary uppercase">Yazar</label>
                  <input
                    type="text"
                    value={quotePlaywright}
                    onChange={e => setQuotePlaywright(e.target.value)}
                    placeholder="Örn. Haldun Taner"
                    className="w-full bg-canvas border border-border-strong px-2.5 py-1.5 text-xs font-mono text-text-primary focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono font-semibold text-text-secondary uppercase">İpucu</label>
                  <input
                    type="text"
                    value={quoteHint}
                    onChange={e => setQuoteHint(e.target.value)}
                    placeholder="Bulmaca için ipucu..."
                    className="w-full bg-canvas border border-border-strong px-2.5 py-1.5 text-xs font-mono text-text-primary focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={quoteSubmitting}
                className="w-full bg-theatre-curtain text-white py-2 text-xs font-semibold hover:bg-theatre-curtain-hover transition-colors rounded-sm cursor-pointer"
              >
                {quoteSubmitting ? 'Ekleniyor...' : 'Repliği Kaydet'}
              </button>
            </form>
          )}

          {loading ? (
            <div className="p-8 text-center text-xs font-mono text-text-tertiary">Yükleniyor...</div>
          ) : quotes.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-text-tertiary">Kayıtlı replik yok.</div>
          ) : (
            <div className="border border-border-subtle divide-y divide-border-subtle bg-layer-01 rounded-sm overflow-hidden">
              {quotes.map(q => (
                <div key={q.id} className="p-3 flex items-start justify-between gap-3 hover:bg-canvas transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs font-serif italic text-text-primary">
                      "{q.quote}"
                    </p>
                    <div className="text-[10px] font-mono text-text-tertiary mt-1">
                      <strong>{q.playTitle}</strong> {q.character ? `(${q.character})` : ''} · {q.playwright}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuote(q.id)}
                    className="p-1.5 text-text-tertiary hover:text-red-600 transition-colors cursor-pointer shrink-0"
                    title="Repliği Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Curated Lists Section ────────────────────────────────────────────────────
function CuratedListsSection() {
  const [lists, setLists] = useState<CuratedList[]>([]);
  const [plays, setPlays] = useState<Play[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<CuratedList | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [curator, setCurator] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [selectedPlayIds, setSelectedPlayIds] = useState<string[]>([]);
  const [playSearchQuery, setPlaySearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cLists, allPlays] = await Promise.all([
        storageService.getCuratedLists(),
        storageService.getPlays()
      ]);
      setLists(cLists);
      setPlays(allPlays);
    } catch {
      setLists([]);
      setPlays([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingList(null);
    setTitle('');
    setCategory('Sezon Seçkisi');
    setCurator('Tiyatronot Editör Masası');
    setDescription('');
    setCoverUrl('');
    setSelectedPlayIds([]);
    setPlaySearchQuery('');
    setStatusMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (list: CuratedList) => {
    setEditingList(list);
    setTitle(list.title);
    setCategory(list.category || 'Sezon Seçkisi');
    setCurator(list.curator || 'Tiyatronot Editör Masası');
    setDescription(list.description || '');
    setCoverUrl(list.coverUrl || '');
    setSelectedPlayIds(list.playIds || []);
    setPlaySearchQuery('');
    setStatusMsg(null);
    setIsModalOpen(true);
  };

  const handleTogglePlay = (playId: string) => {
    setSelectedPlayIds(prev =>
      prev.includes(playId) ? prev.filter(id => id !== playId) : [...prev, playId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setStatusMsg({ type: 'error', text: 'Başlık ve açıklama alanları zorunludur.' });
      return;
    }
    if (selectedPlayIds.length === 0) {
      setStatusMsg({ type: 'error', text: 'Lütfen listeye en az bir oyun ekleyin.' });
      return;
    }

    setSubmitting(true);
    setStatusMsg(null);
    try {
      if (editingList) {
        await storageService.updateCuratedList(editingList.id, {
          title: title.trim(),
          category: category.trim(),
          curator: curator.trim(),
          description: description.trim(),
          coverUrl: coverUrl.trim() || undefined,
          playIds: selectedPlayIds
        });
        setStatusMsg({ type: 'success', text: `"${title}" listesi başarıyla güncellendi.` });
      } else {
        await storageService.createCuratedList({
          title: title.trim(),
          category: category.trim(),
          curator: curator.trim(),
          description: description.trim(),
          coverUrl: coverUrl.trim() || undefined,
          playIds: selectedPlayIds
        });
        setStatusMsg({ type: 'success', text: `"${title}" listesi başarıyla oluşturuldu.` });
      }
      setIsModalOpen(false);
      await loadData();
    } catch {
      setStatusMsg({ type: 'error', text: 'Liste kaydedilirken hata oluştu.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteList = async (list: CuratedList) => {
    if (!window.confirm(`"${list.title}" listesini silmek istediğinizden emin misiniz?`)) return;
    try {
      await storageService.deleteCuratedList(list.id);
      setStatusMsg({ type: 'success', text: `"${list.title}" listesi silindi.` });
      await loadData();
    } catch {
      setStatusMsg({ type: 'error', text: 'Liste silinirken hata oluştu.' });
    }
  };

  const filteredPlays = plays.filter(p =>
    p.title.toLowerCase().includes(playSearchQuery.toLowerCase()) ||
    p.playwright.toLowerCase().includes(playSearchQuery.toLowerCase()) ||
    p.company.toLowerCase().includes(playSearchQuery.toLowerCase())
  );

  const selectedPlaysObjects = plays.filter(p => selectedPlayIds.includes(p.id));

  return (
    <div className="space-y-6">
      {/* Header & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <Library className="w-4 h-4 text-theatre-curtain" />
            <h2 className="font-serif font-bold text-base text-text-primary">
              Küratörlü Listeler
            </h2>
            <span className="font-mono text-xs text-text-tertiary">
              ({lists.length} liste)
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Kullanıcıların keşfedebileceği tematik tiyatro seçkilerini ve oyun listelerini yönetin.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Yeni Liste Ekle</span>
        </button>
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

      {/* Lists Grid */}
      {loading ? (
        <div className="p-8 text-center text-xs font-mono text-text-tertiary">Yükleniyor...</div>
      ) : lists.length === 0 ? (
        <div className="p-8 text-center text-xs font-mono text-text-tertiary bg-layer-01 border border-border-subtle rounded-sm">
          Henüz küratörlü liste oluşturulmamış. "Yeni Liste Ekle" butonuna tıklayarak ilk listenizi oluşturun.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lists.map(list => {
            const listPlays = plays.filter(p => list.playIds.includes(p.id));

            return (
              <div
                key={list.id}
                className="bg-layer-01 border border-border-subtle hover:border-border-strong rounded-sm p-4 flex flex-col justify-between space-y-3 transition-colors shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-theatre-curtain font-semibold bg-theatre-curtain/10 px-2 py-0.5 rounded-sm">
                      {list.category || 'Seçki'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(list)}
                        className="p-1.5 text-text-secondary hover:text-theatre-curtain hover:bg-layer-02 rounded transition-colors cursor-pointer"
                        title="Listeyi Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteList(list)}
                        className="p-1.5 text-text-secondary hover:text-red-600 hover:bg-layer-02 rounded transition-colors cursor-pointer"
                        title="Listeyi Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-serif font-bold text-base text-text-primary leading-snug">
                    {list.title}
                  </h3>
                  <p className="text-xs text-text-secondary line-clamp-2 mt-1 font-sans">
                    {list.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-border-subtle/60 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-text-tertiary">
                    <span>{list.curator || 'Tiyatronot'}</span>
                    <span className="font-semibold text-text-secondary">{list.playIds.length} Oyun</span>
                  </div>

                  {/* Play Pills */}
                  <div className="flex flex-wrap gap-1">
                    {listPlays.slice(0, 4).map(p => (
                      <span key={p.id} className="text-[10px] font-mono bg-canvas border border-border-subtle px-1.5 py-0.5 rounded-xs text-text-secondary truncate max-w-[140px]">
                        {p.title}
                      </span>
                    ))}
                    {listPlays.length > 4 && (
                      <span className="text-[10px] font-mono text-text-tertiary px-1 py-0.5">
                        +{listPlays.length - 4} daha
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-xs">
          <div className="bg-canvas border border-border-strong rounded-md shadow-modal w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-border-subtle flex items-center justify-between bg-layer-01">
              <div className="flex items-center gap-2">
                <Library className="w-4 h-4 text-theatre-curtain" />
                <h3 className="font-serif font-bold text-sm sm:text-base text-text-primary">
                  {editingList ? 'Listeyi Düzenle' : 'Yeni Küratörlü Liste'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-text-tertiary hover:text-text-primary rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                  Liste Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Örn. Kadıköy Sahnelerinde Bu Sezon"
                  className="w-full bg-layer-01 border border-border-strong px-3 py-2 text-xs font-mono text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                    Kategori
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="Örn. Bölge & Mekân, Performans, Klasik..."
                    className="w-full bg-layer-01 border border-border-strong px-3 py-2 text-xs font-mono text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain"
                  />
                  <div className="flex flex-wrap gap-1 pt-1">
                    {['Bölge & Mekân', 'Performans', 'Yerli Metin', 'Dünya Klasiği', 'Sezon Seçkisi'].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className="text-[9px] font-mono px-1.5 py-0.5 bg-layer-02 hover:bg-theatre-curtain/10 hover:text-theatre-curtain rounded-xs text-text-tertiary cursor-pointer transition-colors"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                    Küratör / Hazırlayan
                  </label>
                  <input
                    type="text"
                    value={curator}
                    onChange={e => setCurator(e.target.value)}
                    placeholder="Örn. Tiyatronot Editör Masası"
                    className="w-full bg-layer-01 border border-border-strong px-3 py-2 text-xs font-mono text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                  Açıklama *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Bu seçkinin teması ve izleyiciye vaadi hakkında kısa bir tanıtım..."
                  className="w-full bg-layer-01 border border-border-strong px-3 py-2 text-xs font-sans text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain resize-none"
                />
              </div>

              {/* Play Selection Section */}
              <div className="space-y-2 pt-2 border-t border-border-subtle">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                    Seçilen Oyunlar ({selectedPlayIds.length})
                  </label>
                  <span className="text-[11px] font-mono text-text-tertiary">
                    Listeden tıklayarak ekleyin / çıkarın
                  </span>
                </div>

                {/* Selected Plays Tag Chips */}
                {selectedPlaysObjects.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-layer-01 border border-border-subtle rounded-xs max-h-24 overflow-y-auto">
                    {selectedPlaysObjects.map(play => (
                      <span
                        key={play.id}
                        className="inline-flex items-center gap-1 bg-canvas border border-theatre-curtain/30 text-text-primary px-2 py-0.5 rounded-xs text-[11px] font-mono shadow-2xs"
                      >
                        <span>{play.title}</span>
                        <button
                          type="button"
                          onClick={() => handleTogglePlay(play.id)}
                          className="text-text-tertiary hover:text-red-500 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-text-tertiary font-mono italic">
                    Henüz hiçbir oyun seçilmedi. Aşağıdaki listeden seçin.
                  </p>
                )}

                {/* Search Bar for Plays */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                  <input
                    type="text"
                    value={playSearchQuery}
                    onChange={e => setPlaySearchQuery(e.target.value)}
                    placeholder="Oyun ara (ad, yazar veya tiyatro ekibi)..."
                    className="w-full bg-layer-01 border border-border-strong pl-8 pr-3 py-1.5 text-xs font-mono text-text-primary rounded-xs focus:outline-none focus:border-theatre-curtain"
                  />
                </div>

                {/* Scrollable Plays Checklist */}
                <div className="border border-border-subtle divide-y divide-border-subtle rounded-xs max-h-48 overflow-y-auto bg-canvas">
                  {filteredPlays.map(play => {
                    const isSelected = selectedPlayIds.includes(play.id);

                    return (
                      <label
                        key={play.id}
                        className={`flex items-center justify-between p-2.5 hover:bg-layer-01 cursor-pointer text-xs transition-colors ${
                          isSelected ? 'bg-theatre-curtain/5' : ''
                        }`}
                      >
                        <div className="min-w-0 pr-3">
                          <div className="font-semibold text-text-primary truncate">
                            {play.title}
                          </div>
                          <div className="text-[10px] font-mono text-text-tertiary truncate">
                            {play.playwright} · {play.company}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleTogglePlay(play.id)}
                          className="accent-theatre-curtain w-4 h-4 cursor-pointer"
                        />
                      </label>
                    );
                  })}
                  {filteredPlays.length === 0 && (
                    <div className="p-4 text-center text-xs font-mono text-text-tertiary">
                      Eşleşen oyun bulunamadı.
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono border border-border-subtle hover:bg-layer-01 text-text-secondary rounded-xs cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold bg-theatre-curtain hover:bg-theatre-curtain-hover text-white rounded-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Kaydediliyor...' : editingList ? 'Güncellemeleri Kaydet' : 'Listeyi Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Overhauled Simple Admin Page ─────────────────────────────────────────────
export const AdminPage: React.FC = () => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'submissions' | 'plays' | 'lists' | 'puzzles'>('submissions');
  const [pendingCount, setPendingCount] = useState(0);

  const fetchPendingCount = useCallback(async () => {
    try {
      const pending = await storageService.getPlaySubmissions('pending');
      setPendingCount(pending.length);
    } catch {
      setPendingCount(0);
    }
  }, []);

  useEffect(() => {
    if (role === 'admin') {
      fetchPendingCount();
    }
  }, [role, fetchPendingCount]);

  if (role !== 'admin') {
    return <AccessDenied />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-1.5 text-theatre-curtain text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Yönetici Konsolu</span>
          </div>
          <h1 className="font-serif font-bold text-2xl text-text-primary tracking-tight">
            Tiyatronot Yönetim Paneli
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-layer-01 border border-border-subtle px-3 py-1.5 rounded-sm">
          <div className="w-6 h-6 rounded-xs bg-theatre-curtain text-white text-[10px] font-bold flex items-center justify-center font-mono">
            {user?.displayName?.slice(0, 2).toUpperCase() || 'AD'}
          </div>
          <div className="text-xs font-mono">
            <span className="font-semibold text-text-primary">{user?.displayName}</span>
            <span className="text-theatre-curtain ml-1.5 font-bold">(Admin)</span>
          </div>
        </div>
      </div>

      {/* Simplified Tabs */}
      <div className="flex items-center gap-2 border-b border-border-subtle overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'submissions'
              ? 'border-theatre-curtain text-theatre-curtain'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Onay Bekleyenler</span>
          {pendingCount > 0 && (
            <span className="bg-theatre-curtain text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('plays')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'plays'
              ? 'border-theatre-curtain text-theatre-curtain'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Katalogdaki Oyunlar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('lists')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'lists'
              ? 'border-theatre-curtain text-theatre-curtain'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Library className="w-3.5 h-3.5" />
          <span>Küratörlü Listeler</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('puzzles')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'puzzles'
              ? 'border-theatre-curtain text-theatre-curtain'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Puzzle className="w-3.5 h-3.5" />
          <span>Bulmacalar</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'submissions' && (
          <SubmissionsSection onPlayApproved={fetchPendingCount} />
        )}
        {activeTab === 'plays' && (
          <PublishedPlaysSection />
        )}
        {activeTab === 'lists' && (
          <CuratedListsSection />
        )}
        {activeTab === 'puzzles' && (
          <PuzzlesManagementSection />
        )}
      </div>
    </div>
  );
};

export default AdminPage;

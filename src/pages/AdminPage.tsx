import React, { useEffect, useState, useCallback } from 'react';
import { Shield, RotateCcw, Plus, BookOpen, MessageSquare, Trash2, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, Edit2 } from 'lucide-react';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import type { Play, DailyQuote } from '../types';

// ── Access Denied ────────────────────────────────────────────────────────────
function AccessDenied() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
      <Shield className="w-10 h-10 text-border-strong mx-auto" />
      <h1 className="font-serif font-bold text-2xl text-text-primary">Erişim Reddedildi</h1>
      <p className="text-sm text-text-secondary">Bu sayfaya yalnızca yöneticiler erişebilir.</p>
    </div>
  );
}

// ── Empty Form helpers ───────────────────────────────────────────────────────
const emptyPlay = (): Omit<Play, 'id' | 'rating' | 'reviewCount'> => ({
  title: '', originalTitle: '', playwright: '', director: '', cast: [],
  company: '', venue: '', synopsis: '', duration: 90, hasIntermission: false,
  year: new Date().getFullYear(), genre: '', posterUrl: '', tags: [],
});

const emptyQuote = (): Omit<DailyQuote, 'id'> => ({
  quote: '', playTitle: '', character: '', playwright: '', hint: '',
});

// ── Field helper ─────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-mono font-semibold text-text-secondary uppercase">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full border border-border-strong bg-canvas px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theatre-curtain transition-colors';

// ── Plays Section ────────────────────────────────────────────────────────────
function PlaysSection() {
  const [plays, setPlays] = useState<Play[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayId, setEditingPlayId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyPlay());
  const [castRaw, setCastRaw] = useState('');
  const [tagsRaw, setTagsRaw] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setPlays(await storageService.getPlays());
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const handleStartEdit = (play: Play) => {
    setEditingPlayId(play.id);
    setForm({
      title: play.title,
      originalTitle: play.originalTitle || '',
      playwright: play.playwright,
      director: play.director || '',
      cast: play.cast || [],
      company: play.company || '',
      venue: play.venue || '',
      synopsis: play.synopsis || '',
      duration: play.duration || 90,
      hasIntermission: Boolean(play.hasIntermission),
      year: play.year || new Date().getFullYear(),
      genre: Array.isArray(play.genre) ? play.genre.join(', ') : (play.genre || ''),
      posterUrl: play.posterUrl || '',
      tags: play.tags || [],
    });
    setCastRaw((play.cast || []).join(', '));
    setTagsRaw((play.tags || []).join(', '));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setEditingPlayId(null);
    setForm(emptyPlay());
    setCastRaw('');
    setTagsRaw('');
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.playwright.trim()) {
      setStatus({ type: 'error', msg: 'Başlık ve yazar zorunlu.' });
      return;
    }
    setSubmitting(true);
    try {
      const playPayload = {
        ...form,
        cast: castRaw.split(',').map(s => s.trim()).filter(Boolean),
        tags: tagsRaw.split(',').map(s => s.trim()).filter(Boolean),
      };

      if (editingPlayId) {
        await storageService.updatePlay(editingPlayId, playPayload);
        setStatus({ type: 'success', msg: `"${form.title}" güncellendi.` });
      } else {
        await storageService.createPlay(playPayload);
        setStatus({ type: 'success', msg: `"${form.title}" eklendi.` });
      }

      handleCancelForm();
      reload();
    } catch {
      setStatus({ type: 'error', msg: editingPlayId ? 'Oyun güncellenirken hata oluştu.' : 'Oyun eklenirken hata oluştu.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (play: Play) => {
    if (!window.confirm(`"${play.title}" silinsin mi?`)) return;
    setDeletingId(play.id);
    try {
      await storageService.deletePlay(play.id);
      if (editingPlayId === play.id) {
        handleCancelForm();
      }
      reload();
    } catch {
      setStatus({ type: 'error', msg: 'Silme sırasında hata oluştu.' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-sm text-text-primary">
          <BookOpen className="w-4 h-4 text-theatre-curtain" />
          Oyun Yönetimi
          <span className="font-mono text-text-tertiary text-xs">({plays.length} oyun)</span>
        </div>
        <button
          type="button"
          onClick={() => {
            if (showForm) {
              handleCancelForm();
            } else {
              setShowForm(true);
            }
          }}
          className="flex items-center gap-1.5 text-xs font-semibold bg-theatre-curtain text-white px-3 py-1.5 hover:opacity-90 transition-opacity"
        >
          {showForm ? <ChevronUp className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? (editingPlayId ? 'Düzenlemeyi Kapat' : 'Formu Kapat') : 'Yeni Oyun Ekle'}
        </button>
      </div>

      {status && (
        <div className={`flex items-center gap-2 text-xs font-mono p-2.5 border rounded-sm ${
          status.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {status.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
          {status.msg}
          <button type="button" onClick={() => setStatus(null)} className="ml-auto text-text-tertiary hover:text-text-primary">✕</button>
        </div>
      )}

      {/* Add Play Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-layer-01 border border-border-subtle p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Başlık *">
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Oyun Adı" className={inputCls} />
            </Field>
            <Field label="Orijinal Başlık">
              <input value={form.originalTitle} onChange={e => setForm(f => ({ ...f, originalTitle: e.target.value }))} placeholder="Original Title" className={inputCls} />
            </Field>
            <Field label="Yazar *">
              <input value={form.playwright} onChange={e => setForm(f => ({ ...f, playwright: e.target.value }))} placeholder="Oyun Yazarı" className={inputCls} />
            </Field>
            <Field label="Yönetmen">
              <input value={form.director} onChange={e => setForm(f => ({ ...f, director: e.target.value }))} placeholder="Yönetmen" className={inputCls} />
            </Field>
            <Field label="Yapım / Şirket">
              <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Tiyatro Şirketi" className={inputCls} />
            </Field>
            <Field label="Sahne / Mekan">
              <input value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} placeholder="Sahne Adı" className={inputCls} />
            </Field>
            <Field label="Süre (dakika)">
              <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))} className={inputCls} />
            </Field>
            <Field label="Yıl">
              <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} className={inputCls} />
            </Field>
            <Field label="Tür / Genre">
              <input value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))} placeholder="Dram, Komedi..." className={inputCls} />
            </Field>
            <Field label="Ara Perde">
              <div className="flex items-center gap-2 mt-1">
                <input type="checkbox" checked={form.hasIntermission} onChange={e => setForm(f => ({ ...f, hasIntermission: e.target.checked }))} className="accent-theatre-curtain w-4 h-4" />
                <span className="text-sm font-mono text-text-secondary">Ara var</span>
              </div>
            </Field>
          </div>
          <Field label="Poster URL">
            <input value={form.posterUrl} onChange={e => setForm(f => ({ ...f, posterUrl: e.target.value }))} placeholder="https://..." className={inputCls} />
            {form.posterUrl && (
              <img src={form.posterUrl} alt="preview" className="mt-1 h-20 object-cover border border-border-subtle" />
            )}
          </Field>
          <Field label="Oyuncular (virgülle ayır)">
            <input value={castRaw} onChange={e => setCastRaw(e.target.value)} placeholder="Ad Soyad, Ad Soyad..." className={inputCls} />
          </Field>
          <Field label="Etiketler (virgülle ayır)">
            <input value={tagsRaw} onChange={e => setTagsRaw(e.target.value)} placeholder="Klasik, DasDas, Komedi..." className={inputCls} />
          </Field>
          <Field label="Özet">
            <textarea value={form.synopsis} onChange={e => setForm(f => ({ ...f, synopsis: e.target.value }))} rows={3} placeholder="Oyun özeti..." className={`${inputCls} resize-none`} />
          </Field>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-theatre-curtain text-white py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {submitting ? (editingPlayId ? 'Güncelleniyor...' : 'Ekleniyor...') : (editingPlayId ? 'Değişiklikleri Kaydet' : 'Oyunu Ekle')}
            </button>
            <button
              type="button"
              onClick={handleCancelForm}
              className="px-4 py-2.5 text-sm font-semibold bg-layer-02 hover:bg-layer-03 text-text-secondary border border-border-subtle transition-colors"
            >
              Vazgeç
            </button>
          </div>
        </form>
      )}

      {/* Plays List */}
      <div className="border border-border-subtle overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-xs font-mono text-text-tertiary animate-pulse">Yükleniyor...</div>
        ) : plays.length === 0 ? (
          <div className="p-6 text-center text-xs font-mono text-text-tertiary">Henüz oyun yok.</div>
        ) : (
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-layer-01 border-b border-border-subtle text-text-tertiary font-mono text-[11px] uppercase">
                <th className="py-2 px-3 text-left">Başlık</th>
                <th className="py-2 px-3 text-left hidden sm:table-cell">Yazar</th>
                <th className="py-2 px-3 text-left hidden md:table-cell">Şirket</th>
                <th className="py-2 px-3 text-right">Puan</th>
                <th className="py-2 px-3 w-16 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {plays.map(play => (
                <tr key={play.id} className="hover:bg-layer-01/50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-text-primary">{play.title}</td>
                  <td className="py-2.5 px-3 text-text-secondary hidden sm:table-cell font-mono">{play.playwright}</td>
                  <td className="py-2.5 px-3 text-text-tertiary hidden md:table-cell font-mono">{play.company}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-text-primary">{play.rating?.toFixed(1) ?? '—'}</td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(play)}
                        className="p-1 text-text-tertiary hover:text-theatre-curtain transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(play)}
                        disabled={deletingId === play.id}
                        className="p-1 text-text-tertiary hover:text-theatre-curtain disabled:opacity-40 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Quotes Section ───────────────────────────────────────────────────────────
function QuotesSection() {
  const [quotes, setQuotes] = useState<DailyQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyQuote());
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setQuotes(await storageService.getQuotes());
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.quote.trim() || !form.playTitle.trim()) {
      setStatus({ type: 'error', msg: 'Replik ve oyun adı zorunlu.' });
      return;
    }
    setSubmitting(true);
    try {
      await storageService.createQuote(form);
      setStatus({ type: 'success', msg: 'Replik eklendi.' });
      setForm(emptyQuote());
      setShowForm(false);
      reload();
    } catch {
      setStatus({ type: 'error', msg: 'Replik eklenirken hata oluştu.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (q: DailyQuote) => {
    if (!window.confirm('Bu replik silinsin mi?')) return;
    setDeletingId(q.id);
    try {
      await storageService.deleteQuote(q.id);
      reload();
    } catch {
      setStatus({ type: 'error', msg: 'Silme sırasında hata oluştu.' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-sm text-text-primary">
          <MessageSquare className="w-4 h-4 text-theatre-curtain" />
          Günün Repliği Yönetimi
          <span className="font-mono text-text-tertiary text-xs">({quotes.length} replik)</span>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold bg-layer-01 border border-border-subtle text-text-primary px-3 py-1.5 hover:bg-layer-02 transition-colors"
        >
          {showForm ? <ChevronUp className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? 'Kapat' : 'Yeni Replik'}
        </button>
      </div>

      {status && (
        <div className={`flex items-center gap-2 text-xs font-mono p-2.5 border rounded-sm ${
          status.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {status.msg}
          <button type="button" onClick={() => setStatus(null)} className="ml-auto">✕</button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-layer-01 border border-border-subtle p-4 space-y-3">
          <Field label="Replik *">
            <textarea value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} rows={3} placeholder="Replik metni..." className={`${inputCls} resize-none`} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Oyun Adı *">
              <input value={form.playTitle} onChange={e => setForm(f => ({ ...f, playTitle: e.target.value }))} placeholder="Oyun Adı" className={inputCls} />
            </Field>
            <Field label="Karakter">
              <input value={form.character} onChange={e => setForm(f => ({ ...f, character: e.target.value }))} placeholder="Karakter adı" className={inputCls} />
            </Field>
            <Field label="Yazar">
              <input value={form.playwright} onChange={e => setForm(f => ({ ...f, playwright: e.target.value }))} placeholder="Yazar" className={inputCls} />
            </Field>
            <Field label="İpucu">
              <input value={form.hint} onChange={e => setForm(f => ({ ...f, hint: e.target.value }))} placeholder="Bulmaca ipucu..." className={inputCls} />
            </Field>
          </div>
          <button type="submit" disabled={submitting} className="w-full bg-theatre-curtain text-white py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
            {submitting ? 'Ekleniyor...' : 'Repliği Ekle'}
          </button>
        </form>
      )}

      <div className="border border-border-subtle divide-y divide-border-subtle">
        {loading ? (
          <div className="p-6 text-center text-xs font-mono text-text-tertiary animate-pulse">Yükleniyor...</div>
        ) : quotes.length === 0 ? (
          <div className="p-6 text-center text-xs font-mono text-text-tertiary">Replik bulunamadı.</div>
        ) : quotes.map(q => (
          <div key={q.id} className="flex items-start gap-3 p-3 hover:bg-layer-01/50 transition-colors group">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-serif italic text-text-primary truncate">"{q.quote}"</p>
              <p className="text-[10px] font-mono text-text-tertiary mt-0.5">{q.playTitle} · {q.playwright}</p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(q)}
              disabled={deletingId === q.id}
              className="p-1 text-text-tertiary hover:text-theatre-curtain opacity-0 group-hover:opacity-100 disabled:opacity-40 transition-all flex-shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Admin Page ──────────────────────────────────────────────────────────
export const AdminPage: React.FC = () => {
  const { user, role } = useAuth();

  if (role !== 'admin') {
    return <AccessDenied />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <div className="flex items-center gap-2 text-theatre-curtain text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            Yönetim Konsolu
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
            Tiyatronot Yönetici Paneli
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Oyun katalogu ve günlük replik kontrolleri.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-layer-01 border border-border-subtle px-3 py-1.5 rounded-sm flex-shrink-0">
          <div className="w-6 h-6 rounded-sm bg-theatre-curtain text-white text-[10px] font-bold flex items-center justify-center font-mono">
            {user?.displayName?.slice(0, 2).toUpperCase() ?? 'AD'}
          </div>
          <div className="text-xs">
            <span className="font-semibold text-text-primary">{user?.displayName}</span>
            <span className="text-text-tertiary ml-1 font-mono">(admin)</span>
          </div>
        </div>
      </div>

      {/* Plays CRUD */}
      <PlaysSection />

      {/* Divider */}
      <hr className="border-border-subtle" />

      {/* Quotes CRUD */}
      <QuotesSection />
    </div>
  );
};

export default AdminPage;

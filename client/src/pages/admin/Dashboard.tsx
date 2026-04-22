import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, Film, LogOut, Plus, X, Pencil, Trash2, Upload, Link, RotateCcw, EyeOff } from 'lucide-react';

const GENRES = ['Action','Comedy','Drama','Horror','Sci-Fi','Thriller','Romance','Animation','Documentary','Fantasy','Mystery','Adventure','Crime','Biography','Musical','Western'];

const emptyForm = {
  title: '', tagline: '', synopsis: '', releaseDate: '', runtime: '',
  language: '', country: '', genres: [] as string[], director: '',
  cast: [{ actor: '', role: '' }],
  rating: '', posterUrl: '', backdropUrl: '', trailerUrl: '',
  trailerType: 'youtube', status: 'draft'
};

type FormData = typeof emptyForm;

// ── Image Upload Field ──────────────────────────────────────────────
const ImageField = ({
  label, required, value, onChange, type
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (url: string) => void;
  type: 'poster' | 'backdrop';
}) => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<'drop' | 'url'>(value ? 'url' : 'drop');
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', type);
      const res = await api.post('/admin/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onChange(res.data.data.url);
      setMode('url');
    } catch {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const preview = value && (value.startsWith('http') || value.startsWith('/uploads'));

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm text-gray-400">{label}{required && ' *'}</label>
        <div className="flex gap-2">
          <button type="button" onClick={() => setMode('drop')}
            className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${mode === 'drop' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            <Upload size={11} /> Upload
          </button>
          <button type="button" onClick={() => setMode('url')}
            className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${mode === 'url' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            <Link size={11} /> URL
          </button>
        </div>
      </div>

      {mode === 'drop' ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${dragging ? 'border-red-500 bg-red-500/10' : 'border-gray-700 hover:border-gray-500 bg-gray-800/50'}
            ${type === 'poster' ? 'h-40' : 'h-28'}`}
        >
          {uploading ? (
            <p className="text-sm text-gray-400 animate-pulse">Uploading...</p>
          ) : preview ? (
            <>
              <img
                src={value}
                className={`absolute inset-0 w-full h-full object-cover rounded-lg opacity-40`}
              />
              <div className="relative z-10 flex flex-col items-center gap-1">
                <Upload size={20} className="text-white" />
                <p className="text-xs text-white">Drop new image to replace</p>
              </div>
            </>
          ) : (
            <>
              <Upload size={24} className="text-gray-500" />
              <p className="text-sm text-gray-400">Drag & drop or <span className="text-red-400">browse</span></p>
              <p className="text-xs text-gray-600">JPG, PNG, WEBP</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); }}
          />
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="https://..."
            value={value}
            onChange={e => onChange(e.target.value)}
            required={required}
          />
          {preview && (
            <img src={value} className="w-10 h-14 object-cover rounded border border-gray-700 flex-shrink-0" onError={e => (e.currentTarget.style.display = 'none')} />
          )}
        </div>
      )}
    </div>
  );
};

// ── Movie Form ──────────────────────────────────────────────────────
const MovieForm = ({ initial, onSubmit, onClose, loading }: {
  initial: FormData;
  onSubmit: (data: FormData) => void;
  onClose: () => void;
  loading: boolean;
}) => {
  const [form, setForm] = useState<FormData>(initial);

  const set = (field: keyof FormData, value: any) => setForm(f => ({ ...f, [field]: value }));

  const toggleGenre = (g: string) =>
    set('genres', form.genres.includes(g) ? form.genres.filter(x => x !== g) : [...form.genres, g]);

  const updateCast = (i: number, field: 'actor' | 'role', value: string) => {
    const cast = [...form.cast];
    cast[i] = { ...cast[i], [field]: value };
    set('cast', cast);
  };

  const addCast = () => set('cast', [...form.cast, { actor: '', role: '' }]);
  const removeCast = (i: number) => set('cast', form.cast.filter((_, idx) => idx !== i));

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold">{initial.title ? 'Edit Movie' : 'Add New Movie'}</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-white" /></button>
        </div>

        <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm text-gray-400">Title *</label>
              <input required className="input w-full" value={form.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="text-sm text-gray-400">Tagline</label>
              <input className="input w-full" value={form.tagline} onChange={e => set('tagline', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="text-sm text-gray-400">Synopsis *</label>
              <textarea required rows={3} className="input w-full resize-none" value={form.synopsis} onChange={e => set('synopsis', e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Release Date *</label>
              <input required type="date" className="input w-full" value={form.releaseDate} onChange={e => set('releaseDate', e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Runtime (min)</label>
              <input type="number" className="input w-full" value={form.runtime} onChange={e => set('runtime', e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Director *</label>
              <input required className="input w-full" value={form.director} onChange={e => set('director', e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Rating (0-10)</label>
              <input type="number" step="0.1" min="0" max="10" className="input w-full" value={form.rating} onChange={e => set('rating', e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Language</label>
              <input className="input w-full" placeholder="e.g. Telugu" value={form.language} onChange={e => set('language', e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Country</label>
              <input className="input w-full" value={form.country} onChange={e => set('country', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">Genres</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(g => (
                <button type="button" key={g} onClick={() => toggleGenre(g)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors
                    ${form.genres.includes(g) ? 'bg-red-600 border-red-600 text-white' : 'border-gray-600 text-gray-400 hover:border-gray-400'}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">Cast</label>
            <div className="space-y-2">
              {form.cast.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <input className="input flex-1" placeholder="Actor name" value={c.actor} onChange={e => updateCast(i, 'actor', e.target.value)} />
                  <input className="input flex-1" placeholder="Role" value={c.role} onChange={e => updateCast(i, 'role', e.target.value)} />
                  {form.cast.length > 1 && (
                    <button type="button" onClick={() => removeCast(i)} className="text-red-500 hover:text-red-400 px-2"><X size={16} /></button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addCast} className="text-sm text-red-500 hover:text-red-400">+ Add Cast Member</button>
            </div>
          </div>

          {/* Poster & Backdrop with drag-drop */}
          <ImageField
            label="Poster"
            required
            type="poster"
            value={form.posterUrl}
            onChange={url => set('posterUrl', url)}
          />
          <ImageField
            label="Backdrop"
            type="backdrop"
            value={form.backdropUrl}
            onChange={url => set('backdropUrl', url)}
          />

          <div>
            <label className="text-sm text-gray-400">Trailer URL *</label>
            <input required className="input w-full" placeholder="https://youtube.com/watch?v=..." value={form.trailerUrl} onChange={e => set('trailerUrl', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Trailer Type</label>
              <select className="input w-full" value={form.trailerType} onChange={e => set('trailerType', e.target.value)}>
                <option value="youtube">YouTube</option>
                <option value="hosted">Hosted</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400">Status</label>
              <select className="input w-full" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border border-gray-600 text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Dashboard ───────────────────────────────────────────────────────
const Dashboard = () => {
  const admin = useAuthStore(state => state.admin);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [view, setView] = useState<'dashboard' | 'movies'>('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [editMovie, setEditMovie] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [permDeleteId, setPermDeleteId] = useState<string | null>(null);

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => (await api.get('/admin/stats')).data.data
  });

  const { data: movies, error: moviesError } = useQuery({
    queryKey: ['admin-movies'],
    queryFn: async () => (await api.get('/admin/movies')).data.data
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => api.post('/admin/movies', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setShowForm(false);
    }
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/admin/movies/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      setEditMovie(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/movies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setDeleteId(null);
    }
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/movies/${id}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    }
  });

  const permDeleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/movies/${id}/permanent`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setPermDeleteId(null);
    }
  });

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  const toFormData = (movie: any): FormData => ({
    title: movie.title || '',
    tagline: movie.tagline || '',
    synopsis: movie.synopsis || '',
    releaseDate: movie.releaseDate ? movie.releaseDate.split('T')[0] : '',
    runtime: movie.runtime?.toString() || '',
    language: Array.isArray(movie.language) ? movie.language.join(', ') : movie.language || '',
    country: movie.country || '',
    genres: movie.genres || [],
    director: movie.director || '',
    cast: movie.cast?.length ? movie.cast : [{ actor: '', role: '' }],
    rating: movie.rating?.toString() || '',
    posterUrl: movie.posterUrl || '',
    backdropUrl: movie.backdropUrl || '',
    trailerUrl: movie.trailerUrl || '',
    trailerType: movie.trailerType || 'youtube',
    status: movie.status || 'draft'
  });

  const preparePayload = (form: FormData) => ({
    ...form,
    runtime: form.runtime ? Number(form.runtime) : undefined,
    rating: form.rating ? Number(form.rating) : undefined,
    language: form.language ? form.language.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    cast: form.cast.filter(c => c.actor.trim())
  });

  return (
    <div className="min-h-screen bg-gray-950 flex text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-10 text-red-500">CineVault</h2>
        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 p-3 rounded transition-colors ${view === 'dashboard' ? 'bg-red-600/10 text-red-500' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button
            onClick={() => setView('movies')}
            className={`w-full flex items-center gap-3 p-3 rounded transition-colors ${view === 'movies' ? 'bg-red-600/10 text-red-500' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Film size={20} /> Movies
          </button>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 p-3 rounded text-gray-400 hover:text-red-500 transition-colors mt-auto">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{view === 'dashboard' ? 'Dashboard' : 'Movies'}</h1>
            <p className="text-gray-400">Welcome back, {admin?.name}</p>
          </div>
          <button onClick={() => { setShowForm(true); setView('movies'); }} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors">
            <Plus size={20} /> Add New Movie
          </button>
        </header>

        {/* Stats — only on Dashboard view */}
        {view === 'dashboard' && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Movies', value: stats?.totalMovies ?? 0, color: 'text-white' },
            { label: 'Published', value: stats?.publishedMovies ?? 0, color: 'text-green-500' },
            { label: 'Drafts', value: stats?.draftMovies ?? 0, color: 'text-yellow-500' },
            { label: 'New This Month', value: stats?.addedThisMonth ?? 0, color: 'text-blue-500' },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <p className="text-gray-400 text-sm mb-1">{s.label}</p>
              <h3 className={`text-3xl font-bold ${s.color}`}>{s.value}</h3>
            </div>
          ))}
        </div>}

        {moviesError && (
          <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500 text-red-400 text-sm">
            Failed to load movies. Please log out and log back in.
          </div>
        )}

        {/* Table */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-800/50 text-gray-400 text-sm uppercase">
              <tr>
                <th className="px-6 py-4">Movie</th>
                <th className="px-6 py-4">Release</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {movies?.map((movie: any) => (
                <tr key={movie._id} className={`transition-colors ${movie.isDeleted ? 'opacity-40' : 'hover:bg-gray-800/30'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={movie.posterUrl} className="w-10 h-14 object-cover rounded" onError={e => (e.currentTarget.style.display = 'none')} />
                      <div>
                        <span className={`font-medium ${movie.isDeleted ? 'line-through text-gray-500' : ''}`}>{movie.title}</span>
                        {movie.isDeleted && (
                          <div className="flex items-center gap-1 text-xs text-gray-600 mt-0.5">
                            <EyeOff size={10} /> hidden from users
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{new Date(movie.releaseDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${movie.status === 'published' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                      {movie.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{movie.rating}/10</td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    {movie.isDeleted ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => restoreMutation.mutate(movie._id)}
                          title="Restore — make visible to users again"
                          className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors border border-green-600/30 px-2 py-1 rounded"
                        >
                          <RotateCcw size={13} /> Restore
                        </button>
                        <button
                          onClick={() => setPermDeleteId(movie._id)}
                          title="Delete permanently from database"
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors border border-red-600/30 px-2 py-1 rounded"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => setEditMovie(movie)} className="text-blue-400 hover:text-blue-300 transition-colors">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => setDeleteId(movie._id)} title="Hide from users" className="text-red-500 hover:text-red-400 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add Modal */}
      {showForm && (
        <MovieForm
          initial={emptyForm}
          onSubmit={data => addMutation.mutate(preparePayload(data))}
          onClose={() => setShowForm(false)}
          loading={addMutation.isPending}
        />
      )}

      {/* Edit Modal */}
      {editMovie && (
        <MovieForm
          initial={toFormData(editMovie)}
          onSubmit={data => editMutation.mutate({ id: editMovie._id, data: preparePayload(data) })}
          onClose={() => setEditMovie(null)}
          loading={editMutation.isPending}
        />
      )}

      {/* Permanent Delete Confirm */}
      {permDeleteId && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-red-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2 text-red-400">Delete Permanently?</h3>
            <p className="text-gray-400 mb-6 text-sm">This will remove the movie from the database forever. This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setPermDeleteId(null)} className="px-4 py-2 rounded border border-gray-600 text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button
                onClick={() => permDeleteMutation.mutate(permDeleteId)}
                disabled={permDeleteMutation.isPending}
                className="px-4 py-2 rounded bg-red-700 hover:bg-red-800 text-white font-medium transition-colors disabled:opacity-50"
              >
                {permDeleteMutation.isPending ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">Hide from Users?</h3>
            <p className="text-gray-400 mb-6 text-sm">The movie will be hidden from the public site. You can restore it anytime from the admin panel.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded border border-gray-600 text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50">
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

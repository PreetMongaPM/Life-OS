import { useState, useEffect, useRef } from 'react';
import { Plus, List, Trash2, MoreHorizontal, Copy, Pin, Check, StickyNote, Search, X } from 'lucide-react';
import { getNotes, createNote, deleteNote, updateNote } from '../api';

const NOTE_COLORS = [
  { bg: 'bg-[#1e1b4b]', border: 'border-indigo-700/50', accent: 'text-indigo-300', label: 'Indigo' },
  { bg: 'bg-[#14532d]', border: 'border-emerald-700/50', accent: 'text-emerald-300', label: 'Green' },
  { bg: 'bg-[#7c2d12]', border: 'border-orange-700/50', accent: 'text-orange-300', label: 'Orange' },
  { bg: 'bg-[#1e3a5f]', border: 'border-blue-700/50', accent: 'text-blue-300', label: 'Blue' },
  { bg: 'bg-[#4a1d96]', border: 'border-purple-700/50', accent: 'text-purple-300', label: 'Purple' },
  { bg: 'bg-[#164e63]', border: 'border-cyan-700/50', accent: 'text-cyan-300', label: 'Cyan' },
  { bg: 'bg-[#1a1a2e]', border: 'border-white/10', accent: 'text-gray-300', label: 'Dark' },
];

function NoteCard({ note, onDelete, onCopy, onTogglePin, copiedId, openMenuId, setOpenMenuId, menuRef }) {
  const colorObj = NOTE_COLORS.find(c => c.bg === note.color?.split(' ')[0]) || NOTE_COLORS[6];

  return (
    <div className={`rounded-2xl border ${colorObj.bg} ${colorObj.border} p-5 flex flex-col group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 relative`}>
      {/* Pin badge */}
      {note.pinned && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center shadow-lg shadow-brand-primary/40 border border-white/20">
          <Pin className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-3 gap-2">
        <h3 className="font-semibold text-base text-white leading-snug flex-1 min-w-0 pr-1">{note.title}</h3>
        <div className="relative flex-shrink-0" ref={openMenuId === note._id ? menuRef : null}>
          <button
            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === note._id ? null : note._id); }}
            className="p-1.5 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {openMenuId === note._id && (
            <div className="absolute right-0 top-8 z-30 w-44 rounded-xl border border-white/10 shadow-2xl overflow-hidden" style={{ background: 'rgba(8,8,18,0.98)' }}>
              <button
                onClick={() => onTogglePin(note)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-white/8 transition-colors"
              >
                <Pin className="w-4 h-4 text-brand-primary" />
                {note.pinned ? 'Unpin note' : 'Pin note'}
              </button>
              <button
                onClick={() => onCopy(note)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-white/8 transition-colors"
              >
                {copiedId === note._id
                  ? <><Check className="w-4 h-4 text-emerald-400" /> Copied!</>
                  : <><Copy className="w-4 h-4 text-gray-400" /> Copy text</>}
              </button>
              <div className="h-px bg-white/10 mx-2" />
              <button
                onClick={() => { onDelete(note._id); setOpenMenuId(null); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete note
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {note.content && (
        <p className="whitespace-pre-line text-sm text-white/75 leading-relaxed mb-4 flex-1">{note.content}</p>
      )}

      {/* Footer */}
      <div className="mt-auto pt-3 flex items-center justify-between border-t border-white/8">
        <div className="flex gap-1.5 flex-wrap">
          {note.tags?.map(tag => (
            <span key={tag} className={`text-xs px-2 py-0.5 rounded-md bg-black/25 ${colorObj.accent} border border-white/5`}>{tag}</span>
          ))}
        </div>
        <span className="text-xs text-white/35 ml-2 flex-shrink-0">{note.date}</span>
      </div>
    </div>
  );
}

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', content: '', colorObj: NOTE_COLORS[6] });
  const [isAdding, setIsAdding] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [search, setSearch] = useState('');
  const [titleError, setTitleError] = useState('');
  const menuRef = useRef(null);

  const fetchNotes = async () => {
    try { const res = await getNotes(); setNotes(res.data); }
    catch (err) { console.error(err); }
  };

  useEffect(() => { fetchNotes(); }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCreateNote = async () => {
    if (!newNote.title.trim()) { setTitleError('Please add a title for your note.'); return; }
    setTitleError('');
    try {
      const colorStr = `${newNote.colorObj.bg} ${newNote.colorObj.border}`;
      await createNote({
        title: newNote.title,
        content: newNote.content,
        color: colorStr,
        tags: ['Note'],
        date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
      });
      setNewNote({ title: '', content: '', colorObj: NOTE_COLORS[6] });
      setIsAdding(false);
      fetchNotes();
    } catch (err) { console.error(err); }
  };

  const handleDeleteNote = async (id) => {
    try { await deleteNote(id); fetchNotes(); }
    catch (err) { console.error(err); }
  };

  const handleAddChecklist = () => {
    setNewNote(n => ({ ...n, content: n.content + (n.content ? '\n' : '') + '☐ ' }));
  };

  const handleCopyNote = (note) => {
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopiedId(note._id);
    setTimeout(() => setCopiedId(null), 2000);
    setOpenMenuId(null);
  };

  const handleTogglePin = async (note) => {
    try { await updateNote(note._id, { pinned: !note.pinned }); fetchNotes(); }
    catch (err) { console.error(err); }
    setOpenMenuId(null);
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setNewNote({ title: '', content: '', colorObj: NOTE_COLORS[6] });
    setTitleError('');
  };

  // Sort: pinned first, then filter by search
  const sortedNotes = [...notes]
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
    .filter(n => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q);
    });

  const pinnedCount = notes.filter(n => n.pinned).length;

  return (
    <div className="space-y-8 pb-12">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Notes</h1>
          <p className="text-text-muted">
            {notes.length > 0
              ? `${notes.length} note${notes.length !== 1 ? 's' : ''}${pinnedCount > 0 ? ` · ${pinnedCount} pinned` : ''}`
              : 'Jot down your thoughts, ideas, and quick notes.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          {notes.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-primary transition-colors w-48"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
          <button
            onClick={() => { setIsAdding(true); setTitleError(''); }}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            New Note
          </button>
        </div>
      </div>

      {/* ── Add Note Form ── */}
      {isAdding && (
        <div
          className="rounded-2xl border border-brand-primary/50 shadow-xl shadow-brand-primary/10 overflow-hidden"
          style={{ background: 'rgba(8,8,20,0.98)' }}
        >
          {/* Color strip */}
          <div className={`h-1 w-full ${newNote.colorObj.bg}`} style={{ background: 'linear-gradient(90deg, var(--color-brand-primary), var(--color-brand-secondary))' }} />
          <div className="p-5 space-y-3">
            <input
              type="text"
              value={newNote.title}
              autoFocus
              onChange={e => { setNewNote(n => ({ ...n, title: e.target.value })); setTitleError(''); }}
              placeholder="Note title..."
              className="w-full bg-transparent border-none outline-none text-white text-lg font-semibold placeholder-white/25"
            />
            {titleError && <p className="text-rose-400 text-xs flex items-center gap-1">⚠ {titleError}</p>}
            <textarea
              value={newNote.content}
              onChange={e => setNewNote(n => ({ ...n, content: e.target.value }))}
              placeholder="Take a note..."
              className="w-full bg-transparent border-none outline-none text-white/85 placeholder-white/25 resize-none min-h-[90px] text-sm leading-relaxed"
            />

            {/* Color picker */}
            <div className="flex gap-2 items-center py-1">
              <span className="text-xs text-white/35 mr-1">Color:</span>
              {NOTE_COLORS.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setNewNote(n => ({ ...n, colorObj: c }))}
                  title={c.label}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${c.bg} ${newNote.colorObj.label === c.label ? 'border-white scale-125 shadow-lg' : 'border-white/20 hover:border-white/60 hover:scale-110'}`}
                />
              ))}
            </div>

            <div className="flex justify-between items-center border-t border-white/8 pt-3 mt-1">
              <button
                onClick={handleAddChecklist}
                title="Add checklist item"
                className="flex items-center gap-2 px-3 py-1.5 text-white/50 hover:text-white hover:bg-white/8 rounded-lg transition-colors text-sm"
              >
                <List className="w-4 h-4" />
                Checklist
              </button>
              <div className="flex gap-2">
                <button
                  onClick={cancelAdd}
                  className="text-white/50 font-medium px-4 py-2 hover:bg-white/8 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNote}
                  className="bg-brand-primary text-white font-medium px-5 py-2 hover:bg-brand-primary/90 rounded-xl transition-colors text-sm shadow-lg shadow-brand-primary/30"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Notes Grid ── */}
      {sortedNotes.length > 0 ? (
        <>
          {/* Pinned section */}
          {sortedNotes.some(n => n.pinned) && (
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                <Pin className="w-3.5 h-3.5" /> Pinned
              </p>
              <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                {sortedNotes.filter(n => n.pinned).map(note => (
                  <div key={note._id} className="break-inside-avoid">
                    <NoteCard
                      note={note}
                      onDelete={handleDeleteNote}
                      onCopy={handleCopyNote}
                      onTogglePin={handleTogglePin}
                      copiedId={copiedId}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                      menuRef={menuRef}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Others section */}
          {sortedNotes.some(n => !n.pinned) && (
            <div>
              {sortedNotes.some(n => n.pinned) && (
                <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">Others</p>
              )}
              <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                {sortedNotes.filter(n => !n.pinned).map(note => (
                  <div key={note._id} className="break-inside-avoid">
                    <NoteCard
                      note={note}
                      onDelete={handleDeleteNote}
                      onCopy={handleCopyNote}
                      onTogglePin={handleTogglePin}
                      copiedId={copiedId}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                      menuRef={menuRef}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search — no results */}
          {search && sortedNotes.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <Search className="w-10 h-10 text-gray-600 mb-4" />
              <p className="text-gray-400 font-medium">No notes match "{search}"</p>
              <button onClick={() => setSearch('')} className="mt-3 text-brand-primary hover:text-brand-secondary text-sm transition-colors">Clear search</button>
            </div>
          )}
        </>
      ) : !isAdding ? (
        /* ── Empty State ── */
        <div className="flex flex-col items-center justify-center text-center py-28 rounded-3xl border border-dashed border-white/10 relative overflow-hidden"
          style={{ background: 'rgba(10,10,20,0.5)' }}
        >
          {/* Decorative blobs */}
          <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-brand-secondary/10 rounded-full blur-3xl pointer-events-none" />

          {/* Icon */}
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl shadow-brand-primary/20 backdrop-blur-sm">
              <StickyNote className="w-12 h-12 text-brand-primary" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center shadow-lg shadow-brand-primary/50 border-2 border-[#050505]">
              <Plus className="w-4 h-4 text-white" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">No notes yet</h3>
          <p className="text-gray-400 mb-8 max-w-xs leading-relaxed text-sm">
            Capture ideas, to-dos, quotes, or anything on your mind. Notes live here.
          </p>

          <button
            onClick={() => setIsAdding(true)}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white px-7 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-xl shadow-brand-primary/40 hover:shadow-brand-primary/60 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Create your first note
          </button>

          {/* Quick tips */}
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-sm text-xs text-gray-500">
            {[
              { emoji: '📌', tip: 'Pin important notes to the top' },
              { emoji: '🎨', tip: 'Color-code by topic or mood' },
              { emoji: '☑️', tip: 'Add checklists for quick to-dos' },
            ].map(({ emoji, tip }) => (
              <div key={tip} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/3 border border-white/5">
                <span className="text-lg">{emoji}</span>
                <span className="text-center leading-tight">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

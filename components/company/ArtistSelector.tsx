'use client';

import { useEffect, useState } from 'react';

interface Artist {
  artistId: number;
  fullName: string;
  specialty?: string;
  profileImageUrl?: string;
  averageRating?: number;
  totalStreams: number;
}

interface Props {
  selected: number[];
  onToggle: (artistId: number) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7043';

export default function ArtistSelector({ selected, onToggle }: Props) {
  const [artists,    setArtists]    = useState<Artist[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [page,       setPage]       = useState(1);

  useEffect(() => { load(); }, [page]);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '12' });
      if (search.trim()) params.set('search', search);
      const res  = await fetch(`${API_URL}/api/artists?${params}`);
      const data = await res.json();
      setArtists(Array.isArray(data) ? data : data.artists ?? []);
    } catch { setArtists([]); }
    finally  { setLoading(false); }
  }

  return (
    <div>
      {/* Search */}
      <form onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }} className="flex gap-3 mb-5">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or specialty…"
          className="flex-1"
        />
        <button type="submit" className="btn btn-secondary">Search</button>
      </form>

      {/* Selected count */}
      {selected.length > 0 && (
        <div className="mb-4 px-4 py-2 rounded-full text-xs font-cinzel tracking-[0.1em] text-saqqara-gold"
          style={{ border: '0.5px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.06)', display: 'inline-block' }}>
          {selected.length} artist{selected.length > 1 ? 's' : ''} selected
          {selected.length >= 3 && <span className="ml-2 text-saqqara-gold/60">· Bundle discount available</span>}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.1em]">Loading artists…</p>
        </div>
      ) : artists.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-saqqara-light/30 text-xs">No artists found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {artists.map(a => {
            const isSelected = selected.includes(a.artistId);
            return (
              <button
                key={a.artistId}
                type="button"
                onClick={() => onToggle(a.artistId)}
                className="card text-left transition-all duration-200 p-4"
                style={{
                  border: isSelected
                    ? '0.5px solid rgba(201,168,76,0.55)'
                    : '0.5px solid rgba(201,168,76,0.1)',
                  background: isSelected ? 'rgba(201,168,76,0.06)' : undefined,
                  transform: isSelected ? 'translateY(-1px)' : undefined,
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(201,168,76,0.15)' }}>
                    {a.profileImageUrl
                      ? <img src={a.profileImageUrl} alt={a.fullName} className="w-full h-full object-cover" />
                      : <span className="text-lg">🎨</span>
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-cinzel text-xs tracking-[0.08em] text-saqqara-light truncate">{a.fullName}</p>
                    {a.specialty && (
                      <p className="text-saqqara-gold/60 text-xs truncate">{a.specialty}</p>
                    )}
                  </div>

                  {/* Checkmark */}
                  <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{
                      background: isSelected ? '#C9A84C' : 'transparent',
                      border: isSelected ? 'none' : '0.5px solid rgba(255,255,255,0.15)',
                    }}>
                    {isSelected && (
                      <svg className="w-2.5 h-2.5" fill="none" stroke="#080808" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-5">
        <button
          type="button"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="btn btn-ghost disabled:opacity-30"
        >
          ← Prev
        </button>
        <span className="text-saqqara-light/30 text-xs self-center font-cinzel">Page {page}</span>
        <button
          type="button"
          onClick={() => setPage(p => p + 1)}
          disabled={artists.length < 12}
          className="btn btn-ghost disabled:opacity-30"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

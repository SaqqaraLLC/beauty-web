'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface StreamCard {
  streamId:        number;
  artistId:        number;
  artistName:      string;
  artistImageUrl?: string;
  title:           string;
  description?:    string;
  status:          string;
  viewCount:       number;
  startedAt?:      string;
  endedAt?:        string;
  thumbnailUrl?:   string;
  tags?:           string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7043';

type Filter = 'all' | 'live' | 'recorded';

export default function StreamsBrowsePage() {
  const [streams,  setStreams]  = useState<StreamCard[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<Filter>('all');
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/streams/browse`)
      .then(r => r.ok ? r.json() : [])
      .then(setStreams)
      .catch(() => setStreams([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = streams.filter(s => {
    const matchesFilter =
      filter === 'all'      ? true :
      filter === 'live'     ? s.status === 'Live' :
      s.status !== 'Live';

    const matchesSearch = !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.artistName.toLowerCase().includes(search.toLowerCase()) ||
      (s.tags || '').toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const liveCount = streams.filter(s => s.status === 'Live').length;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header */}
          <div className="text-center">
            <p className="script text-saqqara-gold text-2xl mb-1">Watch Live</p>
            <h1 className="text-xl font-cinzel tracking-[0.1em]">Artist Streams</h1>
            <p className="text-saqqara-light/35 text-xs mt-2">
              Live broadcasts and recorded sessions from our artists
            </p>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search streams or artists…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex justify-center gap-1"
            style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)', paddingBottom: 0 }}>
            {(['all', 'live', 'recorded'] as Filter[]).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-5 py-3 font-cinzel text-xs tracking-[0.1em] uppercase transition-all duration-200 capitalize"
                style={{
                  color:        filter === f ? '#C9A84C' : 'rgba(237,237,237,0.3)',
                  borderBottom: filter === f ? '0.5px solid #C9A84C' : '0.5px solid transparent',
                  marginBottom: '-0.5px',
                }}>
                {f}
                {f === 'live' && liveCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                    <span className="text-[0.6rem]">{liveCount}</span>
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.1em]">Loading…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card text-center py-16 max-w-sm mx-auto">
              <div className="text-3xl mb-3 text-saqqara-gold/20">✦</div>
              <p className="text-saqqara-light/30 text-xs">No streams found</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(s => (
                <StreamTile key={s.streamId} stream={s} />
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

function StreamTile({ stream }: { stream: StreamCard }) {
  const isLive = stream.status === 'Live';

  return (
    <Link href={`/streams/${stream.streamId}`} className="block group">
      <div className="card p-0 overflow-hidden hover:border-saqqara-gold/30 transition-all duration-300">

        {/* Thumbnail */}
        <div className="relative aspect-video bg-saqqara-border overflow-hidden">
          {stream.thumbnailUrl ? (
            <img
              src={stream.thumbnailUrl}
              alt={stream.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl text-saqqara-gold/10">▶</span>
            </div>
          )}

          {/* Live badge */}
          {isLive && (
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-1 rounded-full"
              style={{ background: 'rgba(220,38,38,0.85)', border: '0.5px solid rgba(255,255,255,0.15)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-white text-[0.6rem] font-cinzel tracking-[0.1em]">LIVE</span>
            </div>
          )}

          {/* Views */}
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full text-[0.6rem] font-cinzel tracking-[0.06em]"
            style={{ background: 'rgba(0,0,0,0.65)', color: 'rgba(237,237,237,0.7)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
            {stream.viewCount.toLocaleString()} views
          </div>
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          <p className="font-cinzel text-xs tracking-[0.08em] text-saqqara-light line-clamp-1 group-hover:text-saqqara-gold transition-colors">
            {stream.title}
          </p>

          <div className="flex items-center gap-2">
            {stream.artistImageUrl && (
              <img src={stream.artistImageUrl} alt={stream.artistName}
                className="w-5 h-5 rounded-full object-cover opacity-80" />
            )}
            <p className="text-saqqara-gold/60 text-xs truncate">{stream.artistName}</p>
          </div>

          {stream.description && (
            <p className="text-saqqara-light/30 text-xs line-clamp-2 leading-relaxed">
              {stream.description}
            </p>
          )}

          {stream.startedAt && (
            <p className="text-saqqara-light/20 text-[0.6rem] font-cinzel tracking-[0.06em]">
              {new Date(stream.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </div>

      </div>
    </Link>
  );
}

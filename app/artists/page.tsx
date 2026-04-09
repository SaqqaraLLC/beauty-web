'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Artist {
  artistId: number;
  fullName: string;
  specialty?: string;
  bio?: string;
  profileImageUrl?: string;
  totalStreams: number;
  totalViews: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7043';

export default function ArtistsDirectory() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'streams' | 'views'>('name');

  useEffect(() => {
    loadArtists();
  }, [page, sortBy]);

  async function loadArtists() {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('pageSize', '12');
      params.append('sortBy', sortBy);

      if (searchTerm.trim()) {
        params.append('search', searchTerm);
      }

      const res = await fetch(`${API_URL}/api/artists?${params}`);

      if (!res.ok) {
        throw new Error('Failed to load artists');
      }

      const data = await res.json();
      setArtists(Array.isArray(data) ? data : data.artists || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load artists');
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadArtists();
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-xl font-cinzel mb-2">Artist Directory</h1>
            <p className="text-sm text-saqqara-light/80">
              Discover talented professionals and explore their work
            </p>
          </div>

          {/* Search & Filter */}
          <div className="card mb-12">
            <form onSubmit={handleSearch} className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Search artists by name or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-saqqara-dark border border-saqqara-border rounded-lg text-saqqara-light placeholder-saqqara-light/40 focus:outline-none focus:border-saqqara-gold"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Search
              </button>
            </form>

            {/* Sort */}
            <div className="flex gap-2">
              <label className="text-saqqara-light/60 text-sm">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as 'name' | 'streams' | 'views');
                  setPage(1);
                }}
                className="px-4 py-2 bg-saqqara-dark border border-saqqara-border rounded-lg text-saqqara-light text-sm focus:outline-none focus:border-saqqara-gold"
              >
                <option value="name">Name (A-Z)</option>
                <option value="streams">Most Streams</option>
                <option value="views">Most Views</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="card bg-red-950/20 border border-red-700 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-saqqara-light/60">Loading artists...</p>
            </div>
          ) : artists.length === 0 ? (
            <div className="card text-center py-16">
              <span className="text-6xl block mb-4">🔍</span>
              <p className="text-saqqara-light/60 text-lg">
                {searchTerm ? 'No artists found matching your search' : 'No artists available yet'}
              </p>
            </div>
          ) : (
            <>
              {/* Artists Grid */}
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                {artists.map(artist => (
                  <Link key={artist.artistId} href={`/artists/${artist.artistId}`}>
                    <div className="card group cursor-pointer h-full hover:border-saqqara-gold transition-colors">
                      {/* Profile Image */}
                      <div className="mb-4 overflow-hidden rounded-lg bg-saqqara-border h-40">
                        {artist.profileImageUrl ? (
                          <img
                            src={artist.profileImageUrl}
                            alt={artist.fullName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-4xl">🎨</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <h3 className="text-lg font-semibold mb-1">{artist.fullName}</h3>
                      {artist.specialty && (
                        <p className="text-saqqara-gold text-sm mb-2">{artist.specialty}</p>
                      )}

                      {artist.bio && (
                        <p className="text-saqqara-light/60 text-sm mb-4 line-clamp-2">
                          {artist.bio}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-saqqara-light/60 pt-4 border-t border-saqqara-border">
                        <div>
                          <div className="text-saqqara-gold font-bold">{artist.totalStreams}</div>
                          <div>Streams</div>
                        </div>
                        <div>
                          <div className="text-saqqara-gold font-bold">
                            {artist.totalViews > 1000 ? `${(artist.totalViews / 1000).toFixed(1)}k` : artist.totalViews}
                          </div>
                          <div>Views</div>
                        </div>
                      </div>

                      {/* View Profile CTA */}
                      <div className="mt-4 text-saqqara-gold text-sm font-semibold group-hover:text-saqqara-light transition-colors">
                        View Profile →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center gap-4 items-center">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  ← Previous
                </button>
                <span className="text-saqqara-light/60">Page {page}</span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={artists.length < 12}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}

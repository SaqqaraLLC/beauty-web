'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface ArtistProfile {
  artistId: number;
  fullName: string;
  specialty?: string;
  bio?: string;
  profileImageUrl?: string;
  recentStreams: Stream[];
  totalStreams: number;
  totalViews: number;
}

interface Stream {
  streamId: number;
  title: string;
  description?: string;
  status: string;
  thumbnailUrl?: string;
  viewCount: number;
  createdAt: string;
  durationSeconds?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7043';

export default function ArtistPageClient({ params }: { params: { artistId: string } }) {
  const artistId = Number(params.artistId);
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'streams'>('overview');

  useEffect(() => {
    loadProfile();
  }, [artistId]);

  async function loadProfile() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/artists/${artistId}/profile`);

      if (!res.ok) {
        throw new Error('Artist not found');
      }

      const data = await res.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load artist profile');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-saqqara-dark flex items-center justify-center">
          <p className="text-saqqara-light/60">Loading artist profile...</p>
        </div>
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-saqqara-dark px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="card text-center py-12">
              <p className="text-red-400 mb-4">{error || 'Artist not found'}</p>
              <Link href="/">
                <button className="btn btn-primary">
                  Back to Home
                </button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-8">
        <div className="max-w-5xl mx-auto">

          {/* Hero Section */}
          <div className="card mb-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Image */}
              <div className="md:w-1/3">
                {profile.profileImageUrl ? (
                  <img
                    src={profile.profileImageUrl}
                    alt={profile.fullName}
                    className="w-full h-64 md:h-80 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 md:h-80 bg-saqqara-border rounded-lg flex items-center justify-center">
                    <span className="text-6xl">🎨</span>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="md:w-2/3">
                <h1 className="text-xl font-cinzel mb-1">{profile.fullName}</h1>
                {profile.specialty && (
                  <p className="text-sm text-saqqara-gold mb-2">{profile.specialty}</p>
                )}

                {profile.bio && (
                  <p className="text-saqqara-light/80 mb-8 leading-relaxed">
                    {profile.bio}
                  </p>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-saqqara-dark rounded-lg p-4">
                    <div className="text-lg font-bold text-saqqara-gold">
                      {profile.totalStreams}
                    </div>
                    <p className="text-saqqara-light/60 text-sm">Total Streams</p>
                  </div>
                  <div className="bg-saqqara-dark rounded-lg p-4">
                    <div className="text-lg font-bold text-saqqara-gold">
                      {profile.totalViews.toLocaleString()}
                    </div>
                    <p className="text-saqqara-light/60 text-sm">Total Views</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-saqqara-border mb-8">
            {(['overview', 'streams'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold transition-colors capitalize ${
                  activeTab === tab
                    ? 'text-saqqara-gold border-b-2 border-saqqara-gold'
                    : 'text-saqqara-light/60 hover:text-saqqara-light'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          {activeTab === 'overview' ? (
            <div className="grid md:grid-cols-2 gap-6">
              {profile.recentStreams.map(stream => (
                <StreamCard key={stream.streamId} stream={stream} />
              ))}
            </div>
          ) : (
            <AllStreamsTab artistId={artistId} />
          )}
        </div>
      </div>
    </>
  );
}

function StreamCard({ stream }: { stream: Stream }) {
  const duration = stream.durationSeconds
    ? `${Math.floor(stream.durationSeconds / 60)}:${String(stream.durationSeconds % 60).padStart(2, '0')}`
    : null;

  return (
    <Link href={`/streams/${stream.streamId}`}>
      <div className="card group cursor-pointer">
        {/* Thumbnail */}
        <div className="relative mb-4 overflow-hidden rounded-lg bg-saqqara-border h-40">
          {stream.thumbnailUrl ? (
            <img
              src={stream.thumbnailUrl}
              alt={stream.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl">📹</span>
            </div>
          )}

          {/* Duration Badge */}
          {duration && (
            <div className="absolute bottom-2 right-2 bg-saqqara-dark/80 px-2 py-1 rounded text-xs font-semibold">
              {duration}
            </div>
          )}
        </div>

        {/* Info */}
        <h3 className="text-lg font-semibold mb-2">{stream.title}</h3>
        {stream.description && (
          <p className="text-saqqara-light/60 text-sm mb-4 line-clamp-2">
            {stream.description}
          </p>
        )}

        {/* Meta */}
        <div className="flex justify-between items-center text-xs text-saqqara-light/60">
          <span>👁️ {stream.viewCount.toLocaleString()} views</span>
          <span>{new Date(stream.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
}

function AllStreamsTab({ artistId }: { artistId: number }) {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadStreams();
  }, [page, artistId]);

  async function loadStreams() {
    setLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/api/artists/${artistId}/streams?page=${page}&pageSize=12`
      );

      if (res.ok) {
        const data = await res.json();
        setStreams(data.streams || []);
      }
    } catch (err) {
      console.error('Failed to load streams:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p className="text-saqqara-light/60">Loading streams...</p>;
  }

  if (streams.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-saqqara-light/60">No streams available yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {streams.map(stream => (
          <StreamCard key={stream.streamId} stream={stream} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="btn btn-secondary disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-saqqara-light/60 py-2">Page {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          className="btn btn-secondary"
        >
          Next
        </button>
      </div>
    </>
  );
}

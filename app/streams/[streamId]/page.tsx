'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface StreamDetail {
  streamId: number;
  artistId: number;
  artistName: string;
  title: string;
  description?: string;
  status: string;
  startedAt: string;
  endedAt?: string;
  viewCount: number;
  isFlagged: boolean;
  flagReason?: string;
  flagConfidence?: number;
  streamUrl?: string;
  thumbnailUrl?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7043';

export default function StreamViewerPage({ params }: { params: { streamId: string } }) {
  const streamId = Number(params.streamId);
  const [stream, setStream] = useState<StreamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    loadStream();
  }, [streamId]);

  async function loadStream() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/artists/streams/${streamId}`);

      if (!res.ok) {
        throw new Error('Stream not found');
      }

      const data = await res.json();
      setStream(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stream');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-saqqara-dark flex items-center justify-center">
          <p className="text-saqqara-light/60">Loading stream...</p>
        </div>
      </>
    );
  }

  if (error || !stream) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-saqqara-dark px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="card text-center py-12">
              <p className="text-red-400 mb-4">{error || 'Stream not found'}</p>
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

  const isLive = stream.status === 'Active' || stream.status === 'Streaming';
  const duration = stream.endedAt
    ? calculateDuration(stream.startedAt, stream.endedAt)
    : null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-8">
        <div className="max-w-5xl mx-auto">

          {/* Video Player */}
          <div className="mb-8">
            <div className="relative bg-black rounded-lg overflow-hidden mb-4 aspect-video">
              {stream.streamUrl ? (
                <video
                  ref={videoRef}
                  src={stream.streamUrl}
                  controls
                  poster={stream.thumbnailUrl || undefined}
                  className="w-full h-full"
                />
              ) : stream.thumbnailUrl ? (
                <img
                  src={stream.thumbnailUrl}
                  alt={stream.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl">📹</span>
                </div>
              )}

              {/* Live Badge */}
              {isLive && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 px-4 py-2 rounded-lg">
                  <span className="animate-pulse w-2 h-2 bg-white rounded-full" />
                  <span className="text-sm font-bold">LIVE</span>
                </div>
              )}

              {/* Safety Flag Badge */}
              {stream.isFlagged && (
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-orange-600/90 px-4 py-2 rounded-lg">
                  <span>⚠️</span>
                  <span className="text-sm font-semibold">Content Review</span>
                </div>
              )}
            </div>

            {/* Duration */}
            {duration && !isLive && (
              <div className="text-sm text-saqqara-light/60">{duration}</div>
            )}
          </div>

          {/* Content */}
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Main Info */}
            <div className="lg:col-span-2">

              {/* Title & Artist */}
              <div className="mb-6">
                <h1 className="text-xl font-cinzel mb-1">
                  {stream.title}
                </h1>
                <Link href={`/artists/${stream.artistId}`}>
                  <p className="text-sm text-saqqara-gold hover:text-saqqara-gold/80 transition-colors">
                    {stream.artistName}
                  </p>
                </Link>
              </div>

              {/* Description */}
              {stream.description && (
                <div className="card mb-6">
                  <p className="text-saqqara-light/80 leading-relaxed">
                    {stream.description}
                  </p>
                </div>
              )}

              {/* Safety Notice */}
              {stream.isFlagged && (
                <div className="card bg-orange-950/20 border border-orange-700 mb-6">
                  <h3 className="text-lg font-semibold text-orange-400 mb-2">
                    ⚠️ This content has been flagged for review
                  </h3>
                  <p className="text-saqqara-light/80 mb-3">
                    This stream has been flagged by our automated safety systems and is under review by our moderation team. It may contain content that needs further evaluation.
                  </p>
                  {stream.flagReason && (
                    <div className="mb-2">
                      <strong className="text-orange-300">Reason:</strong> {stream.flagReason}
                    </div>
                  )}
                  {stream.flagConfidence && (
                    <div>
                      <strong className="text-orange-300">Confidence:</strong> {Math.round(stream.flagConfidence * 100)}%
                    </div>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="card text-center">
                  <div className="text-base font-bold text-saqqara-gold">
                    {stream.viewCount.toLocaleString()}
                  </div>
                  <p className="text-saqqara-light/60 text-sm">Views</p>
                </div>
                <div className="card text-center">
                  <div className="text-sm font-cinzel text-saqqara-gold">
                    {new Date(stream.startedAt).toLocaleDateString()}
                  </div>
                  <p className="text-saqqara-light/60 text-sm">Started</p>
                </div>
                <div className="card text-center">
                  <div className="text-sm font-cinzel text-saqqara-gold">
                    {isLive ? 'LIVE' : 'Finished'}
                  </div>
                  <p className="text-saqqara-light/60 text-sm">Status</p>
                </div>
              </div>

            </div>

            {/* Sidebar */}
            <div>

              {/* Artist Card */}
              <div className="card mb-6">
                <h3 className="text-lg font-semibold mb-4">About the Artist</h3>
                <Link href={`/artists/${stream.artistId}`}>
                  <button className="btn btn-primary w-full">
                    Visit Profile
                  </button>
                </Link>
              </div>

              {/* Share */}
              <div className="card mb-6">
                <h3 className="text-lg font-semibold mb-4">Share This Stream</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => copyToClipboard(window.location.href)}
                    className="btn btn-secondary w-full text-sm"
                  >
                    📋 Copy Link
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Stream Info</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-saqqara-light/60">Started</p>
                    <p className="text-saqqara-light">
                      {new Date(stream.startedAt).toLocaleString()}
                    </p>
                  </div>
                  {stream.endedAt && (
                    <div>
                      <p className="text-saqqara-light/60">Ended</p>
                      <p className="text-saqqara-light">
                        {new Date(stream.endedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </>
  );
}

function calculateDuration(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diff = Math.floor((end.getTime() - start.getTime()) / 1000);

  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  alert('Link copied to clipboard!');
}

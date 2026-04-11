'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { apiGet, apiPost } from '@/lib/api';
import type { StreamDetail, StreamJoinResult } from '@/lib/types';

type ViewerPhase = 'info' | 'joining' | 'watching' | 'ended' | 'error';

export default function StreamViewerClient({ params }: { params: { streamId: string } }) {
  const streamId = Number(params.streamId);

  const [stream,      setStream]      = useState<StreamDetail | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [phase,       setPhase]       = useState<ViewerPhase>('info');
  const [errorMsg,    setErrorMsg]    = useState('');
  const [displayName, setDisplayName] = useState('');

  // ACS refs
  const callRef      = useRef<any>(null);
  const videoAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiGet(`/api/streams/${streamId}`)
      .then(setStream)
      .catch(() => setPhase('error'))
      .finally(() => setLoading(false));
  }, [streamId]);

  const joinStream = useCallback(async () => {
    setPhase('joining');
    setErrorMsg('');
    try {
      const result: StreamJoinResult = await apiPost(`/api/streams/${streamId}/join`, {
        displayName: displayName.trim() || 'Guest',
      });

      // Load ACS SDK dynamically (browser-only)
      const { CallClient, VideoStreamRenderer } =
        await import('@azure/communication-calling');
      const { AzureCommunicationTokenCredential } =
        await import('@azure/communication-common');

      const credential = new AzureCommunicationTokenCredential(result.acsToken);
      const callClient = new CallClient();

      const callAgent = await callClient.createCallAgent(credential, {
        displayName: displayName.trim() || 'Guest',
      });

      const call = callAgent.join({ roomId: result.roomId }, {
        audioOptions: { muted: true },
        videoOptions: {},
      });
      callRef.current = call;

      setPhase('watching');

      // Subscribe to remote video streams
      call.on('remoteParticipantsUpdated', ({ added }) => {
        added.forEach((participant: any) => {
          participant.on('videoStreamsUpdated', ({ added: streams }: any) => {
            streams.forEach(async (stream: any) => {
              if (stream.isAvailable && videoAreaRef.current) {
                const renderer = new VideoStreamRenderer(stream);
                const view = await renderer.createView({ scalingMode: 'Crop' });
                // Clear and attach
                while (videoAreaRef.current.firstChild) {
                  videoAreaRef.current.removeChild(videoAreaRef.current.firstChild);
                }
                videoAreaRef.current.appendChild(view.target);
              }
            });
          });
          // Handle already-streaming participants
          participant.videoStreams.forEach(async (stream: any) => {
            if (stream.isAvailable && videoAreaRef.current) {
              const renderer = new VideoStreamRenderer(stream);
              const view = await renderer.createView({ scalingMode: 'Crop' });
              while (videoAreaRef.current.firstChild) {
                videoAreaRef.current.removeChild(videoAreaRef.current.firstChild);
              }
              videoAreaRef.current.appendChild(view.target);
            }
          });
        });
      });

    } catch (err: any) {
      setErrorMsg(err.message ?? 'Failed to join stream.');
      setPhase('info');
    }
  }, [streamId, displayName]);

  const leaveStream = useCallback(async () => {
    await callRef.current?.hangUp().catch(() => {});
    setPhase('ended');
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-saqqara-dark flex items-center justify-center">
          <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.1em]">Loading…</p>
        </div>
      </>
    );
  }

  if (phase === 'error' || !stream) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-saqqara-dark flex items-center justify-center px-4">
          <div className="card text-center space-y-4 max-w-sm">
            <p className="text-saqqara-light/40 font-cinzel tracking-[0.1em] text-sm">Stream not found</p>
            <Link href="/streams" className="btn-gold text-xs px-6 py-2 inline-block">
              Browse Streams
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Video area */}
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden"
            style={{ border: '0.5px solid rgba(201,168,76,0.15)' }}>

            {/* ACS video renders here */}
            <div ref={videoAreaRef} className="w-full h-full" />

            {/* Placeholder when not watching */}
            {phase !== 'watching' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                {stream.thumbnailUrl && (
                  <img src={stream.thumbnailUrl} alt={stream.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-20" />
                )}
                <div className="relative z-10 flex flex-col items-center gap-4">
                  {stream.isLive ? (
                    <>
                      <span className="flex items-center gap-2 text-red-400 text-xs font-cinzel tracking-[0.15em]">
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                        LIVE NOW
                      </span>
                      <p className="text-saqqara-light/50 text-xs font-cormorant">
                        {stream.viewerCount} watching
                      </p>
                    </>
                  ) : (
                    <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.1em]">
                      {stream.recordedAt ? 'Stream ended' : 'Not live yet'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Live badge while watching */}
            {phase === 'watching' && stream.isLive && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(220,38,38,0.85)', border: '0.5px solid rgba(255,255,255,0.15)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-white text-[0.6rem] font-cinzel tracking-[0.1em]">LIVE</span>
              </div>
            )}
          </div>

          {/* Stream info row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="font-cinzel tracking-[0.08em] text-saqqara-light">{stream.title}</h1>
              <Link href={`/artists/${stream.artistId}`}
                className="text-saqqara-gold/70 text-xs font-cinzel tracking-[0.08em] hover:text-saqqara-gold transition-colors">
                {stream.artistName}
              </Link>
              {stream.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {stream.tags.map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 rounded text-saqqara-light/30 text-[0.6rem] font-cinzel"
                      style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-shrink-0">
              {phase === 'info' && stream.isLive && (
                <div className="card space-y-3 min-w-[200px]">
                  <p className="text-xs font-cinzel tracking-[0.08em] text-saqqara-light/50">Your display name</p>
                  <input
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Guest"
                    className="w-full bg-saqqara-dark border border-saqqara-border rounded-lg px-3 py-2 text-xs font-cormorant text-saqqara-light placeholder-saqqara-light/20 focus:outline-none focus:border-saqqara-gold/40"
                  />
                  {errorMsg && <p className="text-red-400 text-xs">{errorMsg}</p>}
                  <button onClick={joinStream}
                    className="w-full py-2 rounded-full text-xs font-cinzel tracking-[0.12em] text-saqqara-dark bg-saqqara-gold hover:bg-saqqara-gold-soft transition-all">
                    Join Stream
                  </button>
                </div>
              )}

              {phase === 'joining' && (
                <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.1em]">Connecting…</p>
              )}

              {phase === 'watching' && (
                <button onClick={leaveStream}
                  className="px-5 py-2 rounded-full text-xs font-cinzel tracking-[0.1em] text-saqqara-light/60 transition-all"
                  style={{ border: '0.5px solid rgba(255,255,255,0.1)' }}>
                  Leave
                </button>
              )}

              {phase === 'ended' && (
                <div className="text-center space-y-2">
                  <p className="text-saqqara-light/40 text-xs font-cinzel">You left the stream</p>
                  <button onClick={() => setPhase('info')}
                    className="text-saqqara-gold text-xs font-cinzel tracking-[0.08em] hover:underline">
                    Rejoin
                  </button>
                </div>
              )}

              {!stream.isLive && (
                <div className="card text-center space-y-2 min-w-[180px]">
                  <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.08em]">
                    {stream.recordedAt ? 'This stream has ended' : 'Stream not live yet'}
                  </p>
                  <Link href="/streams" className="text-saqqara-gold/60 text-xs font-cinzel hover:text-saqqara-gold transition-colors">
                    Browse all streams →
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

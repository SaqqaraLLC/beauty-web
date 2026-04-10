'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { apiPost } from '@/lib/api';
import type { StreamStartResult } from '@/lib/types';

type Phase = 'setup' | 'live' | 'ended';

export default function ArtistStreamPage() {
  const { user, isLoading } = useCurrentUser();

  const [phase,       setPhase]       = useState<Phase>('setup');
  const [title,       setTitle]       = useState('');
  const [tags,        setTags]        = useState('');
  const [streamData,  setStreamData]  = useState<StreamStartResult | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [error,       setError]       = useState('');
  const [starting,    setStarting]    = useState(false);
  const [ending,      setEnding]      = useState(false);

  // ACS call refs
  const callClientRef = useRef<any>(null);
  const callRef       = useRef<any>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamTrackRef = useRef<MediaStream | null>(null);

  // Viewer count polling
  useEffect(() => {
    if (phase !== 'live' || !streamData) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7043'}/api/streams/${streamData.streamId}`
        );
        if (res.ok) {
          const d = await res.json();
          setViewerCount(d.viewerCount ?? 0);
        }
      } catch {}
    }, 10_000);
    return () => clearInterval(id);
  }, [phase, streamData]);

  // Start camera preview before going live
  useEffect(() => {
    if (phase !== 'setup') return;
    navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
      .then(stream => {
        streamTrackRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch(() => {});
    return () => {
      streamTrackRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [phase]);

  const startStream = useCallback(async () => {
    if (!title.trim()) { setError('Please enter a title.'); return; }
    setStarting(true);
    setError('');
    try {
      const tagArr = tags.split(',').map(t => t.trim()).filter(Boolean);
      const result: StreamStartResult = await apiPost('/api/streams/start', {
        title: title.trim(),
        thumbnailUrl: null,
        tags: tagArr,
      });
      setStreamData(result);

      // Join ACS room as Presenter
      const { CallClient, LocalVideoStream, VideoStreamRenderer } =
        await import('@azure/communication-calling');
      const { AzureCommunicationTokenCredential } =
        await import('@azure/communication-common');

      const credential = new AzureCommunicationTokenCredential(result.acsToken);
      const callClient = new CallClient();
      callClientRef.current = callClient;

      const deviceManager = await callClient.getDeviceManager();
      await deviceManager.askDevicePermission({ video: true, audio: true });
      const cameras = await deviceManager.getCameras();

      const callAgent = await callClient.createCallAgent(credential, {
        displayName: user?.email ?? 'Artist',
      });

      const localVideo = cameras[0]
        ? new LocalVideoStream(cameras[0])
        : undefined;

      const call = callAgent.join({ roomId: result.roomId }, {
        videoOptions: localVideo ? { localVideoStreams: [localVideo] } : undefined,
        audioOptions: { muted: false },
      });
      callRef.current = call;

      // Show local video preview
      if (localVideo && localVideoRef.current) {
        const renderer = new VideoStreamRenderer(localVideo);
        const view = await renderer.createView();
        localVideoRef.current.srcObject = null;
        localVideoRef.current.parentElement?.appendChild(view.target);
      }

      setPhase('live');
    } catch (err: any) {
      setError(err.message ?? 'Failed to start stream.');
    } finally {
      setStarting(false);
    }
  }, [title, tags, user]);

  const endStream = useCallback(async () => {
    if (!streamData) return;
    setEnding(true);
    try {
      await callRef.current?.hangUp();
      await apiPost(`/api/streams/${streamData.streamId}/end`);
      streamTrackRef.current?.getTracks().forEach(t => t.stop());
      setPhase('ended');
    } catch (err: any) {
      setError(err.message ?? 'Failed to end stream.');
    } finally {
      setEnding(false);
    }
  }, [streamData]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-saqqara-dark flex items-center justify-center">
          <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.1em]">Loading…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Header */}
          <div className="text-center">
            <p className="script text-saqqara-gold text-2xl mb-1">Go Live</p>
            <h1 className="text-xl font-cinzel tracking-[0.1em]">Broadcast Studio</h1>
          </div>

          {/* SETUP phase */}
          {phase === 'setup' && (
            <div className="card space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-cinzel tracking-[0.1em] text-saqqara-light/50 mb-1.5">
                    Stream Title *
                  </label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Bridal Makeup Masterclass"
                    className="w-full bg-saqqara-dark border border-saqqara-border rounded-lg px-4 py-3 text-xs font-cormorant text-saqqara-light placeholder-saqqara-light/20 focus:outline-none focus:border-saqqara-gold/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-cinzel tracking-[0.1em] text-saqqara-light/50 mb-1.5">
                    Tags (comma-separated)
                  </label>
                  <input
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    placeholder="bridal, tutorial, editorial"
                    className="w-full bg-saqqara-dark border border-saqqara-border rounded-lg px-4 py-3 text-xs font-cormorant text-saqqara-light placeholder-saqqara-light/20 focus:outline-none focus:border-saqqara-gold/40"
                  />
                </div>
              </div>

              {/* Camera preview */}
              <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden"
                style={{ border: '0.5px solid rgba(201,168,76,0.15)' }}>
                <video ref={localVideoRef} autoPlay muted playsInline
                  className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-saqqara-light/20 text-xs font-cinzel tracking-[0.1em]">Camera Preview</p>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-xs font-cinzel tracking-[0.08em] text-center">{error}</p>
              )}

              <button
                onClick={startStream}
                disabled={starting}
                className="w-full py-3 rounded-full text-xs font-cinzel tracking-[0.15em] text-saqqara-dark bg-saqqara-gold hover:bg-saqqara-gold-soft transition-all duration-200 disabled:opacity-50"
              >
                {starting ? 'Starting…' : '✦ Go Live'}
              </button>
            </div>
          )}

          {/* LIVE phase */}
          {phase === 'live' && streamData && (
            <div className="space-y-6">
              {/* Live badge + stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-cinzel tracking-[0.1em] text-red-400"
                    style={{ border: '0.5px solid rgba(248,113,113,0.35)', background: 'rgba(248,113,113,0.08)' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    LIVE
                  </span>
                  <span className="text-saqqara-light/50 text-xs font-cinzel tracking-[0.08em]">
                    {viewerCount} viewer{viewerCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <span className="text-saqqara-light/30 text-xs font-cinzel">{title}</span>
              </div>

              {/* Local video */}
              <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden"
                style={{ border: '0.5px solid rgba(201,168,76,0.2)' }}>
                <video ref={localVideoRef} autoPlay muted playsInline
                  className="w-full h-full object-cover" />
              </div>

              {error && (
                <p className="text-red-400 text-xs font-cinzel tracking-[0.08em] text-center">{error}</p>
              )}

              <button
                onClick={endStream}
                disabled={ending}
                className="w-full py-3 rounded-full text-xs font-cinzel tracking-[0.15em] text-white transition-all duration-200 disabled:opacity-50"
                style={{ background: 'rgba(220,38,38,0.8)', border: '0.5px solid rgba(248,113,113,0.4)' }}
              >
                {ending ? 'Ending…' : 'End Broadcast'}
              </button>
            </div>
          )}

          {/* ENDED phase */}
          {phase === 'ended' && (
            <div className="card text-center space-y-4">
              <p className="text-saqqara-gold font-cinzel tracking-[0.1em] text-sm">Broadcast Ended</p>
              <p className="text-saqqara-light/40 text-xs font-cormorant">
                Your stream has been saved and is available in the browse feed.
              </p>
              <button
                onClick={() => { setPhase('setup'); setStreamData(null); setTitle(''); setTags(''); setError(''); }}
                className="btn-gold text-xs px-6 py-2"
              >
                Start Another
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useResourcePlayer } from './ResourcePlayerContext';

// Renders a single global <audio>/<video> element that persists across routes
export default function GlobalResourcePlayer() {
  const {
    activeResource,
    isPlaying,
    currentTime,
    updatePlaybackTime,
    nextResource,
  } = useResourcePlayer();

  const mediaRef = useRef(null);
  const location = useLocation();

  // Avoid double playback on desktop Resources page (desktop renders visible player)
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' ? window.innerWidth > 1024 : true);
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth > 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const onResourcesPage = location.pathname.startsWith('/platform/resources');

  // Load new source and seek when activeResource changes
  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;
    if (!activeResource || !activeResource.url) {
      el.pause?.();
      return;
    }
    // Assign src and try to play if requested
    if (el.src !== activeResource.url) {
      el.src = activeResource.url;
    }
    try {
      el.currentTime = Number(currentTime) || 0;
    } catch {}
    if (isPlaying) {
      // Small delay helps after source switch
      setTimeout(() => el.play?.().catch(() => {}), 50);
    }
  }, [activeResource]);

  // React to play/pause toggles
  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;
    if (!activeResource || !activeResource.url) return;
    if (isPlaying) {
      el.play?.().catch(() => {});
    } else {
      el.pause?.();
    }
  }, [isPlaying]);

  // Persist time updates
  const handleTimeUpdate = () => {
    const el = mediaRef.current;
    if (!el) return;
    updatePlaybackTime(el.currentTime || 0);
  };

  const handleEnded = () => {
    nextResource();
  };

  if (!activeResource || !activeResource.url) return null;
  if (onResourcesPage && isDesktop) return null;

  if (activeResource.type === 'video') {
    return (
      <video
        ref={mediaRef}
        style={{ position: 'fixed', bottom: 0, right: 0, width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
        src={activeResource.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        playsInline
      />
    );
  }

  // Default to audio for songs/podcasts
  return (
    <audio
      ref={mediaRef}
      style={{ position: 'fixed', bottom: 0, right: 0, width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
      src={activeResource.url}
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleEnded}
    />
  );
}



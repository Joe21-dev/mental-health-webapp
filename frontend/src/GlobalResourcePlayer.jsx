import React, { useEffect, useRef } from 'react';
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

  // Avoid double playback on Resources page (both desktop and mobile render visible players)
  const onResourcesPage = location.pathname.startsWith('/platform/resources');

  // If user navigates to Resources page, aggressively pause and detach global media
  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;
    if (onResourcesPage) {
      try {
        el.pause();
        // Detach src to ensure no residual audio continues
        el.removeAttribute('src');
        // Force a load reset
        el.load?.();
      } catch {}
    }
  }, [onResourcesPage]);

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
    
    // Set up audio context for better audio handling
    if (activeResource.type === 'song' || activeResource.type === 'podcast') {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaElementSource(el);
      const gainNode = audioContext.createGain();
      
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set audio properties for smooth playback
      el.preload = 'auto';
      el.crossOrigin = 'anonymous';
      el.volume = 1.0;
    }
    
    if (isPlaying) {
      el.play().catch(err => console.log('Global play failed:', err));
    } else {
      el.pause();
    }
  }, [isPlaying, activeResource]);

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
  if (onResourcesPage) return null; // Don't render global player on Resources page to avoid double playback

  if (activeResource.type === 'video') {
    return (
      <video
        ref={mediaRef}
        style={{ position: 'fixed', bottom: 0, right: 0, width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
        src={activeResource.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="auto"
        crossOrigin="anonymous"
        playsInline
        onLoadedMetadata={() => {
          const el = mediaRef.current;
          if (el && currentTime > 0) {
            el.currentTime = currentTime;
          }
        }}
        onError={(e) => console.error('Global video error:', e)}
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
      preload="auto"
      crossOrigin="anonymous"
      onLoadedMetadata={() => {
        const el = mediaRef.current;
        if (el && currentTime > 0) {
          el.currentTime = currentTime;
        }
      }}
      onError={(e) => console.error('Global audio error:', e)}
    />
  );
}



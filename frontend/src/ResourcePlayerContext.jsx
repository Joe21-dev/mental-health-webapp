import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const ResourcePlayerContext = createContext({
  activeResource: null,
  isPlaying: false,
  currentTime: 0,
  playResource: () => {},
  pauseResource: () => {},
  resumeResource: () => {},
  stopResource: () => {},
  nextResource: () => {},
  prevResource: () => {},
  updatePlaybackTime: () => {},
});

export function ResourcePlayerProvider({ children }) {
  const PLAYBACK_KEY = 'resourcePlayback';
  const ACTIVE_KEY = 'activeResource';

  const [activeResource, setActiveResource] = useState(null); // { type, url, title, index, list }
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const mediaKindRef = useRef('audio');

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const storedActive = localStorage.getItem(ACTIVE_KEY);
      if (storedActive) {
        const parsed = JSON.parse(storedActive);
        setActiveResource(parsed);
      }
      const storedPb = localStorage.getItem(PLAYBACK_KEY);
      if (storedPb) {
        const parsed = JSON.parse(storedPb);
        setCurrentTime(parsed.time || 0);
        setIsPlaying(Boolean(parsed.playing));
      }
    } catch {}
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (activeResource) {
      localStorage.setItem(ACTIVE_KEY, JSON.stringify(activeResource));
    } else {
      localStorage.removeItem(ACTIVE_KEY);
      localStorage.removeItem(PLAYBACK_KEY);
    }
  }, [activeResource]);

  useEffect(() => {
    localStorage.setItem(PLAYBACK_KEY, JSON.stringify({ time: currentTime, playing: isPlaying, kind: mediaKindRef.current }));
  }, [currentTime, isPlaying]);

  // Play a resource (song, podcast, video). E-books open inline and don't use the player
  function playResource(resource, list = [], index = 0) {
    if (!resource) return;
    const normalized = { ...resource };
    // Normalize media kind for persistence
    mediaKindRef.current = normalized.type === 'video' ? 'video' : 'audio';
    setActiveResource({ ...normalized, index, list });
    setIsPlaying(true);
    setCurrentTime(0);
  }

  function pauseResource() {
    setIsPlaying(false);
  }

  function resumeResource() {
    if (activeResource) setIsPlaying(true);
  }

  function stopResource() {
    setIsPlaying(false);
    setActiveResource(null);
    setCurrentTime(0);
  }

  function nextResource() {
    if (!activeResource || !activeResource.list || typeof activeResource.index !== 'number' || activeResource.list.length === 0) return;
    const nextIndex = (activeResource.index + 1) % activeResource.list.length;
    const next = activeResource.list[nextIndex];
    mediaKindRef.current = next.type === 'video' ? 'video' : 'audio';
    setActiveResource({ ...next, index: nextIndex, list: activeResource.list });
    setIsPlaying(true);
    setCurrentTime(0);
  }

  function prevResource() {
    if (!activeResource || !activeResource.list || typeof activeResource.index !== 'number' || activeResource.list.length === 0) return;
    const prevIndex = (activeResource.index - 1 + activeResource.list.length) % activeResource.list.length;
    const prev = activeResource.list[prevIndex];
    mediaKindRef.current = prev.type === 'video' ? 'video' : 'audio';
    setActiveResource({ ...prev, index: prevIndex, list: activeResource.list });
    setIsPlaying(true);
    setCurrentTime(0);
  }

  function updatePlaybackTime(timeInSeconds) {
    setCurrentTime(Math.max(0, Number(timeInSeconds) || 0));
  }

  return (
    <ResourcePlayerContext.Provider
      value={{
        activeResource,
        isPlaying,
        currentTime,
        playResource,
        pauseResource,
        resumeResource,
        stopResource,
        nextResource,
        prevResource,
        updatePlaybackTime,
      }}
    >
      {children}
    </ResourcePlayerContext.Provider>
  );
}

export function useResourcePlayer() {
  return useContext(ResourcePlayerContext);
}

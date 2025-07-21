import React, { createContext, useContext, useState } from 'react';

const ResourcePlayerContext = createContext();

export function ResourcePlayerProvider({ children }) {
  const [activeResource, setActiveResource] = useState(null); // { type, index, list }
  const [isPlaying, setIsPlaying] = useState(false);

  // Play a resource (song, e-book, etc.)
  function playResource(resource, list = [], index = 0) {
    if (!resource) return;
    setActiveResource({ ...resource, type: resource.type, index, list });
    setIsPlaying(true);
  }

  // Pause playback
  function pauseResource() {
    setIsPlaying(false);
  }

  // Next resource in list
  function nextResource() {
    if (!activeResource || !activeResource.list || typeof activeResource.index !== 'number') return;
    const nextIndex = (activeResource.index + 1) % activeResource.list.length;
    setActiveResource({ ...activeResource.list[nextIndex], type: activeResource.type, index: nextIndex, list: activeResource.list });
    setIsPlaying(true);
  }

  // Previous resource in list
  function prevResource() {
    if (!activeResource || !activeResource.list || typeof activeResource.index !== 'number') return;
    const prevIndex = (activeResource.index - 1 + activeResource.list.length) % activeResource.list.length;
    setActiveResource({ ...activeResource.list[prevIndex], type: activeResource.type, index: prevIndex, list: activeResource.list });
    setIsPlaying(true);
  }

  return (
    <ResourcePlayerContext.Provider value={{
      activeResource,
      isPlaying,
      playResource,
      pauseResource,
      nextResource,
      prevResource
    }}>
      {children}
    </ResourcePlayerContext.Provider>
  );
}

export function useResourcePlayer() {
  return useContext(ResourcePlayerContext);
}

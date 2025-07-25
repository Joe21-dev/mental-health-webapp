import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  Search, 
  Play, 
  SkipBack, 
  SkipForward, 
  Volume2,
  Brain,
  MessageCircle,
  Users,
  TrendingUp,
  Heart,
  Menu,
  X,
  BookOpen,
  Shield,
  Plus
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_API_URL;

const cardImages = {
  songs: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80', // music poster
  podcasts: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80', // podcast mic
  ebooks: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80', // book
  videos: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80' // motivational speaker
};

const Resources = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('home');
  const [showList, setShowList] = useState(null);
  const [resourceData, setResourceData] = useState({ songs: [], podcasts: [], ebooks: [], videos: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showApiKeyInfo, setShowApiKeyInfo] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [activeResource, setActiveResource] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Info alert for user guidance
  const [showInfo, setShowInfo] = useState(true);
  useEffect(() => {
    if (showInfo) {
      const timer = setTimeout(() => setShowInfo(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [showInfo]);

  // Fetch resources function
  const fetchResources = () => {
    setLoading(true);
    let url = `${BACKEND_URL}/api/resources`;
    if (filterType !== 'all') {
      url = `${BACKEND_URL}/api/resources/filter/${filterType}`;
    } else if (searchTerm) {
      url = `${BACKEND_URL}/api/resources/search?q=${encodeURIComponent(searchTerm)}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const grouped = { songs: [], podcasts: [], ebooks: [], videos: [] };
        data.forEach(r => {
          if (r.type === 'song') grouped.songs.push(r);
          else if (r.type === 'podcast') grouped.podcasts.push(r);
          else if (r.type === 'ebook') grouped.ebooks.push(r);
          else if (r.type === 'video') grouped.videos.push(r);
        });
        setResourceData(grouped);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load resources');
        setLoading(false);
      });
  };

  // Initial fetch
  useEffect(() => {
    fetchResources();
  }, [filterType, searchTerm]);

  // Sync active resource across tabs/devices using localStorage
  useEffect(() => {
    const storedActive = localStorage.getItem('activeResource');
    if (storedActive) {
      try {
        setActiveResource(JSON.parse(storedActive));
      } catch {}
    }
  }, []);
  useEffect(() => {
    if (activeResource) {
      localStorage.setItem('activeResource', JSON.stringify(activeResource));
    } else {
      localStorage.removeItem('activeResource');
    }
  }, [activeResource]);

  // Delete resource handler
  const handleDeleteResource = async (resource) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await fetch(`${BACKEND_URL}/api/resources/${resource._id}`, { method: 'DELETE' });
      fetchResources(); // Refetch after delete
      if (activeResource && activeResource._id === resource._id) setActiveResource(null);
    } catch {
      alert('Failed to delete resource');
    }
  };

  // Defensive check for activeResource in ActiveCard
  const ActiveCard = () => {
    if (!activeResource) return (
      <div className="relative p-6 overflow-hidden text-white bg-gradient-to-tl from-black to-gray-500 rounded-3xl flex items-center justify-center min-h-[400px]">
        <span className="text-lg font-semibold">Select a resource:</span>
      </div>
    );
    // Song or Podcast: audio player
    if ((activeResource.type === 'song' || activeResource.type === 'podcast') && activeResource.url) {
      return (
        <div className="relative p-6 overflow-hidden text-white bg-black rounded-3xl flex flex-col items-center justify-center" style={{backgroundImage: `url(${cardImages[activeResource.type + 's']})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
          <div className={`absolute inset-0 rounded-3xl ${activeResource.type === 'song' ? 'bg-blue-900/60' : 'bg-purple-900/60'}`}></div>
          <div className="relative z-10 w-full flex flex-col items-center">
            <h3 className="mb-4 text-2xl font-bold text-white drop-shadow-lg">Now Playing: {activeResource.title}</h3>
            <div className="flex items-center gap-4 mb-4">
              <img src={activeResource.type === 'song' ? cardImages.songs : cardImages.podcasts} alt="cover" className="w-20 h-20 rounded-xl shadow-lg object-cover" />
              <div>
                <div className="text-lg font-semibold text-white">{activeResource.type === 'song' ? activeResource.artist : activeResource.host}</div>
                <div className="text-sm text-gray-200">{activeResource.duration}</div>
              </div>
            </div>
            <audio
              ref={audioRef}
              controls
              autoPlay={isPlaying}
              src={activeResource.url}
              className="w-full max-w-lg mb-4 bg-gray-900 rounded-xl shadow-lg border border-blue-400"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              Your browser does not support the audio element.
            </audio>
            <div className="flex items-center gap-2 mt-2">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow transition"
                onClick={() => setIsPlaying(prev => !prev)}
              >{isPlaying ? 'Pause' : 'Play'}</button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 shadow transition"
                onClick={() => setActiveResource(null)}
              >Close Player</button>
              <button
                className="px-4 py-2 bg-blue-400 text-white rounded-full hover:bg-blue-500 shadow transition"
                onClick={() => {
                  const idx = resourceData.songs.findIndex(s => s._id === activeResource._id);
                  if (idx > 0) setActiveResource(resourceData.songs[idx - 1]);
                }}
                disabled={!activeResource}
              ><SkipBack size={16} /></button>
              <button
                className="px-4 py-2 bg-blue-400 text-white rounded-full hover:bg-blue-500 shadow transition"
                onClick={() => {
                  const idx = resourceData.songs.findIndex(s => s._id === activeResource._id);
                  if (idx < resourceData.songs.length - 1) setActiveResource(resourceData.songs[idx + 1]);
                }}
                disabled={!activeResource}
              ><SkipForward size={16} /></button>
            </div>
          </div>
        </div>
      );
    }
    // Video: video player
    if (activeResource.type === 'video' && activeResource.url) {
      return (
        <div className="relative p-6 overflow-hidden text-white bg-black rounded-3xl flex flex-col items-center justify-center" style={{backgroundImage: `url(${cardImages.videos})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
          <div className="absolute inset-0 rounded-3xl bg-orange-900/60"></div>
          <div className="relative z-10 w-full flex flex-col items-center">
            <h3 className="mb-4 text-lg font-semibold">Now Playing: {activeResource.title}</h3>
            <video controls autoPlay src={activeResource.url} className="w-full max-w-lg mb-4" style={{maxHeight: '300px'}}></video>
            <div className="mb-2 text-white text-sm">Speaker: {activeResource.speaker}</div>
            <div className="flex items-center gap-2 mt-2">
              <button className="px-4 py-2 bg-orange-400 text-white rounded-full hover:bg-orange-500 shadow transition" onClick={() => {
                const idx = resourceData.videos.findIndex(v => v._id === activeResource._id);
                if (idx > 0) setActiveResource(resourceData.videos[idx - 1]);
              }}><SkipBack size={16} /></button>
              <button className="px-4 py-2 bg-orange-400 text-white rounded-full hover:bg-orange-500 shadow transition" onClick={() => {
                const idx = resourceData.videos.findIndex(v => v._id === activeResource._id);
                if (idx < resourceData.videos.length - 1) setActiveResource(resourceData.videos[idx + 1]);
              }}><SkipForward size={16} /></button>
            </div>
          </div>
        </div>
      );
    }
    // E-book: PDF modal
    if (activeResource.type === 'ebook' && activeResource.url) {
      return (
        <div className="relative p-6 overflow-hidden text-white bg-black rounded-3xl flex flex-col items-center justify-center" style={{backgroundImage: `url(${cardImages.ebooks})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
          <div className="absolute inset-0 rounded-3xl bg-green-900/60"></div>
          <div className="relative z-10 w-full flex flex-col items-center">
            <h3 className="mb-4 text-lg font-semibold">E-book: {activeResource.title}</h3>
            <button className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600" onClick={() => setShowPdfModal(true)}>Read PDF</button>
            <div className="mb-2 text-white text-sm">Author: {activeResource.author}</div>
            <div className="flex items-center gap-2 mt-2">
              <button className="px-4 py-2 bg-green-400 text-white rounded-full hover:bg-green-500 shadow transition" onClick={() => {
                const idx = resourceData.ebooks.findIndex(e => e._id === activeResource._id);
                if (idx > 0) setActiveResource(resourceData.ebooks[idx - 1]);
              }}><SkipBack size={16} /></button>
              <button className="px-4 py-2 bg-green-400 text-white rounded-full hover:bg-green-500 shadow transition" onClick={() => {
                const idx = resourceData.ebooks.findIndex(e => e._id === activeResource._id);
                if (idx < resourceData.ebooks.length - 1) setActiveResource(resourceData.ebooks[idx + 1]);
              }}><SkipForward size={16} /></button>
            </div>
          </div>
          {showPdfModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowPdfModal(false)}>
              <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-2xl relative animate-fadeIn border border-gray-100 flex flex-col" onClick={e => e.stopPropagation()}>
                <button type="button" className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl" onClick={() => setShowPdfModal(false)} aria-label="Close"><X size={24} /></button>
                <iframe src={activeResource.url} title="E-book PDF" width="100%" height="600px" style={{border:0}}></iframe>
              </div>
            </div>
          )}
        </div>
      );
    }
    // Default fallback
    return (
      <div className="relative p-6 overflow-hidden text-white bg-black rounded-3xl flex items-center justify-center min-h-[200px]">
        <span className="text-lg font-semibold">No resource selected</span>
      </div>
    );
  };

  // Cards: visually appealing fixed width/height and scrollable modal for all resources
  const CARD_STYLE = {
    width: '340px',
    height: '340px',
    minWidth: '300px',
    minHeight: '300px',
    maxWidth: '100%',
    maxHeight: '100%',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    borderRadius: '1.5rem',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  const SongsCard = () => (
    <div className="relative" style={CARD_STYLE}>
      <div className="absolute inset-0 bg-blue-900/60 rounded-3xl"></div>
      <div className="relative z-10 p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold cursor-pointer text-blue-100" onClick={() => setShowList('songs')}>Songs</h3>
        </div>
        <ul className="space-y-3 flex-1 overflow-y-auto">
          {resourceData.songs.slice(0, 4).map((song, idx) => (
            <li key={song._id || song.url || idx} className={`flex items-center justify-between p-3 rounded-xl${activeResource?.type === 'song' && activeResource?.title === song.title ? ' bg-blue-200/60' : ''} hover:bg-blue-100/40 transition cursor-pointer text-white`} onClick={() => setActiveResource(song)}>
              <div>
                <div className="font-semibold text-blue-100">{song.title}</div>
                <div className="text-xs text-blue-200">{song.artist} • {song.duration}</div>
              </div>
              {song.url ? (
                <button className={`p-2 bg-blue-500 text-white rounded-full ml-2${activeResource?.type === 'song' && activeResource?.title === song.title ? ' ring-2 ring-blue-400' : ''}`} onClick={e => { e.stopPropagation(); setActiveResource(song); }}>
                  <Play size={16} />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
        {/* Modal for all songs */}
        {showList === 'songs' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowList(null)}>
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg space-y-5 relative animate-fadeIn border border-gray-100 flex flex-col" style={{maxHeight:'80vh'}} onClick={e => e.stopPropagation()}>
              <button type="button" className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl" onClick={() => setShowList(null)} aria-label="Close"><X size={24} /></button>
              <h3 className="font-semibold text-lg mb-4 text-blue-700">All Songs</h3>
              <ul className="space-y-3 overflow-y-auto" style={{maxHeight:'60vh'}}>
                {resourceData.songs.map((song, idx) => (
                  <li key={song._id || song.url || idx} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-blue-100${activeResource?.type === 'song' && activeResource?.title === song.title ? ' bg-blue-50' : ''}`} onClick={() => { setActiveResource(song); setShowList(null); }}>
                    <div>
                      <div className="font-semibold text-blue-700">{song.title}</div>
                      <div className="text-xs text-gray-500">{song.artist} • {song.duration}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className={`p-2 bg-blue-500 text-white rounded-full ml-2${activeResource?.type === 'song' && activeResource?.title === song.title ? ' ring-2 ring-blue-400' : ''}`}><Play size={16} /></button>
                      <button className="p-2 text-red-500 hover:text-red-700" onClick={e => { e.stopPropagation(); handleDeleteResource(song); }} title="Delete"><X size={16} /></button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
    
  );

  const PodcastsCard = () => (
    <div className="relative" style={CARD_STYLE}>
      <div className="absolute inset-0 bg-purple-900/60 rounded-3xl"></div>
      <div className="relative z-10 p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold cursor-pointer text-purple-100" onClick={() => setShowList('podcasts')}>Podcasts</h3>
        </div>
        <ul className="space-y-3 flex-1 overflow-y-auto">
          {resourceData.podcasts.slice(0, 4).map((podcast, idx) => (
            <li key={podcast._id || podcast.url || idx} className={`flex items-center justify-between p-3 rounded-xl${activeResource?.type === 'podcast' && activeResource?.title === podcast.title ? ' bg-purple-200/60' : ''} hover:bg-purple-100/40 transition cursor-pointer text-white`} onClick={() => setActiveResource(podcast)}>
              <div>
                <div className="font-semibold text-purple-100">{podcast.title}</div>
                <div className="text-xs text-purple-200">{podcast.host} • {podcast.duration} • {podcast.type}</div>
              </div>
              {podcast.url ? (
                <button className={`p-2 bg-purple-500 text-white rounded-full ml-2${activeResource?.type === 'podcast' && activeResource?.title === podcast.title ? ' ring-2 ring-purple-400' : ''}`} onClick={e => { e.stopPropagation(); setActiveResource(podcast); }}>
                  <Play size={16} />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
        {/* Modal for all podcasts */}
        {showList === 'podcasts' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowList(null)}>
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg space-y-5 relative animate-fadeIn border border-gray-100 flex flex-col" style={{maxHeight:'80vh'}} onClick={e => e.stopPropagation()}>
              <button type="button" className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl" onClick={() => setShowList(null)} aria-label="Close"><X size={24} /></button>
              <h3 className="font-semibold text-lg mb-4 text-purple-700">All Podcasts</h3>
              <ul className="space-y-3 overflow-y-auto" style={{maxHeight:'60vh'}}>
                {resourceData.podcasts.map((podcast, idx) => (
                  <li key={podcast._id || podcast.url || idx} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-purple-100${activeResource?.type === 'podcast' && activeResource?.title === podcast.title ? ' bg-purple-50' : ''}`} onClick={() => { setActiveResource(podcast); setShowList(null); }}>
                    <div>
                      <div className="font-semibold text-purple-700">{podcast.title}</div>
                      <div className="text-xs text-gray-500">{podcast.host} • {podcast.duration} • {podcast.type}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className={`p-2 bg-purple-500 text-white rounded-full ml-2${activeResource?.type === 'podcast' && activeResource?.title === podcast.title ? ' ring-2 ring-purple-400' : ''}`}><Play size={16} /></button>
                      <button className="p-2 text-red-500 hover:text-red-700" onClick={e => { e.stopPropagation(); handleDeleteResource(podcast); }} title="Delete"><X size={16} /></button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const EbooksCard = () => (
    <div className="relative" style={CARD_STYLE}>
      <div className="absolute inset-0 bg-green-900/60 rounded-3xl"></div>
      <div className="relative z-10 p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold cursor-pointer text-green-100" onClick={() => setShowList('ebooks')}>E-books</h3>
        </div>
        <ul className="space-y-3 flex-1 overflow-y-auto">
          {resourceData.ebooks.slice(0, 4).map((book, idx) => (
            <li key={idx} className={`flex items-center justify-between p-3 rounded-xl${activeResource?.type === 'ebook' && activeResource?.title === book.title ? ' bg-green-200/60' : ''} hover:bg-green-100/40 transition cursor-pointer text-white`} onClick={() => setActiveResource(book)}>
              <div>
                <div className="font-semibold text-green-100">{book.title}</div>
                <div className="text-xs text-green-200">{book.author}</div>
              </div>
              <button className={`p-2 bg-green-500 text-white rounded-full ml-2${activeResource?.type === 'ebook' && activeResource?.title === book.title ? ' ring-2 ring-green-400' : ''}`}><BookOpen size={16} /></button>
            </li>
          ))}
        </ul>
        {/* Modal for all ebooks */}
        {showList === 'ebooks' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowList(null)}>
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg space-y-5 relative animate-fadeIn border border-gray-100 flex flex-col" style={{maxHeight:'80vh'}} onClick={e => e.stopPropagation()}>
              <button type="button" className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl" onClick={() => setShowList(null)} aria-label="Close"><X size={24} /></button>
              <h3 className="font-semibold text-lg mb-4 text-green-700">All E-books</h3>
              <ul className="space-y-3 overflow-y-auto" style={{maxHeight:'60vh'}}>
                {resourceData.ebooks.map((book, idx) => (
                  <li key={idx} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-green-100${activeResource?.type === 'ebook' && activeResource?.title === book.title ? ' bg-green-50' : ''}`} onClick={() => { setActiveResource(book); setShowList(null); }}>
                    <div>
                      <div className="font-semibold text-green-700">{book.title}</div>
                      <div className="text-xs text-gray-500">{book.author}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className={`p-2 bg-green-500 text-white rounded-full ml-2${activeResource?.type === 'ebook' && activeResource?.title === book.title ? ' ring-2 ring-green-400' : ''}`}><BookOpen size={16} /></button>
                      <button className="p-2 text-red-500 hover:text-red-700" onClick={e => { e.stopPropagation(); handleDeleteResource(book); }} title="Delete"><X size={16} /></button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const VideosCard = () => (
    <div className="relative" style={CARD_STYLE}>
      <div className="absolute inset-0 bg-orange-900/60 rounded-3xl"></div>
      <div className="relative z-10 p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold cursor-pointer text-orange-100" onClick={() => setShowList('videos')}>Motivational Videos</h3>
        </div>
        <ul className="space-y-3 flex-1 overflow-y-auto">
          {resourceData.videos.slice(0, 4).map((video, idx) => (
            <li key={video._id || video.url || idx} className={`flex items-center justify-between p-3 rounded-xl${activeResource?.type === 'video' && activeResource?.title === video.title ? ' bg-orange-200/60' : ''} hover:bg-orange-100/40 transition cursor-pointer text-white`} onClick={() => setActiveResource(video)}>
              <div>
                <div className="font-semibold text-orange-100">{video.title}</div>
                <div className="text-xs text-orange-200">{video.speaker} • {video.duration}</div>
              </div>
              <button className={`p-2 bg-orange-500 text-white rounded-full ml-2${activeResource?.type === 'video' && activeResource?.title === video.title ? ' ring-2 ring-orange-400' : ''}`}><Play size={16} /></button>
            </li>
          ))}
        </ul>
        {/* Modal for all videos */}
        {showList === 'videos' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowList(null)}>
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg space-y-5 relative animate-fadeIn border border-gray-100 flex flex-col" style={{maxHeight:'80vh'}} onClick={e => e.stopPropagation()}>
              <button type="button" className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl" onClick={() => setShowList(null)} aria-label="Close"><X size={24} /></button>
              <h3 className="font-semibold text-lg mb-4 text-orange-700">All Videos</h3>
              <ul className="space-y-3 overflow-y-auto" style={{maxHeight:'60vh'}}>
                {resourceData.videos.map((video, idx) => (
                  <li key={video._id || video.url || idx} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-orange-100${activeResource?.type === 'video' && activeResource?.title === video.title ? ' bg-orange-50' : ''}`} onClick={() => { setActiveResource(video); setShowList(null); }}>
                    <div>
                      <div className="font-semibold text-orange-700">{video.title}</div>
                      <div className="text-xs text-gray-500">{video.speaker} • {video.duration}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className={`p-2 bg-orange-500 text-white rounded-full ml-2${activeResource?.type === 'video' && activeResource?.title === video.title ? ' ring-2 ring-orange-400' : ''}`}><Play size={16} /></button>
                      <button className="p-2 text-red-500 hover:text-red-700" onClick={e => { e.stopPropagation(); handleDeleteResource(video); }} title="Delete"><X size={16} /></button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    file: null,
    title: ''
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleUploadChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setUploadForm(f => ({ ...f, file: files[0] }));
    } else {
      setUploadForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);
    setUploadSuccess(false);
    if (!uploadForm.file || !uploadForm.title) {
      setUploadError('File and name are required.');
      setUploading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('title', uploadForm.title);
      await new Promise((resolve, reject) => {
        const xhr = new window.XMLHttpRequest();
        xhr.open('POST', `${BACKEND_URL}/api/resources/upload`);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setUploadProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const uploadResult = JSON.parse(xhr.responseText);
            const newResource = uploadResult.resource;
            if (!newResource || !newResource.type) {
              setUploadError('Invalid resource returned from server');
              setUploading(false);
              return reject();
            }
            fetchResources(); // Refetch after upload
            setShowUploadModal(false);
            setUploadForm({ file: null, title: '' });
            setUploadSuccess(true);
            resolve();
          } else {
            setUploadError('Upload failed');
            setUploading(false);
            reject();
          }
        };
        xhr.onerror = () => {
          setUploadError('Upload failed');
          setUploading(false);
          reject();
        };
        xhr.send(formData);
      });
    } catch (error) {
      setUploadError('Upload failed');
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-6">
      {/* Upload Floating Button */}
      <button
        className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
        onClick={() => setShowUploadModal(true)}
        aria-label="Upload Resource"
      >
        <Plus size={28} />
      </button>
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowUploadModal(false)}>
          <form className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg relative animate-fadeIn border border-gray-100 flex flex-col gap-4" onClick={e => e.stopPropagation()} onSubmit={handleUploadSubmit}>
            <button type="button" className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl" onClick={() => setShowUploadModal(false)} aria-label="Close"><X size={24} /></button>
            <h2 className="text-xl font-bold mb-2 text-blue-700">Upload Resource</h2>
            <input type="file" name="file" accept="audio/*,video/*,application/pdf" required className="mb-2" onChange={handleUploadChange} />
            <input type="text" name="title" placeholder="Name (unique)" required className="border rounded-lg px-3 py-2" value={uploadForm.title} onChange={handleUploadChange} />
            {uploadError && <div className="text-red-500 text-sm">{uploadError}</div>}
            {uploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}
            {uploadSuccess && <div className="text-green-600 text-sm font-semibold">Upload successful!</div>}
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-semibold mt-2 disabled:opacity-60" disabled={uploading}>{uploading ? `Uploading... (${uploadProgress}%)` : 'Upload'}</button>
          </form>
        </div>
      )}
      {showInfo && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-blue-100 border border-blue-300 rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 animate-fadeIn" style={{maxWidth:'95vw'}}>
          <span className="text-blue-800 text-sm font-medium flex-1">Browse and play songs, podcasts, e-books, and videos to support your mental health. Click a card title to see all resources. Select any item to play or read instantly.</span>
          <button className="text-blue-400 hover:text-blue-700 text-xl" onClick={() => setShowInfo(false)} aria-label="Close"><X size={20} /></button>
        </div>
      )}
      {/* Desktop Header */}
      <div className='pt-6'>
      <nav className="flex items-center justify-between mb-0">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/')}> {/* Home icon clickable */}
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center space-x-2">
            <button
              className={`bg-gray-800 text-gray-100 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:scale-105 transition-transform border border-gray-800${location.pathname === '/platform' ? ' ring-2 ring-blue-500' : ''}`}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              onClick={() => navigate('/platform')}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button
              className={`bg-gray-100 text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:bg-gray-800 hover:text-gray-100 transition-colors border border-gray-200${location.pathname === '/platform/therapists' ? ' ring-2 ring-blue-500' : ''}`}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              onClick={() => navigate('/platform/therapists')}
          
            >
              <Users className="w-4 h-4" />
              <span>Therapists</span>
            </button>
            <button
              className={`bg-gray-100 text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:bg-gray-800 hover:text-gray-100 transition-colors border border-gray-200${location.pathname === '/platform/scheduler' ? ' ring-2 ring-blue-500' : ''}`}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              onClick={() => navigate('/platform/scheduler')}
            >
              <BookOpen className="w-4 h-4" />
              <span>Scheduler</span>
            </button>
            <button
              className={`bg-gray-100 text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:bg-gray-800 hover:text-gray-100 transition-colors border border-gray-200${location.pathname === '/platform/chat' ? ' ring-2 ring-blue-500' : ''}`}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              onClick={() => navigate('/platform/chat')}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat.ai</span>
            </button>
            <button
              className={`text-blue-700 bg-blue-100 border border-blue-200 font-bold px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:bg-gray-800 hover:text-gray-100 transition-colors${location.pathname === '/platform/resources' ? ' ring-2 ring-blue-500' : ''}`}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              disabled
            >
              <Shield className="w-4 h-4" />
              <span>Resources</span>
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center gap-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 bg-white rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <div className="relative">
              <select
                className="ml-2 w-32 px-3 py-2 rounded-full border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 font-semibold shadow-sm transition duration-150 ease-in-out hover:border-blue-400"
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                style={{ minWidth: '7rem', maxWidth: '8rem' }}
              >
                <option value="all" className="bg-white text-blue-800 font-medium">All</option>
                <option value="song" className="bg-blue-50 text-blue-700 font-medium">Songs</option>
                <option value="podcast" className="bg-purple-50 text-purple-700 font-medium">Podcasts</option>
                <option value="ebook" className="bg-green-50 text-green-700 font-medium">E-books</option>
                <option value="video" className="bg-orange-50 text-orange-700 font-medium">Videos</option>
              </select>
              {/* Only one dropdown arrow SVG below */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">U</span>
          </div>
          
        </div>
      </nav>
      </div>

      <div className="flex">
        {/* Left: ActiveCard (desktop only) */}
        <div className="hidden lg:block flex-1 p-4 pb-24 lg:px-8">
          <div className="md:col-span-2">
            <ActiveCard />
          </div>
        </div>
        {/* Right: Resource cards in 2 columns (desktop only) */}
        <div className="w-full lg:w-[60%] grid grid-cols-1 md:grid-cols-2 gap-6 p-4 pb-24 lg:px-8">
          <div className="overflow-y-auto max-h-[65vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <SongsCard />
          </div>
          <div className="overflow-y-auto max-h-[65vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <PodcastsCard />
          </div>
          <div className="overflow-y-auto max-h-[65vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <EbooksCard />
          </div>
          <div className="overflow-y-auto max-h-[65vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <VideosCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;
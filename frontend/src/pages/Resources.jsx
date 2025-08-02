import React, { useState, useEffect } from 'react';
import { useResourcePlayer } from '../ResourcePlayerContext';
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
  // Use global player state from context
  const { activeResource, setActiveResource, isPlaying, setIsPlaying, audioRef, playResource } = useResourcePlayer();

  // No need for workaround, context keeps player alive
  // For continuous playback
  const PLAYBACK_KEY = 'resourcePlayback';
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  // For continuous playback
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
          // Normalize podcast type if title contains 'podcast' (case-insensitive)
          if ((r.type === 'podcast') || (typeof r.title === 'string' && /podcast/i.test(r.title))) {
            grouped.podcasts.push({ ...r, type: 'podcast' });
          } else if (r.type === 'song') {
            grouped.songs.push(r);
          } else if (r.type === 'ebook') {
            grouped.ebooks.push(r);
          } else if (r.type === 'video') {
            grouped.videos.push(r);
          }
        });
        setResourceData(grouped);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load resources');
        setLoading(false);
      });
  };

  // Avatar dropdown state
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);

  // User info state
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Fetch user info from backend if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setUserName(data.name || '');
          setUserEmail(data.email || '');
        })
        .catch(() => {
          setUserName('');
          setUserEmail('');
        });
    } else {
      setUserName(localStorage.getItem('userName') || '');
      setUserEmail(localStorage.getItem('userEmail') || '');
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchResources();
  }, [filterType, searchTerm]);

  // Remove all localStorage sync for player state

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
// ActiveCard at the top
  // Defensive check for activeResource usage
  const ActiveCard = () => {
    if (!activeResource || typeof activeResource !== 'object') {
      return (
        <div className="w-full mx-auto mt-2 mb-4 bg-gradient-to-br from-black to-gray-500 rounded-2xl flex items-center justify-center min-h-[120px] max-w-md" style={{height: '140px'}}>
          <span className="text-lg font-semibold text-white">Select a resource:</span>
        </div>
      );
    }
    if (!activeResource.type) {
      return (
        <div className="w-full mx-auto mt-2 mb-4 bg-gradient-to-br from-black to-gray-500 rounded-2xl flex items-center justify-center min-h-[120px] max-w-md" style={{height: '140px'}}>
          <span className="text-lg font-semibold text-white">Invalid resource selected.</span>
        </div>
      );
    }
    if ((activeResource.type === 'song' || activeResource.type === 'podcast') && activeResource.url) {
      return (
        <div className="w-full mx-auto  mb-4 bg-black rounded-2xl flex flex-col items-center justify-center relative overflow-hidden max-w-md" style={{height: '220px', backgroundImage: `url(${cardImages[activeResource.type + 's']})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
          <div className={`absolute inset-0  rounded-2xl ${activeResource.type === 'song' ? 'bg-blue-900/60' : 'bg-purple-900/60'}`}></div>
          <div className="relative z-10  w-full flex flex-col items-center">
            <h3 className="mb-2 mt-3 text-lg font-bold text-white text-center">Now Playing: {activeResource.title}</h3>
            <div className="text-center text-gray-200 mb-2">{activeResource.type === 'song' ? activeResource.artist : activeResource.host}</div>
            <audio
              ref={audioRef}
              controls
              autoPlay={isPlaying}
              src={activeResource.url}
              className="w-60 mb-2"
              onPlay={() => {
                setIsPlaying(true);
                // Save playback state
                localStorage.setItem(PLAYBACK_KEY, JSON.stringify({
                  time: audioRef.current?.currentTime || 0,
                  playing: true
                }));
              }}
              onPause={() => {
                setIsPlaying(false);
                localStorage.setItem(PLAYBACK_KEY, JSON.stringify({
                  time: audioRef.current?.currentTime || 0,
                  playing: false
                }));
              }}
              onTimeUpdate={() => {
                localStorage.setItem(PLAYBACK_KEY, JSON.stringify({
                  time: audioRef.current?.currentTime || 0,
                  playing: !audioRef.current?.paused
                }));
              }}
            >
              Your browser does not support the audio element.
            </audio>
            <button className="w-70 py-2 bg-blue-500 text-white rounded mt-2" onClick={() => setActiveResource(null)}>Close Player</button>
          </div>
        </div>
      );
    }
    if (activeResource.type === 'video' && activeResource.url) {
      return (
        <div className="w-full mx-auto mb-4 bg-black rounded-2xl flex flex-col items-center justify-center relative overflow-hidden max-w-md" style={{height: '320px', backgroundImage: `url(${cardImages.videos})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
          <div className="absolute inset-0 rounded-2xl bg-orange-900/60"></div>
          <div className="relative z-10 w-full flex flex-col items-center">
            <h3 className="mb-2 mt-6 text-lg font-bold text-white text-center">Now Playing: {activeResource.title}</h3>
            <video
              controls
              autoPlay={isPlaying}
              src={activeResource.url}
              className="w-75 mb-2 rounded-xl"
              style={{maxHeight: '180px'}} 
              ref={el => {
                if (el && localStorage.getItem(PLAYBACK_KEY)) {
                  try {
                    const { time, playing } = JSON.parse(localStorage.getItem(PLAYBACK_KEY));
                    el.currentTime = time || 0;
                    if (playing) setTimeout(() => el.play(), 200);
                  } catch {}
                }
              }}
              onPlay={e => {
                setIsPlaying(true);
                localStorage.setItem(PLAYBACK_KEY, JSON.stringify({
                  time: e.target.currentTime,
                  playing: true
                }));
              }}
              onPause={e => {
                setIsPlaying(false);
                localStorage.setItem(PLAYBACK_KEY, JSON.stringify({
                  time: e.target.currentTime,
                  playing: false
                }));
              }}
              onTimeUpdate={e => {
                localStorage.setItem(PLAYBACK_KEY, JSON.stringify({
                  time: e.target.currentTime,
                  playing: !e.target.paused
                }));
              }}
            ></video>
            <div className="text-center text-gray-200 mb-1">Speaker: {activeResource.speaker}</div>
            <button className="w-70 py-2 bg-orange-500 text-white rounded mt-2 mb-4" onClick={() => setActiveResource(null)}>Close Player</button>
          </div>
        </div>
      );
    }
    if (activeResource.type === 'ebook' && activeResource.url) {
      return (
        <div className="w-full mx-auto mb-4 bg-black rounded-2xl flex flex-col items-center justify-center relative overflow-hidden max-w-md" style={{height: '180px', backgroundImage: `url(${cardImages.ebooks})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
          <div className="absolute inset-0 rounded-2xl bg-green-900/60"></div>
          <div className="relative z-10 w-full flex flex-col items-center">
            <h3 className="mb-2 text-lg font-bold text-white text-center">E-book: {activeResource.title}</h3>
            <div className="text-center text-gray-200 mb-2">Author: {activeResource.author}</div>
            <button className="w-70 py-2 bg-green-500 text-white rounded mt-2" onClick={() => setShowPdfModal(true)}>Read PDF</button>
            {showPdfModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowPdfModal(false)}>
                <div className="bg-white rounded-2xl shadow-xl p-2 w-full max-w-xs relative animate-fadeIn border border-gray-100 flex flex-col" onClick={e => e.stopPropagation()}>
                  <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-black text-xl" onClick={() => setShowPdfModal(false)} aria-label="Close"><X size={20} /></button>
                  <iframe src={activeResource.url.startsWith('/resources/') ? `${window.location.origin}${activeResource.url}` : activeResource.url} title="E-book PDF" width="100%" height="120px" style={{border:0}}></iframe>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    // Fallback for unknown resource type
    return (
      <div className="w-full mx-auto mt-2 mb-4 bg-gradient-to-br from-black to-gray-500 rounded-2xl flex items-center justify-center min-h-[120px] max-w-md" style={{height: '140px'}}>
        <span className="text-lg font-semibold text-white">Unknown resource type.</span>
      </div>
    );
  };

  // ResourceCard: show scrollable modal of all resources when title is clicked, add chevron icon to indicate clickable
  const ResourceCard = ({ type, title, color, items, icon }) => {
    return (
      <div className={`rounded-2xl shadow-lg overflow-hidden mb-2`} style={{backgroundImage: `url(${cardImages[type]})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '140px', maxHeight: '180px'}}>
        <div className={`p-4 bg-${color}-900/70 rounded-2xl h-full flex flex-col justify-between`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowList(type)}>
              <h3 className={`font-semibold text-${color}-100 text-lg`}>{title}</h3>
              <ChevronDown size={18} className={`text-${color}-200`} />
            </div>
            {icon}
          </div>
        </div>
        {items.length === 0 && (
          <div className="p-4 text-center text-gray-300 text-sm">No resources</div>
        )}
        {/* Modal for all resources of this type */}
        {showList === type && (
          <div className="fixed inset-0 z-50 flex px-6 items-center justify-center bg-black/70" onClick={() => setShowList(null)}>
            <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-sm relative animate-fadeIn border border-gray-100 flex flex-col" style={{maxHeight:'80vh'}} onClick={e => e.stopPropagation()}>
              <button type="button" className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl" onClick={() => setShowList(null)} aria-label="Close"><X size={24} /></button>
              <h3 className={`font-semibold text-lg mb-4 text-${color}-700`}>All {title}</h3>
              <ul className="space-y-2 overflow-y-auto" style={{maxHeight:'60vh'}}>
                {items.map((item, idx) => (
                  <li key={item._id || item.url || idx} className={`flex items-center justify-between p-2 rounded-xl bg-${color}-50 text-${color}-700 cursor-pointer`} onClick={() => { setActiveResource(item); setShowList(null); }}>
                    <div>
                      <div className={`font-semibold text-${color}-700`}>{item.title}</div>
                      <div className="text-xs text-gray-500">{type === 'songs' ? item.artist : type === 'podcasts' ? item.host : type === 'ebooks' ? item.author : item.speaker}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className={`p-2 bg-${color}-500 text-white rounded-full ml-2`}>
                        {type === 'ebooks' ? <BookOpen size={16} /> : <Play size={16} />}
                      </button>
                      <button className="p-2 text-red-500 hover:text-red-700" onClick={e => { e.stopPropagation(); handleDeleteResource(item); }} title="Delete"><X size={16} /></button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      
    );

  };


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
    // File size check (Cloudinary free tier max 100MB)
    if (uploadForm.file.size > 100 * 1024 * 1024) {
      setUploadError('File too large. Max 100MB allowed.');
      setUploading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('title', uploadForm.title);
      // Use local upload endpoint if LOCAL_DEV is set and running on localhost
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || import.meta.env.VITE_LOCAL_DEV === 'true';
      const uploadUrl = isLocal ? `${BACKEND_URL}/api/resources/upload-local` : `${BACKEND_URL}/api/resources/upload`;
      await new Promise((resolve, reject) => {
        const xhr = new window.XMLHttpRequest();
        xhr.open('POST', uploadUrl);
        xhr.timeout = 45000; // 45 seconds max
        xhr.withCredentials = false;
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setUploadProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            let uploadResult;
            try {
              uploadResult = JSON.parse(xhr.responseText);
            } catch (err) {
              setUploadError('Server returned invalid response.');
              setUploading(false);
              return reject();
            }
            // Accept both {resource} and direct resource object
            const newResource = uploadResult.resource || uploadResult;
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
            let errorMsg = 'Upload failed';
            try {
              const resp = JSON.parse(xhr.responseText);
              if (resp && resp.error) errorMsg = resp.error;
              if (resp && resp.details) errorMsg += ': ' + resp.details;
            } catch {}
            setUploadError(errorMsg);
            setUploading(false);
            reject();
          }
        };
        xhr.onerror = () => {
          setUploadError('Upload failed (network error)');
          setUploading(false);
          reject();
        };
        xhr.ontimeout = () => {
          setUploadError('Upload timed out (max 45 seconds). Try a smaller file or faster connection.');
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

  // Sync active resource across tabs/devices using localStorage
  useEffect(() => {
    const storedActive = localStorage.getItem('activeResource');
    if (storedActive) {
      try {
        setActiveResource(JSON.parse(storedActive));
      } catch {}
    }
    // Restore playback state
    const pb = localStorage.getItem(PLAYBACK_KEY);
    if (pb && audioRef.current) {
      try {
        const { time, playing } = JSON.parse(pb);
        audioRef.current.currentTime = time || 0;
        if (playing) {
          setTimeout(() => audioRef.current && audioRef.current.play(), 200);
        }
      } catch {}
    }
  }, []);
  // Save activeResource and playback state
  useEffect(() => {
    if (activeResource) {
      localStorage.setItem('activeResource', JSON.stringify(activeResource));
    } else {
      localStorage.removeItem('activeResource');
      localStorage.removeItem(PLAYBACK_KEY);
    }
  }, [activeResource]);

 

  // Password check logic
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === 'root') {
      setShowPasswordModal(false);
      setShowUploadModal(true);
    } else  {
      setShowPasswordModal(true);
      setPasswordError('Wrong Password!!! Contact Admin');
    } 
  };

  const handleShowUploadModal = () => {
    setPasswordInput('');
    setShowPasswordModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-6">
      {/* Upload Floating Button (visible to all users) */}
      <button
        className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
        onClick={handleShowUploadModal}
        aria-label="Upload Resource"
      >
        <Plus size={28} />
      </button>
      {/* Password Modal (z-60, above upload modal) */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60" onClick={() => setShowPasswordModal(false)}>
          <form className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xs relative animate-fadeIn border border-gray-100 flex flex-col gap-4" onClick={e => e.stopPropagation()} onSubmit={handlePasswordSubmit}>
            <button type="button" className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl" onClick={() => setShowPasswordModal(false)} aria-label="Close"><X size={24} /></button>
            <h2 className="text-xl font-bold mb-2 text-blue-700">Admin Password</h2>
            <input type="password" name="password" placeholder="Enter password" required className="border rounded-lg px-3 py-2" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} autoFocus />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-semibold mt-2">Continue</button>
          </form>
        </div>
      )}
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-200/60 via-white/80 to-blue-100/80 backdrop-blur-sm" onClick={() => setShowUploadModal(false)}>
          <form
            className="relative bg-white rounded-3xl shadow-2xl p-10 w-full max-w-xl flex flex-col gap-6 border border-blue-100 animate-fadeIn"
            style={{ boxShadow: '0 8px 40px 0 rgba(37, 99, 235, 0.15)' }}
            onClick={e => e.stopPropagation()}
            onSubmit={handleUploadSubmit}
          >
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-blue-700 text-3xl transition-colors"
              onClick={() => setShowUploadModal(false)}
              aria-label="Close"
            >
              <X size={28} />
            </button>
            <div className="flex flex-col items-center gap-2 mb-2">
              <div className="bg-blue-100 rounded-full p-3 mb-2 shadow-md">
                <Plus size={32} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-blue-700 tracking-tight mb-1">Upload a New Resource</h2>
              <p className="text-gray-500 text-sm text-center max-w-xs">Add a song, podcast, e-book, or video to the platform. Only audio, video, or PDF files are accepted. Title should be unique.</p>
            </div>
            <div className="flex flex-col gap-3">
              <label className="block text-sm font-semibold text-blue-700 mb-1">File</label>
              <input
                type="file"
                name="file"
                accept="audio/*,video/*,application/pdf"
                required
                className="block w-full border border-blue-200 rounded-xl px-4 py-2 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-200 file:text-blue-700 hover:file:bg-blue-300 transition"
                onChange={handleUploadChange}
                disabled={uploading}
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="block text-sm font-semibold text-blue-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                placeholder="Resource name (unique)"
                required
                className="w-full border border-blue-200 rounded-xl px-4 py-2 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-900"
                value={uploadForm.title}
                onChange={handleUploadChange}
                disabled={uploading}
              />
            </div>
            {uploadError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2 text-sm font-semibold animate-shake">
                <X size={18} className="text-red-400" />
                {uploadError}
              </div>
            )}
            {uploading && (
              <div className="w-full flex flex-col gap-2 items-center">
                <div className="w-full bg-blue-100 rounded-full h-3 mb-1">
                  <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <span className="text-blue-700 text-xs font-semibold">Uploading... {uploadProgress}%</span>
              </div>
            )}
            {uploadSuccess && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-2 text-sm font-semibold animate-fadeIn">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Upload successful!
              </div>
            )}
            <button
              type="submit"
              className="mt-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-full px-6 py-3 font-bold text-lg shadow-lg transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={uploading}
            >
              {uploading ? `Uploading... (${uploadProgress}%)` : 'Upload Resource'}
            </button>
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
          {/* Avatar dropdown */}
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer relative" onClick={() => setShowAvatarDropdown(v => !v)}>
          <span className="text-white font-bold text-lg">{(userName && userName.length > 0) ? userName[0].toUpperCase() : 'U'}</span>
          {showAvatarDropdown && (
                          <div className="absolute right-0 mt-12 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-fadeIn">
                            <button type="button" className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl" onClick={e => { e.stopPropagation(); setShowAvatarDropdown(false); }} aria-label="Close"><X /></button>
                            <div className="p-4 border-b border-gray-200">
                              <div className="font-bold text-lg text-blue-700">{userName}</div>
                              <div className="text-sm text-gray-600">{userEmail}</div>
                            </div>
                            <button
                              className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-b-xl font-semibold"
                              onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('userName');
                                localStorage.removeItem('userEmail');
                                window.location.href = '/signup';
                              }}
                            >Logout</button>
                          </div>
          )}
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
          {/* Active Card */}
                  {/* Resource Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {['songs', 'podcasts', 'ebooks', 'videos'].map(type => {
                      const items = resourceData[type] || [];
                      const color = type === 'songs' ? 'blue' : type === 'podcasts' ? 'purple' : type === 'ebooks' ? 'green' : 'orange';
                      return (
                        <ResourceCard
                          key={type}
                          type={type}
                          title={type.charAt(0).toUpperCase() + type.slice(1)}
                          color={color}
                          items={items}
                          icon={<Plus className={`w-6 h-6 text-${color}-200`} />}
                        />
                      );
                    })}
                  </div>
        </div>
      </div>
    </div>
  );
}

export default Resources;
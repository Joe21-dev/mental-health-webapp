import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  Play,
  SkipBack,
  SkipForward,
  Brain,
  MessageCircle,
  Users,
  TrendingUp,
  Heart,
  Menu,
  X,
  BookOpen,
  Shield,
  Plus,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { useResourcePlayer } from '../ResourcePlayerContext';

const cardImages = {
  songs: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
  podcasts: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
  ebooks: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
  videos: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80'
};

const BACKEND_URL = import.meta.env.VITE_API_URL;

const Resources = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showList, setShowList] = useState(null);
  const [resourceData, setResourceData] = useState({ songs: [], podcasts: [], ebooks: [], videos: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Global player state
  const { activeResource, isPlaying, playResource, pauseResource, resumeResource, stopResource, currentTime, updatePlaybackTime } = useResourcePlayer();
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('You require admin priviledges to add a resource');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadForm, setUploadForm] = useState({ file: null, title: '', type: 'song' });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Info alert for user guidance
  const [showInfo, setShowInfo] = useState(true);
  useEffect(() => {
    if (showInfo) {
      const timer = setTimeout(() => setShowInfo(false), 12000);
      return () => clearTimeout(timer);
    }
  }, [showInfo]);

  // Fetch resources function
  const fetchResources = () => {
    setLoading(true);
    fetch(`${BACKEND_URL}/api/resources`)
      .then(res => res.json())
      .then(data => {
        const grouped = { songs: [], podcasts: [], ebooks: [], videos: [] };
        data.forEach(r => {
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

  useEffect(() => {
    fetchResources();
  }, []);

  // Avatar dropdown state
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
  // User info state
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
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

  // ActiveCard
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
      const audioEl = useRef(null);
      useEffect(() => {
        const el = audioEl.current;
        if (!el) return;
        try { el.currentTime = Number(currentTime) || 0; } catch {}
        if (isPlaying) el.play?.().catch(() => {});
        else el.pause?.();
      }, [activeResource?.url]);
      useEffect(() => {
        const el = audioEl.current;
        if (!el) return;
        if (isPlaying) el.play?.().catch(() => {});
        else el.pause?.();
      }, [isPlaying]);
      return (
        <div className="w-full mx-auto mb-4 bg-black rounded-2xl flex flex-col items-center justify-center relative overflow-hidden max-w-md" style={{height: '220px', backgroundImage: `url(${cardImages[activeResource.type + 's']})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
          <div className={`absolute inset-0 rounded-2xl ${activeResource.type === 'song' ? 'bg-blue-900/60' : 'bg-purple-900/60'}`}></div>
          <div className="relative z-10 w-full flex flex-col items-center">
            <h3 className="mb-2 mt-3 text-lg font-bold text-white text-center">Now Playing: {activeResource.title}</h3>
            <div className="text-center text-gray-200 mb-2">{activeResource.type === 'song' ? activeResource.artist : activeResource.host}</div>
            <audio
              ref={audioEl}
              src={activeResource.url}
              controls
              className="w-64 mb-2"
              onTimeUpdate={(e) => updatePlaybackTime(e.currentTarget.currentTime)}
            />
            <div className="flex gap-3">
              <button className={`px-4 py-2 rounded text-white ${isPlaying ? 'bg-purple-600' : 'bg-blue-600'}`} onClick={() => (isPlaying ? pauseResource() : resumeResource())}>
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button className="px-4 py-2 rounded bg-gray-700 text-white" onClick={() => stopResource()}>Close Player</button>
            </div>
          </div>
        </div>
      );
    }
    if (activeResource.type === 'video' && activeResource.url) {
      const videoEl = useRef(null);
      useEffect(() => {
        const el = videoEl.current;
        if (!el) return;
        try { el.currentTime = Number(currentTime) || 0; } catch {}
        if (isPlaying) el.play?.().catch(() => {});
        else el.pause?.();
      }, [activeResource?.url]);
      useEffect(() => {
        const el = videoEl.current;
        if (!el) return;
        if (isPlaying) el.play?.().catch(() => {});
        else el.pause?.();
      }, [isPlaying]);
      return (
        <div className="w-full mx-auto mb-4 bg-black rounded-2xl flex flex-col items-center justify-center relative overflow-hidden max-w-md" style={{height: '320px', backgroundImage: `url(${cardImages.videos})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
          <div className="absolute inset-0 rounded-2xl bg-orange-900/60"></div>
          <div className="relative z-10 w-full flex flex-col items-center">
            <h3 className="mb-2 mt-6 text-lg font-bold text-white text-center">Now Playing: {activeResource.title}</h3>
            <video
              ref={videoEl}
              src={activeResource.url}
              controls
              className="w-72 mb-2 rounded-xl"
              style={{ maxHeight: '180px' }}
              onTimeUpdate={(e) => updatePlaybackTime(e.currentTarget.currentTime)}
            />
            <div className="flex gap-3">
              <button className={`px-4 py-2 rounded text-white ${isPlaying ? 'bg-orange-600' : 'bg-blue-600'}`} onClick={() => (isPlaying ? pauseResource() : resumeResource())}>
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button className="px-4 py-2 rounded bg-gray-700 text-white" onClick={() => stopResource()}>Close Player</button>
            </div>
            <div className="text-center text-gray-200 mb-1">Speaker: {activeResource.speaker}</div>
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
    return (
      <div className="w-full mx-auto mt-2 mb-4 bg-gradient-to-br from-black to-gray-500 rounded-2xl flex items-center justify-center min-h-[120px] max-w-md" style={{height: '140px'}}>
        <span className="text-lg font-semibold text-white">Unknown resource type.</span>
      </div>
    );
  };

  // ResourceCard
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
        {showList === type && (
          <div className="fixed inset-0 z-50 flex px-6 items-center justify-center bg-black/70" onClick={() => setShowList(null)}>
            <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-sm relative animate-fadeIn border border-gray-100 flex flex-col" style={{maxHeight:'80vh'}} onClick={e => e.stopPropagation()}>
              <button type="button" className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl" onClick={() => setShowList(null)} aria-label="Close"><X size={24} /></button>
              <h3 className={`font-semibold text-lg mb-4 text-${color}-700`}>All {title}</h3>
              <ul className="space-y-2 overflow-y-auto" style={{maxHeight:'60vh'}}>
                {items.map((item, idx) => (
                  <li key={item._id || item.url || idx} className={`flex items-center justify-between p-2 rounded-xl bg-${color}-50 text-${color}-700 cursor-pointer`} onClick={() => { playResource(item, items, idx); setShowList(null); }}>
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
    if (uploadForm.file.size > 100 * 1024 * 1024) {
      setUploadError('File too large. Max 100MB allowed.');
      setUploading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('title', uploadForm.title);
      formData.append('type', uploadForm.type);
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || import.meta.env.VITE_LOCAL_DEV === 'true';
      const uploadUrl = isLocal ? `${BACKEND_URL}/api/resources/upload-local` : `${BACKEND_URL}/api/resources/upload`;
      await new Promise((resolve, reject) => {
        const xhr = new window.XMLHttpRequest();
        xhr.open('POST', uploadUrl);
        if (!isLocal) {
          const token = localStorage.getItem('token');
          if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadSuccess(true);
            setUploadProgress(100);
            fetchResources();
            setShowUploadModal(false);
            setUploadForm({ file: null, title: '', type: 'song' });
            resolve();
          } else {
            let msg = 'Upload failed';
            try { const r = JSON.parse(xhr.responseText); if (r && r.error) msg = r.error; } catch {}
            setUploadError(msg);
            reject();
          }
          setUploading(false);
        };
        xhr.onerror = () => {
          setUploadError('Upload failed');
          setUploading(false);
          reject();
        };
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.send(formData);
      });
    } catch (error) {
      setUploadError('Upload failed');
      setUploading(false);
    }
  };

  // Delete resource handler
  const handleDeleteResource = async (resource) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await fetch(`${BACKEND_URL}/api/resources/${resource._id}`, { method: 'DELETE' });
      fetchResources();
      if (activeResource && activeResource._id === resource._id) setActiveResource(null);
    } catch {
      alert('Failed to delete resource');
    }
  };

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
      {/* Desktop Header */}
      <div className='pt-6'>
        <nav className="flex items-center justify-between mb-0">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/platform')}>
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
                // ...existing code...
              />
              {/* ...existing code... */}
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
      {/* Info alert */}
      {showInfo && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-blue-100 border border-blue-300 rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 animate-fadeIn" style={{maxWidth:'95vw'}}>
          <span className="text-blue-800 text-sm font-medium flex-1">Browse and play songs, podcasts, e-books, and videos to support your mental health. Click a card title to see all resources. Select any item to play or read instantly.</span>
          <button className="text-blue-400 hover:text-blue-700 text-xl" onClick={() => setShowInfo(false)} aria-label="Close"><X size={20} /></button>
        </div>
      )}
      {/* Main body: ActiveCard left, resource cards right in 2 columns */}
      <div className="flex flex-col lg:flex-row gap-8 pt-8 pb-24">
        {/* Left: ActiveCard (desktop only) */}
        <div className="lg:w-1/2 w-full mb-8 lg:mb-0 flex flex-col items-center justify-start">
          <ActiveCard />
        </div>
        {/* Right: Resource cards in 2 columns (desktop only) */}
        <div className="lg:w-1/2 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {['songs', 'podcasts', 'ebooks', 'videos'].map(type => {
            let items = resourceData[type] || [];
            if (type === 'podcasts') {
              items = Object.values(resourceData).flat().filter(r => r && typeof r === 'object' && (r.type === 'podcast' || (typeof r.title === 'string' && /podcast/i.test(r.title))));
            }
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
      {/* Floating Upload Button */}
      <button
        className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
        onClick={handleShowUploadModal}
        aria-label="Upload Resource"
      >
        <Plus size={28} />
      </button>
       {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowUploadModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-4 mx-6 w-full max-w-md relative animate-fadeIn border border-gray-100 flex flex-col" onClick={e => e.stopPropagation()}>
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-black" onClick={() => setShowUploadModal(false)} aria-label="Close">
              <X size={20} />
            </button>
            <h3 className="text-lg font-semibold mb-4">Upload New Resource</h3>
            {uploadError && <div className="mb-4 text-red-500 text-sm">{uploadError}</div>}
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resource Title</label>
                <input
                  type="text"
                  name="title"
                  value={uploadForm.title}
                  onChange={handleUploadChange}
                  className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                 <select name="type" value={uploadForm.type} onChange={handleUploadChange} className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
                   <option value="song">Song</option>
                   <option value="podcast">Podcast</option>
                   <option value="ebook">E-book (PDF)</option>
                   <option value="video">Video</option>
                 </select>
               </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
                <input
                  type="file"
                  name="file"
                  onChange={handleUploadChange}
                  className="block w-full text-sm text-gray-500 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-lg file:text-sm file:font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  accept=".mp3,.wav,.mp4,.pdf"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4zm16 0a8 8 0 01-8 8v-4a4 4 0 004-4h4z"></path>
                      </svg>
                      <span>Uploading... {uploadProgress}%</span>
                    </>
                  ) : (
                    <span>Upload Resource</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Password Modal (z-60, above upload modal) */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60" onClick={() => setShowPasswordModal(false)}>
          <form className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xs relative animate-fadeIn border border-gray-100 flex flex-col gap-4" onClick={e => e.stopPropagation()} onSubmit={handlePasswordSubmit}>
            <button type="button" className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl" onClick={() => setShowPasswordModal(false)} aria-label="Close"><X size={24} /></button>
            <h2 className="text-xl font-bold mb-2 text-blue-700">Admin Password</h2>
            {passwordError && <div className="mb-4 text-red-500 text-sm">{passwordError}</div>}
            <input type="password" name="password" placeholder="Enter password" required className="border rounded-lg px-3 py-2" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} autoFocus />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-semibold mt-2">Continue</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Resources;

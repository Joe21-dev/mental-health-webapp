import React, { useState, useEffect, useRef } from 'react';
import { Home, BarChart3, Calendar, Users, Music, Brain, Menu, X, MessageCircle, Shield, BookOpen, Play, ChevronDown, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const cardImages = {
  songs: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
  podcasts: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
  ebooks: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
  videos: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80'
};

const BACKEND_URL = import.meta.env.VITE_API_URL;

const ResourcesMobile = () => {
  const navigate = useNavigate();
  const [showList, setShowList] = useState(null);
  const [resourceData, setResourceData] = useState({ songs: [], podcasts: [], ebooks: [], videos: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeResource, setActiveResource] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    file: null,
    title: ''
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const audioRef = useRef(null);
  // For continuous playback
  const PLAYBACK_KEY = 'resourcePlayback';


    // Scroll handler for header background
      useEffect(() => {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 0);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
      }, []);
  

  // Info alert for user guidance
  const [showInfo, setShowInfo] = useState(true);
  useEffect(() => {
    if (showInfo) {
      const timer = setTimeout(() => setShowInfo(false), 12000); // 12 seconds
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
          if (r.type === 'song') grouped.songs.push(r);
          else if (r.type === 'podcast') grouped.podcasts.push(r);
          else if (r.type === 'ebook') grouped.ebooks.push(r);
          else if (r.type === 'video') grouped.videos.push(r);
        });
        setResourceData(grouped);
        setLoading(false);
        console.log('Resource data:', grouped); // Debug log
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

  // Mobile Header and Bottom Nav
      const MobileHeader = () => (
      <header className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm' : 'bg-transparent'} px-4 py-3 flex items-center justify-between lg:hidden`}>
        <button onClick={() => setMobileMenuOpen(true)}>
        <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-2">
        <div className="flex items-center justify-center w-8 h-8 bg-gray-800 rounded-full cursor-pointer" onClick={() => navigate('/platform')}>
          <Brain className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold">Resources</span>
        </div>
         {/* Avatar dropdown */}
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer relative" onClick={() => setShowAvatarDropdown(v => !v)}>
          <span className="text-white font-bold text-lg">{(userName && userName.length > 0) ? userName[0].toUpperCase() : 'U'}</span>
          {showAvatarDropdown && (
            <div className="absolute right-0 mt-12 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-fadeIn">
              <div className="p-4 border-b border-gray-200">
                <div className="font-bold text-lg text-blue-700">{userName || 'User'}</div>
                <div className="text-sm text-gray-600">{userEmail || ''}</div>
              </div>
              <button
                className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-b-xl font-semibold"
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  localStorage.removeItem('userName');
                  localStorage.removeItem('userEmail');
                  window.location.href = '/signup';
                }}
              >Logout</button>
            </div>
          )}
        </div>
      </header>
      );
      const MobileNavDrawer = () => (
      mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
        <div className="w-64 h-full p-4 bg-white" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold">Navigation</h2>
          <button onClick={() => setMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
          </div>
          <nav className="space-y-2">
          {[
            { icon: Home, label: 'Home', path: '/platform' },
            { icon: Users, label: 'Therapists', path: '/platform/therapists' },
            { icon: BookOpen, label: 'Scheduler', path: '/platform/scheduler' },
            { icon: MessageCircle, label: 'Chat', path: '/platform/chat' },
            { icon: Shield, label: 'Resources', path: '/platform/resources' },
          ].map(({ icon: Icon, label, path }) => (
            <button
            key={label}
            className="flex items-center w-full p-3 space-x-3 rounded-lg hover:bg-gray-100"
            onClick={() => { setMobileMenuOpen(false); navigate(path); }}
            disabled={location.pathname === path}
            >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
            </button>
          ))}
          </nav>
        </div>
        </div>
      )
      );
  
    const MobileBottomNav = () => (
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 py-2 bg-white border-t border-gray-200 lg:hidden">
        <div className="flex justify-around">
        {[
          { icon: Home, label: 'Home', path: '/platform' },
          { icon: MessageCircle, label: 'Chat', path: '/platform/chat' },
          { icon: Calendar, label: 'Schedule', path: '/platform/scheduler' },
          { icon: Users, label: 'Therapists', path: '/platform/therapists' },
          { icon: Shield, label: 'Resources', path: '/platform/resources' }
        ].map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
          <button
            key={label}
            className={`flex flex-col items-center py-2 px-3 cursor-pointer rounded-lg transition-colors duration-200 hover:bg-gray-100${isActive ? ' bg-blue-100' : ''}`}
            onClick={() => navigate(path)}
            disabled={isActive}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-gray-800' : 'text-gray-600'}`} />
            <span className={`text-xs mt-1 ${isActive ? 'text-gray-800 font-semibold' : 'text-gray-600'}`}>{label}</span>
          </button>
          );
        })}
        </div>
      </nav>
      );
  

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
      await new Promise((resolve, reject) => {
        const xhr = new window.XMLHttpRequest();
        xhr.open('POST', `${BACKEND_URL}/api/resources/upload`);
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Mobile Header */}
      <MobileHeader />
      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer />
      {/* Main content */}
      <div className="flex-1 px-4 py-2 lg:hidden overflow-y-auto" style={{ minHeight: 0 }}>
        {/* Info alert */}
        {showInfo && (
          <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-700 rounded-lg shadow">
            <p className="text-sm">
              Browse and play songs, podcasts, e-books, and videos to support your mental health. Click a card title to see all resources. Select any item to play or read instantly.
            </p>
          </div>
        )}
        {/* Active Card */}
        <ActiveCard />
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
      <div className='mb-20'><p></p></div>
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
      {/* Floating Upload Button */}
      <button
        className="fixed bottom-20 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
        onClick={() => setShowUploadModal(true)}
        aria-label="Upload Resource"
      >
        <Plus size={28} />
      </button>
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50  flex items-center justify-center bg-black/70" onClick={() => setShowUploadModal(false)}>
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
    </div>
  );
};

export default ResourcesMobile;

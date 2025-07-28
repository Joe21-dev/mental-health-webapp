import React, { useState, useEffect } from 'react';
import { Paperclip, Send, Home, MessageCircle, Calendar, Users, Shield, Menu, Brain, Search, X, BookOpen } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;

const Chat = () => {
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // Scroll handler for header background
        useEffect(() => {
          const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
          };
          window.addEventListener('scroll', handleScroll);
          return () => window.removeEventListener('scroll', handleScroll);
        }, []);

  // Bottom nav items (same as Dashboard)
  const navItems = [
  { icon: Home, label: 'Home', path: '/platform' },
  { icon: MessageCircle, label: 'Chat', path: '/platform/chat' },
  { icon: Calendar, label: 'Schedule', path: '/platform/scheduler' },
  { icon: Users, label: 'Therapists', path: '/platform/therapists' },
  { icon: Shield, label: 'Resources', path: '/platform/resources' }
  ];

  // Desktop Header
  const DesktopHeader = () => (
  <div className='pt-6 px-6 hidden lg:block'>
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
                className={`text-blue-700 bg-blue-100 border border-blue-200 font-bold px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:bg-gray-800 hover:text-gray-100 transition-colors${location.pathname === '/platform/chat' ? ' ring-2 ring-blue-500' : ''}`}
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                disabled
              >
                <MessageCircle className="w-4 h-4" />
                <span>Health-Chat.ai</span>
              </button>
              <button
                className={`bg-gray-100 text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:bg-gray-800 hover:text-gray-100 transition-colors border border-gray-200${location.pathname === '/platform/resources' ? ' ring-2 ring-blue-500' : ''}`}
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                onClick={() => navigate('/platform/resources')}
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
             
            </div>
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">U</span>
            </div>
            
          </div>
        </nav>
        </div>
  )
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
          <span className="font-semibold">Health-Chat.ai</span>
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

    // Chat
    const Chats = () => (
      <div className="flex flex-col items-center justify-end flex-1 px-2 mt-12 mb-18 md:pb-0 w-full">
        {/* Chat messages visually appealing */}
        <div className="w-full max-w-2xl flex-1 overflow-y-auto bg-gray-50 rounded-2xl shadow-lg p-4 mb-4 border-none" style={{ minHeight: 300, maxHeight: 400 }}>
          {messages.length === 0 && (
            <div className="text-center text-gray-400 py-12">No messages yet. Start the conversation!</div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
              <div className={`max-w-[80%] px-4 py-2 rounded-2xl shadow text-base whitespace-pre-line ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-900 rounded-bl-none'} animate-fadeIn`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start mb-3">
              <div className="max-w-[80%] px-4 py-2 rounded-2xl shadow text-base bg-gray-200 text-gray-900 animate-pulse">Thinking...</div>
            </div>
          )}
          {error && (
            <div className="text-center text-red-500 mt-2">{error}</div>
          )}
        </div>
        {/* Input area with send/add button */}
        <div className="w-full max-w-2xl flex flex-col space-y-2 pb-3 px-2 md:px-0 mx-auto bg-transparent md:bg-transparent" style={{ boxShadow: 'none', position: 'relative', zIndex: 10 }}>
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Ask me anything......."
              className="flex-1 px-4 py-2 text-gray-900 placeholder-gray-400 bg-white/70 border border-gray-200 rounded-lg shadow-sm outline-none md:bg-white"
              style={{ minHeight: '36px', maxHeight: '40px', position: 'relative', zIndex: 20 }}
              onKeyDown={e => { if (e.key === 'Enter' && !loading) handleSend(); }}
              disabled={loading}
              autoFocus
            />
            <button
              className="flex items-center justify-center w-10 h-10 transition-colors bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 disabled:opacity-60"
              type="button"
              onClick={handleSend}
              disabled={loading || !message.trim()}
              aria-label="Send"
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    );

    // Chat message state
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handlers
  const handleSend = async () => {
    if (!message.trim() || loading) return;
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', text: message.trim() }]);
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/gemini-chat/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', text: message.trim() }] })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI error');
      setMessages(prev => [...prev, { role: 'ai', text: data.aiText }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setError('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <DesktopHeader />
      {/* Mobile Header (fixed, full width) */}
      <div className="fixed top-0 left-0 right-0 z-40 w-full">
        <MobileHeader />
        <MobileNavDrawer />
      </div>
      <Chats />
      {/* Mobile Bottom Navigation (fixed, full width) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 w-full">
        <MobileBottomNav />
      </div>
      
    </div>
  );
};

export default Chat;
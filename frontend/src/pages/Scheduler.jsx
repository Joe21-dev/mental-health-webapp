import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, Target, Award, TrendingUp, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, BookOpen, MessageCircle, Shield, Search, Brain, Music, Moon, Phone, Menu, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_API_URL;

const Scheduler = () => {
  const [schedules, setSchedules] = useState([]);
  const [goals, setGoals] = useState([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'daily',
    color: 'blue',
  });
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    date: '',
    duration: 30,
    type: 'weekly',
    color: 'green',
  });
  const [calendarDate, setCalendarDate] = useState(() => {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return { day: now.getDate(), month: now.getMonth(), year: now.getFullYear() };
  });
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [checkins, setCheckins] = useState([]);
  const [currentFocus, setCurrentFocus] = useState(null);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [consistencyMap, setConsistencyMap] = useState({});
  const [currentDay, setCurrentDay] = useState(1);
  const [totalDays, setTotalDays] = useState(30);
  const navigate = useNavigate();
  const location = useLocation();


  // Fetch schedules, goals, check-ins, and current focus from backend in real time
  useEffect(() => {
    const fetchData = () => {
      fetch(`${BACKEND_URL}/api/schedules`).then(res => res.json()).then(setSchedules);
      fetch(`${BACKEND_URL}/api/goals`).then(res => res.json()).then(setGoals);
      fetch(`${BACKEND_URL}/api/checkins`).then(res => res.json()).then(setCheckins);
      fetch(`${BACKEND_URL}/api/current-focus`).then(res => res.json()).then(setCurrentFocus);
    };
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5s for real-time updates
    return () => clearInterval(interval);
  }, []);

  // On mount, POST to /api/checkins for today and increment progress
  useEffect(() => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    fetch(`${BACKEND_URL}/api/checkins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dateStr })
    })
      .then(res => res.json())
      .then(newCheckin => {
        setCheckins(prev => {
          if (!prev.find(c => c.date === newCheckin.date)) return [...prev, newCheckin];
          return prev;
        });
        setCurrentDay(prev => prev + 1); // Increase progress tracker on check-in
      });
  }, []);

  // Build consistency map and streaks from checkins, starting from current focus start date
  useEffect(() => {
    if (!currentFocus || !currentFocus.startDate) {
      setConsistencyMap({});
      setStreak(0);
      setLongestStreak(0);
      setCurrentDay(1);
      return;
    }
    const startDate = new Date(currentFocus.startDate);
    const map = {};
    let streakCount = 0, maxStreak = 0, lastDate = null, progress = 0;
    // Only count checkins after or on the start date
    const filtered = checkins.filter(c => new Date(c.date) >= startDate);
    const sorted = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));
    sorted.forEach(c => {
      const d = new Date(c.date);
      if (!map[d.getFullYear()]) map[d.getFullYear()] = {};
      if (!map[d.getFullYear()][d.getMonth()]) map[d.getFullYear()][d.getMonth()] = {};
      map[d.getFullYear()][d.getMonth()][d.getDate()] = true;
      if (lastDate) {
        const diff = (d - lastDate) / (1000 * 60 * 60 * 24);
        if (diff === 1) streakCount++;
        else streakCount = 1;
      } else {
        streakCount = 1;
      }
      if (streakCount > maxStreak) maxStreak = streakCount;
      lastDate = d;
      progress++;
    });
    setConsistencyMap(map);
    setStreak(streakCount);
    setLongestStreak(maxStreak);
    setCurrentDay(progress > 0 ? progress : 1); // Progress is number of checkins since start
  }, [checkins, currentFocus]);

  // Update totalDays from currentFocus
  useEffect(() => {
    if (!currentFocus) return;
    setTotalDays(currentFocus.duration || 30);
  }, [currentFocus]);

  // Always display latest goal as current focus
  useEffect(() => {
    if (goals && goals.length > 0) {
      const latestGoal = goals[goals.length - 1];
      setCurrentFocus({ title: latestGoal.title, startDate: latestGoal.date, duration: latestGoal.duration || 30 });
    }
  }, [goals]);

  // Add schedule logic
  function handleScheduleFormSubmit(e) {
    e.preventDefault();
    if (!scheduleForm.title.trim()) return toast.error('Title is required');
    let endpoint = `${BACKEND_URL}/api/schedules`;
    let method = 'POST';
    if (editingItem) {
      endpoint += `/${editingItem._id}`;
      method = 'PUT';
    }
    fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scheduleForm)
    })
      .then(async res => {
        if (!res.ok) throw new Error('Failed to save');
        const data = await res.json();
        setSchedules(s => editingItem ? s.map(i => i._id === data._id ? data : i) : [...s, data]);
        setCurrentDay(prev => prev + 1);
        toast.success(editingItem ? 'Schedule updated!' : 'Schedule added!');
        setShowScheduleForm(false);
        setEditingItem(null);
        setScheduleForm({ title: '', description: '', date: '', time: '', type: 'daily', color: 'blue' });
      })
      .catch(() => toast.error('Failed to save. Please try again.'));
  }

  // Add goal logic
  function handleGoalFormSubmit(e) {
    e.preventDefault();
    if (!goalForm.title.trim()) return toast.error('Title is required');
    let endpoint = `${BACKEND_URL}/api/goals`;
    let method = 'POST';
    if (editingItem) {
      endpoint += `/${editingItem._id}`;
      method = 'PUT';
    }
    fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goalForm)
    })
      .then(async res => {
        if (!res.ok) throw new Error('Failed to save');
        const data = await res.json();
        setGoals(g => editingItem ? g.map(i => i._id === data._id ? data : i) : [...g, data]);
        // Also update current focus
        await fetch(`${BACKEND_URL}/api/current-focus`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: data.title, startDate: data.date, duration: data.duration || 30 })
        });
        setCurrentFocus({ title: data.title, startDate: data.date, duration: data.duration || 30 });
        toast.success(editingItem ? 'Goal updated!' : 'Goal added!');
        setShowGoalForm(false);
        setEditingItem(null);
        setGoalForm({ title: '', description: '', date: '', duration: 30, type: 'weekly', color: 'green' });
      })
      .catch(() => toast.error('Failed to save. Please try again.'));
  }

  // Scroll handler for header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Notification permission and reminder logic
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!schedules || !schedules.length) return;
    const checkReminders = () => {
      const now = new Date();
      schedules.forEach(s => {
        if (!s.date || !s.title) return;
        const scheduleDate = new Date(s.date);
        if (
          scheduleDate.getFullYear() === now.getFullYear() &&
          scheduleDate.getMonth() === now.getMonth() &&
          scheduleDate.getDate() === now.getDate()
        ) {
          let scheduleHour = null, scheduleMinute = null;
          const timeMatch = s.description && s.description.match(/(\d{1,2}):(\d{2})/);
          if (timeMatch) {
            scheduleHour = parseInt(timeMatch[1], 10);
            scheduleMinute = parseInt(timeMatch[2], 10);
          }
          if (scheduleHour === null || scheduleMinute === null) {
            scheduleHour = 9;
            scheduleMinute = 0;
          }
          if (
            now.getHours() === scheduleHour &&
            now.getMinutes() === scheduleMinute &&
            Math.abs(now.getSeconds()) < 10
          ) {
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(`Schedule Reminder: ${s.title}`, {
                body: s.description || "You have a schedule now!",
                icon: "https://cdn-icons-png.flaticon.com/512/2921/2921222.png"
              });
            } else {
              alert(`Schedule Reminder: ${s.title}\n${s.description || "You have a schedule now!"}`);
            }
          }
        }
      });
    };
    const interval = setInterval(checkReminders, 10000);
    return () => clearInterval(interval);
  }, [schedules]);

  // Calendar helpers
  const getMonthName = (month) =>
    new Date(calendarDate.year, month).toLocaleString('default', { month: 'long' });
  function getDaysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
  }
  function getFirstDayOfWeek(month, year) {
    return new Date(year, month, 1).getDay();
  }

  // Form handlers
  function handleScheduleFormChange(e) {
    const { name, value } = e.target;
    setScheduleForm(f => ({ ...f, [name]: value }));
  }
  function handleGoalFormChange(e) {
    const { name, value } = e.target;
    setGoalForm(f => ({ ...f, [name]: value }));
  }
  function handleEdit(item, type) {
    setEditingItem(item);
    if (type === 'goal') {
      setGoalForm({
        title: item.title,
        description: item.description || '',
        date: item.date || '',
        duration: item.duration || 30,
        type: item.type || 'weekly',
        color: item.color || 'green',
      });
      setShowGoalForm(true);
    } else {
      setScheduleForm({
        title: item.title,
        description: item.description || '',
        date: item.date || '',
        time: item.time || '',
        type: item.type || 'daily',
        color: item.color || 'blue',
      });
      setShowScheduleForm(true);
    }
  }
  function handleDelete(item, type) {
    const endpoint = type === 'schedule' ? `${BACKEND_URL}/api/schedules` : `${BACKEND_URL}/api/goals`;
    fetch(`${endpoint}/${item._id}`, { method: 'DELETE' })
      .then(() => {
        if (type === 'schedule') setSchedules(s => s.filter(i => i._id !== item._id));
        else setGoals(g => g.filter(i => i._id !== item._id));
      });
  }

  // Calendar navigation
  function handlePrevMonth() {
    setCalendarDate((prev) => {
      let m = prev.month - 1;
      let y = prev.year;
      if (m < 0) { m = 11; y -= 1; }
      return { month: m, year: y };
    });
  }
  function handleNextMonth() {
    setCalendarDate((prev) => {
      let m = prev.month + 1;
      let y = prev.year;
      if (m > 11) { m = 0; y += 1; }
      return { month: m, year: y };
    });
  }

  // Responsive header (copied from Therapists)
  const Header = () => (
    <nav className="flex items-center justify-between pt-6 mb-8">
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center w-10 h-10 transition-transform bg-gray-800 rounded-full cursor-pointer hover:scale-105" onClick={() => navigate('/platform')}>
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="flex items-center px-4 py-2 space-x-2 text-gray-100 transition-transform bg-gray-800 border border-gray-800 rounded-full cursor-pointer hover:scale-105"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            onClick={() => navigate('/platform')}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
          <button
            className="flex items-center px-4 py-2 space-x-2 text-gray-800 transition-colors bg-gray-100 border border-gray-200 rounded-full cursor-pointer hover:bg-gray-800 hover:text-gray-100"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            onClick={() => navigate('/platform/therapists')}
          >
            <Users className="w-4 h-4" />
            <span>Therapists</span>
          </button>
          <button
            className="flex items-center px-4 py-2 space-x-2 font-bold text-blue-700 bg-blue-100 border border-blue-200 rounded-full cursor-pointer"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            onClick={() => navigate('/platform/scheduler')}
            disabled

          >
            <BookOpen className="w-4 h-4" />
            <span>Scheduler</span>
          </button>
          <button
            className="flex items-center px-4 py-2 space-x-2 text-gray-800 transition-colors bg-gray-100 border border-gray-200 rounded-full cursor-pointer hover:bg-gray-800 hover:text-gray-100"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            onClick={() => navigate('/platform/chat')}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Health-Chat.ai</span>
          </button>
          <button
            className="flex items-center px-4 py-2 space-x-2 text-gray-800 transition-colors bg-gray-100 border border-gray-200 rounded-full cursor-pointer hover:bg-gray-800 hover:text-gray-100"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            onClick={() => navigate('/platform/resources')}
          >
            <Shield className="w-4 h-4" />
            <span>Resources</span>
          </button>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="py-2 pl-10 pr-4 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
        
      </div>
    </nav>
  );

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
        <span className="font-semibold">Scheduler</span>
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

  // Image for goals card background
  const goalsBgImg = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80";

  // Main UI
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 px-4 pb-8">
      {/* Mobile Header (fixed, full width) */}
      <div className="fixed top-0 left-0 right-0 z-40 w-full">
        <MobileHeader />
        <MobileNavDrawer />
      </div>
      {/* Main content: scrollable, with padding for header and bottom nav */}
      <div className="flex-1 w-full overflow-y-auto pt-[64px] pb-[64px] px-0 lg:pt-0 lg:pb-0 lg:px-0 xl:px-2 sm:px-6">
        <div className="hidden lg:block">
          <Header />
        </div>
        {/* Add Schedule Button (top left) */}
        <div className="flex items-center justify-between max-w-7xl mx-auto px-6 lg:px-2  mb-4">
          <button
            className="flex items-center px-5 py-2 font-semibold text-white bg-blue-600 rounded-xl shadow hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={() => { setShowScheduleForm(true); setEditingItem(null); }}
          >
            <Plus className="w-5 h-5 mr-2" /> Add Schedule
          </button>
        </div>
        {/* Desktop: 2-column grid, Mobile: stacked */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Calendar + other cards */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Calendar Tracker on Top */}
            <div className="p-6 rounded-3xl bg-gray-50 shadow-lg border-none">
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center text-lg font-semibold"><Calendar className="w-5 h-5 mr-2 text-blue-500" /> Progress Tracker</h3>
                <div className="text-sm font-semibold text-gray-600">Duration: Day {currentDay} of {totalDays}</div>
              </div>
              {/* Calendar Tracker UI */}
              <div className="grid grid-cols-7 gap-1 mb-2 text-xs text-center text-gray-500 font-semibold">
                {["S","M","T","W","T","F","S"].map((d, i) => (
                  <div key={d + '-' + i} className="flex items-center justify-center h-8 lg:h-10 lg:text-sm lg:font-bold">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 mb-4 text-sm text-center">
                {(() => {
                  const days = [];
                  const firstDay = getFirstDayOfWeek(calendarDate.month, calendarDate.year);
                  const numDays = getDaysInMonth(calendarDate.month, calendarDate.year);
                  for (let i = 0; i < firstDay; i++) days.push(<div key={"empty-"+i} className="h-8 lg:h-10" />);
                  for (let d = 1; d <= numDays; d++) {
                    const isConsistent = consistencyMap[calendarDate.year]?.[calendarDate.month]?.[d] || false;
                    days.push(
                      <div
                        key={'day-' + d}
                        className={`flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full transition text-base font-medium ${isConsistent ? 'bg-green-400 text-white shadow' : 'bg-gray-200 text-gray-400'} border border-gray-100`}
                        style={{ minWidth: '2rem', minHeight: '2rem' }}
                      >
                        {d}
                      </div>
                    );
                  }
                  return days;
                })()}
              </div>
              <div className="mt-2 text-xs text-blue-500 text-center">Check in daily to keep your streak and track your progress!</div>
            </div>
            {/* Current Focus Card */}
            <div className="p-6 rounded-3xl bg-gray-50 shadow-lg border-none flex flex-col justify-between">
              <h3 className="flex items-center text-black text-lg font-semibold mb-2"><Brain className="w-5 h-5 mr-2 text-purple-700" /> Current Focus</h3>
              <div className="mb-2 pl-6 text-2xl font-bold text-gray-800">{currentFocus ? currentFocus.title : "No current focus"}</div>
              <div className="mb-1 pl-6 text-sm text-gray-600">Started: {currentFocus ? currentFocus.startDate : "--"}</div>
              <div className="mb-1 pl-6 text-sm text-gray-600">Progress: {currentDay} / {totalDays} days</div>
              <div className="mt-2 pl-6 text-xs text-gray-400">Stay consistent for best results!</div>
            </div>
            
            
          </div>

          {/* Right column: */}
          <div className="relative">
                {/* Schedules Card */}
            <div className="p-6 rounded-3xl bg-gray-50 shadow-lg border-none max-h-64 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h4 className="flex items-center font-semibold text-blue-600 text-md"><Clock className="w-4 h-4 mr-1" /> Daily Schedules</h4>
              </div>
              <ul className="space-y-3">
                {schedules.filter(s => s && s.date && s.title && typeof s === 'object').map(s => {
                  try {
                    const d = new Date(s.date);
                    if (
                      d.getDate() === selectedDate.day &&
                      d.getMonth() === selectedDate.month &&
                      d.getFullYear() === selectedDate.year
                    ) {
                      return (
                        <li key={s._id} className={`rounded-xl p-4 flex items-center justify-between bg-${s.color || 'blue'}-50`}>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className={`w-5 h-5 text-${s.color || 'blue'}-500`} />
                            <div>
                              <div className="font-semibold">{s.title}</div>
                              <div className="text-xs text-gray-600">{s.description}</div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button className="p-2 rounded-full hover:bg-blue-100" onClick={() => handleEdit(s, 'schedule')}><Edit className="w-4 h-4 text-blue-500" /></button>
                            <button className="p-2 rounded-full hover:bg-red-100" onClick={() => handleDelete(s, 'schedule')}><Trash2 className="w-4 h-4 text-red-500" /></button>
                          </div>
                        </li>
                      );
                    }
                  } catch (e) { return null; }
                  return null;
                })}
              </ul>
            </div>

            {/* Goals card */}
            <div className=" mt-6 p-4 rounded-2xl bg-gray-50 shadow-lg bordee-none max-w-80 h-auto flex flex-col justify-start relative overflow-hidden min-h-[220px] max-h-[260px] overflow-y-auto" style={{ aspectRatio: '1.7/1' }}>
              <img src={goalsBgImg} alt="Goals" className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none rounded-2xl" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="flex items-center text-lg font-semibold"><Target className="w-5 h-5 mr-2 text-green-500" /> Goals</h3>
                  <button className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg" onClick={() => { setShowGoalForm(true); setEditingItem(null); }}><Plus className="w-4 h-4" /></button>
                </div>
                <ul className="space-y-2">
                  {goals && goals.filter(g => g && g.type && g.title && typeof g === 'object').map(g => (
                    <li key={g._id} className={`rounded-xl p-3 flex items-center justify-between bg-${g.color || 'green'}-50 backdrop-blur-sm bg-opacity-80`}>
                      <div className="flex items-center space-x-3">
                        {g.type === 'weekly' && <TrendingUp className="w-5 h-5 text-orange-500" />}
                        {g.type === 'monthly' && <Award className="w-5 h-5 text-purple-500" />}
                        {g.type === 'yearly' && <Target className="w-5 h-5 text-green-500" />}
                        <div>
                          <div className="font-semibold">{g.title}</div>
                          <div className="text-xs text-gray-600">{g.description}</div>
                          <div className="text-xs text-gray-400">{g.type ? g.type.charAt(0).toUpperCase() + g.type.slice(1) : ''} Goal</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 rounded-full hover:bg-green-100" onClick={() => handleEdit(g, 'goal')}><Edit className="w-4 h-4 text-green-500" /></button>
                        <button className="p-2 rounded-full hover:bg-red-100" onClick={() => handleDelete(g, 'goal')}><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Streak Card */}
            <div className="mt-6 p-6 rounded-3xl bg-gray-50 shadow-lg border-none flex flex-col justify-between">
              <h3 className="flex items-center text-black text-lg font-semibold mb-2"><Award className="w-5 h-5 mr-2 text-orange-900" /> Streak</h3>
              <div className="mb-2 pl-6 text-3xl font-bold text-gray-800">{streak} days</div>
              <div className="mb-1 pl-6 text-sm text-gray-600">Longest streak: {longestStreak} days</div>
              <div className="mt-2 pl-6 text-xs text-gray-400">Keep going!</div>
            </div>
          </div>
        </div>
        {/* Add/Edit Schedule Modal */}
        {showScheduleForm && (
          <div className="fixed inset-0 px-4 pb-10 z-50 flex items-center justify-center bg-black/30" onClick={() => { setShowScheduleForm(false); setEditingItem(null); }}>
            <form
              className="relative w-full max-w-md p-8 space-y-5 bg-white border border-gray-100 shadow-xl rounded-2xl animate-fadeIn"
              onClick={e => e.stopPropagation()}
              onSubmit={handleScheduleFormSubmit}
            >
              <button type="button" className="absolute text-2xl text-gray-400 top-3 right-3 hover:text-black" onClick={() => { setShowScheduleForm(false); setEditingItem(null); }} aria-label="Close">&times;</button>
              <h3 className="mb-2 text-lg font-semibold">{editingItem ? `Edit Schedule` : `Add Schedule`}</h3>
              <input name="title" value={scheduleForm.title} onChange={handleScheduleFormChange} placeholder="Schedule Title" className="w-full px-3 py-2 mb-2 border-none bg-gray-50 rounded" required />
              <textarea name="description" value={scheduleForm.description} onChange={handleScheduleFormChange} placeholder="Schedule Description" className="w-full px-3 py-2 mb-2 border-none bg-gray-50 rounded" />
              <input name="date" type="date" value={scheduleForm.date} onChange={handleScheduleFormChange} className="w-full px-3 py-2 mb-2 border-none bg-gray-50 rounded" required />
              <input name="time" type="time" value={scheduleForm.time || ''} onChange={handleScheduleFormChange} className="w-full px-3 py-2 mb-2 border-none bg-gray-50 rounded" required />
              <div className="flex justify-end mt-2 space-x-2">
                <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={() => { setShowScheduleForm(false); setEditingItem(null); }}>
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-white bg-blue-500 rounded">
                  {editingItem ? 'Save' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        )}
        {/* Add/Edit Goal Modal */}
        {showGoalForm && (
          <div className="fixed inset-0 px-4 pb-10 z-50 flex items-center justify-center bg-black/30" onClick={() => { setShowGoalForm(false); setEditingItem(null); }}>
            <form
              className="relative w-full max-w-md p-8 space-y-5 bg-white border border-gray-100 shadow-xl rounded-2xl animate-fadeIn"
              onClick={e => e.stopPropagation()}
              onSubmit={handleGoalFormSubmit}
            >
              <button type="button" className="absolute text-2xl text-gray-400 top-3 right-3 hover:text-black" onClick={() => { setShowGoalForm(false); setEditingItem(null); }} aria-label="Close">&times;</button>
              <h3 className="mb-2 text-lg font-semibold">{editingItem ? `Edit Goal` : `Add Goal`}</h3>
              <input name="title" value={goalForm.title} onChange={handleGoalFormChange} placeholder="Goal Title" className="w-full px-3 py-2 mb-2 border-none bg-gray-50 rounded" required />
              <textarea name="description" value={goalForm.description} onChange={handleGoalFormChange} placeholder="Goal Description" className="w-full px-3 py-2 mb-2 border-none bg-gray-50 rounded" />
              <input name="date" type="date" value={goalForm.date} onChange={handleGoalFormChange} className="w-full px-3 py-2 mb-2 border-none bg-gray-50 rounded" required />
              <input name="duration" type="number" min="1" value={goalForm.duration} onChange={handleGoalFormChange} className="w-full px-3 py-2 mb-2 border-none bg-gray-50 rounded" placeholder="Duration (days)" required />
              <select name="type" value={goalForm.type} onChange={handleGoalFormChange} className="w-full px-3 py-2 mb-2 border-none bg-gray-50 rounded">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <div className="flex justify-end mt-2 space-x-2">
                <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={() => { setShowGoalForm(false); setEditingItem(null); }}>
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-white bg-green-500 rounded">
                  {editingItem ? 'Save' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      {/* Mobile Bottom Navigation (fixed, full width) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 w-full">
        <MobileBottomNav />
      </div>
    </div>
  );
};

export default Scheduler;

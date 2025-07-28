import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  BookOpen, 
  BarChart3, 
  Music, 
  Moon, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  ExternalLink,
  Phone,
  Calendar,
  TrendingUp,
  Brain,
  Heart,
  Shield,
  MessageCircle,
  Menu,
  X
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Therapists from '../pages/Therapists';
import TherapistsMobile from '../pages/TherapistsMobile';
import { useResourcePlayer } from '../ResourcePlayerContext.jsx';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = ({ showTherapistsProp = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [healthData, setHealthData] = useState([]);
  const [showTherapists, setShowTherapists] = useState(showTherapistsProp);
  const [bookedTherapist, setBookedTherapist] = useState(null);
  const [therapists, setTherapists] = useState([]); // Start with empty array
  const [loadingTherapists, setLoadingTherapists] = useState(true);
  const [therapistsError, setTherapistsError] = useState(null);
  const [therapyTracker, setTherapyTracker] = useState(null); // Add therapyTracker state to Dashboard
  const [schedules, setSchedules] = useState([]);
  const [currentFocus, setCurrentFocus] = useState(null);
  // Calendar state
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
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch therapists from backend
  useEffect(() => {
    setLoadingTherapists(true);
    setTherapistsError(null);
    fetch(`${API_URL}/api/therapists`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch therapists');
        return res.json();
      })
      .then(data => {
        setTherapists(data);
        setLoadingTherapists(false);
      })
      .catch(err => {
        setTherapistsError(err.message);
        setLoadingTherapists(false);
      });
  }, []);

  // Ensure therapists view is shown when navigating to /therapists
  useEffect(() => {
    if (location.pathname === '/therapists') {
      setShowTherapists(true);
      // If therapists list is empty, fetch from backend again
      if (!therapists || therapists.length === 0) {
        setLoadingTherapists(true);
        setTherapistsError(null);
        fetch(`${API_URL}/api/therapists`)
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch therapists');
            return res.json();
          })
          .then(data => {
            setTherapists(data);
            setLoadingTherapists(false);
          })
          .catch(err => {
            setTherapistsError(err.message);
            setLoadingTherapists(false);
          });
      }
    }
    if (location.pathname === '/platform') {
      setShowTherapists(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then(res => res.json())
      .then(data => setHealthData(data));
  }, []);

  // Music Player State
  // const musicTracks = [...]; // Keep for fallback or local tracks
  const {
    activeResource,
    isPlaying,
    playResource,
    pauseResource,
    nextResource,
    prevResource
  } = useResourcePlayer();

  // Plans State and handlers (move above DesktopDashboard)
  const [plans, setPlans] = useState([
    {
      id: 1,
      category: 'Sleep',
      color: 'blue',
      title: 'Insomnia recovery',
      description: 'Cognitive and behavioral techniques to manage insomnia.'
    },
    {
      id: 2,
      category: 'Meditation',
      color: 'orange',
      title: 'Anxiety relief',
      description: 'Meditations focused on calming the nervous system.'
    },
    {
      id: 3,
      category: 'Studying',
      color: 'purple',
      title: 'Exam focus',
      description: 'Techniques to improve concentration during study.'
    }
  ]);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    category: '',
    color: 'blue',
    title: '',
    description: ''
  });

  function handleAddPlan() {
    setEditingPlan(null);
    setPlanForm({ category: '', color: 'blue', title: '', description: '' });
    setShowPlanForm(true);
  }
  function handleEditPlan(plan) {
    setEditingPlan(plan.id);
    setPlanForm({
      category: plan.category,
      color: plan.color,
      title: plan.title || '',
      description: plan.description || ''
    });
    setShowPlanForm(true);
  }
  function handleDeletePlan(id) {
    setPlans(plans => plans.filter(p => p.id !== id));
  }
  function handlePlanFormChange(e) {
    const { name, value } = e.target;
    setPlanForm(f => ({ ...f, [name]: value })); // Use functional update to avoid stale state
  }
  function handlePlanFormSubmit(e) {
    e.preventDefault();
    if (!planForm.title.trim() || !planForm.description.trim()) return;
    if (editingPlan) {
      setPlans(plans => plans.map(p => p.id === editingPlan ? {
        ...p,
        category: planForm.category,
        color: planForm.color,
        title: planForm.title,
        description: planForm.description
      } : p));
    } else {
      setPlans(plans => [
        ...plans,
        {
          id: Date.now(),
          category: planForm.category,
          color: planForm.color,
          title: planForm.title,
          description: planForm.description
        }
      ]);
    }
    setShowPlanForm(false);
    setEditingPlan(null);
    // Do NOT reset planForm here, let modal close first
  }

  // Helper to get month name
  const getMonthName = (month) =>
    new Date(calendarDate.year, month).toLocaleString('default', { month: 'long' });

  // Helper to get days in month
  function getDaysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
  }
  // Helper to get first day of week (0=Sun)
  function getFirstDayOfWeek(month, year) {
    return new Date(year, month, 1).getDay();
  }

  // Calendar navigation handlers
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

  function handlePrevTrack() {
    setCurrentTrack(t => (t === 0 ? musicTracks.length - 1 : t - 1));
  }
  function handleNextTrack() {
    setCurrentTrack(t => (t === musicTracks.length - 1 ? 0 : t + 1));
  }

  // Handler to add a therapist and update both views/backend
  const handleAddTherapist = async (newTherapist) => {
    const res = await fetch(`${API_URL}/api/therapists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTherapist)
    });
    const added = await res.json();
    setTherapists(prev => [...prev, added]);
  };

  // Handler to book/unbook a therapist and sync with backend
  const handleBookOrUnbook = async (therapist) => {
    await fetch(`${API_URL}/api/therapists/${therapist._id}/book`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booked: !therapist.booked })
    });
    // Refetch therapists to sync state
    fetch(`${API_URL}/api/therapists`)
      .then(res => res.json())
      .then(data => setTherapists(data));
    setBookedTherapist(therapist.booked ? null : therapist);
    setShowTherapists(false);
  }; 

  // Desktop Component
const DesktopDashboard = ({ userName, userEmail }) => {
  // Avatar dropdown state
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);

  return (
<div className="min-h-screen bg-gray-100 p-6 hidden lg:block">
{/* Top Navigation */}
<nav className="flex items-center justify-between mb-8">
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
<div className="relative">
<Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
<input 
type="text" 
placeholder="Search..." 
className="pl-10 pr-4 py-2 bg-white rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
</div>
{/* Avatar dropdown */}
<div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer relative" onClick={() => setShowAvatarDropdown(v => !v)}>
<span className="text-white font-bold text-lg">{userName[0].toUpperCase()}</span>
{showAvatarDropdown && (
<div className="absolute right-0 mt-12 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-fadeIn">
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

<div className="grid grid-cols-12 gap-6">
{/* Left Column */}
<div className="col-span-3 space-y-6">
{/* Music/Resource Player replaced with Animated Mental Health Card */}
<div className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden" style={{height: '320px', minHeight: '320px', width: '100%'}}>
{/* Animated background shapes */}
<div className="absolute inset-0 pointer-events-none">
<svg width="100%" height="100%" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0 w-full h-full animate-pulse">
<circle cx="80" cy="80" r="60" fill="#a5b4fc" fillOpacity="0.25">
<animate attributeName="r" values="60;80;60" dur="3s" repeatCount="indefinite" />
</circle>
<circle cx="240" cy="100" r="40" fill="#fca5a5" fillOpacity="0.18">
<animate attributeName="r" values="40;60;40" dur="2.5s" repeatCount="indefinite" />
</circle>
<ellipse cx="160" cy="240" rx="50" ry="30" fill="#fcd34d" fillOpacity="0.15">
<animate attributeName="rx" values="50;70;50" dur="3.5s" repeatCount="indefinite" />
</ellipse>
</svg>
</div>
<div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
<div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center shadow-lg animate-bounce mb-4">
<Brain className="w-12 h-12 text-white" />
</div>
<h3 className="font-bold text-xl text-blue-700 mb-2 animate-fadeIn">Mental Health</h3>
<p className="text-sm text-gray-700 text-center max-w-xs animate-fadeIn delay-200">Take a deep breath. Your mental health matters. Pace yourself, meditate, and connect with therapists for support.</p>
<div className="mt-4 flex space-x-2 animate-fadeIn delay-300">
<span className="px-3 py-3 rounded-full bg-blue-200 text-blue-700 text-xs font-semibold shadow">Mindfulness</span>
<span className="px-3 py-1 rounded-full bg-purple-200 text-purple-700 text-xs font-semibold shadow">Progress Tracker</span>
<span className="px-3 py-3 rounded-full bg-pink-200 text-pink-700 text-xs font-semibold shadow">Therapy</span>
</div>
</div>
</div>

{/* Calendar */}
<div className="bg-white rounded-3xl p-6">
<div className="flex items-center justify-between mb-4">
<button onClick={handlePrevMonth} className="cursor-pointer p-1 rounded-full hover:bg-gray-100 transition" aria-label="Previous Month">
<ChevronLeft className="w-5 h-5 text-gray-400" />
</button>
<div className="relative">
<button
className="font-semibold px-2 py-1 rounded cursor-pointer hover:bg-gray-100"
onClick={() => setShowMonthPicker((v) => !v)}
>
{getMonthName(calendarDate.month)}
</button>
{showMonthPicker && (
<div className="absolute left-1/2 -translate-x-1/2 top-10 bg-white border border-gray-200 rounded-2xl shadow-lg z-20 grid grid-cols-3 gap-x-3 gap-y-2 p-4 w-64 animate-fadeIn">
{Array.from({ length: 12 }).map((_, m) => (
<button
key={m}
className={`px-0 py-2 rounded-xl font-medium transition text-sm cursor-pointer hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center ${calendarDate.month === m ? 'bg-black text-white shadow' : 'text-gray-700'}`}
style={{ minWidth: '60px' }}
onClick={() => {
setCalendarDate((prev) => ({ ...prev, month: m }));
setShowMonthPicker(false);
}}
>
{getMonthName(m)}
</button>
))}
</div>
)}
</div>
<div className="relative">
<button
className="font-semibold px-2 py-1 rounded cursor-pointer hover:bg-gray-100"
onClick={() => setShowYearPicker((v) => !v)}
>
{calendarDate.year}
</button>
{showYearPicker && (
<div className="absolute left-1/2 -translate-x-1/2 top-10 bg-white border border-gray-200 rounded-2xl shadow-lg z-20 max-h-56 overflow-y-auto p-3 w-32 animate-fadeIn flex flex-col items-center">
{Array.from({ length: 12 }).map((_, i) => {
const y = new Date().getFullYear() - 6 + i;
return (
<button
key={y}
className={`w-full px-2 py-2 rounded-xl font-medium transition text-sm cursor-pointer hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-1 ${calendarDate.year === y ? 'bg-black text-white shadow' : 'text-gray-700'}`}
onClick={() => {
setCalendarDate((prev) => ({ ...prev, year: y }));
setShowYearPicker(false);
}}
>
{y}
</button>
);
})}
</div>
)}
</div>
<button onClick={handleNextMonth} className="cursor-pointer p-1 rounded-full hover:bg-gray-100 transition" aria-label="Next Month">
<ChevronRight className="w-5 h-5 text-gray-400" />
</button>
</div>
<div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
<div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
</div>
<div className="grid grid-cols-7 gap-1 text-center text-sm">
{(() => {
const days = [];
const firstDay = getFirstDayOfWeek(calendarDate.month, calendarDate.year);
const numDays = getDaysInMonth(calendarDate.month, calendarDate.year);
for (let i = 0; i < firstDay; i++) days.push(<div key={"empty-"+i}></div>);
for (let d = 1; d <= numDays; d++) {
const isToday = (() => {
const now = new Date();
return d === now.getDate() && calendarDate.month === now.getMonth() && calendarDate.year === now.getFullYear();
})();
const isSelected = d === selectedDate.day && calendarDate.month === selectedDate.month && calendarDate.year === selectedDate.year;
days.push(
<button
key={d}
className={`p-1 w-8 h-8 rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${isSelected ? 'bg-black text-white' : isToday ? 'bg-gray-800 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
onClick={() => setSelectedDate({ day: d, month: calendarDate.month, year: calendarDate.year })}
aria-label={`Select ${getMonthName(calendarDate.month)} ${d}, ${calendarDate.year}`}
>
{d}
</button>
);
}
return days;
})()}
</div>
</div>
</div>

{/* Center Column */}
<div className="col-span-6 space-y-6">
{/* Pills Schedule */}
<div className="bg-white rounded-3xl p-6">
<div className="flex items-center justify-between mb-4">
<h3 className="font-semibold">Today's schedule</h3>
<ExternalLink className="w-5 h-5 text-gray-400" />
</div>
<div className="space-y-2 mb-4">
{schedules && schedules.filter(s => {
const today = new Date();
const schedDate = new Date(s.date);
return schedDate.getFullYear() === today.getFullYear() && schedDate.getMonth() === today.getMonth() && schedDate.getDate() === today.getDate();
}).map(s => (
<div key={s._id} className="flex items-center space-x-2">
<div className={`w-3 h-3 bg-${s.color || 'blue'}-500 rounded-full`}></div>
<span className="text-sm">{s.title} {s.time && <span className="text-xs text-gray-400 ml-1">({s.time})</span>}</span>
</div>
))}
{(!schedules || schedules.filter(s => {
const today = new Date();
const schedDate = new Date(s.date);
return schedDate.getFullYear() === today.getFullYear() && schedDate.getMonth() === today.getMonth() && schedDate.getDate() === today.getDate();
}).length === 0) && <div className="text-xs text-gray-400">No schedules for today.</div>}
</div>
<div className="flex justify-between text-xs text-gray-500">
<span>9:00</span><span>11:00</span><span>13:00</span><span>15:00</span><span>17:00</span><span>19:00</span><span>21:00</span>
</div>
</div>

{/* Sleep Level & Meditation */}
<div className="grid grid-cols-2 gap-6">
<div className="bg-white rounded-3xl p-6">
<div className="flex items-center space-x-2 mb-4">
<Moon className="w-5 h-5 text-blue-500" />
<h3 className="font-semibold">Streak level</h3>
</div>
<div className="h-32 bg-gray-50 rounded-2xl flex items-end justify-center p-4">
{[...Array(20)].map((_, i) => (
<div key={i} className={`w-2 mx-1 bg-blue-${i % 3 === 0 ? '500' : '300'} rounded-t`} style={{height: `${Math.random() * 80 + 20}%`}}></div>
))}
</div>
<div className="mt-4 flex items-center justify-between">
<div>
<div className="text-2xl font-bold">8h</div>
<div className="text-sm text-gray-500">Average focus duration in March</div>
</div>
<TrendingUp className="w-5 h-5 text-gray-400" />
</div>
</div>

<div className="bg-white rounded-3xl p-6">
<div className="flex items-center space-x-2 mb-4">
<Heart className="w-5 h-5 text-orange-500" />
<h3 className="font-semibold">Meditation</h3>
</div>
<div className="grid grid-cols-7 gap-2 mb-4">
{[...Array(28)].map((_, i) => (
<div key={i} className={`w-6 h-6 rounded-full ${i % 3 === 0 ? 'bg-orange-500' : 'bg-orange-200'}`}></div>
))}
</div>
<div className="flex items-center justify-between">
<div>
<div className="text-2xl font-bold">16</div>
<div className="text-sm text-gray-500">Days meditated in March</div>
</div>
<TrendingUp className="w-5 h-5 text-gray-400" />
</div>
</div>
</div>

{/* Therapy Tracker */}
<div className="bg-white rounded-3xl p-6 flex flex-col gap-3 shadow border border-blue-100">
<div className="flex items-center justify-between mb-2">
<h3 className="font-semibold flex items-center gap-2"><Users className="w-5 h-5 text-blue-500" /> Therapy Tracker</h3>
<span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><BookOpen className="w-4 h-4" /> Active</span>
</div>
<div className="flex items-center gap-3 mb-2">
<div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 text-xl font-bold">
<Users className="w-6 h-6" />
</div>
<div>
<div className="font-semibold text-lg">{therapyTracker?.doctor?.name || 'User'}</div>
<div className="text-xs text-gray-500">Patient</div>
</div>
</div>
<div className="flex items-center gap-2 mb-1">
<Shield className="w-5 h-5 text-purple-500" />
<span className="text-sm text-gray-700">Condition: <span className="font-semibold">{therapyTracker?.doctor?.specialty || 'N/A'}</span></span>
</div>
<div className="flex items-center gap-2 mb-1">
<Brain className="w-5 h-5 text-pink-500" />
<span className="text-sm text-gray-700">Therapy: <span className="font-semibold">{therapyTracker?.therapy || 'N/A'}</span></span>
</div>
<div className="flex items-center gap-2 mb-1">
<Calendar className="w-5 h-5 text-green-500" />
<span className="text-sm text-gray-700">Booked: <span className="font-semibold">{therapyTracker?.date ? new Date(therapyTracker.date).toLocaleDateString() : 'N/A'}</span></span>
</div>
<div className="flex items-center gap-2 mb-1">
<TrendingUp className="w-5 h-5 text-orange-500" />
<span className="text-sm text-gray-700">Streak: <span className="font-bold text-green-600">{therapyTracker?.streak || 0}</span> days</span>
</div>
<div className="flex items-center gap-2 mb-1">
<BookOpen className="w-5 h-5 text-blue-500" />
<span className="text-sm text-gray-700">Longest Streak: <span className="font-bold text-blue-600">{therapyTracker?.longestStreak || 0}</span> days</span>
</div>
<div className="text-xs text-gray-400 mt-2">Stay consistent for best results!</div>
</div>

</div>

{/* Right Column */}
<div className="col-span-3 space-y-6 ">
{/* Plans */}
<div className="bg-white rounded-2xl p-6 h-86">
<div className="flex items-center justify-between mb-4">
<h3 className="font-semibold">Plans</h3>
</div>
<div className="space-y-3">
{currentFocus ? (
<div className={`bg-blue-50 rounded-2xl p-4 relative group`}>
<div className="flex items-center justify-between mb-2">
<span className={`bg-blue-500 text-white px-2 py-1 rounded text-xs`}>Current Focus</span>
</div>
<h4 className="font-semibold text-sm">{currentFocus.title}</h4>
<p className="text-xs text-gray-600">Started: {currentFocus.startDate}</p>
<p className="text-xs text-gray-400">Duration: {currentFocus.duration || 30} days</p>
</div>
) : <div className="text-xs text-gray-400">No current focus set.</div>}
</div>
</div>

{/* Contact Doctor - Therapy Section */}
<div className="bg-white rounded-2xl p-6">
<div className="flex items-center justify-between mb-4">
<span className="bg-pink-500 text-white px-2 py-1 rounded text-xs">Therapy</span>
<div className="flex space-x-2">
<button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
<MessageCircle className="w-4 h-4" />
</button>
<button className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
<Phone className="w-4 h-4" />
</button>
</div>
</div>
{bookedTherapist ? (
<>
<h3 className="font-semibold mb-2">{bookedTherapist.name} is {bookedTherapist.status === 'approved' ? 'online' : 'pending approval'}</h3>
<div className="flex items-center space-x-3">
<div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-bold">
{bookedTherapist.name.replace(/Dr\.?\s*/i, '').charAt(0).toUpperCase()}
</div>
<div className="flex-1">
<p className="text-sm text-gray-600">{bookedTherapist.specialty}</p>
<span className="bg-gray-800 text-white px-2 py-1 rounded text-xs">{bookedTherapist.status === 'approved' ? '10y exp' : 'Pending approval'}</span>
</div>
</div>
</>
) : (
<>
<h3 className="font-semibold mb-2">No therapist booked</h3>
<button
className="mt-3 px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600"
onClick={() => navigate('/platform/therapists')}
>
Book a Therapist
</button>
</>
)}
</div>

{/* Conversation Video Card - Desktop only*/}
<div className="hidden lg:block">
<div className="bg-white rounded-3xl p-0 shadow-lg overflow-hidden flex flex-col justify-end relative mt-6" style={{ minHeight: '220px', height: '260px' }}>
<video
autoPlay
loop
muted
playsInline
className="absolute inset-0 w-full h-full object-cover"
style={{ zIndex: 0 }}
poster="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80"
>
<source src="https://cdn.videvo.net/videvo_files/video/free/2013-08/large_watermarked/African_Sunset.mp4" type="video/mp4" />
</video>
<div className="relative z-10 p-6 flex flex-col justify-end h-full" style={{ background: 'rgba(0,0,0,0.25)' }}>
<h3 className="text-white text-lg font-semibold mb-2 drop-shadow">Meaningful Connections</h3>
<p className="text-white text-xs drop-shadow">Conversations can uplift your mood. Reach out and connect with someone today!</p>
</div>
</div>
</div>
</div>
</div>
</div>
);
};

// Mobile Component
const MobileDashboard = ({ userName, userEmail }) => {
  // Avatar dropdown state
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);

  return (
<div className="min-h-screen bg-gray-100 lg:hidden flex flex-col">
{/* Mobile Header */}
<header className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm' : 'bg-transparent'} px-4 py-3 flex items-center justify-between`}>
<button onClick={() => setMobileMenuOpen(true)}>
<Menu className="w-6 h-6" />
</button>
<div className="flex items-center space-x-2">
<div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer" onClick={() => navigate('/')}> {/* Brain icon clickable */}
<Brain className="w-4 h-4 text-white" />
</div>
<span className="font-semibold">Dashboard</span>
</div>
<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer relative" onClick={() => setShowAvatarDropdown(v => !v)}>
<span className="text-white font-bold text-base">{userName[0].toUpperCase()}</span>
{showAvatarDropdown && (
<div className="absolute right-0 mt-12 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-fadeIn">
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
</header>

{/* Mobile Navigation Drawer */}
{mobileMenuOpen && (
<div className="fixed inset-0 bg-black/40 z-50" onClick={() => setMobileMenuOpen(false)}>
<div className="bg-white w-64 h-full p-4" onClick={e => e.stopPropagation()}>
<div className="flex items-center justify-between mb-6">
<h2 className="font-semibold">Navigation</h2>
<button onClick={() => setMobileMenuOpen(false)}>
<X className="w-6 h-6" />
</button>
</div>
<nav className="space-y-2">
{[
{ icon: Home, label: 'Home' },
{ icon: Users, label: 'Therapists' },
{ icon: BookOpen, label: 'Scheduler' },
{ icon: MessageCircle, label: 'Health-Chat.ai' },
{ icon: Shield, label: 'Resources' },
].map(({ icon: Icon, label }) => (
<button
key={label}
className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100"
onClick={label === 'Home' ? () => { setMobileMenuOpen(false); navigate('/platform'); } : label === 'Therapists' ? () => { setMobileMenuOpen(false); navigate('/platform/therapists'); } : undefined}
>
<Icon className="w-5 h-5" />
<span>{label}</span>
</button>
))}
</nav>
</div>
</div>
)}

{/* Animated Mental Health Card (Top) */}
<div className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-3xl ml-2 p-6 flex flex-col items-center justify-center relative overflow-hidden mt-4 mb-8" style={{height: '220px', minHeight: '180px', width: '95%'}}>
<div className="absolute inset-0 pointer-events-none">
<svg width="100%" height="100%" viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0 w-full h-full animate-pulse">
<circle cx="80" cy="80" r="60" fill="#a5b4fc" fillOpacity="0.25">
<animate attributeName="r" values="60;80;60" dur="3s" repeatCount="indefinite" />
</circle>
<circle cx="240" cy="100" r="40" fill="#fca5a5" fillOpacity="0.18">
<animate attributeName="r" values="40;60;40" dur="2.5s" repeatCount="indefinite" />
</circle>
<ellipse cx="160" cy="180" rx="50" ry="30" fill="#fcd34d" fillOpacity="0.15">
<animate attributeName="rx" values="50;70;50" dur="3.5s" repeatCount="indefinite" />
</ellipse>
</svg>
</div>
<div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
<div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center shadow-lg animate-bounce mb-2">
<Brain className="w-8 h-8 text-white" />
</div>
<h3 className="font-bold text-lg text-blue-700 mb-1 animate-fadeIn">Mental Health</h3>
<p className="text-xs text-gray-700 text-center max-w-xs animate-fadeIn delay-200">Take a deep breath. Your mental health matters. Pace yourself, meditate, and connect with therapists for support.</p>
<div className="mt-2 flex space-x-1 animate-fadeIn delay-300">
<span className="px-2 py-0.5 rounded-full bg-blue-200 text-blue-700 text-xs font-semibold shadow">Mindfulness</span>
<span className="px-2 py-0.5 rounded-full bg-purple-200 text-purple-700 text-xs font-semibold shadow">Progress Tracker</span>
<span className="px-2 py-0.5 rounded-full bg-pink-200 text-pink-700 text-xs font-semibold shadow">Therapy</span>
</div>
</div>
</div>

{/* Plans */}
<div className="bg-white mx-2 rounded-2xl shadow-lg p-4 mb-4">
<div className="flex items-center justify-between mb-3">
<h3 className="font-semibold">Active Plans</h3>
<Plus className="w-5 h-5 text-gray-400" />
</div>
<div className="space-y-3">
<div className="bg-blue-50 rounded-xl p-3">
<div className="flex items-center justify-between">
<div>
<span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Daily Workout</span>
<h4 className="font-semibold text-sm mt-1">Building Confidence</h4>
</div>
<ChevronRight className="w-5 h-5 text-blue-500" />
</div>
</div>
<div className="bg-orange-50 rounded-xl p-3">
<div className="flex items-center justify-between">
<div>
<span className="bg-orange-500 text-white px-2 py-1 rounded text-xs">Meditation</span>
<h4 className="font-semibold text-sm mt-1">Anxiety relief</h4>
</div>
<ChevronRight className="w-5 h-5 text-orange-500" />
</div>
</div>
</div>
</div>

{/* Sleep Level & Meditation */}
<div className="grid grid-cols-2 gap-4 px-3 py-2">
<div className="bg-blue-600 rounded-3xl w-40 h-40 p-4">
<div className="flex items-center space-x-2 mb-12">
<Moon className="w-5 h-5 text-blue-200" />
<h3 className="font-semibold text-gray-100">Streak level</h3>
</div>
<div className="mt-4 flex items-center justify-between">
<div>
<div className="text-sm text-gray-50 font-bold">8h</div>
<div className="text-sm text-gray-100">Average focus duration in March</div>
</div>
<TrendingUp className="w-5 h-5 text-white" />
</div>
</div>

<div className="bg-orange-500 rounded-3xl w-40 h-40 p-4">
<div className="flex items-center space-x-2 mb-12">
<Heart className="w-5 h-5 text-orange-200" />
<h3 className="font-semibold text-gray-50">Meditation</h3>
</div>
<div className="flex items-center justify-between">
<div>
<div className="text-sm text-gray-50 font-bold">16</div>
<div className="text-sm text-gray-50">Days meditated in March</div>
</div>
<TrendingUp className="w-5 h-5 text-white" />
</div>
</div>
</div>

{/* Conversation Video Card (Bottom, scrollable) */}
<div className="bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col justify-end relative mx-2 my-4" style={{ minHeight: '180px', height: '180px' }}>
<video
autoPlay
loop
muted
playsInline
className="absolute inset-0 w-full h-full object-cover"
style={{ zIndex: 0 }}
poster="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80"
>
<source src="https://cdn.videvo.net/videvo_files/video/free/2013-08/large_watermarked/African_Sunset.mp4" type="video/mp4" />
</video>
<div className="relative z-10 p-4 flex flex-col justify-end h-full" style={{ background: 'rgba(0,0,0,0.25)' }}>
<h3 className="text-white text-base font-semibold mb-1 drop-shadow">Meaningful Connections</h3>
<p className="text-white text-xs drop-shadow">Conversations can uplift your mood. Reach out and connect with someone today!</p>
</div>
</div>

{/* Contact Doctor - Therapy Section */}
<div className="bg-white rounded-2xl p-4 mb-20 shadow-lg mx-2">
<div className="flex items-center justify-between mb-3">
<span className="bg-pink-500 text-white px-2 py-1 rounded text-xs">Therapy</span>
<div className="flex space-x-2">
<button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
<MessageCircle className="w-4 h-4" />
</button>
<button className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
<Phone className="w-4 h-4" />
</button>
</div>
</div>
{bookedTherapist ? (
<>
<h3 className="font-semibold mb-2">{therapyTracker?.doctor?.name} <br />{therapyTracker?.date || ''} <br />{therapyTracker?.therapy || recommendedTherapy || ''} is {bookedTherapist.status === 'approved' ? 'online' : 'pending approval'}</h3>
<div className="flex items-center space-x-3">
<div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-bold">
{bookedTherapist.name.replace(/Dr\.?\s*/i, '').charAt(0).toUpperCase()}
</div>
<div className="flex-1">
<p className="text-sm text-gray-600">{bookedTherapist.specialty}</p>
<span className="bg-gray-800 text-white px-2 py-1 rounded text-xs">{bookedTherapist.status === 'approved' ? '10y exp' : 'Pending approval'}</span>
</div>
</div>
</>
) : (
<>
<h3 className="font-semibold mb-2">No therapist booked</h3>
<button
className="mt-3 px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600"
onClick={() => navigate('/platform/therapists')}
>
Book a Therapist
</button>
</>
)
}
</div>


{/* Mobile Bottom Navigation */}
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
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
onClick={label === 'Home' ? () => navigate('/platform') : label === (label) ? () => navigate(path) : undefined}
>
<Icon className={`w-5 h-5 ${isActive ? 'text-gray-800' : 'text-gray-600'}`} />
<span className={`text-xs mt-1 ${isActive ? 'text-gray-800 font-semibold' : 'text-gray-600'}`}>{label}</span>
</button>
);
})}
</div>
</nav>
</div>
);
}



  
  

  // User info state
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('No email');

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUserName(data.name || 'User');
          setUserEmail(data.email || 'No email');
        }
      } catch (e) {
        // fallback to localStorage if needed
      }
    };
    fetchUser();
  }, []);

  return (
    <div>
      {showTherapists ? (
        <>
          <div className="hidden lg:block">
            {loadingTherapists ? (
              <div className="p-8 text-center text-gray-500">Loading therapists...</div>
            ) : therapistsError ? (
              <div className="p-8 text-center text-red-500">{therapistsError}</div>
            ) : (
              <Therapists 
                therapists={therapists}
                setTherapists={setTherapists}
                bookedTherapist={bookedTherapist}
                setBookedTherapist={setBookedTherapist}
                onBookOrUnbook={handleBookOrUnbook}
                onAddTherapist={handleAddTherapist}
                setTherapyTracker={setTherapyTracker}
              />
            )}
          </div>
          <div className="lg:hidden">
            {loadingTherapists ? (
              <div className="p-8 text-center text-gray-500">Loading therapists...</div>
            ) : therapistsError ? (
              <div className="p-8 text-center text-red-500">{therapistsError}</div>
            ) : (
              <TherapistsMobile 
                therapists={therapists}
                setTherapists={setTherapists}
                setShowTherapists={setShowTherapists}
                bookedTherapist={bookedTherapist}
                setBookedTherapist={setBookedTherapist}
                onBookOrUnbook={handleBookOrUnbook}
                onAddTherapist={handleAddTherapist}
                setTherapyTracker={setTherapyTracker}
              />
            )}
          </div>
        </>
      ) : (
        <>
          <DesktopDashboard userName={userName} userEmail={userEmail} />
          <MobileDashboard userName={userName} userEmail={userEmail} />
        </>
      )}
    </div>
  );
}

export default Dashboard;
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

const Dashboard = ({ showTherapistsProp = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [healthData, setHealthData] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [showTherapists, setShowTherapists] = useState(showTherapistsProp);
  const [bookedTherapist, setBookedTherapist] = useState(null);
  const [therapists, setTherapists] = useState([]); // Start with empty array
  const [loadingTherapists, setLoadingTherapists] = useState(true);
  const [therapistsError, setTherapistsError] = useState(null);
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
    fetch('http://localhost:5000/api/therapists')
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
        fetch('http://localhost:5000/api/therapists')
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
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => setHealthData(data));
  }, []);

  // Music Player State
  const musicTracks = [
    {
      title: 'Niombee',
      artist: 'BenSoul',
      cover: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=200&h=200&fit=crop',
      duration: '2:46',
    },
    {
      title: 'Sura Yako',
      artist: 'Sauti Sol',
      cover: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=200&h=200&fit=crop',
      duration: '3:12',
    },
    {
      title: 'Mungu Pekee',
      artist: 'Nyashinski',
      cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&h=200&fit=crop',
      duration: '3:45',
    },
  ];

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
    const res = await fetch('http://localhost:5000/api/therapists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTherapist)
    });
    const added = await res.json();
    setTherapists(prev => [...prev, added]);
  };

  // Handler to book/unbook a therapist and sync with backend
  const handleBookOrUnbook = async (therapist) => {
    await fetch(`http://localhost:5000/api/therapists/${therapist._id}/book`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booked: !therapist.booked })
    });
    // Refetch therapists to sync state
    fetch('http://localhost:5000/api/therapists')
      .then(res => res.json())
      .then(data => setTherapists(data));
    setBookedTherapist(therapist.booked ? null : therapist);
    setShowTherapists(false);
  };

  // Desktop Component
  const DesktopDashboard = () => (
    <div className="hidden min-h-screen p-6 bg-gray-100 lg:block">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-10 h-10 transition-transform bg-gray-800 rounded-full cursor-pointer hover:scale-105" onClick={() => navigate('/')}> {/* Home icon clickable */}
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center space-x-2">
            <button
              className={`bg-gray-800 text-gray-100 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:scale-105 transition-transform border border-gray-800${location.pathname === '/platform' ? ' ring-2 ring-blue-500' : ''}`}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              onClick={() => { setShowTherapists(false); navigate('/platform'); }}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button
              className={`bg-gray-100 text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:bg-gray-800 hover:text-gray-100 transition-colors border border-gray-200${location.pathname === '/platform/therapists' ? ' ring-2 ring-blue-500' : ''}`}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              onClick={() => { setShowTherapists(false); navigate('/platform/therapists'); }}
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
              className={`bg-gray-100 text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:bg-gray-800 hover:text-gray-100 transition-colors border border-gray-200${location.pathname === '/platform/ai-doctor' ? ' ring-2 ring-blue-500' : ''}`}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Health-Chat.ai</span>
            </button>
            <button
              className={`bg-gray-100 text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:bg-gray-800 hover:text-gray-100 transition-colors border border-gray-200${location.pathname === '/platform/resources' ? ' ring-2 ring-blue-500' : ''}`}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
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
          <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full">
            <span className="font-medium text-white">A</span>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" 
            alt="Profile" 
            className="w-10 h-10 rounded-full"
          />
        </div>
      </nav>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="col-span-3 space-y-6">
          {/* Music Player */}
          <div className="p-6 bg-white rounded-3xl">
            <div className="relative">
              <img 
                src={musicTracks[currentTrack].cover}
                alt="Album Cover" 
                className="object-cover w-full h-48 rounded-2xl"
              />
              <div className="absolute text-white bottom-4 left-4">
                <div className="text-sm">{musicTracks[currentTrack].duration}</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <h3 className="font-semibold text-gray-900">{musicTracks[currentTrack].artist}</h3>
              <p className="text-sm text-gray-600">{musicTracks[currentTrack].title}</p>
            </div>
            <div className="flex items-center justify-center mt-4 space-x-4">
              <button className="p-2 transition bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200" onClick={handlePrevTrack} aria-label="Previous Track">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="p-2 transition bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200" onClick={handlePrevTrack} aria-label="Rewind">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="p-4 text-white transition bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600" aria-label="Play/Pause">
                <div className="w-0 h-0 border-l-[8px] border-l-white border-y-[6px] border-y-transparent ml-1"></div>
              </button>
              <button className="p-2 transition bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200" onClick={handleNextTrack} aria-label="Forward">
                <ChevronRight className="w-5 h-5" />
              </button>
              <button className="p-2 transition bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200" onClick={handleNextTrack} aria-label="Next Track">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar */}
          <div className="p-6 bg-white rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <button onClick={handlePrevMonth} className="p-1 transition rounded-full cursor-pointer hover:bg-gray-100" aria-label="Previous Month">
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div className="relative">
                <button
                  className="px-2 py-1 font-semibold rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => setShowMonthPicker((v) => !v)}
                >
                  {getMonthName(calendarDate.month)}
                </button>
                {showMonthPicker && (
                  <div className="absolute z-20 grid w-64 grid-cols-3 p-4 -translate-x-1/2 bg-white border border-gray-200 shadow-lg left-1/2 top-10 rounded-2xl gap-x-3 gap-y-2 animate-fadeIn">
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
                  className="px-2 py-1 font-semibold rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => setShowYearPicker((v) => !v)}
                >
                  {calendarDate.year}
                </button>
                {showYearPicker && (
                  <div className="absolute z-20 flex flex-col items-center w-32 p-3 overflow-y-auto -translate-x-1/2 bg-white border border-gray-200 shadow-lg left-1/2 top-10 rounded-2xl max-h-56 animate-fadeIn">
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
              <button onClick={handleNextMonth} className="p-1 transition rounded-full cursor-pointer hover:bg-gray-100" aria-label="Next Month">
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2 text-xs text-center text-gray-500">
              <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-sm text-center">
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
          <div className="p-6 bg-white rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Today's schedule</h3>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-center mb-4 space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Morning Run</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Evening walk with friends</span>
              </div>
            </div>
            <div className="inline-block px-3 py-1 mb-4 text-sm text-white bg-gray-800 rounded-full">
              Vitamin D
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>9:00</span><span>11:00</span><span>13:00</span><span>15:00</span><span>17:00</span><span>19:00</span><span>21:00</span>
            </div>
          </div>

          {/* Sleep Level & Meditation */}
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-3xl">
              <div className="flex items-center mb-4 space-x-2">
                <Moon className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">Streak level</h3>
              </div>
              <div className="flex items-end justify-center h-32 p-4 bg-gray-50 rounded-2xl">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className={`w-2 mx-1 bg-blue-${i % 3 === 0 ? '500' : '300'} rounded-t`} style={{height: `${Math.random() * 80 + 20}%`}}></div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4">
                <div>
                  <div className="text-2xl font-bold">8h</div>
                  <div className="text-sm text-gray-500">Average focus duration in March</div>
                </div>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl">
              <div className="flex items-center mb-4 space-x-2">
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
          <div className="p-6 bg-white rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Therapy tracker</h3>
              <select className="px-3 py-1 text-sm border border-gray-200 rounded-lg">
                <option>6 months</option>
              </select>
            </div>
            <div className="grid grid-cols-6 gap-4 mb-4">
              {['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map((month, i) => (
                <div key={month} className="text-center">
                  <div className="mb-2 text-xs text-gray-500">{month}</div>
                  <div className={`h-16 rounded-lg ${i % 2 === 0 ? 'bg-red-100' : 'bg-blue-100'} flex items-center justify-center`}>
                    <span className="text-lg font-bold">{[7, 4, 6, 10, 2, 12][i]}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">50%</div>
              <div className="px-3 py-1 text-sm text-white bg-gray-800 rounded-full">
                Avg 3 sessions / week
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-3 space-y-6">
          {/* Plans */}
          <div className="p-6 bg-white rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Plans</h3>
              <button
                className="flex items-center justify-center w-8 h-8 text-white transition bg-blue-500 rounded-full hover:bg-blue-600"
                onClick={handleAddPlan}
                aria-label="Add Plan"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3" style={plans.length > 3 ? { maxHeight: '260px', overflowY: 'auto' } : {}}>
              {plans.map(plan => (
                <div key={plan.id} className={`bg-${plan.color}-50 rounded-2xl p-4 relative group`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`bg-${plan.color}-500 text-white px-2 py-1 rounded text-xs`}>{plan.category}</span>
                    <div className="flex space-x-1 transition opacity-0 group-hover:opacity-100">
                      <button
                        className={`w-8 h-8 bg-${plan.color}-500 text-white rounded-full flex items-center justify-center hover:bg-${plan.color}-600 transition`}
                        onClick={() => handleEditPlan(plan)}
                        aria-label="Edit Plan"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6-6 3 3-6 6H9v-3z" /></svg>
                      </button>
                      <button
                        className="flex items-center justify-center w-8 h-8 text-gray-700 transition bg-gray-200 rounded-full hover:bg-red-500 hover:text-white"
                        onClick={() => handleDeletePlan(plan.id)}
                        aria-label="Delete Plan"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold">{plan.title}</h4>
                  <p className="text-xs text-gray-600">{plan.description}</p>
                </div>
              ))}
            </div>
            {showPlanForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowPlanForm(false)}>
                <form
                  className="relative w-full max-w-md p-8 space-y-5 bg-white border border-gray-100 shadow-xl rounded-2xl animate-fadeIn"
                  onClick={e => e.stopPropagation()}
                  onSubmit={handlePlanFormSubmit}
                >
                  <button type="button" className="absolute text-2xl text-gray-400 top-3 right-3 hover:text-black" onClick={() => setShowPlanForm(false)} aria-label="Close">&times;</button>
                  <h3 className="mb-2 text-lg font-semibold">{editingPlan ? 'Edit Plan' : 'Add Plan'}</h3>
                  <div className="flex space-x-2">
                    <select name="category" value={planForm.category} onChange={handlePlanFormChange} required className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-200">
                      <option value="">Category</option>
                      <option value="Sleep">Sleep</option>
                      <option value="Meditation">Meditation</option>
                      <option value="Studying">Studying</option>
                    </select>
                    <select name="color" value={planForm.color} onChange={handlePlanFormChange} required className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-200">
                      <option value="blue">Blue</option>
                      <option value="orange">Orange</option>
                      <option value="purple">Purple</option>
                    </select>
                  </div>
                  <input
                    type='text'
                    name='title'
                    value={planForm.title}
                    onChange={e => {
                      e.stopPropagation();
                      handlePlanFormChange(e);
                    }}
                    autoComplete='off'
                    placeholder='Title'
                    className='w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-200'
                  />
                  <textarea
                    name='description'
                    value={planForm.description}
                    onChange={e => {
                      e.stopPropagation();
                      handlePlanFormChange(e);
                    }}
                    autoComplete='off'
                    placeholder='Description'
                    className='border border-gray-200 rounded-xl px-4 py-3 w-full min-h-[60px] bg-gray-50 focus:ring-2 focus:ring-blue-200'
                  />
                  <div className="flex justify-end mt-2 space-x-2">
                    <button type="button" className="px-4 py-2 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300" onClick={() => setShowPlanForm(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 text-white bg-blue-500 rounded-xl hover:bg-blue-600">
                      {editingPlan ? 'Save' : 'Add'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Contact Doctor - Therapy Section */}
          <div className="p-6 bg-white rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="px-2 py-1 text-xs text-white bg-pink-500 rounded">Therapy</span>
              <div className="flex space-x-2">
                <button className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button className="flex items-center justify-center w-8 h-8 text-white bg-blue-500 rounded-full">
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            </div>
            {bookedTherapist ? (
              <>
                <h3 className="mb-2 font-semibold">{bookedTherapist.name} is {bookedTherapist.status === 'approved' ? 'online' : 'pending approval'}</h3>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 text-lg font-bold text-white bg-blue-500 rounded-full">
                    {bookedTherapist.name.replace(/Dr\.?\s*/i, '').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{bookedTherapist.specialty}</p>
                    <span className="px-2 py-1 text-xs text-white bg-gray-800 rounded">{bookedTherapist.status === 'approved' ? '10y exp' : 'Pending approval'}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="mb-2 font-semibold">No therapist booked</h3>
                <button
                  className="px-4 py-2 mt-3 text-white bg-blue-500 rounded-xl hover:bg-blue-600"
                  onClick={() => navigate('/platform/therapists')}
                >
                  Book a Therapist
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Example health data display */}
      <div className="mt-8">
        <h2 className="mb-2 text-xl font-bold">Health Records</h2>
        <ul>
          {healthData.map(record => (
            <li key={record._id} className="mb-2 text-sm text-gray-700">
              {record.type}: {JSON.stringify(record.value)} ({new Date(record.date).toLocaleDateString()})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  // Mobile Component
  const MobileDashboard = () => (
    <div className="flex flex-col min-h-screen bg-gray-100 lg:hidden">
      {/* Mobile Header */}
      <header className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm' : 'bg-transparent'} px-4 py-3 flex items-center justify-between`}>
        <button onClick={() => setMobileMenuOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-gray-800 rounded-full cursor-pointer" onClick={() => navigate('/')}> {/* Brain icon clickable */}
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold">Dashboard</span>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" 
          alt="Profile" 
          className="w-8 h-8 rounded-full"
        />
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setMobileMenuOpen(false)}>
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
                { icon: MessageCircle, label: 'Health-Chat.ai', path: '/platform/ai-doctor' },
                { icon: Shield, label: 'Resources', path: '/platform/resources' },
              ].map(({ icon: Icon, label, path }) => (
                <button
                  key={label}
                  className="flex items-center w-full p-3 space-x-3 rounded-lg hover:bg-gray-100"
                  onClick={() => { setMobileMenuOpen(false); navigate(path); }}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Content */}
      <div className="flex-1 min-h-0 p-4 pb-24 space-y-4 overflow-y-auto">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 text-white bg-blue-500 rounded-2xl">
            <Moon className="w-8 h-8 mb-2" />
            <h3 className="font-semibold">Streak</h3>
            <p className="text-sm opacity-90">8h avg</p>
          </div>
          <div className="p-4 text-white bg-orange-500 rounded-2xl">
            <Heart className="w-8 h-8 mb-2" />
            <h3 className="font-semibold">Meditation</h3>
            <p className="text-sm opacity-90">16 days</p>
          </div>
        </div>

        {/* Pills Schedule */}
        <div className="p-4 bg-white rounded-2xl">
          <h3 className="mb-3 font-semibold">Today's Schedule</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-green-50">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Morning Run</span>
              </div>
              <span className="text-xs text-gray-500">9:00 AM</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Evening walk with friends</span>
              </div>
              <span className="text-xs text-gray-500">7:00 PM</span>
            </div>
          </div>
        </div>

        {/* Current Playing */}
        <div className="p-4 bg-white rounded-2xl">
          <h3 className="mb-3 font-semibold">Now Playing</h3>
          <div className="flex items-center space-x-3">
            <img 
              src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=60&h=60&fit=crop" 
              alt="Album" 
              className="rounded-lg w-15 h-15"
            />
            <div className="flex-1">
              <h4 className="font-medium">Bensoul</h4>
              <p className="text-sm text-gray-600">Niombee</p>
            </div>
            <button className="flex items-center justify-center w-12 h-12 text-white bg-blue-500 rounded-full">
              <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-1"></div>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="p-4 bg-white rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Active Plans</h3>
            <Plus className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="px-2 py-1 text-xs text-white bg-blue-500 rounded">Sleep</span>
                  <h4 className="mt-1 text-sm font-semibold">Insomnia recovery</h4>
                </div>
                <ChevronRight className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="px-2 py-1 text-xs text-white bg-orange-500 rounded">Meditation</span>
                  <h4 className="mt-1 text-sm font-semibold">Anxiety relief</h4>
                </div>
                <ChevronRight className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Doctor - Therapy Section */}
        <div className="p-4 bg-white rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="px-2 py-1 text-xs text-white bg-pink-500 rounded">Therapy</span>
            <div className="flex space-x-2">
              <button className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                <MessageCircle className="w-4 h-4" />
              </button>
              <button className="flex items-center justify-center w-8 h-8 text-white bg-blue-500 rounded-full">
                <Phone className="w-4 h-4" />
              </button>
            </div>
          </div>
          {bookedTherapist ? (
            <>
              <h3 className="mb-2 font-semibold">{bookedTherapist.name} is {bookedTherapist.status === 'approved' ? 'online' : 'pending approval'}</h3>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 text-lg font-bold text-white bg-blue-500 rounded-full">
                  {bookedTherapist.name.replace(/Dr\.?\s*/i, '').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{bookedTherapist.specialty}</p>
                  <span className="px-2 py-1 text-xs text-white bg-gray-800 rounded">{bookedTherapist.status === 'approved' ? '10y exp' : 'Pending approval'}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="mb-2 font-semibold">No therapist booked</h3>
              <button
                className="px-4 py-2 mt-3 text-white bg-blue-500 rounded-xl hover:bg-blue-600"
                onClick={() => navigate('/platform/therapists')}
              >
                Book a Therapist
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 py-2 bg-white border-t border-gray-200">
        <div className="flex justify-around">
          {[
            { icon: Home, label: 'Home', path: '/platform' },
            { icon: BarChart3, label: 'Stats', path: '/platform/stats' },
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

  // Desktop and mobile routing for Therapists
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
              />
            )}
          </div>
        </>
      ) : (
        <>
          <DesktopDashboard />
          <MobileDashboard />
        </>
      )}
    </div>
  );
};

export default Dashboard;
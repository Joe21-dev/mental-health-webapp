import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, Target, Award, TrendingUp, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, BookOpen, MessageCircle, Shield, Search, Brain, BarChart3, Music, Moon, Phone, Menu, X } from 'lucide-react';

const Scheduler = () => {
  const [schedules, setSchedules] = useState([]);
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('schedule'); // 'schedule' or 'goal'
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    type: 'daily', // for goals: 'weekly', 'monthly', 'yearly'
    color: 'blue',
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
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch schedules and goals from backend
  useEffect(() => {
    fetch('/api/schedules')
      .then(res => res.json())
      .then(data => setSchedules(data));
    fetch('/api/goals')
      .then(res => res.json())
      .then(data => setGoals(data));
  }, []);

  // Scroll handler for header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }
  function handleFormSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const endpoint = formType === 'schedule' ? '/api/schedules' : '/api/goals';
    const method = editingItem ? 'PUT' : 'POST';
    const url = editingItem ? `${endpoint}/${editingItem._id}` : endpoint;
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(data => {
        if (formType === 'schedule') {
          setSchedules(s => editingItem ? s.map(i => i._id === data._id ? data : i) : [...s, data]);
        } else {
          setGoals(g => editingItem ? g.map(i => i._id === data._id ? data : i) : [...g, data]);
        }
        setShowForm(false);
        setEditingItem(null);
        setForm({ title: '', description: '', date: '', type: 'daily', color: 'blue' });
      });
  }
  function handleEdit(item, type) {
    setFormType(type);
    setEditingItem(item);
    setForm({
      title: item.title,
      description: item.description || '',
      date: item.date || '',
      type: item.type || (type === 'goal' ? 'weekly' : 'daily'),
      color: item.color || 'blue',
    });
    setShowForm(true);
  }
  function handleDelete(item, type) {
    const endpoint = type === 'schedule' ? '/api/schedules' : '/api/goals';
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
            className="flex items-center px-4 py-2 space-x-2 font-bold text-blue-700 bg-blue-100 border border-blue-200 rounded-full cursor-default"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            disabled
          >
            <BookOpen className="w-4 h-4" />
            <span>Scheduler</span>
          </button>
          <button
            className="flex items-center px-4 py-2 space-x-2 text-gray-800 transition-colors bg-gray-100 border border-gray-200 rounded-full cursor-pointer hover:bg-gray-800 hover:text-gray-100"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            onClick={() => navigate('/signup-login')}
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
  );

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
      <img 
        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" 
        alt="Profile" 
        className="w-8 h-8 rounded-full"
      />
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
              { icon: MessageCircle, label: 'Health-Chat.ai', path: '/ai-doctor' },
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
          { icon: BarChart3, label: 'Stats', path: '/stats' },
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

  // Main UI
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Mobile Header (fixed, full width) */}
      <div className="fixed top-0 left-0 right-0 z-40 w-full">
        <MobileHeader />
        <MobileNavDrawer />
      </div>
      {/* Main content: scrollable, with padding for header and bottom nav */}
      <div className="flex-1 w-full overflow-y-auto pt-[64px] pb-[64px] px-0 lg:pt-0 lg:pb-0 lg:px-6">
        <div className="hidden lg:block">
          <Header />
        </div>
        <div className="grid grid-cols-1 gap-8 px-4 mt-4 lg:grid-cols-2 lg:px-0">
          {/* Calendar and Schedules */}
          <div className="p-6 bg-white shadow rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center text-lg font-semibold"><Calendar className="w-5 h-5 mr-2 text-blue-500" /> Calendar</h3>
              <button className="flex items-center px-3 py-1 text-white bg-blue-500 rounded" onClick={() => { setFormType('schedule'); setShowForm(true); }}><Plus className="w-4 h-4 mr-1" /> Add Schedule</button>
            </div>
            {/* Calendar UI */}
            <div className="flex items-center justify-between mb-2">
              <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-100"><ChevronLeft className="w-5 h-5 text-gray-400" /></button>
              <div className="relative">
                <button className="px-2 py-1 font-semibold rounded cursor-pointer hover:bg-gray-100" onClick={() => setShowMonthPicker(v => !v)}>{getMonthName(calendarDate.month)}</button>
                {showMonthPicker && (
                  <div className="absolute z-20 grid w-64 grid-cols-3 p-4 -translate-x-1/2 bg-white border border-gray-200 shadow-lg left-1/2 top-10 rounded-2xl gap-x-3 gap-y-2 animate-fadeIn">
                    {Array.from({ length: 12 }).map((_, m) => (
                      <button key={m} className={`px-0 py-2 rounded-xl font-medium transition text-sm cursor-pointer hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center ${calendarDate.month === m ? 'bg-black text-white shadow' : 'text-gray-700'}`} style={{ minWidth: '60px' }} onClick={() => { setCalendarDate(prev => ({ ...prev, month: m })); setShowMonthPicker(false); }}>{getMonthName(m)}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <button className="px-2 py-1 font-semibold rounded cursor-pointer hover:bg-gray-100" onClick={() => setShowYearPicker(v => !v)}>{calendarDate.year}</button>
                {showYearPicker && (
                  <div className="absolute z-20 flex flex-col items-center w-32 p-3 overflow-y-auto -translate-x-1/2 bg-white border border-gray-200 shadow-lg left-1/2 top-10 rounded-2xl max-h-56 animate-fadeIn">
                    {Array.from({ length: 12 }).map((_, i) => {
                      const y = new Date().getFullYear() - 6 + i;
                      return (
                        <button key={y} className={`w-full px-2 py-2 rounded-xl font-medium transition text-sm cursor-pointer hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-1 ${calendarDate.year === y ? 'bg-black text-white shadow' : 'text-gray-700'}`} onClick={() => { setCalendarDate(prev => ({ ...prev, year: y })); setShowYearPicker(false); }}>{y}</button>
                      );
                    })}
                  </div>
                )}
              </div>
              <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-100"><ChevronRight className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2 text-xs text-center text-gray-500">
              <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-4 text-sm text-center">
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
                    <button key={d} className={`p-1 w-8 h-8 rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${isSelected ? 'bg-black text-white' : isToday ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-blue-100'}`} onClick={() => setSelectedDate({ day: d, month: calendarDate.month, year: calendarDate.year })} aria-label={`Select ${getMonthName(calendarDate.month)} ${d}, ${calendarDate.year}`}>{d}</button>
                  );
                }
                return days;
              })()}
            </div>
            {/* Schedules for selected date */}
            <div className="flex items-center justify-between mb-2">
              <h4 className="flex items-center font-semibold text-blue-600 text-md"><Clock className="w-4 h-4 mr-1" /> Daily Schedules</h4>
              <button className="text-sm text-blue-500 hover:underline" onClick={() => { setFormType('schedule'); setShowForm(true); }}>+ Add</button>
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
          {/* Goals */}
          <div className="p-6 bg-white shadow rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center text-lg font-semibold"><Target className="w-5 h-5 mr-2 text-green-500" /> Goals</h3>
              <button className="flex items-center px-3 py-1 text-white bg-green-500 rounded" onClick={() => { setFormType('goal'); setShowForm(true); }}><Plus className="w-4 h-4 mr-1" /> Add Goal</button>
            </div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="flex items-center font-semibold text-green-600 text-md"><Award className="w-4 h-4 mr-1" /> Weekly, Monthly, Yearly</h4>
              <button className="text-sm text-green-500 hover:underline" onClick={() => { setFormType('goal'); setShowForm(true); }}>+ Add</button>
            </div>
            <ul className="space-y-3">
              {goals.filter(g => g && g.type && g.title && typeof g === 'object').map(g => (
                <li key={g._id} className={`rounded-xl p-4 flex items-center justify-between bg-${g.color || 'green'}-50`}>
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
        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => { setShowForm(false); setEditingItem(null); }}>
            <form
              className="relative w-full max-w-md p-8 space-y-5 bg-white border border-gray-100 shadow-xl rounded-2xl animate-fadeIn"
              onClick={e => e.stopPropagation()}
              onSubmit={handleFormSubmit}
            >
              <button type="button" className="absolute text-2xl text-gray-400 top-3 right-3 hover:text-black" onClick={() => { setShowForm(false); setEditingItem(null); }} aria-label="Close">&times;</button>
              <h3 className="mb-2 text-lg font-semibold">{editingItem ? `Edit ${formType === 'goal' ? 'Goal' : 'Schedule'}` : `Add ${formType === 'goal' ? 'Goal' : 'Schedule'}`}</h3>
              <input name="title" value={form.title} onChange={handleFormChange} placeholder="Title" className="w-full px-3 py-2 mb-2 border rounded" required />
              <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Description" className="w-full px-3 py-2 mb-2 border rounded" />
              <input name="date" type="date" value={form.date} onChange={handleFormChange} className="w-full px-3 py-2 mb-2 border rounded" required={formType === 'schedule'} />
              {formType === 'goal' && (
                <select name="type" value={form.type} onChange={handleFormChange} className="w-full px-3 py-2 mb-2 border rounded">
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              )}
              <select name="color" value={form.color} onChange={handleFormChange} className="w-full px-3 py-2 mb-2 border rounded">
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="orange">Orange</option>
                <option value="purple">Purple</option>
                <option value="red">Red</option>
              </select>
              <div className="flex justify-end mt-2 space-x-2">
                <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={() => { setShowForm(false); setEditingItem(null); }}>
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-white bg-blue-500 rounded">
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

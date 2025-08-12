import React, { useState, useEffect } from 'react';
import { Home, BarChart3, Calendar, Users, Music, Brain, Menu, X, MessageCircle, Shield, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function TherapistsMobile() {
  const [bookedDoctorId, setBookedDoctorId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [therapyTracker, setTherapyTracker] = useState(null);
  const [userCondition, setUserCondition] = useState('');
  const [recommendedTherapy, setRecommendedTherapy] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showInfo, setShowInfo] = useState(true);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${BACKEND_URL}/api/therapists`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch therapists');
        return res.json();
      })
      .then(data => {
        setDoctors(data);
        // Find if any doctor is booked by this user
        const booked = data.find(d => d.bookedBy === userId);
        setBookedDoctorId(booked ? booked._id : null);
        setLoading(false);
      })
      .catch(err => {
        setError('Could not fetch therapists. Please check your connection or try again later.');
        setLoading(false);
      });
  }, [userId]);

  useEffect(() => {
    const stored = sessionStorage.getItem('therapyTrackerMobile');
    if (stored) {
      setTherapyTracker(JSON.parse(stored));
    }
  }, []);
  
  useEffect(() => {
    if (therapyTracker) {
      sessionStorage.setItem('therapyTrackerMobile', JSON.stringify(therapyTracker));
    } else {
      sessionStorage.removeItem('therapyTrackerMobile');
    }
  }, [therapyTracker]);

  useEffect(() => {
    if (showInfo) {
      const timer = setTimeout(() => setShowInfo(false), 12000);
      return () => clearTimeout(timer);
    }
  }, [showInfo]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          setUserId(data.id || data._id || null);
        })
        .catch(() => {
          setUserName('');
          setUserEmail('');
          setUserId(null);
        });
    } else {
      setUserName(localStorage.getItem('userName') || '');
      setUserEmail(localStorage.getItem('userEmail') || '');
      setUserId(localStorage.getItem('userId') || null);
    }
  }, []);

  function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).slice(-2);
    }
    return color;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (name === 'condition') {
      setUserCondition(value);
      if (value.toLowerCase().includes('anxiety')) setRecommendedTherapy('Cognitive Behavioral Therapy');
      else if (value.toLowerCase().includes('depression')) setRecommendedTherapy('Behavioral Activation');
      else if (value.toLowerCase().includes('stress')) setRecommendedTherapy('Mindfulness Therapy');
      else setRecommendedTherapy('General Therapy');
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.specialty.trim()) return;
    
    fetch(`${BACKEND_URL}/api/therapists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        specialty: form.specialty,
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to add therapist');
        return fetch(`${BACKEND_URL}/api/therapists`);
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch updated therapists');
        return res.json();
      })
      .then(data => {
        setDoctors(data);
        setForm({ name: '', specialty: '' });
        setShowForm(false);
        toast.success('Therapist added successfully!');
      })
      .catch(err => {
        console.error('Error adding therapist:', err);
        toast.error('Failed to add therapist. Please try again.');
      });
  }

  function handleBook(d) {
    if (!userId) return toast.error('You must be logged in to book a doctor');
    
    // Only allow booking if no other doctor is booked by this user or this doctor is already booked by this user
    if (!d.bookedBy && bookedDoctorId && bookedDoctorId !== d._id) {
      toast.error('You can only book one therapist at a time');
      return;
    }
    
    const isBookedByUser = d.bookedBy === userId;
    const newBooked = !isBookedByUser;
    const bookingInfo = newBooked ? {
      userId,
      name: userName,
      day: 'Monday',
      date: new Date().toISOString().slice(0,10),
      description: 'Booked via button',
      bookedAt: new Date().toISOString(),
      condition: d.condition || userCondition,
      therapy: d.therapy || recommendedTherapy
    } : null;
    
    fetch(`${BACKEND_URL}/api/therapists/${d._id}/book`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booked: newBooked, bookingInfo })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update booking');
        return fetch(`${BACKEND_URL}/api/therapists`);
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch updated therapists');
        return res.json();
      })
      .then(data => {
        setDoctors(data);
        // Update bookedDoctorId state
        if (newBooked) {
          setBookedDoctorId(d._id);
          toast.success('Therapist booked successfully!');
        } else {
          setBookedDoctorId(null);
          toast.info('Therapist unbooked');
        }
        
        if (newBooked) {
          const bookedDoctor = data.find(doc => doc._id === d._id);
          setTherapyTracker({
            doctor: bookedDoctor,
            day: bookingInfo.day,
            date: bookingInfo.date,
            description: bookingInfo.description,
            streak: 1,
            longestStreak: 1,
            bookedAt: bookingInfo.bookedAt
          });
        } else {
          setTherapyTracker(null);
        }
      })
      .catch(err => {
        console.error('Error booking therapist:', err);
        toast.error('Failed to book/unbook therapist. Please try again.');
      });
  }

  const [showForm, setShowForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [form, setForm] = useState({ name: '', specialty: '' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);

  // Delete doctor handler
  const handleDeleteDoctor = async (id) => {
    const doctor = doctors.find(d => d._id === id);
    if (!doctor || doctor.seeded) {
      toast.error('Cannot delete default seeded doctor.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/therapists/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete doctor');
      
      setDoctors(prev => prev.filter(d => d._id !== id));
      if (bookedDoctorId === id) {
        setBookedDoctorId(null);
        setTherapyTracker(null);
        sessionStorage.removeItem('therapyTrackerMobile');
      }
      toast.success('Therapist deleted successfully!');
    } catch (err) {
      console.error('Error deleting therapist:', err);
      toast.error('Failed to delete therapist. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm' : 'bg-transparent'} px-4 py-3 flex items-center justify-between lg:hidden`}>
        <button onClick={() => setMobileMenuOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-gray-800 rounded-full cursor-pointer" onClick={() => navigate('/platform')}>
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold">Therapists</span>
        </div>
        {/* Avatar dropdown */}
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer relative" onClick={() => setShowAvatarDropdown(v => !v)}>
          <span className="text-white font-bold text-lg">{(userName && userName.length > 0) ? userName[0].toUpperCase() : 'U'}</span>
          {showAvatarDropdown && (
            <div className="absolute right-0 mt-45 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-fadeIn">
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
      </header>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
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
      )}

      {/* Info alert */}
      {showInfo && (
        <div className="mb-4 p-4 mx-6 bg-blue-50 border-l-4 border-blue-400 text-blue-700 rounded-lg shadow">
          <p className="text-sm">
            Hello!!! Book a doctor easily by clicking the book button. Ensure you have added your condition. Thank You.
          </p>
        </div>
      )}

      <div className='px-4 py-4'>
        <h2 className="font-bold text-xl mb-4">Doctors</h2>
        <div className="flex gap-2 mb-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => setShowUserForm(true)}>
            Add Condition
          </button>
        </div>
        
        {loading ? (
          <div className="text-center text-gray-500 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            Loading therapists...
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        ) : (!doctors || doctors.length === 0) ? (
          <div className="text-gray-500 text-center py-8">No therapists available.</div>
        ) : (
          <ul className="space-y-4">
            {doctors.map(d => (
              <li key={d._id} className="bg-white rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg`}
                      style={{ background: stringToColor(d.name) }}
                    >
                      {d.name ? d.name.trim()[0].toUpperCase() : 'D'}
                    </div>
                    <div className="ml-3">
                      <div className="font-semibold">{d.name}</div>
                      <div className="text-xs text-gray-600">{d.specialty || ''}</div>
                      <div className="text-xs text-gray-400">{d.status || ''}</div>
                      {d.bookedBy === userId && d.bookingInfo && (
                        <div className="text-xs text-green-600 mt-1">Booked by you on {d.bookingInfo.date}</div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">Created: {d.createdAt ? new Date(d.createdAt).toLocaleString() : ''}</div>
                      {d.approvedAt && (
                        <div className="text-xs text-blue-500">Approved: {new Date(d.approvedAt).toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className={`px-2 py-1 rounded text-xs ${d.bookedBy === userId ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
                    onClick={() => handleBook(d)}
                    disabled={(!d.bookedBy && bookedDoctorId && bookedDoctorId !== d._id)}
                  >
                    {d.bookedBy === userId ? 'Unbook' : 'Book'}
                  </button>
                  {!d.seeded && (
                    <button
                      className="ml-1 p-1 rounded-full hover:bg-gray-200"
                      title="Delete doctor"
                      onClick={e => { e.stopPropagation(); handleDeleteDoctor(d._id); }}
                      aria-label="Delete doctor"
                    >
                      <X className="w-4 h-4 text-gray-500 hover:text-red-600" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Add Doctor Modal */}
        {showForm && (
          <div className="fixed inset-0 px-6 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowForm(false)}>
            <form
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4 relative animate-fadeIn border border-gray-100"
              onClick={e => e.stopPropagation()}
              onSubmit={handleSubmit}
            >
              <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-black text-xl" onClick={() => setShowForm(false)} aria-label="Close">&times;</button>
              <h3 className="font-semibold text-base mb-2">Add Doctor</h3>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="border-none bg-gray-50 shadow-xl rounded px-2 py-1 w-full mb-2 text-sm" />
              <input name="specialty" value={form.specialty} onChange={handleChange} placeholder="Specialty" className="border-none bg-gray-50 shadow-xl rounded px-2 py-1 w-full mb-2 text-sm" />
              <div className="flex justify-end space-x-2 mt-2">
                <button type="button" className="px-3 py-1 rounded bg-gray-200 text-xs" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1 rounded bg-blue-500 text-white text-xs">
                  Add
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add Condition Modal */}
        {showUserForm && (
          <div className="fixed inset-0 px-6 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowUserForm(false)}>
            <form
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4 relative animate-fadeIn border border-gray-100"
              onClick={e => e.stopPropagation()}
              onSubmit={e => {
                e.preventDefault();
                if (!userCondition.trim()) return;
                setRecommendedTherapy(recommendedTherapy);
                setTherapyTracker(tracker => ({
                  ...tracker,
                  therapy: recommendedTherapy,
                  date: new Date().toISOString().slice(0,10),
                  streak: (tracker?.streak || 0),
                  longestStreak: (tracker?.longestStreak || 0)
                }));
                setShowUserForm(false);
                toast.success('Condition added successfully!');
              }}
            >
              <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-black text-xl" onClick={() => setShowUserForm(false)} aria-label="Close">&times;</button>
              <h3 className="font-semibold text-base mb-2">Add Your Condition</h3>
              <input name="condition" value={userCondition} onChange={handleChange} placeholder="Your Condition (e.g. Anxiety, Depression)" className="border-none shadow-lg bg-gray-50 rounded px-2 py-1 w-full mb-2 text-sm" />
              {userCondition && (
                <div className="text-sm text-blue-600 mb-2">Recommended Therapy: <span className="font-bold">{recommendedTherapy}</span></div>
              )}
              <div className="flex justify-end space-x-2 mt-2">
                <button type="button" className="px-3 py-1 rounded bg-gray-200 text-xs" onClick={() => setShowUserForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1 rounded bg-blue-500 text-white text-xs">
                  Add
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Cards below doctors: 2-column grid */}
        <div className="grid grid-cols-2 gap-4 mt-2 mb-20">
          {/* Current Therapy Card */}
          <div className="p-4 bg-gray-50 rounded-xl shadow-lg border border-purple-100 flex flex-col justify-between">
            <h3 className="font-bold text-purple-700 mb-1 flex items-center text-sm"><Brain className="w-4 h-4 mr-1 text-purple-500" /> Current Therapy</h3>
            <div className="mb-1 text-base font-semibold text-gray-800">{therapyTracker?.doctor?.therapy || recommendedTherapy || ''}</div>
            <div className="mb-1 text-xs text-gray-600">Specialty: {therapyTracker?.doctor?.specialty || ''}</div>
            <div className="mb-1 text-xs text-gray-600">Started: {therapyTracker?.date || ''}</div>
            <div className="mt-1 text-xs text-gray-400">Stay consistent for best results!</div>
          </div>
          {/* Therapy Tracker Card */}
          <div className="p-4 bg-gray-50 rounded-xl shadow-lg border border-blue-100">
            <h3 className="font-bold text-blue-700 mb-1 flex items-center text-sm"><BookOpen className="w-4 h-4 mr-1 text-blue-500" /> Therapy Tracker</h3>
            <div className="mb-1 text-xs">Doctor: {therapyTracker?.doctor?.name || 'Dr. '}</div>
            <div className="mb-1 text-xs">Date: {therapyTracker?.date || ' '}</div>
            <div className="mb-1 text-xs">Description: {therapyTracker?.therapy || recommendedTherapy || ''}</div>
            <div className="mb-1 text-xs">Streak: <span className="font-bold text-green-600">{therapyTracker?.streak || 0}</span> days</div>
            <div className="mb-1 text-xs">Longest streak: <span className="font-bold text-blue-600">{therapyTracker?.longestStreak || 0}</span> days</div>
            <div className="text-xs text-gray-500">Booked at: {therapyTracker?.bookedAt ? new Date(therapyTracker.bookedAt).toLocaleString() : ''}</div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
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
    </div>
  );
}

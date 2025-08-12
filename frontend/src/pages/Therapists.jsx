import React, { useState, useEffect } from 'react';
import { UserPlus, UserCheck, UserX, PlusCircle, ClipboardCheck, Activity, CalendarDays, BarChart3, Home, Users, BookOpen, MessageCircle, Shield, Search, Brain, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_API_URL;

const Therapists = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [user, setUser] = useState({ username: '', name: '' });
  const [conditionModalOpen, setConditionModalOpen] = useState(false);
  const [condition, setCondition] = useState('');
  const [suggestedTreatment, setSuggestedTreatment] = useState('');
  const [currentTherapy, setCurrentTherapy] = useState(null);
  const [tracker, setTracker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);

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
          setUserId(data.id || data._id || null);
          setUser({ username: data.email || data.name, name: data.name || '' });
        })
        .catch(() => {
          setUserName('');
          setUserEmail('');
          setUserId(null);
          setUser({ username: '', name: '' });
        });
    } else {
      setUserName(localStorage.getItem('userName') || '');
      setUserEmail(localStorage.getItem('userEmail') || '');
      setUserId(localStorage.getItem('userId') || null);
      setUser({ username: localStorage.getItem('userName') || '', name: localStorage.getItem('userName') || '' });
    }
  }, []);

  // Fetch available doctors
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
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load therapists: ' + err.message);
        setLoading(false);
      });
  }, []);

  // Load user's therapy data from backend
  useEffect(() => {
    if (!userId) return;
    
    // Fetch user's therapy tracker data
    fetch(`${BACKEND_URL}/api/therapy-tracker?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const latestTracker = data[data.length - 1];
          setTracker(latestTracker);
          setCurrentTherapy({
            username: latestTracker.username,
            condition: latestTracker.condition,
            suggestedTreatment: latestTracker.suggestedTreatment,
            dateAdded: latestTracker.createdAt
          });
        }
      })
      .catch(err => console.error('Error loading therapy data:', err));
  }, [userId]);

  // Book/unbook doctor
  const handleBookDoctor = async (doctor) => {
    if (!userId) {
      alert('Please log in to book a therapist');
      return;
    }

    try {
      const isBookedByUser = doctor.bookedBy === userId;
      const newBooked = !isBookedByUser;
      
      const response = await fetch(`${BACKEND_URL}/api/therapists/${doctor._id}/book`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          booked: newBooked,
          bookedBy: newBooked ? userId : null,
          bookingInfo: newBooked ? {
            userId,
            username: userName,
            bookedAt: new Date().toISOString()
          } : null
        })
      });
      
      if (!response.ok) throw new Error('Failed to update booking');
      
      const updatedDoctor = await response.json();
      setDoctors(doctors.map(d => d._id === doctor._id ? updatedDoctor : d));
      
      if (newBooked) {
        setSelectedDoctor(updatedDoctor);
        alert('Therapist booked successfully!');
      } else {
        setSelectedDoctor(null);
        alert('Therapist unbooked successfully!');
      }
    } catch (err) {
      console.error('Error booking doctor:', err);
      alert('Failed to book/unbook doctor. Please try again.');
    }
  };

  // Add condition
  const handleAddCondition = async () => {
    if (!user.username || !condition) return;
    
    try {
      const treatment = `Treatment for ${condition}`;
      setSuggestedTreatment(treatment);
      setCurrentTherapy({ 
        username: user.username, 
        condition, 
        suggestedTreatment: treatment, 
        dateAdded: new Date().toLocaleString() 
      });
      
      // Save condition to backend
      const therapyData = {
        userId,
        username: user.username,
        condition,
        suggestedTreatment: treatment,
        doctorName: selectedDoctor?.name || 'Not assigned',
        sessionsRequired: Math.floor(Math.random() * 10) + 5,
        progress: 0,
        consistency: 'red'
      };

      const response = await fetch(`${BACKEND_URL}/api/therapy-tracker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(therapyData)
      });

      if (!response.ok) throw new Error('Failed to save condition');
      
      const savedTracker = await response.json();
      setTracker(savedTracker);
      
      if (selectedDoctor) {
        const response2 = await fetch(`${BACKEND_URL}/api/therapists/${selectedDoctor._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conditions: [...(selectedDoctor.conditions || []), {
              username: user.username,
              condition,
              suggestedTreatment: treatment,
              dateAdded: new Date()
            }]
          })
        });
        
        if (!response2.ok) throw new Error('Failed to add condition to doctor');
      }
      
      setConditionModalOpen(false);
      alert('Condition added successfully!');
    } catch (err) {
      console.error('Error adding condition:', err);
      alert('Failed to add condition. Please try again.');
    }
  };

  // Therapy tracker logic
  useEffect(() => {
    if (currentTherapy && selectedDoctor) {
      const sessionsRequired = Math.floor(Math.random() * 10) + 5;
      const newTracker = {
        username: user.username,
        doctorName: selectedDoctor.name,
        suggestedTreatment: currentTherapy.suggestedTreatment,
        sessionsRequired,
        progress: 0,
        consistency: 'red'
      };
      
      setTracker(newTracker);
      
      // Update the doctor with tracker info
      fetch(`${BACKEND_URL}/api/therapists/${selectedDoctor._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          therapyTracker: [...(selectedDoctor.therapyTracker || []), newTracker]
        })
      }).catch(err => console.error('Error updating tracker:', err));
    }
  }, [currentTherapy, selectedDoctor]);

  // Progress bar color
  const getProgressColor = (progress) => {
    if (progress < 33) return 'bg-red-500';
    if (progress < 66) return 'bg-orange-500';
    return 'bg-green-500';
  };

  // Responsive header (copied from Scheduler)
  const Header = () => (
    <nav className="flex items-center justify-between pt-6 px-6 mb-8">
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center w-10 h-10 transition-transform bg-gray-800 rounded-full cursor-pointer hover:scale-105" onClick={() => navigate('/platform')}>
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="flex items-center px-4 py-2 space-x-2 text-gray-800 transition-colors bg-gray-100 border border-gray-200 rounded-full cursor-pointer hover:bg-gray-800 hover:text-gray-100"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            onClick={() => navigate('/platform')}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
          <button
            className="flex items-center px-4 py-2 space-x-2 font-bold text-blue-700 bg-blue-100 border border-blue-200 rounded-full cursor-pointer"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            onClick={() => navigate('/platform/therapists')}
            disabled
          >
            <Users className="w-4 h-4" />
            <span>Therapists</span>
          </button>
          <button
            className="flex items-center px-4 py-2 space-x-2 text-gray-800 transition-colors bg-gray-100 border border-gray-200 rounded-full cursor-pointer hover:bg-gray-800 hover:text-gray-100"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            onClick={() => navigate('/platform/scheduler')}
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
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading therapists...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // UI
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-row gap-8 px-8 pb-12">
        {/* Left: Doctors & Add Condition */}
        <div className="w-1/2 flex flex-col gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><UserPlus /> Available Doctors</h2>
            {doctors.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No therapists available.</div>
            ) : (
              <ul className="space-y-4">
                {doctors.map(doc => (
                  <li key={doc._id} className="flex items-center justify-between p-4 bg-gray-100 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center text-xl font-bold text-blue-700 shadow">
                        {doc.name ? doc.name[0].toUpperCase() : '?'}
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{doc.name}</div>
                        <div className="text-xs text-green-600 font-semibold mb-1">
                          {doc.status === 'approved' ? 'Approved' : doc.status || 'Available'}
                        </div>
                        <div className="text-sm text-gray-500">{doc.specialty}</div>
                        {doc.bookedBy === userId && (
                          <div className="text-xs text-blue-600 mt-1">✓ Booked by you</div>
                        )}
                      </div>
                    </div>
                    <button
                      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${doc.bookedBy === userId ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'} cursor-pointer`}
                      onClick={() => handleBookDoctor(doc)}
                      style={{ cursor: 'pointer' }}
                    >
                      {doc.bookedBy === userId ? <UserCheck /> : <UserPlus />}
                      {doc.bookedBy === userId ? 'Unbook' : 'Book'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <button
              className="w-full py-3 rounded-lg font-semibold bg-purple-600 text-white flex items-center justify-center gap-2 mb-2 cursor-pointer"
              onClick={() => setConditionModalOpen(true)}
              style={{ cursor: 'pointer' }}
            >
              <PlusCircle /> Add Condition
            </button>
            {conditionModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setConditionModalOpen(false)}>
                <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative animate-fadeIn border border-gray-100 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                  <button type="button" className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl" onClick={() => setConditionModalOpen(false)} aria-label="Close"><UserX /></button>
                  <h2 className="text-xl font-bold mb-2 text-purple-700">Add Condition</h2>
                  <input type="text" placeholder="Username" className="border rounded-lg px-3 py-2" value={user.username} onChange={e => setUser(u => ({ ...u, username: e.target.value }))} />
                  <input type="text" placeholder="Condition" className="border rounded-lg px-3 py-2" value={condition} onChange={e => setCondition(e.target.value)} />
                  <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 font-semibold mt-2" onClick={handleAddCondition}>Suggest Treatment</button>
                  {suggestedTreatment && <div className="mt-2 text-green-600 font-semibold">Suggested: {suggestedTreatment}</div>}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Right: Current Therapy & Tracker */}
        <div className="w-1/2 flex flex-col gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ClipboardCheck /> Current Therapy</h2>
            {currentTherapy ? (
              <div className="p-4 bg-gray-100 rounded-xl">
                <div className="font-semibold text-lg">{currentTherapy.suggestedTreatment}</div>
                <div className="text-sm text-gray-500">Added: {currentTherapy.dateAdded}</div>
              </div>
            ) : <div className="text-gray-400">No therapy added yet.</div>}
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Activity /> Therapy Tracker</h2>
            {tracker ? (
              <div className="p-4 bg-gray-100 rounded-xl">
                <div className="font-semibold">Username: {tracker.username}</div>
                <div className="font-semibold">Doctor: {tracker.doctorName}</div>
                <div className="font-semibold">Treatment: {tracker.suggestedTreatment}</div>
                <div className="font-semibold">Sessions Required: {tracker.sessionsRequired}</div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-full h-4 bg-gray-300 rounded-full">
                    <div className={`h-4 rounded-full ${getProgressColor(tracker.progress)}`} style={{ width: `${tracker.progress}%` }}></div>
                  </div>
                  <span className="font-semibold text-xs">{tracker.progress}%</span>
                </div>
                <div className="mt-2 font-semibold text-xs text-gray-600">Consistency: <span className={`px-2 py-1 rounded ${tracker.consistency === 'red' ? 'bg-red-200 text-red-700' : tracker.consistency === 'orange' ? 'bg-orange-200 text-orange-700' : 'bg-green-200 text-green-700'}`}>{tracker.consistency}</span></div>
              </div>
            ) : <div className="text-gray-400">No tracker info yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Therapists;

import React, { useState, useEffect } from 'react';
import { UserPlus, UserCheck, UserX, PlusCircle, ClipboardCheck, Activity, CalendarDays, BarChart3 } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL;

const Therapists = () => {
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

  // Book/unbook doctor
  const handleBookDoctor = async (doctor) => {
    try {
      const booked = doctor.bookedBy === user.username ? null : user.username;
      const response = await fetch(`${BACKEND_URL}/api/therapists/${doctor._id}/book`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          booked: booked !== null,
          bookingInfo: booked ? {
            username: user.username,
            bookedAt: new Date().toISOString()
          } : null
        })
      });
      
      if (!response.ok) throw new Error('Failed to update booking');
      
      const updatedDoctor = await response.json();
      setDoctors(doctors.map(d => d._id === doctor._id ? updatedDoctor : d));
      
      if (booked) setSelectedDoctor(updatedDoctor);
      else setSelectedDoctor(null);
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
      
      if (selectedDoctor) {
        const response = await fetch(`${BACKEND_URL}/api/therapists/${selectedDoctor._id}`, {
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
        
        if (!response.ok) throw new Error('Failed to add condition');
      }
      
      setConditionModalOpen(false);
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
    <div className="min-h-screen bg-gray-50 flex flex-row gap-8 px-8 py-12">
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
                    </div>
                  </div>
                  <button
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${doc.bookedBy === user.username ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'} cursor-pointer`}
                    onClick={() => handleBookDoctor(doc)}
                    style={{ cursor: 'pointer' }}
                  >
                    {doc.bookedBy === user.username ? <UserCheck /> : <UserPlus />}
                    {doc.bookedBy === user.username ? 'Unbook' : 'Book'}
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
  );
};

export default Therapists;

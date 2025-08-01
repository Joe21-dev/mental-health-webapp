import React, { useState, useEffect } from 'react';
import { Home, Users, BookOpen, MessageCircle, Shield, Search, Brain, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const BACKEND_URL = import.meta.env.VITE_API_URL;

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

export default function Therapists() {
	const [showForm, setShowForm] = useState(false);
	const [showUserForm, setShowUserForm] = useState(false);
	const [form, setForm] = useState({ name: '', specialty: '' });
  const [doctors, setDoctors] = useState([]);
  // Track which doctor is currently booked by the user
  const [bookedDoctorId, setBookedDoctorId] = useState(null);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [conditionInput, setConditionInput] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [therapyTracker, setTherapyTracker] = useState(null);
	const [userCondition, setUserCondition] = useState('');
	const [recommendedTherapy, setRecommendedTherapy] = useState('');
	const [userId, setUserId] = useState(null);
	const navigate = useNavigate();

  useEffect(() => {
	setLoading(true);
	setError(null);
	fetch(`${BACKEND_URL}/api/therapists?seededOnly=true`)
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
  }, [userId, therapyTracker]);

  // Persist therapyTracker in sessionStorage
  useEffect(() => {
	const stored = sessionStorage.getItem('therapyTracker');
	if (stored) {
	  setTherapyTracker(JSON.parse(stored));
	}
  }, []);
  useEffect(() => {
	if (therapyTracker) {
	  sessionStorage.setItem('therapyTracker', JSON.stringify(therapyTracker));
	} else {
	  sessionStorage.removeItem('therapyTracker');
	}
  }, [therapyTracker]);

	useEffect(() => {
		fetch(`${BACKEND_URL}/api/therapy-tracker`)
			.then(res => res.json())
			.then(data => setTherapyTracker(data));
	}, []);

	// Info alert for user guidance
	  const [showInfo, setShowInfo] = useState(true);
	  useEffect(() => {
		if (showInfo) {
		  const timer = setTimeout(() => setShowInfo(false), 12000); // 12 seconds
		  return () => clearTimeout(timer);
		}
	  }, [showInfo]);
	

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

	function handleChange(e) {
		const { name, value } = e.target;
		setForm(f => ({ ...f, [name]: value }));
		if (name === 'condition') {
			setUserCondition(value);
			// Simple recommendation logic
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
			condition: userCondition,
			therapy: recommendedTherapy
		}),
	})
			.then(() => fetch(`${BACKEND_URL}/api/therapists`))
			.then(res => res.json())
			.then(data => setDoctors(data));
		setForm({ name: '', specialty: '' });
		setUserCondition('');
		setRecommendedTherapy('');
		setShowForm(false);
	}

  function handleBook(d) {
	if (!userId) return toast.error('You must be logged in to book a doctor');
	// Only allow booking if no other doctor is booked by this user or this doctor is already booked by this user
	if (!d.bookedBy && bookedDoctorId && bookedDoctorId !== d._id) return;
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
	  .then(() => fetch(`${BACKEND_URL}/api/therapists?seededOnly=true`))
	  .then(res => res.json())
	  .then(data => {
		setDoctors(data);
		// Update bookedDoctorId state
		if (newBooked) {
		  setBookedDoctorId(d._id);
		} else {
		  setBookedDoctorId(null);
		}
		if (newBooked) {
		  const trackerData = {
			user: 'User',
			doctor: { name: d.name, specialty: d.specialty },
			therapy: bookingInfo.therapy,
			condition: bookingInfo.condition,
			date: bookingInfo.date,
			description: bookingInfo.description,
			bookedAt: bookingInfo.bookedAt,
			streak: (therapyTracker?.streak || 0) + 1,
			longestStreak: Math.max((therapyTracker?.longestStreak || 0), (therapyTracker?.streak || 0) + 1)
		  };
		  setTherapyTracker(trackerData);
		  fetch(`${BACKEND_URL}/api/therapy-tracker`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(trackerData)
		  });
		} else {
		  setTherapyTracker(null);
		  fetch(`${BACKEND_URL}/api/therapy-tracker`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ user: 'User', doctor: null, therapy: '', condition: '', date: '', description: '', bookedAt: '', streak: 0, longestStreak: therapyTracker?.longestStreak || 0 })
		  });
		}
	  });
  }

  // Delete doctor handler
  async function handleDeleteDoctor(id) {
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
		sessionStorage.removeItem('therapyTracker');
	  }
	} catch (err) {
	  alert('Failed to delete doctor. Please try again.');
	}
  }

	const Desktop = () => (
  <div className='mb-6'>
	{/* Top Navigation */}
	<nav className="flex items-center justify-between">
	  <div className="flex items-center space-x-4">
		<div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/')}> {/* Home icon clickable */}
		  <Brain className="w-5 h-5 text-white" />
		</div>
		<div className="flex items-center space-x-2">
		  <button
			className={`bg-gray-800 text-gray-100 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:scale-105 transition-transform border border-gray-800${window.location.pathname === '/platform' ? ' ring-2 ring-blue-500' : ''}`}
			style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
			onClick={() => navigate('/platform')}
			disabled={window.location.pathname === '/platform'}
		  >
			<Home className="w-4 h-4" />
			<span>Home</span>
		  </button>
		  <button
			className={`px-4 py-2 text-blue-700 bg-blue-100 border border-blue-200 font-bold rounded-full flex items-center space-x-2 cursor-pointer hover:bg-gray-800 hover:text-gray-100 transition-colors${window.location.pathname === '/platform/therapists' ? ' ring-2 ring-blue-500' : ''}`}
			style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
			disabled={window.location.pathname === '/platform/therapists'}
		  >
			<Users className="w-4 h-4" />
			<span>Therapists</span>
		  </button>
		  <button
			className={`bg-gray-100 text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:bg-gray-800 hover:text-gray-100 transition-colors border border-gray-200${window.location.pathname === '/platform/scheduler' ? ' ring-2 ring-blue-500' : ''}`}
			style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
			onClick={() => navigate('/platform/scheduler')}
			disabled={window.location.pathname === '/platform/scheduler'}
		  >
			<BookOpen className="w-4 h-4" />
			<span>Scheduler</span>
		  </button>
		  <button
			className={`bg-gray-100 text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:bg-gray-800 hover:text-gray-100 transition-colors border border-gray-200${window.location.pathname === '/platform/chat' ? ' ring-2 ring-blue-500' : ''}`}
			style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
			onClick={() => navigate('/platform/chat')}
			disabled={window.location.pathname === '/platform/chat'}
		  >
			<MessageCircle className="w-4 h-4" />
			<span>Health-Chat.ai</span>
		  </button>
		  <button
			className={`bg-gray-100 text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:bg-gray-800 hover:text-gray-100 transition-colors border border-gray-200${window.location.pathname === '/platform/resources' ? ' ring-2 ring-blue-500' : ''}`}
			style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
			onClick={() => navigate('/platform/resources')}
			disabled={window.location.pathname === '/platform/resources'}
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
  </div>
	)

	return (
	<div className="min-h-screen bg-gray-100 pt-6 px-6 py-2">
	  <Desktop />
	  {/* Info alert */}
	  {showInfo && (
		<div className="mb-4 p-4 mx-6 bg-blue-50 border-l-4 border-blue-400 text-blue-700 rounded-lg shadow">
		  <p className="text-sm">
			Hello!!! Book a doctor easily by clicking the book button.Ensure you have added your condition. Thank You.
		  </p>
		</div>
	  )}
	  <div className="max-w-5xl mx-auto grid grid-cols-2 gap-12">
		{/* Left column: Doctors List and Modals (desktop only) */}
		<div>
	<div className="flex justify-between items-center mb-4">
	  <h2 className="font-bold text-xl">Doctors</h2>
	  <div className="flex gap-2">
		<button className="bg-purple-500 text-white px-4 py-2 rounded cursor-pointer" onClick={() => setShowConditionModal(true)}>
		  Add Condition
		</button>
	  </div>
	</div>
	  {showConditionModal && (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowConditionModal(false)}>
		  <form
			className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md space-y-5 relative animate-fadeIn border border-gray-100"
			onClick={e => e.stopPropagation()}
			onSubmit={e => {
			  e.preventDefault();
			  setUserCondition(conditionInput);
			  // Simple recommendation logic
			  if (conditionInput.toLowerCase().includes('anxiety')) setRecommendedTherapy('Cognitive Behavioral Therapy');
			  else if (conditionInput.toLowerCase().includes('depression')) setRecommendedTherapy('Behavioral Activation');
			  else if (conditionInput.toLowerCase().includes('stress')) setRecommendedTherapy('Mindfulness Therapy');
			  else setRecommendedTherapy('General Therapy');
			  setShowConditionModal(false);
			}}
		  >
			<button type="button" className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl" onClick={() => setShowConditionModal(false)} aria-label="Close">&times;</button>
			<h3 className="font-semibold text-lg mb-2">Add Condition</h3>
			<input name="condition" value={conditionInput} onChange={e => setConditionInput(e.target.value)} placeholder="Your condition (e.g. anxiety, stress)" className="border rounded px-3 py-2 w-full mb-2" />
			<div className="flex justify-end space-x-2 mt-2">
			  <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowConditionModal(false)}>
				Cancel
			  </button>
			  <button type="submit" className="px-4 py-2 rounded bg-blue-500 text-white">
				Save
			  </button>
			</div>
		  </form>
		</div>
	  )}
	  {loading ? (
			<div className="text-center text-gray-500 py-8">Loading doctors...</div>
		  ) : error ? (
			<div className="text-center text-red-500 py-8">{error}</div>
		  ) : (!doctors || doctors.length === 0) ? (
			<div className="text-gray-500">No doctors available.</div>
		  ) : (
			<ul className="space-y-4">
			  {doctors.map(d => (
			  <li key={d._id} className="bg-white rounded-xl p-4 flex items-center justify-between">
				<div className="flex items-center space-x-3">
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
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowForm(false)}>
			  <form
				className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md space-y-5 relative animate-fadeIn border border-gray-100"
				onClick={e => e.stopPropagation()}
				onSubmit={handleSubmit}
			  >
				<button type="button" className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl" onClick={() => setShowForm(false)} aria-label="Close">&times;</button>
				<h3 className="font-semibold text-lg mb-2">Add Doctor</h3>
				<input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="border rounded px-3 py-2 w-full mb-2" />
				<input name="specialty" value={form.specialty} onChange={handleChange} placeholder="Specialty" className="border rounded px-3 py-2 w-full mb-2" />
				<div className="flex justify-end space-x-2 mt-2">
				  <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowForm(false)}>
					Cancel
				  </button>
				  <button type="submit" className="px-4 py-2 rounded bg-blue-500 text-white">
					Add
				  </button>
				</div>
			  </form>
			</div>
		  )}
		</div>
		{/* Right column: Current Therapy + Therapy Tracker */}
		<div className="flex flex-col gap-8">
		  {/* Current Therapy Card */}
		  <div className="p-6 bg-purple-50 rounded-2xl shadow border border-purple-100 flex flex-col justify-between">
			<h3 className="font-bold text-purple-700 mb-2 flex items-center"><Brain className="w-5 h-5 mr-2 text-purple-500" /> Current Therapy</h3>
			<div className="mb-1 text-lg font-semibold text-gray-800">{therapyTracker?.therapy || recommendedTherapy || ''}</div>
			<div className="mb-1 text-sm text-gray-600">Specialty: {therapyTracker?.doctor?.specialty || ''}</div>
			<div className="mb-1 text-sm text-gray-600">Started: {therapyTracker?.date || ''}</div>
			<div className="mt-2 text-xs text-gray-400">Stay consistent for best results!</div>
		  </div>
		  {/* Therapy Tracker Card (from Dashboard.jsx) */}
		  <div className="p-6 bg-blue-50 rounded-2xl shadow border border-blue-100">
			<h3 className="font-bold text-blue-700 mb-2 flex items-center"><BookOpen className="w-5 h-5 mr-2 text-blue-500" /> Therapy Tracker</h3>
			<div className="mb-1">Doctor: {therapyTracker?.doctor?.name || ''}</div>
			<div className="mb-1">Description: {therapyTracker?.therapy || recommendedTherapy || ''}</div>
			<div className="mb-1">Streak: <span className="font-bold text-green-600">{therapyTracker?.streak || 0}</span> days</div>
			<div className="mb-1">Longest streak: <span className="font-bold text-blue-600">{therapyTracker?.longestStreak || 0}</span> days</div>
			<div className="text-xs text-gray-500">Booked at: {therapyTracker?.bookedAt ? new Date(therapyTracker.bookedAt).toLocaleString() : ''}</div>
		  </div>
		</div>
	  </div>
	</div>
  );
}

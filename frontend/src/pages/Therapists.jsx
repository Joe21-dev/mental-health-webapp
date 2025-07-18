import React, { useState } from 'react';
import { Home, Users, BookOpen, MessageCircle, Shield, Search, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Therapists({ therapists = [], setTherapists = () => {}, bookedTherapist = null, setBookedTherapist = () => {}, onBookOrUnbook, onAddTherapist }) {
	const [showForm, setShowForm] = useState(false);
	const [form, setForm] = useState({ name: '', specialty: '' });
	const [localLoading, setLocalLoading] = useState(false);
	const [localError, setLocalError] = useState(null);
	const navigate = useNavigate();

	function handleChange(e) {
		const { name, value } = e.target;
		setForm(f => ({ ...f, [name]: value }));
	}

	function handleSubmit(e) {
		e.preventDefault();
		if (!form.name.trim() || !form.specialty.trim()) return;
		if (typeof onAddTherapist === 'function') {
			onAddTherapist({
				name: form.name,
				specialty: form.specialty,
				status: 'pending',
				avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
			});
		}
		setForm({ name: '', specialty: '' });
		setShowForm(false);
	}

	function handleBook(t) {
		if (typeof onBookOrUnbook === 'function') {
			onBookOrUnbook(t);
		}
	}

	React.useEffect(() => {
		if (!therapists || therapists.length === 0) {
			setLocalLoading(true);
			setLocalError(null);
			fetch('http://localhost:5000/api/therapists')
				.then(res => {
					if (!res.ok) throw new Error('Failed to fetch therapists');
					return res.json();
				})
				.then(data => {
					setTherapists(data);
					setLocalLoading(false);
				})
				.catch(err => {
					setLocalError('Could not fetch doctors. Please check your connection or try again later.');
					setLocalLoading(false);
				});
		}
	}, [therapists, setTherapists]);

	return (
		<div className="min-h-screen bg-gray-100 p-6">
			{/* Top Navigation/Header - matches Dashboard */}
			<nav className="flex items-center justify-between mb-8">
				<div className="flex items-center space-x-4">
					<div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/platform')}>
						<Brain className="w-5 h-5 text-white" />
					</div>
					<div className="flex items-center space-x-2">
						<button
							className="bg-gray-800 text-gray-100 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:scale-105 transition-transform border border-gray-800"
							style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
							onClick={() => navigate('/platform')}
						>
							<Home className="w-4 h-4" />
							<span>Home</span>
						</button>
						<button
							className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full flex items-center space-x-2 font-bold border border-blue-200 cursor-default"
							style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
							disabled
						>
							<Users className="w-4 h-4" />
							<span>Therapists</span>
						</button>
						<button
							className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:bg-gray-800 hover:text-gray-100 transition-colors border border-gray-200"
							style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
							onClick={() => navigate('/platform/scheduler')}
						>
							<BookOpen className="w-4 h-4" />
							<span>Scheduler</span>
						</button>
						<button
							className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:bg-gray-800 hover:text-gray-100 transition-colors border border-gray-200"
							style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
							onClick={() => navigate('/platform/ai-doctor')}
						>
							<MessageCircle className="w-4 h-4" />
							<span>Health-Chat.ai</span>
						</button>
						<button
							className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:bg-gray-800 hover:text-gray-100 transition-colors border border-gray-200"
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
					<div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
						<span className="text-white font-medium">A</span>
					</div>
					<img 
						src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" 
						alt="Profile" 
						className="w-10 h-10 rounded-full"
					/>
				</div>
			</nav>
			<div className="max-w-2xl mx-auto">
				<div className="flex justify-between items-center mb-4">
					<h2 className="font-bold text-xl">Therapists</h2>
					<button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => setShowForm(true)}>
						Add Doctor
					</button>
				</div>
				{localLoading ? (
					<div className="text-center text-gray-500 py-8">Loading therapists...</div>
				) : localError ? (
					<div className="text-center text-red-500 py-8">{localError}</div>
				) : (!therapists || therapists.length === 0) ? (
					<div className="text-gray-500">No therapists available.</div>
				) : (
					<ul className="space-y-4">
						{therapists.filter(t => t && typeof t === 'object' && t.name).map(t => (
							<li key={t._id || t.id} className="bg-white rounded-xl p-4 flex items-center justify-between">
								<div className="flex items-center space-x-3">
									<img src={t.avatar || ''} alt={t.name || 'Doctor'} className="w-12 h-12 rounded-full" />
									<div>
										<div className="font-semibold">{t.name}</div>
										<div className="text-sm text-gray-600">{t.specialty || ''}</div>
										<div className="text-xs text-gray-400">{t.status || ''}</div>
									</div>
								</div>
								<button className={`px-3 py-1 rounded ${t.booked ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`} onClick={() => handleBook(t)}>
									{t.booked ? 'Unbook' : 'Book'}
								</button>
							</li>
						))}
					</ul>
				)}
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
		</div>
	);
}

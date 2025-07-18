import React, { useState, useEffect } from 'react';
import { Home, BarChart3, Calendar, Users, Shield, Brain, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TherapistsMobile({ bookedTherapist = null, setBookedTherapist = () => {}, onBookOrUnbook, onAddTherapist }) {
	const [showForm, setShowForm] = useState(false);
	const [form, setForm] = useState({ name: '', specialty: '' });
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [therapists, setTherapists] = useState([]);
	const [localLoading, setLocalLoading] = useState(false);
	const [localError, setLocalError] = useState(null);
	const [internalBookedTherapist, setInternalBookedTherapist] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
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
	}, []);

	const effectiveBookedTherapist = bookedTherapist !== undefined ? bookedTherapist : internalBookedTherapist;
	const effectiveSetBookedTherapist = setBookedTherapist !== undefined ? setBookedTherapist : setInternalBookedTherapist;

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
			// Optionally, re-fetch therapists after add
			setLocalLoading(true);
			fetch('http://localhost:5000/api/therapists')
				.then(res => res.json())
				.then(data => {
					setTherapists(data);
					setLocalLoading(false);
				});
		}
		setForm({ name: '', specialty: '' });
		setShowForm(false);
	}

	function handleBook(t) {
		if (typeof onBookOrUnbook === 'function') {
			onBookOrUnbook(t);
			// Optionally, re-fetch therapists after book/unbook
			setLocalLoading(true);
			fetch('http://localhost:5000/api/therapists')
				.then(res => res.json())
				.then(data => {
					setTherapists(data);
					setLocalLoading(false);
				});
		}
	}

	return (
		<div className="flex flex-col min-h-screen bg-gray-100">
			{/* Mobile Header/Navbar */}
			<header
				className={`sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm px-4 py-3 flex items-center justify-between`}
			>
				<button onClick={() => setMobileMenuOpen(true)}>
					<Menu className="w-6 h-6" />
				</button>
				<div className="flex items-center space-x-2">
					<div className="flex items-center justify-center w-8 h-8 bg-gray-800 rounded-full">
						<Brain className="w-4 h-4 text-white" />
					</div>
					<span className="font-semibold">Therapists</span>
				</div>
				<img
					src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"
					alt="Profile"
					className="w-8 h-8 rounded-full"
				/>
			</header>
			{/* Mobile Navigation Drawer */}
			{mobileMenuOpen && (
				<div
					className="fixed inset-0 z-50 bg-black/40"
					onClick={() => setMobileMenuOpen(false)}
				>
					<div
						className="w-64 h-full p-4 bg-white"
						onClick={e => e.stopPropagation()}
					>
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
								{ icon: BarChart3, label: 'Stats' },
								{ icon: Calendar, label: 'Schedule' },
								{ icon: Shield, label: 'Resources' },
							].map(({ icon: Icon, label }) => (
								<button
									key={label}
									className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 ${
										label === 'Therapists'
											? 'bg-blue-100 text-blue-700 font-bold'
											: ''
									}`}
									onClick={
										label === 'Home'
											? () => {
													setMobileMenuOpen(false);
													window.location.pathname = '/platform';
											  }
											: label === 'Therapists'
											? () => {
													setMobileMenuOpen(false);
											  }
											: undefined
									}
								>
									<Icon className="w-5 h-5" />
									<span>{label}</span>
								</button>
							))}
						</nav>
					</div>
				</div>
			)}
			{/* Main Content */}
			<div className="flex-1 p-4 space-y-4 overflow-y-auto">
				<div className="w-full max-w-md p-4 mx-auto">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-lg font-bold">Therapists</h2>
						<button className="px-3 py-1 text-white bg-blue-500 rounded" onClick={() => setShowForm(true)}>
							Add Doctor
						</button>
					</div>
					{localLoading ? (
						<div className="py-8 text-center text-gray-500">Loading therapists...</div>
					) : localError ? (
						<div className="py-8 text-center text-red-500">{localError}</div>
					) : (!therapists || therapists.length === 0) ? (
						<div className="text-gray-500">No therapists available.</div>
					) : (
						<ul className="space-y-4">
							{therapists.filter(t => t && typeof t === 'object' && t.name).map(t => (
								<li key={t._id || t.id} className="flex items-center justify-between p-4 bg-white rounded-xl">
									<div className="flex items-center space-x-3">
										<img src={t.avatar || ''} alt={t.name || 'Doctor'} className="w-10 h-10 rounded-full" />
										<div>
											<div className="font-semibold">{t.name}</div>
											<div className="text-sm text-gray-600">{t.specialty || ''}</div>
											<div className="text-xs text-gray-400">{t.status || ''}</div>
										</div>
									</div>
									<button className={`px-2 py-1 rounded ${t.booked ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`} onClick={() => handleBook(t)}>
										{t.booked ? 'Unbook' : 'Book'}
									</button>
								</li>
							))}
						</ul>
					)}
					{showForm && (
						<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowForm(false)}>
							<form
								className="relative w-full max-w-md p-8 space-y-5 bg-white border border-gray-100 shadow-xl rounded-2xl animate-fadeIn"
								onClick={e => e.stopPropagation()}
								onSubmit={handleSubmit}
							>
								<button type="button" className="absolute text-2xl text-gray-400 top-3 right-3 hover:text-black" onClick={() => setShowForm(false)} aria-label="Close">&times;</button>
								<h3 className="mb-2 text-lg font-semibold">Add Doctor</h3>
								<input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full px-3 py-2 mb-2 border rounded" />
								<input name="specialty" value={form.specialty} onChange={handleChange} placeholder="Specialty" className="w-full px-3 py-2 mb-2 border rounded" />
								<div className="flex justify-end mt-2 space-x-2">
									<button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowForm(false)}>
										Cancel
									</button>
									<button type="submit" className="px-4 py-2 text-white bg-blue-500 rounded">
										Add
									</button>
								</div>
							</form>
						</div>
					)}
				</div>
			</div>
			{/* Bottom Navigation */}
			<nav className="fixed bottom-0 left-0 right-0 z-50 px-4 py-2 bg-white border-t border-gray-200">
				<div className="flex justify-around">
					{[
						{ icon: Home, label: 'Home', path: '/platform' },
						{ icon: BarChart3, label: 'Stats', path: '/platform/stats' },
						{ icon: Calendar, label: 'Schedule', path: '/platform/scheduler' },
						{ icon: Users, label: 'Therapists', path: '/platform/therapists' },
						{ icon: Shield, label: 'Resources', path: '/platform/resources' }
					].map(({ icon: Icon, label, path }) => {
						const isActive = window.location.pathname === path;
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
}

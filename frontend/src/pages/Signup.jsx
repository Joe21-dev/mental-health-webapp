import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, Brain } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (!showLogin) {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setLoginData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Signup handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    // Password validation removed: allow any password
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        const text = await res.text();
        throw new Error(text.startsWith('<!DOCTYPE') ? 'API endpoint not found or backend error.' : text);
      }
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      // Store user info and token in localStorage for session persistence
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      setSuccess(data.message || 'Signup successful! You can now log in.');
      setFormData({ name: '', email: '', password: '' });
      setShowLogin(true);
      setLoading(false);
    } catch (err) {
      if (err.message && err.message.includes('NetworkError')) {
        setError('Network error: Unable to reach the server.');
      } else {
        setError(err.message || 'Network error');
      }
      setLoading(false);
    }
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginData.email, password: loginData.password })
      });
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        const text = await res.text();
        throw new Error(text.startsWith('<!DOCTYPE') ? 'API endpoint not found or backend error.' : text);
      }
      if (!res.ok) throw new Error(data.error || 'Login failed');
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      setSuccess(data.message || 'Login successful!');
      setLoginData({ email: '', password: '' });
      setLoading(false);
      navigate('/platform');
    } catch (err) {
      if (err.message && err.message.includes('NetworkError')) {
        setError('Network error: Unable to reach the server.');
      } else {
        setError(err.message || 'Network error');
      }
      setLoading(false);
    }
  };

  // No password requirements: allow any password
  const isPasswordValid = true;
  const hasSpecialChar = true;

  return (
    <div className="flex min-h-screen overflow-hidden bg-gray-50">
      {/* Right side - Form only, no avatar dropdown */}
      <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 py-8 lg:w-full sm:py-12 sm:px-6 lg:p-8">
        {/* Auth Form Switcher and Forms */}
        <div className="relative flex flex-col items-center justify-center w-full max-w-md mx-auto">
          {/* X Icon to close and go home */}
          <button
            className="absolute z-20 text-gray-400 cursor-pointer top-2 right-2 hover:text-gray-700"
            onClick={() => window.location.href = '/' }
            aria-label="Close"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          {/* Auth Form Switcher */}
          <div className="w-full space-y-4 sm:space-y-6">
            <div className="flex justify-center mb-6">
              <button
                className={`px-4 py-2 font-semibold rounded-l-lg focus:outline-none transition-colors ${!showLogin ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'} cursor-pointer`}
                onClick={() => setShowLogin(false)}
                type="button"
              >
                Sign Up
              </button>
              <button
                className={`px-4 py-2 font-semibold rounded-r-lg focus:outline-none transition-colors ${showLogin ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'} cursor-pointer`}
                onClick={() => setShowLogin(true)}
                type="button"
              >
                Login
              </button>
            </div>
            {/* Show error/success messages */}
            {error && <div className="w-full px-3 py-2 mb-2 text-sm text-red-600 bg-red-100 rounded">{error}</div>}
            {success && <div className="w-full px-3 py-2 mb-2 text-sm text-green-700 bg-green-100 rounded">{success}</div>}
            {/* Show Signup or Login Form */}
            {!showLogin ? (
              <form onSubmit={handleSubmit} className="w-full space-y-4 sm:space-y-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="signup-name" className="block mb-2 text-sm font-medium text-gray-700 cursor-pointer">
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="text"
                      id="signup-name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      className="w-full py-3 pl-10 pr-4 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                {/* Email Field */}
                <div>
                  <label htmlFor="signup-email" className="block mb-2 text-sm font-medium text-gray-700 cursor-pointer">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="email"
                      id="signup-email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className="w-full py-3 pl-10 pr-4 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                {/* Password Field */}
                <div>
                  <label htmlFor="signup-password" className="block mb-2 text-sm font-medium text-gray-700 cursor-pointer">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="signup-password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a password"
                      className="w-full py-3 pl-10 pr-12 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute text-gray-400 transform -translate-y-1/2 cursor-pointer right-3 top-1/2 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                {/* Password Requirements removed: allow any password */}
                </div>
                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full px-4 py-3 font-medium text-center text-white transition-colors bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
                  style={{ textAlign: 'center' }}
                  disabled={loading}
                >
                  {loading ? 'Signing up...' : 'Get started'}
                </button>
                {/* Social Login (Google only) */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    className="flex items-center justify-center flex-1 px-4 py-3 transition-colors border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </button>
                </div>
              </form>
            ) : (
              <form className="w-full space-y-4 sm:space-y-6" onSubmit={handleLogin}>
                <div>
                  <label htmlFor="login-email" className="block mb-2 text-sm font-medium text-gray-700 cursor-pointer">Email</label>
                  <input
                    type="email"
                    id="login-email"
                    name="email"
                    value={loginData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="login-password" className="block mb-2 text-sm font-medium text-gray-700 cursor-pointer">Password</label>
                  <input
                    type="password"
                    id="login-password"
                    name="password"
                    value={loginData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-3 font-medium text-center text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
                  style={{ textAlign: 'center' }}
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
                {/* Social Login (Google only) */}
                <div className="flex mt-2 space-x-3">
                  <button
                    type="button"
                    className="flex items-center justify-center flex-1 px-4 py-3 transition-colors border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
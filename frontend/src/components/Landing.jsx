import React, { useState, useEffect } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'About us', path: '#' },
  { name: 'Platform', path: '/platform' },
  { name: 'AI Doctor', path: '/ai-doctor' }, // updated path
  { name: 'Resources', path: '#' }
];

// Animation keyframes injected into the document
const Animations = () => (
  <style>{`
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-fadeIn { opacity: 0; animation: fadeIn 0.8s forwards; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
    .animate-slideUp { opacity: 0; transform: translateY(32px); animation: slideUp 0.8s forwards; }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .animate-scaleIn { opacity: 0; transform: scale(0.95); animation: scaleIn 0.7s forwards; }
  `}</style>
);

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [healthData, setHealthData] = useState([]);

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

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Animations />
      {/* Navigation */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm' : 'bg-transparent'} animate-fadeIn`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8"> {/* px-2 for extra small screens */}
          <div className="flex justify-between items-center h-16 animate-slideUp">
            {/* Logo */}
            <div className="flex items-center animate-scaleIn">
              <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.pathname = '/'}>
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  {/* Replace white dot with Brain icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 7a5 5 0 0 0-10 0v10a5 5 0 0 0 10 0V7z" /><path d="M12 2v20" /></svg>
                </div>
                <span className="text-xl font-semibold text-gray-900">Siha.</span>
              </div>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8 animate-slideUp">
              {navItems.map((item, i) => (
                item.path === '#' ? (
                  <a
                    key={item.name}
                    href="#"
                    className={`text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors animate-fadeIn`}
                    style={{ animationDelay: `${0.1 + i * 0.07}s` }}
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors animate-fadeIn`}
                    style={{ animationDelay: `${0.1 + i * 0.07}s` }}
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </div>
            {/* Login Button */}
            <div className="hidden md:flex items-center animate-scaleIn">
              <Link to="/signup" className="px-5 py-2 bg-black text-white rounded-full font-semibold shadow-md hover:bg-gray-800 transition-colors text-center" style={{textAlign: 'center', minWidth: '110px'}}>
                Sign Up
              </Link>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden animate-scaleIn">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-700 hover:text-gray-900"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white backdrop-blur-lg border-b border-gray-200 shadow-lg animate-fadeIn">
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item, i) => (
                item.path === '#' ? (
                  <a
                    key={item.name}
                    href="#"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-white/80 rounded-md animate-fadeIn"
                    style={{ animationDelay: `${0.1 + i * 0.07}s` }}
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-white/80 rounded-md animate-fadeIn"
                    style={{ animationDelay: `${0.1 + i * 0.07}s` }}
                  >
                    {item.name}
                  </Link>
                )
              ))}
              <Link to="/signup" className="w-full block px-3 py-2 bg-black text-white rounded-full font-semibold shadow-md hover:bg-gray-800 transition-colors mt-2 animate-scaleIn text-center">
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </nav>
      {/* Main Content */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-2 pt-0.5 sm:px-4 lg:px-8"> {/* px-2 for extra small screens */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center min-h-[80vh]">
            {/* Left Content */}
            <div className="pt-10 pb-8 lg:pt-24 lg:pb-16 animate-slideUp">
              <div className="max-w-full w-full">
                <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight animate-fadeIn break-words" style={{ wordBreak: 'break-word' }}>
                  Technologically<br />
                  <span className="font-medium">driven Mental Health</span><br />
                  <span className="font-medium">Solution with AI</span>
                </h1>
                <p className="mt-4 text-base xs:text-lg text-gray-600 max-w-full animate-slideUp break-words" style={{ wordBreak: 'break-word' }}>
                  Enhance your mental health journey with our platform, reducing the need for multiple point solutions
                </p>
                {/* CTA Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 animate-fadeIn w-full">
                  <Link to="/signup" className="bg-black text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-lg scale-100 hover:scale-105 active:scale-95 duration-300 animate-scaleIn w-full sm:w-auto text-sm xs:text-base text-center" style={{textAlign: 'center'}}>
                    Sign Up
                  </Link>
                  <div className="flex items-center space-x-2 animate-fadeIn">
                    <span className="text-xs xs:text-sm text-gray-600">Brought to you by</span>
                    <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs xs:text-sm font-medium shadow-md">
                      21-dev
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Right Content - Image */}
            <div className="relative hidden lg:block lg:-mt-16 animate-slideUp">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="AI Mental Health Solution"
                  className="w-full h-auto rounded-2xl shadow-2xl animate-fadeIn"
                  style={{ maxWidth: '100%' }}
                />
                {/* Overlay gradient for more artistic effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl animate-fadeIn"></div>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom Right Section */}
        <div className="absolute bottom-4 right-2 xs:right-4 hidden lg:block animate-fadeIn">
          <div className="text-right">
            <p className="text-xs xs:text-sm text-gray-600 mb-2">Towards a New</p>
            <p className="text-base xs:text-lg font-semibold text-gray-900 mb-4">Holistic Healthstyle</p>
            <button className="inline-flex items-center text-xs xs:text-sm text-gray-700 hover:text-gray-900 transition-colors animate-slideUp">
              Explore Pillars
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Mobile Bottom Section */}
        <div className="lg:hidden px-2 pb-16 flex justify-end animate-fadeIn w-full">
          <div className="text-right pr-1 xs:pr-2 w-full">
            <p className="text-xs xs:text-sm text-gray-600 mb-2">Towards a New</p>
            <p className="text-base xs:text-lg font-semibold text-gray-900 mb-4">Holistic Healthstyle</p>
            <button className="inline-flex items-center text-xs xs:text-sm text-gray-700 hover:text-gray-900 transition-colors animate-slideUp">
              Explore Pillars
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Example health data display */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2">Health Records</h2>
          <ul>
            {healthData.map(record => (
              <li key={record._id} className="mb-2 text-sm text-gray-700">
                {record.type}: {JSON.stringify(record.value)} ({new Date(record.date).toLocaleDateString()})
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Landing;
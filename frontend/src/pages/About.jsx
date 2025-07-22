import React, { useState, useEffect } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';

const navItems = [
  { name: 'Home', path: '/platform' },
  { name: 'About us', path: '/about' },
  { name: 'Platform', path: '/platform' },
];

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

const About = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Animations />
      {/* Navigation - same as Landing */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm' : 'bg-transparent'} animate-fadeIn`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16 animate-slideUp">
            {/* Logo */}
            <div className="flex items-center animate-scaleIn">
              <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.pathname = '/'}>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900">BHai.</span>
              </div>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8 animate-slideUp">
              {navItems.map((item, i) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors animate-fadeIn`}
                  style={{ animationDelay: `${0.1 + i * 0.07}s` }}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            {/* Login Button */}
            <div className="hidden md:flex items-center animate-scaleIn">
              <button className="px-5 py-2 bg-gradient-to-r from-black to-gray-500 hover:from-gray-500 hover:to-black text-white rounded-full font-semibold shadow-md transition-colors cursor-pointer"
                onClick={() => window.location.pathname = '/signup'}>
                Sign Up
              </button>
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
                <Link
                  key={item.name}
                  to={item.path}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-white/80 rounded-md animate-fadeIn"
                  style={{ animationDelay: `${0.1 + i * 0.07}s` }}
                >
                  {item.name}
                </Link>
              ))}
              <button className="w-full px-3 py-2 bg-gradient-to-r from-black to-gray-500 text-white rounded-full font-semibold shadow-md hover:from-gray-500 hover:to-black transition-colors mt-2 animate-scaleIn cursor-pointer"
                onClick={() => window.location.pathname = '/signup'}>
                Sign Up
              </button>
            </div>
          </div>
        )}
      </nav>
      {/* Main Content */}
      <main className="relative">
        <div className="max-w-6xl lg:max-w-16xl mx-auto px-2 pt-2 pb-16 sm:px-4 lg:px-4 animate-fadeIn">
          <div className="p-2 sm:p-6 flex flex-col items-center text-center animate-slideUp">
            {/* Centered heading, removed background image and text below */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 animate-fadeIn" style={{textAlign: 'center'}}>About</h1>
            <p className="text-base sm:text-lg text-gray-700 mb-0 animate-fadeIn" style={{ lineHeight: '1.7', textAlign: 'center' }}>
              At Brain Health AI, we believe that mental well-being should be accessible, personal, and proactive. Our platform is designed to support you on your journey to better mental health by offering a safe, intelligent space to reflect, grow, and connect. Whether you're navigating everyday stress, seeking professional guidance, or simply looking to build healthier habits, Brain Health AI empowers you to take meaningful steps toward emotional balance and resilience.
            </p>
          </div>
        </div>
        {/* Contact Details - bottom right */}
        <div className="bottom-2 right-2 animate-fadeIn">
          <div className="p-4 pr-6 lg:px-20 text-left min-w-[120px]">
            <h2 className="text-base font-semibold text-blue-700 mb-2">Contact Us</h2>
            <p className="text-sm text-gray-700">Email: <a href="mailto:contact@brainhealthai.com" className="text-blue-600 hover:underline">contact@brainhealthai.com</a></p>
            <p className="text-sm text-gray-700">Phone: <a href="tel:+1234567890" className="text-blue-600 hover:underline">+254 724 567 890</a></p>
            <p className="text-sm text-gray-700">Location: Moi Ave, Nairobi</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;

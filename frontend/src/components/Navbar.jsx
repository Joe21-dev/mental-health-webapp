import React, { useState, useEffect } from 'react';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`w-full flex items-center justify-between px-8 md:px-16 py-5 sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-white shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="text-2xl font-bold text-gray-900 tracking-tight">Solomaze.</div>
      {/* Desktop Links */}
      <ul className="hidden md:flex gap-10 text-base text-gray-700 font-medium items-center">
        <li className="font-semibold text-black cursor-pointer">Home</li>
        <li className="cursor-pointer hover:text-primary transition">About us</li>
        <li className="cursor-pointer hover:text-primary transition">Platform</li>
        <li className="cursor-pointer hover:text-primary transition">Pricing</li>
        <li className="cursor-pointer hover:text-primary transition">Resources</li>
        <li className="cursor-pointer hover:text-primary transition">Web3.0</li>
      </ul>
      {/* Modern Login Button */}
      <button className="hidden md:inline-block bg-black text-white px-6 py-2 rounded-full shadow-md hover:bg-gray-900 transition font-semibold text-base">
        Login
      </button>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden flex items-center justify-center p-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-300"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {/* Hamburger SVG */}
        <svg className="w-7 h-7 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {menuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
          )}
        </svg>
      </button>
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-lg flex flex-col items-center pt-8 pb-6 px-6 gap-6 md:hidden z-40">
          <ul className="flex flex-col gap-6 text-lg text-gray-800 font-medium items-center">
            <li className="font-semibold text-black cursor-pointer">Home</li>
            <li className="cursor-pointer hover:text-primary transition">About us</li>
            <li className="cursor-pointer hover:text-primary transition">Platform</li>
            <li className="cursor-pointer hover:text-primary transition">Pricing</li>
            <li className="cursor-pointer hover:text-primary transition">Resources</li>
            <li className="cursor-pointer hover:text-primary transition">Web3.0</li>
          </ul>
          <button className="bg-black text-white px-6 py-2 rounded-full shadow-md hover:bg-gray-900 transition font-semibold text-base w-4/5">
            Login
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
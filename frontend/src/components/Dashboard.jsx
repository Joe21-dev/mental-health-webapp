import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  BookOpen, 
  BarChart3, 
  Music, 
  Moon, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  ExternalLink,
  Phone,
  Calendar,
  TrendingUp,
  Brain,
  Heart,
  Shield,
  MessageCircle,
  Menu,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [healthData, setHealthData] = useState([]);
  const navigate = useNavigate();

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

  // Desktop Component
  const DesktopDashboard = () => (
    <div className="min-h-screen bg-gray-100 p-6 hidden lg:block">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/')}> {/* Home icon clickable */}
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="bg-gray-800 text-gray-100 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:scale-105 transition-transform border border-gray-800"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              onClick={() => navigate('/')}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:bg-gray-800 hover:text-gray-100 transition-colors border border-gray-200"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <Users className="w-4 h-4" />
              <span>Therapists</span>
            </button>
            <button
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:bg-gray-800 hover:text-gray-100 transition-colors border border-gray-200"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <BookOpen className="w-4 h-4" />
              <span>Courses</span>
            </button>
            <button
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:bg-gray-800 hover:text-gray-100 transition-colors border border-gray-200"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Statistics</span>
            </button>
            <button
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:bg-gray-800 hover:text-gray-100 transition-colors border border-gray-200"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <Music className="w-4 h-4" />
              <span>Music</span>
            </button>
            <button
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:bg-gray-800 hover:text-gray-100 transition-colors border border-gray-200"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <Moon className="w-4 h-4" />
              <span>Sleep tracker</span>
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

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="col-span-3 space-y-6">
          {/* Music Player */}
          <div className="bg-white rounded-3xl p-6">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=200&h=200&fit=crop" 
                alt="Album Cover" 
                className="w-full h-48 object-cover rounded-2xl"
              />
              <div className="absolute bottom-4 left-4 text-white">
                <div className="text-sm">2:46</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <h3 className="font-semibold text-gray-900">Dewdrop Echoes</h3>
              <p className="text-sm text-gray-600">Evergreen Sounds</p>
            </div>
            <div className="mt-4 flex items-center justify-center space-x-4">
              <button className="p-2 rounded-full bg-gray-100">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full bg-gray-100">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="p-4 rounded-full bg-blue-500 text-white">
                <div className="w-0 h-0 border-l-[8px] border-l-white border-y-[6px] border-y-transparent ml-1"></div>
              </button>
              <button className="p-2 rounded-full bg-gray-100">
                <ChevronRight className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full bg-gray-100">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <ChevronLeft className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold">March 25'</h3>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
              <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {[...Array(31)].map((_, i) => (
                <div key={i} className={`p-1 ${i === 24 ? 'bg-gray-800 text-white rounded-full' : 'text-gray-700'}`}>
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column */}
        <div className="col-span-6 space-y-6">
          {/* Pills Schedule */}
          <div className="bg-white rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Pills schedule</h3>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Levothyroxine</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Sertraline</span>
              </div>
            </div>
            <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm inline-block mb-4">
              Vitamin D3 - 1000 IU
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>9:00</span><span>11:00</span><span>13:00</span><span>15:00</span><span>17:00</span><span>19:00</span><span>21:00</span>
            </div>
          </div>

          {/* Sleep Level & Meditation */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Moon className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">Sleep level</h3>
              </div>
              <div className="h-32 bg-gray-50 rounded-2xl flex items-end justify-center p-4">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className={`w-2 mx-1 bg-blue-${i % 3 === 0 ? '500' : '300'} rounded-t`} style={{height: `${Math.random() * 80 + 20}%`}}></div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">8h</div>
                  <div className="text-sm text-gray-500">Average sleep duration in March</div>
                </div>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold">Meditation</h3>
              </div>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {[...Array(28)].map((_, i) => (
                  <div key={i} className={`w-6 h-6 rounded-full ${i % 3 === 0 ? 'bg-orange-500' : 'bg-orange-200'}`}></div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">16</div>
                  <div className="text-sm text-gray-500">Days meditated in March</div>
                </div>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Therapy Tracker */}
          <div className="bg-white rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Therapy tracker</h3>
              <select className="text-sm border border-gray-200 rounded-lg px-3 py-1">
                <option>6 months</option>
              </select>
            </div>
            <div className="grid grid-cols-6 gap-4 mb-4">
              {['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map((month, i) => (
                <div key={month} className="text-center">
                  <div className="text-xs text-gray-500 mb-2">{month}</div>
                  <div className={`h-16 rounded-lg ${i % 2 === 0 ? 'bg-red-100' : 'bg-blue-100'} flex items-center justify-center`}>
                    <span className="text-lg font-bold">{[7, 4, 6, 10, 2, 12][i]}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">50%</div>
              <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
                Avg 3 sessions / week
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-3 space-y-6">
          {/* Plans */}
          <div className="bg-white rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Plans</h3>
              <Plus className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Sleep</span>
                  <button className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="font-semibold text-sm">Insomnia recovery</h4>
                <p className="text-xs text-gray-600">Cognitive and behavioral techniques to manage insomnia.</p>
              </div>
              <div className="bg-orange-50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs">Meditation</span>
                  <button className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="font-semibold text-sm">Anxiety relief</h4>
                <p className="text-xs text-gray-600">Meditations focused on calming the nervous system.</p>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs">Studying</span>
                  <button className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Doctor */}
          <div className="bg-white rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-pink-500 text-white px-2 py-1 rounded text-xs">Therapy</span>
              <div className="flex space-x-2">
                <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="font-semibold mb-2">Contact doctor</h3>
            <p className="text-sm text-gray-600 mb-4">Dr. Jan is online - message or book your session</p>
            <div className="flex items-center space-x-3">
              <img 
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=60&h=60&fit=crop&crop=face" 
                alt="Doctor" 
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm inline-block">
                  Exp 10y
                </div>
              </div>
            </div>
          </div>
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
    </div>
  );

  // Mobile Component
  const MobileDashboard = () => (
    <div className="min-h-screen bg-gray-100 lg:hidden flex flex-col">
      {/* Mobile Header */}
      <header className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm' : 'bg-transparent'} px-4 py-3 flex items-center justify-between`}>
        <button onClick={() => setMobileMenuOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold">Dashboard</span>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" 
          alt="Profile" 
          className="w-8 h-8 rounded-full"
        />
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-white w-64 h-full p-4" onClick={e => e.stopPropagation()}>
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
                { icon: BookOpen, label: 'Courses' },
                { icon: BarChart3, label: 'Statistics' },
                { icon: Music, label: 'Music' },
                { icon: Moon, label: 'Sleep tracker' }
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100"
                  onClick={label === 'Home' ? () => { setMobileMenuOpen(false); navigate('/'); } : undefined}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Content */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-24 p-4 space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-500 text-white rounded-2xl p-4">
            <Moon className="w-8 h-8 mb-2" />
            <h3 className="font-semibold">Sleep</h3>
            <p className="text-sm opacity-90">8h avg</p>
          </div>
          <div className="bg-orange-500 text-white rounded-2xl p-4">
            <Heart className="w-8 h-8 mb-2" />
            <h3 className="font-semibold">Meditation</h3>
            <p className="text-sm opacity-90">16 days</p>
          </div>
        </div>

        {/* Pills Schedule */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-semibold mb-3">Today's Pills</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Levothyroxine</span>
              </div>
              <span className="text-xs text-gray-500">9:00 AM</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Sertraline</span>
              </div>
              <span className="text-xs text-gray-500">7:00 PM</span>
            </div>
          </div>
        </div>

        {/* Current Playing */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-semibold mb-3">Now Playing</h3>
          <div className="flex items-center space-x-3">
            <img 
              src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=60&h=60&fit=crop" 
              alt="Album" 
              className="w-15 h-15 rounded-lg"
            />
            <div className="flex-1">
              <h4 className="font-medium">Dewdrop Echoes</h4>
              <p className="text-sm text-gray-600">Evergreen Sounds</p>
            </div>
            <button className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center">
              <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-1"></div>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Active Plans</h3>
            <Plus className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Sleep</span>
                  <h4 className="font-semibold text-sm mt-1">Insomnia recovery</h4>
                </div>
                <ChevronRight className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div className="bg-orange-50 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs">Meditation</span>
                  <h4 className="font-semibold text-sm mt-1">Anxiety relief</h4>
                </div>
                <ChevronRight className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Doctor */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="bg-pink-500 text-white px-2 py-1 rounded text-xs">Therapy</span>
            <div className="flex space-x-2">
              <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </button>
            </div>
          </div>
          <h3 className="font-semibold mb-2">Dr. Jan is online</h3>
          <div className="flex items-center space-x-3">
            <img 
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=48&h=48&fit=crop&crop=face" 
              alt="Doctor" 
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Message or book session</p>
              <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs">10y exp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="flex justify-around">
          {[
            { icon: Home, label: 'Home' },
            { icon: BarChart3, label: 'Stats' },
            { icon: Calendar, label: 'Schedule' },
            { icon: Users, label: 'Therapy' },
            { icon: Music, label: 'Music' }
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex flex-col items-center py-2 px-3 cursor-pointer rounded-lg transition-colors duration-200 hover:bg-gray-100"
              onClick={label === 'Home' ? () => navigate('/') : undefined}
            >
              <Icon className="w-5 h-5 text-gray-600" />
              <span className="text-xs text-gray-600 mt-1">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );

  return (
    <div>
      <DesktopDashboard />
      <MobileDashboard />
    </div>
  );
};

export default Dashboard;
import React, { useState } from 'react';
import { 
  Home, 
  Search, 
  Clock, 
  Video, 
  User, 
  Play, 
  SkipBack, 
  SkipForward, 
  Volume2,
  CheckCircle,
  Plus,
  TrendingUp,
  DollarSign,
  Users,
  Mic,
  Image,
  X
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isPlaying, setIsPlaying] = useState(false);

  const sidebarItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'history', icon: Clock, label: 'History' },
    { id: 'video', icon: Video, label: 'Video' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const subscribers = [
    { name: 'Crafts Corner', count: '823K subscribers', avatar: '🎨' },
    { name: 'Zone Explorers', count: '76K subscribers', avatar: '🗺️' },
  ];

  const VideoPlayer = () => (
    <div className="relative p-6 overflow-hidden text-white bg-black rounded-3xl">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-300 to-orange-200 opacity-70"></div>
      <div className="relative z-10">
        <h3 className="mb-8 text-lg font-semibold">Unveiling Masterpieces: A Journey Through Creative Artistry</h3>
        
        <div className="flex items-center justify-center mb-8 space-x-6">
          <button className="p-2 transition-colors rounded-full hover:bg-white/20">
            <SkipBack size={24} />
          </button>
          <button 
            className="p-4 text-black transition-colors bg-white rounded-full hover:bg-gray-100"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            <Play size={24} />
          </button>
          <button className="p-2 transition-colors rounded-full hover:bg-white/20">
            <SkipForward size={24} />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm">08:30</span>
          <div className="flex-1 h-1 rounded-full bg-white/30">
            <div className="w-1/3 h-1 bg-white rounded-full"></div>
          </div>
          <span className="text-sm">20:00</span>
          <Volume2 size={18} />
        </div>
      </div>
    </div>
  );

  const ProfileCard = () => (
    <div className="p-6 bg-white shadow-lg rounded-3xl">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium">Profile</span>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <span className="text-gray-400">•••</span>
        </button>
      </div>
      
      <div className="flex items-center mb-4 space-x-4">
        <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full">
          <span className="font-semibold text-white">AC</span>
        </div>
        <div>
          <h4 className="font-semibold">Arthur Curtis</h4>
          <p className="text-sm text-gray-500">@AvenueArt86</p>
        </div>
        <div className="flex items-center justify-center w-6 h-6 ml-auto bg-blue-500 rounded-full">
          <CheckCircle size={16} className="text-white" />
        </div>
      </div>

      <div className="flex space-x-8">
        <div className="text-center">
          <div className="text-2xl font-bold">128,7K</div>
          <div className="text-sm text-gray-500">Subscribers</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">213</div>
          <div className="text-sm text-gray-500">Videos</div>
        </div>
      </div>
    </div>
  );

  const ArtCard = () => (
    <div className="relative p-6 overflow-hidden text-white bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl">
      <div className="absolute top-4 right-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
          <Play size={16} />
        </div>
      </div>
      
      <div className="mt-12">
        <h3 className="mb-1 text-lg font-semibold">Art Mastery</h3>
        <p className="text-sm opacity-90">Journey</p>
      </div>
    </div>
  );

  const TransactionCard = () => (
    <div className="p-6 bg-white shadow-lg rounded-3xl">
      <div className="flex items-center mb-4 space-x-3">
        <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
          <CheckCircle size={16} className="text-white" />
        </div>
        <span className="font-semibold">Thank you!</span>
      </div>
      
      <p className="mb-6 text-sm text-gray-600">Your transaction was successful</p>
      
      <div className="pt-4 border-t border-gray-200 border-dashed">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">TRANSACTION ID</span>
          <span className="text-sm text-gray-500">AMOUNT</span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-sm">021008007777</span>
          <span className="font-bold">$25.00</span>
        </div>
        
        <div className="mb-4 text-sm text-gray-500">
          <div>DATE & TIME</div>
          <div>17 Sep 2020 • 11:28 am</div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-red-500 rounded-lg">
            <span className="text-xs font-bold text-white">M</span>
          </div>
          <div>
            <div className="text-sm font-semibold">Madelyn Korsgaard</div>
            <div className="text-xs text-gray-500">•••• 0025</div>
          </div>
        </div>
      </div>
    </div>
  );

  const StatsCard = () => (
    <div className="p-6 bg-white shadow-lg rounded-3xl">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium">Stats</span>
        <select className="text-sm bg-transparent border-none">
          <option>Week</option>
          <option>Month</option>
          <option>Year</option>
        </select>
      </div>
      
      <div className="mb-2 text-4xl font-bold">+35%</div>
      
      <div className="relative h-24 mb-4">
        <svg className="w-full h-full" viewBox="0 0 200 80">
          <path 
            d="M10,60 Q50,40 100,50 T190,20" 
            fill="none" 
            stroke="#3B82F6" 
            strokeWidth="3"
          />
          <circle cx="100" cy="50" r="4" fill="#3B82F6" />
          <circle cx="100" cy="50" r="8" fill="#3B82F6" opacity="0.3" />
        </svg>
        
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400">
          <span>Mon</span>
          <span>Tue</span>
          <span className="font-semibold text-blue-600">Wed</span>
          <span>Thu</span>
          <span>Fri</span>
        </div>
      </div>
    </div>
  );

  const RevenueCard = () => (
    <div className="p-6 bg-white shadow-lg rounded-3xl">
      <div className="flex items-center justify-center w-12 h-12 mb-4 bg-red-100 rounded-full">
        <DollarSign className="text-red-500" size={24} />
      </div>
      
      <div className="mb-2 text-sm text-gray-600">Estimated revenue</div>
      <div className="mb-1 text-3xl font-bold">$10M</div>
      <div className="flex items-center text-sm text-green-600">
        <TrendingUp size={16} className="mr-1" />
        $615K
      </div>
    </div>
  );

  const InterestsCard = () => (
    <div className="p-6 bg-lime-400 rounded-3xl">
      <h3 className="mb-6 text-lg font-semibold">Choose your interests</h3>
      
      <div className="flex flex-wrap gap-2">
        <button className="flex items-center px-4 py-2 space-x-2 text-sm rounded-full bg-white/20">
          <Plus size={16} />
          <span>Architecture</span>
        </button>
        <button className="flex items-center px-4 py-2 space-x-2 text-sm rounded-full bg-white/20">
          <Plus size={16} />
          <span>Beauty</span>
        </button>
        <button className="flex items-center px-4 py-2 space-x-2 text-sm text-white bg-black rounded-full">
          <CheckCircle size={16} />
          <span>Business</span>
        </button>
        <button className="flex items-center px-4 py-2 space-x-2 text-sm text-white bg-black rounded-full">
          <CheckCircle size={16} />
          <span>Car</span>
        </button>
        <button className="flex items-center px-4 py-2 space-x-2 text-sm rounded-full bg-white/20">
          <Plus size={16} />
          <span>Communication</span>
        </button>
        <button className="flex items-center px-4 py-2 space-x-2 text-sm text-white bg-black rounded-full">
          <CheckCircle size={16} />
          <span>Education</span>
        </button>
      </div>
    </div>
  );

  const SearchCard = () => (
    <div className="p-6 bg-white shadow-lg rounded-3xl">
      <div className="flex items-center mb-4 space-x-4">
        <Search size={20} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Music Video" 
          className="flex-1 text-sm border-none outline-none"
        />
        <Mic size={16} className="text-gray-400" />
        <Image size={16} className="text-gray-400" />
        <X size={16} className="text-gray-400" />
      </div>
      
      <div className="text-sm text-gray-500">
        <Clock size={16} className="inline mr-2" />
        Top 100 music videos 2024
      </div>
    </div>
  );

  const SubscribersCard = () => (
    <div className="p-6 bg-white shadow-lg rounded-3xl">
      <h3 className="mb-4 font-semibold">Your subscribers</h3>
      
      <div className="space-y-4">
        {subscribers.map((subscriber, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-500 rounded-full">
              <span className="text-white">{subscriber.avatar}</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{subscriber.name}</div>
              <div className="text-xs text-gray-500">{subscriber.count}</div>
            </div>
            <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
              <CheckCircle size={12} className="text-white" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const Sidebar = ({ className = "" }) => (
    <div className={`bg-white ${className}`}>
      <div className="hidden p-6 lg:block">
        <div className="flex items-center justify-center w-12 h-12 mb-8 bg-blue-500 rounded-full">
          <span className="font-bold text-white">R</span>
        </div>
      </div>
      
      <nav className="flex justify-around lg:flex-col lg:space-y-2 lg:justify-start lg:px-6">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`p-3 rounded-2xl transition-colors ${
              activeTab === item.id
                ? 'bg-black text-white'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <item.icon size={20} />
          </button>
        ))}
      </nav>
      
      <div className="hidden px-6 mt-8 lg:block">
        <div className="space-y-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500"></div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="p-4 bg-white shadow-sm lg:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full">
            <span className="font-bold text-white">R</span>
          </div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <button className="p-2">
            <User size={20} />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden w-24 min-h-screen shadow-lg lg:block" />
        
        {/* Main Content */}
        <div className="flex-1 p-4 pb-24 lg:p-8 lg:pb-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Video Player - spans 2 columns */}
            <div className="md:col-span-2">
              <VideoPlayer />
            </div>
            
            {/* Profile Card */}
            <div>
              <ProfileCard />
            </div>
            
            {/* Art Card */}
            <div>
              <ArtCard />
            </div>
            
            {/* Transaction Card */}
            <div>
              <TransactionCard />
            </div>
            
            {/* Stats Card */}
            <div>
              <StatsCard />
            </div>
            
            {/* Revenue Card */}
            <div>
              <RevenueCard />
            </div>
            
            {/* Interests Card - spans 2 columns */}
            <div className="md:col-span-2">
              <InterestsCard />
            </div>
            
            {/* Search Card */}
            <div>
              <SearchCard />
            </div>
            
            {/* Subscribers Card */}
            <div>
              <SubscribersCard />
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t lg:hidden">
        <Sidebar className="py-2" />
      </div>
    </div>
  );
};

export default Dashboard;
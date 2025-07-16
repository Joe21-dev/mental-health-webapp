import React, { useState } from 'react';
import { 
  Home, 
  Calendar, 
  Mail, 
  Copy, 
  Settings, 
  Users, 
  Sparkles,
  Paperclip,
  Send,
  Menu,
  X
} from 'lucide-react';

const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sidebarItems = [
    { icon: Home, active: true },
    { icon: Calendar, active: false },
    { icon: Mail, active: false },
    { icon: Copy, active: false },
  ];

  const bottomSidebarItems = [
    { icon: Settings, active: false },
    { icon: Users, active: false },
  ];

  const suggestions = [
    {
      title: "Content Help",
      description: "Help with me create a Presentation",
      color: "bg-blue-500/20 text-blue-400 border-blue-500/30"
    },
    {
      title: "Suggestions", 
      description: "Help with me ideas",
      color: "bg-red-500/20 text-red-400 border-red-500/30"
    },
    {
      title: "Job Application",
      description: "Help with me apply for job application", 
      color: "bg-green-500/20 text-green-400 border-green-500/30"
    }
  ];

  const Sidebar = ({ className = "" }) => (
    <div className={`bg-black border-r border-gray-800 flex flex-col ${className}`}>
      <div className="p-4">
        <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">A</span>
        </div>
      </div>
      
      <nav className="flex-1 px-2">
        <div className="space-y-2">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              className={`w-full p-3 rounded-lg flex items-center justify-center transition-colors ${
                item.active 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
            </button>
          ))}
        </div>
      </nav>
      
      <div className="p-2 border-t border-gray-800">
        <div className="space-y-2">
          {bottomSidebarItems.map((item, index) => (
            <button
              key={index}
              className="w-full p-3 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <item.icon size={20} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-black text-white flex">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex w-16" />
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <Sidebar className="w-16" />
          <div 
            className="flex-1 bg-black/50" 
            onClick={() => setIsSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-gray-800 md:hidden">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-400 hover:text-white"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-600"></div>
            <span className="text-sm text-gray-300">Raf Redw</span>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-end p-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-600"></div>
            <span className="text-sm text-gray-300">Raf Redw</span>
          </div>
        </header>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
          {/* Background Effect */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="w-48 h-48 md:w-96 md:h-96 rounded-full border-2 border-teal-500/30"></div>
          </div>

          {/* Welcome Message */}
          <div className="text-center mb-8 md:mb-12 z-10">
            <h1 className="text-3xl md:text-5xl font-light mb-2 md:mb-4">Hey! Raf</h1>
            <p className="text-lg md:text-xl text-gray-300">What can I help with?</p>
          </div>

          {/* Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mb-8 md:mb-12 z-10">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className={`p-4 rounded-lg border text-left transition-all hover:scale-105 ${suggestion.color}`}
              >
                <div className="font-medium mb-2">{suggestion.title}</div>
                <div className="text-sm opacity-80">{suggestion.description}</div>
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="w-full max-w-4xl z-10">
            <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
              <div className="flex items-center space-x-2">
                <Sparkles size={20} className="text-gray-400" />
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me anything......."
                  className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
                />
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                  <Paperclip size={16} />
                  <span className="text-sm">Attach file</span>
                </button>
                
                <button className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center hover:bg-teal-600 transition-colors">
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatInterface;
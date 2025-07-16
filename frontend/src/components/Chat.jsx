import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Settings, 
  Bell, 
  User, 
  BarChart3, 
  MessageCircle,
  Star,
  AlertTriangle,
  Archive,
  Trash2,
  ArrowUp,
  HelpCircle,
  Menu,
  X,
  Send,
  Paperclip,
  Smile,
  Mic
} from 'lucide-react';

const ChatUI = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [showConversations, setShowConversations] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const conversations = [
    { id: 1, title: "Can't Sleep. Possibly Insomnia", preview: "It seems that I have insomnia lately", time: "2m ago", unread: true },
    { id: 2, title: "How to be healthy", preview: "It seems that I have insomnia lately", time: "3m ago" },
    { id: 3, title: "Best meditation books", preview: "It seems that I have insomnia lately", time: "5m ago" },
    { id: 4, title: "Best mindfulness podcast", preview: "It seems that I have insomnia lately", time: "6m ago" },
    { id: 5, title: "Best AI for meditation", preview: "It seems that I have insomnia lately", time: "7m ago", unread: true },
    { id: 6, title: "Can't Sleep. Possibly Insomnia", preview: "It seems that I have insomnia lately", time: "8m ago", unread: true },
    { id: 7, title: "Symptom checks", preview: "It seems that I have insomnia lately", time: "9m ago" },
    { id: 8, title: "Cure for depression", preview: "It seems that I have insomnia lately", time: "10m ago", unread: true },
    { id: 9, title: "Can't Sleep. Possibly Insomnia", preview: "It seems that I have insomnia lately", time: "11m ago" },
    { id: 10, title: "Can't Sleep. Possibly Insomnia", preview: "It seems that I have insomnia lately", time: "12m ago" }
  ];

  const sidebarItems = [
    { icon: MessageCircle, label: "Current", count: 157, active: true },
    { icon: Star, label: "Active", count: 48 },
    { icon: AlertTriangle, label: "Inactive", count: 8 },
    { icon: Archive, label: "Archived", count: 7 },
    { icon: Trash2, label: "Deleted", count: 55 },
    { icon: ArrowUp, label: "Upgrade", count: 12 },
    { icon: HelpCircle, label: "Support", count: 964 }
  ];

  const llmData = [
    { name: "LLama7", count: 157 },
    { name: "qwen7.8", count: 48 },
    { name: "deepSeek_22.5", count: 12 },
    { name: "GPT-9", count: 964 }
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === '') return;
    setMessages(prev => [
      ...prev,
      {
        id: prev.length + 1,
        sender: "user",
        content: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: "/api/placeholder/32/32"
      }
    ]);
    setMessage('');
    if (inputRef.current) inputRef.current.focus();
  };

  const DesktopUI = () => (
    <div className="flex h-screen bg-white text-black">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <h1 className="text-lg font-semibold">Chats</h1>
            <Search className="w-5 h-5 text-gray-500 ml-auto" />
          </div>
        </div>

        {/* Conversations Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-medium text-gray-600 mb-3">Conversations</h2>
            <div className="space-y-1">
              {sidebarItems.map((item, index) => (
                <div key={index} className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${item.active ? 'bg-gray-200' : 'hover:bg-gray-200'} cursor-pointer`}>
                  <item.icon className="w-5 h-5 text-gray-600 cursor-pointer" />
                  <span className="text-sm cursor-pointer">{item.label}</span>
                  <span className="text-xs text-gray-500 ml-auto cursor-pointer">{item.count}</span>
                </div>
              ))}
            </div>
            <button
              className="mt-4 w-full bg-gray-800 text-white py-2 px-4 rounded-lg text-sm font-medium cursor-pointer"
              onClick={() => setShowConversations((prev) => !prev)}
            >
              {showConversations ? 'Hide All Conversations' : 'Show All Conversations'}
            </button>
          </div>

          {/* LLMs Data */}
          <div className="p-4 border-t border-gray-200">
            <h2 className="text-sm font-medium text-gray-600 mb-3">LLMs Data</h2>
            <div className="space-y-1">
              {llmData.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-200 cursor-pointer">
                  <div className="w-5 h-5 bg-gray-300 rounded cursor-pointer"></div>
                  <span className="text-sm cursor-pointer">{item.name}</span>
                  <span className="text-xs text-gray-500 ml-auto cursor-pointer">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 cursor-pointer">
            <span>New Conversation</span>
            <Plus className="w-4 h-4 cursor-pointer" />
          </button>
        </div>
      </div>
      {/* Conversations List (toggle) */}
      {showConversations && (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">All Conversations</h2>
              <MessageCircle className="w-5 h-5 text-gray-500" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <div key={conv.id} className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 cursor-pointer"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium truncate">{conv.title}</h3>
                      <span className="text-xs text-gray-500">{conv.time}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{conv.preview}</p>
                  </div>
                  {conv.unread && (
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div>
                <h2 className="text-lg font-semibold">Doctor Freud.ai</h2>
                <p className="text-sm text-gray-600">GPT-7 Model → 448 Chats Left</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-gray-500 cursor-pointer" />
              <Plus className="w-5 h-5 text-gray-500 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.sender === 'assistant' && (
                <div className="w-8 h-8 bg-gray-300 rounded-full mr-3 flex-shrink-0"></div>
              )}
              <div className={`max-w-xs lg:max-w-md ${message.sender === 'user' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'} rounded-lg p-3`}>
                {message.type === 'recommendation' ? (
                  <div>
                    <p className="font-medium mb-3">{message.content}</p>
                    <div className="space-y-2">
                      {message.recommendations.map((rec, index) => (
                        <div key={index} className="bg-white text-black p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{rec.title}</p>
                              <p className="text-xs text-gray-600">{rec.subtitle}</p>
                            </div>
                            <div className="text-xs text-gray-500">
                              <p>{rec.duration}</p>
                              <p>{rec.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">View All Recommendations</p>
                  </div>
                ) : message.type === 'file' ? (
                  <div className="bg-gray-800 text-white p-3 rounded-lg flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                      <span className="text-xs">📄</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{message.content}</p>
                      <p className="text-xs text-gray-300">{message.fileSize}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">{message.time}</p>
              </div>
              {message.sender === 'user' && (
                <div className="w-8 h-8 bg-gray-400 rounded-full ml-3 flex-shrink-0"></div>
              )}
            </div>
          ))}
        </div>

        {/* Input Area - FIXED */}
        <div className="p-4 border-t border-gray-200">
          <form className="flex items-center space-x-2" onSubmit={handleSendMessage}>
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Send your message to Dr. freud AI..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-32 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                autoComplete="off"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                <Paperclip className="w-5 h-5 text-gray-500 cursor-pointer" />
                <Smile className="w-5 h-5 text-gray-500 cursor-pointer" />
                <Mic className="w-5 h-5 text-gray-500 cursor-pointer" />
              </div>
            </div>
            <button type="submit" className="bg-gray-800 text-white p-3 rounded-lg hover:bg-gray-700 cursor-pointer flex items-center justify-center">
              <Send className="w-6 h-6 cursor-pointer" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  const MobileUI = () => (
    <div className="flex flex-col h-screen bg-white text-black">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => setSidebarOpen(true)} className="cursor-pointer">
              <Menu className="w-6 h-6 cursor-pointer" />
            </button>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div>
              <h2 className="text-lg font-semibold">Doctor Freud.ai</h2>
              <p className="text-sm text-gray-600">GPT-7 Model</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-500" />
            <Plus className="w-5 h-5 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.sender === 'assistant' && (
              <div className="w-8 h-8 bg-gray-300 rounded-full mr-3 flex-shrink-0"></div>
            )}
            <div className={`max-w-xs ${message.sender === 'user' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'} rounded-lg p-3`}>
              {message.type === 'recommendation' ? (
                <div>
                  <p className="font-medium mb-3">{message.content}</p>
                  <div className="space-y-2">
                    {message.recommendations.map((rec, index) => (
                      <div key={index} className="bg-white text-black p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{rec.title}</p>
                            <p className="text-xs text-gray-600">{rec.subtitle}</p>
                          </div>
                          <div className="text-xs text-gray-500">
                            <p>{rec.duration}</p>
                            <p>{rec.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">View All Recommendations</p>
                </div>
              ) : message.type === 'file' ? (
                <div className="bg-gray-800 text-white p-3 rounded-lg flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                    <span className="text-xs">📄</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{message.content}</p>
                    <p className="text-xs text-gray-300">{message.fileSize}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm">{message.content}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">{message.time}</p>
            </div>
            {message.sender === 'user' && (
              <div className="w-8 h-8 bg-gray-400 rounded-full ml-3 flex-shrink-0"></div>
            )}
          </div>
        ))}
      </div>

      {/* Input Area - FIXED */}
      <div className="p-4 border-t border-gray-200">
        <form className="flex items-center space-x-2" onSubmit={handleSendMessage}>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Send your message to Dr. freud AI..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-32 focus:outline-none focus:ring-2 focus:ring-gray-500"
              autoComplete="off"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <Paperclip className="w-4 h-4 text-gray-500 cursor-pointer" />
              <Smile className="w-4 h-4 text-gray-500 cursor-pointer" />
              <Mic className="w-4 h-4 text-gray-500 cursor-pointer" />
            </div>
          </div>
          <button type="submit" className="bg-gray-800 text-white p-2 rounded-lg hover:bg-gray-700 cursor-pointer">
            <Send className="w-5 h-5 cursor-pointer" />
          </button>
        </form>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="w-80 max-w-full h-full bg-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-semibold">Chats</h1>
              <button onClick={() => setSidebarOpen(false)} className="cursor-pointer">
                <X className="w-6 h-6 cursor-pointer" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-medium text-gray-600 mb-2">Conversations</h2>
                <div className="space-y-1">
                  {sidebarItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-200 cursor-pointer">
                      <item.icon className="w-5 h-5 text-gray-600 cursor-pointer" />
                      <span className="text-sm cursor-pointer">{item.label}</span>
                      <span className="text-xs text-gray-500 ml-auto cursor-pointer">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen">
      {isDesktop ? <DesktopUI /> : <MobileUI />}
    </div>
  );
};

export default ChatUI;
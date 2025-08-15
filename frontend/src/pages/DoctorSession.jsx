import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, Home, Users, BookOpen, MessageCircle, Shield, Phone, MapPin, Video, Mic, MicOff, VideoOff, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function DoctorSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ id: null, name: '', email: '' });
  const [doctor, setDoctor] = useState(null);
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);

  // Fetch user
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(u => {
      setUser({ id: u._id || u.id, name: u.name, email: u.email });
    }).catch(() => {});
  }, []);

  // Fetch booked doctor
  useEffect(() => {
    if (!user.id) return;
    fetch(`${API_URL}/api/therapists/booked/by-user/${user.id}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(setDoctor)
      .catch(() => setError('No booked doctor found. Please book a therapist first.'));
  }, [user.id]);

  async function startCall() {
    if (!doctor || !user.id) return;
    setConnecting(true);
    try {
      // lazy import io to avoid bundle bloat
      const { io } = await import('socket.io-client');
      socketRef.current = io(API_URL, { transports: ['websocket'] });

      // Create peer
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      });
      peerRef.current = pc;

      // Local media
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      // Remote media
      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // ICE
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socketRef.current.emit('signal', { room, data: { type: 'candidate', candidate: e.candidate } });
        }
      };

      const room = `doctor:${doctor._id}:user:${user.id}`;
      socketRef.current.emit('join-room', { room });

      socketRef.current.on('peer-joined', async () => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current.emit('signal', { room, data: { type: 'offer', offer } });
      });

      socketRef.current.on('signal', async (data) => {
        if (data.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socketRef.current.emit('signal', { room, data: { type: 'answer', answer } });
        } else if (data.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        } else if (data.type === 'candidate') {
          try { await pc.addIceCandidate(new RTCIceCandidate(data.candidate)); } catch {}
        }
      });

      setInCall(true);
    } catch (e) {
      setError('Failed to start call');
    } finally {
      setConnecting(false);
    }
  }

  function hangUp() {
    setInCall(false);
    try {
      if (peerRef.current) peerRef.current.close();
      if (socketRef.current) socketRef.current.disconnect();
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
    } catch {}
  }

  function toggleMute() {
    const tracks = localStreamRef.current?.getAudioTracks?.() || [];
    tracks.forEach(t => (t.enabled = !t.enabled));
    setMuted(prev => !prev);
  }

  function toggleCamera() {
    const tracks = localStreamRef.current?.getVideoTracks?.() || [];
    tracks.forEach(t => (t.enabled = !t.enabled));
    setCameraOff(prev => !prev);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop Header */}
      <div className='pt-6 hidden lg:block'>
        <nav className="flex items-center justify-between mb-0">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/platform')}>
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <button className={`bg-gray-800 text-gray-100 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:scale-105 transition-transform border border-gray-800${location.pathname === '/platform' ? ' ring-2 ring-blue-500' : ''}`} onClick={() => navigate('/platform')}>
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
              <button className={`bg-gray-100 text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:bg-gray-800 hover:text-gray-100 transition-colors border border-gray-200${location.pathname === '/platform/therapists' ? ' ring-2 ring-blue-500' : ''}`} onClick={() => navigate('/platform/therapists')}>
                <Users className="w-4 h-4" />
                <span>Therapists</span>
              </button>
              <button className={`bg-gray-100 text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:bg-gray-800 hover:text-gray-100 transition-colors border border-gray-200${location.pathname === '/platform/scheduler' ? ' ring-2 ring-blue-500' : ''}`} onClick={() => navigate('/platform/scheduler')}>
                <BookOpen className="w-4 h-4" />
                <span>Scheduler</span>
              </button>
              <button className={`bg-gray-100 text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:bg-gray-800 hover:text-gray-100 transition-colors border border-gray-200${location.pathname === '/platform/chat' ? ' ring-2 ring-blue-500' : ''}`} onClick={() => navigate('/platform/chat')}>
                <MessageCircle className="w-4 h-4" />
                <span>Chat.ai</span>
              </button>
              <button className={`bg-gray-100 text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:bg-gray-800 hover:text-gray-100 transition-colors border border-gray-200${location.pathname === '/platform/resources' ? ' ring-2 ring-blue-500' : ''}`} onClick={() => navigate('/platform/resources')}>
                <Shield className="w-4 h-4" />
                <span>Resources</span>
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="px-4 lg:px-12 py-6 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Video Call Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="font-semibold text-gray-800 flex items-center gap-2"><Video className="w-5 h-5 text-blue-600" /> Real-time session</div>
              <div className="flex items-center gap-2">
                <button className={`px-3 py-1.5 rounded-full text-white ${inCall ? 'bg-red-600' : 'bg-blue-600'} cursor-pointer`} onClick={inCall ? hangUp : startCall} disabled={connecting}>
                  {connecting ? 'Connecting...' : inCall ? 'Hang up' : 'Start call'}
                </button>
                <button className={`px-3 py-1.5 rounded-full ${muted ? 'bg-gray-200 text-gray-700' : 'bg-gray-800 text-white'} cursor-pointer`} onClick={toggleMute} disabled={!inCall}>{muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}</button>
                <button className={`px-3 py-1.5 rounded-full ${cameraOff ? 'bg-gray-200 text-gray-700' : 'bg-gray-800 text-white'} cursor-pointer`} onClick={toggleCamera} disabled={!inCall}>{cameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}</button>
              </div>
            </div>
            <div className="relative bg-black" style={{ minHeight: 320 }}>
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-72 lg:h-96 object-cover" />
              <video ref={localVideoRef} autoPlay muted playsInline className="absolute bottom-4 right-4 w-36 h-24 object-cover rounded-lg border-2 border-white shadow-lg" />
            </div>
          </div>

          {/* Right: Doctor Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700 text-lg">{doctor?.name?.[0]?.toUpperCase?.() || '?'}</div>
              <div>
                <div className="font-bold text-lg">{doctor?.name || 'Doctor'}</div>
                <div className="text-sm text-gray-500">{doctor?.specialty || 'Specialist'}</div>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-green-600" /> <span className="font-semibold">Phone:</span> <span>{doctor?.phoneNumber || '+254 700 000 000'}</span></div>
              <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-purple-600" /> <span className="font-semibold">Hospital:</span> <span>{doctor?.hospitalName || 'N/A'}</span></div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-red-600" /> <span className="font-semibold">Location:</span> <span>{doctor?.hospitalLocation || 'Nairobi, Kenya'}</span></div>
            </div>
            <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-800">For physical visits, contact the hospital ahead to schedule.</div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 py-2 bg-white border-t border-gray-200 lg:hidden">
        <div className="flex justify-around">
          {[
            { icon: Home, label: 'Home', path: '/platform' },
            { icon: MessageCircle, label: 'Chat', path: '/platform/chat' },
            { icon: BookOpen, label: 'Schedule', path: '/platform/scheduler' },
            { icon: Users, label: 'Therapists', path: '/platform/therapists' },
            { icon: Shield, label: 'Resources', path: '/platform/resources' }
          ].map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <button key={label} className={`flex flex-col items-center py-2 px-3 cursor-pointer rounded-lg transition-colors duration-200 hover:bg-gray-100${isActive ? ' bg-blue-100' : ''}`} onClick={() => navigate(path)} disabled={isActive}>
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





import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import Chat from './pages/Chat';
import Therapists from './pages/Therapists';
import TherapistsMobile from './pages/TherapistsMobile';
import Signup from './pages/Signup';
import { ResourcesRouteWrapper } from './ResourcesRouteWrapper';
import Scheduler from './pages/Scheduler';
import About from './pages/About';
import './App.css';
import GlobalResourcePlayer from './GlobalResourcePlayer';

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 1024);
  React.useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 1024);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}

function App() {
  const isMobile = useIsMobile();
  return (
    
      <Router>
        <GlobalResourcePlayer />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path='/signup' element={<Signup />} />
          <Route path="/platform" element={<Dashboard />} />
          <Route path="/platform/therapists" element={isMobile ? <TherapistsMobile /> : <Therapists />} />
          <Route path="/platform/chat" element={<Chat />} />
          <Route path="/platform/resources" element={<ResourcesRouteWrapper />} />
          <Route path="/platform/scheduler" element={<Scheduler />} />
          <Route path="/about" element={<About />} />
          {/* Add other /platform/... routes as needed */}
        </Routes>
      </Router>
    
  );
}

export default App;

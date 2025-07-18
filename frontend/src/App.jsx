import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import Chat from './pages/Chat';
import Therapists from './pages/Therapists';
import TherapistsMobile from './pages/TherapistsMobile';
import SignUpForm from './pages/Signup';
import Scheduler from './pages/Scheduler';
import { ResourcesRouteWrapper } from './ResourcesRouteWrapper';
import './App.css';

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
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/platform" element={<Dashboard />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/platform/therapists" element={isMobile ? <TherapistsMobile /> : <Therapists />} />
        <Route path="/platform/ai-doctor" element={<Chat />} />
        <Route path="/platform/scheduler" element={<Scheduler />} />
        <Route path="/platform/resources" element={<ResourcesRouteWrapper />} />
      </Routes>
    </Router>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/platform" element={<Dashboard />} />
        <Route path="/ai-doctor" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;

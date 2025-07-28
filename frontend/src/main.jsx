import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ResourcePlayerProvider } from './ResourcePlayerContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ResourcePlayerProvider>
      <App />
    </ResourcePlayerProvider>
  </React.StrictMode>
);

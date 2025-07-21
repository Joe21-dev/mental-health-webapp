import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ResourcePlayerProvider } from './ResourcePlayerContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ResourcePlayerProvider>
      <App />
    </ResourcePlayerProvider>
  </StrictMode>,
)

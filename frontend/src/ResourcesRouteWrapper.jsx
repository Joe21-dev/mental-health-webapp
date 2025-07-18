import React from 'react';
import Resources from './pages/Resources';
import ResourcesMobile from './pages/ResourcesMobile';

// Wrapper to render Resources or ResourcesMobile based on screen size
export function ResourcesRouteWrapper() {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 1024);
  React.useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 1024);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile ? <ResourcesMobile /> : <Resources />;
}

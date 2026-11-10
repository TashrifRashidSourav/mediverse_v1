import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets scroll to the top whenever the page (route) changes.
 *
 * React Router's <ScrollRestoration> only works with data routers, and this app uses
 * HashRouter, so without this a new page opens at the same scroll position as the old one.
 * Links to an anchor on the same page (e.g. "/#pricing") are left alone; HomePage scrolls to them.
 */
const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    // Dashboards scroll inside their <main> element rather than the window.
    document.querySelectorAll('main').forEach(el => el.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;

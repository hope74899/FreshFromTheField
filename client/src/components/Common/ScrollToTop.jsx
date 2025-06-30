import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);  // Scroll to the top-left corner
  }, [pathname]);  // This effect runs every time the path changes

  return null;
};

export default ScrollToTop;

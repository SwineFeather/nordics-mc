
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Host-based routing: if on nsi subdomain, go to /nsi
    const host = window.location.hostname;
    if (host.startsWith('nsi.')) {
      navigate('/nsi', { replace: true });
      return;
    }
    // Default redirect to home page
    navigate('/home', { replace: true });
  }, [navigate]);

  return null;
};

export default Index;

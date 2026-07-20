import { useState, useEffect } from 'react';

export const useLogo = () => {
  const [logoUrl, setLogoUrl] = useState<string>('/logo.png');

  useEffect(() => {
    const savedLogo = localStorage.getItem('site_logo');
    if (savedLogo) {
      setLogoUrl(savedLogo);
    }

    const handleStorageChange = () => {
      const updatedLogo = localStorage.getItem('site_logo');
      if (updatedLogo) setLogoUrl(updatedLogo);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('logo-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('logo-updated', handleStorageChange);
    };
  }, []);

  const updateLogo = (newLogoUrl: string) => {
    localStorage.setItem('site_logo', newLogoUrl);
    setLogoUrl(newLogoUrl);
    window.dispatchEvent(new Event('logo-updated'));
  };

  return { logoUrl, updateLogo };
};

import { useState } from 'react';

interface LogoProps {
  slug: string;
  chainName: string;
  className?: string;
}

export const Logo = ({ slug, chainName, className = "w-8 h-8" }: LogoProps) => {
  const [currentExtension, setCurrentExtension] = useState(0);
  const [hasError, setHasError] = useState(false);
  
  const extensions = ['png', 'svg', 'jpg', 'jpeg', 'webp'];
  const logoUrl = `https://explorer.crxanode.me/logos/${slug.toLowerCase()}.${extensions[currentExtension]}`;

  const handleError = () => {
    if (currentExtension < extensions.length - 1) {
      setCurrentExtension(prev => prev + 1);
    } else {
      setHasError(true);
    }
  };

  const handleLoad = () => {
    setHasError(false);
  };

  if (hasError) {
    // Fallback to first letter avatar
    return (
      <div className={`${className} rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm`}>
        {chainName.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${chainName} logo`}
      className={`${className} rounded-full object-cover`}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
    />
  );
};
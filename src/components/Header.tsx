import { useTheme } from '../hooks/useTheme';
import { Link } from 'react-router-dom';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useThrottle } from '../hooks/useThrottle';

export const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [scrollY, setScrollY] = useState(0);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const throttledScrollY = useThrottle(scrollY, 100);
  const isScrolled = throttledScrollY > 50;

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <header
      className="fixed z-50 flex items-center justify-between transition-all duration-700 ease-in-out"
      style={{
        top: isScrolled ? '1rem' : '0',
        left: isScrolled ? '50%' : '0',
        right: isScrolled ? 'auto' : '0',
        transform: isScrolled ? 'translateX(-50%)' : 'translateX(0)',
        width: isScrolled ? '95%' : '100%',
        maxWidth: isScrolled ? '80rem' : 'none',
        paddingLeft: isScrolled ? '1.5rem' : '2rem',
        paddingRight: isScrolled ? '1.5rem' : '2rem',
        paddingTop: isScrolled ? '0.75rem' : '1rem',
        paddingBottom: isScrolled ? '0.75rem' : '1rem',
        borderRadius: isScrolled ? '9999px' : '0',
        backgroundColor: isScrolled ? 'hsl(var(--background) / 0.8)' : 'hsl(var(--background) / 0.7)',
        backdropFilter: isScrolled ? 'blur(24px)' : 'blur(12px)',
        border: isScrolled ? '1px solid hsl(var(--border) / 0.3)' : 'none',
        borderBottom: isScrolled ? 'none' : '1px solid hsl(var(--border) / 0.2)',
        boxShadow: isScrolled ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : 'none',
      }}
    >
      {/* Logo & Brand */}
      <Link to="/" className="flex items-center gap-3 font-bold text-primary hover:text-secondary transition-colors">
        <img
          src="/logo.png"
          alt="Crxanode logo"
          className="w-9 h-9 rounded-full transition-all duration-500"
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNGRjY1MDAiLz4KPHRleHQgeD0iMTYiIHk9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjE0Ij5DPC90ZXh0Pgo8L3N2Zz4K';
          }}
        />
        <span className="text-lg md:text-xl transition-all duration-500">
          Crxanode Service
        </span>
      </Link>

      {/* Desktop Navigation - Direct Links */}
      <nav className="hidden md:flex items-center gap-1">
        <Button variant="ghost" asChild className="hover:bg-accent/50 hover:text-primary">
          <a href="https://explorer.crxanode.me" target="_blank" rel="noopener noreferrer">
            Explorer Mainnet
          </a>
        </Button>
        <Button variant="ghost" asChild className="hover:bg-accent/50 hover:text-primary">
          <a href="https://testnet-explorer.crxanode.me" target="_blank" rel="noopener noreferrer">
            Explorer Testnet
          </a>
        </Button>
        <Button variant="ghost" asChild className="hover:bg-accent/50 hover:text-primary">
          <a href="https://cdn.crxanode.me" target="_blank" rel="noopener noreferrer">
            CDN
          </a>
        </Button>
      </nav>

      {/* Right Side - Mobile Menu & Theme Toggle */}
      <div className="flex items-center gap-2">
        {/* Mobile Menu */}
        <HoverCard open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <HoverCardTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-48 p-2 bg-base-200/95 backdrop-blur-sm border border-border shadow-xl" align="end">
            <div className="flex flex-col space-y-1">
              <a
                href="https://explorer.crxanode.me"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:bg-accent block px-3 py-2 text-sm rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setMobileMenuOpen(false)}
              >
                Explorer (Mainnet)
              </a>
              <a
                href="https://testnet-explorer.crxanode.me"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:bg-accent block px-3 py-2 text-sm rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setMobileMenuOpen(false)}
              >
                Explorer (Testnet)
              </a>
              <a
                href="https://cdn.crxanode.me"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:bg-accent block px-3 py-2 text-sm rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setMobileMenuOpen(false)}
              >
                CDN
              </a>
            </div>
          </HoverCardContent>
        </HoverCard>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-circle btn-sm"
          aria-label="Toggle theme"
        >
          {theme === 'mylight' ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};

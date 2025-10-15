import { useTheme } from '../hooks/useTheme';
import { Link } from 'react-router-dom';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { useState } from 'react';

export const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [isExplorerSticky, setExplorerSticky] = useState(false);
  const [isExplorerOpen, setExplorerOpen] = useState(false);

  const handleExplorerOpenChange = (open: boolean) => {
    // Only handle hover changes if the menu is not sticky
    if (!isExplorerSticky) {
      setExplorerOpen(open);
    }
  };

  const handleExplorerClick = () => {
    if (isExplorerSticky) {
      // If it's sticky, unstick it and close it
      setExplorerSticky(false);
      setExplorerOpen(false);
    } else {
      // If it's not sticky, make it sticky and open it
      setExplorerSticky(true);
      setExplorerOpen(true);
    }
  };


  return (
    <header className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-50">
      <div className="navbar-start">
        <Link to="/" className="flex items-center gap-3 text-xl font-bold text-primary hover:text-secondary transition-colors ml-5">
          <img
            src="/logo.png"
            alt="Crxanode logo"
            className="w-8 h-8 rounded-full"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNGRjY1MDAiLz4KPHRleHQgeD0iMTYiIHk9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjE0Ij5DPC90ZXh0Pgo8L3N2Zz4K';
            }}
          />
          <span>
            Crxanode Service
          </span>
        </Link>
      </div>

      <div className="navbar-end">
        <nav className="hidden md:flex items-center gap-1 mr-2">
          <HoverCard
            open={isExplorerOpen}
            onOpenChange={handleExplorerOpenChange}
            openDelay={100}
            closeDelay={100}
          >
            <HoverCardTrigger asChild>
              <Button
                variant="ghost"
                onClick={handleExplorerClick}
                className="transition-all duration-200 hover:bg-base-300 hover:text-primary"
              >
                Explorer
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-48 p-2 bg-base-200 backdrop-blur-sm border border-base-300 shadow-xl " align="start">
              <div className="flex flex-col space-y-1">
                <a href="https://mainnet.crxanode.service" target="_blank" rel="noopener noreferrer" className="dark:hover:bg-slate-900 hover:bg-base-300 block px-3 py-2 text-sm rounded-md hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  Mainnet
                </a>
                <a href="https://testnet.crxanode.service" target="_blank" rel="noopener noreferrer" className="dark:hover:bg-slate-900 hover:bg-base-300 block px-3 py-2 text-sm rounded-md hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  Testnet
                </a>
              </div>
            </HoverCardContent>
          </HoverCard>
          <Button variant="ghost" asChild className="transition-all duration-200 hover:bg-base-200 hover:text-primary">
            <a href="https://cdn.crxanode.service" target="_blank" rel="noopener noreferrer">
              CDN
            </a>
          </Button>
        </nav>
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-circle"
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
import { Github, Twitter, FileText, Heart } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-base-200 border-t border-base-300 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Crxanode"
                className="w-8 h-8"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <span className="font-bold text-lg text-base-content">Crxanode</span>
            </div>
            <p className="text-base-content/70 text-sm">
              Professional Cosmos validator providing reliable infrastructure and comprehensive documentation.
            </p>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base-content">Resources</h3>
            <div className="space-y-2">
              <a href="/" className="block text-base-content/70 hover:text-primary text-sm transition-colors">
                Home
              </a>
              <a href="#" className="block text-base-content/70 hover:text-primary text-sm transition-colors">
                API Documentation
              </a>
              <a href="#" className="block text-base-content/70 hover:text-primary text-sm transition-colors">
                Network Status
              </a>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base-content">Support</h3>
            <div className="space-y-2">
              <a href="#" target="_blank" className="block text-base-content/70 hover:text-primary text-sm transition-colors">
                Contact Us
              </a>
              <a href="#" target="_blank" className="block text-base-content/70 hover:text-primary text-sm transition-colors">
                Discord
              </a>
              <a href="https://t.me/caraka17" target="_blank" className="block text-base-content/70 hover:text-primary text-sm transition-colors">
                Telegram
              </a>
            </div>
          </div>

          {/* Social & Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base-content">Connect</h3>
            <div className="flex gap-3">
              <a
                href="https://twitter.com/crxanode"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm btn-square"
                title="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/caraka15"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm btn-square"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
            <div className="space-y-2">
              <a href="/license" className="flex items-center gap-2 text-base-content/70 hover:text-primary text-sm transition-colors">
                <FileText className="w-3 h-3" />
                License
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-base-300 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-base-content/70 text-sm">
            © {currentYear} Crxanode. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-base-content/70 text-sm">
            Made with <Heart className="w-3 h-3 text-red-500" /> by Crxanode Team
          </div>
        </div>
      </div>
    </footer>
  );
};
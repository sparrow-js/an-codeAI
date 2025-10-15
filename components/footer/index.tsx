import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-bolt-elements-background-depth-3 hover:shadow-2xl hover:shadow-[#979191]/10 transition-all duration-300">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-200">
            © 2025 needware. All rights reserved.
          </div>
          <div className="flex gap-4 text-sm">
            <a href="https://github.com/sparrow-js/an-codeAI" target="_blank" rel="noopener noreferrer" className="text-white hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-1">
                <div className="i-ph-github-logo text-lg" />
                GitHub
              </div>
            </a>
            <span className="text-white">·</span>
            <a href="/terms" className="text-white hover:opacity-80 transition-opacity">Terms & Conditions</a>
            <span className="text-white">·</span>
            <a href="/privacy-policy" className="text-white hover:opacity-80 transition-opacity">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
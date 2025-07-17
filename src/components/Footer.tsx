import React from 'react';
import { Mail, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-amber-100 to-orange-100 py-6 border-t-2 border-amber-200">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center transform rotate-12">
              <Mail className="w-2.5 h-2.5 text-white" />
            </div>
            <span 
              className="text-sm font-bold text-amber-800"
            >
              © 2024 MailCraft AI. All rights reserved.
            </span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <a 
              className="text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors hover:underline"
              href="#"
            >
              Terms of Service
            </a>
            <a 
              className="text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors hover:underline"
              href="#"
            >
              Privacy Policy
            </a>
            <a 
              className="text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors hover:underline"
              href="#"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
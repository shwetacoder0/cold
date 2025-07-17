import React from 'react';
import { Mail, Sparkles, BookTemplate as Template, PenTool, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

interface HeaderProps {
  activeSection: 'templates' | 'compose' | 'pricing';
  setActiveSection: (section: 'templates' | 'compose' | 'pricing') => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, setActiveSection }) => {
  const { user, userTokens, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<'signin' | 'signup'>('signin');

  const handleSignOut = () => signOut();

  return (
    <>
      <header className="sticky top-0 z-50 bg-gradient-to-r from-amber-50 to-orange-50 backdrop-blur-xl border-b border-amber-200/30 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300">
              <Mail className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-amber-900 tracking-tight font-work">
                MailCraft AI
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-8">
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setActiveSection('templates')}
                className={`text-sm font-medium transition-all duration-200 px-3 py-1.5 rounded-full ${
                  activeSection === 'templates'
                    ? 'text-amber-900 bg-amber-200/50 shadow-inner'
                    : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/50'
                }`}
              >
                Templates
              </button>
              
              <button
                onClick={() => setActiveSection('compose')}
                className={`text-sm font-medium transition-all duration-200 px-3 py-1.5 rounded-full ${
                  activeSection === 'compose'
                    ? 'text-amber-900 bg-amber-200/50 shadow-inner'
                    : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/50'
                }`}
              >
                Compose
              </button>
              
              <button
                onClick={() => setActiveSection('pricing')}
                className={`text-sm font-medium transition-all duration-200 px-3 py-1.5 rounded-full ${
                  activeSection === 'pricing'
                    ? 'text-amber-900 bg-amber-200/50 shadow-inner'
                    : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/50'
                }`}
              >
                Pricing
              </button>
            </nav>
            
            <div className="flex items-center space-x-3">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-white/80 px-3 py-2 rounded-full border border-amber-200/50 shadow-md">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-amber-900 font-noto">
                      {userTokens?.tokens || 0} tokens
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/80 px-3 py-2 rounded-full border border-amber-200/50 shadow-md">
                    <User className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-900 font-noto">
                      {user.email?.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 bg-red-100 text-red-700 px-3 py-2 rounded-full hover:bg-red-200 transition-colors shadow-md text-sm font-bold font-work"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      setAuthMode('signin');
                      setShowAuthModal(true);
                    }}
                    className="hidden sm:flex min-w-[80px] items-center justify-center h-9 px-4 bg-white/80 text-amber-900 text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-200 border border-amber-200/50 hover:bg-white transform hover:scale-105 font-work"
                  >
                    Login
                  </button>
                  
                  <button 
                    onClick={() => {
                      setAuthMode('signup');
                      setShowAuthModal(true);
                    }}
                    className="flex min-w-[90px] items-center justify-center h-9 px-5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:from-amber-500 hover:to-orange-600 font-work"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
};

export default Header;
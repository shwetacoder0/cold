import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import Header from './components/Header';
import Hero from './components/Hero';
import TemplateWall from './components/TemplateWall';
import EmailComposer from './components/EmailComposer';
import PricingPage from './components/PricingPage';
import UserOnboarding from './components/UserOnboarding';
import Footer from './components/Footer';
import { useAuth } from './contexts/AuthContext';

function AppContent() {
  const [activeSection, setActiveSection] = useState<'templates' | 'compose' | 'pricing'>('templates');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const { user, needsOnboarding, purchaseTokens } = useAuth();

  const handleShowAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleNavigateToCompose = () => {
    setActiveSection('compose');
  };

  const handleSelectPlan = async (plan: 'free' | 'basic' | 'pro') => {
    if (plan === 'free') {
      // Free plan is automatically given on signup
      handleShowAuth('signup');
      return;
    }

    try {
      const { error } = await purchaseTokens(plan);
      if (error) {
        alert(`Error purchasing ${plan} plan: ${error.message}`);
      } else {
        alert(`Successfully purchased ${plan} plan!`);
        setActiveSection('compose');
      }
    } catch (error) {
      alert('An error occurred while purchasing the plan.');
    }
  };

  const handleOnboardingComplete = () => {
    setActiveSection('compose');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Header 
        activeSection={activeSection} 
        setActiveSection={(section) => {
          if (section === 'pricing') {
            setActiveSection('pricing');
          } else {
            setActiveSection(section);
          }
        }} 
      />
      
      <main className="relative">
        {user && needsOnboarding ? (
          <UserOnboarding onComplete={handleOnboardingComplete} />
        ) : activeSection === 'templates' ? (
          <>
            <Hero 
              onShowAuth={() => handleShowAuth('signup')} 
              onNavigateToCompose={handleNavigateToCompose}
            />
            <TemplateWall 
              onUseTemplate={() => setActiveSection('compose')} 
              onShowAuth={() => handleShowAuth('signin')}
            />
          </>
        ) : activeSection === 'compose' ? (
          <EmailComposer />
        ) : activeSection === 'pricing' ? (
          <PricingPage onSelectPlan={handleSelectPlan} />
        ) : (
          <>
            <Hero 
              onShowAuth={() => handleShowAuth('signup')} 
              onNavigateToCompose={handleNavigateToCompose}
            />
            <TemplateWall 
              onUseTemplate={() => setActiveSection('compose')} 
              onShowAuth={() => handleShowAuth('signin')}
            />
          </>
        )}
      </main>
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
      
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import Header from './components/Header';
import Hero from './components/Hero';
import TemplateWall from './components/TemplateWall';
import EmailComposer from './components/EmailComposer';
import PricingPage from './components/PricingPage';
import UserOnboarding from './components/UserOnboarding';
import Footer from './components/Footer';
import { Template } from './types/template';
import { useAuth } from './contexts/AuthContext';

// Webhook handler for Lemon Squeezy events
// In a real app, this would be a server-side API endpoint
const handleWebhookEvent = async (event: any) => {
  try {
    // Get auth context from the app
    const auth = document.querySelector('#root')?.__REACT_APP_AUTH;

    if (auth && auth.processSubscriptionWebhook) {
      await auth.processSubscriptionWebhook(event);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
  }
};

// Make webhook handler available globally
if (typeof window !== 'undefined') {
  window.handleLemonSqueezyWebhook = handleWebhookEvent;
}

function AppContent() {
  const [activeSection, setActiveSection] = useState<'templates' | 'compose' | 'pricing'>('templates');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const { user, needsOnboarding, purchaseTokens } = useAuth();

  const handleShowAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleNavigateToCompose = () => {
    setActiveSection('compose');
  };

  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template);
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
              onUseTemplate={handleUseTemplate}
              onShowAuth={() => handleShowAuth('signin')}
            />
          </>
        ) : activeSection === 'compose' ? (
          <EmailComposer selectedTemplate={selectedTemplate} />
        ) : activeSection === 'pricing' ? (
          <PricingPage onSelectPlan={handleSelectPlan} />
        ) : (
          <>
            <Hero
              onShowAuth={() => handleShowAuth('signup')}
              onNavigateToCompose={handleNavigateToCompose}
            />
            <TemplateWall
              onUseTemplate={handleUseTemplate}
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
  const [authInstance, setAuthInstance] = useState(null);

  // Store auth instance for webhook access
  const handleAuthInit = (auth: any) => {
    if (typeof window !== 'undefined' && auth) {
      (document.querySelector('#root') as any).__REACT_APP_AUTH = auth;
      setAuthInstance(auth);
    }
  };

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import TemplateWall from './components/TemplateWall';
import EmailComposer from './components/EmailComposer';
import PricingPage from './components/PricingPage';
import Footer from './components/Footer';
import { useAuth } from './contexts/AuthContext';

function AppContent() {
  const [activeSection, setActiveSection] = useState<'templates' | 'compose' | 'pricing'>('templates');
  const { purchaseTokens } = useAuth();

  const handleSelectPlan = async (plan: 'free' | 'basic' | 'pro') => {
    if (plan === 'free') {
      // Free plan is automatically given on signup
      alert('You already have the free tier! Sign up to get your 5 free tokens.');
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
        {activeSection === 'templates' ? (
          <>
            <Hero />
            <TemplateWall onUseTemplate={() => setActiveSection('compose')} />
          </>
        ) : activeSection === 'compose' ? (
          <EmailComposer />
        ) : (
          <PricingPage onSelectPlan={handleSelectPlan} />
        )}
      </main>
      
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
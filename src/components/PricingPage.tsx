import React from 'react';
import { Check, Zap, Crown, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { lemonsqueezy } from '../lib/lemonsqueezy.ts';

interface PricingPageProps {
  onSelectPlan: (plan: 'free' | 'basic' | 'pro') => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onSelectPlan }) => {
  const { user } = useAuth();

  const plans = [
    {
      id: 'free',
      name: 'Free Tier',
      price: '$0',
      monthlyTokens: 5,
      description: 'Perfect for trying out our AI email generator',
      features: [
        '5 email generations per month',
        'Basic templates',
        'Standard support',
        'No credit card required',
        'Monthly token reset'
      ],
      icon: <Zap className="w-6 h-6" />,
      popular: false,
      buttonText: 'Get Started Free'
    },
    {
      id: 'basic',
      name: 'Basic Plan',
      price: '$1',
      monthlyTokens: 30,
      description: 'Great for small businesses and freelancers',
      features: [
        '30 email generations per month',
        'All templates',
        'Priority support',
        'Advanced customization',
        'Monthly token reset',
        'Unused tokens expire monthly'
      ],
      icon: <Star className="w-6 h-6" />,
      popular: true,
      buttonText: 'Start Monthly Plan'
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: '$5',
      monthlyTokens: 250,
      description: 'Perfect for growing teams and agencies',
      features: [
        '250 email generations per month',
        'All templates',
        'Premium support',
        'Advanced analytics',
        'Team collaboration',
        'Monthly token reset',
        'Priority email generation'
      ],
      icon: <Crown className="w-6 h-6" />,
      popular: false,
      buttonText: 'Start Pro Monthly'
    }
  ];

  const handleCheckout = (plan: 'basic' | 'pro') => {
    try {
      if (user) {
        // Get checkout URL with user data
        const checkoutUrl = lemonsqueezy.getCheckoutUrl(plan, user.id);

        // Open checkout in new tab
        window.open(checkoutUrl, '_blank');

        // For demo purposes, simulate successful checkout
        onSelectPlan(plan);
      } else {
        alert('Please sign in to purchase a plan');
      }
    } catch (error) {
      console.error('Error initiating checkout:', error);
      alert('Failed to start checkout process. Please try again.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-16">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-amber-900 mb-4 font-work">
            Choose Your Monthly Plan
          </h2>
          <p className="text-lg text-amber-700 max-w-2xl mx-auto font-noto">
            Subscribe monthly and get a fresh batch of tokens every month. Perfect for consistent email outreach campaigns.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-gradient-to-br from-white to-amber-50 rounded-2xl p-8 shadow-xl border-2 transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? 'border-orange-400 ring-4 ring-orange-200'
                  : 'border-amber-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white'
                    : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                }`}>
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold text-amber-900 mb-2 font-work">
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-4xl font-black text-amber-900">{plan.price}</span>
                  <span className="text-amber-700 font-medium">/month</span>
                </div>
                <p className="text-2xl font-bold text-green-600 mb-2">
                  {plan.monthlyTokens} tokens/month
                </p>
                <p className="text-amber-700 font-medium font-noto">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-amber-800 font-medium font-roboto">{feature}</span>
                  </div>
                ))}
              </div>

              {plan.id === 'free' ? (
                <button
                  onClick={() => onSelectPlan('free')}
                  className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-work bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600"
                >
                  {plan.buttonText}
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => handleCheckout(plan.id as 'basic' | 'pro')}
                    className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-work bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600"
                  >
                    {plan.buttonText}
                  </button>
                  <button
                    onClick={() => onSelectPlan(plan.id as 'free' | 'basic' | 'pro')}
                    className="w-full py-2 rounded-lg font-medium text-sm transition-all duration-200 border-2 border-amber-300 text-amber-700 hover:bg-amber-100 font-work"
                  >
                    Try without payment (Demo)
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Token Usage Info */}
        <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl p-8 shadow-lg border-2 border-amber-200">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-amber-900 mb-4 font-work">
              How Monthly Tokens Work
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="flex items-center space-x-4 p-4 bg-amber-100/50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 font-work">Monthly Reset</h4>
                  <p className="text-sm text-amber-700 font-roboto">Get fresh tokens at the start of each billing cycle</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-amber-100/50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 font-work">Token Usage</h4>
                  <p className="text-sm text-amber-700 font-roboto">Each email generation uses 1 token</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-amber-100/50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">!</span>
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 font-work">Token Expiry</h4>
                  <p className="text-sm text-amber-700 font-roboto">Unused tokens expire at the end of each month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

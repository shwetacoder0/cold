import React from 'react';
import { Check, Zap, Crown, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

interface PricingPageProps {
  onSelectPlan: (plan: 'free' | 'basic' | 'pro') => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onSelectPlan }) => {
  const { user } = useAuth();

  const paypalOptions = {
    "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test",
    currency: "USD",
    intent: "capture"
  };

  const planPrices = {
    basic: "1.00",
    pro: "5.00"
  };
  
  const plans = [
    {
      id: 'free',
      name: 'Free Tier',
      price: '$0',
      tokens: 5,
      description: 'Perfect for trying out our AI email generator',
      features: [
        '5 email generations',
        'Basic templates',
        'Standard support',
        'No credit card required'
      ],
      icon: <Zap className="w-6 h-6" />,
      popular: false,
      buttonText: 'Get Started Free'
    },
    {
      id: 'basic',
      name: 'Basic Plan',
      price: '$1',
      tokens: 30,
      description: 'Great for small businesses and freelancers',
      features: [
        '30 email generations',
        'All templates',
        'Priority support',
        'Advanced customization'
      ],
      icon: <Star className="w-6 h-6" />,
      popular: true,
      buttonText: 'Choose Basic'
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: '$5',
      tokens: 250,
      description: 'Perfect for growing teams and agencies',
      features: [
        '250 email generations',
        'All templates',
        'Premium support',
        'Advanced analytics',
        'Team collaboration'
      ],
      icon: <Crown className="w-6 h-6" />,
      popular: false,
      buttonText: 'Choose Pro'
    }
  ];

  const handlePayPalSuccess = async (details: any, plan: 'basic' | 'pro') => {
    console.log('PayPal payment successful:', details);
    // Call the parent function to handle the plan selection
    onSelectPlan(plan);
  };

  const handlePayPalError = (error: any) => {
    console.error('PayPal payment error:', error);
    alert('Payment failed. Please try again.');
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-16">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-amber-900 mb-4 font-work">
              Choose Your Plan
            </h2>
            <p className="text-lg text-amber-700 max-w-2xl mx-auto font-noto">
              Start with our free tier or upgrade for more email generations. Each email generation or regeneration uses 1 token.
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
                    {plan.id !== 'free' && <span className="text-amber-700 font-medium"> / {plan.tokens} tokens</span>}
                  </div>
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
                    <PayPalButtons
                      style={{
                        layout: "vertical",
                        color: "gold",
                        shape: "rect",
                        label: "pay",
                        height: 50
                      }}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          purchase_units: [{
                            amount: {
                              value: planPrices[plan.id as 'basic' | 'pro']
                            },
                            description: `${plan.name} - ${plan.tokens} tokens`
                          }]
                        });
                      }}
                      onApprove={(data, actions) => {
                        return actions.order!.capture().then((details) => {
                          handlePayPalSuccess(details, plan.id as 'basic' | 'pro');
                        });
                      }}
                      onError={handlePayPalError}
                    />
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
                How Tokens Work
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="flex items-center space-x-4 p-4 bg-amber-100/50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-900 font-work">Email Generation</h4>
                    <p className="text-sm text-amber-700 font-roboto">Each new email generation uses 1 token</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-amber-100/50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-900 font-work">Regeneration</h4>
                    <p className="text-sm text-amber-700 font-roboto">Each regeneration also uses 1 token</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
};

export default PricingPage;
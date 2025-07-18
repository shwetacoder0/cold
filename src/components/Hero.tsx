import React from 'react';
import { ArrowRight, Zap, Target, TrendingUp, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeroProps {
  onShowAuth: () => void;
  onNavigateToCompose: () => void;
}

const Hero: React.FC<HeroProps> = ({ onShowAuth, onNavigateToCompose }) => {
  const { user } = useAuth();

  const handleTryFree = () => {
    if (!user) {
      onShowAuth();
    } else {
      onNavigateToCompose();
    }
  };

  const handleStartGenerating = () => {
    if (!user) {
      onShowAuth();
    } else {
      onNavigateToCompose();
    }
  };

  return (
    <section className="relative pt-8 pb-16 overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-12 gap-12 items-center mb-24">
          {/* Left Column - Text Content */}
          <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
            <div className="flex flex-col gap-3 text-left">
              <h1 
                className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-amber-900 font-work"
              >
                Craft Cold Emails That Truly Convert.
              </h1>
              <p 
                className="text-base font-medium text-amber-700 leading-relaxed font-noto"
              >
                Generate personalized, human-like cold emails in seconds with the power of AI. Say goodbye to writer's block.
              </p>
            </div>
            <button 
              onClick={handleTryFree}
              className="flex w-fit min-w-[100px] items-center justify-center h-12 px-6 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-base font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:from-amber-500 hover:to-orange-600 font-work"
            >
              <span>Try It Free ✨</span>
            </button>
          </div>

          {/* Right Column - Hero Image with Sticky Note */}
          <div className="col-span-12 lg:col-span-6 relative">
            <div 
              className="w-4/5 mx-auto bg-center bg-no-repeat aspect-[4/3] bg-cover rounded-2xl shadow-xl transform -rotate-2 border-4 border-white"
              style={{
                backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuC55TnT5cR2fWalLYHTke5byn8w6q-7FOB8bYEHhrvfk11XCwwHGYmUbKzka4vFLuMKLjw7pQ6OuVDDIHdwrpmJ_moUDXiikhrspdT0pLOLD4SWoHPBYAPWiRlhm0VuSvo77NaNNQL0Oj4iBzhVX7HFn9NVRSwW9COlikHlTGwNgn7cJ8yG77H_WZxQj-LqIoKEVZ3DKAFJX5KPMJcPCqw4L3cJu466-NVMSdwkVCogvI3-D7--5W5K1kQrM6PxVUYwbUWtCPwfiJY")`
              }}
            ></div>
            
            {/* Sticky Note */}
            <div className="absolute -bottom-8 -right-8 w-52 transform rotate-6 bg-gradient-to-br from-yellow-200 to-amber-200 p-4 rounded-xl shadow-lg border-2 border-amber-300">
              <div className="absolute top-1 right-1 text-xl">📌</div>
              <p 
                className="text-base font-bold text-amber-900 font-work"
              >
                "This AI is a game-changer!"
              </p>
              <p 
                className="text-xs text-amber-700 mt-1 font-medium font-noto"
              >
                - Happy User 🚀
              </p>
            </div>
          </div>
        </div>

        {/* Steps Section */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 
              className="text-3xl font-bold tracking-tight text-amber-900 font-work"
            >
              Create Magic in 3 Simple Steps
            </h2>
            <p 
              className="text-base text-amber-700 mt-2 font-medium font-noto"
            >
              Our AI-powered tool makes crafting effective cold emails a breeze.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 shadow-lg border-2 border-blue-300 transform hover:scale-105 transition-transform duration-300">
              <div className="text-4xl mb-3">✍️</div>
              <h3 
                className="text-lg font-bold text-blue-900 mb-2 font-work"
              >
                1. Write Your Prompt
              </h3>
              <p 
                className="text-sm text-blue-800 font-medium font-roboto"
              >
                Input your goal and let our AI generate a personalized email draft.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-200 shadow-lg border-2 border-green-300 transform hover:scale-105 transition-transform duration-300">
              <div className="text-4xl mb-3">📎</div>
              <h3 
                className="text-lg font-bold text-green-900 mb-2 font-work"
              >
                2. Add Context
              </h3>
              <p 
                className="text-sm text-green-800 font-medium font-roboto"
              >
                Upload files and images to provide crucial context to the AI.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-to-br from-yellow-100 to-amber-200 shadow-lg border-2 border-yellow-300 transform hover:scale-105 transition-transform duration-300">
              <div className="text-4xl mb-3">🚀</div>
              <h3 
                className="text-lg font-bold text-yellow-900 mb-2 font-work"
              >
                3. Send & Convert
              </h3>
              <p 
                className="text-sm text-yellow-800 font-medium font-roboto"
              >
                Launch your campaigns and watch your conversion rates soar.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-br from-white to-amber-50 rounded-2xl p-12 shadow-xl border-2 border-amber-200">
          <div className="max-w-xl mx-auto">
            <h2 
              className="text-3xl font-bold tracking-tight text-amber-900 font-work"
            >
              Ready to Transform Your Outreach?
            </h2>
            <p 
              className="text-base text-amber-700 mt-3 mb-6 font-medium font-noto"
            >
              Start your free trial today and experience the power of AI-driven email creation. No credit card required.
            </p>
            <button 
              onClick={handleStartGenerating}
              className="flex mx-auto min-w-[160px] items-center justify-center h-14 px-8 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:from-amber-500 hover:to-orange-600 font-work"
            >
              <span>{user ? 'Start Generating' : 'Sign In to Start'}</span>
            </button>
          </div>
        </section>
      </div>
    </section>
  );
};

export default Hero;
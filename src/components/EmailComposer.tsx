import React, { useState } from 'react';
import { Send, Paperclip, Image, Sparkles, Wand2, Copy, Download, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const EmailComposer: React.FC = () => {
  const { user, userTokens, useToken } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showAuthRequired, setShowAuthRequired] = useState(false);

  const handleGenerate = async () => {
    if (!user) {
      setShowAuthRequired(true);
      return;
    }

    if (!userTokens || userTokens.tokens <= 0) {
      alert('You have no tokens left. Please purchase more tokens to continue.');
      return;
    }

    if (!prompt.trim()) return;
    
    const tokenUsed = await useToken();
    if (!tokenUsed) {
      alert('Failed to use token. Please try again.');
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const sampleEmail = `Subject: Quick question about ${prompt.split(' ')[0]}

Hi [Name],

I hope this email finds you well. I came across your work at [Company] and was impressed by your approach to ${prompt.toLowerCase()}.

I'm reaching out because I believe there's a potential synergy between what you're doing and what we're building. Our solution has helped companies like yours achieve remarkable results, and I'd love to share how it might benefit your team.

Would you be open to a brief 15-minute call this week to explore this further?

Best regards,
[Your Name]

P.S. I've attached some relevant case studies that might interest you.`;

    setGeneratedEmail(sampleEmail);
    setIsGenerating(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12">
      <div className="max-w-5xl mx-auto px-4 lg:px-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 
            className="text-3xl font-bold text-amber-900 mb-3"
          >
            AI Email Composer
          </h2>
          <p 
            className="text-base text-amber-700 max-w-xl mx-auto font-medium"
          >
            Tell us about your goal, upload relevant files, and let our AI craft the perfect cold email for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-5">
            <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl p-5 shadow-lg border-2 border-amber-200">
              <div className="flex items-center space-x-2 mb-3">
                <Wand2 className="w-4 h-4 text-amber-600" />
                <h3 
                  className="text-base font-bold text-amber-900"
                >
                  Describe Your Goal
                </h3>
              </div>
              
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: I want to reach out to SaaS founders to offer our design services. My target is companies with 10-50 employees who might need help with their user interface..."
                className="w-full h-28 p-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none bg-white/80 text-sm font-semibold text-amber-900"
              />
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center space-x-2 px-3 py-2 bg-white/80 text-amber-700 rounded-xl hover:bg-amber-100 transition-colors cursor-pointer border-2 border-amber-200 shadow-md text-xs font-bold transform hover:scale-105"
                  >
                    <Paperclip className="w-3 h-3" />
                    <span>Attach Files</span>
                  </label>
                  
                  <label
                    htmlFor="file-upload"
                    className="flex items-center space-x-2 px-3 py-2 bg-white/80 text-amber-700 rounded-xl hover:bg-amber-100 transition-colors cursor-pointer border-2 border-amber-200 shadow-md text-xs font-bold transform hover:scale-105"
                  >
                    <Image className="w-3 h-3" />
                    <span>Add Images</span>
                  </label>
                </div>
                
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-black transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 text-sm ${
                    !user || !userTokens || userTokens.tokens <= 0
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : !user ? (
                    <>
                      <Sparkles className="w-3 h-3" />
                      <span>Sign In Required</span>
                    </>
                  ) : !userTokens || userTokens.tokens <= 0 ? (
                    <>
                      <Sparkles className="w-3 h-3" />
                      <span>No Tokens Left</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      <span>Generate Email</span>
                    </>
                  )}
                </button>
              </div>
              
              {!user && (
                <div className="mt-3 p-3 bg-amber-100/50 rounded-xl border border-amber-200">
                  <p className="text-xs text-amber-800 font-medium">
                    Please sign in to generate emails. Free tier includes 5 generations!
                  </p>
                </div>
              )}
              
              {user && userTokens && userTokens.tokens <= 0 && (
                <div className="mt-3 p-3 bg-red-100/50 rounded-xl border border-red-200">
                  <p className="text-xs text-red-800 font-medium">
                    You've used all your tokens. Purchase more to continue generating emails.
                  </p>
                </div>
              )}
            </div>

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl p-5 shadow-lg border-2 border-amber-200">
                <h3 
                  className="text-base font-bold text-amber-900 mb-3"
                >
                  Attachments
                </h3>
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-amber-100/50 rounded-xl border border-amber-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-amber-200 rounded-lg flex items-center justify-center">
                          <Paperclip className="w-3 h-3 text-amber-600" />
                        </div>
                        <div>
                          <p 
                            className="font-bold text-amber-900 text-sm"
                          >
                            {file.name}
                          </p>
                          <p 
                            className="text-xs text-amber-700 font-medium"
                          >
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="space-y-5">
            <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl p-5 shadow-lg border-2 border-amber-200 min-h-[350px]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4 text-green-600" />
                  <h3 
                    className="text-base font-bold text-amber-900"
                  >
                    Generated Email
                  </h3>
                </div>
                
                {generatedEmail && (
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-amber-600 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition-colors">
                      <Copy className="w-3 h-3" />
                    </button>
                    <button className="p-2 text-amber-600 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition-colors">
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              
              {generatedEmail ? (
                <div className="space-y-3">
                  <div className="bg-amber-100/50 rounded-xl p-3 shadow-inner border border-amber-200">
                    <pre 
                      className="whitespace-pre-wrap text-xs text-amber-900 font-medium"
                    >
                      {generatedEmail}
                    </pre>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      className="flex items-center space-x-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-2 rounded-xl font-bold hover:from-amber-500 hover:to-orange-600 transition-colors text-xs transform hover:scale-105"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Email</span>
                    </button>
                    
                    <button 
                      onClick={handleGenerate}
                      disabled={!user || !userTokens || userTokens.tokens <= 0}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-bold transition-colors text-xs transform hover:scale-105 ${
                        !user || !userTokens || userTokens.tokens <= 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-400 text-white hover:bg-gray-500'
                      }`}
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-56 text-amber-600">
                  <div className="text-center">
                    <Sparkles className="w-10 h-10 mx-auto mb-3 text-amber-300" />
                    <p 
                      className="font-medium"
                    >
                      Your generated email will appear here
                    </p>
                    <p 
                      className="text-xs mt-2 font-medium"
                    >
                      Describe your goal and click "Generate Email" to get started
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailComposer;
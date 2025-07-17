import React, { useState } from 'react';
import { Upload, FileText, User, Sparkles, X, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { generateUserDetails } from '../lib/gemini';

interface UserOnboardingProps {
  onComplete: () => void;
}

const UserOnboarding: React.FC<UserOnboardingProps> = ({ onComplete }) => {
  const { user, createUserProfile } = useAuth();
  const [inputText, setInputText] = useState('');
  const [documents, setDocuments] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setDocuments([...documents, ...files]);
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    if (!inputText.trim() && documents.length === 0) {
      setError('Please provide some information about yourself or upload documents.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Generate user details summary using Gemini
      let userDetails = '';
      if (inputText.trim()) {
        const documentContext = documents.length > 0 
          ? `User has uploaded ${documents.length} document(s): ${documents.map(f => f.name).join(', ')}.`
          : '';
        
        userDetails = await generateUserDetails(inputText, documentContext);
      }

      // Create user profile
      const { error: profileError } = await createUserProfile({
        inputText: inputText.trim(),
        userDetails,
        documents: documents.map(doc => ({
          name: doc.name,
          type: doc.type,
          size: doc.size
        }))
      });

      if (profileError) {
        setError(profileError.message);
        return;
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-2xl border-2 border-amber-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-amber-900 mb-2 font-work">
              Tell Us About Yourself
            </h2>
            <p className="text-amber-700 font-medium font-noto">
              Share your background and upload relevant documents to help our AI generate better, more personalized cold emails for you.
            </p>
          </div>

          {/* Input Section */}
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-bold text-amber-900 mb-3 font-work">
                About You
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tell us about yourself, your profession, experience, skills, achievements, and what kind of cold emails you want to send. For example: 'I'm a full-stack developer with 5 years of experience in React and Node.js. I've worked at startups and built several SaaS products. I want to reach out to potential clients for freelance web development projects...'"
                className="w-full h-40 p-4 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none bg-white/80 text-amber-900 font-roboto"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-lg font-bold text-amber-900 mb-3 font-work">
                Upload Documents (Optional)
              </label>
              <div className="border-2 border-dashed border-amber-300 rounded-xl p-6 text-center bg-amber-50/50">
                <input
                  type="file"
                  id="document-upload"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="document-upload"
                  className="cursor-pointer flex flex-col items-center space-y-3"
                >
                  <Upload className="w-12 h-12 text-amber-400" />
                  <div>
                    <p className="text-amber-900 font-bold font-work">
                      Upload Resume, Portfolio, or Other Documents
                    </p>
                    <p className="text-sm text-amber-700 font-medium font-roboto">
                      PDF, DOC, DOCX, TXT files supported
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Uploaded Documents */}
            {documents.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-amber-900 mb-3 font-work">
                  Uploaded Documents
                </h3>
                <div className="space-y-2">
                  {documents.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white/80 rounded-xl border-2 border-amber-200 shadow-sm"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-amber-600" />
                        <div>
                          <p className="font-bold text-amber-900 font-work">
                            {file.name}
                          </p>
                          <p className="text-sm text-amber-700 font-medium font-roboto">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeDocument(index)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-100/50 rounded-xl border border-red-200">
                <p className="text-red-800 font-medium font-roboto">
                  {error}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={handleSkip}
                className="px-6 py-3 text-amber-700 hover:text-amber-900 font-bold transition-colors font-work"
              >
                Skip for now
              </button>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-bold hover:from-amber-500 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 font-work"
                >
                  {isProcessing ? (
                    <>
                      <Sparkles className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Complete Setup</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOnboarding;
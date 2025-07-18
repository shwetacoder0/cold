import React from 'react';
import { Mail, Sparkles, BookTemplate as Template, PenTool, LogOut, User, ChevronDown, Edit3, FileText, Trash2, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

interface HeaderProps {
  activeSection: 'templates' | 'compose' | 'pricing';
  setActiveSection: (section: 'templates' | 'compose' | 'pricing') => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, setActiveSection }) => {
  const { user, userTokens, userProfile, signOut, updateUserProfile, getUserDocuments, deleteUserDocument } = useAuth();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<'signin' | 'signup'>('signin');
  const [showProfileDropdown, setShowProfileDropdown] = React.useState(false);
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [editText, setEditText] = React.useState('');
  const [documents, setDocuments] = React.useState<any[]>([]);
  const [updating, setUpdating] = React.useState(false);

  const handleSignOut = () => signOut();

  React.useEffect(() => {
    if (showProfileDropdown && user) {
      loadUserDocuments();
      setEditText(userProfile?.input_text || '');
    }
  }, [showProfileDropdown, user, userProfile]);

  const loadUserDocuments = async () => {
    if (!user) return;
    const docs = await getUserDocuments();
    setDocuments(docs || []);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setUpdating(true);
    try {
      const { error } = await updateUserProfile(editText);
      if (error) {
        alert('Error updating profile: ' + error.message);
      } else {
        setIsEditingProfile(false);
      }
    } catch (error) {
      alert('Error updating profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      const { error } = await deleteUserDocument(documentId);
      if (error) {
        alert('Error deleting document: ' + error.message);
      } else {
        setDocuments(documents.filter(doc => doc.id !== documentId));
      }
    } catch (error) {
      alert('Error deleting document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
                <div className="flex items-center space-x-3 relative">
                  <div className="flex items-center space-x-2 bg-white/80 px-3 py-2 rounded-full border border-amber-200/50 shadow-md">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-amber-900 font-noto">
                      {userTokens?.tokens || 0} tokens
                    </span>
                  </div>
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-3 bg-white/80 px-3 py-2 rounded-full border border-amber-200/50 shadow-md hover:bg-white transition-colors"
                  >
                    {user.user_metadata?.avatar_url ? (
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt="Profile"
                        className="w-6 h-6 rounded-full border border-amber-200"
                      />
                    ) : (
                      <User className="w-4 h-4 text-amber-600" />
                    )}
                    <span className="text-sm font-semibold text-amber-900 font-noto">
                      {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="w-4 h-4 text-amber-600" />
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border-2 border-amber-200 z-50 max-h-96 overflow-y-auto">
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-amber-900 font-work">Your Profile</h3>
                          <button
                            onClick={() => setShowProfileDropdown(false)}
                            className="p-1 text-amber-600 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Profile Information */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-amber-900 font-work">About You</h4>
                            {!isEditingProfile && (
                              <button
                                onClick={() => setIsEditingProfile(true)}
                                className="flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-xs font-bold"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                            )}
                          </div>

                          {isEditingProfile ? (
                            <div className="space-y-3">
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full h-24 p-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none bg-white text-amber-900 text-xs"
                                placeholder="Tell us about yourself..."
                              />
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={handleSaveProfile}
                                  disabled={updating}
                                  className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs font-bold disabled:opacity-50"
                                >
                                  <Save className="w-3 h-3" />
                                  <span>{updating ? 'Saving...' : 'Save'}</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setIsEditingProfile(false);
                                    setEditText(userProfile?.input_text || '');
                                  }}
                                  className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-bold"
                                >
                                  <X className="w-3 h-3" />
                                  <span>Cancel</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              {userProfile?.input_text ? (
                                <div className="space-y-2">
                                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                                    <p className="text-xs text-amber-800 whitespace-pre-wrap">
                                      {userProfile.input_text.length > 150 
                                        ? userProfile.input_text.substring(0, 150) + '...' 
                                        : userProfile.input_text}
                                    </p>
                                  </div>
                                  {userProfile.user_details && (
                                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                      <h5 className="font-bold text-blue-900 mb-1 text-xs">AI Summary:</h5>
                                      <p className="text-xs text-blue-800">
                                        {userProfile.user_details.length > 100 
                                          ? userProfile.user_details.substring(0, 100) + '...' 
                                          : userProfile.user_details}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-amber-600 italic">No profile information added yet.</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Documents */}
                        <div>
                          <h4 className="font-bold text-amber-900 mb-3 font-work">Documents ({documents.length})</h4>
                          {documents.length > 0 ? (
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {documents.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="flex items-center justify-between p-2 bg-amber-50 rounded-lg border border-amber-200"
                                >
                                  <div className="flex items-center space-x-2">
                                    <FileText className="w-3 h-3 text-amber-600" />
                                    <div>
                                      <p className="font-bold text-amber-900 text-xs">
                                        {doc.document_name.length > 20 
                                          ? doc.document_name.substring(0, 20) + '...' 
                                          : doc.document_name}
                                      </p>
                                      <p className="text-xs text-amber-700">
                                        {formatFileSize(doc.file_size)}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteDocument(doc.id)}
                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-amber-600 italic">No documents uploaded.</p>
                          )}
                        </div>

                        {/* Sign Out Button */}
                        <div className="mt-4 pt-4 border-t border-amber-200">
                          <button
                            onClick={() => {
                              handleSignOut();
                              setShowProfileDropdown(false);
                            }}
                            className="w-full flex items-center justify-center space-x-2 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm font-bold"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

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
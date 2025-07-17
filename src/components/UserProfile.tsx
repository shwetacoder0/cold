import React, { useState, useEffect } from 'react';
import { User, FileText, Edit3, Trash2, Upload, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserDocument {
  id: string;
  document_name: string;
  document_type: string;
  file_size: number;
  created_at: string;
}

interface UserProfileData {
  input_text: string;
  user_details: string;
  updated_at: string;
}

const UserProfile: React.FC = () => {
  const { user, getUserProfile, updateUserProfile, getUserDocuments, deleteUserDocument } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [profileData, documentsData] = await Promise.all([
        getUserProfile(),
        getUserDocuments()
      ]);
      
      setProfile(profileData);
      setDocuments(documentsData || []);
      setEditText(profileData?.input_text || '');
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setUpdating(true);
    try {
      const { error } = await updateUserProfile(editText);
      if (error) {
        alert('Error updating profile: ' + error.message);
      } else {
        await loadUserData();
        setIsEditing(false);
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

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-amber-700 font-medium">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-amber-900 mb-2 font-work">
            Your Profile
          </h2>
          <p className="text-amber-700 font-medium font-noto">
            Manage your information and documents for better email generation
          </p>
        </div>

        {/* Profile Information */}
        <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl p-6 shadow-lg border-2 border-amber-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-amber-900 font-work">
              About You
            </h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors font-bold font-work"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full h-40 p-4 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none bg-white/80 text-amber-900 font-roboto"
                placeholder="Tell us about yourself..."
              />
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSave}
                  disabled={updating}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-lg hover:from-green-500 hover:to-green-600 transition-colors font-bold disabled:opacity-50 font-work"
                >
                  <Save className="w-4 h-4" />
                  <span>{updating ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(profile?.input_text || '');
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-bold font-work"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              {profile?.input_text ? (
                <div className="space-y-4">
                  <div className="bg-amber-100/50 rounded-xl p-4 border border-amber-200">
                    <h4 className="font-bold text-amber-900 mb-2 font-work">Your Information:</h4>
                    <p className="text-amber-800 whitespace-pre-wrap font-roboto">
                      {profile.input_text}
                    </p>
                  </div>
                  {profile.user_details && (
                    <div className="bg-blue-100/50 rounded-xl p-4 border border-blue-200">
                      <h4 className="font-bold text-blue-900 mb-2 font-work">AI Summary:</h4>
                      <p className="text-blue-800 whitespace-pre-wrap font-roboto">
                        {profile.user_details}
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-amber-600 font-medium font-roboto">
                    Last updated: {formatDate(profile.updated_at)}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-amber-600 font-medium font-roboto">
                    No profile information added yet. Click "Edit" to add your information.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl p-6 shadow-lg border-2 border-amber-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-amber-900 font-work">
              Your Documents
            </h3>
          </div>

          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-white/80 rounded-xl border-2 border-amber-200 shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-bold text-amber-900 font-work">
                        {doc.document_name}
                      </p>
                      <p className="text-sm text-amber-700 font-medium font-roboto">
                        {formatFileSize(doc.file_size)} • Uploaded {formatDate(doc.created_at)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Upload className="w-12 h-12 text-amber-300 mx-auto mb-3" />
              <p className="text-amber-600 font-medium font-roboto">
                No documents uploaded yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
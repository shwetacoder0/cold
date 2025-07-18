import React from 'react';
import { X, Copy, Heart, Eye, Sparkles } from 'lucide-react';
import { Template, TemplateModalProps } from '../types/template';

const TemplateModal: React.FC<TemplateModalProps> = ({ template, isOpen, onClose, onUseTemplate }) => {
  if (!isOpen || !template) return null;

  const handleUseTemplate = () => {
    onUseTemplate(template);
    onClose();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Template copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy template');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-2xl border-2 border-amber-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div 
                className="w-16 h-16 rounded-xl bg-cover bg-center border-2 border-amber-200"
                style={{ backgroundImage: `url("${template.image}")` }}
              ></div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h2 className="text-2xl font-bold text-amber-900 font-work">
                    {template.title}
                  </h2>
                  {template.featured && (
                    <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-1 rounded-full text-xs font-black border border-yellow-500">
                      <Sparkles className="w-3 h-3" />
                      <span>Featured</span>
                    </div>
                  )}
                </div>
                <p className="text-amber-700 font-medium font-noto mb-2">
                  {template.description}
                </p>
                <div className="flex items-center space-x-4 text-sm text-amber-600 font-semibold">
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{template.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{template.views}</span>
                  </div>
                  <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-bold">
                    {template.category}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-amber-600 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Template Content */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-amber-900 mb-4 font-work">
              Template Content
            </h3>
            <div className="bg-amber-50/50 rounded-xl p-6 border-2 border-amber-200">
              <pre className="whitespace-pre-wrap text-sm text-amber-900 font-medium font-roboto leading-relaxed">
                {template.fullContent}
              </pre>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => copyToClipboard(template.fullContent)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/80 text-amber-700 rounded-xl hover:bg-amber-100 transition-colors border-2 border-amber-200 shadow-md font-bold transform hover:scale-105"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Template</span>
            </button>
            
            <button
              onClick={handleUseTemplate}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-bold hover:from-amber-500 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-work"
            >
              <Sparkles className="w-5 h-5" />
              <span>Use This Template</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;
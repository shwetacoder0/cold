import React, { useState } from 'react';
import { Search, Filter, Copy, Heart, Eye, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Template {
  id: string;
  title: string;
  category: string;
  description: string;
  preview: string;
  likes: number;
  views: number;
  featured: boolean;
  image: string;
}

interface TemplateWallProps {
  onUseTemplate: () => void;
}

const templates: Template[] = [
  {
    id: '1',
    title: 'Sales Outreach',
    category: 'Sales',
    description: 'Reach out to potential clients with a compelling sales pitch.',
    preview: 'Hi {{name}},\n\nI noticed you\'re building amazing things at {{company}}. We just launched a tool that could save your team 10+ hours per week...',
    likes: 234,
    views: 1200,
    featured: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXzoIa7-l-YPotKo0hrAZrdEPNVAVAfRYkChzYgdU1qMRsWSEcozMrSi3-C434aCLw_O2_-YuQ25k1Aqq9A1CZ6OB-J_3ojlBhMeIpkiDYs6WH2j307oW41muxDCjswYvhK2muLg7lBRyR7jf8sqPz3ioysx0yIfIzua-Hgd3eKvxaAi5OmvYIPeL8zkVghjDZlP9Q-6WhJzZ93IK9q4dZqSmOFb7aVZyaURkLpQwLeCZ2nTqNofSwyXs3mn6QuIUNOnF2r5wVzfQ'
  },
  {
    id: '2',
    title: 'Follow-Up',
    category: 'Follow-up',
    description: 'Keep the conversation going with a well-timed follow-up.',
    preview: 'Hello {{name}},\n\nYour work with {{company}} in {{industry}} caught my attention. I believe there\'s a perfect synergy between our services...',
    likes: 189,
    views: 890,
    featured: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrrYk4y2tL6pruVjfJ9RQ_SjD-YLj-rCp993GANRm9qs876hubPZQ1TS2OXi-doyo9nDJpC5ZkFhPKtuRoSocOid32KYLogq8HL8ShHraM6Hk_h2GcQSItBG8Y3WdhMp-XM5CqYXJsXF2bY7dOpDhc7FO5nf96eCFMLCh2rUdegruR7NyutOvvZpdhHkprGH2OgHOefryAXOSH6ImKgPxwk2Wu_r_AG1nwil2Dgstavk0nAxhClnKaFzkhqNREC851ceZz7RNK-SA'
  },
  {
    id: '3',
    title: 'Introduction',
    category: 'Introduction',
    description: 'Introduce yourself and your company to new contacts.',
    preview: 'Hey {{name}},\n\nI\'ve been following your content on {{platform}} and absolutely love your take on {{topic}}. Would you be interested in collaborating...',
    likes: 156,
    views: 730,
    featured: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTPLEItEBk2V6TMMkBIuGnGz_CkG44vg_g24eF1uRGvVj8DHGixYirbr4g3FhnGjYQx0THRhgMM-u7pIdrssQhxrgMKz4l1hC6kUdMKhTzRiVyhwd4ORRFQr3h3lwSIXpExswZB0aLJZRPqZzIdwy2pXmTQ8xd_lkPIXmlNr6T0FP7n0WnmeN_ZBr3Qlvh5y9OvIhu6qM-Qda5Z5YOoAiIS8q7TvIKQPQRnA0Yqh91p7SLkAJ3wtLJ5qSKg6rPsLSw6kdvpsL29Ks'
  },
  {
    id: '4',
    title: 'Partnership Proposal',
    category: 'Partnership',
    description: 'High-converting template for partnership opportunities',
    preview: 'Hi {{name}},\n\nI see {{company}} has been growing rapidly in the {{industry}} space. Most companies your size struggle with {{pain_point}}...',
    likes: 298,
    views: 1540,
    featured: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrrYk4y2tL6pruVjfJ9RQ_SjD-YLj-rCp993GANRm9qs876hubPZQ1TS2OXi-doyo9nDJpC5ZkFhPKtuRoSocOid32KYLogq8HL8ShHraM6Hk_h2GcQSItBG8Y3WdhMp-XM5CqYXJsXF2bY7dOpDhc7FO5nf96eCFMLCh2rUdegruR7NyutOvvZpdhHkprGH2OgHOefryAXOSH6ImKgPxwk2Wu_r_AG1nwil2Dgstavk0nAxhClnKaFzkhqNREC851ceZz7RNK-SA'
  },
  {
    id: '5',
    title: 'Content Collaboration',
    category: 'Content',
    description: 'Perfect for content creators and influencers',
    preview: 'Hello {{name}},\n\nYour recent project at {{company}} looks fantastic! I specialize in {{service}} and have helped similar companies achieve...',
    likes: 167,
    views: 820,
    featured: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrrYk4y2tL6pruVjfJ9RQ_SjD-YLj-rCp993GANRm9qs876hubPZQ1TS2OXi-doyo9nDJpC5ZkFhPKtuRoSocOid32KYLogq8HL8ShHraM6Hk_h2GcQSItBG8Y3WdhMp-XM5CqYXJsXF2bY7dOpDhc7FO5nf96eCFMLCh2rUdegruR7NyutOvvZpdhHkprGH2OgHOefryAXOSH6ImKgPxwk2Wu_r_AG1nwil2Dgstavk0nAxhClnKaFzkhqNREC851ceZz7RNK-SA'
  },
  {
    id: '6',
    title: 'Investment Pitch',
    category: 'Investment',
    description: 'Reach out to potential investors',
    preview: 'Dear {{name}},\n\nI\'ve been following your investment portfolio and noticed your interest in {{sector}}. Our startup is solving a major problem...',
    likes: 203,
    views: 970,
    featured: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrrYk4y2tL6pruVjfJ9RQ_SjD-YLj-rCp993GANRm9qs876hubPZQ1TS2OXi-doyo9nDJpC5ZkFhPKtuRoSocOid32KYLogq8HL8ShHraM6Hk_h2GcQSItBG8Y3WdhMp-XM5CqYXJsXF2bY7dOpDhc7FO5nf96eCFMLCh2rUdegruR7NyutOvvZpdhHkprGH2OgHOefryAXOSH6ImKgPxwk2Wu_r_AG1nwil2Dgstavk0nAxhClnKaFzkhqNREC851ceZz7RNK-SA'
  }
];

const categories = ['All', 'Sales', 'Follow-up', 'Introduction', 'Partnership', 'Content', 'Investment'];

const TemplateWall: React.FC<TemplateWallProps> = ({ onUseTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  const handleUseTemplate = () => {
    if (!user) {
      alert('Please sign in to use templates!');
      return;
    }
    onUseTemplate();
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 
            className="text-3xl font-bold tracking-tight text-amber-900 mb-3"
          >
            Explore Our Template Wall
          </h2>
          <p 
            className="text-base text-amber-700 max-w-xl mx-auto font-medium"
          >
            Get inspired by a collection of proven templates for any situation.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-10">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-4 h-4" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white/80 shadow-md text-sm font-semibold text-amber-900"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-amber-600" />
            <div className="flex space-x-2 overflow-x-auto">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-2 rounded-xl font-bold transition-all duration-200 whitespace-nowrap text-xs transform hover:scale-105 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg'
                      : 'bg-white/80 text-amber-700 hover:bg-amber-100 border-2 border-amber-200 shadow-md'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Template Grid */}
        <div className="flex gap-6 -mx-2 px-2 pb-6 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className="flex-shrink-0 w-72 flex flex-col gap-3 rounded-xl p-5 bg-gradient-to-br from-white to-amber-50 shadow-lg border-2 border-amber-200 transition-transform duration-300 hover:-translate-y-2 relative transform hover:scale-105"
            >
              {template.featured && (
                <div className="absolute top-3 right-3 flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-1 rounded-full text-xs font-black border border-yellow-500">
                  <Sparkles className="w-3 h-3" />
                  <span>Featured</span>
                </div>
              )}
              
              <div 
                className="w-full aspect-video rounded-lg bg-cover bg-center border-2 border-amber-200"
                style={{ backgroundImage: `url("${template.image}")` }}
              ></div>
              
              <div>
                <h3 
                  className="text-base font-bold text-amber-900 mb-1"
                >
                  {template.title}
                </h3>
                <p 
                  className="text-xs text-amber-700 font-medium"
                >
                  {template.description}
                </p>
              </div>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center space-x-3 text-xs text-amber-600 font-semibold">
                  <div className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>{template.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{template.views}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-amber-600 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition-colors">
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={handleUseTemplate}
                    className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-lg font-bold hover:from-amber-500 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg text-xs transform hover:scale-105"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateWall;
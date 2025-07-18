import React, { useState } from 'react';
import { Search, Filter, Copy, Heart, Eye, Sparkles, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Template } from '../types/template';
import TemplateModal from './TemplateModal';

interface TemplateWallProps {
  onUseTemplate: (template: Template) => void;
  onShowAuth: () => void;
}

const templates: Template[] = [
  {
    id: '1',
    title: 'Sales Outreach',
    category: 'Sales',
    description: 'Reach out to potential clients with a compelling sales pitch.',
    preview: 'Hi {{name}},\n\nI noticed you\'re building amazing things at {{company}}. We just launched a tool that could save your team 10+ hours per week...',
    fullContent: `Subject: Quick question about {{company}}'s growth

Hi {{name}},

I noticed you're building amazing things at {{company}}. We just launched a tool that could save your team 10+ hours per week on {{specific_task}}.

Companies like {{similar_company}} have seen:
• 40% faster {{process}}
• 60% reduction in manual work
• ${{amount}} saved monthly

Would you be open to a 15-minute call this week to see if this could help {{company}} scale faster?

Best regards,
{{your_name}}
{{your_title}}
{{your_company}}`,
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
    fullContent: `Subject: Following up on our conversation

Hello {{name}},

I hope this email finds you well. I wanted to follow up on our previous conversation about {{topic}}.

Since we last spoke, I've been thinking about how {{your_solution}} could specifically help {{company}} with {{their_challenge}}.

I've attached a case study showing how we helped {{similar_company}} achieve {{specific_result}} in just {{timeframe}}.

Would you have 10 minutes this week for a quick call to discuss next steps?

Looking forward to hearing from you.

Best,
{{your_name}}`,
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
    fullContent: `Subject: Love your work on {{topic}} - quick collaboration idea

Hey {{name}},

I've been following your content on {{platform}} and absolutely love your take on {{topic}}. Your recent post about {{specific_post}} really resonated with me.

I'm {{your_name}}, {{your_title}} at {{your_company}}. We specialize in {{your_expertise}} and have helped companies like {{client_example}} achieve {{result}}.

I have an idea for a potential collaboration that could benefit both our audiences. Would you be interested in a brief 15-minute chat to explore this?

No pressure at all - just thought there might be some interesting synergies worth discussing.

Cheers,
{{your_name}}
{{your_contact}}`,
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
    fullContent: `Subject: Partnership opportunity for {{company}}

Hi {{name}},

I see {{company}} has been growing rapidly in the {{industry}} space. Congratulations on {{recent_achievement}}!

Most companies your size struggle with {{pain_point}}, which is exactly what we solve at {{your_company}}.

We've partnered with companies like {{partner_example}} to help them:
• {{benefit_1}}
• {{benefit_2}}
• {{benefit_3}}

I'd love to explore a potential partnership that could drive mutual growth. Are you available for a 20-minute call next week?

Best regards,
{{your_name}}
{{your_title}}, {{your_company}}`,
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
    fullContent: `Subject: Content collaboration idea for {{platform}}

Hello {{name}},

Your recent content about {{topic}} on {{platform}} was incredibly insightful! I especially loved your point about {{specific_point}}.

I'm {{your_name}}, and I create content around {{your_niche}}. I have {{follower_count}} followers who would absolutely love your expertise.

I'd love to collaborate on:
• Joint webinar/podcast episode
• Guest post exchange
• Social media takeover
• {{custom_idea}}

Would you be interested in exploring this? I'm happy to share some content ideas that could work well for both our audiences.

Looking forward to potentially working together!

{{your_name}}
{{your_social_handles}}`,
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
    fullContent: `Subject: {{company_name}} - {{sector}} investment opportunity

Dear {{name}},

I've been following your investment portfolio and noticed your interest in {{sector}} companies, particularly your investment in {{portfolio_company}}.

Our startup, {{company_name}}, is solving a major problem in this space: {{problem_statement}}.

Key highlights:
• {{traction_metric}} in {{timeframe}}
• {{revenue_growth}} revenue growth
• {{team_background}} founding team
• {{market_size}} addressable market

We're raising a {{round_size}} Series {{round_letter}} to {{use_of_funds}}.

Would you be interested in learning more? I'd love to send over our pitch deck and arrange a brief call.

Best regards,
{{founder_name}}
Founder & CEO, {{company_name}}
{{contact_info}}`,
    likes: 203,
    views: 970,
    featured: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrrYk4y2tL6pruVjfJ9RQ_SjD-YLj-rCp993GANRm9qs876hubPZQ1TS2OXi-doyo9nDJpC5ZkFhPKtuRoSocOid32KYLogq8HL8ShHraM6Hk_h2GcQSItBG8Y3WdhMp-XM5CqYXJsXF2bY7dOpDhc7FO5nf96eCFMLCh2rUdegruR7NyutOvvZpdhHkprGH2OgHOefryAXOSH6ImKgPxwk2Wu_r_AG1nwil2Dgstavk0nAxhClnKaFzkhqNREC851ceZz7RNK-SA'
  }
];

const categories = ['All', 'Sales', 'Follow-up', 'Introduction', 'Partnership', 'Content', 'Investment'];

const TemplateWall: React.FC<TemplateWallProps> = ({ onUseTemplate, onShowAuth }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const { user } = useAuth();

  const handleUseTemplate = (template: Template) => {
    if (!user) {
      onShowAuth();
      return;
    }
    onUseTemplate(template);
  };

  const handleViewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const handleCloseModal = () => {
    setShowTemplateModal(false);
    setSelectedTemplate(null);
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
                onClick={() => handleViewTemplate(template)}
                role="button"
                tabIndex={0}
                className="w-full aspect-video rounded-lg bg-cover bg-center border-2 border-amber-200 cursor-pointer hover:border-amber-300 transition-colors"
              ></div>
              
              <div onClick={() => handleViewTemplate(template)} className="cursor-pointer">
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
                    onClick={() => handleViewTemplate(template)}
                    className="p-2 text-amber-600 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-lg font-bold hover:from-amber-500 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg text-xs transform hover:scale-105"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <TemplateModal
          template={selectedTemplate}
          isOpen={showTemplateModal}
          onClose={handleCloseModal}
          onUseTemplate={handleUseTemplate}
        />
      </div>
    </div>
  );
};

export default TemplateWall;
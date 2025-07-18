export interface Template {
  id: string;
  title: string;
  category: string;
  description: string;
  preview: string;
  fullContent: string;
  likes: number;
  views: number;
  featured: boolean;
  image: string;
}

export interface TemplateModalProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (template: Template) => void;
}
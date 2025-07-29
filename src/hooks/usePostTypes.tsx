import { MessageSquare, HelpCircle, Lightbulb, Megaphone, BookOpen, Image } from 'lucide-react';

export interface PostType {
  value: string;
  label: string;
  description: string;
  color: string;
  icon: any;
}

export const POST_TYPES: PostType[] = [
  {
    value: 'discussion',
    label: 'Discussion',
    description: 'General discussions and conversations',
    color: '#10b981',
    icon: MessageSquare
  },
  {
    value: 'question',
    label: 'Question',
    description: 'Questions and help requests',
    color: '#3b82f6',
    icon: HelpCircle
  },
  {
    value: 'idea',
    label: 'Idea',
    description: 'Feature suggestions and ideas',
    color: '#f59e0b',
    icon: Lightbulb
  },
  {
    value: 'announcement',
    label: 'Announcement',
    description: 'Official announcements and news',
    color: '#8b5cf6',
    icon: Megaphone
  },
  {
    value: 'guide',
    label: 'Guide',
    description: 'Tutorials, guides, and how-tos',
    color: '#06b6d4',
    icon: BookOpen
  },
  {
    value: 'showcase',
    label: 'Showcase',
    description: 'Player creations and showcases',
    color: '#ec4899',
    icon: Image
  }
];

export const usePostTypes = () => {
  const getPostType = (value: string): PostType | undefined => {
    return POST_TYPES.find(type => type.value === value);
  };

  const getAllPostTypes = (): PostType[] => {
    return POST_TYPES;
  };

  return {
    getPostType,
    getAllPostTypes,
    postTypes: POST_TYPES
  };
}; 
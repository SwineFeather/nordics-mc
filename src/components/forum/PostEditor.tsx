import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PostEditorProps {
  onSubmit: (title: string, content: string, tags: string[], postType: string) => void;
  onCancel: () => void;
  initialTitle?: string;
  initialContent?: string;
  initialTags?: string[];
  initialPostType?: string;
  isEditing?: boolean;
  categoryName?: string;
  categoryId?: string;
  onBack?: () => void;
}

const PostEditor = ({ 
  onSubmit, 
  onCancel, 
  initialTitle = '', 
  initialContent = '', 
  initialTags = [], 
  initialPostType = 'discussion',
  isEditing = false,
  categoryName,
  categoryId,
  onBack
}: PostEditorProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [postType, setPostType] = useState(initialPostType);
  const { user } = useAuth();
  const { toast } = useToast();
  const initialized = useRef(false);

  // Only initialize once on mount
  useEffect(() => {
    if (!initialized.current) {
      setTitle(initialTitle);
      setContent(initialContent);
      setSelectedTags(initialTags);
      setPostType(initialPostType);
      initialized.current = true;
    }
  }, []); // Empty dependency array - only run once

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onSubmit(title.trim(), content.trim(), selectedTags, postType);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          )}
          <h1 className="text-2xl font-bold">{isEditing ? 'Edit Post' : 'Create New Post'}</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Post' : 'Create New Post'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                placeholder="Post title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Post Type</label>
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="discussion">Discussion</option>
                <option value="question">Question</option>
                <option value="announcement">Announcement</option>
                <option value="guide">Guide</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content..."
                rows={8}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="space-y-2">
                {/* Display selected tags */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedTags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                          className="ml-1 hover:bg-muted rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Simple tag input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const newTag = e.currentTarget.value.trim();
                        if (newTag && !selectedTags.includes(newTag)) {
                          setSelectedTags([...selectedTags, newTag]);
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Add a tag..."]') as HTMLInputElement;
                      if (input) {
                        const newTag = input.value.trim();
                        if (newTag && !selectedTags.includes(newTag)) {
                          setSelectedTags([...selectedTags, newTag]);
                          input.value = '';
                        }
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                
                {/* Common tags */}
                <div className="flex flex-wrap gap-1">
                  {['general', 'help', 'announcement', 'discussion', 'question', 'guide'].map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="text-xs cursor-pointer"
                      onClick={() => {
                        if (selectedTags.includes(tag)) {
                          setSelectedTags(selectedTags.filter(t => t !== tag));
                        } else {
                          setSelectedTags([...selectedTags, tag]);
                        }
                      }}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button type="submit" disabled={!title.trim() || !content.trim()}>
                {isEditing ? 'Update Post' : 'Create Post'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostEditor;

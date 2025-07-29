import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Plus, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PostTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  content: string;
  icon: string;
}

interface PostTemplatesProps {
  onSelectTemplate: (template: PostTemplate) => void;
  className?: string;
}

const POST_TEMPLATES: PostTemplate[] = [
  {
    id: 'bug-report',
    name: 'Bug Report',
    description: 'Report a bug or issue you\'ve encountered',
    category: 'bug-report',
    tags: ['bug-report', 'help'],
    content: `## Bug Report

### Description
[Describe the bug in detail]

### Steps to Reproduce
1. [First step]
2. [Second step]
3. [And so on...]

### Expected Behavior
[What you expected to happen]

### Actual Behavior
[What actually happened]

### Environment
- **Server Version:** [e.g., 1.20.1]
- **Client Version:** [e.g., 1.20.1]
- **Mods/Plugins:** [List any mods or plugins you're using]

### Additional Information
- Screenshots: [If applicable]
- Logs: [If applicable]
- Related Issues: [If applicable]`,
    icon: '🐛'
  },
  {
    id: 'feature-request',
    name: 'Feature Request',
    description: 'Suggest a new feature or improvement',
    category: 'feature-request',
    tags: ['feature-request', 'suggestion'],
    content: `## Feature Request

### Summary
[Brief description of the feature you'd like to see]

### Problem Statement
[Describe the problem this feature would solve]

### Proposed Solution
[Describe your proposed solution in detail]

### Benefits
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

### Alternative Solutions
[If you've considered other approaches, describe them here]

### Additional Context
[Any other relevant information]`,
    icon: '💡'
  },
  {
    id: 'guide',
    name: 'Guide',
    description: 'Create a helpful guide or tutorial',
    category: 'guide',
    tags: ['guide', 'tutorial', 'help'],
    content: `## Guide: [Title]

### Overview
[Brief overview of what this guide covers]

### Prerequisites
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

### Step-by-Step Instructions

#### Step 1: [First Step]
[Detailed instructions for the first step]

#### Step 2: [Second Step]
[Detailed instructions for the second step]

#### Step 3: [Third Step]
[Detailed instructions for the third step]

### Tips and Tricks
- [Tip 1]
- [Tip 2]
- [Tip 3]

### Troubleshooting
**Common Issues:**
- [Issue 1]: [Solution 1]
- [Issue 2]: [Solution 2]

### Additional Resources
- [Link to related documentation]
- [Link to video tutorial]
- [Link to forum thread]`,
    icon: '📚'
  },
  {
    id: 'question',
    name: 'Question',
    description: 'Ask a question to the community',
    category: 'question',
    tags: ['question', 'help'],
    content: `## Question: [Your Question]

### Context
[Provide context for your question]

### What I've Tried
[Describe what you've already attempted]

### Specific Question
[State your specific question clearly]

### Additional Information
- [Any relevant details]
- [Screenshots if applicable]
- [Error messages if applicable]

### What I'm Looking For
[Describe the type of help you're seeking]`,
    icon: '❓'
  },
  {
    id: 'discussion',
    name: 'Discussion',
    description: 'Start a general discussion topic',
    category: 'discussion',
    tags: ['discussion', 'community'],
    content: `## Discussion: [Topic]

### Topic Overview
[Brief overview of what you'd like to discuss]

### Key Points
- [Point 1]
- [Point 2]
- [Point 3]

### Questions for Discussion
1. [Question 1]
2. [Question 2]
3. [Question 3]

### Your Thoughts
[Share your initial thoughts on the topic]

### What I Hope to Learn
[What you hope to gain from this discussion]`,
    icon: '💬'
  },
  {
    id: 'announcement',
    name: 'Announcement',
    description: 'Make an important announcement',
    category: 'announcement',
    tags: ['announcement', 'news'],
    content: `## Announcement: [Title]

### Summary
[Brief summary of the announcement]

### Details
[Detailed information about the announcement]

### Important Dates
- **Date:** [When this takes effect]
- **Deadline:** [If applicable]

### Action Required
[What people need to do, if anything]

### Contact Information
[How to get more information or ask questions]

### Additional Notes
[Any other relevant information]`,
    icon: '📢'
  }
];

export const PostTemplates = ({ onSelectTemplate, className }: PostTemplatesProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<PostTemplate | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const handleTemplateSelect = (template: PostTemplate) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      setSelectedTemplate(null);
    }
  };

  const copyTemplateContent = async (template: PostTemplate) => {
    try {
      await navigator.clipboard.writeText(template.content);
      setCopiedTemplate(template.id);
      setTimeout(() => setCopiedTemplate(null), 2000);
    } catch (err) {
      console.error('Failed to copy template:', err);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'bug-report': 'bg-red-100 text-red-800',
      'feature-request': 'bg-blue-100 text-blue-800',
      'guide': 'bg-green-100 text-green-800',
      'question': 'bg-yellow-100 text-yellow-800',
      'discussion': 'bg-purple-100 text-purple-800',
      'announcement': 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Post Templates</h3>
        <span className="text-sm text-muted-foreground">
          Choose a template to get started quickly
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {POST_TEMPLATES.map((template) => (
          <Card 
            key={template.id} 
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              selectedTemplate?.id === template.id && "ring-2 ring-primary"
            )}
            onClick={() => handleTemplateSelect(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{template.icon}</span>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                </div>
                <Badge className={getCategoryColor(template.category)}>
                  {template.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3">
                {template.description}
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                {template.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
                {template.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.tags.length - 3} more
                  </Badge>
                )}
              </div>
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyTemplateContent(template);
                  }}
                >
                  {copiedTemplate === template.id ? (
                    <Check className="w-4 h-4 mr-1" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1" />
                  )}
                  {copiedTemplate === template.id ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTemplateSelect(template);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Preview Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span className="text-2xl">{selectedTemplate?.icon}</span>
              <span>{selectedTemplate?.name} Template</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">
                {selectedTemplate?.description}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {selectedTemplate?.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Template Content</h4>
              <ScrollArea className="h-64 w-full border rounded-md p-4">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {selectedTemplate?.content}
                </pre>
              </ScrollArea>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => copyTemplateContent(selectedTemplate!)}
              >
                {copiedTemplate === selectedTemplate?.id ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {copiedTemplate === selectedTemplate?.id ? 'Copied!' : 'Copy Content'}
              </Button>
              <Button onClick={handleUseTemplate}>
                <FileText className="w-4 h-4 mr-2" />
                Use This Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 
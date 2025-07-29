import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Bold, Italic, Underline, List, ListOrdered, Code, Quote, Link, 
  Image, Smile, Save, Upload, X, Check, AlertCircle,
  Heading1, Heading2, Heading3, Strikethrough, AlignLeft, AlignCenter, AlignRight,
  FileImage, Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  onSave?: () => void;
  showEmojiPicker?: boolean;
  showImageUpload?: boolean;
}

export const EnhancedRichTextEditor: React.FC<EnhancedRichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your post content...',
  rows = 8,
  disabled = false,
  onSave,
  showEmojiPicker = true,
  showImageUpload = true
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showEmojiDialog, setShowEmojiDialog] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState(value);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Auto-save draft
  useEffect(() => {
    if (value !== lastSaved) {
      const timer = setTimeout(() => {
        localStorage.setItem('forum_draft', value);
        setLastSaved(value);
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [value, lastSaved]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('forum_draft');
    if (draft && !value) {
      onChange(draft);
    }
  }, []);

  // Update word and character count
  useEffect(() => {
    const text = value.replace(/<[^>]*>/g, ''); // Remove HTML tags for counting
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(text.length);
  }, [value]);

  const insertText = (text: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + text + value.substring(end);
      onChange(newValue);
      
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  };

  const formatText = (format: string) => {
    switch (format) {
      case 'bold':
        insertText('**bold text**');
        break;
      case 'italic':
        insertText('*italic text*');
        break;
      case 'underline':
        insertText('__underlined text__');
        break;
      case 'strikethrough':
        insertText('~~strikethrough text~~');
        break;
      case 'heading1':
        insertText('# Heading 1\n');
        break;
      case 'heading2':
        insertText('## Heading 2\n');
        break;
      case 'heading3':
        insertText('### Heading 3\n');
        break;
      case 'unordered-list':
        insertText('- List item\n');
        break;
      case 'ordered-list':
        insertText('1. List item\n');
        break;
      case 'code':
        insertText('`code`');
        break;
      case 'code-block':
        insertText('\n```\ncode block\n```\n');
        break;
      case 'quote':
        insertText('> Quote text\n');
        break;
      case 'link':
        insertText('[link text](url)');
        break;
      case 'align-left':
        // Markdown doesn't support alignment, but we can add a comment
        insertText('<!-- Left aligned -->\n');
        break;
      case 'align-center':
        insertText('<!-- Center aligned -->\n');
        break;
      case 'align-right':
        insertText('<!-- Right aligned -->\n');
        break;
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const filePath = `forum-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('forum-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('forum-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Image must be smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      insertText(`![${file.name}](${imageUrl})`);
      toast({
        title: "Image uploaded",
        description: "Image has been uploaded and inserted.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleImageUpload(imageFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please drop an image file.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border border-gray-300 rounded-t-md bg-gray-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('bold')}
                className="h-8 w-8 p-0"
              >
                <Bold className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('italic')}
                className="h-8 w-8 p-0"
              >
                <Italic className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('underline')}
                className="h-8 w-8 p-0"
              >
                <Underline className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Underline</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('strikethrough')}
                className="h-8 w-8 p-0"
              >
                <Strikethrough className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Strikethrough</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('heading1')}
                className="h-8 w-8 p-0"
              >
                <Heading1 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 1</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('heading2')}
                className="h-8 w-8 p-0"
              >
                <Heading2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 2</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('heading3')}
                className="h-8 w-8 p-0"
              >
                <Heading3 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 3</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('unordered-list')}
                className="h-8 w-8 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Unordered List</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('ordered-list')}
                className="h-8 w-8 p-0"
              >
                <ListOrdered className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ordered List</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('quote')}
                className="h-8 w-8 p-0"
              >
                <Quote className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Quote</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('code')}
                className="h-8 w-8 p-0"
              >
                <Code className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Inline Code</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('code-block')}
                className="h-8 w-8 p-0"
              >
                <Code className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Code Block</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('link')}
                className="h-8 w-8 p-0"
              >
                <Link className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Link</TooltipContent>
          </Tooltip>

          {showImageUpload && (
            <>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="h-8 w-8 p-0"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Image className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Upload Image</TooltipContent>
              </Tooltip>
            </>
          )}

          {showEmojiPicker && (
            <>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <Dialog open={showEmojiDialog} onOpenChange={setShowEmojiDialog}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Insert Emoji</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-8 gap-2 p-4">
                    {['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💯', '🎉', '🚀', '💡', '⚠️', '❌', '✅', '📝'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          insertText(emoji);
                          setShowEmojiDialog(false);
                        }}
                        className="text-2xl hover:bg-gray-100 rounded p-2"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </TooltipProvider>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Textarea */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            min-h-[${rows * 1.5}rem] border-t-0 rounded-t-none
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            ${isFocused ? 'ring-2 ring-blue-500 border-transparent' : ''}
            ${dragOver ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' : ''}
            transition-all duration-200
          `}
          style={{ minHeight: `${rows * 1.5}rem` }}
        />
        
        {dragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-md pointer-events-none">
            <div className="text-center">
              <FileImage className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-blue-500 font-medium">Drop image here to upload</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Help text */}
      <div className="text-xs text-gray-500 mt-2">
        <p>Basic formatting: <strong>**bold**</strong>, <em>*italic*</em>, <code>`code`</code>, <code>{'>'} quote</code></p>
        <p>Lists: Use the toolbar buttons or type <code>-</code> for bullets, <code>1.</code> for numbered lists</p>
        <p>Images: Use the image button or type <code>![alt](url)</code></p>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
        <div className="flex items-center space-x-4">
          {draftSaved && (
            <div className="flex items-center space-x-1 text-green-600">
              <Check className="w-3 h-3" />
              <span>Draft saved</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount} characters</span>
        </div>
      </div>

      {/* Image Upload Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowImageDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (imageUrl) {
                    insertText(`![Image](${imageUrl})`);
                    setImageUrl('');
                    setShowImageDialog(false);
                  }
                }}
              >
                Insert
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 
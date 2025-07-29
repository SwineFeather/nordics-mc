import { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { UploadPhotoData } from '@/services/townGalleryService';

interface TownPhotoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  townName: string;
  onUpload: (data: UploadPhotoData) => Promise<void>;
  uploading: boolean;
  currentPhotoCount?: number;
}

const TownPhotoUploadDialog = ({
  open,
  onOpenChange,
  townName,
  onUpload,
  uploading,
  currentPhotoCount = 0
}: TownPhotoUploadDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Reset form when dialog opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTags([]);
    setNewTag('');
    setSelectedFile(null);
    // Clean up preview URL to prevent memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setErrors({});
  };

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    try {
      console.log('File selected:', file.name, file.type, file.size);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors({ file: 'Please select an image file' });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ file: 'File size must be less than 5MB' });
        return;
      }

      // Additional check for very large images that might cause browser issues
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ file: 'File is too large and may cause browser issues. Please use a smaller image.' });
        return;
      }

      // Additional validation for specific image types
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setErrors({ file: 'Please select a JPEG, PNG, GIF, or WebP image' });
        return;
      }

      // Check for empty or corrupted files
      if (file.size === 0) {
        setErrors({ file: 'File appears to be empty or corrupted. Please select a different file.' });
        return;
      }

      // Clean up any existing preview URL before creating a new one
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      setSelectedFile(file);
      setErrors({});

      // Create preview URL with error handling and timeout
      try {
        const url = URL.createObjectURL(file);
        console.log('Preview URL created:', url);
        
        // Set a timeout to prevent hanging on problematic images
        const timeoutId = setTimeout(() => {
          console.warn('Image preview creation timed out');
          setErrors({ file: 'Image preview took too long to load. Please try a smaller or different image.' });
          setSelectedFile(null);
          URL.revokeObjectURL(url);
        }, 5000); // 5 second timeout

        // Test the image by creating a temporary Image object
        const testImage = new Image();
        testImage.onload = () => {
          clearTimeout(timeoutId);
          console.log('Image preview loaded successfully');
          setPreviewUrl(url);
        };
        testImage.onerror = () => {
          clearTimeout(timeoutId);
          console.error('Image preview failed to load');
          setErrors({ file: 'Unable to preview this image. Please try a different file.' });
          setSelectedFile(null);
          URL.revokeObjectURL(url);
        };
        testImage.src = url;
        
      } catch (previewError) {
        console.error('Error creating preview URL:', previewError);
        setErrors({ file: 'Unable to preview this image. Please try a different file.' });
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error handling file selection:', error);
      setErrors({ file: 'Error processing file. Please try again.' });
      setSelectedFile(null);
    }
  }, [previewUrl]);

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  // Handle tag management
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags(prev => [...prev, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!selectedFile) {
      newErrors.file = 'Please select an image file';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !selectedFile) {
      return;
    }

    try {
      const uploadData: UploadPhotoData = {
        town_name: townName,
        title: title.trim(),
        description: description.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        file: selectedFile
      };

      await onUpload(uploadData);
      handleOpenChange(false);
    } catch (error) {
      console.error('Upload failed:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Upload failed' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Photo to {townName}
          </DialogTitle>
          <DialogDescription>
            Share a photo of {townName} with the community. Only mayors, co-mayors, and admins can upload photos.
            {currentPhotoCount > 0 && (
              <div className="mt-2 text-sm text-muted-foreground">
                Current photos: {currentPhotoCount}/10
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div className="space-y-2">
            <Label htmlFor="photo">Photo File *</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-48 max-w-full rounded-lg object-contain"
                      onError={(e) => {
                        console.error('Image preview error:', e);
                        setErrors({ file: 'Unable to display image preview. Please try a different file.' });
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      onLoad={() => {
                        console.log('Image preview loaded successfully');
                      }}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 w-6 h-6"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedFile?.name} ({(selectedFile?.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      PNG, JPG, GIF up to 5MB
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        try {
                          if (fileInputRef.current) {
                            fileInputRef.current.click();
                          } else {
                            console.error('File input ref is null');
                            setErrors({ file: 'File input not available. Please refresh the page and try again.' });
                          }
                        } catch (error) {
                          console.error('Error clicking file input:', error);
                          setErrors({ file: 'Unable to open file selector. Please try again.' });
                        }
                      }}
                    >
                      Choose File
                    </Button>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={(e) => {
                  try {
                    const file = e.target.files?.[0];
                    if (file) {
                      console.log('File input change:', file.name, file.size, file.type);
                      handleFileSelect(file);
                    }
                    // Reset the input value to allow selecting the same file again
                    if (e.target) {
                      e.target.value = '';
                    }
                  } catch (error) {
                    console.error('Error in file input change:', error);
                    setErrors({ file: 'Error reading file. Please try again.' });
                    // Reset the input on error
                    if (e.target) {
                      e.target.value = '';
                    }
                  }
                }}
                onClick={(e) => {
                  // Clear any previous errors when user clicks to select a file
                  if (errors.file) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.file;
                      return newErrors;
                    });
                  }
                }}
              />
            </div>
            {errors.file && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.file}
              </p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Photo Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title for your photo"
              maxLength={100}
            />
            {errors.title && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what's shown in the photo (optional)"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 characters
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  placeholder="Add tags (press Enter)"
                  maxLength={20}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTag}
                  disabled={!newTag.trim()}
                >
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="w-3 h-3 p-0 hover:bg-transparent"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="w-2 h-2" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Tags help others find your photo. Examples: building, landmark, event, nature
            </p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.submit}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploading || !selectedFile || !title.trim()}
              className="min-w-[100px]"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TownPhotoUploadDialog; 
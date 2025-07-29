import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, Image, ExternalLink, Copy, CheckCircle, AlertCircle, Info, X, FileImage, Link } from 'lucide-react';
import { TownImageService } from '@/services/townImageService';
import { ImageStorageService } from '@/services/imageStorageService';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TownImageUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  townId: string;
  townName: string;
  currentImageUrl?: string | null;
  onImageUpdated?: (imageUrl: string) => void;
}

const TownImageUploadDialog: React.FC<TownImageUploadDialogProps> = ({
  isOpen,
  onClose,
  townId,
  townName,
  currentImageUrl,
  onImageUpdated
}) => {
  const [imageUrl, setImageUrl] = useState(currentImageUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('file');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile } = useAuth();

  useEffect(() => {
    if (isOpen) {
      checkPermissions();
      setImageUrl(currentImageUrl || '');
      setPreviewUrl(currentImageUrl || null);
      setSelectedFile(null);
      setUploadProgress(0);
    }
  }, [isOpen, currentImageUrl, townId]);

  const checkPermissions = async () => {
    setIsCheckingPermissions(true);
    try {
      const hasPermission = await TownImageService.canUpdateTownImage(townId);
      setCanUpdate(hasPermission);
    } catch (error) {
      console.error('Error checking permissions:', error);
      setCanUpdate(false);
    } finally {
      setIsCheckingPermissions(false);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    setPreviewError(null);
    
    if (url && isValidImageUrl(url)) {
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const isValidImageUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const pathname = urlObj.pathname.toLowerCase();
      return validExtensions.some(ext => pathname.endsWith(ext));
    } catch {
      return false;
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file';
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return 'File size must be less than 5MB';
    }

    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return 'Please select a JPEG, PNG, GIF, or WebP image';
    }

    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    setSelectedFile(file);
    setPreviewError(null);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreviewUrl(previewUrl);

    // Clean up previous preview URL
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

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

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    } else {
      toast.error('Please drop an image file');
    }
  }, [handleFileSelect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadMode === 'url' && !imageUrl.trim()) {
      return;
    }

    if (uploadMode === 'file' && !selectedFile) {
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      let finalImageUrl: string;

      if (uploadMode === 'file' && selectedFile) {
        // Upload file using the service
        setUploadProgress(50);
        const success = await TownImageService.uploadTownImageFile(townId, selectedFile);
        setUploadProgress(100);
        
        if (success) {
          // Get the updated image URL from the town data
          const { data: town } = await supabase
            .from('towns')
            .select('image_url')
            .eq('id', townId)
            .single();
          
          if (town?.image_url) {
            onImageUpdated?.(town.image_url);
          }
          onClose();
        }
        return;
      } else {
        // Use URL directly
        finalImageUrl = imageUrl.trim();
      }

      // Update image URL
      setUploadProgress(75);
      const success = await TownImageService.updateTownImage(townId, finalImageUrl);
      setUploadProgress(100);

      if (success) {
        onImageUpdated?.(finalImageUrl);
        onClose();
      }

    } catch (error) {
      console.error('Error updating town image:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handlePreviewError = () => {
    setPreviewError('Failed to load image preview');
  };

  const copyImageUrl = () => {
    if (currentImageUrl) {
      navigator.clipboard.writeText(currentImageUrl);
      toast.success('Image URL copied to clipboard');
    }
  };

  const openImageInNewTab = () => {
    if (currentImageUrl) {
      window.open(currentImageUrl, '_blank');
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(currentImageUrl || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isCheckingPermissions) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Checking permissions...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!canUpdate) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg">Update Town Image</DialogTitle>
            <DialogDescription>
              Update the image for {townName}
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You do not have permission to update this town's image. Only town mayors and staff can update town images.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Update Town Image</DialogTitle>
          <DialogDescription>
            Update the image for {townName}. You can upload a file or provide an image URL.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Image Info */}
          {currentImageUrl && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Current Image</Label>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Image className="h-4 w-4 flex-shrink-0" />
                <span className="truncate flex-1" title={currentImageUrl}>
                  {currentImageUrl.includes('supabase.co/storage') 
                    ? 'Stored in Supabase Storage' 
                    : currentImageUrl.length > 50 
                      ? currentImageUrl.substring(0, 50) + '...' 
                      : currentImageUrl
                  }
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(currentImageUrl, '_blank')}
                  className="flex-shrink-0"
                  title="Open image in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(currentImageUrl)}
                  className="flex-shrink-0"
                  title="Copy image URL"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Upload Mode Toggle */}
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={uploadMode === 'file' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUploadMode('file')}
              className="flex items-center gap-2"
            >
              <FileImage className="h-4 w-4" />
              Upload File
            </Button>
            <Button
              type="button"
              variant={uploadMode === 'url' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUploadMode('url')}
              className="flex items-center gap-2"
            >
              <Link className="h-4 w-4" />
              Image URL
            </Button>
          </div>

          {/* File Upload Section */}
          {uploadMode === 'file' && (
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="hidden"
                />
                
                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium">{selectedFile.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearSelectedFile}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {previewUrl && (
                      <div className="flex justify-center">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-32 max-w-full rounded border"
                          onError={handlePreviewError}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Drop your image here, or{' '}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-primary hover:underline"
                        >
                          browse
                        </button>
                      </p>
                      <p className="text-xs text-muted-foreground overflow-hidden min-w-0 break-words max-w-full">
                        Supports JPEG, PNG, GIF, WebP up to 5MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {previewError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{previewError}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* URL Input Section */}
          {uploadMode === 'url' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="imageUrl" className="text-sm font-medium">
                  Image URL
                </Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.png"
                  value={imageUrl}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter a direct link to an image (JPEG, PNG, GIF, WebP)
                </p>
              </div>

              {previewUrl && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Preview</Label>
                  <div className="flex justify-center">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-32 max-w-full rounded border"
                      onError={handlePreviewError}
                    />
                  </div>
                </div>
              )}

              {previewError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{previewError}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              The image will be stored on our server and made available for BlueMap compatibility. 
              Make sure you have permission to use the image you're uploading.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || (uploadMode === 'file' && !selectedFile) || (uploadMode === 'url' && !imageUrl.trim())}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Image'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TownImageUploadDialog; 
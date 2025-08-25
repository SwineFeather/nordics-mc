import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, Image, ExternalLink, Copy, CheckCircle, AlertCircle, Info, X, FileImage, Link } from 'lucide-react';
import { NationImageService } from '@/services/nationImageService';
import { ImageStorageService } from '@/services/imageStorageService';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NationImageUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  nationId: string;
  nationName: string;
  currentImageUrl?: string | null;
  onImageUpdated?: (imageUrl: string) => void;
}

const NationImageUploadDialog: React.FC<NationImageUploadDialogProps> = ({
  isOpen,
  onClose,
  nationId,
  nationName,
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
  }, [isOpen, currentImageUrl, nationId]);

  const checkPermissions = async () => {
    setIsCheckingPermissions(true);
    try {
      const hasPermission = await NationImageService.canUpdateNationImage(nationId);
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
        const success = await NationImageService.uploadNationImageFile(nationId, selectedFile);
        setUploadProgress(100);
        
        if (success) {
          // Get the updated image URL from the nation data
          const { data: nation } = await supabase
            .from('nations')
            .select('image_url')
            .eq('id', nationId)
            .single();
          
          if (nation?.image_url) {
            onImageUpdated?.(nation.image_url);
          }
          onClose();
        }
        return;
      } else {
        // Use URL directly
        finalImageUrl = imageUrl.trim();
      }

      const success = await NationImageService.updateNationImage(nationId, finalImageUrl);
      
      if (success) {
        onImageUpdated?.(finalImageUrl);
        onClose();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handlePreviewError = () => {
    setPreviewError('Failed to load image preview. Please check the file or URL.');
  };

  const copyImageUrl = () => {
    if (imageUrl) {
      navigator.clipboard.writeText(imageUrl);
    }
  };

  const openImageInNewTab = () => {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  };

  const clearSelectedFile = () => {
    if (selectedFile) {
      setSelectedFile(null);
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
    }
  };

  if (isCheckingPermissions) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Checking Permissions</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Checking permissions...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!canUpdate) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Access Denied
            </DialogTitle>
            <DialogDescription>
              You do not have permission to update the image for {nationName}. Only nation leaders and staff can update nation images.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto text-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Image className="h-5 w-5" />
            Update {nationName} Image
          </DialogTitle>
          <DialogDescription className="text-sm">
            Upload an image for your nation. You can either upload a file directly or provide a URL to an image.
          </DialogDescription>
        </DialogHeader>

        {/* Special Characters Warning */}
        <Alert variant="destructive" className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>Important:</strong> If your nation name contains special characters like Å, Ä, Ö, or other non-English letters, 
            your emblem will not be shown on BlueMap at all. Our database does not support those letters for BlueMap integration.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload Mode Toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={uploadMode === 'file' ? 'default' : 'outline'}
              onClick={() => setUploadMode('file')}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload File
            </Button>
            <Button
              type="button"
              variant={uploadMode === 'url' ? 'default' : 'outline'}
              onClick={() => setUploadMode('url')}
              className="flex items-center gap-2"
            >
              <Link className="h-4 w-4" />
              Image URL
            </Button>
          </div>

          {uploadMode === 'file' ? (
            /* File Upload Section */
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Upload Image File</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors overflow-hidden min-w-0 ${
                    dragActive 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {selectedFile ? (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <img
                          src={previewUrl || ''}
                          alt="Preview"
                          className="max-h-48 max-w-full rounded-lg object-contain"
                          onError={handlePreviewError}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute -top-2 -right-2 w-6 h-6"
                          onClick={clearSelectedFile}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p><strong>File:</strong> {selectedFile.name}</p>
                        <p><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        <p><strong>Type:</strong> {selectedFile.type}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <FileImage className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div className="max-w-full">
                        <p className="text-sm text-muted-foreground break-words">
                          Drag and drop an image file here, or{' '}
                          <button
                            type="button"
                            className="text-primary hover:underline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            click to browse
                          </button>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 break-words">
                          Supports JPEG, PNG, GIF, WebP (max 5MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileSelect(file);
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            /* URL Input Section */
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>How to upload an image:</strong>
                  <ol className="mt-2 ml-4 list-decimal space-y-1 text-sm">
                    <li>Upload your image to Discord, Imgur, or any image hosting service</li>
                    <li>Right-click on the uploaded image and select "Copy image address" or "Copy link"</li>
                    <li>Paste the link in the field below</li>
                    <li>The link should end with .jpg, .jpeg, .png, .gif, or .webp</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-sm font-medium">Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="https://example.com/image.png"
                    value={imageUrl}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    className="flex-1"
                    required={uploadMode === 'url'}
                  />
                  {imageUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={copyImageUrl}
                      title="Copy URL"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {imageUrl && !isValidImageUrl(imageUrl) && (
                  <p className="text-sm text-destructive">
                    Please provide a valid image URL (must end with .jpg, .jpeg, .png, .gif, .webp)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Image Preview */}
          {previewUrl && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview</Label>
              <div className="relative">
                <img
                  src={previewUrl}
                  alt={`${nationName} preview`}
                  className="max-h-64 w-auto rounded-lg border object-contain"
                  onError={handlePreviewError}
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={openImageInNewTab}
                    title="Open image in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {previewError && (
                <p className="text-sm text-destructive">{previewError}</p>
              )}
            </div>
          )}

          {/* Upload Progress */}
          {isLoading && uploadProgress > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Upload Progress</Label>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{uploadProgress}% complete</p>
            </div>
          )}

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

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                isLoading || 
                (uploadMode === 'url' && (!imageUrl.trim() || !isValidImageUrl(imageUrl))) ||
                (uploadMode === 'file' && !selectedFile)
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploadMode === 'file' ? 'Uploading...' : 'Updating...'}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadMode === 'file' ? 'Upload Image' : 'Update Image'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NationImageUploadDialog; 
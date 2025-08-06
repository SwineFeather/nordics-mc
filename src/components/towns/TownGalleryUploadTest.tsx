import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { TownGalleryService, UploadPhotoData } from '@/services/townGalleryService';
import { toast } from '@/hooks/use-toast';
import { Upload, Loader2 } from 'lucide-react';

interface TownGalleryUploadTestProps {
  townName: string;
}

const TownGalleryUploadTest: React.FC<TownGalleryUploadTestProps> = ({ townName }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to upload photos');
      return;
    }

    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a title for the photo');
      return;
    }

    try {
      setUploading(true);

      const uploadData: UploadPhotoData = {
        town_name: townName,
        title: title.trim(),
        description: description.trim() || undefined,
        file: selectedFile,
        tags: []
      };

      const photo = await TownGalleryService.uploadPhoto(uploadData, user.id);
      
      toast.success('Photo uploaded successfully!');
      console.log('Uploaded photo:', photo);
      
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      if (document.getElementById('file-input')) {
        (document.getElementById('file-input') as HTMLInputElement).value = '';
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Please log in to upload photos to the gallery.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Photo to Gallery
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Photo Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your photo"
            disabled={uploading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description of the photo"
            disabled={uploading}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file-input">Photo File *</Label>
          <Input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <p className="text-sm text-muted-foreground">
            Maximum file size: 5MB. Supported formats: PNG, JPEG, JPG, WebP, GIF
          </p>
          {selectedFile && (
            <p className="text-sm text-green-600">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
            </p>
          )}
        </div>

        <Button 
          onClick={handleUpload} 
          disabled={uploading || !selectedFile || !title.trim()}
          className="w-full"
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

        <div className="text-xs text-muted-foreground">
          <p>• Only town mayors and co-mayors can upload photos</p>
          <p>• Maximum 10 photos per town</p>
          <p>• Photos are automatically approved for public viewing</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TownGalleryUploadTest; 
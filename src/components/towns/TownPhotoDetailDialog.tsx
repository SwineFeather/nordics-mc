import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  Eye, 
  Download, 
  Edit3, 
  Save, 
  X, 
  Trash2,
  Calendar,
  User,
  Eye as EyeIcon,
  Tag,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { TownPhoto } from '@/services/townGalleryService';

interface TownPhotoDetailDialogProps {
  photo: TownPhoto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (photoId: string) => Promise<void>;
  onUpdate?: (photoId: string, updates: Partial<Pick<TownPhoto, 'title' | 'description' | 'tags'>>) => Promise<void>;
  canEdit?: boolean;
  canDelete?: boolean;
}

const TownPhotoDetailDialog = ({
  photo,
  open,
  onOpenChange,
  onDelete,
  onUpdate,
  canEdit = false,
  canDelete = false
}: TownPhotoDetailDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize edit form when photo changes
  useEffect(() => {
    if (photo) {
      setEditTitle(photo.title);
      setEditDescription(photo.description || '');
      setEditTags(photo.tags || []);
      setError(null);
    }
  }, [photo]);

  // Reset editing state when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setIsEditing(false);
      setError(null);
    }
    onOpenChange(newOpen);
  };

  // Handle tag management
  const addTag = () => {
    if (newTag.trim() && !editTags.includes(newTag.trim().toLowerCase())) {
      setEditTags(prev => [...prev, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Handle save changes
  const handleSave = async () => {
    if (!photo || !onUpdate) return;

    try {
      setSaving(true);
      setError(null);

      const updates = {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        tags: editTags.length > 0 ? editTags : undefined
      };

      await onUpdate(photo.id, updates);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating photo:', err);
      setError(err instanceof Error ? err.message : 'Failed to update photo');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!photo || !onDelete) return;

    if (!confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      await onDelete(photo.id);
      handleOpenChange(false);
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete photo');
    } finally {
      setDeleting(false);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (!photo) return;

    const link = document.createElement('a');
    link.href = photo.file_url;
    link.download = `${photo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
    link.click();
  };

  if (!photo) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                {isEditing ? 'Edit Photo' : photo.title}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update photo information' : `Uploaded by ${photo.uploaded_by_username} on ${formatDate(photo.uploaded_at)}`}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {canEdit && !isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}

          {/* Photo Display */}
          <div className="relative">
            <img
              src={photo.file_url}
              alt={photo.title}
              className="w-full h-auto rounded-lg shadow-lg"
            />
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              <EyeIcon className="w-4 h-4" />
              {photo.view_count} views
            </div>
          </div>

          {/* Photo Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title *</Label>
                    <Input
                      id="edit-title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground">
                      {editDescription.length}/500 characters
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
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
                      {editTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {editTags.map((tag) => (
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
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{photo.title}</h3>
                    {photo.description && (
                      <p className="text-muted-foreground mb-4">{photo.description}</p>
                    )}
                  </div>
                  {photo.tags && photo.tags.length > 0 && (
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4" />
                        Tags
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {photo.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right Column - Metadata */}
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold">Photo Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uploaded by:</span>
                    <span className="font-medium">{photo.uploaded_by_username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Upload date:</span>
                    <span className="font-medium">{formatDate(photo.uploaded_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File size:</span>
                    <span className="font-medium">{formatFileSize(photo.file_size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dimensions:</span>
                    <span className="font-medium">
                      {photo.width} × {photo.height}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Views:</span>
                    <span className="font-medium">{photo.view_count}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(photo.file_url, '_blank')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Size
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>

              {/* Edit Actions */}
              {isEditing && (
                <div className="space-y-2 pt-4 border-t">
                  <Button
                    className="w-full"
                    onClick={handleSave}
                    disabled={saving || !editTitle.trim()}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setIsEditing(false);
                      setEditTitle(photo.title);
                      setEditDescription(photo.description || '');
                      setEditTags(photo.tags || []);
                      setError(null);
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TownPhotoDetailDialog; 
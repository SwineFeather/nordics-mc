import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Edit3, Trash2, Eye, Calendar, User, Tag, X } from 'lucide-react';
import { NationPhoto } from '@/services/nationGalleryService';

interface NationPhotoDetailDialogProps {
  photo: NationPhoto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (photoId: string) => Promise<boolean>;
  onUpdate: (photoId: string, updates: Partial<NationPhoto>) => Promise<boolean>;
  canEdit: boolean;
  canDelete: boolean;
}

const NationPhotoDetailDialog = ({
  photo,
  open,
  onOpenChange,
  onDelete,
  onUpdate,
  canEdit,
  canDelete
}: NationPhotoDetailDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editData, setEditData] = useState<Partial<NationPhoto>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!photo) return null;

  const handleEdit = () => {
    setEditData({
      title: photo.title,
      description: photo.description || '',
      tags: [...(photo.tags || [])]
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editData.title?.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }

    setIsUpdating(true);
    try {
      const success = await onUpdate(photo.id, editData);
      if (success) {
        setIsEditing(false);
        setErrors({});
      }
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    setEditData({});
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${photo.title}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const success = await onDelete(photo.id);
      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const addTag = () => {
    const newTag = editData.newTag?.trim().toLowerCase();
    if (newTag && !editData.tags?.includes(newTag)) {
      setEditData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag],
        newTag: ''
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            {isEditing ? 'Edit Photo' : photo.title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={photo.file_url}
                alt={photo.title}
                className="w-full h-auto max-h-96 object-contain rounded-lg border"
              />
              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {photo.width}×{photo.height}
              </div>
            </div>

            {/* Image Info */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Uploaded by {photo.uploaded_by_username}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(photo.uploaded_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{photo.view_count} view{photo.view_count !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>File size: {(photo.file_size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            {isEditing ? (
              /* Edit Form */
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    value={editData.title || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                    maxLength={100}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editData.description || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    maxLength={500}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={editData.newTag || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, newTag: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      placeholder="Add tag..."
                      maxLength={20}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTag}
                      disabled={!editData.newTag?.trim()}
                    >
                      <Tag className="w-4 h-4" />
                    </Button>
                  </div>
                  {editData.tags && editData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {editData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="flex-1"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{photo.title}</h3>
                  {photo.description && (
                    <p className="text-muted-foreground">{photo.description}</p>
                  )}
                </div>

                {photo.tags && photo.tags.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {photo.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {canEdit && (
                    <Button
                      variant="outline"
                      onClick={handleEdit}
                      className="flex-1"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex-1"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NationPhotoDetailDialog;

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Camera, 
  Plus, 
  Search, 
  Grid3X3, 
  List,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Filter,
  X
} from 'lucide-react';
import { useTownGallery } from '@/hooks/useTownGallery';
import TownPhotoUploadDialog from './TownPhotoUploadDialog';
import TownPhotoDetailDialog from './TownPhotoDetailDialog';
import { TownPhoto, TownGalleryService } from '@/services/townGalleryService';

interface TownPhotoGalleryProps {
  townName: string;
  className?: string;
}

const TownPhotoGallery = ({ townName, className = "" }: TownPhotoGalleryProps) => {
  const {
    photos,
    loading,
    uploading,
    error,
    permissions,
    uploadPhoto,
    deletePhoto,
    updatePhoto,
    searchPhotos,
    incrementViewCount,
    refresh
  } = useTownGallery(townName);

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<TownPhoto | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSearch, setShowSearch] = useState(false);
  const [filteredPhotos, setFilteredPhotos] = useState<TownPhoto[]>([]);

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = await searchPhotos(query);
      setFilteredPhotos(results);
    } else {
      setFilteredPhotos([]);
    }
  };

  // Handle photo click
  const handlePhotoClick = async (photo: TownPhoto) => {
    setSelectedPhoto(photo);
    // Increment view count
    await incrementViewCount(photo.id);
  };

  // Handle upload
  const handleUpload = async (uploadData: any) => {
    await uploadPhoto(uploadData);
  };

  // Handle delete
  const handleDelete = async (photoId: string) => {
    await deletePhoto(photoId);
  };

  // Handle update
  const handleUpdate = async (photoId: string, updates: any) => {
    await updatePhoto(photoId, updates);
  };

  // Display photos (either filtered or all)
  const displayPhotos = searchQuery.trim() ? filteredPhotos : photos;

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Photo Gallery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Photo Gallery
                <Badge variant="secondary">{photos.length}/10</Badge>
                {photos.length >= 10 && (
                  <Badge variant="destructive" className="text-xs">
                    Limit Reached
                  </Badge>
                )}
              </CardTitle>
              {error && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Error
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Search Toggle */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSearch(!showSearch)}
              >
                {showSearch ? <EyeOff className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              </Button>

              {/* View Mode Toggle */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
              </Button>

              {/* Upload Button */}
              {permissions.canUpload && (
                <Button
                  size="sm"
                  onClick={() => setShowUploadDialog(true)}
                  disabled={uploading || photos.length >= 10}
                  title={photos.length >= 10 ? 'Maximum 10 photos allowed per town' : 'Add a new photo'}
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add Photo
                  {photos.length >= 10 && (
                    <span className="ml-1 text-xs">(Limit Reached)</span>
                  )}
                </Button>
              )}
              
              {/* Debug button - remove this later */}
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const result = await TownGalleryService.testService();
                  console.log('Service test result:', result);
                  alert(`Service test: ${result.success ? 'SUCCESS' : 'FAILED'}\n${result.message || result.error}`);
                }}
              >
                Test Service
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="flex gap-2">
              <Input
                placeholder="Search photos by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1"
              />
              {searchQuery && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setFilteredPhotos([]);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}

          {displayPhotos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Camera className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium mb-2">
                {searchQuery ? 'No photos found' : 'No photos uploaded yet'}
              </p>
              <p className="text-sm">
                {searchQuery 
                  ? `No photos match "${searchQuery}"`
                  : permissions.canUpload 
                    ? 'Be the first to share a photo of this town!' 
                    : 'Check back later for town photos.'
                }
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setFilteredPhotos([]);
                  }}
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" 
              : "space-y-4"
            }>
              {displayPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className={`group relative overflow-hidden rounded-lg border hover:shadow-lg transition-all cursor-pointer ${
                    viewMode === 'list' ? 'flex gap-4 p-4' : 'aspect-square'
                  }`}
                  onClick={() => handlePhotoClick(photo)}
                >
                  {viewMode === 'grid' ? (
                    <>
                      <img
                        src={photo.file_url}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          console.error('Failed to load image:', photo.file_url);
                          e.currentTarget.src = 'https://via.placeholder.com/400x400/6B7280/FFFFFF?text=Image+Error';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-2 left-2 right-2 text-white">
                          <p className="font-medium text-sm truncate">{photo.title}</p>
                          <p className="text-xs opacity-80">by {photo.uploaded_by_username}</p>
                        </div>
                      </div>
                      {permissions.canDelete && (
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(photo.id);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="w-24 h-24 flex-shrink-0">
                        <img
                          src={photo.file_url}
                          alt={photo.title}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            console.error('Failed to load image:', photo.file_url);
                            e.currentTarget.src = 'https://via.placeholder.com/96x96/6B7280/FFFFFF?text=Error';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{photo.title}</h3>
                        {photo.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {photo.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>by {photo.uploaded_by_username}</span>
                          <span>{formatDate(photo.uploaded_at)}</span>
                          <span>{photo.view_count} views</span>
                        </div>
                        {photo.tags && photo.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {photo.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {photo.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{photo.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      {permissions.canDelete && (
                        <Button
                          size="icon"
                          variant="destructive"
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(photo.id);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <TownPhotoUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        townName={townName}
        onUpload={handleUpload}
        uploading={uploading}
        currentPhotoCount={photos.length}
      />

      {/* Photo Detail Dialog */}
      <TownPhotoDetailDialog
        photo={selectedPhoto}
        open={!!selectedPhoto}
        onOpenChange={(open) => !open && setSelectedPhoto(null)}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        canEdit={permissions.canManage}
        canDelete={permissions.canDelete}
      />
    </>
  );
};

export default TownPhotoGallery; 
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
import { useNationGallery } from '@/hooks/useNationGallery';
import NationPhotoUploadDialog from './NationPhotoUploadDialog';
import NationPhotoDetailDialog from './NationPhotoDetailDialog';
import { NationPhoto, NationGalleryService } from '@/services/nationGalleryService';

interface NationPhotoGalleryProps {
  nationName: string;
  className?: string;
}

const NationPhotoGallery = ({ nationName, className = "" }: NationPhotoGalleryProps) => {
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
  } = useNationGallery(nationName);

  const [selectedPhoto, setSelectedPhoto] = useState<NationPhoto | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPhotos, setFilteredPhotos] = useState<NationPhoto[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Convert old custom domain URLs to Supabase URLs
  const convertImageUrl = (url: string): string => {
    if (url.includes('storage.nordics.world')) {
      // Extract the path after the bucket name and convert to Supabase URL
      const pathMatch = url.match(/\/nation-town-images\/(.+)$/);
      if (pathMatch) {
        const storagePath = pathMatch[1];
        return `https://erdconvorgecupvavlwv.supabase.co/storage/v1/object/public/nation-town-images/${storagePath}`;
      }
    }
    return url;
  };

  // Handle image error with fallback
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, photo: NationPhoto) => {
    const img = e.currentTarget;
    const originalUrl = photo.file_url;
    
    console.error('Failed to load image:', originalUrl);
    
    // Try to convert the URL if it's the old custom domain
    const convertedUrl = convertImageUrl(originalUrl);
    
    if (convertedUrl !== originalUrl) {
      console.log('Trying converted URL:', convertedUrl);
      img.src = convertedUrl;
      return;
    }
    
    // If conversion didn't help, use placeholder
    if (viewMode === 'grid') {
      img.src = 'https://via.placeholder.com/400x400/6B7280/FFFFFF?text=Image+Error';
    } else {
      img.src = 'https://via.placeholder.com/96x96/6B7280/FFFFFF?text=Error';
    }
  };

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
  const handlePhotoClick = async (photo: NationPhoto) => {
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
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Photo Gallery
              {photos.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {photos.length} photos
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* Search Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
                className="h-8 w-8 p-0"
              >
                <Search className="w-4 h-4" />
              </Button>
              
              {/* View Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="h-8 w-8 p-0"
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
              </Button>
              
              {/* Upload Button */}
              {permissions.canUpload && (
                <Button
                  size="sm"
                  onClick={() => setShowUploadDialog(true)}
                  disabled={uploading}
                  className="h-8"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Upload
                </Button>
              )}
            </div>
          </div>
          
          {/* Search Bar */}
          {showSearch && (
            <div className="mt-4">
              <Input
                placeholder="Search photos by title or description..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-md"
              />
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 p-4 mb-4 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          {displayPhotos.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-lg font-medium mb-2">
                {searchQuery.trim() ? 'No photos found' : 'No photos yet'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery.trim() 
                  ? 'Try adjusting your search terms'
                  : permissions.canUpload 
                    ? 'Upload the first photo to get started!'
                    : 'Photos will appear here once they are uploaded.'
                }
              </p>
              {permissions.canUpload && !searchQuery.trim() && (
                <Button onClick={() => setShowUploadDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload First Photo
                </Button>
              )}
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-4"
            }>
              {displayPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className={`group relative cursor-pointer transition-all duration-200 hover:scale-105 ${
                    viewMode === 'grid' 
                      ? 'bg-muted/50 rounded-lg overflow-hidden' 
                      : 'flex items-center gap-4 p-3 bg-muted/30 rounded-lg'
                  }`}
                  onClick={() => handlePhotoClick(photo)}
                >
                  {/* Image */}
                  <div className={viewMode === 'grid' ? 'relative' : 'flex-shrink-0'}>
                    <img
                      src={photo.file_url}
                      alt={photo.title}
                      className={
                        viewMode === 'grid'
                          ? 'w-full h-48 object-cover'
                          : 'w-24 h-24 object-cover rounded-lg'
                      }
                      onError={(e) => handleImageError(e, photo)}
                    />
                    {viewMode === 'grid' && (
                      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        {photo.width}×{photo.height}
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className={viewMode === 'grid' ? 'p-3' : 'flex-1 min-w-0'}>
                    <h3 className={`font-medium mb-1 ${viewMode === 'grid' ? 'text-sm' : 'text-base'}`}>
                      {photo.title}
                    </h3>
                    {photo.description && (
                      <p className={`text-muted-foreground ${viewMode === 'grid' ? 'text-xs' : 'text-sm'}`}>
                        {photo.description}
                      </p>
                    )}
                    <div className={`flex items-center gap-2 mt-2 ${viewMode === 'grid' ? 'text-xs' : 'text-sm'}`}>
                      <span className="text-muted-foreground">by {photo.uploaded_by_username}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{formatDate(photo.uploaded_at)}</span>
                      {photo.view_count > 0 && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {photo.view_count}
                          </span>
                        </>
                      )}
                    </div>
                    
                    {/* Tags */}
                    {photo.tags && photo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {photo.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  {permissions.canDelete && (
                    <div className={viewMode === 'grid' ? 'absolute top-2 left-2' : 'flex-shrink-0'}>
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
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <NationPhotoUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        nationName={nationName}
        onUpload={handleUpload}
        uploading={uploading}
        currentPhotoCount={photos.length}
      />

      {/* Photo Detail Dialog */}
      <NationPhotoDetailDialog
        photo={selectedPhoto}
        open={!!selectedPhoto}
        onOpenChange={(open) => !open && setSelectedPhoto(null)}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        canEdit={permissions.canUpload}
        canDelete={permissions.canDelete}
      />
    </>
  );
};

export default NationPhotoGallery;

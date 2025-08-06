import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { TownGalleryService, TownPhoto, UploadPhotoData, GalleryPermissions } from '@/services/townGalleryService';

export const useTownGallery = (townName: string) => {
  const { user, profile } = useAuth();
  const [photos, setPhotos] = useState<TownPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<GalleryPermissions>({
    canUpload: false,
    canDelete: false,
    canApprove: false
  });

  // Load photos
  const loadPhotos = useCallback(async () => {
    if (!townName) return;
    
    try {
      setLoading(true);
      setError(null);
      const photosData = await TownGalleryService.getTownPhotos(townName);
      setPhotos(photosData);
    } catch (err) {
      console.error('Error loading town photos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  }, [townName]);

  // Check permissions
  const checkPermissions = useCallback(async () => {
    if (!user?.id || !townName) {
      setPermissions({
        canUpload: false,
        canDelete: false,
        canApprove: false,
        reason: 'Not authenticated'
      });
      return;
    }

    try {
      const perms = await TownGalleryService.checkGalleryPermissions(townName, user.id);
      setPermissions(perms);
    } catch (err) {
      console.error('Error checking permissions:', err);
      setPermissions({
        canUpload: false,
        canDelete: false,
        canApprove: false,
        reason: 'Error checking permissions'
      });
    }
  }, [user?.id, townName]);

  // Upload photo
  const uploadPhoto = useCallback(async (uploadData: UploadPhotoData) => {
    if (!user?.id) {
      throw new Error('Not authenticated');
    }

    try {
      setUploading(true);
      setError(null);
      
      const newPhoto = await TownGalleryService.uploadPhoto(uploadData, user.id);
      setPhotos(prev => [newPhoto, ...prev]);
      
      return newPhoto;
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
      throw err;
    } finally {
      setUploading(false);
    }
  }, [user?.id]);

  // Delete photo
  const deletePhoto = useCallback(async (photoId: string) => {
    if (!user?.id) {
      throw new Error('Not authenticated');
    }

    try {
      setError(null);
      await TownGalleryService.deletePhoto(photoId, user.id);
      setPhotos(prev => prev.filter(photo => photo.id !== photoId));
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete photo');
      throw err;
    }
  }, [user?.id]);

  // Update photo
  const updatePhoto = useCallback(async (photoId: string, updates: Partial<Pick<TownPhoto, 'title' | 'description' | 'tags'>>) => {
    if (!user?.id) {
      throw new Error('Not authenticated');
    }

    try {
      setError(null);
      const updatedPhoto = await TownGalleryService.updatePhoto(photoId, updates, user.id);
      setPhotos(prev => prev.map(photo => 
        photo.id === photoId ? updatedPhoto : photo
      ));
      return updatedPhoto;
    } catch (err) {
      console.error('Error updating photo:', err);
      setError(err instanceof Error ? err.message : 'Failed to update photo');
      throw err;
    }
  }, [user?.id]);

  // Search photos
  const searchPhotos = useCallback(async (query: string) => {
    if (!townName) return [];
    
    try {
      setError(null);
      const searchResults = await TownGalleryService.searchPhotos(townName, query);
      return searchResults;
    } catch (err) {
      console.error('Error searching photos:', err);
      setError(err instanceof Error ? err.message : 'Failed to search photos');
      return [];
    }
  }, [townName]);

  // Increment view count
  const incrementViewCount = useCallback(async (photoId: string) => {
    try {
      await TownGalleryService.incrementViewCount(photoId);
      setPhotos(prev => prev.map(photo => 
        photo.id === photoId 
          ? { ...photo, view_count: photo.view_count + 1 }
          : photo
      ));
    } catch (err) {
      console.error('Error incrementing view count:', err);
    }
  }, []);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadPhotos();
    checkPermissions();
  }, [loadPhotos, checkPermissions]);

  return {
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
    refresh: loadPhotos
  };
}; 
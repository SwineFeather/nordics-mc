import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { NationGalleryService, NationPhoto, UploadPhotoData, GalleryPermissions } from '@/services/nationGalleryService';

export const useNationGallery = (nationName: string) => {
  const { user, profile } = useAuth();
  const [photos, setPhotos] = useState<NationPhoto[]>([]);
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
    if (!nationName) return;
    
    try {
      setLoading(true);
      setError(null);
      const photosData = await NationGalleryService.getNationPhotos(nationName);
      setPhotos(photosData);
    } catch (err) {
      console.error('Error loading nation photos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  }, [nationName]);

  // Check permissions
  const checkPermissions = useCallback(async () => {
    if (!user?.id || !nationName) {
      setPermissions({
        canUpload: false,
        canDelete: false,
        canApprove: false,
        reason: 'Not authenticated'
      });
      return;
    }

    try {
      const perms = await NationGalleryService.checkGalleryPermissions(nationName, user.id);
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
  }, [user?.id, nationName]);

  // Upload photo
  const uploadPhoto = useCallback(async (uploadData: UploadPhotoData) => {
    if (!user?.id) {
      throw new Error('You must be logged in to upload photos');
    }

    try {
      setUploading(true);
      setError(null);
      
      const newPhoto = await NationGalleryService.uploadPhoto(uploadData, user.id);
      
      // Add the new photo to the list
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
    try {
      const success = await NationGalleryService.deletePhoto(photoId);
      
      if (success) {
        // Remove the photo from the list
        setPhotos(prev => prev.filter(photo => photo.id !== photoId));
      }
      
      return success;
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete photo');
      return false;
    }
  }, []);

  // Update photo
  const updatePhoto = useCallback(async (photoId: string, updates: Partial<NationPhoto>) => {
    try {
      const success = await NationGalleryService.updatePhoto(photoId, updates);
      
      if (success) {
        // Update the photo in the list
        setPhotos(prev => prev.map(photo => 
          photo.id === photoId ? { ...photo, ...updates } : photo
        ));
      }
      
      return success;
    } catch (err) {
      console.error('Error updating photo:', err);
      setError(err instanceof Error ? err.message : 'Failed to update photo');
      return false;
    }
  }, []);

  // Search photos
  const searchPhotos = useCallback(async (query: string) => {
    if (!nationName) return [];
    
    try {
      return await NationGalleryService.searchPhotos(nationName, query);
    } catch (err) {
      console.error('Error searching photos:', err);
      return [];
    }
  }, [nationName]);

  // Increment view count
  const incrementViewCount = useCallback(async (photoId: string) => {
    try {
      return await NationGalleryService.incrementViewCount(photoId);
    } catch (err) {
      console.error('Error incrementing view count:', err);
      return false;
    }
  }, []);

  // Refresh photos
  const refresh = useCallback(() => {
    loadPhotos();
  }, [loadPhotos]);

  // Load photos and check permissions on mount
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
    refresh
  };
};

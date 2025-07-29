import { useState, useEffect } from 'react';
import { DynamicImageService } from '../services/dynamicImageService';

interface UseDynamicImageOptions {
  onError?: (error: Error) => void;
  onSuccess?: (url: string) => void;
}

export function useDynamicImage(
  name: string,
  type: 'nation' | 'town',
  customImageUrl?: string | null,
  options?: UseDynamicImageOptions
) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let finalUrl: string;

        if (type === 'nation') {
          finalUrl = await DynamicImageService.getNationImageWithFallback(name, customImageUrl);
        } else {
          finalUrl = await DynamicImageService.getTownImageWithFallback(name, customImageUrl);
        }

        if (isMounted) {
          setImageUrl(finalUrl);
          setIsLoading(false);
          options?.onSuccess?.(finalUrl);
        }
      } catch (err) {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error('Failed to load image');
          setError(error);
          setIsLoading(false);
          options?.onError?.(error);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [name, type, customImageUrl, options]);

  return {
    imageUrl,
    isLoading,
    error,
    reload: () => {
      setIsLoading(true);
      setError(null);
      // Trigger reload by changing the key
    }
  };
}

export function useNationImage(
  nationName: string,
  customImageUrl?: string | null,
  options?: UseDynamicImageOptions
) {
  return useDynamicImage(nationName, 'nation', customImageUrl, options);
}

export function useTownImage(
  townName: string,
  customImageUrl?: string | null,
  options?: UseDynamicImageOptions
) {
  return useDynamicImage(townName, 'town', customImageUrl, options);
} 
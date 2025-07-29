import React, { createContext, useContext, useState, useEffect } from 'react';
import { QualitySettings, QualityLevel } from './types';

interface QualityContextType {
  quality: QualitySettings;
  setQuality: (settings: QualitySettings) => void;
  setQualityLevel: (level: QualityLevel) => void;
  getTexturePath: (baseName: string) => string;
  getGeometrySegments: (baseSegments: number) => number;
  getLightingEnabled: () => boolean;
  getShadowEnabled: () => boolean;
  getMaxTerritories: () => number;
  getMaxStructures: () => number;
  getMaxTrails: () => number;
}

const QualityContext = createContext<QualityContextType | undefined>(undefined);

// Start with low quality by default for better performance
const defaultQuality: QualitySettings = {
  level: 'low',
  textureQuality: 'low',
  geometryQuality: 'low',
  lightingQuality: 'low'
};

// Quality presets with more aggressive performance settings
const qualityPresets: Record<QualityLevel, QualitySettings> = {
  low: {
    level: 'low',
    textureQuality: 'low',
    geometryQuality: 'low',
    lightingQuality: 'low'
  },
  medium: {
    level: 'medium',
    textureQuality: 'medium',
    geometryQuality: 'low', // Keep geometry low even in medium
    lightingQuality: 'low'  // Keep lighting low even in medium
  },
  high: {
    level: 'high',
    textureQuality: 'high',
    geometryQuality: 'medium', // Don't go full geometry even in high
    lightingQuality: 'medium'  // Don't go full lighting even in high
  }
};

// Texture quality mapping
const textureQualitySuffix: Record<QualityLevel, string> = {
  low: '-low.jpg',
  medium: '-med.jpg',
  high: '-full.jpg'
};

// Geometry quality mapping (more aggressive reduction)
const geometryQualityMultiplier: Record<QualityLevel, number> = {
  low: 0.1,    // Only 10% of base segments
  medium: 0.25, // Only 25% of base segments
  high: 0.5     // Only 50% of base segments
};

// Object limits for performance (excluding plots - show all plots)
const objectLimits: Record<QualityLevel, { territories: number; structures: number; trails: number }> = {
  low: { territories: 20, structures: 10, trails: 5 },
  medium: { territories: 50, structures: 25, trails: 15 },
  high: { territories: 100, structures: 50, trails: 30 }
};

export const QualityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quality, setQualityState] = useState<QualitySettings>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('nyrvalos-quality');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultQuality;
      }
    }
    return defaultQuality;
  });

  // Save to localStorage when quality changes
  useEffect(() => {
    localStorage.setItem('nyrvalos-quality', JSON.stringify(quality));
  }, [quality]);

  const setQuality = (settings: QualitySettings) => {
    setQualityState(settings);
  };

  const setQualityLevel = (level: QualityLevel) => {
    setQualityState(qualityPresets[level]);
  };

  const getTexturePath = (baseName: string): string => {
    const suffix = textureQualitySuffix[quality.textureQuality];
    return `/nyrvalos/${baseName}${suffix}`;
  };

  const getGeometrySegments = (baseSegments: number): number => {
    const multiplier = geometryQualityMultiplier[quality.geometryQuality];
    return Math.max(1, Math.floor(baseSegments * multiplier));
  };

  const getLightingEnabled = (): boolean => {
    return quality.lightingQuality !== 'low';
  };

  const getShadowEnabled = (): boolean => {
    return quality.lightingQuality === 'high';
  };

  const getMaxTerritories = (): number => {
    return objectLimits[quality.level].territories;
  };

  const getMaxStructures = (): number => {
    return objectLimits[quality.level].structures;
  };

  const getMaxTrails = (): number => {
    return objectLimits[quality.level].trails;
  };

  const value: QualityContextType = {
    quality,
    setQuality,
    setQualityLevel,
    getTexturePath,
    getGeometrySegments,
    getLightingEnabled,
    getShadowEnabled,
    getMaxTerritories,
    getMaxStructures,
    getMaxTrails
  };

  return (
    <QualityContext.Provider value={value}>
      {children}
    </QualityContext.Provider>
  );
};

export const useQuality = (): QualityContextType => {
  const context = useContext(QualityContext);
  if (context === undefined) {
    throw new Error('useQuality must be used within a QualityProvider');
  }
  return context;
}; 
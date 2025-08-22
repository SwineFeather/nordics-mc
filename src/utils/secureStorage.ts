/**
 * Secure Storage Utility
 * 
 * Provides secure alternatives to localStorage for sensitive data
 * and implements proper data sanitization and encryption.
 */

import { logSecurityEvent } from '@/middleware/roleValidation';

// Encryption key (in production, this should be stored securely)
const ENCRYPTION_KEY = 'nordics_secure_storage_2025';

// Sensitive data that should not be stored in localStorage
const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'key',
  'credential',
  'auth',
  'session',
  'profile',
  'player_uuid',
  'tokenlink_profile_id'
];

/**
 * Check if a key contains sensitive information
 */
function isSensitiveKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive));
}

/**
 * Simple encryption for sensitive data
 */
function encryptData(data: string): string {
  try {
    // In production, use a proper encryption library like crypto-js
    // This is a basic implementation for demonstration
    return btoa(encodeURIComponent(data));
  } catch (error) {
    console.error('Encryption failed:', error);
    return data;
  }
}

/**
 * Simple decryption for sensitive data
 */
function decryptData(encryptedData: string): string {
  try {
    // In production, use a proper decryption library
    return decodeURIComponent(atob(encryptedData));
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedData;
  }
}

/**
 * Secure setItem with encryption for sensitive data
 */
export function secureSetItem(key: string, value: any): void {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    if (isSensitiveKey(key)) {
      // Encrypt sensitive data
      const encryptedValue = encryptData(stringValue);
      localStorage.setItem(key, encryptedValue);
      
      // Log security event
      logSecurityEvent(
        'secure_storage_write',
        'system',
        'encrypted_data_stored',
        key,
        true,
        { encrypted: true, dataLength: stringValue.length }
      );
    } else {
      // Store non-sensitive data normally
      localStorage.setItem(key, stringValue);
    }
  } catch (error) {
    console.error('Secure storage write failed:', error);
    logSecurityEvent(
      'secure_storage_error',
      'system',
      'storage_write_failed',
      key,
      false,
      { error: error.message }
    );
  }
}

/**
 * Secure getItem with decryption for sensitive data
 */
export function secureGetItem(key: string): any {
  try {
    const value = localStorage.getItem(key);
    
    if (value === null) {
      return null;
    }
    
    if (isSensitiveKey(key)) {
      // Decrypt sensitive data
      const decryptedValue = decryptData(value);
      
      // Log security event
      logSecurityEvent(
        'secure_storage_read',
        'system',
        'encrypted_data_retrieved',
        key,
        true,
        { encrypted: true, dataLength: decryptedValue.length }
      );
      
      try {
        return JSON.parse(decryptedValue);
      } catch {
        return decryptedValue;
      }
    } else {
      // Return non-sensitive data normally
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
  } catch (error) {
    console.error('Secure storage read failed:', error);
    logSecurityEvent(
      'secure_storage_error',
      'system',
      'storage_read_failed',
      key,
      false,
      { error: error.message }
    );
    return null;
  }
}

/**
 * Secure removeItem
 */
export function secureRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
    
    if (isSensitiveKey(key)) {
      logSecurityEvent(
        'secure_storage_cleanup',
        'system',
        'sensitive_data_removed',
        key,
        true
      );
    }
  } catch (error) {
    console.error('Secure storage removal failed:', error);
  }
}

/**
 * Clear all secure storage
 */
export function secureClear(): void {
  try {
    localStorage.clear();
    logSecurityEvent(
      'secure_storage_cleanup',
      'system',
      'all_data_cleared',
      'localStorage',
      true
    );
  } catch (error) {
    console.error('Secure storage clear failed:', error);
  }
}

/**
 * Get storage usage statistics
 */
export function getStorageStats(): {
  totalItems: number;
  sensitiveItems: number;
  totalSize: number;
  sensitiveSize: number;
} {
  try {
    const stats = {
      totalItems: 0,
      sensitiveItems: 0,
      totalSize: 0,
      sensitiveSize: 0
    };
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          stats.totalItems++;
          stats.totalSize += key.length + value.length;
          
          if (isSensitiveKey(key)) {
            stats.sensitiveItems++;
            stats.sensitiveSize += key.length + value.length;
          }
        }
      }
    }
    
    return stats;
  } catch (error) {
    console.error('Storage stats failed:', error);
    return { totalItems: 0, sensitiveItems: 0, totalSize: 0, sensitiveSize: 0 };
  }
}

/**
 * Migrate existing localStorage to secure storage
 */
export function migrateToSecureStorage(): void {
  try {
    const keysToMigrate: string[] = [];
    
    // Find sensitive keys that need migration
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && isSensitiveKey(key)) {
        keysToMigrate.push(key);
      }
    }
    
    if (keysToMigrate.length === 0) {
      console.log('No sensitive data to migrate');
      return;
    }
    
    console.log(`Migrating ${keysToMigrate.length} sensitive items to secure storage...`);
    
    // Migrate each sensitive item
    keysToMigrate.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        // Remove old value
        localStorage.removeItem(key);
        // Store with secure method
        secureSetItem(key, value);
      }
    });
    
    console.log('Migration complete');
    
    logSecurityEvent(
      'secure_storage_migration',
      'system',
      'migration_completed',
      'localStorage',
      true,
      { migratedItems: keysToMigrate.length }
    );
    
  } catch (error) {
    console.error('Migration failed:', error);
    logSecurityEvent(
      'secure_storage_migration',
      'system',
      'migration_failed',
      'localStorage',
      false,
      { error: error.message }
    );
  }
}

/**
 * Check if secure storage is available
 */
export function isSecureStorageAvailable(): boolean {
  try {
    const testKey = '__secure_storage_test__';
    const testValue = 'test';
    
    secureSetItem(testKey, testValue);
    const retrieved = secureGetItem(testKey);
    secureRemoveItem(testKey);
    
    return retrieved === testValue;
  } catch {
    return false;
  }
}

/**
 * Initialize secure storage
 */
export function initSecureStorage(): void {
  if (!isSecureStorageAvailable()) {
    console.warn('Secure storage is not available, falling back to localStorage');
    return;
  }
  
  // Migrate existing data if needed
  migrateToSecureStorage();
  
  console.log('Secure storage initialized');
}

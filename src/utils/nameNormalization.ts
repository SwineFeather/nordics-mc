/**
 * Utility functions for normalizing entity names with special characters
 * This helps with filename generation for towns and nations with Nordic characters
 */

/**
 * Normalize entity name for safe filename generation
 * Handles Nordic characters and other special characters
 */
export function normalizeEntityName(name: string): string {
  // First, normalize Unicode characters (decomposes characters like å, ö, ä)
  const normalized = name.normalize('NFD');
  
  // Create a mapping for Nordic and other special characters
  const charMap: { [key: string]: string } = {
    // Nordic characters
    'å': 'a',
    'ä': 'a', 
    'ö': 'o',
    'Å': 'A',
    'Ä': 'A',
    'Ö': 'O',
    // Other common special characters
    'é': 'e',
    'è': 'e',
    'ê': 'e',
    'ë': 'e',
    'á': 'a',
    'à': 'a',
    'â': 'a',
    'ã': 'a',
    'í': 'i',
    'ì': 'i',
    'î': 'i',
    'ï': 'i',
    'ó': 'o',
    'ò': 'o',
    'ô': 'o',
    'õ': 'o',
    'ú': 'u',
    'ù': 'u',
    'û': 'u',
    'ü': 'u',
    'ý': 'y',
    'ÿ': 'y',
    'ñ': 'n',
    'ç': 'c',
    'ß': 'ss',
    // Remove diacritics (combining marks)
    '\u0300': '', // grave accent
    '\u0301': '', // acute accent
    '\u0302': '', // circumflex
    '\u0303': '', // tilde
    '\u0304': '', // macron
    '\u0306': '', // breve
    '\u0307': '', // dot above
    '\u0308': '', // diaeresis
    '\u0309': '', // hook above
    '\u030A': '', // ring above
    '\u030B': '', // double acute
    '\u030C': '', // caron
    '\u0327': '', // cedilla
    '\u0328': '', // ogonek
  };

  // Replace special characters
  let result = normalized;
  for (const [char, replacement] of Object.entries(charMap)) {
    result = result.replace(new RegExp(char, 'g'), replacement);
  }

  // Remove any remaining non-alphanumeric characters except spaces and underscores
  result = result
    .replace(/[^a-zA-Z0-9_\s]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();

  // Ensure the result is not empty
  if (!result) {
    result = 'unnamed';
  }

  return result;
}

/**
 * Normalize entity name for safe filename generation while preserving case
 * Handles Nordic characters and other special characters
 */
export function casePreservingNormalizeEntityName(name: string): string {
  // First, normalize Unicode characters (decomposes characters like å, ö, ä)
  const normalized = name.normalize('NFD');
  
  // Create a mapping for Nordic and other special characters
  const charMap: { [key: string]: string } = {
    // Nordic characters
    'å': 'a',
    'ä': 'a', 
    'ö': 'o',
    'Å': 'A',
    'Ä': 'A',
    'Ö': 'O',
    // Other common special characters
    'é': 'e',
    'è': 'e',
    'ê': 'e',
    'ë': 'e',
    'á': 'a',
    'à': 'a',
    'â': 'a',
    'ã': 'a',
    'í': 'i',
    'ì': 'i',
    'î': 'i',
    'ï': 'i',
    'ó': 'o',
    'ò': 'o',
    'ô': 'o',
    'õ': 'o',
    'ú': 'u',
    'ù': 'u',
    'û': 'u',
    'ü': 'u',
    'ý': 'y',
    'ÿ': 'y',
    'ñ': 'n',
    'ç': 'c',
    'ß': 'ss',
    // Remove diacritics (combining marks)
    '\u0300': '', // grave accent
    '\u0301': '', // acute accent
    '\u0302': '', // circumflex
    '\u0303': '', // tilde
    '\u0304': '', // macron
    '\u0306': '', // breve
    '\u0307': '', // dot above
    '\u0308': '', // diaeresis
    '\u0309': '', // hook above
    '\u030A': '', // ring above
    '\u030B': '', // double acute
    '\u030C': '', // caron
    '\u0327': '', // cedilla
    '\u0328': '', // ogonek
  };

  // Replace special characters
  let result = normalized;
  for (const [char, replacement] of Object.entries(charMap)) {
    result = result.replace(new RegExp(char, 'g'), replacement);
  }

  // Remove any remaining non-alphanumeric characters except spaces and underscores
  result = result
    .replace(/[^a-zA-Z0-9_\s]/g, '')
    .replace(/\s+/g, '_');

  // Ensure the result is not empty
  if (!result) {
    result = 'unnamed';
  }

  return result;
}

/**
 * Generate filename for entity
 */
export function generateEntityFilename(entityName: string, entityType: 'nation' | 'town'): string {
  // Use case-preserving normalization for towns and nations to maintain their original case
  const cleanName = casePreservingNormalizeEntityName(entityName);
  return `${cleanName}.png`;
}

/**
 * Test function to demonstrate character normalization
 */
export function testNameNormalization(): void {
  const testCases = [
    // Nordic towns
    'Göteborg',
    'Malmö',
    'Århus',
    'Örebro',
    'Ängelholm',
    'Härnösand',
    'Östersund',
    'Åmål',
    'Örnsköldsvik',
    'Älvsbyn',
    
    // Towns with other special characters
    'São Paulo',
    'Córdoba',
    'München',
    'Béziers',
    'Nîmes',
    'Poitiers',
    'Liège',
    'Brno',
    'København',
    'Reykjavík',
    
    // Towns with spaces and underscores
    'New York',
    'Los Angeles',
    'San Francisco',
    'North Sea League',
    'Constellation',
    
    // Towns with numbers
    'Town123',
    'City_456',
    'Village 789',
    
    // Edge cases
    'A',
    'Å',
    'Ö',
    'Ä',
    '!!!',
    '',
    '   ',
  ];

  console.log('=== Name Normalization Test Results ===');
  testCases.forEach(name => {
    const normalized = normalizeEntityName(name);
    const filename = generateEntityFilename(name, 'town');
    console.log(`"${name}" → "${normalized}" → "${filename}"`);
  });
  console.log('=== End Test Results ===');
}

// Example usage:
// testNameNormalization(); 
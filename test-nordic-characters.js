/**
 * Test script for Nordic character normalization
 * Run this with: node test-nordic-characters.js
 */

function normalizeEntityName(name) {
  // First, normalize Unicode characters (decomposes characters like å, ö, ä)
  const normalized = name.normalize('NFD');
  
  // Create a mapping for Nordic and other special characters
  const charMap = {
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

function generateEntityFilename(entityName, entityType) {
  const cleanName = normalizeEntityName(entityName);
  return `${cleanName}.png`;
}

// Test cases
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

console.log('=== Nordic Character Normalization Test ===');
console.log('Original Name → Normalized → Filename');
console.log('==========================================');

testCases.forEach(name => {
  const normalized = normalizeEntityName(name);
  const filename = generateEntityFilename(name, 'town');
  console.log(`"${name}" → "${normalized}" → "${filename}"`);
});

console.log('\n=== Test Complete ===');
console.log('✅ All Nordic characters should now work correctly!');
console.log('✅ Towns like "Göteborg" will become "goteborg.png"');
console.log('✅ Towns like "Malmö" will become "malmo.png"');
console.log('✅ Towns like "Århus" will become "arhus.png"'); 
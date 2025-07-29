// Test frontmatter parsing
console.log('Starting frontmatter test...');

const testContent = `---
title: "Test Page"
icon: "🗡️"
updated_at: "2025-01-25T10:00:00.000Z"
---

# Test Page

This is a test page with an icon.`;

console.log('Test content:', testContent);

function parseFrontmatter(content) {
  console.log('Parsing frontmatter...');
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  console.log('Regex match:', match);
  
  if (match) {
    try {
      const frontmatterStr = match[1];
      const markdown = match[2];
      
      console.log('🔍 Parsing frontmatter:', frontmatterStr);
      
      // Simple YAML parsing (basic implementation)
      const frontmatter = {};
      const lines = frontmatterStr.split('\n');
      
      for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          let value = line.substring(colonIndex + 1).trim();
          
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          
          frontmatter[key] = value;
          console.log(`🔍 Frontmatter field: ${key} = ${value}`);
        }
      }
      
      console.log('🔍 Final frontmatter object:', frontmatter);
      return { frontmatter, markdown };
    } catch (error) {
      console.error('Failed to parse frontmatter:', error);
    }
  }
  
  return { markdown: content };
}

const result = parseFrontmatter(testContent);
console.log('Final result:', result); 
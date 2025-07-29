// Test actual wiki files for icons
console.log('Testing actual wiki files for icons...');

// Simulate the frontmatter parsing from the actual service
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
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

// Test with some sample content that might exist in actual wiki files
const testFiles = [
  {
    name: 'Sample with icon',
    content: `---
title: "Test Page"
icon: "🗡️"
updated_at: "2025-01-25T10:00:00.000Z"
---

# Test Page

This is a test page with an icon.`
  },
  {
    name: 'Sample without icon',
    content: `---
title: "Another Page"
updated_at: "2025-01-25T10:00:00.000Z"
---

# Another Page

This page has no icon.`
  },
  {
    name: 'Sample with no frontmatter',
    content: `# Simple Page

This page has no frontmatter at all.`
  }
];

testFiles.forEach((file, index) => {
  console.log(`\n📄 Testing file ${index + 1}: ${file.name}`);
  const result = parseFrontmatter(file.content);
  console.log(`Icon found: ${result.frontmatter?.icon || 'NO ICON'}`);
}); 
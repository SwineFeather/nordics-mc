import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Code, 
  Image, 
  Table, 
  AlertTriangle, 
  Info, 
  Lightbulb, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { useState } from 'react';

const DemoContent: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const demoMarkdown = `# 🎉 Enhanced Wiki Features Demo

Welcome to the **Nordics Nexus Forge** enhanced wiki system! This page showcases all the new features we've implemented.

## ✨ Enhanced Markdown Rendering

Our new markdown renderer includes:

### 🎨 Better Styling
- **Gradient text** for main headings
- **Color-coded** subheadings
- **Enhanced typography** with proper spacing
- **Beautiful code blocks** with syntax highlighting

### 💻 Syntax Highlighting

\`\`\`javascript
// JavaScript example with syntax highlighting
function greetNordics() {
  const nations = ['Sweden', 'Norway', 'Denmark', 'Finland', 'Iceland'];
  nations.forEach(nation => {
    console.log(\`Hello from \${nation}! 🇸🇪🇳🇴🇩🇰🇫🇮🇮🇸\`);
  });
  return "Welcome to the Nordic community!";
}

// Async/await example
async function fetchNordicData() {
  try {
    const response = await fetch('/api/nordics');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch Nordic data:', error);
  }
}
\`\`\`

\`\`\`python
# Python example
def nordic_calculator():
    """Calculate Nordic statistics"""
    nordic_countries = {
        'Sweden': {'population': 10.4, 'area': 450295},
        'Norway': {'population': 5.4, 'area': 385207},
        'Denmark': {'population': 5.8, 'area': 43094},
        'Finland': {'population': 5.5, 'area': 338424},
        'Iceland': {'population': 0.4, 'area': 103000}
    }
    
    total_population = sum(country['population'] for country in nordic_countries.values())
    total_area = sum(country['area'] for country in nordic_countries.values())
    
    return {
        'total_population': total_population,
        'total_area': total_area,
        'average_population': total_population / len(nordic_countries)
    }
\`\`\`

\`\`\`css
/* CSS styling for Nordic theme */
.nordic-theme {
  --sweden-red: #006AA7;
  --sweden-yellow: #FECC00;
  --norway-red: #EF2B2D;
  --norway-blue: #002868;
  --denmark-red: #C8102E;
  --finland-blue: #003580;
  --iceland-blue: #02529C;
  --iceland-red: #DC1E35;
}

.nordic-header {
  background: linear-gradient(135deg, 
    var(--sweden-red), 
    var(--norway-blue), 
    var(--denmark-red), 
    var(--finland-blue), 
    var(--iceland-blue)
  );
  color: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
}
\`\`\`

## 📊 Enhanced Tables

Our table editor creates beautiful, responsive tables:

| Feature | Description | Status |
|---------|-------------|--------|
| **Syntax Highlighting** | Code blocks with language-specific colors | ✅ Complete |
| **Media Upload** | Drag & drop image and file uploads | ✅ Complete |
| **Table Editor** | Visual table creation and editing | ✅ Complete |
| **Special Blockquotes** | Warning, info, tip, and danger styles | ✅ Complete |
| **Enhanced Links** | External link indicators and hover effects | ✅ Complete |
| **Auto-save** | Automatic content saving every 30 seconds | ✅ Complete |

## 🖼️ Media Support

### Image Handling
- **Loading states** with spinners
- **Error handling** for broken images
- **Click to expand** functionality
- **Download and open** actions
- **Responsive design** for all screen sizes

### File Uploads
- **Drag & drop** interface
- **Multiple file types** supported
- **Progress indicators**
- **Automatic markdown generation**

## 💬 Special Blockquote Types

> ⚠️ **Warning**: This is a warning message that stands out with yellow styling and an alert icon. Use this for important notices that users should be aware of.

> ℹ️ **Information**: This is an informational message with blue styling. Perfect for providing additional context or helpful details.

> 💡 **Tip**: This is a tip message with green styling. Great for sharing best practices, shortcuts, or helpful advice.

> 🚨 **Danger**: This is a danger message with red styling. Use this for critical warnings or important security notices.

## 🔗 Enhanced Links

Our link system includes:
- [Nordics Nexus Forge Homepage](https://nordics-nexus-forge.com) - External link with icon
- [Community Guidelines](https://community.nordics-nexus-forge.com) - Important community resource
- [API Documentation](https://api.nordics-nexus-forge.com) - Technical reference

## 📝 Advanced Features

### Inline Code
Use \`inline code\` for technical terms, file names, or short commands.

### Lists and Organization
- **Unordered lists** with custom styling
- **Numbered lists** for step-by-step instructions
- **Nested lists** for complex organization

### Horizontal Rules
Use \`---\` to create visual separators:

---

## 🎯 Getting Started

1. **Explore the features** - Try out the different markdown elements
2. **Upload media** - Test the drag & drop functionality
3. **Create tables** - Use the visual table editor
4. **Use special blockquotes** - Try the different alert types
5. **Write code** - Test syntax highlighting in various languages

## 🚀 Performance Features

- **Lazy loading** for images and media
- **Optimized rendering** for large documents
- **Auto-save** to prevent data loss
- **Responsive design** for all devices
- **Accessibility** compliant with WCAG guidelines

---

*This demo showcases the enhanced wiki system for Nordics Nexus Forge. All features are designed to provide a modern, user-friendly experience for creating and managing documentation.*`;

  const copyDemoContent = async () => {
    try {
      await navigator.clipboard.writeText(demoMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy demo content:', err);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span>Enhanced Features Demo</span>
          <Badge variant="secondary" className="text-xs">
            Demo
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center space-x-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Code className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Syntax Highlighting</p>
              <p className="text-xs text-muted-foreground">Multiple languages</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <Image className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">Media Support</p>
              <p className="text-xs text-muted-foreground">Upload & display</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <Table className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm font-medium">Table Editor</p>
              <p className="text-xs text-muted-foreground">Visual creation</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm font-medium">Special Alerts</p>
              <p className="text-xs text-muted-foreground">Warning, info, tips</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted/20 rounded-lg">
          <h4 className="font-medium mb-2">Demo Content</h4>
          <p className="text-sm text-muted-foreground mb-3">
            This demo showcases all the enhanced markdown features. You can copy this content to test the new functionality.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={copyDemoContent}
            className="flex items-center space-x-2"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span>{copied ? 'Copied!' : 'Copy Demo Content'}</span>
          </Button>
        </div>

        <div className="p-4 bg-muted/20 rounded-lg">
          <h4 className="font-medium mb-2">How to Use</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Syntax Highlighting:</strong> Use \`\`\`language for code blocks</li>
            <li>• <strong>Special Blockquotes:</strong> Start with ⚠️, ℹ️, 💡, or 🚨</li>
            <li>• <strong>Tables:</strong> Use the table editor or markdown syntax</li>
            <li>• <strong>Media:</strong> Upload files and get automatic markdown links</li>
            <li>• <strong>Auto-save:</strong> Content saves automatically every 30 seconds</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DemoContent; 
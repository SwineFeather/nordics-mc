/**
 * HTML Sanitization Utility
 * Prevents XSS attacks by safely filtering HTML content
 */

// Allowed HTML tags and their allowed attributes
const ALLOWED_TAGS: Record<string, string[]> = {
  // Basic formatting
  'p': ['class'],
  'br': [],
  'hr': ['class'],
  
  // Headers
  'h1': ['class'],
  'h2': ['class'],
  'h3': ['class'],
  'h4': ['class'],
  'h5': ['class'],
  'h6': ['class'],
  
  // Text formatting
  'strong': ['class'],
  'b': ['class'],
  'em': ['class'],
  'i': ['class'],
  'u': ['class'],
  's': ['class'],
  'del': ['class'],
  'mark': ['class'],
  
  // Code
  'code': ['class'],
  'pre': ['class'],
  
  // Lists
  'ul': ['class'],
  'ol': ['class'],
  'li': ['class'],
  
  // Links (with security attributes)
  'a': ['href', 'class', 'target', 'rel'],
  
  // Blockquotes
  'blockquote': ['class'],
  
  // Tables
  'table': ['class'],
  'thead': ['class'],
  'tbody': ['class'],
  'tr': ['class'],
  'th': ['class'],
  'td': ['class'],
  
  // Div and span for styling
  'div': ['class'],
  'span': ['class'],
};

// Allowed CSS classes (whitelist approach)
const ALLOWED_CLASSES = [
  // Tailwind classes
  'text-', 'bg-', 'border-', 'rounded-', 'p-', 'm-', 'w-', 'h-',
  'flex', 'grid', 'items-', 'justify-', 'space-', 'gap-',
  'font-', 'text-', 'leading-', 'tracking-',
  'opacity-', 'transition-', 'transform-', 'hover:', 'focus:',
  'dark:', 'first:', 'last:', 'odd:', 'even:',
  
  // Custom classes
  'prose', 'prose-invert', 'max-w-none', 'mb-4', 'leading-relaxed',
  'text-foreground', 'text-primary', 'text-secondary', 'text-accent',
  'text-muted-foreground', 'bg-muted', 'border-border',
  'font-semibold', 'font-medium', 'italic', 'font-mono',
  'text-sm', 'text-xs', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl',
  'rounded-lg', 'rounded-xl', 'border-l-4', 'border-b', 'border-t',
  'p-4', 'px-4', 'py-2', 'pl-4', 'my-4', 'mb-2', 'mt-8', 'mt-6', 'mt-5',
  'overflow-x-auto', 'overflow-hidden', 'flex-shrink-0',
  'text-blue-600', 'text-green-600', 'text-red-600', 'text-orange-600',
  'text-gray-500', 'text-yellow-500', 'text-purple-500', 'text-cyan-500',
  'text-indigo-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500',
  'bg-red-500', 'bg-gray-500', 'bg-purple-500', 'bg-orange-500',
  'bg-cyan-500', 'bg-indigo-500', 'bg-gray-800', 'bg-gray-900',
  'text-white', 'text-gray-100', 'hover:bg-gray-700',
  'w-3', 'h-3', 'w-4', 'h-4', 'w-5', 'h-5', 'w-6', 'h-6',
  'mr-1', 'mt-0.5', 'space-x-1', 'space-x-2', 'space-x-4',
  'list-decimal', 'list-disc', 'ml-4',
  'underline', 'transition-colors', 'inline-flex', 'items-center',
  'justify-between', 'justify-end', 'flex-wrap', 'gap-1',
  'border-t', 'border-b', 'pt-4', 'pb-3', 'pb-2',
  'bg-muted/50', 'bg-muted/70', 'border-border/50', 'border-border/30',
  'border-primary/50', 'border-primary/30', 'bg-muted/30',
  'text-muted-foreground', 'text-foreground',
  'first:mt-0', 'group-hover:opacity-100', 'opacity-0',
  'transition-opacity', 'rounded-t-lg', 'rounded-b-lg',
  'text-center', 'py-8', 'p-4', 'border', 'rounded-lg',
  'bg-yellow-500/10', 'bg-blue-500/10', 'bg-green-500/10', 'bg-red-500/10',
  'border-yellow-500', 'border-blue-500', 'border-green-500', 'border-red-500',
  'text-yellow-700', 'text-blue-700', 'text-green-700', 'text-red-700',
  'dark:text-yellow-300', 'dark:text-blue-300', 'dark:text-green-300', 'dark:text-red-300',
];

// Allowed URL protocols
const ALLOWED_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Recursively sanitize the DOM tree
  sanitizeNode(tempDiv);

  return tempDiv.innerHTML;
}

/**
 * Sanitize a DOM node and its children
 */
function sanitizeNode(node: Node): void {
  if (node.nodeType === Node.TEXT_NODE) {
    return; // Text nodes are safe
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    const tagName = element.tagName.toLowerCase();

    // Check if tag is allowed
    if (!ALLOWED_TAGS[tagName]) {
      // Remove disallowed tags but keep their content
      const parent = element.parentNode;
      if (parent) {
        while (element.firstChild) {
          parent.insertBefore(element.firstChild, element);
        }
        parent.removeChild(element);
      }
      return;
    }

    // Sanitize attributes
    const allowedAttrs = ALLOWED_TAGS[tagName];
    const attributes = Array.from(element.attributes);

    for (const attr of attributes) {
      const attrName = attr.name.toLowerCase();
      const attrValue = attr.value;

      // Remove disallowed attributes
      if (!allowedAttrs.includes(attrName)) {
        element.removeAttribute(attrName);
        continue;
      }

      // Special handling for specific attributes
      if (attrName === 'href') {
        if (!isValidUrl(attrValue)) {
          element.removeAttribute(attrName);
        } else {
          // Ensure external links have security attributes
          if (attrValue.startsWith('http')) {
            element.setAttribute('target', '_blank');
            element.setAttribute('rel', 'noopener noreferrer');
          }
        }
      } else if (attrName === 'class') {
        // Sanitize CSS classes
        const classes = attrValue.split(' ').filter(cls => 
          ALLOWED_CLASSES.some(allowed => cls.startsWith(allowed))
        );
        if (classes.length > 0) {
          element.setAttribute('class', classes.join(' '));
        } else {
          element.removeAttribute('class');
        }
      } else if (attrName === 'target') {
        // Only allow specific target values
        if (!['_blank', '_self', '_parent', '_top'].includes(attrValue)) {
          element.removeAttribute('target');
        }
      } else if (attrName === 'rel') {
        // Only allow security-related rel values
        const relValues = attrValue.split(' ').filter(rel => 
          ['noopener', 'noreferrer', 'nofollow'].includes(rel)
        );
        if (relValues.length > 0) {
          element.setAttribute('rel', relValues.join(' '));
        } else {
          element.removeAttribute('rel');
        }
      }
    }
  }

  // Recursively sanitize children
  const children = Array.from(node.childNodes);
  for (const child of children) {
    sanitizeNode(child);
  }
}

/**
 * Check if a URL is valid and uses allowed protocols
 */
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url, window.location.origin);
    return ALLOWED_PROTOCOLS.includes(urlObj.protocol);
  } catch {
    // Relative URLs are allowed
    return !url.includes('javascript:') && !url.includes('data:');
  }
}

/**
 * Sanitize markdown content by converting it to safe HTML
 */
export function sanitizeMarkdown(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  // Strip YAML frontmatter blocks (e.g., ---\nkey: value\n---) before converting
  let withoutFrontmatter = markdown.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/g, '');

  // Also strip loose frontmatter-like metadata at the very top (no --- wrappers)
  // Only remove known keys to avoid eating real content
  withoutFrontmatter = withoutFrontmatter.replace(/^(?:\s*(title|updated_at|created_at|status|tags|icon|description)\s*:\s*.*\n)+\s*/i, '');

  // Convert markdown to HTML first, then sanitize
  const html = convertMarkdownToHtml(withoutFrontmatter);
  return sanitizeHtml(html);
}

/**
 * Convert markdown to HTML (basic implementation)
 */
function convertMarkdownToHtml(markdown: string): string {
  return markdown
    // Headers
    .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mb-4 text-foreground border-b border-border/50 pb-1">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-semibold mt-6 mb-3 text-foreground border-b border-border/50 pb-1">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-semibold mt-4 mb-2 text-foreground">$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4 class="text-xl font-medium mt-3 mb-2 text-foreground">$1</h4>')
    
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    
    // Code blocks and inline code
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted/50 p-4 rounded-xl border border-border/50 overflow-x-auto my-4"><code class="text-sm">$1</code></pre>')
    .replace(/`(.*?)`/g, '<code class="bg-muted/50 px-2 py-1 rounded text-sm font-mono border border-border/30">$1</code>')
    
    // Lists
    .replace(/^\- (.*$)/gim, '<li class="ml-4 mb-2 text-muted-foreground">• $1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 mb-2 text-muted-foreground list-decimal">$1</li>')
    
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:text-primary/80 underline transition-colors" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Horizontal rules
    .replace(/^---$/gim, '<hr class="border-border/50 my-8" />')
    
    // Blockquotes
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary/50 pl-4 py-2 bg-muted/30 rounded-r-lg my-4 italic text-muted-foreground">$1</blockquote>')
    
    // Line breaks
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/\n/g, '<br>');
} 
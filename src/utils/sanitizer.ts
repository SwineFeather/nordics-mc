
import DOMPurify from 'dompurify';

// Configure DOMPurify with secure defaults
const purifyConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
  ],
  ALLOWED_ATTR: ['class'],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  USE_PROFILES: { html: true },
};

export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, purifyConfig);
};

export const sanitizeText = (text: string): string => {
  // Remove all HTML tags and decode entities
  const div = document.createElement('div');
  div.innerHTML = text;
  return div.textContent || div.innerText || '';
};

export const validateInput = (input: string, maxLength: number = 1000): boolean => {
  if (!input || input.length > maxLength) return false;
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /vbscript:/i
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(input));
};

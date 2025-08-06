import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sanitizeHtml } from '@/utils/htmlSanitizer';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

const CodeBlock = ({ code, language = 'text', filename }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: "Code copied!",
        description: "Code has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
      toast({
        title: "Error",
        description: "Failed to copy code to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `code.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Code downloaded",
      description: "Code has been downloaded to your device.",
    });
  };

  const getLanguageColor = (lang: string) => {
    const colors: { [key: string]: string } = {
      javascript: 'bg-yellow-500',
      typescript: 'bg-blue-500',
      python: 'bg-green-500',
      java: 'bg-red-500',
      cpp: 'bg-purple-500',
      csharp: 'bg-purple-500',
      php: 'bg-indigo-500',
      ruby: 'bg-red-500',
      go: 'bg-cyan-500',
      rust: 'bg-orange-500',
      sql: 'bg-blue-500',
      html: 'bg-orange-500',
      css: 'bg-blue-500',
      json: 'bg-gray-500',
      yaml: 'bg-gray-500',
      markdown: 'bg-gray-500',
      bash: 'bg-gray-500',
      shell: 'bg-gray-500',
    };
    return colors[lang.toLowerCase()] || 'bg-gray-500';
  };

  const formatCode = (code: string, lang: string) => {
    // Simple syntax highlighting for common languages
    if (lang === 'javascript' || lang === 'typescript') {
      return code
        .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|default|async|await)\b/g, '<span class="text-blue-600 font-semibold">$1</span>')
        .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-orange-600">$1</span>')
        .replace(/\b(\d+)\b/g, '<span class="text-green-600">$1</span>')
        .replace(/"([^"]*)"/g, '<span class="text-red-600">"$1"</span>')
        .replace(/'([^']*)'/g, '<span class="text-red-600">\'$1\'</span>')
        .replace(/\/\/(.*)$/gm, '<span class="text-gray-500 italic">//$1</span>');
    }
    
    if (lang === 'python') {
      return code
        .replace(/\b(def|class|import|from|return|if|else|elif|for|while|try|except|finally|with|as|in|is|and|or|not|True|False|None)\b/g, '<span class="text-blue-600 font-semibold">$1</span>')
        .replace(/\b(\d+)\b/g, '<span class="text-green-600">$1</span>')
        .replace(/("""[\s\S]*?""")/g, '<span class="text-gray-500 italic">$1</span>')
        .replace(/("([^"]*)")/g, '<span class="text-red-600">$1</span>')
        .replace(/('([^']*)')/g, '<span class="text-red-600">$1</span>')
        .replace(/#(.*)$/gm, '<span class="text-gray-500 italic">#$1</span>');
    }
    
    if (lang === 'html') {
      return code
        .replace(/(&lt;[^&]*&gt;)/g, '<span class="text-blue-600">$1</span>')
        .replace(/(&lt;\/[^&]*&gt;)/g, '<span class="text-blue-600">$1</span>')
        .replace(/(\w+)=/g, '<span class="text-green-600">$1</span>=')
        .replace(/="([^"]*)"/g, '=<span class="text-red-600">"$1"</span>');
    }
    
    if (lang === 'css') {
      return code
        .replace(/([^{}]+)\s*{/g, '<span class="text-blue-600">$1</span> {')
        .replace(/([^:]+):/g, '<span class="text-green-600">$1</span>:')
        .replace(/:([^;]+);/g, ': <span class="text-red-600">$1</span>;');
    }
    
    return code;
  };

  return (
    <div className="relative group">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-800 text-white px-4 py-2 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getLanguageColor(language)}`} />
          <span className="text-sm font-medium">
            {filename || `${language.toUpperCase()} Code`}
          </span>
          <Badge variant="secondary" className="text-xs">
            {language}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-6 w-6 p-0 text-white hover:bg-gray-700"
          >
            <Download className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 w-6 p-0 text-white hover:bg-gray-700"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
      </div>
      
      {/* Code */}
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto">
        <code 
          className="text-sm font-mono"
          dangerouslySetInnerHTML={{ 
            __html: sanitizeHtml(formatCode(code, language)) 
          }}
        />
      </pre>
    </div>
  );
};

export default CodeBlock; 
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, List, ListOrdered, Code, Quote, Link } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your post content...',
  rows = 8,
  disabled = false
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertText = (text: string) => {
    document.execCommand('insertText', false, text);
    editorRef.current?.focus();
    handleInput();
  };

  const formatText = (format: string) => {
    switch (format) {
      case 'bold':
        execCommand('bold');
        break;
      case 'italic':
        execCommand('italic');
        break;
      case 'underline':
        execCommand('underline');
        break;
      case 'unordered-list':
        execCommand('insertUnorderedList');
        break;
      case 'ordered-list':
        execCommand('insertOrderedList');
        break;
      case 'code':
        insertText('`code`');
        break;
      case 'quote':
        insertText('> ');
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          execCommand('createLink', url);
        }
        break;
    }
  };

  const toolbarButtons = [
    { icon: Bold, label: 'Bold', format: 'bold' },
    { icon: Italic, label: 'Italic', format: 'italic' },
    { icon: Underline, label: 'Underline', format: 'underline' },
    { icon: List, label: 'Bullet List', format: 'unordered-list' },
    { icon: ListOrdered, label: 'Numbered List', format: 'ordered-list' },
    { icon: Code, label: 'Code', format: 'code' },
    { icon: Quote, label: 'Quote', format: 'quote' },
    { icon: Link, label: 'Link', format: 'link' },
  ];

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border border-gray-200 rounded-t-md bg-gray-50">
        <TooltipProvider>
          {toolbarButtons.map((button) => (
            <Tooltip key={button.format}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText(button.format)}
                  disabled={disabled}
                  className="h-8 w-8 p-0"
                >
                  <button.icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{button.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          min-h-[${rows * 1.5}rem] p-3 border border-gray-300 rounded-b-md
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          ${isFocused ? 'ring-2 ring-blue-500 border-transparent' : ''}
        `}
        style={{ minHeight: `${rows * 1.5}rem` }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
      
      {/* Help text */}
      <div className="text-xs text-gray-500">
        <p>Basic formatting: <strong>**bold**</strong>, <em>*italic*</em>, <code>`code`</code>, <code>{'>'} quote</code></p>
        <p>Lists: Use the toolbar buttons or type <code>-</code> for bullets, <code>1.</code> for numbered lists</p>
      </div>
    </div>
  );
}; 
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  X, 
  Copy,
  Check,
  AlertCircle,
  File,
  Music
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  progress?: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

interface MediaUploaderProps {
  onUploadComplete?: (files: MediaFile[]) => void;
  onInsertMedia?: (markdown: string) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  className?: string;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  onUploadComplete,
  onInsertMedia,
  maxFiles = 10,
  maxFileSize = 10, // 10MB
  allowedTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx'],
  className = ''
}) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-6 h-6" />;
    if (type.startsWith('video/')) return <Video className="w-6 h-6" />;
    if (type.startsWith('audio/')) return <Music className="w-6 h-6" />;
    if (type.includes('pdf')) return <FileText className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size exceeds ${maxFileSize}MB limit`;
    }

    // Check file type
    const isValidType = allowedTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('/*', '/'));
      }
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    });

    if (!isValidType) {
      return 'File type not allowed';
    }

    return null;
  };

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: MediaFile[] = [];
    
    Array.from(fileList).forEach(file => {
      const error = validateFile(file);
      if (error) {
        newFiles.push({
          id: generateId(),
          name: file.name,
          type: file.type,
          size: file.size,
          status: 'error',
          error
        });
      } else {
        newFiles.push({
          id: generateId(),
          name: file.name,
          type: file.type,
          size: file.size,
          status: 'uploading',
          progress: 0
        });
      }
    });

    setFiles(prev => [...prev, ...newFiles]);
    uploadFiles(newFiles);
  }, [maxFileSize, allowedTypes]);

  const uploadFiles = async (filesToUpload: MediaFile[]) => {
    setIsUploading(true);
    
    // Simulate file upload with progress
    for (const file of filesToUpload) {
      if (file.status === 'error') continue;
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, progress } : f
        ));
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Simulate successful upload
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { 
          ...f, 
          status: 'success', 
          url: `https://example.com/uploads/${file.name}`,
          progress: 100 
        } : f
      ));
    }
    
    setIsUploading(false);
    onUploadComplete?.(filesToUpload);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const copyMarkdown = (file: MediaFile) => {
    if (!file.url) return;
    
    let markdown = '';
    if (file.type.startsWith('image/')) {
      markdown = `![${file.name}](${file.url})`;
    } else if (file.type.startsWith('video/')) {
      markdown = `[${file.name}](${file.url})`;
    } else {
      markdown = `[${file.name}](${file.url})`;
    }
    
    navigator.clipboard.writeText(markdown);
    onInsertMedia?.(markdown);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'uploading': return 'text-blue-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Media Upload</span>
          <Badge variant="secondary" className="text-xs">
            {files.length}/{maxFiles}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragOver 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">Drop files here or click to upload</p>
          <p className="text-sm text-muted-foreground mb-4">
            Supports images, videos, audio, and documents up to {maxFileSize}MB
          </p>
          <Button
            variant="outline"
            onClick={() => document.getElementById('file-input')?.click()}
            disabled={files.length >= maxFiles}
          >
            Choose Files
          </Button>
          <input
            id="file-input"
            type="file"
            multiple
            accept={allowedTypes.join(',')}
            onChange={handleFileInput}
            className="hidden"
            disabled={files.length >= maxFiles}
          />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Uploaded Files</h4>
            {files.map(file => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="text-muted-foreground">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    {file.error && (
                      <p className="text-xs text-red-500 mt-1">{file.error}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {file.status === 'uploading' && file.progress !== undefined && (
                    <div className="w-20">
                      <Progress value={file.progress} className="h-2" />
                    </div>
                  )}
                  
                  {file.status === 'success' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => copyMarkdown(file)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {file.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Usage Instructions */}
        <div className="p-4 bg-muted/20 rounded-lg">
          <h5 className="font-medium mb-2">How to use:</h5>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Drag and drop files or click "Choose Files"</li>
            <li>• Click the copy icon to get markdown link</li>
            <li>• Images will be displayed inline, other files as links</li>
            <li>• Maximum {maxFiles} files, {maxFileSize}MB each</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaUploader; 
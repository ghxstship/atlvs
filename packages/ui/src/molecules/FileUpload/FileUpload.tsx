/**
 * FileUpload Component - File upload component
 */
import React from 'react';
import { cn } from '../lib/utils';
import { Button } from '../unified/Button';
import { Input } from '../unified/Input';

export interface FileUploadProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'size'> {
  onFileChange?: (files: FileList | null) => void;
  onFilesSelected?: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedFileTypes?: string[];
  showPreview?: boolean;
  size?: 'default' | 'xs' | 'sm' | 'lg' | 'xl';
}

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  ({ 
    className, 
    onFileChange, 
    onFilesSelected,
    maxFiles = 1,
    maxSize,
    acceptedFileTypes,
    showPreview = false,
    multiple,
    accept,
    ...props 
  }, ref) => {
    const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
    const [dragActive, setDragActive] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => inputRef.current!);

    const handleFiles = (files: FileList | null) => {
      if (!files) return;

      const fileArray = Array.from(files);
      let validFiles = fileArray;

      // Apply file count limit
      if (maxFiles && fileArray.length > maxFiles) {
        validFiles = fileArray.slice(0, maxFiles);
      }

      // Apply file size limit
      if (maxSize) {
        validFiles = validFiles.filter(file => file.size <= maxSize);
      }

      // Apply file type filter
      if (acceptedFileTypes && acceptedFileTypes.length > 0) {
        validFiles = validFiles.filter(file => 
          acceptedFileTypes.some(type => file.type.includes(type))
        );
      }

      setSelectedFiles(validFiles);
      
      if (onFileChange) {
        const dataTransfer = new DataTransfer();
        validFiles.forEach(file => dataTransfer.items.add(file));
        onFileChange(dataTransfer.files);
      }
      
      if (onFilesSelected) {
        onFilesSelected(validFiles);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
    };

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files);
      }
    };

    const openFileDialog = () => {
      inputRef.current?.click();
    };

    const removeFile = (index: number) => {
      const newFiles = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(newFiles);
      
      if (onFilesSelected) {
        onFilesSelected(newFiles);
      }
    };

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
      <div className={cn("w-full", className)}>
        <Input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleInputChange}
          multiple={multiple || maxFiles > 1}
          accept={accept || acceptedFileTypes?.join(',')}
          {...props}
        />
        
        <div
          className={cn(
            "border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer transition-colors",
            dragActive && "border-primary bg-primary/5",
            "hover:border-primary hover:bg-primary/5"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <div className="space-y-2">
            <div className="text-muted-foreground">
              <p>Drag and drop files here, or click to select</p>
              {maxFiles > 1 && (
                <p className="text-xs">Maximum {maxFiles} files</p>
              )}
              {maxSize && (
                <p className="text-xs">Maximum size: {formatFileSize(maxSize)}</p>
              )}
              {acceptedFileTypes && (
                <p className="text-xs">Accepted types: {acceptedFileTypes.join(', ')}</p>
              )}
            </div>
            <Button type="button" variant="outline" size="sm">
              Choose Files
            </Button>
          </div>
        </div>

        {showPreview && selectedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium">Selected Files:</h4>
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted rounded border"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);
FileUpload.displayName = "FileUpload";

export { FileUpload };

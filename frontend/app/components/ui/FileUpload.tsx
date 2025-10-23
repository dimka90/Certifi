import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, Image, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './Button';
import useIPFSUpload, { UseIPFSUploadOptions } from '../../hooks/useIPFSUpload';
import { IPFSUploadResult } from '../../lib/ipfs';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onUpload?: (result: IPFSUploadResult) => void;
  onUploads?: (results: IPFSUploadResult[]) => void;
  onError?: (error: string) => void;
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  maxFileSize?: number; 
  allowedTypes?: string[];
  className?: string;
  disabled?: boolean;
  metadata?: {
    name?: string;
    description?: string;
    keyvalues?: Record<string, string>;
  };
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  onUploads,
  onError,
  multiple = false,
  accept = "*/*",
  maxFiles = 5,
  maxFileSize = 100 * 1024 * 1024, 
  allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
  className = '',
  disabled = false,
  metadata
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const uploadOptions: UseIPFSUploadOptions = {
    maxFileSize,
    allowedTypes,
    metadata
  };

  const {
    isUploading,
    uploadProgress,
    uploadError,
    uploadedFiles,
    uploadFile,
    uploadFiles,
    clearError,
    validateFile
  } = useIPFSUpload(uploadOptions);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
  
    if (fileArray.length > maxFiles) {
      const error = `Maximum ${maxFiles} files allowed`;
      onError?.(error);
      return;
    }

   
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    fileArray.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      const error = `Invalid files: ${invalidFiles.join(', ')}`;
      onError?.(error);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
    }
  }, [maxFiles, validateFile, onError]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    handleFiles(e.dataTransfer.files);
  }, [disabled, handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    try {
      if (multiple) {
        const results = await uploadFiles(selectedFiles);
        if (results.length > 0) {
          onUploads?.(results);
          setSelectedFiles([]);
          toast.success(`${results.length} files uploaded to IPFS successfully!`);
        }
      } else {
        const result = await uploadFile(selectedFiles[0]);
        if (result) {
          onUpload?.(result);
          setSelectedFiles([]);
          toast.success(`File uploaded to IPFS successfully! Hash: ${result.hash.substring(0, 10)}...`);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    }
  }, [selectedFiles, multiple, uploadFile, uploadFiles, onUpload, onUploads]);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const openFileDialog = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
     
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />

   
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${dragActive ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-green-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <div className="text-lg font-medium text-gray-900 mb-2">
          {dragActive ? 'Drop files here' : 'Click to upload or drag and drop'}
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {multiple ? `Up to ${maxFiles} files, max ${formatFileSize(maxFileSize)} each` : `Max ${formatFileSize(maxFileSize)}`}
        </p>
        <Button type="button" variant="outline" disabled={disabled}>
          Choose Files
        </Button>
      </div>

     
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getFileIcon(file)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {isUploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Uploading...</span>
            <span className="text-sm text-gray-500">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

    
      {uploadError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-700">{uploadError}</span>
          <button
            onClick={clearError}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && !isUploading && (
        <div className="mt-4">
          <Button
            onClick={handleUpload}
            disabled={disabled}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} to IPFS
          </Button>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">IPFS Hash: {file.hash}</p>
                </div>
              </div>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-800 text-sm"
              >
                View
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;

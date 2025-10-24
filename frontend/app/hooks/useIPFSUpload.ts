/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useCallback } from 'react';
import IPFSService, { IPFSUploadResult, IPFSUploadProgress } from '../lib/ipfs';

export interface UseIPFSUploadOptions {
  maxFileSize?: number; 
  allowedTypes?: string[];
  metadata?: {
    name?: string;
    description?: string;
    keyvalues?: Record<string, string>;
  };
}

export interface UseIPFSUploadReturn {

  isUploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
  uploadedFiles: IPFSUploadResult[];
  
  
  uploadFile: (file: File) => Promise<IPFSUploadResult | null>;
  uploadFiles: (files: File[]) => Promise<IPFSUploadResult[]>;
  clearError: () => void;
  reset: () => void;
  
  
  validateFile: (file: File) => { valid: boolean; error?: string };
}

export function useIPFSUpload(options: UseIPFSUploadOptions = {}): UseIPFSUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<IPFSUploadResult[]>([]);

  const validateFile = useCallback((file: File) => {
    return IPFSService.validateFile(file, {
      maxSize: options.maxFileSize,
      allowedTypes: options.allowedTypes
    });
  }, [options.maxFileSize, options.allowedTypes]);

  const uploadFile = useCallback(async (file: File): Promise<IPFSUploadResult | null> => {
    try {
    
      const validation = validateFile(file);
      if (!validation.valid) {
        setUploadError(validation.error || 'Invalid file');
        return null;
      }

      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(0);

      
      const result = await IPFSService.uploadFile(file, options.metadata);
      
      setUploadedFiles(prev => [...prev, result]);
      setUploadProgress(100);
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      console.error('IPFS upload error:', error);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [validateFile, options.metadata]);

  const uploadFiles = useCallback(async (files: File[]): Promise<IPFSUploadResult[]> => {
    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(0);

      const validationResults = files.map(file => validateFile(file));
      const invalidFiles = validationResults.filter(result => !result.valid);
      
      if (invalidFiles.length > 0) {
        setUploadError(`Invalid files: ${invalidFiles.map((_, index) => files[index].name).join(', ')}`);
        return [];
      }

    
      const results = await IPFSService.uploadFiles(files, options.metadata);
      
      setUploadedFiles(prev => [...prev, ...results]);
      setUploadProgress(100);
      
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      console.error('IPFS batch upload error:', error);
      return [];
    } finally {
      setIsUploading(false);
    }
  }, [validateFile, options.metadata]);

  const clearError = useCallback(() => {
    setUploadError(null);
  }, []);

  const reset = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError(null);
    setUploadedFiles([]);
  }, []);

  return {
    isUploading,
    uploadProgress,
    uploadError,
    uploadedFiles,
    uploadFile,
    uploadFiles,
    clearError,
    reset,
    validateFile
  };
}

export default useIPFSUpload;

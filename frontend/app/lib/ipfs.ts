/* eslint-disable @typescript-eslint/no-unused-vars */
// Client-side IPFS service using API routes

// IPFS Gateway URL
const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/';

export interface IPFSUploadResult {
  hash: string;
  size: number;
  url: string;
  name: string;
  type: string;
}

export interface IPFSUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export class IPFSService {
  /**
   * Upload a file to IPFS via API route
   */
  static async uploadFile(
    file: File,
    metadata?: {
      name?: string;
      description?: string;
      keyvalues?: Record<string, string>;
    },
    onProgress?: (progress: IPFSUploadProgress) => void
  ): Promise<IPFSUploadResult> {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Add metadata if provided
      if (metadata) {
        formData.append('metadata', JSON.stringify({
          name: metadata.name || file.name,
          keyvalues: metadata.keyvalues || {}
        }));
      }

      // Upload via API route
      const response = await fetch('/api/ipfs/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('IPFS upload error:', error);
      throw new Error(`Failed to upload file to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload multiple files to IPFS
   */
  static async uploadFiles(
    files: File[],
    metadata?: {
      name?: string;
      description?: string;
      keyvalues?: Record<string, string>;
    }
  ): Promise<IPFSUploadResult[]> {
    try {
      const uploadPromises = files.map(file => 
        this.uploadFile(file, {
          ...metadata,
          keyvalues: {
            ...metadata?.keyvalues,
            batchId: Date.now().toString()
          }
        })
      );

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('IPFS batch upload error:', error);
      throw new Error(`Failed to upload files to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file from IPFS
   */
  static getFileUrl(hash: string): string {
    return `${IPFS_GATEWAY}${hash}`;
  }

  /**
   * Pin a file to IPFS (ensure it stays available)
   */
  static async pinFile(hash: string, metadata?: {
    name?: string;
    keyvalues?: Record<string, string>;
  }): Promise<boolean> {
    try {
      const response = await fetch('/api/ipfs/pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hash, metadata })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Pin failed');
      }

      return true;
    } catch (error) {
      console.error('IPFS pin error:', error);
      return false;
    }
  }

  /**
   * Unpin a file from IPFS
   */
  static async unpinFile(hash: string): Promise<boolean> {
    try {
      const response = await fetch('/api/ipfs/unpin', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hash })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unpin failed');
      }

      return true;
    } catch (error) {
      console.error('IPFS unpin error:', error);
      return false;
    }
  }

  /**
   * Get pinned files (placeholder - would need API route)
   */
  static async getPinnedFiles(options?: {
    status?: 'pinned' | 'unpinned' | 'all';
    pageLimit?: number;
    pageOffset?: number;
  }) {
    try {
      // This would require a separate API route for listing files
      // For now, return empty array
      console.warn('getPinnedFiles not implemented - requires additional API route');
      return [];
    } catch (error) {
      console.error('IPFS get pinned files error:', error);
      throw new Error(`Failed to get pinned files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File, options?: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  }): { valid: boolean; error?: string } {
    const maxSize = options?.maxSize || 100 * 1024 * 1024; // 100MB default
    const allowedTypes = options?.allowedTypes || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`
      };
    }

    return { valid: true };
  }

  /**
   * Upload JSON data to IPFS
   */
  static async uploadJSON(
    data: Record<string, unknown>,
    metadata?: {
      name?: string;
      keyvalues?: Record<string, string>;
    }
  ): Promise<string> {
    try {
      const response = await fetch('/api/ipfs/upload-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          data, 
          metadata: {
            name: metadata?.name || 'data.json',
            keyvalues: metadata?.keyvalues || {}
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'JSON upload failed');
      }

      const result = await response.json();
      return result.hash;
    } catch (error) {
      console.error('IPFS JSON upload error:', error);
      throw new Error(`Failed to upload JSON to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file info from IPFS hash
   */
  static async getFileInfo(hash: string): Promise<{
    hash: string;
    size: number;
    url: string;
  }> {
    try {
      // This would typically require additional API calls to get file metadata
      // For now, we'll return basic info
      return {
        hash,
        size: 0, // Would need additional API call to get actual size
        url: this.getFileUrl(hash)
      };
    } catch (error) {
      console.error('IPFS get file info error:', error);
      throw new Error(`Failed to get file info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default IPFSService;

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Upload, Building2, MapPin, FileText, ArrowRight, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Layout from '../components/Layout';
import { useCertificateContract } from '../../lib/contracts';
import { InstitutionType, INSTITUTION_TYPES } from '../../lib/contracts/types';
import { useIPFSUpload } from '../hooks/useIPFSUpload';
import { toast } from 'react-hot-toast';

const Register = () => {
  const router = useRouter();
  const { address } = useAccount();
  const { registerInstitution, useCheckInstitutionRegistration, isPending, isConfirming, isConfirmed } = useCertificateContract();
  const { uploadFile, isUploading, uploadError, uploadedFiles } = useIPFSUpload({
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']
  });
  
  const [formData, setFormData] = useState({
    institutionName: '',
    institutionID: '',
    email: '',
    country: '',
    institutionType: InstitutionType.UNIVERSITY
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Check if current wallet is already registered
  const { data: isAlreadyRegistered, isLoading: isCheckingRegistration } = useCheckInstitutionRegistration(address || '');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'institutionType' ? parseInt(value) : value 
    }));
  
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrors(prev => ({ ...prev, document: '' }));
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    try {
      await uploadFile(selectedFile);
      toast.success('Document uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload document');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setErrors(prev => ({ ...prev, document: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.institutionName.trim()) {
      newErrors.institutionName = 'Institution name is required';
    }

    if (!formData.institutionID.trim()) {
      newErrors.institutionID = 'Institution ID is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Check if institution is already registered
    if (isAlreadyRegistered) {
      toast.error('This wallet address is already registered as an institution. Please use a different wallet or contact support.');
      return;
    }

    setIsSubmitting(true);

    try {
      await registerInstitution({
        name: formData.institutionName,
        institutionID: formData.institutionID,
        email: formData.email,
        country: formData.country,
        institutionType: formData.institutionType,
      });
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Failed to register institution');
      setIsSubmitting(false);
    }
  };

  // Handle successful transaction confirmation
  React.useEffect(() => {
    if (isConfirmed && isSubmitting) {
      toast.success('Institution registered successfully!');
      setIsSubmitting(false);
      router.push('/institution/dashboard');
    }
  }, [isConfirmed, isSubmitting, router]);

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="max-w-2xl w-full mx-auto px-6">
          {/* Form Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded flex items-center justify-center">
              <Building2 className="w-6 h-6 text-black" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Certifi</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Register Your Institution
          </h1>
          <p className="text-gray-600">
            Join thousands of institutions using Certifi for blockchain-verified certificates.
          </p>
          
          {/* Registration Status Warning */}
          {isCheckingRegistration ? (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">Checking registration status...</p>
            </div>
          ) : isAlreadyRegistered ? (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">⚠️ This wallet is already registered as an institution.</p>
              <p className="text-red-600 text-xs mt-1">Please connect a different wallet to register a new institution.</p>
            </div>
          ) : null}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
        
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-green-500" />
                Institution Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Institution Name *"
                    name="institutionName"
                    value={formData.institutionName}
                    onChange={handleInputChange}
                    error={errors.institutionName}
                    placeholder="Enter institution name"
                  />
                </div>
                
                <div>
                  <Input
                    label="Institution ID *"
                    name="institutionID"
                    value={formData.institutionID}
                    onChange={handleInputChange}
                    error={errors.institutionID}
                    placeholder="Enter institution ID"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Input
                  label="Email *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  placeholder="Enter institution email"
                />
              </div>

              <div className="mt-4">
                <Input
                  label="Country *"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  error={errors.country}
                  placeholder="Enter country"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institution Type *
                </label>
                <select
                  name="institutionType"
                  value={formData.institutionType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  {Object.entries(INSTITUTION_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Registration Documents Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-500" />
                Registration Documents (Optional)
              </h2>
              
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragOver 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 hover:border-green-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="document"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="document" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">Max 10 MB • PNG, JPG, PDF</p>
                </label>
              </div>

              {selectedFile && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleFileUpload}
                        disabled={isUploading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isUploading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </div>
                        ) : (
                          'Upload to IPFS'
                        )}
                      </Button>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h3 className="text-sm font-medium text-green-800 mb-2">Uploaded Files:</h3>
                  {uploadedFiles.map((file: any, index: number) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-green-700">
                      <FileText className="w-4 h-4" />
                      <span>{file.name}</span>
                      <span className="text-xs text-green-600">✓ Uploaded</span>
                    </div>
                  ))}
                </div>
              )}

              {uploadError && (
                <p className="text-red-500 text-sm mt-2">{uploadError}</p>
              )}
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-green-600 hover:text-green-700 underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-green-600 hover:text-green-700 underline">
                  Privacy Policy
                </a>
              </label>
            </div>
            <div className="pt-4">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting || isPending || isConfirming || isAlreadyRegistered}
              >
                {isSubmitting || isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isPending ? 'Transaction Pending...' : 'Submitting Registration...'}
                  </div>
                ) : isConfirming ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Confirming Transaction...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Submit Registration
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;

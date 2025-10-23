'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import FileUpload from '../../components/ui/FileUpload';
import Layout from '../../components/Layout';
import { IPFSUploadResult } from '../../lib/ipfs';
import { institutionStore } from '../../lib/institutionStore';
import toast from 'react-hot-toast';

const InstitutionRegister = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    institutionName: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    registrationNumber: '',
    description: ''
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [ipfsUploadResult, setIpfsUploadResult] = useState<IPFSUploadResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleIPFSUpload = (result: IPFSUploadResult) => {
    setIpfsUploadResult(result);
    console.log('File uploaded to IPFS:', result);
    toast.success(`File uploaded successfully! IPFS Hash: ${result.hash.substring(0, 10)}...`);
  };

  const handleIPFSUploadError = (error: string) => {
    console.error('IPFS upload error:', error);
    setErrors(prev => ({ ...prev, registrationDocument: error }));
    toast.error(`Upload failed: ${error}`);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.institutionName.trim()) {
      newErrors.institutionName = 'Institution name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Contact phone is required';
    }

    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = 'Registration number is required';
    }

    if (!ipfsUploadResult) {
      newErrors.registrationDocument = 'Registration document is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
     
      const registrationData = {
        ...formData,
        registrationDocument: ipfsUploadResult ? {
          hash: ipfsUploadResult.hash,
          url: ipfsUploadResult.url,
          name: ipfsUploadResult.name,
          size: ipfsUploadResult.size
        } : null
      };
      
      console.log('Registration data with IPFS:', registrationData);
      
    
      institutionStore.setInstitutionData({
        ...registrationData,
        registrationDocument: registrationData.registrationDocument || undefined
      });
      
      
      const loadingToast = toast.loading('Submitting registration...');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.dismiss(loadingToast);
      toast.success('Registration submitted successfully! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/institution/dashboard');
      }, 1500);
      
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-8 sm:py-12">
        <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-r from-green-300 via-green-400 to-green-500 bg-clip-text text-transparent">
                Certifi.
              </span>
            </h1>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Register Your Institution
          </h1>
          
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 border py-32 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6  border-4 ">
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg px- sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                Institution Information
              </h2>
              
              <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                    label="Registration Number *"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleInputChange}
                    error={errors.registrationNumber}
                    placeholder="Enter registration number"
                  />
                </div>
              </div>

              <div className="mt-6">
                <Input
                  label="Address *"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  error={errors.address}
                  placeholder="Enter full address"
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 pl-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-base text-gray-900 placeholder:text-gray-500 placeholder:opacity-100"
                  placeholder="Brief description of your institution"
                />
              </div>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                Contact Information
              </h2>
              
              <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Input
                    label="Contact Email *"
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    error={errors.contactEmail}
                    placeholder="Enter contact email"
                  />
                </div>
                
                <div>
                  <Input
                    label="Contact Phone *"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    error={errors.contactPhone}
                    placeholder="Enter contact phone"
                  />
                </div>
              </div>

              <div className="mt-6">
                <Input
                  label="Website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://your-institution.com"
                />
              </div>
            </div>

            <div className="pb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                Registration Documents
              </h2>
              
              <FileUpload
                onUpload={handleIPFSUpload}
                onError={handleIPFSUploadError}
                multiple={false}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                maxFileSize={10 * 1024 * 1024} 
                allowedTypes={[
                  'application/pdf',
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'image/jpeg',
                  'image/png'
                ]}
                metadata={{
                  name: 'Institution Registration Document',
                  description: 'Registration document for institution verification',
                  keyvalues: {
                    type: 'registration',
                    institution: formData.institutionName,
                    timestamp: new Date().toISOString()
                  }
                }}
                className="w-full"
              />
              
              {errors.registrationDocument && (
                <p className="text-red-500 text-sm mt-2">{errors.registrationDocument}</p>
              )}
            </div>
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                required
              />
              <label htmlFor="terms" className="text-xs sm:text-sm text-gray-600">
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

          
            <div className="pt-10 bg-gray-900 ">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting Registration...
                  </div>
                ) : (
                  <div className="flex items-center justify-center  text-white">
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

export default InstitutionRegister;
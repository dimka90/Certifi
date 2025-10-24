/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import FileUpload from '../../components/ui/FileUpload';
import Layout from '../../components/Layout';
import { IPFSUploadResult } from '../../lib/ipfs';
import { institutionStore } from '../../lib/institutionStore';
import { useCertificateContract, InstitutionType, INSTITUTION_TYPES } from '../../../lib/contracts';
import toast from 'react-hot-toast';

const InstitutionRegister = () => {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { registerInstitution, isPending, isConfirming, isConfirmed, error } = useCertificateContract();
  
  const [formData, setFormData] = useState({
    name: '',
    institutionID: '',
    email: '',
    country: '',
    institutionType: InstitutionType.UNIVERSITY
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [ipfsUploadResult, setIpfsUploadResult] = useState<IPFSUploadResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    if (!formData.name.trim()) {
      newErrors.name = 'Institution name is required';
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

    // Document upload is optional - no validation required

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check wallet connection
    if (!isConnected || !address) {
      toast.error('Please connect your wallet to register');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call smart contract
      await registerInstitution({
        name: formData.name,
        institutionID: formData.institutionID,
        email: formData.email,
        country: formData.country,
        institutionType: formData.institutionType
      });

      // Store data locally for dashboard
      institutionStore.setInstitutionData({
        institutionName: formData.name,
        institutionID: formData.institutionID,
        email: formData.email,
        country: formData.country,
        institutionType: formData.institutionType,
        walletAddress: address,
        registrationDocument: ipfsUploadResult ? {
          hash: ipfsUploadResult.hash,
          url: ipfsUploadResult.url,
          name: ipfsUploadResult.name,
          size: ipfsUploadResult.size
        } : undefined
      });
      
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle successful transaction
  React.useEffect(() => {
    if (isConfirmed) {
      toast.success('Institution registered successfully! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/institution/dashboard');
      }, 1500);
    }
  }, [isConfirmed, router]);

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
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={errors.name}
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

              <div className="mt-6">
                <Input
                  label="Email *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  placeholder="Enter email address"
                />
              </div>

              <div className="mt-6">
                <Input
                  label="Country *"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  error={errors.country}
                  placeholder="Enter country"
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institution Type *
                </label>
                <select
                  name="institutionType"
                  value={formData.institutionType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-base text-gray-900"
                >
                  {Object.entries(INSTITUTION_TYPES).map(([key, value]) => (
                    <option key={key} value={key}>
                      {String(value)}
                    </option>
                  ))}
                </select>
              </div>
            </div>


            <div className="pb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                Registration Documents (Optional)
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
                    institution: formData.name,
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
                disabled={isSubmitting || isPending || isConfirming}
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
                  <div className="flex items-center justify-center text-white">
                    {isConnected ? 'Submit Registration' : 'Connect Wallet & Submit'}
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
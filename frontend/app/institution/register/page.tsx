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
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-16">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px] -z-10" />

        <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              Register Your <span className="text-green-400">Institution</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Join the network of trusted academic institutions on the blockchain.
            </p>
          </div>

          <div className="bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl p-6 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-4">
                  <div className="w-1.5 h-6 bg-green-500 rounded-full" />
                  Institution Information
                </h2>

                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Institution Name *"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={errors.name}
                    placeholder="e.g. University of Lagos"
                  />

                  <Input
                    label="Institution ID *"
                    name="institutionID"
                    value={formData.institutionID}
                    onChange={handleInputChange}
                    error={errors.institutionID}
                    placeholder="e.g. UNILAG-2024"
                  />
                </div>

                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Email *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                    placeholder="admin@institution.edu"
                  />
                  <Input
                    label="Country *"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    error={errors.country}
                    placeholder="Enter country"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-400 pl-1">
                    Institution Type *
                  </label>
                  <select
                    name="institutionType"
                    value={formData.institutionType}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all appearance-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%239ca3af\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem' }}
                  >
                    {Object.entries(INSTITUTION_TYPES).map(([key, value]) => (
                      <option key={key} value={key} className="bg-zinc-900 text-white">
                        {String(value)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-6 pt-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-4">
                  <div className="w-1.5 h-6 bg-green-500 rounded-full" />
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
                      institution: formData.name,
                      timestamp: new Date().toISOString()
                    }
                  }}
                  className="w-full bg-zinc-900/50 border-zinc-800 hover:border-green-500/30 transition-colors"
                />

                {errors.registrationDocument && (
                  <p className="text-red-500 text-sm mt-2">{errors.registrationDocument}</p>
                )}
              </div>

              <div className="flex items-start space-x-3 pt-4">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-green-500 focus:ring-green-500/50 focus:ring-offset-0"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-400 leading-snug">
                  I agree to the{' '}
                  <a href="#" className="text-green-400 hover:text-green-300 transition-colors underline-offset-4 hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-green-400 hover:text-green-300 transition-colors underline-offset-4 hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <div className="pt-6">
                <Button
                  type="submit"
                  variant="secondary"
                  size="xl"
                  className="w-full h-14 text-lg font-bold shadow-lg shadow-green-900/20"
                  disabled={isSubmitting || isPending || isConfirming}
                >
                  {isSubmitting || isPending ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                      Processing...
                    </div>
                  ) : isConfirming ? (
                    'Confirming...'
                  ) : (
                    <div className="flex items-center justify-center">
                      {isConnected ? 'Submit Registration' : 'Connect Wallet to Register'}
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
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Building2, MapPin, FileText, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Layout from '../components/Layout';

const Register = () => {
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

    if (!uploadedFile) {
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
     
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    
      router.push('/institution/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                    label="Registration Number *"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleInputChange}
                    error={errors.registrationNumber}
                    placeholder="Enter registration number"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Input
                  label="Address *"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  error={errors.address}
                  placeholder="Enter full address"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Brief description of your institution"
                />
              </div>
            </div>

      
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-green-500" />
                Contact Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
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

              <div className="mt-4">
                <Input
                  label="Website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://your-institution.com"
                />
              </div>
            </div>

            {/* Document Upload */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-500" />
                Registration Documents
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                <input
                  type="file"
                  id="registrationDocument"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <label htmlFor="registrationDocument" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <div className="font-medium text-gray-900 mb-2">
                    {uploadedFile ? uploadedFile.name : 'Upload Registration Document'}
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    PDF, DOC, DOCX, JPG, PNG up to 10MB
                  </p>
                  <Button type="button" variant="outline" size="sm">
                    Choose File
                  </Button>
                </label>
                {errors.registrationDocument && (
                  <p className="text-red-500 text-sm mt-2">{errors.registrationDocument}</p>
                )}
              </div>
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
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting Registration...
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

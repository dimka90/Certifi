'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { 
  Award, 
  ArrowLeft,
  CheckCircle,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useCertificateContract } from '../../../lib/contracts';
import { Classification, Faculty } from '../../../lib/contracts/types';
import { toast } from 'react-hot-toast';

const IssueCertificate = () => {
  const router = useRouter();
  const { address } = useAccount();
  const { issueCertificate, isPending, isConfirming, isConfirmed } = useCertificateContract();
  
  const [formData, setFormData] = useState({
    studentName: '',
    studentID: '',
    degreeTitle: '',
    grade: Classification.FIRST_CLASS,
    duration: '',
    cgpa: '',
    faculty: Faculty.ENGINEERING,
    studentWallet: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && isSubmitting) {
      // Clear form after successful confirmation
      setFormData({
        studentName: '',
        studentID: '',
        degreeTitle: '',
        grade: Classification.FIRST_CLASS,
        duration: '',
        cgpa: '',
        faculty: Faculty.ENGINEERING,
        studentWallet: ''
      });
      
      // Redirect to view certificates page
      router.push('/institution/view-certificates');
      setIsSubmitting(false);
    }
  }, [isConfirmed, isSubmitting, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'grade' || name === 'faculty' ? parseInt(value) : value 
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Student name is required';
    }

    if (!formData.studentID.trim()) {
      newErrors.studentID = 'Student ID is required';
    }

    if (!formData.degreeTitle.trim()) {
      newErrors.degreeTitle = 'Degree title is required';
    }

    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required';
    }

    if (!formData.cgpa.trim()) {
      newErrors.cgpa = 'CGPA is required';
    }

    if (!formData.studentWallet.trim()) {
      newErrors.studentWallet = 'Student wallet address is required';
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.studentWallet)) {
      newErrors.studentWallet = 'Please enter a valid wallet address';
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


    setIsSubmitting(true);

    try {
      // Create a simple tokenURI without IPFS upload
      const tokenURI = `https://certifi.app/certificate/${Date.now()}-${formData.studentID}`;

      // Issue certificate on blockchain
      await issueCertificate({
        studentWallet: formData.studentWallet,
        studentName: formData.studentName,
        studentID: formData.studentID,
        degreeTitle: formData.degreeTitle,
        grade: formData.grade,
        duration: formData.duration,
        cgpa: formData.cgpa,
        faculty: formData.faculty,
        tokenURI: tokenURI,
      });

      toast.success('Certificate issued successfully!');
    } catch (error) {
      console.error('Certificate issuance failed:', error);
      toast.error('Failed to issue certificate. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Mobile Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl xl:text-5xl font-bold leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-r from-green-300 via-green-400 to-green-500 bg-clip-text text-transparent">
              Certifi
              </span>
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 flex flex-col justify-between px-4 py-6">
          <div className="flex-1 flex flex-col justify-start space-y-4">
            <button
              onClick={() => {
                router.push('/institution/dashboard');
                setSidebarOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

    
      <div className="flex-1 flex flex-col  overflow-hidden">
      
        <header className="bg-white shadow-sm border-b-2 border-gray-300">
          <div className="flex items-center justify-between h-16 px-4 sm:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center space-x-4">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold leading-[1.1] tracking-tight">
                <span className="bg-gradient-to-r from-green-300 via-green-400 to-green-500 bg-clip-text text-transparent">
                Issue Certificate
                </span>
              </h1>
            </div>
            <div className="w-10"></div> {/* Spacer for mobile menu button */}
          </div>
        </header>

      
        <main className="flex-1 overflow-y-auto bg-gray-50 px-4 sm:px-6 lg:px-8 pt-16 pb-6 sm:pb-8 flex items-center justify-center">
          <div className="w-full max-w-2xl xl:max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl md:text-xl lg:text-xl font-bold leading-[1.1] tracking-tight">
                    <span className="bg-gradient-to-r from-green-300 via-green-400 to-green-500 bg-clip-text text-transparent">
                    Certificate Details
                    </span>
                  </h1>
                </div>
              </div>


              <form onSubmit={handleSubmit} className="space-y-6">
             
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    
                    Student Information
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <Input
                        label="Student Name *"
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleInputChange}
                        error={errors.studentName}
                        placeholder="Enter student's full name"
                      />
                    </div>
                    
                    <div>
                      <Input
                        label="Student ID *"
                        name="studentID"
                        value={formData.studentID}
                        onChange={handleInputChange}
                        error={errors.studentID}
                        placeholder="Enter student's ID number"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Input
                      label="Student Wallet Address *"
                      name="studentWallet"
                      value={formData.studentWallet}
                      onChange={handleInputChange}
                      error={errors.studentWallet}
                      placeholder="0x..."
                    />
                  </div>
                </div>

              
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    Certificate Information
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <Input
                        label="Degree Title *"
                        name="degreeTitle"
                        value={formData.degreeTitle}
                        onChange={handleInputChange}
                        error={errors.degreeTitle}
                        placeholder="Enter degree title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grade Classification *
                      </label>
                      <select
                        name="grade"
                        value={formData.grade}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 bg-white text-sm sm:text-base"
                        style={{ color: '#111827' }}
                      >
                        <option value={Classification.FIRST_CLASS} style={{ color: '#111827' }}>First Class</option>
                        <option value={Classification.SECOND_CLASS_UPPER} style={{ color: '#111827' }}>Second Class Upper</option>
                        <option value={Classification.SECOND_CLASS_LOWER} style={{ color: '#111827' }}>Second Class Lower</option>
                        <option value={Classification.THIRD_CLASS} style={{ color: '#111827' }}>Third Class</option>
                        <option value={Classification.PASS} style={{ color: '#111827' }}>Pass</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                    <div>
                      <Input
                        label="Duration *"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        error={errors.duration}
                        placeholder="e.g., 4 years, 2 semesters"
                      />
                    </div>
                    
                    <div>
                      <Input
                        label="CGPA *"
                        name="cgpa"
                        value={formData.cgpa}
                        onChange={handleInputChange}
                        error={errors.cgpa}
                        placeholder="e.g., 3.75/4.0"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Faculty *
                    </label>
                    <select
                      name="faculty"
                      value={formData.faculty}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 bg-white text-sm sm:text-base"
                      style={{ color: '#111827' }}
                    >
                      <option value={Faculty.ENGINEERING} style={{ color: '#111827' }}>Engineering</option>
                      <option value={Faculty.MEDICINE} style={{ color: '#111827' }}>Medicine</option>
                      <option value={Faculty.LAW} style={{ color: '#111827' }}>Law</option>
                      <option value={Faculty.BUSINESS} style={{ color: '#111827' }}>Business</option>
                      <option value={Faculty.ARTS} style={{ color: '#111827' }}>Arts</option>
                      <option value={Faculty.SCIENCE} style={{ color: '#111827' }}>Science</option>
                      <option value={Faculty.OTHER} style={{ color: '#111827' }}>Other</option>
                    </select>
                  </div>
                </div>

             
                <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-4 bg-gray-900 p-4 sm:p-6 rounded-lg">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/institution/dashboard')}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting || isPending || isConfirming}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting || isPending ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                        <span className="text-sm sm:text-base">
                          {isPending ? 'Transaction Pending...' : 'Issuing Certificate...'}
                        </span>
                      </div>
                    ) : isConfirming ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                        <span className="text-sm sm:text-base">Confirming Transaction...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center border-2 border-white rounded-md text-white">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        <span className="text-sm sm:text-base">Issue Certificate</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default IssueCertificate;

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Award, 
 
  ArrowLeft,
 
  CheckCircle,

} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const IssueCertificate = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    certificateType: '',
    courseName: '',
    completionDate: '',
    grade: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Student name is required';
    }

    if (!formData.studentEmail.trim()) {
      newErrors.studentEmail = 'Student email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.studentEmail)) {
      newErrors.studentEmail = 'Please enter a valid email address';
    }

    if (!formData.certificateType.trim()) {
      newErrors.certificateType = 'Certificate type is required';
    }

    if (!formData.courseName.trim()) {
      newErrors.courseName = 'Course name is required';
    }

    if (!formData.completionDate.trim()) {
      newErrors.completionDate = 'Completion date is required';
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
      
      
      router.push('/institution/view-certificates');
    } catch (error) {
      console.error('Certificate issuance failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
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
        </div>

        <nav className="flex-1 flex flex-col justify-between px-4 py-6">
          <div className="flex-1 flex flex-col justify-start space-y-4">
            <button
              onClick={() => router.push('/institution/dashboard')}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>
        </nav>
      </div>

    
      <div className="flex-1 flex flex-col  overflow-hidden">
      
        <header className="bg-white shadow-sm border-b-2 border-gray-300">
          <div className="flex items-center justify-center h-16 px-8">
            <div className="flex items-center space-x-4">
              
                <h1 className="text-xl sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl xl:text-5xl font-bold leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-r from-green-300 via-green-400 to-green-500 bg-clip-text text-transparent">
              Issue Certificate
              </span>
            </h1>
          
            </div>
          </div>
        </header>

      
        <main className="flex-1 overflow-y-auto bg-gray-50 px-8 py-8 flex items-center justify-center">
          <div className="w-full max-w-7xl">
          
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-xl md:text-xl lg:text-xl xl:text-xl xl:text-xl font-bold leading-[1.1] tracking-tight">
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
                  
                  <div className="grid md:grid-cols-2 gap-6">
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
                        label="Student Email *"
                        name="studentEmail"
                        type="email"
                        value={formData.studentEmail}
                        onChange={handleInputChange}
                        error={errors.studentEmail}
                        placeholder="Enter student's email address"
                      />
                    </div>
                  </div>
                </div>

              
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    Certificate Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Certificate Type *
                      </label>
                      <select
                        name="certificateType"
                        value={formData.certificateType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      >
                        <option value="">Select certificate type</option>
                        <option value="degree">Degree Certificate</option>
                        <option value="diploma">Diploma Certificate</option>
                        <option value="certificate">Course Certificate</option>
                        <option value="achievement">Achievement Certificate</option>
                      </select>
                      {errors.certificateType && (
                        <p className="text-red-500 text-sm mt-1">{errors.certificateType}</p>
                      )}
                    </div>
                    
                    <div>
                      <Input
                        label="Course Name *"
                        name="courseName"
                        value={formData.courseName}
                        onChange={handleInputChange}
                        error={errors.courseName}
                        placeholder="Enter course or program name"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <Input
                        label="Completion Date *"
                        name="completionDate"
                        type="date"
                        value={formData.completionDate}
                        onChange={handleInputChange}
                        error={errors.completionDate}
                      />
                    </div>
                    
                    <div>
                      <Input
                        label="Grade/Score"
                        name="grade"
                        value={formData.grade}
                        onChange={handleInputChange}
                        placeholder="Enter grade or score (optional)"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="Enter additional details about the certificate"
                    />
                  </div>
                </div>

             
                <div className="flex justify-between bg-gray-900 space-x-4 ">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/institution/dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white  mr-2"></div>
                        Issuing Certificate...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center border-2 border-white rounded-md text-white">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Issue Certificate
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

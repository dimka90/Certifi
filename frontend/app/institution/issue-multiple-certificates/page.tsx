/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Award, 
  Upload,
  FileText,
  ArrowLeft,
  CheckCircle,
 
  Download,
  Users
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

const IssueMultipleCertificates = () => {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv') {
        setErrors('Please upload a CSV file');
        return;
      }
      setUploadedFile(file);
      setErrors('');
    
      setPreviewData([
        { name: 'John Doe', email: 'john@example.com', course: 'Computer Science', grade: 'A+' },
        { name: 'Jane Smith', email: 'jane@example.com', course: 'Data Science', grade: 'A' },
        { name: 'Bob Johnson', email: 'bob@example.com', course: 'Web Development', grade: 'B+' }
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadedFile) {
      setErrors('Please upload a CSV file');
      return;
    }

    setIsProcessing(true);

    try {
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
     
      router.push('/institution/view-certificates');
    } catch (error) {
      console.error('Batch certificate issuance failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex">
    
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

     
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b-2 border-gray-300">
          <div className="flex items-center justify-center h-16 px-8">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl xl:text-5xl font-bold leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-r from-green-300 via-green-400 to-green-500 bg-clip-text text-transparent">
              Issue Multiple Certificates
              </span>
            </h1>

              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 px-8 py-8 flex items-start justify-center" style={{ marginTop: '60px' }}>
          <div className="w-full max-w-7xl">
          

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Upload CSV File</h2>
                    <p className="text-base text-gray-600">Select your CSV file to begin</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-400 transition-colors">
                    <input
                      type="file"
                      id="csvFile"
                      onChange={handleFileUpload}
                      accept=".csv"
                      className="hidden"
                    />
                    <label htmlFor="csvFile" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <div className="text-lg font-medium text-gray-900 mb-2">
                        {uploadedFile ? uploadedFile.name : 'Click to upload CSV file'}
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        CSV files up to 5MB
                      </p>
                      <Button type="button" variant="outline">
                        Choose File
                      </Button>
                    </label>
                    {errors && (
                      <p className="text-red-500 text-sm mt-2">{errors}</p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-4">
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
                      disabled={!uploadedFile || isProcessing}
                    >
                      {isProcessing ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center border-2 border-white rounded-md text-white bg-gray-900">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Issue Certificates
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Preview Data</h2>
                    <p className="text-base text-gray-600">Review your CSV data before processing</p>
                  </div>
                </div>

                {previewData.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Total Records:</span>
                        <span className="text-sm font-bold text-gray-900">{previewData.length}</span>
                      </div>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Name</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Email</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Course</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Grade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {previewData.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-gray-900">{row.name}</td>
                              <td className="px-3 py-2 text-gray-600">{row.email}</td>
                              <td className="px-3 py-2 text-gray-600">{row.course}</td>
                              <td className="px-3 py-2 text-gray-600">{row.grade}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-base text-gray-500">Upload a CSV file to preview data</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6" style={{ marginTop: '28px' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Download className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Need a Template?</h3>
                    <p className="text-base text-gray-600">Download our CSV template to get started</p>
                  </div>
                </div>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default IssueMultipleCertificates;

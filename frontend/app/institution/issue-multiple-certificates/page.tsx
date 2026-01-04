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
    <div className="h-screen bg-black flex overflow-hidden relative">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="w-64 bg-zinc-950 border-r border-white/5 text-white flex flex-col z-20">
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/5 flex-shrink-0">
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
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 text-zinc-400 hover:bg-zinc-900 hover:text-white group"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>
        </nav>
      </div>


      <div className="flex-1 flex flex-col overflow-hidden z-10">
        <header className="bg-zinc-950/50 backdrop-blur-md border-b border-white/5">
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
        <main className="flex-1 overflow-y-auto bg-transparent px-8 py-8 flex items-start justify-center">
          <div className="w-full max-w-7xl">


            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Upload CSV File</h2>
                    <p className="text-base text-zinc-400">Select your CSV file to begin</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="border-2 border-dashed border-white/10 bg-zinc-950/50 rounded-2xl p-8 text-center hover:border-green-500/50 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                    <input
                      type="file"
                      id="csvFile"
                      onChange={handleFileUpload}
                      accept=".csv"
                      className="hidden"
                    />
                    <label htmlFor="csvFile" className="cursor-pointer block relative z-10">
                      <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5 transition-transform group-hover:scale-110">
                        <Upload className="w-8 h-8 text-zinc-500 group-hover:text-green-400 transition-colors" />
                      </div>
                      <div className="text-lg font-semibold text-white mb-2">
                        {uploadedFile ? uploadedFile.name : 'Click to upload CSV file'}
                      </div>
                      <p className="text-sm text-zinc-500 mb-6 font-medium">
                        CSV files up to 5MB
                      </p>
                      <Button type="button" variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900">
                        Choose File
                      </Button>
                    </label>
                    {errors && (
                      <p className="text-red-500 text-sm mt-2">{errors}</p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-4 pt-4 border-t border-white/5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/institution/dashboard')}
                      className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={!uploadedFile || isProcessing}
                      className="bg-green-500 text-black font-bold shadow-lg shadow-green-950/20 hover:bg-green-400"
                    >
                      {isProcessing ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Issue Certificates
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
              <div className="bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Preview Data</h2>
                    <p className="text-base text-zinc-400">Review your CSV data before processing</p>
                  </div>
                </div>

                {previewData.length > 0 ? (
                  <div className="space-y-6">
                    <div className="bg-zinc-950/50 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-400">Total Records:</span>
                        <span className="text-sm font-bold text-white bg-zinc-900 px-3 py-1 rounded-full border border-white/5">{previewData.length}</span>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto rounded-xl border border-white/5 bg-zinc-950/30">
                      <table className="w-full text-sm">
                        <thead className="bg-zinc-950 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-500 uppercase tracking-wider text-[10px]">Name</th>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-500 uppercase tracking-wider text-[10px]">Email</th>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-500 uppercase tracking-wider text-[10px]">Course</th>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-500 uppercase tracking-wider text-[10px]">Grade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {previewData.map((row: any, index: number) => (
                            <tr key={index} className="hover:bg-white/5 transition-colors">
                              <td className="px-4 py-3 text-white font-medium">{row.name}</td>
                              <td className="px-4 py-3 text-zinc-400">{row.email}</td>
                              <td className="px-4 py-3 text-zinc-400">{row.course}</td>
                              <td className="px-4 py-3">
                                <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-xs font-bold border border-green-500/20">
                                  {row.grade}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 flex flex-col items-center">
                    <div className="w-20 h-20 bg-zinc-950 rounded-full flex items-center justify-center mb-6 border border-white/5">
                      <FileText className="w-10 h-10 text-zinc-700" />
                    </div>
                    <p className="text-base text-zinc-500 font-medium tracking-wide">Upload a CSV file to preview data</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-6 text-center sm:text-left">
                  <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center shrink-0">
                    <Download className="w-7 h-7 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Need a Template?</h3>
                    <p className="text-base text-zinc-400">Download our CSV template to ensure your data is formatted correctly.</p>
                  </div>
                </div>
                <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 h-12 px-8 flex items-center">
                  <Download className="w-5 h-5 mr-3" />
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

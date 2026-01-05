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
  Users,
  AlertTriangle,
  Loader2,
  FileStack,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  Zap,
  Trash2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Sidebar } from '../../components/Sidebar';
import { TransactionStepper, StepStatus } from '../../components/ui/TransactionStepper';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const IssueMultipleCertificates = () => {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Transaction Steps
  const [txStep, setTxStep] = useState(0);
  const [steps, setSteps] = useState([
    { id: 'parse', label: 'Analysis', description: 'Validating CSV structure', status: 'idle' as StepStatus },
    { id: 'sign', label: 'Auth', description: 'Signing batch mandate', status: 'idle' as StepStatus },
    { id: 'mint', label: 'Network', description: 'Minting multiple assets', status: 'idle' as StepStatus },
  ]);

  const updateStepStatus = (id: string, status: StepStatus) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast.error('Invalid format. Please upload a CSV file.');
        return;
      }
      setUploadedFile(file);
      setErrors('');

      // Simulated data parsing
      setTimeout(() => {
        setPreviewData([
          { name: 'John Doe', id: 'STU-001', course: 'Computer Science', grade: 'First Class' },
          { name: 'Jane Smith', id: 'STU-002', course: 'Biological Sciences', grade: 'Second Upper' },
          { name: 'Robert Chen', id: 'STU-003', course: 'Mechanical Eng', grade: 'First Class' },
          { name: 'Sarah Miller', id: 'STU-004', course: 'Business Admin', grade: 'Second Lower' },
          { name: 'David Wilson', id: 'STU-005', course: 'Applied Mathematics', grade: 'First Class' }
        ]);
        toast.success(`Parsed ${5} records successfully`);
      }, 800);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile) return;

    setIsProcessing(true);
    setTxStep(0);
    setSteps([
      { id: 'parse', label: 'Analysis', description: 'Validating CSV structure', status: 'loading' as StepStatus },
      { id: 'sign', label: 'Auth', description: 'Signing batch mandate', status: 'idle' as StepStatus },
      { id: 'mint', label: 'Network', description: 'Minting multiple assets', status: 'idle' as StepStatus },
    ]);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      updateStepStatus('parse', 'complete');
      setTxStep(1);
      updateStepStatus('sign', 'loading');

      await new Promise(resolve => setTimeout(resolve, 2500));
      updateStepStatus('sign', 'complete');
      setTxStep(2);
      updateStepStatus('mint', 'loading');

      await new Promise(resolve => setTimeout(resolve, 3000));
      updateStepStatus('mint', 'complete');

      toast.success('Batch issuance successful!');
      setTimeout(() => router.push('/institution/view-certificates'), 2000);
    } catch (error) {
      console.error('Batch issuance failed:', error);
      updateStepStatus('sign', 'error');
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen bg-black flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-zinc-950/50 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center justify-between h-16 px-4 sm:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-zinc-900 transition-colors"
            >
              <Menu className="w-6 h-6 text-zinc-400" />
            </button>
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold leading-[1.1] tracking-tight">
                <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                  Bulk Issuance
                </span>
              </h1>
            </div>
            <div className="w-10"></div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-black relative custom-scrollbar">
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px] -z-10" />

          <div className="px-4 sm:px-6 lg:px-8 py-8 pt-10">
            <div className="max-w-[1400px] mx-auto">
              <AnimatePresence mode="wait">
                {isProcessing ? (
                  <motion.div
                    key="batch-processing"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="max-w-2xl mx-auto glass-card rounded-[2.5rem] p-12 flex flex-col items-center justify-center border-emerald-500/20 shadow-2xl shadow-emerald-950/20"
                  >
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-8 relative">
                      <Zap className="w-10 h-10 text-emerald-500" />
                      <div className="absolute inset-0 bg-emerald-500/20 blur-xl animate-pulse rounded-full" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 tracking-tight text-center">Batch Protocol Active</h2>
                    <p className="text-zinc-500 mb-12 text-center max-w-sm">Processing multiple records. Please do not close your browser.</p>

                    <div className="w-full">
                      <TransactionStepper steps={steps} currentStepIndex={txStep} />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="upload-ui"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                  >
                    {/* Upload Section */}
                    <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                      <div className="glass-card rounded-3xl p-8 sm:p-10 shadow-2xl border-white/5 relative overflow-hidden">
                        <div className="mb-10">
                          <h2 className="text-2xl font-bold text-white tracking-tight">Source Data</h2>
                          <p className="text-sm text-zinc-500 mt-2">Upload your verified CSV student records.</p>
                        </div>

                        <div className="border-2 border-dashed border-zinc-800 bg-zinc-950/50 rounded-3xl p-10 text-center hover:border-emerald-500/40 transition-all duration-300 group cursor-pointer relative overflow-hidden mb-8">
                          <input
                            type="file"
                            id="csvFile"
                            onChange={handleFileUpload}
                            accept=".csv"
                            className="hidden"
                          />
                          <label htmlFor="csvFile" className="cursor-pointer block relative z-10">
                            <div className="w-20 h-20 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/5 group-hover:scale-110 transition-transform group-hover:border-emerald-500/30">
                              <Upload className="w-10 h-10 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                            </div>
                            <div className="text-lg font-bold text-white mb-2">
                              {uploadedFile ? uploadedFile.name : 'Select Data Registry'}
                            </div>
                            <p className="text-xs text-zinc-500 mb-8 font-bold uppercase tracking-widest">
                              Standardized CSV Format
                            </p>
                            <Button type="button" variant="outline" className="rounded-xl px-8 border-zinc-800 text-zinc-400 group-hover:text-white transition-colors">
                              {uploadedFile ? 'Change File' : 'Browse System'}
                            </Button>
                          </label>
                        </div>

                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                              <Download className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm">Schema Definition</p>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Version 2.1 Approved</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="rounded-lg border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black">
                            Get Template
                          </Button>
                        </div>
                      </div>

                      <div className="glass-card rounded-3xl p-8 border-white/5">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Execution Summary</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500 text-sm">Identified Records</span>
                            <span className="text-white font-bold">{previewData.length}</span>
                          </div>
                          <div className="flex items-center justify-between border-t border-white/5 pt-4">
                            <span className="text-zinc-500 text-sm">Network Fee Estimate</span>
                            <span className="text-emerald-500 font-mono font-bold text-sm">~ 0.042 ETH</span>
                          </div>
                          <div className="pt-6">
                            <Button
                              disabled={!uploadedFile}
                              onClick={handleSubmit}
                              className="w-full h-14 bg-emerald-500 text-black font-bold rounded-2xl shadow-lg shadow-emerald-950/20 hover:bg-emerald-400"
                            >
                              Authorize Batch Issuance
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preview Section */}
                    <div className="lg:col-span-12 xl:col-span-7">
                      <div className="glass-card rounded-3xl p-6 sm:p-10 shadow-2xl border-white/5 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center">
                              <FileStack className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                              <h2 className="text-xl font-bold text-white">Registry Preview</h2>
                              <p className="text-sm text-zinc-500">Live data validation before signing.</p>
                            </div>
                          </div>
                          {previewData.length > 0 && (
                            <button onClick={() => { setUploadedFile(null); setPreviewData([]); }} className="p-3 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>

                        <div className="flex-1 overflow-x-auto custom-scrollbar">
                          {previewData.length > 0 ? (
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="border-b border-white/5">
                                  <th className="px-4 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-left">Identity</th>
                                  <th className="px-4 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-left">Academic Status</th>
                                  <th className="px-4 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Integrity</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {previewData.map((row, i) => (
                                  <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-4 py-5">
                                      <p className="text-white font-semibold text-sm">{row.name}</p>
                                      <p className="text-[10px] font-mono text-zinc-600 mt-1 uppercase tracking-wider">{row.id}</p>
                                    </td>
                                    <td className="px-4 py-5">
                                      <p className="text-zinc-400 text-sm font-medium">{row.course}</p>
                                      <div className="flex items-center mt-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">{row.grade}</p>
                                      </div>
                                    </td>
                                    <td className="px-4 py-5 text-right">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 border border-green-500/10 text-[9px] font-bold uppercase tracking-widest">
                                        Valid
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-900 rounded-3xl">
                              <FileText className="w-16 h-16 text-zinc-800 mb-6" />
                              <p className="text-zinc-500 font-medium tracking-wide">Data registry is empty</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default IssueMultipleCertificates;

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
  ShieldCheck,
  FileStack,
  Loader2,
  Building2,
  Users,
  Eye,
  Settings,
  XCircle,
  Plus
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Sidebar } from '../../components/Sidebar';
import { TransactionStepper, StepStatus } from '../../components/ui/TransactionStepper';
import { useCertificateContract } from '../../../lib/contracts';
import { Classification, Faculty } from '../../../lib/contracts/types';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Transaction Steps
  const [txStep, setTxStep] = useState(0);
  const [steps, setSteps] = useState([
    { id: 'ipfs', label: 'Storage', description: 'Uploading metadata to IPFS', status: 'idle' as StepStatus },
    { id: 'sign', label: 'Sign', description: 'Awaiting wallet signature', status: 'idle' as StepStatus },
    { id: 'mint', label: 'Mint', description: 'Waiting for blockchain confirmation', status: 'idle' as StepStatus },
  ]);

  const updateStepStatus = (id: string, status: StepStatus) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && isSubmitting) {
      updateStepStatus('mint', 'complete');
      toast.success('Certificate issued successfully!');

      // Redirect after a short delay to show completion
      setTimeout(() => {
        router.push('/institution/view-certificates');
        setIsSubmitting(false);
      }, 2000);
    }
  }, [isConfirmed, isSubmitting, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'grade' || name === 'faculty' ? parseInt(value) : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
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
    setTxStep(0);

    // Reset steps
    setSteps([
      { id: 'ipfs', label: 'Storage', description: 'Uploading metadata to IPFS', status: 'loading' as StepStatus },
      { id: 'sign', label: 'Sign', description: 'Awaiting wallet signature', status: 'idle' as StepStatus },
      { id: 'mint', label: 'Mint', description: 'Waiting for blockchain confirmation', status: 'idle' as StepStatus },
    ]);

    try {
      // 1. Storage Step (Simulated)
      await new Promise(r => setTimeout(r, 1500));
      updateStepStatus('ipfs', 'complete');
      setTxStep(1);
      updateStepStatus('sign', 'loading');

      // 2. Sign Step
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

      updateStepStatus('sign', 'complete');
      setTxStep(2);
      updateStepStatus('mint', 'loading');

    } catch (error) {
      console.error('Certificate issuance failed:', error);
      updateStepStatus('ipfs', 'error');
      updateStepStatus('sign', 'error');
      updateStepStatus('mint', 'error');
      toast.error('Failed to issue certificate. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-black flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-zinc-950/50 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center justify-between h-16 px-4 sm:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-zinc-900 transition-colors"
            >
              <Menu className="w-6 h-6 text-zinc-400" />
            </button>
            <div className="flex items-center space-x-4">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold leading-[1.1] tracking-tight">
                <span className="bg-gradient-to-r from-green-300 via-green-400 to-green-500 bg-clip-text text-transparent">
                  Issue Certificate
                </span>
              </h1>
            </div>
            <div className="w-10"></div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-black relative px-4 sm:px-6 lg:px-8 pt-6 pb-6 sm:pb-8 flex flex-col items-center custom-scrollbar">
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-green-500/5 rounded-full blur-[100px] -z-10" />

          <div className="w-full max-w-4xl mx-auto relative z-10 pt-4">
            <AnimatePresence mode="wait">
              {isSubmitting ? (
                <motion.div
                  key="loading-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card rounded-3xl p-12 flex flex-col items-center justify-center border-green-500/20 shadow-2xl shadow-green-950/20"
                >
                  <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center mb-8 relative">
                    <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
                    <div className="absolute inset-0 bg-green-500/20 blur-xl animate-pulse rounded-full" />
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Issuing Credential</h2>
                  <p className="text-zinc-500 mb-12 text-center max-w-sm">Please follow the steps in your wallet and do not close this window.</p>

                  <div className="w-full max-w-md">
                    <TransactionStepper steps={steps} currentStepIndex={txStep} />
                  </div>

                  <Button
                    variant="outline"
                    className="mt-12 text-zinc-500 border-white/5 hover:bg-white/5"
                    onClick={() => setIsSubmitting(false)}
                  >
                    Cancel Transaction
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="form-state"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-3xl p-4 sm:p-6 lg:p-10 shadow-2xl"
                >
                  <div className="flex items-center space-x-5 mb-10">
                    <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center">
                      <FileStack className="w-7 h-7 text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white tracking-tight">Issue New Certificate</h2>
                      <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold mt-1">Single Student Entry</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="border-b border-white/5 pb-6">
                      <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">
                        Student Identity
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label="Full Name"
                          name="studentName"
                          value={formData.studentName}
                          onChange={handleInputChange}
                          error={errors.studentName}
                          placeholder="John Doe"
                        />
                        <Input
                          label="Student ID / Reg No"
                          name="studentID"
                          value={formData.studentID}
                          onChange={handleInputChange}
                          error={errors.studentID}
                          placeholder="STU-2024-001"
                        />
                      </div>

                      <div className="mt-6">
                        <Input
                          label="Wallet Address (Destined for NFT)"
                          name="studentWallet"
                          value={formData.studentWallet}
                          onChange={handleInputChange}
                          error={errors.studentWallet}
                          placeholder="0x..."
                        />
                      </div>
                    </div>

                    <div className="pb-6">
                      <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">
                        Academic Credentials
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label="Degree Title"
                          name="degreeTitle"
                          value={formData.degreeTitle}
                          onChange={handleInputChange}
                          error={errors.degreeTitle}
                          placeholder="B.Sc. Computer Science"
                        />
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">
                            Grade Performance
                          </label>
                          <select
                            name="grade"
                            value={formData.grade}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-white outline-none appearance-none"
                          >
                            <option value={Classification.FIRST_CLASS}>First Class</option>
                            <option value={Classification.SECOND_CLASS_UPPER}>Second Class Upper</option>
                            <option value={Classification.SECOND_CLASS_LOWER}>Second Class Lower</option>
                            <option value={Classification.THIRD_CLASS}>Third Class</option>
                            <option value={Classification.PASS}>Pass</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <Input
                          label="Duration of Study"
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          error={errors.duration}
                          placeholder="2020 - 2024"
                        />
                        <Input
                          label="Final CGPA"
                          name="cgpa"
                          value={formData.cgpa}
                          onChange={handleInputChange}
                          error={errors.cgpa}
                          placeholder="3.85 / 4.0"
                        />
                      </div>

                      <div className="mt-6">
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">
                          Academic Faculty
                        </label>
                        <select
                          name="faculty"
                          value={formData.faculty}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-white outline-none appearance-none"
                        >
                          <option value={Faculty.ENGINEERING}>Engineering & Technology</option>
                          <option value={Faculty.MEDICINE}>Medicine & Health Sciences</option>
                          <option value={Faculty.LAW}>Law & Legal Studies</option>
                          <option value={Faculty.BUSINESS}>Business & Economics</option>
                          <option value={Faculty.ARTS}>Arts & Humanities</option>
                          <option value={Faculty.SCIENCE}>Natural Sciences</option>
                          <option value={Faculty.OTHER}>Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-white/5">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/institution/dashboard')}
                        className="border-zinc-800 text-zinc-400 hover:text-white"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-green-500 text-black font-bold hover:bg-green-400 px-8"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirm & Issue
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default IssueCertificate;

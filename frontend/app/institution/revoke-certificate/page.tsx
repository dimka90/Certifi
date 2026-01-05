'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useConfig } from 'wagmi';
import { readContract } from '@wagmi/core';
import {
  Award,
  ArrowLeft,
  XCircle,
  Search,
  AlertTriangle,
  CheckCircle,
  Eye,
  Trash2,
  Menu,
  X,
  History,
  ShieldAlert,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Sidebar } from '../../components/Sidebar';
import { TransactionStepper, StepStatus } from '../../components/ui/TransactionStepper';
import { useCertificateContract } from '../../../lib/contracts';
import { CERTIFICATE_MANAGER_ABI } from '../../../lib/contracts/abi';
import { getContractAddress } from '../../../lib/contracts/address';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const RevokeCertificate = () => {
  const router = useRouter();
  const { address } = useAccount();
  const config = useConfig();
  const {
    useGetCertificatesByInstitution,
    revokeCertificate,
    isPending,
    isConfirming,
    isConfirmed
  } = useCertificateContract();

  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [revokeForm, setRevokeForm] = useState({
    tokenId: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [certificatesData, setCertificatesData] = useState<any[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(false);

  // Transaction Steps
  const [txStep, setTxStep] = useState(0);
  const [steps, setSteps] = useState([
    { id: 'prepare', label: 'Safety Check', description: 'Verifying revocation permissions', status: 'idle' as StepStatus },
    { id: 'sign', label: 'Authorize', description: 'Awaiting wallet signature', status: 'idle' as StepStatus },
    { id: 'block', label: 'Broadcast', description: 'Updating blockchain state', status: 'idle' as StepStatus },
  ]);

  const updateStepStatus = (id: string, status: StepStatus) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  // Fetch token IDs
  const { data: tokenIds, isLoading: isLoadingIds } = useGetCertificatesByInstitution(address || '0x0000000000000000000000000000000000000000');

  const revocationReasons = [
    'Academic misconduct',
    'Fraudulent information',
    'Institution policy violation',
    'Student request',
    'Administrative error',
    'Other'
  ];

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!tokenIds || (tokenIds as bigint[]).length === 0) {
        setCertificatesData([]);
        return;
      }

      setLoadingCerts(true);
      try {
        const certs = [];
        for (const tokenId of tokenIds as bigint[]) {
          try {
            const cert: any = await readContract(config, {
              address: getContractAddress() as `0x${string}`,
              abi: CERTIFICATE_MANAGER_ABI,
              functionName: 'getCertificate',
              args: [tokenId],
            });

            if (cert && !cert.isRevoked) {
              certs.push({
                tokenId,
                ...cert,
                studentName: cert.studentName || cert[0],
                studentID: cert.studentID || cert[1],
                degreeTitle: cert.degreeTitle || cert[3],
              });
            }
          } catch (certError) {
            console.error(`Error fetching certificate ${tokenId}:`, certError);
          }
        }
        setCertificatesData(certs);
      } catch (err) {
        console.error('Error fetching certificates:', err);
      } finally {
        setLoadingCerts(false);
      }
    };

    fetchCertificates();
  }, [tokenIds, config]);

  useEffect(() => {
    if (isConfirmed && isSubmitting) {
      updateStepStatus('block', 'complete');
      toast.success('Certificate revoked successfully!');
      setTimeout(() => {
        router.push('/institution/view-certificates');
        setIsSubmitting(false);
      }, 2000);
    }
  }, [isConfirmed, isSubmitting, router]);

  const handleCertificateSelect = (certificate: any) => {
    setSelectedCertificate(certificate);
    setRevokeForm({
      tokenId: certificate.tokenId?.toString() || '',
      reason: ''
    });
    setErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRevokeForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!revokeForm.tokenId.trim()) newErrors.tokenId = 'Token ID is required';
    if (!revokeForm.reason.trim()) newErrors.reason = 'Reason is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !address) return;

    setIsSubmitting(true);
    setTxStep(0);
    setSteps([
      { id: 'prepare', label: 'Safety Check', description: 'Verifying revocation permissions', status: 'loading' as StepStatus },
      { id: 'sign', label: 'Authorize', description: 'Awaiting wallet signature', status: 'idle' as StepStatus },
      { id: 'block', label: 'Broadcast', description: 'Updating blockchain state', status: 'idle' as StepStatus },
    ]);

    try {
      await new Promise(r => setTimeout(r, 1500));
      updateStepStatus('prepare', 'complete');
      setTxStep(1);
      updateStepStatus('sign', 'loading');

      await revokeCertificate({
        tokenId: BigInt(revokeForm.tokenId),
        reason: revokeForm.reason,
      });

      updateStepStatus('sign', 'complete');
      setTxStep(2);
      updateStepStatus('block', 'loading');
    } catch (error) {
      console.error('Revocation failed:', error);
      updateStepStatus('sign', 'error');
      toast.error('Revocation failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const filteredCertificates = certificatesData.filter((cert: any) =>
    cert.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.degreeTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.tokenId?.toString().includes(searchTerm)
  );

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
                <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
                  Internal Revocation
                </span>
              </h1>
            </div>
            <div className="w-10"></div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-black relative custom-scrollbar">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] -z-10" />

          <div className="px-4 sm:px-6 lg:px-8 py-8 pt-10">
            <div className="max-w-[1400px] mx-auto">
              <AnimatePresence mode="wait">
                {isSubmitting ? (
                  <motion.div
                    key="step-loading"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="max-w-2xl mx-auto glass-card rounded-[2.5rem] p-12 flex flex-col items-center justify-center border-red-500/20 shadow-2xl shadow-red-950/20"
                  >
                    <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-8 relative">
                      <ShieldAlert className="w-10 h-10 text-red-500" />
                      <div className="absolute inset-0 bg-red-500/20 blur-xl animate-pulse rounded-full" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 tracking-tight text-center">Permanently Revoking</h2>
                    <p className="text-zinc-500 mb-12 text-center max-w-sm">This action cannot be undone. Please finalize the transaction in your wallet.</p>

                    <div className="w-full">
                      <TransactionStepper steps={steps} currentStepIndex={txStep} />
                    </div>
                    <Button variant="outline" className="mt-12 text-zinc-500 border-white/5" onClick={() => setIsSubmitting(false)}>
                      Cancel Action
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="main-ui"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                  >
                    {/* List Section */}
                    <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                      <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                          <div>
                            <h2 className="text-xl font-bold text-white">Active Credentials</h2>
                            <p className="text-sm text-zinc-500 mt-1 uppercase tracking-widest font-bold">Search and Select</p>
                          </div>
                          <div className="relative w-64 hidden sm:block">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                              type="text"
                              placeholder="Search list..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:border-red-500/50 outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <div className="overflow-x-auto flex-1 custom-scrollbar">
                          {loadingCerts || isLoadingIds ? (
                            <div className="py-20 flex flex-col items-center justify-center">
                              <Loader2 className="w-10 h-10 text-red-500 animate-spin mb-4" />
                              <p className="text-zinc-500 font-medium">Loading valid credentials...</p>
                            </div>
                          ) : filteredCertificates.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center">
                              <History className="w-12 h-12 text-zinc-800 mb-4" />
                              <p className="text-zinc-500">No active certificates found</p>
                            </div>
                          ) : (
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="border-b border-white/5">
                                  <th className="px-4 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-left">Recipient</th>
                                  <th className="px-4 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-left">Faculty / Course</th>
                                  <th className="px-4 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Select</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {filteredCertificates.map((cert) => (
                                  <tr
                                    key={cert.tokenId.toString()}
                                    className={`group cursor-pointer hover:bg-white/[0.02] transition-colors ${selectedCertificate?.tokenId === cert.tokenId ? 'bg-red-500/5' : ''}`}
                                    onClick={() => handleCertificateSelect(cert)}
                                  >
                                    <td className="px-4 py-5">
                                      <p className="text-white font-semibold text-sm">{cert.studentName}</p>
                                      <p className="text-[10px] font-mono text-zinc-600 mt-0.5">#{cert.tokenId.toString()}</p>
                                    </td>
                                    <td className="px-4 py-5 font-medium text-sm text-zinc-400">
                                      {cert.degreeTitle}
                                    </td>
                                    <td className="px-4 py-5 text-right">
                                      <div className={`w-6 h-6 rounded-full border-2 mx-auto flex items-center justify-center transition-all ${selectedCertificate?.tokenId === cert.tokenId ? 'border-red-500 bg-red-500 text-black' : 'border-zinc-800'}`}>
                                        {selectedCertificate?.tokenId === cert.tokenId && <CheckCircle className="w-4 h-4" />}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Form Section */}
                    <div className="lg:col-span-12 xl:col-span-5">
                      <div className="glass-card rounded-3xl p-6 sm:p-10 shadow-2xl sticky top-8">
                        <div className="mb-10">
                          <h2 className="text-2xl font-bold text-white tracking-tight">Revocation Protocol</h2>
                          <p className="text-sm text-zinc-500 mt-2">Identify the core reason for invalidating this record.</p>
                        </div>

                        {selectedCertificate ? (
                          <div className="mb-10 p-6 bg-red-500/5 border border-red-500/20 rounded-3xl relative">
                            <ShieldAlert className="w-12 h-12 absolute -top-4 -right-4 text-red-500/20 rotate-12" />
                            <div className="space-y-4">
                              <div>
                                <p className="text-[10px] font-bold text-red-500/70 uppercase tracking-widest mb-1">Authenticated Recipient</p>
                                <p className="text-white font-bold text-lg">{selectedCertificate.studentName}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-red-500/10">
                                <div>
                                  <p className="text-[10px] font-bold text-red-500/50 uppercase tracking-[0.2em] mb-1">Token Link</p>
                                  <p className="text-white font-mono text-xs">CERT-{selectedCertificate.tokenId.toString()}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] font-bold text-red-500/50 uppercase tracking-[0.2em] mb-1">Origin Dept</p>
                                  <p className="text-white text-xs">{selectedCertificate.faculty || 'Unspecified'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-10 p-12 bg-zinc-950/50 border border-zinc-800 border-dashed rounded-3xl flex flex-col items-center justify-center text-center">
                            <History className="w-10 h-10 text-zinc-800 mb-4" />
                            <p className="text-zinc-500 text-sm font-medium">Select a valid credential from the list to continue.</p>
                          </div>
                        )}

                        <form onSubmit={handleRevoke} className="space-y-6">
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-3 px-1">Revocation Mandate</label>
                            <div className="relative">
                              <select
                                name="reason"
                                value={revokeForm.reason}
                                onChange={handleInputChange}
                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all appearance-none cursor-pointer"
                              >
                                <option value="">Identify Specific Reason</option>
                                {revocationReasons.map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                              <ChevronRight className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 rotate-90" />
                            </div>
                            {errors.reason && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 uppercase">{errors.reason}</p>}
                          </div>

                          <div className="pt-6 border-t border-white/5 space-y-4">
                            <Button
                              type="submit"
                              disabled={!selectedCertificate || isSubmitting}
                              className="w-full h-14 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl shadow-lg shadow-red-950/30"
                            >
                              <ShieldAlert className="w-5 h-5 mr-2" />
                              Execute Revocation
                            </Button>
                            <Button
                              variant="outline"
                              type="button"
                              className="w-full h-14 border-zinc-800 text-zinc-500 hover:text-white rounded-2xl"
                              onClick={() => { setSelectedCertificate(null); setRevokeForm({ tokenId: '', reason: '' }); }}
                            >
                              Reset
                            </Button>
                          </div>
                        </form>
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

export default RevokeCertificate;

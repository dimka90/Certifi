/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useReadContract, useConfig } from 'wagmi';
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
  X
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useCertificateContract } from '../../../lib/contracts';
import { CERTIFICATE_MANAGER_ABI } from '../../../lib/contracts/abi';
import { getContractAddress } from '../../../lib/contracts/address';
import { toast } from 'react-hot-toast';

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

  // Fetch token IDs for the connected institution
  const { data: tokenIds, isLoading, error } = useGetCertificatesByInstitution(address || '0x0000000000000000000000000000000000000000');

  const revocationReasons = [
    'Academic misconduct',
    'Fraudulent information',
    'Institution policy violation',
    'Student request',
    'Administrative error',
    'Other'
  ];

  // Fetch certificate details and check revocation status
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
            // Fetch full certificate details
            const cert: any = await readContract(config, {
              address: getContractAddress() as `0x${string}`,
              abi: CERTIFICATE_MANAGER_ABI,
              functionName: 'getCertificate',
              args: [tokenId],
            });

            // Check revocation status using isRevoked function
            const isRevoked: boolean = await readContract(config, {
              address: getContractAddress() as `0x${string}`,
              abi: CERTIFICATE_MANAGER_ABI,
              functionName: 'isRevoked',
              args: [tokenId],
            });

            console.log('Certificate details for token', tokenId.toString(), ':', cert);
            console.log('Is revoked for token', tokenId.toString(), ':', isRevoked);

            if (cert) {
              certs.push({
                tokenId,
                ...cert,
                isRevoked: isRevoked,
                // Map certificate struct to readable format
                studentName: cert.studentName || cert[0],
                studentID: cert.studentID || cert[1],
                studentWallet: cert.studentWallet || cert[2],
                degreeTitle: cert.degreeTitle || cert[3],
                issueDate: cert.issueDate || cert[4],
                grade: cert.grade !== undefined ? cert.grade : cert[5],
                duration: cert.duration || cert[6],
                cgpa: cert.cgpa || cert[7],
                faculty: cert.faculty !== undefined ? cert.faculty : cert[8],
                issuingInstitution: cert.issuingInstitution || cert[9],
                revocationDate: cert.revocationDate || cert[11],
                revocationReason: cert.revocationReason || cert[12]
              });
            }
          } catch (certError) {
            console.error(`Error fetching certificate ${tokenId}:`, certError);
          }
        }
        console.log('All certificates with revocation status:', certs);
        setCertificatesData(certs);
      } catch (err) {
        console.error('Error fetching certificates:', err);
      } finally {
        setLoadingCerts(false);
      }
    };

    fetchCertificates();
  }, [tokenIds, config]);

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
    setRevokeForm((prev: any) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!revokeForm.tokenId.trim()) {
      newErrors.tokenId = 'Token ID is required';
    }

    if (!revokeForm.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRevoke = async (e: React.FormEvent) => {
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
      await revokeCertificate({
        tokenId: BigInt(revokeForm.tokenId),
        reason: revokeForm.reason,
      });

      toast.success('Certificate revocation submitted!');

      // Wait for transaction confirmation
      if (isConfirmed) {
        toast.success('Certificate revoked successfully!');
        setSelectedCertificate(null);
        setRevokeForm({ tokenId: '', reason: '' });
      }
    } catch (error) {
      console.error('Certificate revocation failed:', error);
      toast.error('Failed to revoke certificate. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCertificates = certificatesData?.filter((cert: any) =>
    cert.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.degreeTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.tokenId?.toString().includes(searchTerm)
  ) || [];

  return (
    <div className="h-screen bg-black flex overflow-hidden relative">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[140px] -z-10 pointer-events-none" />

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-white/5 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}>
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
              onClick={() => router.push('/institution/dashboard')}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 text-zinc-400 hover:bg-zinc-900 hover:text-white group"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden z-10">
        <header className="bg-zinc-950/50 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center justify-between h-16 px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-4">
              <h1 className="text-xl sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl xl:text-5xl font-bold leading-[1.1] tracking-tight">
                <span className="bg-gradient-to-r from-green-300 via-green-400 to-green-500 bg-clip-text text-transparent">
                  Revoke Certificate
                </span>
              </h1>
            </div>
            <div className="lg:hidden w-10"></div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-transparent px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12  ">
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 min-h-[600px]">

              {/* Certificates Table */}
              <div className="bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6 flex flex-col shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-tight">Certificates</h2>
                      <p className="text-sm text-zinc-400 font-medium">Select a certificate to revoke</p>
                    </div>
                  </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-4 h-4 transition-colors group-focus-within:text-red-400" />
                    <Input
                      placeholder="Search certificates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-11 bg-zinc-950/50 border-white/5 text-white placeholder:text-zinc-600 focus:ring-red-500/50 focus:border-red-500/50 transition-all rounded-xl h-12"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto flex-1">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="bg-zinc-950">
                        <th className="text-left py-4 px-4 font-semibold text-zinc-500 text-[10px] uppercase tracking-wider">Token ID</th>
                        <th className="text-left py-4 px-4 font-semibold text-zinc-500 text-[10px] uppercase tracking-wider">Student</th>
                        <th className="text-left py-4 px-4 font-semibold text-zinc-500 text-[10px] uppercase tracking-wider">Course</th>
                        <th className="text-left py-4 px-4 font-semibold text-zinc-500 text-[10px] uppercase tracking-wider">Status</th>
                        <th className="text-left py-4 px-4 font-semibold text-zinc-500 text-[10px] uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading || loadingCerts ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-zinc-500">
                            <div className="flex flex-col items-center justify-center space-y-4">
                              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
                              <span className="font-medium tracking-wide">Fetching blockchain data...</span>
                            </div>
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-red-500">
                            <div className="flex flex-col items-center">
                              <AlertTriangle className="w-10 h-10 mb-2 opacity-50" />
                              <span className="font-medium">Error loading certificates</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredCertificates.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-zinc-500">
                            <div className="flex flex-col items-center">
                              <Search className="w-10 h-10 mb-2 opacity-20" />
                              <span className="font-medium">No certificates found</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredCertificates.map((certificate: any, index: number) => (
                          <tr
                            key={index}
                            className={`hover:bg-white/5 transition-all duration-200 cursor-pointer ${selectedCertificate?.tokenId === certificate.tokenId ? 'bg-red-500/10' : ''
                              }`}
                            onClick={() => handleCertificateSelect(certificate)}
                          >
                            <td className="py-4 px-4 font-mono text-xs text-white">
                              {certificate.tokenId?.toString()}
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-bold text-white text-sm tracking-tight">{certificate.studentName}</div>
                                <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-0.5">{certificate.studentID}</div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm text-zinc-400 font-medium">{certificate.degreeTitle}</div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${certificate.isRevoked
                                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                : 'bg-green-500/10 text-green-400 border-green-500/20'
                                }`}>
                                {certificate.isRevoked ? 'Revoked' : 'Active'}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCertificateSelect(certificate);
                                }}
                                className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all p-2 rounded-lg"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Revoke Form */}
              <div className="bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-8 flex flex-col shadow-2xl relative overflow-hidden">
                <div className="flex items-center space-x-3 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Revocation Details</h2>
                    <p className="text-sm text-zinc-400 font-medium">Verify and confirm the action</p>
                  </div>
                </div>

                {selectedCertificate ? (
                  <div className="mb-8 p-6 bg-red-500/5 border border-red-500/20 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                      <AlertTriangle className="w-12 h-12 text-red-500" />
                    </div>
                    <h3 className="font-bold text-red-500 mb-4 uppercase tracking-widest text-xs">Selected Certificate</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-red-500/60 font-bold uppercase tracking-wider">Token ID</span>
                        <span className="text-white font-mono text-sm">{selectedCertificate.tokenId?.toString()}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-red-500/10 pt-3">
                        <span className="text-[10px] text-red-500/60 font-bold uppercase tracking-wider">Student</span>
                        <span className="text-white font-bold">{selectedCertificate.studentName}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-red-500/10 pt-3">
                        <span className="text-[10px] text-red-500/60 font-bold uppercase tracking-wider">Degree</span>
                        <span className="text-zinc-300 font-medium">{selectedCertificate.degreeTitle}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8 p-10 bg-zinc-950/50 border border-white/5 rounded-2xl border-dashed flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-white/5">
                      <Trash2 className="w-8 h-8 text-zinc-700" />
                    </div>
                    <p className="text-zinc-500 font-medium text-sm max-w-[200px]">Select a certificate from the table to begin revocation.</p>
                  </div>
                )}

                <form onSubmit={handleRevoke} className="space-y-4 flex-1 flex flex-col">
                  <div>
                    <Input
                      label="Token ID *"
                      name="tokenId"
                      value={revokeForm.tokenId}
                      onChange={handleInputChange}
                      error={errors.tokenId}
                      placeholder="Enter token ID"
                      disabled={!!selectedCertificate}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-3 ml-1">
                      Reason for Revocation *
                    </label>
                    <div className="relative group">
                      <select
                        name="reason"
                        value={revokeForm.reason}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-zinc-950/50 border border-white/5 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all text-white focus:outline-none appearance-none cursor-pointer h-12"
                      >
                        <option value="" className="bg-zinc-950 text-zinc-500">Select reason</option>
                        {revocationReasons.map((reason) => (
                          <option key={reason} value={reason} className="bg-zinc-950 text-white">
                            {reason}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 group-hover:text-zinc-300 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {errors.reason && (
                      <p className="text-red-500 text-[11px] mt-2 ml-1 flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {errors.reason}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-8 mt-auto border-t border-white/5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedCertificate(null);
                        setRevokeForm({ tokenId: '', reason: '' });
                      }}
                      className="flex-1 w-full sm:w-auto border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 h-12"
                    >
                      Clear Selection
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={!selectedCertificate || isSubmitting || isPending || isConfirming}
                      className="flex-1 w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-bold h-12 shadow-lg shadow-red-950/20"
                    >
                      {isSubmitting || isPending ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          {isPending ? 'Pending...' : 'Revoking...'}
                        </div>
                      ) : isConfirming ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Confirming...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <XCircle className="w-5 h-5 mr-2" />
                          Revoke Certificate
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RevokeCertificate;

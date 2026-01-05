'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useConfig } from 'wagmi';
import { readContract } from '@wagmi/core';
import {
  Award,
  Search,
  Eye,
  Download,
  ArrowLeft,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Menu,
  X,
  Building2,
  Users,
  FileText,
  Filter,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  FileStack,
  Loader2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Sidebar } from '../../components/Sidebar';
import { useCertificateContract } from '../../../lib/contracts';
import { CERTIFICATE_MANAGER_ABI } from '../../../lib/contracts/abi';
import { getContractAddress } from '../../../lib/contracts/address';
import { GRADE_LABELS, FACULTY_LABELS, Certificate } from '../../../lib/contracts/types';
import { motion, AnimatePresence } from 'framer-motion';

const ViewCertificates = () => {
  const router = useRouter();
  const { address } = useAccount();
  const config = useConfig();
  const {
    useGetCertificatesByInstitution,
    useGetTotalCertificatesIssued
  } = useCertificateContract();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch token IDs and total count
  const { data: tokenIds, isLoading: isLoadingIds, error: idsError } = useGetCertificatesByInstitution(address || '0x0000000000000000000000000000000000000000');
  const { data: totalCertificates } = useGetTotalCertificatesIssued();
  const [certificatesData, setCertificatesData] = useState<any[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(false);

  // Fetch certificate details for each token ID
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

            if (cert) {
              certs.push({ tokenId, cert });
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

  // Process certificate data for display
  const processedCertificates = certificatesData.map((item: any, index: number) => {
    const cert = item.cert;
    const tokenId = item.tokenId;

    return {
      id: tokenId?.toString() || `CERT-${index}`,
      tokenId: tokenId?.toString(),
      studentName: cert.studentName || 'Unknown Student',
      studentID: cert.studentID || 'N/A',
      courseName: cert.degreeTitle || 'Unknown Course',
      issueDate: cert.issueDate ? new Date(Number(cert.issueDate) * 1000).toISOString().split('T')[0] : 'N/A',
      status: cert.isRevoked ? 'Revoked' : 'Active',
      grade: GRADE_LABELS[cert.grade as keyof typeof GRADE_LABELS] || 'N/A',
      studentWallet: cert.studentWallet || 'N/A',
      duration: cert.duration || 'N/A',
      cgpa: cert.cgpa || 'N/A',
      faculty: FACULTY_LABELS[cert.faculty as keyof typeof FACULTY_LABELS] || 'N/A',
      issuer: cert.issuingInstitution,
      tokenURI: cert.tokenURI
    };
  });

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Revoked':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
    }
  };

  const filteredCertificates = processedCertificates.filter((cert: any) => {
    const matchesSearch = cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.studentID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || cert.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleRevoke = (certificateId: string) => {
    router.push(`/institution/revoke-certificate?id=${certificateId}`);
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
              <h1 className="text-xl font-bold leading-[1.1] tracking-tight">
                <span className="bg-gradient-to-r from-green-300 via-green-400 to-green-500 bg-clip-text text-transparent">
                  Issued Records
                </span>
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-bold text-green-400 uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3 mr-1.5" />
                Verified Institution
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-black relative custom-scrollbar">
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-green-500/5 rounded-full blur-[100px] -z-10" />

          <div className="px-4 sm:px-6 lg:px-8 py-8 pt-10">
            <div className="max-w-7xl mx-auto space-y-10">

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Total Issued', value: totalCertificates?.toString() || '0', icon: FileStack, color: 'text-blue-400' },
                  { label: 'Active Credentials', value: processedCertificates.filter(c => c.status === 'Active').length.toString(), icon: CheckCircle, color: 'text-green-400' },
                  { label: 'Revoked Certificates', value: processedCertificates.filter(c => c.status === 'Revoked').length.toString(), icon: XCircle, color: 'text-red-400' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-6 rounded-3xl group hover:border-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{stat.label}</p>
                        <p className="text-2xl font-bold text-white tracking-tight mt-1">{stat.value}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Enhanced Filter Bar */}
              <div className="glass-card rounded-3xl p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 items-center">
                <div className="relative flex-1 w-full lg:w-auto">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search by student name, ID or course..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                  />
                </div>
                <div className="flex items-center space-x-4 w-full lg:w-auto">
                  <div className="relative w-full lg:w-48">
                    <Filter className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full pl-10 pr-6 py-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active Only</option>
                      <option value="revoked">Revoked</option>
                    </select>
                  </div>
                  <Button variant="outline" className="h-[58px] rounded-2xl px-6 border-zinc-800 text-zinc-400 hover:text-white">
                    <Download className="w-5 h-5 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Results Table */}
              <div className="glass-card rounded-3xl overflow-hidden border-white/5 shadow-2xl">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-950/50 border-b border-white/5">
                        <th className="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Student Details</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Academic Info</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Status</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Issued</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loadingCerts || isLoadingIds ? (
                        <tr>
                          <td colSpan={5} className="px-8 py-20 text-center">
                            <div className="flex flex-col items-center justify-center space-y-4">
                              <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
                              <p className="text-zinc-500 text-sm font-medium">Synchronizing with blockchain...</p>
                            </div>
                          </td>
                        </tr>
                      ) : filteredCertificates.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-8 py-20 text-center">
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <FileStack className="w-12 h-12 text-zinc-800" />
                              <p className="text-white font-medium">No certificates match your query</p>
                              <p className="text-zinc-500 text-sm">Try adjusting your filters or search term</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredCertificates.map((cert) => (
                          <motion.tr
                            key={cert.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="group hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-8 py-6">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-600 font-bold border border-white/5 group-hover:border-green-500/30 transition-colors">
                                  {cert.studentName.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-white font-semibold tracking-tight">{cert.studentName}</p>
                                  <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-wider">{cert.studentID}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <p className="text-white font-medium text-sm">{cert.courseName}</p>
                              <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-1.5">{cert.grade}</p>
                            </td>
                            <td className="px-8 py-6">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyles(cert.status)}`}>
                                <div className={`w-1 h-1 rounded-full mr-2 ${cert.status === 'Active' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                                {cert.status}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <p className="text-zinc-400 text-sm">{new Date(cert.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => setSelectedCertificate(cert)}
                                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 hover:text-green-400 hover:bg-green-500/10 border border-white/5 transition-all"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {cert.status === 'Active' && (
                                  <button
                                    onClick={() => handleRevoke(cert.id)}
                                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-white/5 transition-all"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                )}
                                <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white border border-white/5 transition-all">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCertificate && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCertificate(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl glass-card rounded-[2.5rem] overflow-hidden shadow-2xl border-white/10"
            >
              <div className="p-8 sm:p-12">
                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center space-x-5">
                    <div className="w-16 h-16 bg-green-500/10 rounded-3xl flex items-center justify-center border border-green-500/20">
                      <FileText className="w-8 h-8 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Credential Audit</h3>
                      <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold mt-1">Token ID: #{selectedCertificate.tokenId}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCertificate(null)}
                    className="p-3 bg-white/5 rounded-2xl text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  {[
                    { label: 'Recipient', val: selectedCertificate.studentName },
                    { label: 'Student ID', val: selectedCertificate.studentID },
                    { label: 'Credential Name', val: selectedCertificate.courseName },
                    { label: 'Grade Ranking', val: selectedCertificate.grade },
                    { label: 'Date of Issue', val: selectedCertificate.issueDate },
                    { label: 'Study Faculty', val: selectedCertificate.faculty },
                  ].map(field => (
                    <div key={field.label}>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2">{field.label}</p>
                      <p className="text-white font-medium">{field.val}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-10 pt-10 border-t border-white/5">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3">Blockchain Anchor</p>
                  <div className="bg-zinc-950/80 rounded-2xl p-4 border border-white/5 flex items-center justify-between group cursor-pointer hover:border-green-500/20 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <ExternalLink className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-xs text-zinc-400 font-mono truncate max-w-[200px] sm:max-w-md">{selectedCertificate.tokenURI}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-green-500 transition-colors" />
                  </div>
                </div>

                <div className="mt-12 flex space-x-4">
                  <Button className="flex-1 h-14 bg-green-500 text-black font-bold hover:bg-green-400 rounded-2xl shadow-lg shadow-green-950/20">
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" className="h-14 px-8 border-zinc-800 text-zinc-400 hover:text-white rounded-2xl" onClick={() => setSelectedCertificate(null)}>
                    Dismiss
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewCertificates;

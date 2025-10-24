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
    setRevokeForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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
    <div className="h-screen bg-gray-100 flex">
      {/* Sidebar */}
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
              onClick={() => router.push('/institution/dashboard')}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
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

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b-2 border-gray-300">
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

        <main className="flex-1 overflow-y-auto bg-gray-50 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12  ">
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 min-h-[600px]">
              
              {/* Certificates Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                   
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Certificates</h2>
                      <p className="text-sm text-gray-600">Select a certificate to revoke</p>
                    </div>
                  </div>
                </div>

                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-1 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="           Search certificates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto flex-1">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Token ID</th>
                        <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Student</th>
                        <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Degree</th>
                        <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Status</th>
                        <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading || loadingCerts ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-gray-500">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                              <span>Loading certificates from blockchain...</span>
                            </div>
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-red-500">
                            Error loading certificates
                          </td>
                        </tr>
                      ) : filteredCertificates.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-gray-500">
                            No certificates found
                          </td>
                        </tr>
                      ) : (
                        filteredCertificates.map((certificate: any, index: number) => (
                          <tr 
                            key={index}
                            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              selectedCertificate?.tokenId === certificate.tokenId ? 'bg-red-50 border-red-200' : ''
                            }`}
                            onClick={() => handleCertificateSelect(certificate)}
                          >
                            <td className="py-3 px-2 sm:px-4 font-mono text-xs sm:text-sm">
                              <div className="truncate max-w-[80px] sm:max-w-none">
                                {certificate.tokenId?.toString()}
                              </div>
                            </td>
                            <td className="py-3 px-2 sm:px-4">
                              <div>
                                <div className="font-medium text-gray-900 text-xs sm:text-sm truncate">{certificate.studentName}</div>
                                <div className="text-xs text-gray-500 truncate">{certificate.studentID}</div>
                              </div>
                            </td>
                            <td className="py-3 px-2 sm:px-4">
                              <div className="text-xs sm:text-sm text-gray-700 truncate max-w-[120px] sm:max-w-none">{certificate.degreeTitle}</div>
                            </td>
                            <td className="py-3 px-2 sm:px-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                certificate.isRevoked 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {certificate.isRevoked ? 'Revoked' : 'Active'}
                              </span>
                            </td>
                            <td className="py-3 px-2 sm:px-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCertificateSelect(certificate);
                                }}
                                className="text-red-600 hover:text-red-800 transition-colors p-1"
                              >
                                <Trash2 className="w-4 h-4" />
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 flex flex-col">
                <div className="flex items-center space-x-3 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Revoke Certificate</h2>
                  </div>
                </div>

                {selectedCertificate ? (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-2">Selected Certificate</h3>
                    <div className="text-sm text-red-700">
                      <div><strong>Token ID:</strong> {selectedCertificate.tokenId?.toString()}</div>
                      <div><strong>Student:</strong> {selectedCertificate.studentName}</div>
                      <div><strong>Degree:</strong> {selectedCertificate.degreeTitle}</div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-gray-600 text-sm">Please select a certificate from the table to revoke.</p>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Revocation *
                    </label>
                    <select
                      name="reason"
                      value={revokeForm.reason}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-gray-900 bg-white hover:border-gray-400 focus:outline-none"
                      style={{ 
                        color: '#111827',
                        backgroundColor: '#ffffff',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 12px center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '16px'
                      }}
                    >
                      <option value="" style={{ color: '#6b7280' }}>Select reason</option>
                      {revocationReasons.map((reason) => (
                        <option key={reason} value={reason} style={{ color: '#111827' }}>
                          {reason}
                        </option>
                      ))}
                    </select>
                    {errors.reason && (
                      <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 mt-auto">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedCertificate(null);
                        setRevokeForm({ tokenId: '', reason: '' });
                      }}
                      className="flex-1 w-full sm:w-auto"
                    >
                      Clear Selection
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={!selectedCertificate || isSubmitting || isPending || isConfirming}
                      className="flex-1 w-full sm:w-auto bg-red-600 hover:bg-red-700"
                    >
                      {isSubmitting || isPending ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          {isPending ? 'Transaction Pending...' : 'Revoking Certificate...'}
                        </div>
                      ) : isConfirming ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Confirming Transaction...
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

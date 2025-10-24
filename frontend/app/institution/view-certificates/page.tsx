/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useReadContract, useConfig } from 'wagmi';
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
  FileText
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useCertificateContract } from '../../../lib/contracts';
import { CERTIFICATE_MANAGER_ABI } from '../../../lib/contracts/abi';
import { getContractAddress } from '../../../lib/contracts/address';

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
  const { data: tokenIds, isLoading, error } = useGetCertificatesByInstitution(address || '0x0000000000000000000000000000000000000000');
  const { data: totalCertificates, isLoading: isLoadingTotal, error: totalError } = useGetTotalCertificatesIssued();
  const [certificatesData, setCertificatesData] = useState<any[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(false);

  // Debug logging
  console.log('Token IDs:', tokenIds);
  console.log('Total certificates:', totalCertificates);
  console.log('Loading states:', { isLoading, isLoadingTotal });
  console.log('Errors:', { error, totalError });

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
            // Use readContract from wagmi core to fetch each certificate
            const cert: any = await readContract(config, {
              address: getContractAddress() as `0x${string}`,
              abi: CERTIFICATE_MANAGER_ABI,
              functionName: 'getCertificate',
              args: [tokenId],
            });
            
            console.log('Fetched certificate for token', tokenId.toString(), ':', cert);
            
            if (cert) {
              certs.push({ tokenId, cert });
            }
          } catch (certError) {
            console.error(`Error fetching certificate ${tokenId}:`, certError);
          }
        }
        console.log('All certificates fetched:', certs);
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
    console.log('Processing certificate item:', item);
    const cert = item.cert || item;
    const tokenId = item.tokenId;
    
    // Certificate struct from ABI: [studentName, studentID, studentWallet, degreeTitle, issueDate, grade, duration, cgpa, faculty, issuingInstitution, isRevoked, revocationDate, revocationReason]
    return {
      id: tokenId?.toString() || `CERT-${index}`,
      tokenId: tokenId?.toString(),
      studentName: cert.studentName || cert[0] || 'Unknown Student',
      studentEmail: cert.studentID || cert[1] || 'N/A',
      courseName: cert.degreeTitle || cert[3] || 'Unknown Course',
      certificateType: 'Certificate',
      issueDate: (cert.issueDate || cert[4]) ? new Date(Number(cert.issueDate || cert[4]) * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: (cert.isRevoked || cert[10]) ? 'Revoked' : 'Active',
      grade: cert.grade !== undefined ? cert.grade : (cert[5] !== undefined ? cert[5] : 'N/A'),
      description: `${cert.degreeTitle || cert[3] || 'Certificate'} - ${cert.studentName || cert[0] || 'Student'}`,
      studentWallet: cert.studentWallet || cert[2] || 'N/A',
      duration: cert.duration || cert[6] || 'N/A',
      cgpa: cert.cgpa || cert[7] || 'N/A',
      faculty: cert.faculty !== undefined ? cert.faculty : (cert[8] !== undefined ? cert[8] : 'N/A'),
      // Additional blockchain data
      issuer: cert.issuingInstitution || cert[9],
      tokenURI: cert.tokenURI,
      createdAt: cert.createdAt
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Revoked':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="w-4 h-4" />;
      case 'Revoked':
        return <XCircle className="w-4 h-4" />;
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredCertificates = processedCertificates.filter(cert => {
    const matchesSearch = cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || cert.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleRevoke = (certificateId: string) => {
    console.log('Revoking certificate:', certificateId);
  };

  const handleView = (certificate: any) => {
    setSelectedCertificate(certificate);
  };

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
                Certificate Management
                </span>
              </h1>
            </div>
            <div className="lg:hidden w-10"></div>
          </div>
        </header>

 
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {/* Statistics Cards */}
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Certificates</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {isLoadingTotal ? (
                          <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                        ) : totalError ? (
                          <span className="text-red-500">Error</span>
                        ) : (
                          totalCertificates ? totalCertificates.toString() : '0'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Certificates</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {processedCertificates.filter(cert => cert.status === 'Active').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Revoked Certificates</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {processedCertificates.filter(cert => cert.status === 'Revoked').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-sm border-b border-gray-200 p-4 sm:p-6 py-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search certificates by name, email, or course..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="lg:w-48">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="revoked">Revoked</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="w-full max-w-[1600px] mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Certificates ({filteredCertificates.length})</h2>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider">Student</th>
                      <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider">Course</th>
                      <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider">Type</th>
                      <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider">Issue Date</th>
                      <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                            <span>Loading certificates from blockchain...</span>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-red-500">
                          <div className="flex flex-col items-center space-y-2">
                            <span>Error loading certificates</span>
                            <span className="text-sm text-gray-500">Please check your wallet connection</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredCertificates.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center space-y-2">
                            <FileText className="w-12 h-12 text-gray-300" />
                            <span>No certificates found</span>
                            <span className="text-sm text-gray-400">Issue your first certificate to get started</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredCertificates.map((certificate) => (
                      <tr key={certificate.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4">
                          <div>
                            <div className="text-sm sm:text-base font-medium text-gray-900 truncate">{certificate.studentName}</div>
                            <div className="text-xs sm:text-sm text-gray-500 truncate">{certificate.studentEmail}</div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          <div>
                            <div className="text-sm sm:text-base font-medium text-gray-900 truncate max-w-[150px] sm:max-w-none">{certificate.courseName}</div>
                            <div className="text-xs sm:text-sm text-gray-500">Grade: {certificate.grade}</div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          <span className="text-sm sm:text-base text-gray-900">{certificate.certificateType}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(certificate.status)}`}>
                            {getStatusIcon(certificate.status)}
                            <span className="ml-1">{certificate.status}</span>
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-sm sm:text-base text-gray-900">
                          {new Date(certificate.issueDate).toLocaleDateString()}
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <button
                              onClick={() => handleView(certificate)}
                              className="text-green-600 hover:text-green-900 p-1 sm:p-2 rounded-lg hover:bg-green-50 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {certificate.status === 'Active' && (
                              <button
                                onClick={() => handleRevoke(certificate.id)}
                                className="text-red-600 hover:text-red-900 p-1 sm:p-2 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button className="text-gray-600 hover:text-gray-900 p-1 sm:p-2 rounded-lg hover:bg-gray-50 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {selectedCertificate && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-900">Certificate Details</h3>
                      <button
                        onClick={() => setSelectedCertificate(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
                          <p className="text-base text-gray-900">{selectedCertificate.studentName}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <p className="text-base text-gray-900">{selectedCertificate.studentEmail}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                          <p className="text-base text-gray-900">{selectedCertificate.courseName}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                          <p className="text-base text-gray-900">{selectedCertificate.certificateType}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                          <p className="text-base text-gray-900">{selectedCertificate.grade}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
                          <p className="text-base text-gray-900">{new Date(selectedCertificate.issueDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                          <p className="text-base text-gray-900">{selectedCertificate.duration || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">CGPA</label>
                          <p className="text-base text-gray-900">{selectedCertificate.cgpa || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Faculty</label>
                          <p className="text-base text-gray-900">{selectedCertificate.faculty || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Student Wallet</label>
                          <p className="text-base text-gray-900 font-mono text-sm">{selectedCertificate.studentWallet || 'N/A'}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <p className="text-base text-gray-900">{selectedCertificate.description}</p>
                      </div>

                      {selectedCertificate.tokenURI && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Token URI</label>
                          <p className="text-base text-gray-900 font-mono text-sm break-all">{selectedCertificate.tokenURI}</p>
                        </div>
                      )}

                      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedCertificate(null)}
                        >
                          Close
                        </Button>
                        <Button>
                          <Download className="w-4 h-4 mr-2" />
                          Download Certificate
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ViewCertificates;

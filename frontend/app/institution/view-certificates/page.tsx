'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

const ViewCertificates = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);

  const certificates = [
    {
      id: 'CERT-001',
      studentName: 'John Doe',
      studentEmail: 'john@example.com',
      courseName: 'Computer Science',
      certificateType: 'Degree',
      issueDate: '2024-01-15',
      status: 'Active',
      grade: 'A+',
      description: 'Bachelor of Computer Science'
    },
    {
      id: 'CERT-002',
      studentName: 'Jane Smith',
      studentEmail: 'jane@example.com',
      courseName: 'Data Science',
      certificateType: 'Certificate',
      issueDate: '2024-01-14',
      status: 'Active',
      grade: 'A',
      description: 'Data Science Professional Certificate'
    },
    {
      id: 'CERT-003',
      studentName: 'Bob Johnson',
      studentEmail: 'bob@example.com',
      courseName: 'Web Development',
      certificateType: 'Diploma',
      issueDate: '2024-01-13',
      status: 'Revoked',
      grade: 'B+',
      description: 'Web Development Diploma'
    },
    {
      id: 'CERT-004',
      studentName: 'Alice Brown',
      studentEmail: 'alice@example.com',
      courseName: 'Machine Learning',
      certificateType: 'Certificate',
      issueDate: '2024-01-12',
      status: 'Pending',
      grade: 'A-',
      description: 'Machine Learning Certificate'
    }
  ];

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

  const filteredCertificates = certificates.filter(cert => {
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
              Certificate Management
              </span>
            </h1>
                
              </div>
            </div>
          </div>
        </header>

 
        <main className="flex-1 overflow-y-auto bg-gray-50 ">
          
          <div className="bg-white shadow-sm border-b border-gray-200 p-6 py-8">
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

          <div className="px-8 py-8 flex items-center justify-center ">
            <div className="w-full max-w-[1600px] ">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
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
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Issue Date</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCertificates.map((certificate) => (
                      <tr key={certificate.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-base font-medium text-gray-900">{certificate.studentName}</div>
                            <div className="text-sm text-gray-500">{certificate.studentEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-base font-medium text-gray-900">{certificate.courseName}</div>
                            <div className="text-sm text-gray-500">Grade: {certificate.grade}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-base text-gray-900">{certificate.certificateType}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(certificate.status)}`}>
                            {getStatusIcon(certificate.status)}
                            <span className="ml-1">{certificate.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">
                          {new Date(certificate.issueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleView(certificate)}
                              className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {certificate.status === 'Active' && (
                              <button
                                onClick={() => handleRevoke(certificate.id)}
                                className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <p className="text-base text-gray-900">{selectedCertificate.description}</p>
                      </div>

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

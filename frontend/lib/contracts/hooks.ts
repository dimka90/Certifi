/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useContractWrite } from 'wagmi';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import { CERTIFICATE_MANAGER_ABI } from './abi';
import { getContractAddress, getFormattedContractAddress } from './address';
import type { 
  Certificate, 
  Institution, 
  CertificateVerification,
  InstitutionRegistrationData,
  CertificateIssueData,
  CertificateRevokeData
} from './types';

// Custom hook for certificate contract interactions
export function useCertificateContract() {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const { data: hash, isPending, error } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Read Functions
  const useGetCertificate = (certificateId: bigint) => {
    return useReadContract({
      address: getContractAddress() as `0x${string}`,
      abi: CERTIFICATE_MANAGER_ABI,
      functionName: 'getCertificate',
      args: [certificateId],
    });
  };

  const useGetInstitution = (institutionAddress: string) => {
    return useReadContract({
      address: getContractAddress() as `0x${string}`,
      abi: CERTIFICATE_MANAGER_ABI,
      functionName: 'getInstitution',
      args: [institutionAddress as `0x${string}`],
    });
  };

  const useVerifyCertificate = (certificateId: bigint) => {
    return useReadContract({
      address: getContractAddress() as `0x${string}`,
      abi: CERTIFICATE_MANAGER_ABI,
      functionName: 'verifyCertificate',
      args: [certificateId],
    });
  };

  const useGetCertificatesByInstitution = (institutionAddress: string) => {
    return useReadContract({
      address: getContractAddress() as `0x${string}`,
      abi: CERTIFICATE_MANAGER_ABI,
      functionName: 'getCertificatesByInstitution',
      args: [institutionAddress as `0x${string}`],
    });
  };

  const useGetCertificatesByStudent = (studentAddress: string) => {
    return useReadContract({
      address: getContractAddress() as `0x${string}`,
      abi: CERTIFICATE_MANAGER_ABI,
      functionName: 'getCertificatesByStudent',
      args: [studentAddress as `0x${string}`],
    });
  };

  const useGetTotalCertificatesIssued = () => {
    return useReadContract({
      address: getContractAddress() as `0x${string}`,
      abi: CERTIFICATE_MANAGER_ABI,
      functionName: 'getTotalCertificatesIssued',
    });
  };

  // Check if an institution is already registered
  const useCheckInstitutionRegistration = (institutionAddress: string) => {
    return useReadContract({
      address: getContractAddress() as `0x${string}`,
      abi: CERTIFICATE_MANAGER_ABI,
      functionName: 'registeredInstitutions',
      args: [institutionAddress as `0x${string}`],
    });
  };

  // Check if an institution is authorized to issue certificates
  const useCheckInstitutionAuthorization = (institutionAddress: string) => {
    return useReadContract({
      address: getContractAddress() as `0x${string}`,
      abi: CERTIFICATE_MANAGER_ABI,
      functionName: 'getInstitution',
      args: [institutionAddress as `0x${string}`],
    });
  };

  // Write Functions
  const registerInstitution = async (institutionData: InstitutionRegistrationData) => {
    try {
      console.log('Calling registerInstitution with:', {
        address: getFormattedContractAddress(),
        args: [
          institutionData.name,
          institutionData.institutionID,
          institutionData.email,
          institutionData.country,
          institutionData.institutionType,
        ]
      });

      const result = await writeContract({
        address: getFormattedContractAddress(),
        abi: CERTIFICATE_MANAGER_ABI,
        functionName: 'registerInstitution',
        args: [
          institutionData.name,
          institutionData.institutionID,
          institutionData.email,
          institutionData.country,
          institutionData.institutionType as number,
        ],
      });
      
      console.log('Transaction hash:', result);
      toast.success('Institution registration submitted!');
    } catch (err) {
      console.error('Registration error:', err);
      toast.error('Failed to register institution');
      throw err;
    }
  };



  const issueCertificate = async (certificateData: CertificateIssueData) => {
    try {
      console.log('Calling issueCertificate with:', certificateData);
      
      await writeContract({
        address: getFormattedContractAddress(),
        abi: CERTIFICATE_MANAGER_ABI,
        functionName: 'issueCertificate',
        args: [
          {
            studentWallet: certificateData.studentWallet as `0x${string}`,
            studentName: certificateData.studentName,
            studentID: certificateData.studentID,
            degreeTitle: certificateData.degreeTitle,
            grade: certificateData.grade,
            duration: certificateData.duration,
            cgpa: certificateData.cgpa,
            faculty: certificateData.faculty,
            tokenURI: certificateData.tokenURI,
          }
        ],
      });
      toast.success('Certificate issuance submitted!');
    } catch (err) {
      console.error('Certificate issuance error:', err);
      toast.error('Failed to issue certificate');
      throw err;
    }
  };

  const revokeCertificate = async (revokeData: CertificateRevokeData) => {
    try {
      await writeContract({
        address: getContractAddress() as `0x${string}`,
        abi: CERTIFICATE_MANAGER_ABI,
        functionName: 'revokeCertificate',
        args: [revokeData.tokenId, revokeData.reason],
      });
      toast.success('Certificate revocation submitted!');
    } catch (err) {
      console.error('Revocation error:', err);
      toast.error('Failed to revoke certificate');
      throw err;
    }
  };


  return {
    // Read hooks
    useGetCertificate,
    useGetInstitution,
    useVerifyCertificate,
    useGetCertificatesByInstitution,
    useGetCertificatesByStudent,
    useGetTotalCertificatesIssued,
    useCheckInstitutionRegistration,
    useCheckInstitutionAuthorization,
    
    // Write functions
    registerInstitution,
    issueCertificate,
    revokeCertificate,
    
    
    // Transaction state
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
}

// Specialized hooks for common use cases
export function useCertificateVerification(certificateId: bigint | null) {
  const { useVerifyCertificate } = useCertificateContract();
  
  return useVerifyCertificate(certificateId || BigInt(0));
}

export function useInstitutionData(institutionAddress: string | null) {
  const { useGetInstitution } = useCertificateContract();
  
  return useGetInstitution(institutionAddress || '0x0000000000000000000000000000000000000000');
}

export function useCertificateDetails(certificateId: bigint | null) {
  const { useGetCertificate } = useCertificateContract();
  
  return useGetCertificate(certificateId || BigInt(0));
}

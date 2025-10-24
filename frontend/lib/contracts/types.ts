// TypeScript types for contract interactions

// Enums from contract
export enum InstitutionType {
  UNIVERSITY = 0,
  COLLEGE = 1,
  SCHOOL = 2,
  TRAINING_CENTER = 3,
  OTHER = 4
}

export enum Classification {
  FIRST_CLASS = 0,
  SECOND_CLASS_UPPER = 1,
  SECOND_CLASS_LOWER = 2,
  THIRD_CLASS = 3,
  PASS = 4
}

export enum Faculty {
  ENGINEERING = 0,
  MEDICINE = 1,
  LAW = 2,
  BUSINESS = 3,
  ARTS = 4,
  SCIENCE = 5,
  OTHER = 6
}

export interface Certificate {
  studentName: string;
  studentID: string;
  studentWallet: string;
  degreeTitle: string;
  issueDate: bigint;
  grade: Classification;
  duration: string;
  cgpa: string;
  faculty: Faculty;
  issuingInstitution: string;
  isRevoked: boolean;
  revocationDate: bigint;
  revocationReason: string;
}

export interface Institution {
  name: string;
  institutionID: string;
  walletAddress: string;
  email: string;
  country: string;
  institutionType: InstitutionType;
  registrationDate: bigint;
  isAuthorized: boolean;
  totalCertificatesIssued: bigint;
}

export interface CertificateVerification {
  certificate: Certificate;
  isValid: boolean;
}

// Form data types for easier integration
export interface InstitutionRegistrationData {
  name: string;
  institutionID: string;
  email: string;
  country: string;
  institutionType: InstitutionType;
}

export interface CertificateIssueData {
  studentWallet: string;
  studentName: string;
  studentID: string;
  degreeTitle: string;
  grade: Classification;
  duration: string;
  cgpa: string;
  faculty: Faculty;
  tokenURI: string;
}

export interface CertificateRevokeData {
  tokenId: bigint;
  reason: string;
}

// Status types
export type CertificateStatus = 'active' | 'revoked' | 'inactive';
export type InstitutionStatus = 'active' | 'inactive';
export type TransactionStatus = 'idle' | 'pending' | 'confirming' | 'confirmed' | 'failed';

// Institution type labels
export const INSTITUTION_TYPES = {
  [InstitutionType.UNIVERSITY]: 'University',
  [InstitutionType.COLLEGE]: 'College',
  [InstitutionType.SCHOOL]: 'School',
  [InstitutionType.TRAINING_CENTER]: 'Training Center',
  [InstitutionType.OTHER]: 'Other',
} as const;

export type InstitutionTypeKey = keyof typeof INSTITUTION_TYPES;

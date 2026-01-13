// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

enum Faculty { Science, Engineering, Arts, Medicine, Law, SocialSciences, Education, Agriculture, Management, Technology }
enum InstitutionType { University, Polytechnic, CollegeOfEducation, TechnicalCollege, SecondarySchool, PrimarySchool, TrainingInstitute, VocationalCenter }
enum Classification { FirstClass, SecondClassUpper, SecondClassLower, ThirdClass, Pass, Distinction, Credit, Merit }
enum RoleType { SUPER_ADMIN, INSTITUTION_ADMIN, CERTIFICATE_ISSUER, CERTIFICATE_VERIFIER, AUDITOR, VIEWER }
enum OperationType { AUTHORIZE_INSTITUTION, DEAUTHORIZE_INSTITUTION, UPDATE_TEMPLATE, REVOKE_CERTIFICATE, TRANSFER_OWNERSHIP, UPDATE_MULTI_SIG_THRESHOLD }
enum VerificationStatus { Unverified, Pending, Verified, Rejected }
enum RequestStatus { Pending, Approved, Rejected, Cancelled }
enum VerificationMethod { QR_CODE, TOKEN_ID, VERIFICATION_CODE, MOBILE_APP, WEB_INTERFACE }

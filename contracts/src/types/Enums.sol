// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Enums
 * @dev Core enumeration types for the Certificate NFT system
 */

/**
 * @dev Academic faculties supported by the system
 */
enum Faculty { 
    Science, 
    Engineering, 
    Arts, 
    Medicine, 
    Law, 
    SocialSciences, 
    Education, 
    Agriculture,
    Management,
    Technology
}

/**
 * @dev Types of educational institutions
 */
enum InstitutionType {
    University,
    Polytechnic,
    CollegeOfEducation,
    TechnicalCollege,
    SecondarySchool,
    PrimarySchool,
    TrainingInstitute,
    VocationalCenter
}

/**
 * @dev Academic classification grades
 */
enum Classification {
    FirstClass,
    SecondClassUpper,
    SecondClassLower,
    ThirdClass,
    Pass,
    Distinction,
    Credit,
    Merit
}

/**
 * @dev Role types for access control
 */
enum RoleType {
    SUPER_ADMIN,
    INSTITUTION_ADMIN,
    CERTIFICATE_ISSUER,
    CERTIFICATE_VERIFIER,
    AUDITOR,
    VIEWER
}

/**
 * @dev Multi-signature operation types
 */
enum OperationType {
    AUTHORIZE_INSTITUTION,
    DEAUTHORIZE_INSTITUTION,
    UPDATE_TEMPLATE,
    REVOKE_CERTIFICATE,
    TRANSFER_OWNERSHIP,
    UPDATE_MULTI_SIG_THRESHOLD
}

/**
 * @dev Certificate verification methods
 */
enum VerificationMethod {
    QR_CODE,
    TOKEN_ID,
    VERIFICATION_CODE,
    MOBILE_APP,
    WEB_INTERFACE
}

/**
 * @dev Verification status for official verifications
 */
enum VerificationStatus {
    Pending,
    Verified,
    Rejected
}

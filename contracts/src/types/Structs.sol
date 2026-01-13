// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Enums.sol";

/**
 * @title Structs
 * @dev Core data structures for the Certificate NFT system
 */

/**
 * @dev Institution information structure
 */
struct Institution {
    string name;
    string institutionID;  
    address walletAddress;
    string email;
    string country;
    InstitutionType institutionType;
    uint256 registrationDate;
    bool isAuthorized;
    uint256 totalCertificatesIssued;
}

/**
 * @dev Certificate template structure for standardized issuance
 */
struct CertificateTemplate {
    uint256 id;
    string name;
    address creator;
    uint256 createdAt;
    uint256 version;
    TemplateField[] requiredFields;
    TemplateField[] optionalFields;
    ValidationRule[] validationRules;
    bool isActive;
}

/**
 * @dev Template field definition
 */
struct TemplateField {
    string fieldName;
    string fieldType;
    bool required;
    string defaultValue;
}

/**
 * @dev Validation rule for template fields
 */
struct ValidationRule {
    string fieldName;
    string ruleType;
    string ruleValue;
    string errorMessage;
}

/**
 * @dev Complete certificate information structure
 */
struct Certificate {
    string studentName;
    string studentID;
    address studentWallet;
    string degreeTitle;
    uint256 issueDate;
    Classification grade;
    string duration; 
    string cgpa;      
    Faculty faculty;
    address issuingInstitution;
    bool isRevoked;
    uint256 revocationDate;
    string revocationReason;
    uint256 expirationDate;
    uint256 templateId;
    uint256 version;
    bool isClaimable;
    bool isClaimed;
    bytes32 claimHash;
    uint256 renewalOf;
}

/**
 * @dev Input data structure for certificate issuance
 */
struct CertificateData {
    address studentWallet;
    string studentName;
    string studentID;
    string degreeTitle;
    Classification grade;
    string duration;
    string cgpa;
    Faculty faculty;
    string tokenURI;
    uint256 expirationDate;
    uint256 templateId;
    bool isClaimable;
    bytes32 claimHash;
}

/**
 * @dev Multi-signature operation structure
 */
struct MultiSigOperation {
    uint256 id;
    bytes operationData;
    address proposer;
    uint256 proposedAt;
    uint256 requiredSignatures;
    address[] signers;
    bool executed;
    uint256 executedAt;
}

/**
 * @dev Issuance statistics structure
 */
struct IssuanceStats {
    uint256 totalIssued;
    uint256 totalRevoked;
    uint256 activeCount;
    uint256 periodStart;
    uint256 periodEnd;
}

/**
 * @dev Verification statistics structure
 */
struct VerificationStats {
    uint256 totalVerifications;
    uint256 uniqueVerifications;
    uint256 averageVerificationsPerCertificate;
    uint256 periodStart;
    uint256 periodEnd;
}

/**
 * @dev Verification result structure
 */
struct VerificationResult {
    bool isValid;
    bool exists;
    bool isRevoked;
    bool isExpired;
    uint256 tokenId;
    string verificationCode;
    uint256 verificationTime;
}

/**
 * @dev Verification attempt tracking structure
 */
struct VerificationAttempt {
    uint256 timestamp;
    address verifier;
    bool successful;
    string method;
}

/**
 * @dev Error response structure for detailed error reporting
 */
struct ErrorResponse {
    uint256 errorCode;
    string errorMessage;
    string[] violatedRules;
    bytes additionalData;
    uint256 timestamp;
}

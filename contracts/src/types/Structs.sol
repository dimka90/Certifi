// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./Enums.sol";

struct Institution { string name; string institutionID; address walletAddress; string email; string country; InstitutionType institutionType; uint256 registrationDate; bool isAuthorized; uint256 totalCertificatesIssued; }
struct TemplateField { string fieldName; string fieldType; bool required; string defaultValue; }
struct ValidationRule { string fieldName; string ruleType; string ruleValue; string errorMessage; }
struct CertificateTemplate { uint256 templateId; string name; string degreeTitle; Faculty faculty; string baseURI; address creator; uint256 createdAt; uint256 version; TemplateField[] requiredFields; TemplateField[] optionalFields; ValidationRule[] validationRules; bool isActive; }
struct Certificate { string studentName; string studentID; address studentWallet; string degreeTitle; uint256 issueDate; Classification grade; string duration; string cgpa; Faculty faculty; address issuingInstitution; bool isRevoked; uint256 revocationDate; string revocationReason; uint256 expirationDate; uint256 templateId; uint256 version; bool isClaimable; bool isClaimed; bytes32 claimHash; uint256 renewalOf; }
struct CertificateData { address studentWallet; string studentName; string studentID; string degreeTitle; Classification grade; string duration; string cgpa; Faculty faculty; string tokenURI; uint256 expirationDate; uint256 templateId; bool isClaimable; bytes32 claimHash; }
struct MultiSigOperation { uint256 id; bytes operationData; address proposer; uint256 proposedAt; uint256 requiredSignatures; address[] signers; bool executed; uint256 executedAt; }
struct IssuanceStats { uint256 totalIssued; uint256 totalRevoked; uint256 activeCount; uint256 periodStart; uint256 periodEnd; }
struct VerificationStats { uint256 totalVerifications; uint256 uniqueVerifications; uint256 averageVerificationsPerCertificate; uint256 periodStart; uint256 periodEnd; }
struct VerificationResult { bool isValid; bool exists; bool isRevoked; bool isExpired; uint256 tokenId; string verificationCode; uint256 verificationTime; }
struct VerificationAttempt { uint256 timestamp; address verifier; bool successful; string method; }
struct VerificationRequest { uint256 id; uint256 tokenId; address requester; address institution; uint256 requestedAt; RequestStatus status; string comments; address reviewer; uint256 reviewedAt; }
struct ErrorResponse { uint256 errorCode; string errorMessage; string[] violatedRules; bytes additionalData; uint256 timestamp; }

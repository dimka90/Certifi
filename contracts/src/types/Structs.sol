// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./Enums.sol";

struct Institution { string name; string institutionID; address walletAddress; string email; string country; InstitutionType institutionType; uint256 registrationDate; bool isAuthorized; uint256 totalCertificatesIssued; }
struct TemplateField { string fieldName; string fieldType; bool required; string defaultValue; }
struct ValidationRule { string fieldName; string ruleType; string ruleValue; string errorMessage; }
struct CertificateTemplate { uint256 templateId; string name; string degreeTitle; Faculty faculty; string baseURI; address creator; uint256 createdAt; uint256 version; TemplateField[] requiredFields; TemplateField[] optionalFields; ValidationRule[] validationRules; bool isActive; }
struct Certificate { string studentName; string studentID; address studentWallet; string degreeTitle; uint256 issueDate; Classification grade; string duration; string cgpa; Faculty faculty; address issuingInstitution; bool isRevoked; uint256 revocationDate; string revocationReason; uint256 expirationDate; uint256 templateId; uint256 version; bool isClaimable; bool isClaimed; bytes32 claimHash; uint256 renewalOf; }

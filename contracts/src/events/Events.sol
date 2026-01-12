// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

event InstitutionRegistered(address indexed institution, string name, string institutionID, uint256 timestamp);
event InstitutionAuthorized(address indexed institution, uint256 timestamp);
event InstitutionDeauthorized(address indexed institution, uint256 timestamp);
event CertificateIssued(uint256 indexed tokenId, address indexed student, address indexed institution, string degreeTitle, uint256 timestamp);
event CertificateRevoked(uint256 indexed tokenId, address indexed institution, string reason, uint256 timestamp);
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
event BatchCertificateIssued(address indexed institution, uint256 count, uint256 timestamp);

// New Events
event MetadataUpdated(uint256 indexed tokenId, string newTokenURI, uint256 timestamp);
event InstitutionDetailsUpdated(address indexed institution, string name, string email, uint256 timestamp);

// Template Events
event TemplateCreated(uint256 indexed templateId, address indexed creator, string name, uint256 timestamp);
event TemplateUpdated(uint256 indexed templateId, uint256 newVersion, uint256 timestamp);
event TemplateActivated(uint256 indexed templateId, uint256 timestamp);
event TemplateDeactivated(uint256 indexed templateId, uint256 timestamp);

// Multi-Signature Events
event OperationProposed(uint256 indexed operationId, address indexed proposer, bytes operationData, uint256 timestamp);
event OperationSigned(uint256 indexed operationId, address indexed signer, uint256 signatureCount, uint256 timestamp);
event OperationExecuted(uint256 indexed operationId, address indexed executor, uint256 timestamp);
event SignatureThresholdUpdated(uint256 oldThreshold, uint256 newThreshold, uint256 timestamp);

// Analytics Events
event AnalyticsUpdated(string metricType, uint256 value, uint256 timestamp);
event ReportGenerated(string reportType, uint256 periodStart, uint256 periodEnd, uint256 timestamp);

// Verification Events
event CertificateVerified(uint256 indexed tokenId, address indexed verifier, string method, bool successful, uint256 timestamp);
event VerificationCodeGenerated(uint256 indexed tokenId, string verificationCode, uint256 timestamp);

// Role and Access Control Events
event RoleCreated(bytes32 indexed roleId, string roleName, uint256 timestamp);
event RoleAssigned(address indexed user, bytes32 indexed roleId, uint256 timestamp);
event RoleRevoked(address indexed user, bytes32 indexed roleId, uint256 timestamp);
event PermissionUpdated(bytes32 indexed roleId, uint256 permission, bool granted, uint256 timestamp);

// Lifecycle Events
event CertificateRenewed(uint256 indexed oldTokenId, uint256 indexed newTokenId, uint256 timestamp);
event CertificateAmended(uint256 indexed tokenId, string amendmentType, uint256 timestamp);
event CertificateExpired(uint256 indexed tokenId, uint256 timestamp);

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 
 * @dev Custom error definitions for the Certificate NFT system
 */

// Access Control Errors
error NotOwner();
error NotAuthorizedInstitution();
error NotIssuingInstitution();
error AccessDenied(bytes32 role);
error InsufficientPermissions();

// Institution Errors
error InstitutionAlreadyRegistered();
error InstitutionNotRegistered();
error InstitutionNotAuthorized();
error InstitutionAlreadyAuthorized();
error InvalidInstitutionAddress();
error InvalidInstitutionID();

// Certificate Errors
error CertificateDoesNotExist();
error CertificateAlreadyRevoked();
error CertificateNotRevoked();
error InvalidStudentAddress();
error InvalidTokenURI();
error InvalidCGPA();
error CertificateHasExpired();
error SoulboundTokenNoTransfer();
error BatchSizeCheckFailed();
error InvalidRevocationReason();
error CertificateAlreadyClaimed();
error NotClaimable();
error InvalidClaimCode();

// General Errors
error InvalidAddress();
error EmptyString();
error ContractPaused();
error InvalidIndex();
error InvalidTimeRange();

// Template Errors
error TemplateNotFound();
error TemplateAlreadyExists();
error TemplateValidationFailed();
error InvalidTemplateData();
error TemplateNotActive();

// Multi-Signature Errors
error OperationNotFound();
error OperationAlreadyExecuted();
error InsufficientSignatures();
error AlreadySigned();
error NotAuthorizedSigner();
error InvalidThreshold();

// Analytics Errors
error AnalyticsNotAvailable();
error InsufficientData();

// Verification Errors
error InvalidVerificationCode();
error VerificationExpired();
error VerificationMethodNotSupported();

// Role and Access Control Errors
error RoleNotFound();
error RoleAlreadyAssigned();
error InvalidRoleData();

// Lifecycle Errors
error CertificateNotRenewable();
error AmendmentNotAllowed();
error InvalidAmendmentData();

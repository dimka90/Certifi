// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

error NotOwner();
error NotAuthorizedInstitution();
error NotIssuingInstitution();

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
error CertificateExpired();
error SoulboundTokenNoTransfer();
error BatchSizeCheckFailed();
error InvalidRevocationReason(); // Added

// General Errors
error InvalidAddress();
error EmptyString();
error ContractPaused(); // Added
error InvalidIndex(); // Added

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
error InvalidTimeRange();
error AnalyticsNotAvailable();
error InsufficientData();

// Verification Errors
error InvalidVerificationCode();
error VerificationExpired();
error VerificationMethodNotSupported();

// Role and Access Control Errors
error RoleNotFound();
error InsufficientPermissions();
error RoleAlreadyAssigned();
error InvalidRoleData();

// Lifecycle Errors
error CertificateNotRenewable();
error AmendmentNotAllowed();
error InvalidAmendmentData();

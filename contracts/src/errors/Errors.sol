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

// Role Errors
error AccessDenied(bytes32 role);
error UnauthorizedVerifier();

// Template Errors
error TemplateDoesNotExist();
error TemplateNotActive();
error InvalidTemplateData();

// Verificaton Errors
error VerificationExpired();
error AlreadyVerified();

// Claim Errors
error CertificateAlreadyClaimed();
error InvalidClaimCode();
error NotClaimable();

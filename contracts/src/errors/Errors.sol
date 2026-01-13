// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
error NotOwner(); error NotAuthorizedInstitution(); error NotIssuingInstitution();
error InstitutionAlreadyRegistered(); error InstitutionNotRegistered(); error InstitutionNotAuthorized(); error InstitutionAlreadyAuthorized();
error InvalidInstitutionAddress(); error InvalidInstitutionID();
error CertificateDoesNotExist(); error CertificateAlreadyRevoked(); error CertificateNotRevoked();
error InvalidStudentAddress(); error InvalidTokenURI(); error InvalidCGPA();
error CertificateHasExpired(); error SoulboundTokenNoTransfer(); error BatchSizeCheckFailed();
error InvalidRevocationReason(); error InvalidAddress(); error EmptyString(); error ContractPaused(); error InvalidIndex();
error TemplateNotFound(); error TemplateAlreadyExists(); error TemplateValidationFailed(); error InvalidTemplateData(); error TemplateNotActive();
error OperationNotFound(); error OperationAlreadyExecuted(); error InsufficientSignatures(); error AlreadySigned(); error NotAuthorizedSigner(); error InvalidThreshold();
error InvalidTimeRange(); error AnalyticsNotAvailable(); error InsufficientData();
error InvalidVerificationCode(); error VerificationExpired(); error VerificationMethodNotSupported();
error RoleNotFound(); error InsufficientPermissions(); error RoleAlreadyAssigned(); error InvalidRoleData(); error AccessDenied(bytes32 role);
error CertificateNotRenewable(); error AmendmentNotAllowed(); error InvalidAmendmentData();
error NotClaimable(); error CertificateAlreadyClaimed(); error InvalidClaimCode();

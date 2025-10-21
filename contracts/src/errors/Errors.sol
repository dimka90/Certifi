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

// General Errors
error InvalidAddress();
error EmptyString();
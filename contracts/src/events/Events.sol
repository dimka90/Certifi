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

// Advanced Features Events
event TemplateCreated(uint256 indexed templateId, address indexed institution, string name);
event TemplateUpdated(uint256 indexed templateId, bool isActive);
event OfficialVerification(uint256 indexed tokenId, address indexed verifier, bool status, uint256 timestamp);
event CertificateClaimed(uint256 indexed tokenId, address indexed student, uint256 timestamp);
event MetadataVersioned(uint256 indexed tokenId, uint256 version, string tokenURI);

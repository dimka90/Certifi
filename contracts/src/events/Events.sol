// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

event InstitutionRegistered(address indexed institution, string name, string institutionID, uint256 timestamp);
event InstitutionAuthorized(address indexed institution, uint256 timestamp);
event InstitutionDeauthorized(address indexed institution, uint256 timestamp);
event CertificateIssued(uint256 indexed tokenId, address indexed student, address indexed institution, string degreeTitle, uint256 timestamp);
event CertificateRevoked(uint256 indexed tokenId, address indexed institution, string reason, uint256 timestamp);
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

// New Event
event BatchCertificateIssued(address indexed institution, uint256 count, uint256 timestamp);

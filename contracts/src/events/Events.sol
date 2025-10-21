// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

event InstitutionRegistered(address indexed institution, string name, string institutionID);
event InstitutionAuthorized(address indexed institution);
event CertificateIssued(uint256 indexed tokenId, address indexed student, address indexed institution);
event CertificateRevoked(uint256 indexed tokenId, address indexed institution, string reason);


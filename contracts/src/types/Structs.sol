// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;
import "./Enums.sol";

struct Institution {
    string name;
    string institutionID;  
    address walletAddress;
    string email;
    string country;
    InstitutionType institutionType;
    uint256 registrationDate;
    bool isAuthorized;
    uint256 totalCertificatesIssued;
}

struct CertificateTemplate {
    uint256 templateId;
    string name;
    string degreeTitle;
    Faculty faculty;
    string baseURI;
    bool isActive;
    address creator;
}

struct Certificate {
    string studentName;
    string studentID;
    address studentWallet;
    string degreeTitle;
    uint256 issueDate;
    Classification grade;
    string duration; 
    string cgpa;      
    Faculty faculty;
    address issuingInstitution;
    bool isRevoked;
    uint256 revocationDate;
    string revocationReason;
    uint256 expirationDate;
    uint256 templateId;
    uint256 version;
    bool isClaimable;
    bool isClaimed;
    bytes32 claimHash;
}

struct CertificateData {
    address studentWallet;
    string studentName;
    string studentID;
    string degreeTitle;
    Classification grade;
    string duration;
    string cgpa;
    Faculty faculty;
    string tokenURI;
    uint256 expirationDate; // Added field
    uint256 templateId;
    bool isClaimable;
    bytes32 claimHash;
}

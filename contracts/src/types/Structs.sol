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
    uint256 expirationDate; // Added field
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
}

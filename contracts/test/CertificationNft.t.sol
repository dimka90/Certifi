// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {CertificateNFT} from "../src/core/CertificationNft.sol";
import {InstitutionType, Classification, Faculty} from "../src/types/Enums.sol";
import {Institution, Certificate, CertificateData} from "../src/types/Structs.sol";

contract CertificationNftTest is Test {
    CertificateNFT public certNFT;
    
    address public owner;
    address public institution1;
    address public institution2;
    address public student1;
    address public student2;
    
    string public constant INSTITUTION_NAME = "Test University";
    string public constant INSTITUTION_ID = "TU-001";
    string public constant INSTITUTION_EMAIL = "contact@testuniversity.edu";
    string public constant INSTITUTION_COUNTRY = "United States";
    
    event InstitutionRegistered(address indexed institution, string name, string institutionID, uint256 timestamp);
    event InstitutionAuthorized(address indexed institution, uint256 timestamp);
    event InstitutionDeauthorized(address indexed institution, uint256 timestamp);
    event CertificateIssued(uint256 indexed tokenId, address indexed student, address indexed institution, string degreeTitle, uint256 timestamp);
    event CertificateRevoked(uint256 indexed tokenId, address indexed institution, string reason, uint256 timestamp);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    function setUp() public {
        owner = address(this);
        institution1 = address(0x1);
        institution2 = address(0x2);
        student1 = address(0x3);
        student2 = address(0x4);
        
        certNFT = new CertificateNFT();
    }
    
    // Helper function to register an institution
    function _registerInstitution(
        address institution,
        string memory name,
        string memory institutionID,
        string memory email,
        string memory country,
        InstitutionType institutionType
    ) internal {
        vm.prank(institution);
        certNFT.registerInstitution(name, institutionID, email, country, institutionType);
    }
    
    // ============ registerInstitution Tests ============
    
    function test_RegisterInstitution_Success() public {
        vm.expectEmit(true, false, false, true);
        emit InstitutionRegistered(
            institution1,
            INSTITUTION_NAME,
            INSTITUTION_ID,
            block.timestamp
        );
        
        vm.prank(institution1);
        certNFT.registerInstitution(
            INSTITUTION_NAME,
            INSTITUTION_ID,
            INSTITUTION_EMAIL,
            INSTITUTION_COUNTRY,
            InstitutionType.University
        );
        
        // Verify institution is registered
        assertTrue(certNFT.registeredInstitutions(institution1));
        
        // Verify institution data
        Institution memory inst = _getInstitutionData(institution1);
        assertEq(inst.name, INSTITUTION_NAME);
        assertEq(inst.institutionID, INSTITUTION_ID);
        assertEq(inst.walletAddress, institution1);
        assertFalse(inst.isAuthorized); // Should not be authorized yet
    }
    
    function _getInstitutionData(address addr) internal view returns (Institution memory) {
        return certNFT.getInstitution(addr);
    }
    
    // Helper function to authorize an institution
    function _authorizeInstitution(address institution) internal {
        certNFT.authorizeInstitution(institution);
    }
    
    // Helper function to deauthorize an institution
    function _deauthorizeInstitution(address institution) internal {
        certNFT.deauthorizeInstitution(institution);
    }
    
    // Helper function to issue a certificate and return token ID
    function _issueCertificate(address institution, CertificateData memory certData) internal returns (uint256) {
        vm.prank(institution);
        return certNFT.issueCertificate(certData);
    }
    
    // Helper function to setup authorized institution
    function _setupAuthorizedInstitution(address institution) internal {
        _registerInstitution(
            institution,
            INSTITUTION_NAME,
            INSTITUTION_ID,
            INSTITUTION_EMAIL,
            INSTITUTION_COUNTRY,
            InstitutionType.University
        );
        _authorizeInstitution(institution);
    }
    
    // Helper function to create certificate data
    function _createCertificateData(
        address studentWallet,
        string memory studentName,
        string memory studentID,
        string memory degreeTitle
    ) internal pure returns (CertificateData memory) {
        return CertificateData({
            studentWallet: studentWallet,
            studentName: studentName,
            studentID: studentID,
            degreeTitle: degreeTitle,
            grade: Classification.FirstClass,
            duration: "4 years",
            cgpa: "3.8",
            faculty: Faculty.Engineering,
            tokenURI: "https://ipfs.io/ipfs/QmTest123"
        });
    }
    
    function test_RegisterInstitution_DifferentInstitutionTypes() public {
        // Test University
        vm.prank(institution1);
        certNFT.registerInstitution(
            "University A",
            "UNIV-001",
            "info@univa.edu",
            "USA",
            InstitutionType.University
        );
        assertTrue(certNFT.registeredInstitutions(institution1));
        
        // Test Polytechnic
        vm.prank(institution2);
        certNFT.registerInstitution(
            "Polytechnic B",
            "POLY-002",
            "info@polyb.edu",
            "Canada",
            InstitutionType.Polytechnic
        );
        assertTrue(certNFT.registeredInstitutions(institution2));
        
        // Verify different types
        Institution memory inst1 = _getInstitutionData(institution1);
        Institution memory inst2 = _getInstitutionData(institution2);
        assertTrue(uint8(inst1.institutionType) != uint8(inst2.institutionType));
    }
    
    function test_RegisterInstitution_AlreadyRegistered_Reverts() public {
        // First registration should succeed
        vm.prank(institution1);
        certNFT.registerInstitution(
            INSTITUTION_NAME,
            INSTITUTION_ID,
            INSTITUTION_EMAIL,
            INSTITUTION_COUNTRY,
            InstitutionType.University
        );
        
        // Second registration should revert
        vm.expectRevert();
        vm.prank(institution1);
        certNFT.registerInstitution(
            "Another Name",
            "ANOTHER-ID",
            "another@email.com",
            "Another Country",
            InstitutionType.CollegeOfEducation
        );
    }
    
    function test_RegisterInstitution_EmptyName_Reverts() public {
        vm.expectRevert();
        vm.prank(institution1);
        certNFT.registerInstitution(
            "", // Empty name
            INSTITUTION_ID,
            INSTITUTION_EMAIL,
            INSTITUTION_COUNTRY,
            InstitutionType.University
        );
    }
    
    function test_RegisterInstitution_EmptyInstitutionID_Reverts() public {
        vm.expectRevert();
        vm.prank(institution1);
        certNFT.registerInstitution(
            INSTITUTION_NAME,
            "", // Empty institution ID
            INSTITUTION_EMAIL,
            INSTITUTION_COUNTRY,
            InstitutionType.University
        );
    }
    
    function test_RegisterInstitution_RegistrationDateSet() public {
        uint256 beforeTime = block.timestamp;
        vm.warp(beforeTime);
        
        vm.prank(institution1);
        certNFT.registerInstitution(
            INSTITUTION_NAME,
            INSTITUTION_ID,
            INSTITUTION_EMAIL,
            INSTITUTION_COUNTRY,
            InstitutionType.University
        );
        
        Institution memory inst = _getInstitutionData(institution1);
        assertEq(inst.registrationDate, beforeTime);
    }
    
    // ============ authorizeInstitution Tests ============
    
    function test_AuthorizeInstitution_Success() public {
        // First register the institution
        _registerInstitution(
            institution1,
            INSTITUTION_NAME,
            INSTITUTION_ID,
            INSTITUTION_EMAIL,
            INSTITUTION_COUNTRY,
            InstitutionType.University
        );
        
        // Verify not authorized initially
        Institution memory instBefore = _getInstitutionData(institution1);
        assertFalse(instBefore.isAuthorized);
        
        // Authorize the institution
        vm.expectEmit(true, false, false, true);
        emit InstitutionAuthorized(institution1, block.timestamp);
        
        certNFT.authorizeInstitution(institution1);
        
        // Verify authorized
        Institution memory instAfter = _getInstitutionData(institution1);
        assertTrue(instAfter.isAuthorized);
    }
    
    function test_AuthorizeInstitution_OnlyOwnerCanAuthorize() public {
        _registerInstitution(
            institution1,
            INSTITUTION_NAME,
            INSTITUTION_ID,
            INSTITUTION_EMAIL,
            INSTITUTION_COUNTRY,
            InstitutionType.University
        );
        
        // Non-owner should not be able to authorize
        vm.expectRevert();
        vm.prank(institution1);
        certNFT.authorizeInstitution(institution1);
    }
    
    function test_AuthorizeInstitution_NotRegistered_Reverts() public {
        // Try to authorize an institution that hasn't been registered
        vm.expectRevert();
        certNFT.authorizeInstitution(institution1);
    }
    
    function test_AuthorizeInstitution_AlreadyAuthorized_Reverts() public {
        // Register and authorize
        _registerInstitution(
            institution1,
            INSTITUTION_NAME,
            INSTITUTION_ID,
            INSTITUTION_EMAIL,
            INSTITUTION_COUNTRY,
            InstitutionType.University
        );
        
        certNFT.authorizeInstitution(institution1);
        
        // Try to authorize again - should revert
        vm.expectRevert();
        certNFT.authorizeInstitution(institution1);
    }
    
    function test_AuthorizeInstitution_MultipleInstitutions() public {
        // Register two institutions
        _registerInstitution(
            institution1,
            "University A",
            "UNIV-001",
            "info@univa.edu",
            "USA",
            InstitutionType.University
        );
        
        _registerInstitution(
            institution2,
            "Polytechnic B",
            "POLY-002",
            "info@polyb.edu",
            "Canada",
            InstitutionType.Polytechnic
        );
        
        // Authorize both
        certNFT.authorizeInstitution(institution1);
        certNFT.authorizeInstitution(institution2);
        
        // Verify both are authorized
        Institution memory inst1 = _getInstitutionData(institution1);
        Institution memory inst2 = _getInstitutionData(institution2);
        assertTrue(inst1.isAuthorized);
        assertTrue(inst2.isAuthorized);
    }
    
    // ============ issueCertificate Tests ============
    
    function test_IssueCertificate_Success() public {
        // Setup authorized institution
        _setupAuthorizedInstitution(institution1);
        
        // Create certificate data
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        // Issue certificate
        vm.expectEmit(true, true, false, true);
        emit CertificateIssued(1, student1, institution1, certData.degreeTitle, block.timestamp);
        
        vm.prank(institution1);
        uint256 tokenId = certNFT.issueCertificate(certData);
        
        // Verify token ID
        assertEq(tokenId, 1);
        
        // Verify NFT ownership
        assertEq(certNFT.ownerOf(tokenId), student1);
        
        // Verify certificate data
        Certificate memory cert = certNFT.getCertificate(tokenId);
        assertEq(cert.studentName, "John Doe");
        assertEq(cert.studentID, "STU-001");
        assertEq(cert.studentWallet, student1);
        assertEq(cert.degreeTitle, "Bachelor of Science");
        assertEq(cert.issuingInstitution, institution1);
        assertFalse(cert.isRevoked);
    }
    
    function test_IssueCertificate_MultipleCertificates() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData1 = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        CertificateData memory certData2 = _createCertificateData(
            student2,
            "Jane Smith",
            "STU-002",
            "Master of Arts"
        );
        
        vm.prank(institution1);
        uint256 tokenId1 = certNFT.issueCertificate(certData1);
        
        vm.prank(institution1);
        uint256 tokenId2 = certNFT.issueCertificate(certData2);
        
        // Verify sequential token IDs
        assertEq(tokenId1, 1);
        assertEq(tokenId2, 2);
        
        // Verify different owners
        assertEq(certNFT.ownerOf(tokenId1), student1);
        assertEq(certNFT.ownerOf(tokenId2), student2);
        
        // Verify total certificates issued
        Institution memory inst = _getInstitutionData(institution1);
        assertEq(inst.totalCertificatesIssued, 2);
    }
    
    function test_IssueCertificate_StudentCertificateList() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        vm.prank(institution1);
        uint256 tokenId = certNFT.issueCertificate(certData);
        
        // Verify certificate is in student's list
        uint256[] memory studentCerts = certNFT.getCertificatesByStudent(student1);
        assertEq(studentCerts.length, 1);
        assertEq(studentCerts[0], tokenId);
    }
    
    function test_IssueCertificate_NotAuthorized_Reverts() public {
        // Register but don't authorize
        _registerInstitution(
            institution1,
            INSTITUTION_NAME,
            INSTITUTION_ID,
            INSTITUTION_EMAIL,
            INSTITUTION_COUNTRY,
            InstitutionType.University
        );
        
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        vm.expectRevert();
        vm.prank(institution1);
        certNFT.issueCertificate(certData);
    }
    
    function test_IssueCertificate_InvalidStudentAddress_Reverts() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData = _createCertificateData(
            address(0), // Invalid address
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        vm.expectRevert();
        vm.prank(institution1);
        certNFT.issueCertificate(certData);
    }
    
    function test_IssueCertificate_EmptyStudentName_Reverts() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData = CertificateData({
            studentWallet: student1,
            studentName: "", // Empty name
            studentID: "STU-001",
            degreeTitle: "Bachelor of Science",
            grade: Classification.FirstClass,
            duration: "4 years",
            cgpa: "3.8",
            faculty: Faculty.Engineering,
            tokenURI: "https://ipfs.io/ipfs/QmTest123"
        });
        
        vm.expectRevert();
        vm.prank(institution1);
        certNFT.issueCertificate(certData);
    }
    
    // ============ revokeCertificate Tests ============
    
    function test_RevokeCertificate_Success_ByInstitution() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        vm.prank(institution1);
        uint256 tokenId = certNFT.issueCertificate(certData);
        
        // Revoke certificate
        string memory reason = "Academic misconduct";
        vm.expectEmit(true, false, false, true);
        emit CertificateRevoked(tokenId, institution1, reason, block.timestamp);
        
        vm.prank(institution1);
        certNFT.revokeCertificate(tokenId, reason);
        
        // Verify certificate is revoked
        assertTrue(certNFT.isRevoked(tokenId));
        
        Certificate memory cert = certNFT.getCertificate(tokenId);
        assertTrue(cert.isRevoked);
        assertEq(cert.revocationReason, reason);
        assertGt(cert.revocationDate, 0);
    }
    
    function test_RevokeCertificate_Success_ByOwner() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        vm.prank(institution1);
        uint256 tokenId = certNFT.issueCertificate(certData);
        
        // Owner can also revoke
        string memory reason = "Owner revocation";
        vm.prank(owner);
        certNFT.revokeCertificate(tokenId, reason);
        
        assertTrue(certNFT.isRevoked(tokenId));
    }
    
    function test_RevokeCertificate_NotIssuingInstitution_Reverts() public {
        _setupAuthorizedInstitution(institution1);
        _setupAuthorizedInstitution(institution2);
        
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        vm.prank(institution1);
        uint256 tokenId = certNFT.issueCertificate(certData);
        
        // Different institution cannot revoke
        vm.expectRevert();
        vm.prank(institution2);
        certNFT.revokeCertificate(tokenId, "Unauthorized revocation");
    }
    
    function test_RevokeCertificate_AlreadyRevoked_Reverts() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        vm.prank(institution1);
        uint256 tokenId = certNFT.issueCertificate(certData);
        
        // First revocation succeeds
        vm.prank(institution1);
        certNFT.revokeCertificate(tokenId, "First reason");
        
        // Second revocation should fail
        vm.expectRevert();
        vm.prank(institution1);
        certNFT.revokeCertificate(tokenId, "Second reason");
    }
    
    function test_RevokeCertificate_EmptyReason_Reverts() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        vm.prank(institution1);
        uint256 tokenId = certNFT.issueCertificate(certData);
        
        vm.expectRevert();
        vm.prank(institution1);
        certNFT.revokeCertificate(tokenId, ""); // Empty reason
    }
    
    // ============ verifyCertificate Tests ============
    
    function test_VerifyCertificate_ValidCertificate() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        vm.prank(institution1);
        uint256 tokenId = certNFT.issueCertificate(certData);
        
        // Verify certificate
        (Certificate memory cert, bool isValid) = certNFT.verifyCertificate(tokenId);
        
        assertTrue(isValid);
        assertEq(cert.studentName, "John Doe");
        assertEq(cert.studentID, "STU-001");
        assertEq(cert.degreeTitle, "Bachelor of Science");
        assertFalse(cert.isRevoked);
    }
    
    function test_VerifyCertificate_RevokedCertificate() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        vm.prank(institution1);
        uint256 tokenId = certNFT.issueCertificate(certData);
        
        // Revoke the certificate
        vm.prank(institution1);
        certNFT.revokeCertificate(tokenId, "Revocation reason");
        
        // Verify certificate - should be invalid
        (Certificate memory cert, bool isValid) = certNFT.verifyCertificate(tokenId);
        
        assertFalse(isValid);
        assertTrue(cert.isRevoked);
        assertEq(cert.revocationReason, "Revocation reason");
    }
    
    function test_VerifyCertificate_NonExistent_Reverts() public {
        vm.expectRevert();
        certNFT.verifyCertificate(999); // Non-existent token
    }
    
    // ============ Integration Tests ============
    
    function test_CompleteFlow_IssueAndRevoke() public {
        // Setup
        _setupAuthorizedInstitution(institution1);
        
        // Issue certificate
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        vm.prank(institution1);
        uint256 tokenId = certNFT.issueCertificate(certData);
        
        // Verify it's valid
        (, bool isValidBefore) = certNFT.verifyCertificate(tokenId);
        assertTrue(isValidBefore);
        
        // Revoke it
        vm.prank(institution1);
        certNFT.revokeCertificate(tokenId, "Academic misconduct");
        
        // Verify it's now invalid
        (, bool isValidAfter) = certNFT.verifyCertificate(tokenId);
        assertFalse(isValidAfter);
        
        // Verify institution certificate count
        uint256[] memory instCerts = certNFT.getCertificatesByInstitution(institution1);
        assertEq(instCerts.length, 1);
    }
    
    function test_MultipleStudents_MultipleCertificates() public {
        _setupAuthorizedInstitution(institution1);
        
        // Issue certificates to different students
        CertificateData memory certData1 = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        CertificateData memory certData2 = _createCertificateData(
            student2,
            "Jane Smith",
            "STU-002",
            "Master of Arts"
        );
        
        vm.prank(institution1);
        uint256 tokenId1 = certNFT.issueCertificate(certData1);
        
        vm.prank(institution1);
        uint256 tokenId2 = certNFT.issueCertificate(certData2);
        
        // Verify both students have their certificates
        uint256[] memory student1Certs = certNFT.getCertificatesByStudent(student1);
        uint256[] memory student2Certs = certNFT.getCertificatesByStudent(student2);
        
        assertEq(student1Certs.length, 1);
        assertEq(student1Certs[0], tokenId1);
        assertEq(student2Certs.length, 1);
        assertEq(student2Certs[0], tokenId2);
        
        // Verify total certificates
        assertEq(certNFT.getTotalCertificatesIssued(), 2);
    }
    
    // ============ deauthorizeInstitution Tests ============
    
    function test_DeauthorizeInstitution_Success() public {
        // Setup authorized institution
        _setupAuthorizedInstitution(institution1);
        
        // Verify it's authorized
        Institution memory instBefore = _getInstitutionData(institution1);
        assertTrue(instBefore.isAuthorized);
        
        // Deauthorize the institution
        vm.expectEmit(true, false, false, true);
        emit InstitutionDeauthorized(institution1, block.timestamp);
        
        certNFT.deauthorizeInstitution(institution1);
        
        // Verify it's no longer authorized
        Institution memory instAfter = _getInstitutionData(institution1);
        assertFalse(instAfter.isAuthorized);
    }
    
    function test_DeauthorizeInstitution_CanReauthorize() public {
        _setupAuthorizedInstitution(institution1);
        
        // Deauthorize
        certNFT.deauthorizeInstitution(institution1);
        
        // Can authorize again
        certNFT.authorizeInstitution(institution1);
        
        Institution memory inst = _getInstitutionData(institution1);
        assertTrue(inst.isAuthorized);
    }
    
    function test_DeauthorizeInstitution_OnlyOwnerCanDeauthorize() public {
        _setupAuthorizedInstitution(institution1);
        
        // Non-owner should not be able to deauthorize
        vm.expectRevert();
        vm.prank(institution1);
        certNFT.deauthorizeInstitution(institution1);
    }
    
    function test_DeauthorizeInstitution_NotRegistered_Reverts() public {
        // Try to deauthorize an institution that hasn't been registered
        vm.expectRevert();
        certNFT.deauthorizeInstitution(institution1);
    }
    
    function test_DeauthorizeInstitution_NotAuthorized_Reverts() public {
        // Register but don't authorize
        _registerInstitution(
            institution1,
            INSTITUTION_NAME,
            INSTITUTION_ID,
            INSTITUTION_EMAIL,
            INSTITUTION_COUNTRY,
            InstitutionType.University
        );
        
        // Try to deauthorize - should revert
        vm.expectRevert();
        certNFT.deauthorizeInstitution(institution1);
    }
    
    // ============ getCertificatesByInstitution Tests ============
    
    function test_GetCertificatesByInstitution_EmptyList() public {
        _setupAuthorizedInstitution(institution1);
        
        // No certificates issued yet
        uint256[] memory certs = certNFT.getCertificatesByInstitution(institution1);
        assertEq(certs.length, 0);
    }
    
    function test_GetCertificatesByInstitution_SingleCertificate() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        uint256 tokenId = _issueCertificate(institution1, certData);
        
        // Get certificates for institution
        uint256[] memory certs = certNFT.getCertificatesByInstitution(institution1);
        assertEq(certs.length, 1);
        assertEq(certs[0], tokenId);
    }
    
    function test_GetCertificatesByInstitution_ReturnsCorrectTokenId() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        uint256 expectedTokenId = _issueCertificate(institution1, certData);
        
        uint256[] memory certs = certNFT.getCertificatesByInstitution(institution1);
        assertEq(certs[0], expectedTokenId);
    }
    
    function test_GetCertificatesByInstitution_MultipleCertificates() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData1 = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        CertificateData memory certData2 = _createCertificateData(
            student2,
            "Jane Smith",
            "STU-002",
            "Master of Arts"
        );
        
        uint256 tokenId1 = _issueCertificate(institution1, certData1);
        uint256 tokenId2 = _issueCertificate(institution1, certData2);
        
        uint256[] memory certs = certNFT.getCertificatesByInstitution(institution1);
        assertEq(certs.length, 2);
        assertEq(certs[0], tokenId1);
        assertEq(certs[1], tokenId2);
    }
    
    function test_GetCertificatesByInstitution_MultipleStudents() public {
        _setupAuthorizedInstitution(institution1);
        
        // Issue certificates to different students
        CertificateData memory certData1 = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        CertificateData memory certData2 = _createCertificateData(
            student2,
            "Jane Smith",
            "STU-002",
            "Master of Arts"
        );
        
        uint256 tokenId1 = _issueCertificate(institution1, certData1);
        uint256 tokenId2 = _issueCertificate(institution1, certData2);
        
        // All should be in institution's list
        uint256[] memory certs = certNFT.getCertificatesByInstitution(institution1);
        assertEq(certs.length, 2);
    }
    
    function test_GetCertificatesByInstitution_DifferentInstitutions() public {
        _setupAuthorizedInstitution(institution1);
        _setupAuthorizedInstitution(institution2);
        
        CertificateData memory certData1 = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        CertificateData memory certData2 = _createCertificateData(
            student2,
            "Jane Smith",
            "STU-002",
            "Master of Arts"
        );
        
        uint256 tokenId1 = _issueCertificate(institution1, certData1);
        uint256 tokenId2 = _issueCertificate(institution2, certData2);
        
        // Each institution should only see its own certificates
        uint256[] memory inst1Certs = certNFT.getCertificatesByInstitution(institution1);
        uint256[] memory inst2Certs = certNFT.getCertificatesByInstitution(institution2);
        
        assertEq(inst1Certs.length, 1);
        assertEq(inst1Certs[0], tokenId1);
        assertEq(inst2Certs.length, 1);
        assertEq(inst2Certs[0], tokenId2);
    }
    
    function test_GetCertificatesByInstitution_IncludesRevokedCertificates() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        uint256 tokenId = _issueCertificate(institution1, certData);
        
        // Revoke the certificate
        vm.prank(institution1);
        certNFT.revokeCertificate(tokenId, "Revocation reason");
        
        // Revoked certificate should still be in the list
        uint256[] memory certs = certNFT.getCertificatesByInstitution(institution1);
        assertEq(certs.length, 1);
        assertEq(certs[0], tokenId);
    }
    
    // ============ transferOwnership Tests ============
    
    function test_TransferOwnership_Success() public {
        address newOwner = address(0x999);
        
        // Verify current owner
        assertEq(certNFT.owner(), owner);
        
        // Transfer ownership
        vm.expectEmit(true, true, false, true);
        emit OwnershipTransferred(owner, newOwner);
        
        certNFT.transferOwnership(newOwner);
        
        // Verify new owner
        assertEq(certNFT.owner(), newOwner);
    }
    
    function test_TransferOwnership_NewOwnerCanTransfer() public {
        address newOwner = address(0x999);
        address anotherOwner = address(0x888);
        
        // Transfer to new owner
        certNFT.transferOwnership(newOwner);
        
        // New owner can transfer again
        vm.prank(newOwner);
        certNFT.transferOwnership(anotherOwner);
        
        assertEq(certNFT.owner(), anotherOwner);
    }
    
    function test_TransferOwnership_OnlyOwnerCanTransfer() public {
        address newOwner = address(0x999);
        
        // Non-owner cannot transfer
        vm.expectRevert();
        vm.prank(institution1);
        certNFT.transferOwnership(newOwner);
        
        // Owner should still be the same
        assertEq(certNFT.owner(), owner);
    }
    
    function test_TransferOwnership_InvalidAddress_Reverts() public {
        // Cannot transfer to zero address
        vm.expectRevert();
        certNFT.transferOwnership(address(0));
        
        // Owner should still be the same
        assertEq(certNFT.owner(), owner);
    }
    
    function test_TransferOwnership_OldOwnerCannotTransfer() public {
        address newOwner = address(0x999);
        
        // Transfer ownership
        certNFT.transferOwnership(newOwner);
        
        // Old owner cannot transfer anymore
        vm.expectRevert();
        certNFT.transferOwnership(address(0x888));
    }
    
    function test_TransferOwnership_NewOwnerCanAuthorize() public {
        address newOwner = address(0x999);
        
        // Transfer ownership
        certNFT.transferOwnership(newOwner);
        
        // Setup institution
        _registerInstitution(
            institution1,
            INSTITUTION_NAME,
            INSTITUTION_ID,
            INSTITUTION_EMAIL,
            INSTITUTION_COUNTRY,
            InstitutionType.University
        );
        
        // New owner can authorize
        vm.prank(newOwner);
        certNFT.authorizeInstitution(institution1);
        
        Institution memory inst = _getInstitutionData(institution1);
        assertTrue(inst.isAuthorized);
    }
    
    function test_TransferOwnership_NewOwnerCanDeauthorize() public {
        address newOwner = address(0x999);
        
        // Setup authorized institution
        _setupAuthorizedInstitution(institution1);
        
        // Transfer ownership
        certNFT.transferOwnership(newOwner);
        
        // New owner can deauthorize
        vm.prank(newOwner);
        certNFT.deauthorizeInstitution(institution1);
        
        Institution memory inst = _getInstitutionData(institution1);
        assertFalse(inst.isAuthorized);
    }
    
    function test_DeauthorizeInstitution_PreventsCertificateIssuance() public {
        _setupAuthorizedInstitution(institution1);
        
        // Deauthorize
        certNFT.deauthorizeInstitution(institution1);
        
        // Should not be able to issue certificates
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        vm.expectRevert();
        vm.prank(institution1);
        certNFT.issueCertificate(certData);
    }
    
    function test_GetCertificatesByInstitution_OrderPreserved() public {
        _setupAuthorizedInstitution(institution1);
        
        // Issue multiple certificates
        CertificateData memory certData1 = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        CertificateData memory certData2 = _createCertificateData(
            student2,
            "Jane Smith",
            "STU-002",
            "Master of Arts"
        );
        
        uint256 tokenId1 = _issueCertificate(institution1, certData1);
        uint256 tokenId2 = _issueCertificate(institution1, certData2);
        
        // Verify order is preserved
        uint256[] memory certs = certNFT.getCertificatesByInstitution(institution1);
        assertEq(certs[0], tokenId1);
        assertEq(certs[1], tokenId2);
    }
    
    function test_TransferOwnership_NewOwnerCanRevokeCertificates() public {
        address newOwner = address(0x999);
        
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        uint256 tokenId = _issueCertificate(institution1, certData);
        
        // Transfer ownership
        certNFT.transferOwnership(newOwner);
        
        // New owner can revoke certificates
        vm.prank(newOwner);
        certNFT.revokeCertificate(tokenId, "Owner revocation");
        
        assertTrue(certNFT.isRevoked(tokenId));
    }
    
    function test_DeauthorizeInstitution_MultipleInstitutions() public {
        _setupAuthorizedInstitution(institution1);
        _setupAuthorizedInstitution(institution2);
        
        // Deauthorize one institution
        certNFT.deauthorizeInstitution(institution1);
        
        // Other institution should still be authorized
        Institution memory inst1 = _getInstitutionData(institution1);
        Institution memory inst2 = _getInstitutionData(institution2);
        assertFalse(inst1.isAuthorized);
        assertTrue(inst2.isAuthorized);
    }
    
    function test_DeauthorizeInstitution_AfterIssuingCertificates() public {
        _setupAuthorizedInstitution(institution1);
        
        // Issue a certificate
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        uint256 tokenId = _issueCertificate(institution1, certData);
        
        // Deauthorize institution
        certNFT.deauthorizeInstitution(institution1);
        
        // Certificate should still exist and be valid
        (, bool isValid) = certNFT.verifyCertificate(tokenId);
        assertTrue(isValid);
        
        // But cannot issue new certificates
        CertificateData memory certData2 = _createCertificateData(
            student2,
            "Jane Smith",
            "STU-002",
            "Master of Arts"
        );
        
        vm.expectRevert();
        vm.prank(institution1);
        certNFT.issueCertificate(certData2);
    }
    
    function test_GetCertificatesByInstitution_LargeNumberOfCertificates() public {
        _setupAuthorizedInstitution(institution1);
        
        // Issue multiple certificates
        uint256[] memory expectedTokenIds = new uint256[](5);
        for (uint256 i = 0; i < 5; i++) {
            CertificateData memory certData = _createCertificateData(
                address(uint160(uint256(keccak256(abi.encodePacked("student", i))))),
                string(abi.encodePacked("Student ", i)),
                string(abi.encodePacked("STU-", i)),
                "Degree"
            );
            expectedTokenIds[i] = _issueCertificate(institution1, certData);
        }
        
        uint256[] memory certs = certNFT.getCertificatesByInstitution(institution1);
        assertEq(certs.length, 5);
        
        // Verify all token IDs are present
        for (uint256 i = 0; i < 5; i++) {
            assertEq(certs[i], expectedTokenIds[i]);
        }
    }
    
    function test_GetCertificatesByInstitution_UnauthorizedInstitution() public {
        // Register but don't authorize
        _registerInstitution(
            institution1,
            INSTITUTION_NAME,
            INSTITUTION_ID,
            INSTITUTION_EMAIL,
            INSTITUTION_COUNTRY,
            InstitutionType.University
        );
        
        // Should return empty array even if not authorized
        uint256[] memory certs = certNFT.getCertificatesByInstitution(institution1);
        assertEq(certs.length, 0);
    }
    
    function test_GetCertificatesByInstitution_AfterReauthorization() public {
        _setupAuthorizedInstitution(institution1);
        
        // Issue certificate
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        uint256 tokenId1 = _issueCertificate(institution1, certData);
        
        // Deauthorize and reauthorize
        certNFT.deauthorizeInstitution(institution1);
        certNFT.authorizeInstitution(institution1);
        
        // Issue another certificate
        uint256 tokenId2 = _issueCertificate(institution1, certData);
        
        // Both certificates should be in the list
        uint256[] memory certs = certNFT.getCertificatesByInstitution(institution1);
        assertEq(certs.length, 2);
        assertEq(certs[0], tokenId1);
        assertEq(certs[1], tokenId2);
    }
    
    function test_TransferOwnership_MultipleTransfers() public {
        address owner1 = address(0x999);
        address owner2 = address(0x888);
        address owner3 = address(0x777);
        
        // First transfer
        certNFT.transferOwnership(owner1);
        assertEq(certNFT.owner(), owner1);
        
        // Second transfer
        vm.prank(owner1);
        certNFT.transferOwnership(owner2);
        assertEq(certNFT.owner(), owner2);
        
        // Third transfer
        vm.prank(owner2);
        certNFT.transferOwnership(owner3);
        assertEq(certNFT.owner(), owner3);
    }
    
    function test_TransferOwnership_NewOwnerCanManageAllInstitutions() public {
        address newOwner = address(0x999);
        
        // Setup multiple institutions
        _setupAuthorizedInstitution(institution1);
        _setupAuthorizedInstitution(institution2);
        
        // Transfer ownership
        certNFT.transferOwnership(newOwner);
        
        // New owner can deauthorize both
        vm.prank(newOwner);
        certNFT.deauthorizeInstitution(institution1);
        
        vm.prank(newOwner);
        certNFT.deauthorizeInstitution(institution2);
        
        Institution memory inst1 = _getInstitutionData(institution1);
        Institution memory inst2 = _getInstitutionData(institution2);
        assertFalse(inst1.isAuthorized);
        assertFalse(inst2.isAuthorized);
    }
    
    function test_TransferOwnership_PreservesExistingState() public {
        address newOwner = address(0x999);
        
        // Setup and issue certificate
        _setupAuthorizedInstitution(institution1);
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        uint256 tokenId = _issueCertificate(institution1, certData);
        
        // Transfer ownership
        certNFT.transferOwnership(newOwner);
        
        // All existing state should be preserved
        assertEq(certNFT.ownerOf(tokenId), student1);
        assertEq(certNFT.getTotalCertificatesIssued(), 1);
        
        uint256[] memory certs = certNFT.getCertificatesByInstitution(institution1);
        assertEq(certs.length, 1);
    }
    
    // ============ isRevoked Tests ============
    
    function test_IsRevoked_ReturnsFalseForValidCertificate() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        uint256 tokenId = _issueCertificate(institution1, certData);
        
        // Certificate should not be revoked
        assertFalse(certNFT.isRevoked(tokenId));
    }
    
    function test_IsRevoked_ReturnsTrueForRevokedCertificate() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        uint256 tokenId = _issueCertificate(institution1, certData);
        
        // Revoke the certificate
        vm.prank(institution1);
        certNFT.revokeCertificate(tokenId, "Revocation reason");
        
        // Certificate should be revoked
        assertTrue(certNFT.isRevoked(tokenId));
    }
    
    function test_IsRevoked_NonExistentCertificate_Reverts() public {
        // Should revert for non-existent certificate
        vm.expectRevert();
        certNFT.isRevoked(999);
    }
    
    function test_IsRevoked_MultipleCertificates() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData1 = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        CertificateData memory certData2 = _createCertificateData(
            student2,
            "Jane Smith",
            "STU-002",
            "Master of Arts"
        );
        
        uint256 tokenId1 = _issueCertificate(institution1, certData1);
        uint256 tokenId2 = _issueCertificate(institution1, certData2);
        
        // Revoke only one
        vm.prank(institution1);
        certNFT.revokeCertificate(tokenId1, "Revocation reason");
        
        // Check both
        assertTrue(certNFT.isRevoked(tokenId1));
        assertFalse(certNFT.isRevoked(tokenId2));
    }
    
    // ============ getCertificatesByStudent Tests ============
    
    function test_GetCertificatesByStudent_EmptyList() public {
        // Student with no certificates
        uint256[] memory certs = certNFT.getCertificatesByStudent(student1);
        assertEq(certs.length, 0);
    }
    
    function test_GetCertificatesByStudent_SingleCertificate() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        uint256 tokenId = _issueCertificate(institution1, certData);
        
        // Get certificates for student
        uint256[] memory certs = certNFT.getCertificatesByStudent(student1);
        assertEq(certs.length, 1);
        assertEq(certs[0], tokenId);
    }
    
    function test_GetCertificatesByStudent_ReturnsCorrectTokenId() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        uint256 expectedTokenId = _issueCertificate(institution1, certData);
        
        uint256[] memory certs = certNFT.getCertificatesByStudent(student1);
        assertEq(certs[0], expectedTokenId);
    }
    
    function test_GetCertificatesByStudent_MultipleCertificates() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData1 = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        CertificateData memory certData2 = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Master of Science"
        );
        
        uint256 tokenId1 = _issueCertificate(institution1, certData1);
        uint256 tokenId2 = _issueCertificate(institution1, certData2);
        
        uint256[] memory certs = certNFT.getCertificatesByStudent(student1);
        assertEq(certs.length, 2);
        assertEq(certs[0], tokenId1);
        assertEq(certs[1], tokenId2);
    }
    
    function test_GetCertificatesByStudent_FromDifferentInstitutions() public {
        _setupAuthorizedInstitution(institution1);
        _setupAuthorizedInstitution(institution2);
        
        CertificateData memory certData1 = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        CertificateData memory certData2 = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Master of Arts"
        );
        
        uint256 tokenId1 = _issueCertificate(institution1, certData1);
        uint256 tokenId2 = _issueCertificate(institution2, certData2);
        
        // Student should have certificates from both institutions
        uint256[] memory certs = certNFT.getCertificatesByStudent(student1);
        assertEq(certs.length, 2);
    }
    
    function test_GetCertificatesByStudent_IncludesRevokedCertificates() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        uint256 tokenId = _issueCertificate(institution1, certData);
        
        // Revoke the certificate
        vm.prank(institution1);
        certNFT.revokeCertificate(tokenId, "Revocation reason");
        
        // Revoked certificate should still be in student's list
        uint256[] memory certs = certNFT.getCertificatesByStudent(student1);
        assertEq(certs.length, 1);
        assertEq(certs[0], tokenId);
    }
    
    function test_GetCertificatesByStudent_OrderPreserved() public {
        _setupAuthorizedInstitution(institution1);
        
        // Issue multiple certificates
        CertificateData memory certData1 = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        CertificateData memory certData2 = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Master of Science"
        );
        
        uint256 tokenId1 = _issueCertificate(institution1, certData1);
        uint256 tokenId2 = _issueCertificate(institution1, certData2);
        
        // Verify order is preserved
        uint256[] memory certs = certNFT.getCertificatesByStudent(student1);
        assertEq(certs[0], tokenId1);
        assertEq(certs[1], tokenId2);
    }
    
    // ============ getTotalCertificatesIssued Tests ============
    
    function test_GetTotalCertificatesIssued_InitialState() public {
        // Initially should be 0
        assertEq(certNFT.getTotalCertificatesIssued(), 0);
    }
    
    function test_GetTotalCertificatesIssued_AfterSingleCertificate() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        _issueCertificate(institution1, certData);
        
        // Should be 1
        assertEq(certNFT.getTotalCertificatesIssued(), 1);
    }
    
    function test_GetTotalCertificatesIssued_AfterMultipleCertificates() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData1 = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        CertificateData memory certData2 = _createCertificateData(
            student2,
            "Jane Smith",
            "STU-002",
            "Master of Arts"
        );
        
        _issueCertificate(institution1, certData1);
        _issueCertificate(institution1, certData2);
        
        // Should be 2
        assertEq(certNFT.getTotalCertificatesIssued(), 2);
    }
    
    function test_GetTotalCertificatesIssued_IncludesRevokedCertificates() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        uint256 tokenId = _issueCertificate(institution1, certData);
        
        // Total should be 1
        assertEq(certNFT.getTotalCertificatesIssued(), 1);
        
        // Revoke the certificate
        vm.prank(institution1);
        certNFT.revokeCertificate(tokenId, "Revocation reason");
        
        // Total should still be 1 (revoked certificates are still counted)
        assertEq(certNFT.getTotalCertificatesIssued(), 1);
    }
    
    function test_GetTotalCertificatesIssued_AcrossMultipleInstitutions() public {
        _setupAuthorizedInstitution(institution1);
        _setupAuthorizedInstitution(institution2);
        
        CertificateData memory certData1 = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        CertificateData memory certData2 = _createCertificateData(
            student2,
            "Jane Smith",
            "STU-002",
            "Master of Arts"
        );
        
        _issueCertificate(institution1, certData1);
        _issueCertificate(institution2, certData2);
        
        // Total should be 2 (across all institutions)
        assertEq(certNFT.getTotalCertificatesIssued(), 2);
    }
    
    // ============ Integration Tests ============
    
    function test_CompleteFlow_IsRevokedAndGetCertificatesByStudent() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        uint256 tokenId = _issueCertificate(institution1, certData);
        
        // Verify not revoked and in student list
        assertFalse(certNFT.isRevoked(tokenId));
        uint256[] memory certs = certNFT.getCertificatesByStudent(student1);
        assertEq(certs.length, 1);
        
        // Revoke
        vm.prank(institution1);
        certNFT.revokeCertificate(tokenId, "Revocation reason");
        
        // Verify revoked but still in list
        assertTrue(certNFT.isRevoked(tokenId));
        certs = certNFT.getCertificatesByStudent(student1);
        assertEq(certs.length, 1);
    }
    
    function test_Integration_TotalCountMatchesStudentAndInstitutionLists() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData1 = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        CertificateData memory certData2 = _createCertificateData(
            student2,
            "Jane Smith",
            "STU-002",
            "Master of Arts"
        );
        
        uint256 tokenId1 = _issueCertificate(institution1, certData1);
        uint256 tokenId2 = _issueCertificate(institution1, certData2);
        
        // Total count should match
        uint256 total = certNFT.getTotalCertificatesIssued();
        uint256[] memory student1Certs = certNFT.getCertificatesByStudent(student1);
        uint256[] memory student2Certs = certNFT.getCertificatesByStudent(student2);
        uint256[] memory instCerts = certNFT.getCertificatesByInstitution(institution1);
        
        assertEq(total, 2);
        assertEq(student1Certs.length + student2Certs.length, 2);
        assertEq(instCerts.length, 2);
    }
    
    // ============ getInstitution Comprehensive Tests ============
    
    function test_GetInstitution_ReturnsAllFields() public {
        _registerInstitution(
            institution1,
            INSTITUTION_NAME,
            INSTITUTION_ID,
            INSTITUTION_EMAIL,
            INSTITUTION_COUNTRY,
            InstitutionType.University
        );
        
        Institution memory inst = certNFT.getInstitution(institution1);
        
        assertEq(inst.name, INSTITUTION_NAME);
        assertEq(inst.institutionID, INSTITUTION_ID);
        assertEq(inst.walletAddress, institution1);
        assertEq(inst.email, INSTITUTION_EMAIL);
        assertEq(inst.country, INSTITUTION_COUNTRY);
        assertTrue(uint8(inst.institutionType) == uint8(InstitutionType.University));
        assertFalse(inst.isAuthorized);
        assertEq(inst.totalCertificatesIssued, 0);
    }
    
    function test_GetInstitution_NotRegistered_Reverts() public {
        vm.expectRevert();
        certNFT.getInstitution(institution1);
    }
    
    function test_GetInstitution_AfterAuthorization() public {
        _setupAuthorizedInstitution(institution1);
        
        Institution memory inst = certNFT.getInstitution(institution1);
        assertTrue(inst.isAuthorized);
        assertEq(inst.totalCertificatesIssued, 0);
    }
    
    function test_GetInstitution_AfterIssuingCertificates() public {
        _setupAuthorizedInstitution(institution1);
        
        CertificateData memory certData = _createCertificateData(
            student1,
            "John Doe",
            "STU-001",
            "Bachelor of Science"
        );
        
        _issueCertificate(institution1, certData);
        
        Institution memory inst = certNFT.getInstitution(institution1);
        assertEq(inst.totalCertificatesIssued, 1);
    }
    
    function test_GetInstitution_MultipleInstitutions() public {
        _registerInstitution(
            institution1,
            "University A",
            "UNIV-001",
            "info@univa.edu",
            "USA",
            InstitutionType.University
        );
        
        _registerInstitution(
            institution2,
            "Polytechnic B",
            "POLY-002",
            "info@polyb.edu",
            "Canada",
            InstitutionType.Polytechnic
        );
        
        Institution memory inst1 = certNFT.getInstitution(institution1);
        Institution memory inst2 = certNFT.getInstitution(institution2);
        
        assertEq(inst1.name, "University A");
        assertEq(inst2.name, "Polytechnic B");
        assertTrue(uint8(inst1.institutionType) != uint8(inst2.institutionType));
    }
}


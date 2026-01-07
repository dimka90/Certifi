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
    event CertificateIssued(uint256 indexed tokenId, address indexed student, address indexed institution, string degreeTitle, uint256 timestamp);
    event CertificateRevoked(uint256 indexed tokenId, address indexed institution, string reason, uint256 timestamp);
    
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
}


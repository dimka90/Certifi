// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {CertificateNFT} from "../src/core/CertificationNft.sol";
import {InstitutionType} from "../src/types/Enums.sol";

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
        (string memory name, string memory id, address wallet, , , , , bool isAuthorized, ) = 
            _getInstitutionData(institution1);
        assertEq(name, INSTITUTION_NAME);
        assertEq(id, INSTITUTION_ID);
        assertEq(wallet, institution1);
        assertFalse(isAuthorized); // Should not be authorized yet
    }
    
    function _getInstitutionData(address addr) internal view returns (
        string memory name,
        string memory institutionID,
        address walletAddress,
        string memory email,
        string memory country,
        InstitutionType institutionType,
        uint256 registrationDate,
        bool isAuthorized,
        uint256 totalCertificatesIssued
    ) {
        return certNFT.getInstitution(addr);
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
        (, , , , , InstitutionType type1, , , ) = _getInstitutionData(institution1);
        (, , , , , InstitutionType type2, , , ) = _getInstitutionData(institution2);
        assertTrue(uint8(type1) != uint8(type2));
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
        
        (, , , , , , uint256 registrationDate, , ) = _getInstitutionData(institution1);
        assertEq(registrationDate, beforeTime);
    }
}


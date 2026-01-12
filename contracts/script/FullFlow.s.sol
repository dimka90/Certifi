// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/CertificationNft.sol";
import "../src/types/Structs.sol";
import "../src/types/Enums.sol";

contract FullFlow is Script {
    CertificateNFT public certContract;
    address public deployer;
    address public institution;
    address public student;

    function setUp() public {
        address contractAddress = vm.envAddress("CONTRACT_ADDRESS");
        certContract = CertificateNFT(contractAddress);
        deployer = vm.envAddress("AGENT_ADDRESS");
        institution = deployer; // Use same address as institution for this demo
        student = address(0x1234567890123456789012345678901234567890);
    }

    function run() public {
        console.log("\n=== Full Flow: Register, Authorize, Issue, and Interact ===\n");

        // Step 1: Register Institution
        console.log("Step 1: Registering Institution...");
        vm.startBroadcast(deployer);

        try
            certContract.registerInstitution(
                "Test University",
                "TU-001",
                "admin@testuniversity.edu",
                "USA",
                InstitutionType.University
            )
        {
            console.log("  Institution registered successfully");
        } catch Error(string memory reason) {
            console.log("Institution already registered:", reason);
        }

        // Step 2: Authorize Institution (owner only)
        console.log("\nStep 2: Authorizing Institution...");
        try certContract.authorizeInstitution(institution) {
            console.log(" Institution authorized successfully");
        } catch Error(string memory reason) {
            console.log("   Institution already authorized:", reason);
        }

        // Step 3: Issue 5 Certificates
        console.log("\nStep 3: Issuing 5 Certificates...");
        for (uint256 i = 1; i <= 5; i++) {
            CertificateData memory certData = CertificateData({
                studentWallet: address(uint160(uint256(keccak256(abi.encodePacked(i))))),
                studentName: string(abi.encodePacked("Student ", vm.toString(i))),
                studentID: string(abi.encodePacked("STU-", vm.toString(i))),
                degreeTitle: "Bachelor of Science",
                grade: Classification.FirstClass,
                duration: "4 years",
                cgpa: "3.8",
                faculty: Faculty.Engineering,
                tokenURI: string(
                    abi.encodePacked("ipfs://QmCertificate", vm.toString(i))
                ),
                expirationDate: 0,
                templateId: 0,
                isClaimable: false,
                claimHash: bytes32(0)
            });

            try certContract.issueCertificate(certData) returns (uint256 tokenId) {
                console.log(
                    string(
                        abi.encodePacked(
                            " Certificate ",
                            vm.toString(i),
                            " issued (Token ID: ",
                            vm.toString(tokenId),
                            ")"
                        )
                    )
                );
            } catch Error(string memory reason) {
                console.log(
                    string(
                        abi.encodePacked(
                            "Failed to issue certificate ",
                            vm.toString(i),
                            ": ",
                            reason
                        )
                    )
                );
            }
        }

        vm.stopBroadcast();

        // Step 4: Query and Interact (20 times)
        console.log("\nStep 4: Querying Contract 20 Times...\n");

        for (uint256 i = 1; i <= 20; i++) {
            console.log(string(abi.encodePacked("Call ", vm.toString(i), "/20")));

            // Query 1: Get total certificates
            uint256 total = certContract.getTotalCertificatesIssued();
            console.log("  Total certificates issued:", total);

            // Query 2: Check revocation status of first certificate
            if (total > 0) {
                bool revoked = certContract.isRevoked(1);
                console.log("  Certificate #1 revoked:", revoked);
            }

            // Query 3: Verify first certificate
            if (total > 0) {
                (Certificate memory cert, bool isValid) = certContract
                    .verifyCertificate(1);
                console.log("  Certificate #1 valid:", isValid);
                console.log(
                    string(
                        abi.encodePacked(
                            "  Student: ",
                            cert.studentName,
                            " | Degree: ",
                            cert.degreeTitle
                        )
                    )
                );
            }

            console.log("");
        }

        console.log("=== Full Flow Completed! ===\n");
    }
}

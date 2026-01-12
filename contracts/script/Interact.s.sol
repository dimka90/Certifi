// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/CertificationNft.sol";
import "../src/types/Enums.sol";
import "../src/types/Structs.sol";

contract InteractScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        
        CertificateNFT certContract = CertificateNFT(0x33A21018CF5Ccf399f98DeDfc29eAa1AbEEF0AAB);
        
        console.log("Interacting with CertificateNFT at:", address(certContract));
        console.log("Sender address:", deployerAddress);

        vm.startBroadcast(deployerPrivateKey);

        // Transaction 1: Register Institution
        // We'll use a slightly different name each time or just handle failure
        try certContract.getInstitution(deployerAddress) {
            console.log("Institution already registered.");
        } catch {
            console.log("TX 1: Registering Institution...");
            certContract.registerInstitution(
                "Certifi Academy",
                "CERT-001",
                "contact@certifi.edu",
                "Global",
                InstitutionType.University
            );
        }

        // Transaction 2: Authorize (if sender is admin)
        if (certContract.hasRole(certContract.ADMIN_ROLE(), deployerAddress)) {
            // Check if already authorized
            Institution memory inst = certContract.getInstitution(deployerAddress);
            if (!inst.isAuthorized) {
                console.log("TX 2: Authorizing Institution...");
                certContract.authorizeInstitution(deployerAddress);
            } else {
                console.log("Institution already authorized.");
            }
        }

        // Transactions 3-10: Issue Certificates
        // We'll issue enough to reach 10 transactions if possible, or just 8-10.
        // Let's do 10 issuance transactions to satisfy the request.
        for (uint i = 0; i < 10; i++) {
            console.log("TX", i + 1, ": Issuing Certificate...");
            CertificateData memory data = CertificateData({
                studentWallet: address(uint160(0xABC + i)),
                studentName: string(abi.encodePacked("Graduate ", vm.toString(i + 1))),
                studentID: string(abi.encodePacked("ID-", vm.toString(1000 + i))),
                degreeTitle: "Professional Blockchain Engineer",
                grade: Classification.FirstClass,
                duration: "2024-2025",
                cgpa: "3.9",
                faculty: Faculty.Technology,
                tokenURI: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3v6v3r7zscz2hyu",
                expirationDate: 0,
                templateId: 0,
                isClaimable: false,
                claimHash: bytes32(0)
            });
            
            try certContract.issueCertificate(data) returns (uint256 tokenId) {
                console.log("   -> Issued Token ID:", tokenId);
            } catch (bytes memory reason) {
                console.log("   -> Issuance failed (likely not authorized yet)");
                // If issuance fails, we still tried a transaction if we are broadcasting.
                // But Forge might revert the whole thing if it's not caught.
                // However, 'issueCertificate' has 'onlyAuthorizedInstitution' modifier.
            }
        }

        vm.stopBroadcast();
    }
}

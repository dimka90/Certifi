// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/CertificationNft.sol";
import "../src/types/Structs.sol";

contract InteractContract is Script {
    CertificateNFT public certContract;

    function setUp() public {
        // Get contract address from environment or use the one from .env
        address contractAddress = vm.envAddress("CONTRACT_ADDRESS");
        certContract = CertificateNFT(contractAddress);
    }

    function run() public {
        console.log("\n=== Calling Contract 20 Times ===\n");

        for (uint256 i = 1; i <= 20; i++) {
            console.log(string(abi.encodePacked("Call ", vm.toString(i), "/20")));

            // Call 1: Get total certificates issued
            uint256 total = certContract.getTotalCertificatesIssued();
            console.log("  Total certificates issued:", total);

            // Call 2: Check if certificate 1 is revoked (if it exists)
            if (total > 0) {
                bool revoked = certContract.isRevoked(1);
                console.log("  Certificate #1 revoked:", revoked);
            }

            // Call 3: Verify certificate 1 (if it exists)
            if (total > 0) {
                (Certificate memory cert, bool isValid) = certContract
                    .verifyCertificate(1);
                console.log("  Certificate #1 valid:", isValid);
            }

            console.log("");
        }

        console.log("=== All 20 calls completed! ===\n");
    }
}

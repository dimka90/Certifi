// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/CertificationNft.sol";

contract DeployCelo is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the CertificateNFT contract
        CertificateNFT certificateNFT = new CertificateNFT();

        console.log("CertificateNFT deployed to:", address(certificateNFT));

        vm.stopBroadcast();
    }
}

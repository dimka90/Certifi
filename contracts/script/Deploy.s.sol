// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/CertificationNft.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying from address:", deployer);
        console.log("Account balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the CertificateNFT contract
        CertificateNFT certificateNFT = new CertificateNFT();

        console.log("-----------------------------------------");
        console.log("CertificateNFT successfully deployed!");
        console.log("Contract Address:", address(certificateNFT));
        console.log("Owner/Admin Address:", certificateNFT.owner());
        console.log("-----------------------------------------");

        vm.stopBroadcast();
    }
}

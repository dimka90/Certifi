const { ethers } = require("ethers");
require("dotenv").config();

// Contract ABI (minimal for our interactions)
const CONTRACT_ABI = [
  "function getTotalCertificatesIssued() external view returns (uint256)",
  "function getCertificate(uint256 tokenId) external view returns (tuple(string studentName, string studentID, address studentWallet, string degreeTitle, uint256 issueDate, string grade, string duration, string cgpa, string faculty, address issuingInstitution, bool isRevoked, uint256 revocationDate, string revocationReason))",
  "function verifyCertificate(uint256 tokenId) external view returns (tuple(string studentName, string studentID, address studentWallet, string degreeTitle, uint256 issueDate, string grade, string duration, string cgpa, string faculty, address issuingInstitution, bool isRevoked, uint256 revocationDate, string revocationReason) certificate, bool isValid)",
  "function isRevoked(uint256 tokenId) external view returns (bool)",
];

async function main() {
  // Setup provider and contract
  const rpcUrl = process.env.CELO_ALFAJORES_RPC_URL;
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!rpcUrl || !contractAddress) {
    throw new Error("Missing RPC_URL or CONTRACT_ADDRESS in .env");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);

  console.log(`\n📋 Calling contract at ${contractAddress}`);
  console.log(`🌐 Network: Celo Alfajores Testnet\n`);

  // Call the contract 20 times
  for (let i = 1; i <= 20; i++) {
    try {
      console.log(`\n[Call ${i}/20]`);

      // Call 1: Get total certificates issued
      const total = await contract.getTotalCertificatesIssued();
      console.log(`  ✓ Total certificates issued: ${total}`);

      // Call 2: Check if certificate 1 is revoked (if it exists)
      if (total > 0) {
        const isRevokedStatus = await contract.isRevoked(1);
        console.log(`  ✓ Certificate #1 revoked status: ${isRevokedStatus}`);
      }

      // Call 3: Verify certificate 1 (if it exists)
      if (total > 0) {
        const verification = await contract.verifyCertificate(1);
        console.log(`  ✓ Certificate #1 valid: ${verification.isValid}`);
      }

      // Add a small delay between calls to avoid rate limiting
      if (i < 20) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.log(`  ✗ Error on call ${i}: ${error.message}`);
    }
  }

  console.log("\n✅ All 20 contract calls completed!\n");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "forge-std/Test.sol";
import "../src/core/CertificationNft.sol";
contract VerificationRequestTest is Test {
    CertificateNFT nft; address admin = address(1); address inst = address(2);
    function setUp() public {
        vm.prank(admin); nft = new CertificateNFT(); vm.prank(admin); nft.grantRole(nft.ADMIN_ROLE(), admin);
        vm.prank(inst); nft.registerInstitution("Test Inst", "ID1", "email", "country", InstitutionType.University);
        vm.prank(admin); nft.authorizeInstitution(inst);
    }
    function testRequestVerification() public {
        CertificateData memory data = CertificateData({ studentWallet: address(3), studentName: "Student", studentID: "S1", degreeTitle: "Degree", grade: Classification.FirstClass, duration: "4 years", cgpa: "4.0", faculty: Faculty.Science, tokenURI: "uri", expirationDate: 0, templateId: 0, isClaimable: false, claimHash: bytes32(0) });
        vm.prank(inst); uint256 tokenId = nft.issueCertificate(data);
        vm.prank(inst); uint256 requestId = nft.requestCertificateVerification(tokenId, "Verify");
        VerificationRequest memory request = nft.verificationRequests(requestId);
        assertEq(request.tokenId, tokenId);
    }
}

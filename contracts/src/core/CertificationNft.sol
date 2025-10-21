// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../types/Enums.sol";
import "../types/Structs.sol";
import "../events/Events.sol";
import "../errors/Errors.sol";

contract CertificateNFT is ERC721URIStorage {
    
    using Counters for Counters.Counter;
    
    address public owner;
    Counters.Counter private _tokenIds;
    
    
    mapping(address => Institution) public institutions;
    mapping(uint256 => Certificate) public certificates;
    mapping(address => uint256[]) public studentCertificates;
    mapping(address => uint256[]) public institutionCertificates;
    mapping(address => bool) public registeredInstitutions;
    
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }
    
    modifier onlyAuthorizedInstitution() {
        if (!institutions[msg.sender].isAuthorized) revert NotAuthorizedInstitution();
        _;
    }
    
    modifier certificateExists(uint256 tokenId) {
        if (!_exists(tokenId)) revert CertificateDoesNotExist();
        _;
    }
    
    
    constructor() ERC721("Educational Certificate", "CERTIFI") {
        owner = msg.sender;
    }
    
    function registerInstitution(
        string memory _name,
        string memory _institutionID,
        string memory _email,
        string memory _country,
        InstitutionType _institutionType
    ) external {
        if (registeredInstitutions[msg.sender]) revert InstitutionAlreadyRegistered();
        if (bytes(_name).length == 0) revert EmptyString();
        if (bytes(_institutionID).length == 0) revert InvalidInstitutionID();
        
        institutions[msg.sender].isAuthorized = true; 
        
        institutions[msg.sender] = Institution({
            name: _name,
            institutionID: _institutionID,
            walletAddress: msg.sender,
            email: _email,
            country: _country,
            institutionType: _institutionType,
            registrationDate: block.timestamp,
            isAuthorized: false,
            totalCertificatesIssued: 0
        });
        
        registeredInstitutions[msg.sender] = true;
        
        emit InstitutionRegistered(msg.sender, _name, _institutionID, block.timestamp);
    }
    
   
    function authorizeInstitution(address _institution) external onlyOwner {
        if (!registeredInstitutions[_institution]) revert InstitutionNotRegistered();
        if (institutions[_institution].isAuthorized) revert InstitutionAlreadyAuthorized();
        
        institutions[_institution].isAuthorized = true;
        
        emit InstitutionAuthorized(_institution, block.timestamp);
    }
    
    /**
     * @dev Deauthorize an institution (only owner)
     */
    function deauthorizeInstitution(address _institution) external onlyOwner {
        if (!registeredInstitutions[_institution]) revert InstitutionNotRegistered();
        if (!institutions[_institution].isAuthorized) revert InstitutionNotAuthorized();
        
        institutions[_institution].isAuthorized = false;
        
        emit InstitutionDeauthorized(_institution, block.timestamp);
    }
    
    /**
     * @dev Issue a certificate (mint NFT)
     */
    function issueCertificate(
        address studentWallet,
        string memory studentName,
        string memory studentID,
        string memory degreeTitle,
        Classification grade,
        string memory duration,
        string memory cgpa,
        Faculty faculty,
        string memory tokenURI
    ) external onlyAuthorizedInstitution returns (uint256) {
        if (studentWallet == address(0)) revert InvalidStudentAddress();
        if (bytes(studentName).length == 0) revert EmptyString();
        if (bytes(tokenURI).length == 0) revert InvalidTokenURI();
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        // Mint NFT to student
        _safeMint(studentWallet, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        // Create certificate record
        certificates[newTokenId] = Certificate({
            studentName: studentName,
            studentID: studentID,
            studentWallet: studentWallet,
            degreeTitle: degreeTitle,
            issueDate: block.timestamp,
            grade: grade,
            duration: duration,
            cgpa: cgpa,
            faculty: faculty,
            issuingInstitution: msg.sender,
            isRevoked: false,
            revocationDate: 0,
            revocationReason: ""
        });
        
        // Update mappings
        studentCertificates[studentWallet].push(newTokenId);
        institutionCertificates[msg.sender].push(newTokenId);
        institutions[msg.sender].totalCertificatesIssued++;
        
        emit CertificateIssued(newTokenId, studentWallet, msg.sender, degreeTitle, block.timestamp);
        
        return newTokenId;
    }
    
    /**
     * @dev Revoke a certificate
     */
    function revokeCertificate(
        uint256 tokenId,
        string memory reason
    ) external certificateExists(tokenId) {
        Certificate storage cert = certificates[tokenId];
        
        if (cert.issuingInstitution != msg.sender && msg.sender != owner) {
            revert NotIssuingInstitution();
        }
        if (cert.isRevoked) revert CertificateAlreadyRevoked();
        if (bytes(reason).length == 0) revert EmptyString();
        
        cert.isRevoked = true;
        cert.revocationDate = block.timestamp;
        cert.revocationReason = reason;
        
        emit CertificateRevoked(tokenId, msg.sender, reason, block.timestamp);
    }
    
    /**
     * @dev Check if certificate is revoked
     */
    function isRevoked(uint256 tokenId) external view certificateExists(tokenId) returns (bool) {
        return certificates[tokenId].isRevoked;
    }
    
    /**
     * @dev Verify certificate and get details
     */
    function verifyCertificate(uint256 tokenId) 
        external 
        view 
        certificateExists(tokenId) 
        returns (Certificate memory certificate, bool isValid) 
    {
        Certificate memory cert = certificates[tokenId];
        bool valid = !cert.isRevoked && _exists(tokenId);
        return (cert, valid);
    }
    
    /**
     * @dev Get all certificates of a student
     */
    function getCertificatesByStudent(address student) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return studentCertificates[student];
    }
    
    /**
     * @dev Get all certificates issued by an institution
     */
    function getCertificatesByInstitution(address institution) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return institutionCertificates[institution];
    }
    
    /**
     * @dev Get institution details
     */
    function getInstitution(address _addr) 
        external 
        view 
        returns (Institution memory) 
    {
        if (!registeredInstitutions[_addr]) revert InstitutionNotRegistered();
        return institutions[_addr];
    }
    
    /**
     * @dev Get certificate details
     */
    function getCertificate(uint256 tokenId) 
        external 
        view 
        certificateExists(tokenId) 
        returns (Certificate memory) 
    {
        return certificates[tokenId];
    }
    
    /**
     * @dev Get total number of certificates issued
     */
    function getTotalCertificatesIssued() external view returns (uint256) {
        return _tokenIds.current();
    }
    
    /**
     * @dev Transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidAddress();
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
    
    /**
     * @dev Check if token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
    
    /**
     * @dev Override transfer functions to prevent transfer of revoked certificates
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        // Allow minting (from == address(0))
        if (from != address(0)) {
            // Prevent transfer of revoked certificates
            if (certificates[tokenId].isRevoked) revert CertificateAlreadyRevoked();
        }
    }
}

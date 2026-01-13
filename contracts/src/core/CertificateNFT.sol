// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "../types/Enums.sol";
import "../types/Structs.sol";
import "../events/Events.sol";
import "../errors/Errors.sol";

/**
 * @title CertificateNFT
 * @dev ERC721-based certificate NFT system for educational institutions
 * @notice This contract implements a soulbound token system for academic certificates
 */
contract CertificateNFT is ERC721URIStorage, Pausable, AccessControlEnumerable, ERC721Holder {
    
    // Role constants
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    // System constants
    uint256 public constant MAX_BATCH_SIZE = 50;
    
    // Counters
    uint256 private _tokenIdCounter;
    uint256 private _templateIdCounter;
    uint256 private _operationIdCounter;
    
    // Core storage mappings
    address[] public institutionAddresses;
    mapping(address => Institution) public institutions;
    mapping(uint256 => Certificate) public certificates;
    mapping(uint256 => CertificateTemplate) public templates;
    mapping(address => uint256[]) public studentCertificates;
    mapping(address => uint256[]) public institutionCertificates;
    mapping(address => bool) public registeredInstitutions;
    
    // Template Management Storage
    mapping(address => uint256[]) public institutionTemplates;
    mapping(uint256 => bool) public activeTemplates;
    
    // Multi-Signature Storage
    uint256 public signatureThreshold = 2;
    mapping(uint256 => MultiSigOperation) public pendingOperations;
    mapping(uint256 => mapping(address => bool)) public operationSignatures;
    mapping(address => bool) public authorizedSigners;
    
    // Analytics Storage
    mapping(string => uint256) public analyticsCounters;
    mapping(uint256 => IssuanceStats) public dailyStats;
    mapping(uint256 => VerificationStats) public verificationStats;
    
    // Verification Enhancement Storage
    mapping(uint256 => string) public verificationCodes;
    mapping(string => uint256) public codeToTokenId;
    mapping(uint256 => VerificationAttempt[]) public verificationHistory;
    mapping(uint256 => uint256) public verificationCounts;
    
    // Role-Based Access Control Storage
    mapping(bytes32 => mapping(uint256 => bool)) public rolePermissions;
    mapping(address => bytes32[]) public userRoles;
    mapping(bytes32 => bool) public validRoles;
    mapping(bytes32 => string) public roleNames;
    
    // Official verification storage
    mapping(uint256 => mapping(address => VerificationStatus)) public officialVerifications;
    
    // Security and audit storage
    mapping(bytes32 => bool) public auditTrail;
    mapping(address => uint256) public lastAccessTime;
    mapping(string => uint256) public securityMetrics;
    
    /**
     * @dev Modifier to restrict access to contract owner
     */
    modifier onlyOwner() {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) revert NotOwner();
        _;
    }
    
    /**
     * @dev Modifier to restrict access to admin role
     */
    modifier onlyAdmin() {
        if (!hasRole(ADMIN_ROLE, msg.sender)) revert AccessDenied(ADMIN_ROLE);
        _;
    }
    
    /**
     * @dev Modifier to restrict access to authorized institutions
     */
    modifier onlyAuthorizedInstitution() {
        if (!institutions[msg.sender].isAuthorized) revert NotAuthorizedInstitution();
        _;
    }
    
    /**
     * @dev Modifier to check if certificate exists
     */
    modifier certificateExists(uint256 tokenId) {
        if (!_exists(tokenId)) revert CertificateDoesNotExist();
        _;
    }
    
    /**
     * @dev Constructor initializes the contract with proper roles
     */
    constructor() ERC721("Educational Certificate", "CERTIFI") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        authorizedSigners[msg.sender] = true;
    }

    /**
     * @dev Pause contract operations (admin only)
     */
    function pause() external onlyAdmin {
        _pause();
    }

    /**
     * @dev Unpause contract operations (admin only)
     */
    function unpause() external onlyAdmin {
        _unpause();
    }
    
    /**
     * @dev Get total number of certificates issued
     */
    function getTotalCertificatesIssued() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Check if token exists
     */
    function _exists(uint256 tokenId) internal view override returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
    
    /**
     * @dev Override _beforeTokenTransfer to implement soulbound characteristics
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
        
        // Allow minting (from == 0) and claiming (from == address(this))
        if (from != address(0) && from != address(this) && to != address(0)) {
            revert SoulboundTokenNoTransfer();
        }

        if (from != address(0)) {
            if (certificates[firstTokenId].isRevoked) revert CertificateAlreadyRevoked();
        }
    }

    /**
     * @dev Override supportsInterface for multiple inheritance
     */
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        virtual 
        override(ERC721URIStorage, AccessControlEnumerable) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }

    // ============ INSTITUTION MANAGEMENT ============
    
    /**
     * @dev Register a new educational institution
     * @param _name Institution name
     * @param _institutionID Unique institution identifier
     * @param _email Contact email
     * @param _country Country of operation
     * @param _institutionType Type of educational institution
     */
    function registerInstitution(
        string memory _name,
        string memory _institutionID,
        string memory _email,
        string memory _country,
        InstitutionType _institutionType
    ) external whenNotPaused {
        if (registeredInstitutions[msg.sender]) revert InstitutionAlreadyRegistered();
        if (bytes(_name).length == 0) revert EmptyString();
        if (bytes(_institutionID).length == 0) revert InvalidInstitutionID();
        
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
        institutionAddresses.push(msg.sender);
        
        emit InstitutionRegistered(msg.sender, _name, _institutionID, block.timestamp);
    }
    
    /**
     * @dev Get institution information
     * @param institutionAddress Address of the institution
     * @return institution Institution data
     * @return templateIds Array of template IDs created by institution
     * @return certificateIds Array of certificate IDs issued by institution
     * @return isRegistered Whether institution is registered
     * @return isAuthorized Whether institution is authorized
     */
    function getInstitutionInfo(address institutionAddress) 
        external 
        view 
        returns (
            Institution memory institution,
            uint256[] memory templateIds,
            uint256[] memory certificateIds,
            bool isRegistered,
            bool isAuthorized
        ) 
    {
        isRegistered = registeredInstitutions[institutionAddress];
        
        if (!isRegistered) {
            return (institution, templateIds, certificateIds, false, false);
        }
        
        institution = institutions[institutionAddress];
        templateIds = institutionTemplates[institutionAddress];
        certificateIds = institutionCertificates[institutionAddress];
        isAuthorized = institution.isAuthorized;
    }
    
    /**
     * @dev Get institution by address
     * @param _addr Institution address
     * @return Institution data
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
     * @dev Get all registered institution addresses
     * @return Array of institution addresses
     */
    function getAllInstitutions() external view returns (address[] memory) {
        return institutionAddresses;
    }
}
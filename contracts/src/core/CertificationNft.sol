// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "../types/Enums.sol";
import "../types/Structs.sol";
import "../events/Events.sol";
import "../errors/Errors.sol";

contract CertificateNFT is ERC721URIStorage, Pausable {
    
    address public owner;
    uint256 private _tokenIdCounter;
    uint256 public constant MAX_BATCH_SIZE = 50;
    
    // Existing storage
    address[] public institutionAddresses;
    mapping(address => Institution) public institutions;
    mapping(uint256 => Certificate) public certificates;
    mapping(address => uint256[]) public studentCertificates;
    mapping(address => uint256[]) public institutionCertificates;
    mapping(address => bool) public registeredInstitutions;
    
    // Template Management Storage
    uint256 private _templateIdCounter;
    mapping(uint256 => CertificateTemplate) public templates;
    mapping(address => uint256[]) public institutionTemplates;
    mapping(uint256 => bool) public activeTemplates;
    
    // Multi-Signature Storage
    uint256 private _operationIdCounter;
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
        authorizedSigners[msg.sender] = true;
    }

    // Template Management Functions
    function createTemplate(
        string memory _name,
        TemplateField[] memory _requiredFields,
        TemplateField[] memory _optionalFields,
        ValidationRule[] memory _validationRules
    ) external onlyAuthorizedInstitution returns (uint256) {
        if (bytes(_name).length == 0) revert EmptyString();
        
        _templateIdCounter++;
        uint256 newTemplateId = _templateIdCounter;
        
        CertificateTemplate storage template = templates[newTemplateId];
        template.id = newTemplateId;
        template.name = _name;
        template.creator = msg.sender;
        template.createdAt = block.timestamp;
        template.version = 1;
        template.isActive = true;
        
        // Store fields and rules
        for (uint256 i = 0; i < _requiredFields.length; i++) {
            template.requiredFields.push(_requiredFields[i]);
        }
        for (uint256 i = 0; i < _optionalFields.length; i++) {
            template.optionalFields.push(_optionalFields[i]);
        }
        for (uint256 i = 0; i < _validationRules.length; i++) {
            template.validationRules.push(_validationRules[i]);
        }
        
        institutionTemplates[msg.sender].push(newTemplateId);
        activeTemplates[newTemplateId] = true;
        
        emit TemplateCreated(newTemplateId, msg.sender, _name, block.timestamp);
        
        return newTemplateId;
    }
    
    function validateAgainstTemplate(uint256 templateId, CertificateData memory data) 
        external 
        view 
        returns (bool) 
    {
        if (!activeTemplates[templateId]) revert TemplateNotActive();
        
        CertificateTemplate storage template = templates[templateId];
        
        // Basic validation - in a real implementation, this would be more comprehensive
        if (bytes(data.studentName).length == 0) return false;
        if (data.studentWallet == address(0)) return false;
        if (bytes(data.degreeTitle).length == 0) return false;
        
        return true;
    }
    
    function getTemplate(uint256 templateId) 
        external 
        view 
        returns (CertificateTemplate memory) 
    {
        if (templates[templateId].id == 0) revert TemplateNotFound();
        return templates[templateId];
    }
    
    function getTemplatesByInstitution(address institution) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return institutionTemplates[institution];
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
    
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
    
    function authorizeInstitution(address _institution) external onlyOwner {
        if (!registeredInstitutions[_institution]) revert InstitutionNotRegistered();
        if (institutions[_institution].isAuthorized) revert InstitutionAlreadyAuthorized();
        
        institutions[_institution].isAuthorized = true;
        
        emit InstitutionAuthorized(_institution, block.timestamp);
    }
    
    function deauthorizeInstitution(address _institution) external onlyOwner {
        if (!registeredInstitutions[_institution]) revert InstitutionNotRegistered();
        if (!institutions[_institution].isAuthorized) revert InstitutionNotAuthorized();
        
        institutions[_institution].isAuthorized = false;
        
        emit InstitutionDeauthorized(_institution, block.timestamp);
    }

    function updateInstitutionDetails(string memory _name, string memory _email, string memory _country) external {
        if (!registeredInstitutions[msg.sender]) revert InstitutionNotRegistered();
        
        institutions[msg.sender].name = _name;
        institutions[msg.sender].email = _email;
        institutions[msg.sender].country = _country;
        
        emit InstitutionDetailsUpdated(msg.sender, _name, _email, block.timestamp);
    }

    function getInstitutionCount() external view returns (uint256) {
        return institutionAddresses.length;
    }

    function _issueCertificate(CertificateData memory data) internal whenNotPaused returns (uint256) {
        if (data.studentWallet == address(0)) revert InvalidStudentAddress();
        if (bytes(data.studentName).length == 0) revert EmptyString();
        if (bytes(data.tokenURI).length == 0) revert InvalidTokenURI();
        
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        
        _safeMint(data.studentWallet, newTokenId);
        _setTokenURI(newTokenId, data.tokenURI);
        
        certificates[newTokenId] = Certificate({
            studentName: data.studentName,
            studentID: data.studentID,
            studentWallet: data.studentWallet,
            degreeTitle: data.degreeTitle,
            issueDate: block.timestamp,
            grade: data.grade,
            duration: data.duration,
            cgpa: data.cgpa,
            faculty: data.faculty,
            issuingInstitution: msg.sender,
            isRevoked: false,
            revocationDate: 0,
            revocationReason: "",
            expirationDate: data.expirationDate
        });
        
        studentCertificates[data.studentWallet].push(newTokenId);
        institutionCertificates[msg.sender].push(newTokenId);
        institutions[msg.sender].totalCertificatesIssued++;
        
        emit CertificateIssued(newTokenId, data.studentWallet, msg.sender, data.degreeTitle, block.timestamp);
        
        return newTokenId;
    }
   
    function issueCertificate(
        CertificateData memory data
    ) external onlyAuthorizedInstitution returns (uint256) {
        return _issueCertificate(data);
    }

    function issueCertificateBatch(
        CertificateData[] calldata dataList
    ) external onlyAuthorizedInstitution {
        if (dataList.length == 0 || dataList.length > MAX_BATCH_SIZE) revert BatchSizeCheckFailed();
        
        for (uint256 i = 0; i < dataList.length; i++) {
            _issueCertificate(dataList[i]);
        }
        
        emit BatchCertificateIssued(msg.sender, dataList.length, block.timestamp);
    }

    function updateTokenURI(uint256 tokenId, string memory newTokenURI) external whenNotPaused {
        if (msg.sender != owner && msg.sender != certificates[tokenId].issuingInstitution) {
            revert NotIssuingInstitution();
        }
        if (bytes(newTokenURI).length == 0) revert InvalidTokenURI();
        _setTokenURI(tokenId, newTokenURI);
        emit MetadataUpdated(tokenId, newTokenURI, block.timestamp);
    }
    
    function batchRevoke(uint256[] calldata tokenIds, string memory reason) external whenNotPaused {
        if (tokenIds.length == 0 || tokenIds.length > MAX_BATCH_SIZE) revert BatchSizeCheckFailed();
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _revokeCertificate(tokenIds[i], reason);
        }
    }

    function revokeCertificate(uint256 tokenId, string memory reason) external whenNotPaused {
        _revokeCertificate(tokenId, reason);
    }

    function _revokeCertificate(uint256 tokenId, string memory reason) internal {
        Certificate storage cert = certificates[tokenId];
        if (!_exists(tokenId)) revert CertificateDoesNotExist();
        if (cert.issuingInstitution != msg.sender && msg.sender != owner) revert NotIssuingInstitution();
        if (cert.isRevoked) revert CertificateAlreadyRevoked();
        if (bytes(reason).length == 0) revert EmptyString();

        cert.isRevoked = true;
        cert.revocationDate = block.timestamp;
        cert.revocationReason = reason;

        emit CertificateRevoked(tokenId, msg.sender, reason, block.timestamp);
    }
    
    function isRevoked(uint256 tokenId) external view certificateExists(tokenId) returns (bool) {
        return certificates[tokenId].isRevoked;
    }

    function verifyCertificate(uint256 tokenId) 
        external 
        view 
        certificateExists(tokenId) 
        returns (Certificate memory certificate, bool isValid) 
    {
        Certificate memory cert = certificates[tokenId];
        bool valid = !cert.isRevoked && _exists(tokenId) && (cert.expirationDate == 0 || block.timestamp < cert.expirationDate);
        return (cert, valid);
    }
    
    function getCertificatesByRange(uint256 start, uint256 end) external view returns (Certificate[] memory) {
        if (start > end || end > _tokenIdCounter) revert InvalidIndex();
        uint256 size = end - start + 1;
        Certificate[] memory result = new Certificate[](size);
        for (uint256 i = 0; i < size; i++) {
            result[i] = certificates[start + i];
        }
        return result;
    }

    function getCertificatesByStudent(address student) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return studentCertificates[student];
    }
    
    function getCertificatesByInstitution(address institution) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return institutionCertificates[institution];
    }
    
    function getInstitution(address _addr) 
        external 
        view 
        returns (Institution memory) 
    {
        if (!registeredInstitutions[_addr]) revert InstitutionNotRegistered();
        return institutions[_addr];
    }

    function getCertificate(uint256 tokenId) 
        external 
        view 
        certificateExists(tokenId) 
        returns (Certificate memory) 
    {
        return certificates[tokenId];
    }

    function getTotalCertificatesIssued() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidAddress();
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
  
    function _exists(uint256 tokenId) internal view override returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
        
        if (from != address(0) && to != address(0)) {
            revert SoulboundTokenNoTransfer();
        }

        if (from != address(0)) {
            if (certificates[firstTokenId].isRevoked) revert CertificateAlreadyRevoked();
        }
    }
}

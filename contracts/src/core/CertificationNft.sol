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
    
    // Multi-Signature Storage
    uint256 public signatureThreshold = 2;
    mapping(uint256 => MultiSigOperation) public pendingOperations;
    mapping(uint256 => mapping(address => bool)) public operationSignatures;
    mapping(address => bool) public authorizedSigners;
    mapping(address => uint256[]) public institutionTemplates;
    mapping(uint256 => bool) public activeTemplates;
    mapping(uint256 => VerificationRequest) public verificationRequests;
    uint256 private _requestIdCounter;

    /**
     * @dev Getter for verification requests to match test expectations
     */
    function verificationRequests(uint256 requestId) external view returns (VerificationRequest memory) {
        return _verificationRequests[requestId];
    }
    
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
    mapping(uint256 => VerificationRequest) internal _verificationRequests;
    uint256 private _requestIdCounter;

    /**
     * @dev Getter for verification requests to match test expectations
     */
    function verificationRequests(uint256 requestId) external view returns (VerificationRequest memory) {
        return _verificationRequests[requestId];
    }
    
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
     * @dev Emergency function to get contract owner
     * @return Current contract owner (first admin)
     */
    function owner() public view returns (address) {
        if (getRoleMemberCount(DEFAULT_ADMIN_ROLE) == 0) return address(0);
        return getRoleMember(DEFAULT_ADMIN_ROLE, 0);
    }
    /**
     * @dev Check if token exists
     */
    function _exists(uint256 tokenId) internal view override returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /**
     * @dev Transfer ownership to another address
     * @param newOwner Address of new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, newOwner);
        _grantRole(ADMIN_ROLE, newOwner);
        _revokeRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _revokeRole(ADMIN_ROLE, msg.sender);
        authorizedSigners[newOwner] = true;
        authorizedSigners[msg.sender] = false;
        emit OwnershipTransferred(msg.sender, newOwner);
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
    
    /**
     * @dev Authorize a registered institution to issue certificates
     * @param _institution Address of the institution to authorize
     */
    function authorizeInstitution(address _institution) external onlyAdmin {
        if (!registeredInstitutions[_institution]) revert InstitutionNotRegistered();
        if (institutions[_institution].isAuthorized) revert InstitutionAlreadyAuthorized();
        
        institutions[_institution].isAuthorized = true;
        _grantRole(ISSUER_ROLE, _institution);
        
        // Log security event
        logSecurityEvent("institution_authorized", msg.sender, abi.encodePacked(_institution));
        
        emit InstitutionAuthorized(_institution, block.timestamp);
    }
    
    /**
     * @dev Deauthorize an institution from issuing certificates
     * @param _institution Address of the institution to deauthorize
     */
    function deauthorizeInstitution(address _institution) external onlyAdmin {
        if (!registeredInstitutions[_institution]) revert InstitutionNotRegistered();
        if (!institutions[_institution].isAuthorized) revert InstitutionNotAuthorized();
        
        institutions[_institution].isAuthorized = false;
        _revokeRole(ISSUER_ROLE, _institution);
        
        // Log security event
        logSecurityEvent("institution_deauthorized", msg.sender, abi.encodePacked(_institution));
        
        emit InstitutionDeauthorized(_institution, block.timestamp);
    }
    
    /**
     * @dev Check if an institution is authorized
     * @param _institution Address to check
     * @return True if institution is authorized
     */
    function isInstitutionAuthorized(address _institution) external view returns (bool) {
        return registeredInstitutions[_institution] && institutions[_institution].isAuthorized;
    }
    
    // ============ SECURITY AND AUDIT ============
    
    /**
     * @dev Log security events for audit trail
     * @param eventType Type of security event
     * @param actor Address performing the action
     * @param eventData Additional event data
     */
    function logSecurityEvent(
        string memory eventType,
        address actor,
        bytes memory eventData
    ) internal {
        bytes32 eventHash = keccak256(abi.encodePacked(
            eventType,
            actor,
            eventData,
            block.timestamp
        ));
        
        auditTrail[eventHash] = true;
        lastAccessTime[actor] = block.timestamp;
        securityMetrics[eventType]++;
        
        emit AnalyticsUpdated(eventType, securityMetrics[eventType], block.timestamp);
    }
    
    // ============ TEMPLATE MANAGEMENT ============
    
    /**
     * @dev Create a new certificate template
     * @param _name Template name
     * @param _requiredFields Array of required fields
     * @param _optionalFields Array of optional fields
     * @param _validationRules Array of validation rules
     * @return Template ID
     */
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
    
    /**
     * @dev Validate certificate data against a template
     * @param templateId Template ID to validate against
     * @param data Certificate data to validate
     * @return True if validation passes
     */
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
    
    /**
     * @dev Get template information
     * @param templateId Template ID
     * @return template Template data
     * @return exists Whether template exists
     * @return isActive Whether template is active
     * @return usageCount Number of certificates using this template
     */
    function getTemplateInfo(uint256 templateId) 
        external 
        view 
        returns (
            CertificateTemplate memory template,
            bool exists,
            bool isActive,
            uint256 usageCount
        ) 
    {
        exists = templates[templateId].id != 0;
        
        if (!exists) {
            return (template, false, false, 0);
        }
        
        template = templates[templateId];
        isActive = activeTemplates[templateId];
        
        // Count how many certificates use this template
        usageCount = 0;
        for (uint256 i = 1; i <= _tokenIdCounter; i++) {
            if (certificates[i].templateId == templateId) {
                usageCount++;
            }
        }
    }
    
    /**
     * @dev Get template by ID
     * @param templateId Template ID
     * @return Template data
     */
    function getTemplate(uint256 templateId) 
        external 
        view 
        returns (CertificateTemplate memory) 
    {
        if (templates[templateId].id == 0) revert TemplateNotFound();
        return templates[templateId];
    }
    
    /**
     * @dev Get templates created by an institution
     * @param institution Institution address
     * @return Array of template IDs
     */
    function getTemplatesByInstitution(address institution) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return institutionTemplates[institution];
    }
    
    /**
     * @dev Toggle template active status
     * @param templateId Template ID to toggle
     */
    function toggleTemplate(uint256 templateId) external {
        if (templates[templateId].creator != msg.sender && !hasRole(ADMIN_ROLE, msg.sender)) {
            revert AccessDenied(ADMIN_ROLE);
        }
        
        activeTemplates[templateId] = !activeTemplates[templateId];
        emit TemplateUpdated(templateId, activeTemplates[templateId]);
    }
    
    // ============ CERTIFICATE ISSUANCE ============
    
    /**
     * @dev Internal function to issue a certificate
     * @param data Certificate data
     * @return Token ID of the issued certificate
     */
    function _issueCertificate(CertificateData memory data) internal whenNotPaused returns (uint256) {
        if (data.studentWallet == address(0) && !data.isClaimable) revert InvalidStudentAddress();
        if (bytes(data.studentName).length == 0) revert EmptyString();
        if (bytes(data.degreeTitle).length == 0) revert EmptyString();
        
        string memory finalTokenURI = data.tokenURI;
        if (data.templateId != 0) {
            CertificateTemplate storage template = templates[data.templateId];
            if (!template.isActive) revert TemplateNotActive();
            // Validate against template
            if (!this.validateAgainstTemplate(data.templateId, data)) {
                revert TemplateValidationFailed();
            }
        }
        
        if (bytes(finalTokenURI).length == 0) revert InvalidTokenURI();
        
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        
        // If claimable, mint to contract, otherwise mint to student
        address recipient = data.isClaimable ? address(this) : data.studentWallet;
        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, finalTokenURI);
        
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
            expirationDate: data.expirationDate,
            templateId: data.templateId,
            version: 1,
            isClaimable: data.isClaimable,
            isClaimed: false,
            claimHash: data.claimHash,
            renewalOf: 0
        });
        
        // Generate verification code
        string memory verificationCode = generateVerificationCode(newTokenId);
        verificationCodes[newTokenId] = verificationCode;
        codeToTokenId[verificationCode] = newTokenId;
        
        studentCertificates[data.studentWallet].push(newTokenId);
        institutionCertificates[msg.sender].push(newTokenId);
        institutions[msg.sender].totalCertificatesIssued++;
        
        // Update analytics
        updateAnalytics("totalCertificatesIssued", 1);
        updateAnalytics("certificatesThisMonth", 1);
        
        // Log security event
        logSecurityEvent("certificate_issued", msg.sender, abi.encodePacked(newTokenId));
        
        emit CertificateIssued(newTokenId, data.studentWallet, msg.sender, data.degreeTitle, block.timestamp);
        emit VerificationCodeGenerated(newTokenId, verificationCode, block.timestamp);
        
        return newTokenId;
    }
    
    /**
     * @dev Generate a unique verification code for a certificate
     * @param tokenId Token ID
     * @return Verification code string
     */
    function generateVerificationCode(uint256 tokenId) 
        public 
        view 
        certificateExists(tokenId) 
        returns (string memory) 
    {
        // Generate a unique verification code based on token ID and block data
        bytes32 hash = keccak256(abi.encodePacked(tokenId, block.timestamp, address(this)));
        return string(abi.encodePacked("CERT-", _toHexString(uint256(hash))));
    }
    
    /**
     * @dev Convert uint256 to hex string
     * @param value Value to convert
     * @return Hex string representation
     */
    function _toHexString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 16;
        }
        
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 16)));
            value /= 16;
        }
        
        return string(buffer);
    }
    
    /**
     * @dev Update analytics counters
     * @param metricType Type of metric
     * @param value Value to add
     */
    function updateAnalytics(string memory metricType, uint256 value) internal {
        analyticsCounters[metricType] += value;
        emit AnalyticsUpdated(metricType, analyticsCounters[metricType], block.timestamp);
    }
    
    /**
     * @dev Issue a single certificate (public interface)
     * @param data Certificate data
     * @return Token ID of the issued certificate
     */
    function issueCertificate(
        CertificateData memory data
    ) external onlyAuthorizedInstitution returns (uint256) {
        return _issueCertificate(data);
    }
    
    /**
     * @dev Get certificate information
     * @param tokenId Token ID
     * @return certificate Certificate data
     * @return exists Whether certificate exists
     * @return isValid Whether certificate is valid (not revoked, not expired)
     * @return verificationCode Verification code for the certificate
     * @return verificationCount Number of times certificate has been verified
     */
    function getCertificateInfo(uint256 tokenId) 
        external 
        view 
        returns (
            Certificate memory certificate,
            bool exists,
            bool isValid,
            string memory verificationCode,
            uint256 verificationCount
        ) 
    {
        exists = _exists(tokenId);
        
        if (!exists) {
            return (certificate, false, false, "", 0);
        }
        
        certificate = certificates[tokenId];
        verificationCode = verificationCodes[tokenId];
        verificationCount = verificationCounts[tokenId];
        
        isValid = !certificate.isRevoked && 
                  (certificate.expirationDate == 0 || block.timestamp < certificate.expirationDate);
    }
    
    /**
     * @dev Get certificate by token ID
     * @param tokenId Token ID
     * @return Certificate data
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
     * @dev Get certificates owned by a student
     * @param student Student address
     * @return Array of token IDs
     */
    function getCertificatesByStudent(address student) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return studentCertificates[student];
    }
    
    /**
     * @dev Get certificates issued by an institution
     * @param institution Institution address
     * @return Array of token IDs
     */
    function getCertificatesByInstitution(address institution) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return institutionCertificates[institution];
    }
    
    // ============ BATCH OPERATIONS ============
    
    /**
     * @dev Issue certificates in batch
     * @param dataList Array of certificate data
     */
    function issueCertificateBatch(
        CertificateData[] calldata dataList
    ) external onlyAuthorizedInstitution {
        if (dataList.length == 0 || dataList.length > MAX_BATCH_SIZE) revert BatchSizeCheckFailed();
        
        for (uint256 i = 0; i < dataList.length; i++) {
            _issueCertificate(dataList[i]);
        }
        
        emit BatchCertificateIssued(msg.sender, dataList.length, block.timestamp);
    }
    
    /**
     * @dev Issue certificates in batch with optimization
     * @param dataList Array of certificate data
     */
    function issueCertificateBatchOptimized(
        CertificateData[] calldata dataList
    ) external onlyAuthorizedInstitution {
        if (dataList.length == 0) revert BatchSizeCheckFailed();
        
        uint256 processed = 0;
        uint256 chunkSize = dataList.length > MAX_BATCH_SIZE ? MAX_BATCH_SIZE : dataList.length;
        
        for (uint256 i = 0; i < dataList.length; i += chunkSize) {
            uint256 end = i + chunkSize > dataList.length ? dataList.length : i + chunkSize;
            
            for (uint256 j = i; j < end; j++) {
                _issueCertificate(dataList[j]);
                processed++;
            }
        }
        
        // Update analytics
        analyticsCounters["totalBatchOperations"]++;
        analyticsCounters["totalCertificatesInBatches"] += processed;
        
        emit BatchCertificateIssued(msg.sender, processed, block.timestamp);
    }
    
    /**
     * @dev Estimate gas cost for batch operation
     * @param dataList Array of certificate data
     * @return Estimated gas cost
     */
    function estimateBatchGas(CertificateData[] calldata dataList) 
        external 
        view 
        returns (uint256) 
    {
        // Simplified gas estimation - in production, this would be more sophisticated
        uint256 baseGasPerCertificate = 150000; // Estimated gas per certificate
        uint256 batchOverhead = 50000; // Fixed overhead for batch operation
        
        return (dataList.length * baseGasPerCertificate) + batchOverhead;
    }
    
    /**
     * @dev Process batch in chunks
     * @param dataList Array of certificate data
     * @param chunkSize Size of each chunk
     */
    function processBatchInChunks(
        CertificateData[] calldata dataList,
        uint256 chunkSize
    ) external onlyAuthorizedInstitution {
        if (dataList.length == 0) revert BatchSizeCheckFailed();
        if (chunkSize == 0 || chunkSize > MAX_BATCH_SIZE) revert InvalidIndex();
        
        uint256 totalProcessed = 0;
        
        for (uint256 i = 0; i < dataList.length; i += chunkSize) {
            uint256 end = i + chunkSize > dataList.length ? dataList.length : i + chunkSize;
            
            for (uint256 j = i; j < end; j++) {
                _issueCertificate(dataList[j]);
                totalProcessed++;
            }
            
            // Emit chunk completion event
            emit BatchCertificateIssued(msg.sender, end - i, block.timestamp);
        }
        
        // Update analytics
        analyticsCounters["totalChunkedOperations"]++;
        analyticsCounters["totalCertificatesInChunks"] += totalProcessed;
    }
    
    // ============ CERTIFICATE CLAIMING ============
    
    /**
     * @dev Claim a certificate using claim code
     * @param tokenId Token ID of the certificate to claim
     * @param claimCode Claim code provided by the institution
     */
    function claimCertificate(uint256 tokenId, string calldata claimCode) external {
        Certificate storage cert = certificates[tokenId];
        if (!cert.isClaimable) revert NotClaimable();
        if (cert.isClaimed) revert CertificateAlreadyClaimed();
        if (keccak256(abi.encodePacked(claimCode)) != cert.claimHash) revert InvalidClaimCode();
        
        cert.isClaimed = true;
        cert.studentWallet = msg.sender;
        _transfer(address(this), msg.sender, tokenId);
        
        // Update student certificates array if not already present
        bool alreadyInArray = false;
        uint256[] storage studentCerts = studentCertificates[msg.sender];
        for (uint256 i = 0; i < studentCerts.length; i++) {
            if (studentCerts[i] == tokenId) {
                alreadyInArray = true;
                break;
            }
        }
        if (!alreadyInArray) {
            studentCertificates[msg.sender].push(tokenId);
        }
        
        // Update analytics
        updateAnalytics("totalCertificatesClaimed", 1);
        
        // Log security event
        logSecurityEvent("certificate_claimed", msg.sender, abi.encodePacked(tokenId));
        
        emit CertificateClaimed(tokenId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Check if a certificate is claimable
     * @param tokenId Token ID to check
     * @return isClaimable Whether certificate can be claimed
     * @return isClaimed Whether certificate has been claimed
     * @return currentOwner Current owner of the certificate
     */
    function getClaimStatus(uint256 tokenId) 
        external 
        view 
        certificateExists(tokenId) 
        returns (bool isClaimable, bool isClaimed, address currentOwner) 
    {
        Certificate memory cert = certificates[tokenId];
        isClaimable = cert.isClaimable;
        isClaimed = cert.isClaimed;
        currentOwner = ownerOf(tokenId);
    }
    
    /**
     * @dev Get all claimable certificates for a student
     * @param studentWallet Student wallet address
     * @return Array of claimable token IDs
     */
    function getClaimableCertificates(address studentWallet) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory allCerts = studentCertificates[studentWallet];
        uint256 claimableCount = 0;
        
        // First pass: count claimable certificates
        for (uint256 i = 0; i < allCerts.length; i++) {
            Certificate memory cert = certificates[allCerts[i]];
            if (cert.isClaimable && !cert.isClaimed) {
                claimableCount++;
            }
        }
        
        // Second pass: collect claimable certificates
        uint256[] memory claimableCerts = new uint256[](claimableCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allCerts.length; i++) {
            Certificate memory cert = certificates[allCerts[i]];
            if (cert.isClaimable && !cert.isClaimed) {
                claimableCerts[index] = allCerts[i];
                index++;
            }
        }
        
        return claimableCerts;
    }
    
    // ============ CERTIFICATE REVOCATION ============
    
    /**
     * @dev Revoke a certificate
     * @param tokenId Token ID to revoke
     * @param reason Reason for revocation
     */
    function revokeCertificate(uint256 tokenId, string memory reason) external whenNotPaused {
        _revokeCertificate(tokenId, reason);
    }
    
    /**
     * @dev Revoke multiple certificates in batch
     * @param tokenIds Array of token IDs to revoke
     * @param reason Reason for revocation
     */
    function batchRevoke(uint256[] calldata tokenIds, string memory reason) external whenNotPaused {
        if (tokenIds.length == 0 || tokenIds.length > MAX_BATCH_SIZE) revert BatchSizeCheckFailed();
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _revokeCertificate(tokenIds[i], reason);
        }
    }
    
    /**
     * @dev Internal function to revoke a certificate
     * @param tokenId Token ID to revoke
     * @param reason Reason for revocation
     */
    function _revokeCertificate(uint256 tokenId, string memory reason) internal {
        Certificate storage cert = certificates[tokenId];
        if (!_exists(tokenId)) revert CertificateDoesNotExist();
        if (cert.issuingInstitution != msg.sender && !hasRole(ADMIN_ROLE, msg.sender)) {
            revert NotIssuingInstitution();
        }
        if (cert.isRevoked) revert CertificateAlreadyRevoked();
        if (bytes(reason).length == 0) revert EmptyString();

        cert.isRevoked = true;
        cert.revocationDate = block.timestamp;
        cert.revocationReason = reason;

        // Update analytics
        updateAnalytics("totalRevocations", 1);
        updateAnalytics("revocationsThisMonth", 1);
        
        // Log security event
        logSecurityEvent("certificate_revoked", msg.sender, abi.encodePacked(tokenId, reason));

        emit CertificateRevoked(tokenId, msg.sender, reason, block.timestamp);
    }
    
    /**
     * @dev Check if a certificate is revoked
     * @param tokenId Token ID to check
     * @return True if certificate is revoked
     */
    function isRevoked(uint256 tokenId) external view certificateExists(tokenId) returns (bool) {
        return certificates[tokenId].isRevoked;
    }
    
    /**
     * @dev Get revocation information
     * @param tokenId Token ID to check
     * @return _isRevoked Whether certificate is revoked
     * @return revocationDate Timestamp of revocation
     * @return revocationReason Reason for revocation
     */
    function getRevocationInfo(uint256 tokenId) 
        external 
        view 
        certificateExists(tokenId) 
        returns (bool _isRevoked, uint256 revocationDate, string memory revocationReason) 
    {
        Certificate memory cert = certificates[tokenId];
        return (cert.isRevoked, cert.revocationDate, cert.revocationReason);
        
        
    }
    
    // ============ CERTIFICATE VERIFICATION ============
    
    /**
     * @dev Verify a certificate by token ID
     * @param tokenId Token ID to verify
     * @return certificate Certificate data
     * @return isValid Whether certificate is valid
     */
    function verifyCertificate(uint256 tokenId) 
        external 
        view 
        certificateExists(tokenId) 
        returns (Certificate memory certificate, bool isValid) 
    {
        Certificate memory cert = certificates[tokenId];
        bool valid = !cert.isRevoked && (cert.expirationDate == 0 || block.timestamp < cert.expirationDate);
        return (cert, valid);
    }
    
    /**
     * @dev Verify certificate by verification code
     * @param code Verification code
     * @return Verification result
     */
    function verifyByCode(string memory code) 
        external 
        view 
        returns (VerificationResult memory) 
    {
        uint256 tokenId = codeToTokenId[code];
        
        VerificationResult memory result;
        result.verificationCode = code;
        result.verificationTime = block.timestamp;
        
        if (tokenId == 0) {
            result.isValid = false;
            result.exists = false;
            return result;
        }
        
        result.tokenId = tokenId;
        result.exists = true;
        
        Certificate memory cert = certificates[tokenId];
        result.return (cert.isRevoked, cert.revocationDate, cert.revocationReason);
        result.isExpired = cert.expirationDate != 0 && block.timestamp >= cert.expirationDate;
        result.isValid = !result.isRevoked && !result.isExpired;
        
        return result;
    }
    
    /**
     * @dev Record a verification attempt
     * @param tokenId Token ID being verified
     * @param verifier Address performing verification
     * @param successful Whether verification was successful
     * @param method Verification method used
     */
    function recordVerificationAttempt(
        uint256 tokenId, 
        address verifier, 
        bool successful, 
        string memory method
    ) external {
        if (!_exists(tokenId)) revert CertificateDoesNotExist();
        
        VerificationAttempt memory attempt = VerificationAttempt({
            timestamp: block.timestamp,
            verifier: verifier,
            successful: successful,
            method: method
        });
        
        verificationHistory[tokenId].push(attempt);
        verificationCounts[tokenId]++;
        
        updateAnalytics("totalVerifications", 1);
        if (successful) {
            updateAnalytics("successfulVerifications", 1);
        }
        
        emit CertificateVerified(tokenId, verifier, method, successful, block.timestamp);
    }
    
    /**
     * @dev Get verification history for a certificate
     * @param tokenId Token ID
     * @return Array of verification attempts
     */
    function getVerificationHistory(uint256 tokenId) 
        external 
        view 
        certificateExists(tokenId) 
        returns (VerificationAttempt[] memory) 
    {
        return verificationHistory[tokenId];
    }
    
    /**
     * @dev Official verification by authorized verifier
     * @param tokenId Token ID to verify
     * @param status Verification status
     */
    function officiallyVerify(uint256 tokenId, bool status) external {
        if (!hasRole(VERIFIER_ROLE, msg.sender)) revert AccessDenied(VERIFIER_ROLE);
        if (!_exists(tokenId)) revert CertificateDoesNotExist();
        
        officialVerifications[tokenId][msg.sender] = status ? VerificationStatus.Verified : VerificationStatus.Rejected;
        
        emit OfficialVerification(tokenId, msg.sender, status, block.timestamp);
    }
    /**
     * @dev Request official verification for a certificate
     * @param tokenId Token ID to verify
     * @param reason Reason for verification request
     * @return Request ID
     */
    function requestCertificateVerification(uint256 tokenId, string memory reason) 
        external 
        certificateExists(tokenId) 
        returns (uint256) 
    {
        _requestIdCounter++;
        uint256 requestId = _requestIdCounter;
        
        _verificationRequests[requestId] = VerificationRequest({
            id: requestId,
            tokenId: tokenId,
            requester: msg.sender,
            reason: reason,
            requestedAt: block.timestamp,
            processed: false
        });
        
        return requestId;
    }
    
    /**
     * @dev Get official verification status
     * @param tokenId Token ID
     * @param verifier Verifier address
     * @return Verification status
     */
    function getOfficialVerification(uint256 tokenId, address verifier) 
        external 
        view 
        certificateExists(tokenId) 
        returns (VerificationStatus) 
    {
        return officialVerifications[tokenId][verifier];
    }
    
    // ============ SOULBOUND TOKEN UTILITIES ============
    
    /**
     * @dev Check if a token transfer is allowed
     * @param from Source address
     * @param to Destination address
     * @param tokenId Token ID
     * @return True if transfer is allowed
     */
    function isTransferAllowed(address from, address to, uint256 tokenId) 
        external 
        view 
        certificateExists(tokenId) 
        returns (bool) 
    {
        // Allow minting (from == 0) and claiming (from == address(this))
        if (from == address(0) || from == address(this)) {
            return true;
        }
        
        // Block all other transfers for soulbound characteristics
        return false;
    }
    
    /**
     * @dev Get token transfer restrictions info
     * @param tokenId Token ID
     * @return isSoulbound Whether token is soulbound
     * @return canTransfer Whether token can be transferred
     * @return currentOwner Current owner address
     */
    function getTransferInfo(uint256 tokenId) 
        external 
        view 
        certificateExists(tokenId) 
        returns (bool isSoulbound, bool canTransfer, address currentOwner) 
    {
        currentOwner = ownerOf(tokenId);
        isSoulbound = true; // All certificates are soulbound
        canTransfer = false; // Transfers are not allowed except minting/claiming
    }
    
    // ============ ANALYTICS AND REPORTING ============
    
    /**
     * @dev Get issuance statistics for a time period
     * @param fromTime Start timestamp
     * @param toTime End timestamp
     * @return Issuance statistics
     */
    function getIssuanceStats(uint256 fromTime, uint256 toTime) 
        external 
        view 
        returns (IssuanceStats memory) 
    {
        if (fromTime > toTime) revert InvalidTimeRange();
        
        IssuanceStats memory stats;
        stats.totalIssued = _tokenIdCounter;
        stats.periodStart = fromTime;
        stats.periodEnd = toTime;
        
        // Count revoked certificates
        uint256 revokedCount = 0;
        for (uint256 i = 1; i <= _tokenIdCounter; i++) {
            if (certificates[i].isRevoked) {
                revokedCount++;
            }
        }
        
        stats.totalRevoked = revokedCount;
        stats.activeCount = stats.totalIssued - stats.totalRevoked;
        
        return stats;
    }
    
    /**
     * @dev Get verification statistics for a time period
     * @param fromTime Start timestamp
     * @param toTime End timestamp
     * @return Verification statistics
     */
    function getVerificationStats(uint256 fromTime, uint256 toTime) 
        external 
        view 
        returns (VerificationStats memory) 
    {
        if (fromTime > toTime) revert InvalidTimeRange();
        
        VerificationStats memory stats;
        stats.totalVerifications = analyticsCounters["totalVerifications"];
        stats.uniqueVerifications = analyticsCounters["uniqueVerifications"];
        stats.periodStart = fromTime;
        stats.periodEnd = toTime;
        
        if (stats.uniqueVerifications > 0) {
            stats.averageVerificationsPerCertificate = stats.totalVerifications / stats.uniqueVerifications;
        }
        
        return stats;
    }
    
    /**
     * @dev Generate a comprehensive report
     * @param reportType Type of report to generate
     * @param periodStart Start of reporting period
     * @param periodEnd End of reporting period
     * @return Encoded report data
     */
    function generateReport(string memory reportType, uint256 periodStart, uint256 periodEnd) 
        external 
        view 
        returns (bytes memory) 
    {
        if (periodStart > periodEnd) revert InvalidTimeRange();
        
        // Generate basic report data
        IssuanceStats memory issuanceStats = this.getIssuanceStats(periodStart, periodEnd);
        VerificationStats memory verificationStats = this.getVerificationStats(periodStart, periodEnd);
        
        // In a real implementation, this would format the data appropriately
        bytes memory reportData = abi.encode(issuanceStats, verificationStats);
        
        emit ReportGenerated(reportType, periodStart, periodEnd, block.timestamp);
        
        return reportData;
    }
    
    /**
     * @dev Get analytics counter value
     * @param metricType Type of metric
     * @return Current counter value
     */
    function getAnalyticsCounter(string memory metricType) external view returns (uint256) {
        return analyticsCounters[metricType];
    }
    
    /**
     * @dev Get system status overview
     * @return totalCertificates Total certificates issued
     * @return totalInstitutions Total registered institutions
     * @return totalTemplates Total templates created
     * @return contractPaused Whether contract is paused
     */
    function getSystemStatus() 
        external 
        view 
        returns (
            uint256 totalCertificates,
            uint256 totalInstitutions,
            uint256 totalTemplates,
            bool contractPaused
        ) 
    {
        totalCertificates = _tokenIdCounter;
        totalInstitutions = institutionAddresses.length;
        totalTemplates = _templateIdCounter;
        contractPaused = paused();
    }
    
    // ============ CERTIFICATE LIFECYCLE MANAGEMENT ============
    
    /**
     * @dev Check certificate expiration status
     * @param tokenId Token ID to check
     * @return isExpired Whether certificate is expired
     * @return expirationDate Expiration timestamp
     * @return daysUntilExpiration Days until expiration (0 if expired)
     */
    function checkCertificateExpiration(uint256 tokenId) 
        external 
        view 
        certificateExists(tokenId) 
        returns (bool isExpired, uint256 expirationDate, uint256 daysUntilExpiration) 
    {
        Certificate memory cert = certificates[tokenId];
        
        if (cert.expirationDate == 0) {
            return (false, 0, type(uint256).max);
        }
        
        isExpired = block.timestamp >= cert.expirationDate;
        expirationDate = cert.expirationDate;
        
        if (!isExpired) {
            daysUntilExpiration = (cert.expirationDate - block.timestamp) / 1 days;
        } else {
            daysUntilExpiration = 0;
        }
    }
    
    /**
     * @dev Update certificate metadata URI
     * @param tokenId Token ID
     * @param newTokenURI New metadata URI
     */
    function updateTokenURI(uint256 tokenId, string memory newTokenURI) external whenNotPaused {
        Certificate storage cert = certificates[tokenId];
        if (msg.sender != cert.issuingInstitution && !hasRole(ADMIN_ROLE, msg.sender)) {
            revert NotIssuingInstitution();
        }
        if (bytes(newTokenURI).length == 0) revert InvalidTokenURI();
        
        cert.version++;
        _setTokenURI(tokenId, newTokenURI);
        
        emit MetadataVersioned(tokenId, cert.version, newTokenURI);
    }
    
    /**
     * @dev Get certificates by range
     * @param start Start token ID
     * @param end End token ID
     * @return Array of certificates
     */
    function getCertificatesByRange(uint256 start, uint256 end) external view returns (Certificate[] memory) {
        if (start > end || end > _tokenIdCounter) revert InvalidIndex();
        uint256 size = end - start + 1;
        Certificate[] memory result = new Certificate[](size);
        for (uint256 i = 0; i < size; i++) {
            result[i] = certificates[start + i];
        }
        return result;
    }
    
    /**
     * @dev Validate certificate data
     * @param data Certificate data to validate
     * @return isValid Whether data is valid
     * @return errors Array of validation errors
     */
    function validateCertificateData(CertificateData memory data) 
        external 
        pure 
        returns (bool isValid, string[] memory errors) 
    {
        string[] memory errorList = new string[](10);
        uint256 errorCount = 0;
        
        if (data.studentWallet == address(0)) {
            errorList[errorCount] = "Invalid student wallet address";
            errorCount++;
        }
        
        if (bytes(data.studentName).length == 0) {
            errorList[errorCount] = "Student name cannot be empty";
            errorCount++;
        }
        
        if (bytes(data.degreeTitle).length == 0) {
            errorList[errorCount] = "Degree title cannot be empty";
            errorCount++;
        }
        
        if (bytes(data.tokenURI).length == 0) {
            errorList[errorCount] = "Token URI cannot be empty";
            errorCount++;
        }
        
        // Resize errors array to actual count
        string[] memory finalErrors = new string[](errorCount);
        for (uint256 i = 0; i < errorCount; i++) {
            finalErrors[i] = errorList[i];
        }
        
        return (errorCount == 0, finalErrors);
    }
    
    // ============ ADDITIONAL UTILITIES ============
    
    /**
     * @dev Generate audit report for security events
     * @param fromTime Start timestamp
     * @param toTime End timestamp
     * @return Encoded audit data
     */
    function generateAuditReport(uint256 fromTime, uint256 toTime) 
        external 
        view 
        returns (bytes memory) 
    {
        if (fromTime > toTime) revert InvalidTimeRange();
        
        // Collect audit data
        uint256 totalCertificates = _tokenIdCounter;
        uint256 totalInstitutions = institutionAddresses.length;
        uint256 totalTemplates = _templateIdCounter;
        
        // Security metrics
        uint256 totalVerifications = securityMetrics["verification"];
        uint256 totalRevocations = securityMetrics["revocation"];
        uint256 totalAmendments = securityMetrics["amendment"];
        
        // Encode audit report
        bytes memory auditData = abi.encode(
            totalCertificates,
            totalInstitutions,
            totalTemplates,
            totalVerifications,
            totalRevocations,
            totalAmendments,
            fromTime,
            toTime,
            block.timestamp
        );
        
        return auditData;
    }
    
    /**
     * @dev Validate data integrity for a certificate
     * @param tokenId Token ID to validate
     * @return isValid Whether certificate data is valid
     * @return issues Array of integrity issues found
     */
    function validateDataIntegrity(uint256 tokenId) 
        external 
        view 
        certificateExists(tokenId) 
        returns (bool isValid, string[] memory issues) 
    {
        Certificate memory cert = certificates[tokenId];
        string[] memory issueList = new string[](5);
        uint256 issueCount = 0;
        
        // Check basic data integrity
        if (cert.studentWallet == address(0)) {
            issueList[issueCount] = "Invalid student wallet";
            issueCount++;
        }
        
        if (bytes(cert.studentName).length == 0) {
            issueList[issueCount] = "Empty student name";
            issueCount++;
        }
        
        if (cert.issuingInstitution == address(0)) {
            issueList[issueCount] = "Invalid issuing institution";
            issueCount++;
        }
        
        if (!registeredInstitutions[cert.issuingInstitution]) {
            issueList[issueCount] = "Institution not registered";
            issueCount++;
        }
        
        // Resize issues array
        string[] memory finalIssues = new string[](issueCount);
        for (uint256 i = 0; i < issueCount; i++) {
            finalIssues[i] = issueList[i];
        }
        
        return (issueCount == 0, finalIssues);
    }
    
    /**
     * @dev Emergency function to get contract owner
     * @return Current contract owner (first admin)
     */
    function owner() public view returns (address) {
        if (getRoleMemberCount(DEFAULT_ADMIN_ROLE) == 0) return address(0);
        return getRoleMember(DEFAULT_ADMIN_ROLE, 0);
    }
}

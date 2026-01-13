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
     * @return isRevoked Whether certificate is revoked
     * @return revocationDate Timestamp of revocation
     * @return revocationReason Reason for revocation
     */
    function getRevocationInfo(uint256 tokenId) 
        external 
        view 
        certificateExists(tokenId) 
        returns (bool isRevoked, uint256 revocationDate, string memory revocationReason) 
    {
        Certificate memory cert = certificates[tokenId];
        isRevoked = cert.isRevoked;
        revocationDate = cert.revocationDate;
        revocationReason = cert.revocationReason;
    }
}
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

    // Multi-Signature Functions
    function proposeOperation(bytes memory operationData, OperationType opType) 
        external 
        returns (uint256) 
    {
        if (!authorizedSigners[msg.sender]) revert NotAuthorizedSigner();
        
        _operationIdCounter++;
        uint256 newOperationId = _operationIdCounter;
        
        MultiSigOperation storage operation = pendingOperations[newOperationId];
        operation.id = newOperationId;
        operation.operationData = operationData;
        operation.proposer = msg.sender;
        operation.proposedAt = block.timestamp;
        operation.requiredSignatures = signatureThreshold;
        operation.executed = false;
        
        emit OperationProposed(newOperationId, msg.sender, operationData, block.timestamp);
        
        return newOperationId;
    }
    
    function signOperation(uint256 operationId) external {
        if (!authorizedSigners[msg.sender]) revert NotAuthorizedSigner();
        if (pendingOperations[operationId].id == 0) revert OperationNotFound();
        if (pendingOperations[operationId].executed) revert OperationAlreadyExecuted();
        if (operationSignatures[operationId][msg.sender]) revert AlreadySigned();
        
        operationSignatures[operationId][msg.sender] = true;
        pendingOperations[operationId].signers.push(msg.sender);
        
        uint256 signatureCount = pendingOperations[operationId].signers.length;
        
        emit OperationSigned(operationId, msg.sender, signatureCount, block.timestamp);
        
        // Auto-execute if threshold reached
        if (signatureCount >= signatureThreshold) {
            _executeOperation(operationId);
        }
    }
    
    function _executeOperation(uint256 operationId) internal {
        MultiSigOperation storage operation = pendingOperations[operationId];
        operation.executed = true;
        operation.executedAt = block.timestamp;
        
        emit OperationExecuted(operationId, msg.sender, block.timestamp);
    }
    
    function setSignatureThreshold(uint256 newThreshold) external onlyOwner {
        if (newThreshold == 0) revert InvalidThreshold();
        
        uint256 oldThreshold = signatureThreshold;
        signatureThreshold = newThreshold;
        
        emit SignatureThresholdUpdated(oldThreshold, newThreshold, block.timestamp);
    }
    
    function addAuthorizedSigner(address signer) external onlyOwner {
        if (signer == address(0)) revert InvalidAddress();
        authorizedSigners[signer] = true;
    }
    
    function removeAuthorizedSigner(address signer) external onlyOwner {
        authorizedSigners[signer] = false;
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

    // Enhanced Batch Operations
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

    // Analytics and Reporting Functions
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
    
    function updateAnalytics(string memory metricType, uint256 value) internal {
        analyticsCounters[metricType] += value;
        emit AnalyticsUpdated(metricType, analyticsCounters[metricType], block.timestamp);
    }
    
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
        
        return reportData;
    }

    // Enhanced Verification System
    function generateVerificationCode(uint256 tokenId) 
        external 
        view 
        certificateExists(tokenId) 
        returns (string memory) 
    {
        // Generate a unique verification code based on token ID and block data
        bytes32 hash = keccak256(abi.encodePacked(tokenId, block.timestamp, address(this)));
        return string(abi.encodePacked("CERT-", _toHexString(uint256(hash))));
    }
    
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
        result.isRevoked = cert.isRevoked;
        result.isExpired = cert.expirationDate != 0 && block.timestamp >= cert.expirationDate;
        result.isValid = !result.isRevoked && !result.isExpired;
        
        return result;
    }
    
    function getVerificationHistory(uint256 tokenId) 
        external 
        view 
        certificateExists(tokenId) 
        returns (VerificationAttempt[] memory) 
    {
        return verificationHistory[tokenId];
    }
    
    function recordVerificationAttempt(
        uint256 tokenId, 
        address verifier, 
        bool successful, 
        string memory method
    ) internal {
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

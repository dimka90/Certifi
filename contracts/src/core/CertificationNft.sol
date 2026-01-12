// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "../types/Enums.sol";
import "../types/Structs.sol";
import "../events/Events.sol";
import "../errors/Errors.sol";

contract CertificateNFT is ERC721URIStorage, Pausable, AccessControlEnumerable {
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    uint256 private _tokenIdCounter;
    uint256 private _templateIdCounter;
    uint256 public constant MAX_BATCH_SIZE = 50;
    
    address[] public institutionAddresses;
    mapping(address => Institution) public institutions;
    mapping(uint256 => Certificate) public certificates;
    mapping(uint256 => CertificateTemplate) public templates;
    mapping(address => uint256[]) public studentCertificates;
    mapping(address => uint256[]) public institutionCertificates;
    mapping(address => bool) public registeredInstitutions;
    
    // Official verification records: tokenId => verifier => status
    mapping(uint256 => mapping(address => VerificationStatus)) public officialVerifications;
    
    modifier onlyAdmin() {
        if (!hasRole(ADMIN_ROLE, msg.sender)) revert AccessDenied(ADMIN_ROLE);
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
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    function pause() external onlyAdmin {
        _pause();
    }

    function unpause() external onlyAdmin {
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
    
    function authorizeInstitution(address _institution) external onlyAdmin {
        if (!registeredInstitutions[_institution]) revert InstitutionNotRegistered();
        if (institutions[_institution].isAuthorized) revert InstitutionAlreadyAuthorized();
        
        institutions[_institution].isAuthorized = true;
        _grantRole(ISSUER_ROLE, _institution);
        
        emit InstitutionAuthorized(_institution, block.timestamp);
    }
    
    function deauthorizeInstitution(address _institution) external onlyAdmin {
        if (!registeredInstitutions[_institution]) revert InstitutionNotRegistered();
        if (!institutions[_institution].isAuthorized) revert InstitutionNotAuthorized();
        
        institutions[_institution].isAuthorized = false;
        _revokeRole(ISSUER_ROLE, _institution);
        
        emit InstitutionDeauthorized(_institution, block.timestamp);
    }

    function createTemplate(
        string memory name,
        string memory degreeTitle,
        Faculty faculty,
        string memory baseURI
    ) external onlyAuthorizedInstitution returns (uint256) {
        _templateIdCounter++;
        uint256 templateId = _templateIdCounter;
        
        templates[templateId] = CertificateTemplate({
            templateId: templateId,
            name: name,
            degreeTitle: degreeTitle,
            faculty: faculty,
            baseURI: baseURI,
            isActive: true,
            creator: msg.sender
        });
        
        emit TemplateCreated(templateId, msg.sender, name);
        return templateId;
    }

    function toggleTemplate(uint256 templateId) external {
        if (templates[templateId].creator != msg.sender && !hasRole(ADMIN_ROLE, msg.sender)) {
            revert AccessDenied(ADMIN_ROLE);
        }
        templates[templateId].isActive = !templates[templateId].isActive;
        emit TemplateUpdated(templateId, templates[templateId].isActive);
    }

    function _issueCertificate(CertificateData memory data) internal whenNotPaused returns (uint256) {
        if (data.studentWallet == address(0) && !data.isClaimable) revert InvalidStudentAddress();
        if (bytes(data.studentName).length == 0) revert EmptyString();
        
        string memory finalTokenURI = data.tokenURI;
        if (data.templateId != 0) {
            CertificateTemplate storage template = templates[data.templateId];
            if (!template.isActive) revert TemplateNotActive();
            // Use baseURI from template if tokenURI is empty
            if (bytes(finalTokenURI).length == 0) {
                finalTokenURI = template.baseURI;
            }
        }
        
        if (bytes(finalTokenURI).length == 0) revert InvalidTokenURI();
        
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        
        // If claimable, we don't mint to student yet, or we mint to contract/issuer
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
            claimHash: data.claimHash
        });
        
        if (!data.isClaimable) {
            studentCertificates[data.studentWallet].push(newTokenId);
        }
        institutionCertificates[msg.sender].push(newTokenId);
        institutions[msg.sender].totalCertificatesIssued++;
        
        emit CertificateIssued(newTokenId, recipient, msg.sender, data.degreeTitle, block.timestamp);
        
        return newTokenId;
    }
   
    function issueCertificate(
        CertificateData memory data
    ) external onlyAuthorizedInstitution returns (uint256) {
        return _issueCertificate(data);
    }

    function claimCertificate(uint256 tokenId, string calldata claimCode) external {
        Certificate storage cert = certificates[tokenId];
        if (!cert.isClaimable) revert NotClaimable();
        if (cert.isClaimed) revert CertificateAlreadyClaimed();
        if (keccak256(abi.encodePacked(claimCode)) != cert.claimHash) revert InvalidClaimCode();
        
        cert.isClaimed = true;
        cert.studentWallet = msg.sender;
        _transfer(address(this), msg.sender, tokenId);
        
        studentCertificates[msg.sender].push(tokenId);
        
        emit CertificateClaimed(tokenId, msg.sender, block.timestamp);
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
        Certificate storage cert = certificates[tokenId];
        if (msg.sender != owner() && msg.sender != cert.issuingInstitution) {
            revert NotIssuingInstitution();
        }
        if (bytes(newTokenURI).length == 0) revert InvalidTokenURI();
        
        cert.version++;
        _setTokenURI(tokenId, newTokenURI);
        
        emit MetadataVersioned(tokenId, cert.version, newTokenURI);
    }
    
    function officiallyVerify(uint256 tokenId, bool status) external {
        if (!hasRole(VERIFIER_ROLE, msg.sender)) revert AccessDenied(VERIFIER_ROLE);
        if (!_exists(tokenId)) revert CertificateDoesNotExist();
        
        officialVerifications[tokenId][msg.sender] = status ? VerificationStatus.Verified : VerificationStatus.Rejected;
        
        emit OfficialVerification(tokenId, msg.sender, status, block.timestamp);
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
        if (cert.issuingInstitution != msg.sender && !hasRole(ADMIN_ROLE, msg.sender)) revert NotIssuingInstitution();
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
        bool valid = !cert.isRevoked && (cert.expirationDate == 0 || block.timestamp < cert.expirationDate);
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
    
    function owner() public view returns (address) {
        if (getRoleMemberCount(ADMIN_ROLE) == 0) return address(0);
        return getRoleMember(ADMIN_ROLE, 0);
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
        
        // Allow minting (from == 0) and claiming (from == address(this))
        if (from != address(0) && from != address(this) && to != address(0)) {
            revert SoulboundTokenNoTransfer();
        }

        if (from != address(0)) {
            if (certificates[firstTokenId].isRevoked) revert CertificateAlreadyRevoked();
        }
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721URIStorage, AccessControlEnumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}


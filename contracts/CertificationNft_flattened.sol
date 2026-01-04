// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ============ ENUMS ============
enum Faculty {
    Science,
    Engineering,
    Arts,
    Medicine,
    Law,
    SocialSciences,
    Education,
    Agriculture,
    Management,
    Technology
}

enum InstitutionType {
    University,
    Polytechnic,
    CollegeOfEducation,
    TechnicalCollege,
    SecondarySchool,
    PrimarySchool,
    TrainingInstitute,
    VocationalCenter
}

enum Classification {
    FirstClass,
    SecondClassUpper,
    SecondClassLower,
    ThirdClass,
    Pass,
    Distinction,
    Credit,
    Merit
}

// ============ STRUCTS ============
struct Institution {
    string name;
    string institutionID;
    address walletAddress;
    string email;
    string country;
    InstitutionType institutionType;
    uint256 registrationDate;
    bool isAuthorized;
    uint256 totalCertificatesIssued;
}

struct Certificate {
    string studentName;
    string studentID;
    address studentWallet;
    string degreeTitle;
    uint256 issueDate;
    Classification grade;
    string duration;
    string cgpa;
    Faculty faculty;
    address issuingInstitution;
    bool isRevoked;
    uint256 revocationDate;
    string revocationReason;
}

struct CertificateData {
    address studentWallet;
    string studentName;
    string studentID;
    string degreeTitle;
    Classification grade;
    string duration;
    string cgpa;
    Faculty faculty;
    string tokenURI;
}

// ============ ERRORS ============
error NotOwner();
error NotAuthorizedInstitution();
error NotIssuingInstitution();
error InstitutionAlreadyRegistered();
error InstitutionNotRegistered();
error InstitutionNotAuthorized();
error InstitutionAlreadyAuthorized();
error InvalidInstitutionAddress();
error InvalidInstitutionID();
error CertificateDoesNotExist();
error CertificateAlreadyRevoked();
error CertificateNotRevoked();
error InvalidStudentAddress();
error InvalidTokenURI();
error InvalidCGPA();
error InvalidAddress();
error EmptyString();

// ============ EVENTS ============
event InstitutionRegistered(
    address indexed institution,
    string name,
    string institutionID,
    uint256 timestamp
);
event InstitutionAuthorized(address indexed institution, uint256 timestamp);
event InstitutionDeauthorized(address indexed institution, uint256 timestamp);
event CertificateIssued(
    uint256 indexed tokenId,
    address indexed student,
    address indexed institution,
    string degreeTitle,
    uint256 timestamp
);
event CertificateRevoked(
    uint256 indexed tokenId,
    address indexed institution,
    string reason,
    uint256 timestamp
);
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

// ============ CONTRACT ============
contract CertificateNFT is ERC721URIStorage {
    address public owner;
    uint256 private _tokenIdCounter;

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
        if (!institutions[msg.sender].isAuthorized)
            revert NotAuthorizedInstitution();
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
        if (registeredInstitutions[msg.sender])
            revert InstitutionAlreadyRegistered();
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

        emit InstitutionRegistered(
            msg.sender,
            _name,
            _institutionID,
            block.timestamp
        );
    }

    function authorizeInstitution(address _institution) external onlyOwner {
        if (!registeredInstitutions[_institution])
            revert InstitutionNotRegistered();
        if (institutions[_institution].isAuthorized)
            revert InstitutionAlreadyAuthorized();

        institutions[_institution].isAuthorized = true;

        emit InstitutionAuthorized(_institution, block.timestamp);
    }

    function deauthorizeInstitution(address _institution) external onlyOwner {
        if (!registeredInstitutions[_institution])
            revert InstitutionNotRegistered();
        if (!institutions[_institution].isAuthorized)
            revert InstitutionNotAuthorized();

        institutions[_institution].isAuthorized = false;

        emit InstitutionDeauthorized(_institution, block.timestamp);
    }

    function issueCertificate(CertificateData memory data)
        external
        onlyAuthorizedInstitution
        returns (uint256)
    {
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
            revocationReason: ""
        });

        studentCertificates[data.studentWallet].push(newTokenId);
        institutionCertificates[msg.sender].push(newTokenId);
        institutions[msg.sender].totalCertificatesIssued++;

        emit CertificateIssued(
            newTokenId,
            data.studentWallet,
            msg.sender,
            data.degreeTitle,
            block.timestamp
        );

        return newTokenId;
    }

    function revokeCertificate(uint256 tokenId, string memory reason)
        external
        certificateExists(tokenId)
    {
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

    function isRevoked(uint256 tokenId)
        external
        view
        certificateExists(tokenId)
        returns (bool)
    {
        return certificates[tokenId].isRevoked;
    }

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
        if (!registeredInstitutions[_addr])
            revert InstitutionNotRegistered();
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

    function _exists(uint256 tokenId)
        internal
        view
        override
        returns (bool)
    {
        return _ownerOf(tokenId) != address(0);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);

        if (from != address(0)) {
            if (certificates[firstTokenId].isRevoked)
                revert CertificateAlreadyRevoked();
        }
    }
}

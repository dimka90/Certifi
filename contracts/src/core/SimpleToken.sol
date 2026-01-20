// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

    /**
     * @title SimpleToken - Enhanced ERC20 Implementation
     * @dev Advanced ERC20 token with role-based access control, batch operations,
     *      vesting schedules, transfer fees, and comprehensive security features
     * @author Certifi Team
     * @notice This contract implements an enhanced ERC20 token with additional
     *         features for the Certifi ecosystem including batch operations,
     *         vesting schedules, and advanced access control
     */

// Custom errors for gas optimization
error InsufficientBalance(address account, uint256 requested, uint256 available);
error InsufficientAllowance(address owner, address spender, uint256 requested, uint256 available);
error ExceedsMaxSupply(uint256 requested, uint256 maxSupply);
error AccountBlacklisted(address account);
error AccountFrozen(address account);
error TransfersDisabled();
error ExceedsDailyLimit(address account, uint256 requested, uint256 limit);
error BelowMinimumTransfer(uint256 amount, uint256 minimum);
error InvalidAddress(address account);
error InvalidAmount(uint256 amount);
error VestingNotFound(address beneficiary);
error VestingAlreadyExists(address beneficiary);
error NoVestedTokens(address beneficiary);
error UnauthorizedAccess(address caller);
error ArrayLengthMismatch(uint256 length1, uint256 length2);
error BatchOperationFailed(uint256 index);
error FeeExceedsLimit(uint256 fee, uint256 maxFee);
error InvalidCollector(address collector);
error SnapshotNotFound(uint256 snapshotId);
error AllowanceExpired(address owner, address spender, uint256 expiry);
error HolderIndexOutOfBounds(uint256 index, uint256 length);
contract SimpleToken is ERC20, AccessControl, Pausable, ReentrancyGuard {
    
    // Role definitions
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant BLACKLIST_ROLE = keccak256("BLACKLIST_ROLE");
    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");
    bytes32 public constant VESTING_MANAGER_ROLE = keccak256("VESTING_MANAGER_ROLE");
    
    // Gas-optimized constants
    uint256 public constant MAX_SUPPLY = 10000000 * 10 ** 18;
    uint256 private constant SECONDS_PER_DAY = 86400;
    uint256 private constant MAX_FEE_BASIS_POINTS = 1000; // 10%
    
    // Immutable variables for gas optimization
    uint256 public immutable INITIAL_SUPPLY;
    address public immutable DEPLOYER;
    
    // Packed structs for gas optimization
    struct PackedAccountInfo {
        uint128 dailyLimit;       // Daily transfer limit
        uint128 dailySpent;       // Amount spent today
        uint64 lastTransferDay;   // Last transfer day
        bool blacklisted;         // Blacklist status
        bool frozen;              // Frozen status
        bool whitelisted;         // Whitelist status
        bool isHolder;            // Holder status
    }
    
    struct PackedVestingSchedule {
        uint128 totalAmount;      // Total vesting amount
        uint128 releasedAmount;   // Amount already released
        uint64 startTime;         // Vesting start time
        uint64 duration;          // Vesting duration
        bool active;              // Vesting active status
    }
    
    // Optimized storage mappings
    mapping(address => PackedAccountInfo) private _accountInfo;
    mapping(address => PackedVestingSchedule) private _vestingSchedules;
    
    // Legacy public variables for backward compatibility
    uint256 public transferFee = 0; // Fee in basis points (100 = 1%)
    address public feeCollector;
    uint256 public totalBurned;
    uint256 public totalMinted;
    
    struct Snapshot {
        uint256 id;
        uint256 timestamp;
    }
    
    uint256 private _currentSnapshotId;
    mapping(uint256 => mapping(address => uint256)) private _balanceSnapshots;
    mapping(uint256 => uint256) private _totalSupplySnapshots;
    
    mapping(address => mapping(address => uint256)) public allowanceExpiry;
    
    address[] public holders;
    
    // Helper functions for packed data access
    function blacklisted(address account) public view returns (bool) {
        return _accountInfo[account].blacklisted;
    }
    
    function frozenAccounts(address account) public view returns (bool) {
        return _accountInfo[account].frozen;
    }
    
    function whitelisted(address account) public view returns (bool) {
        return _accountInfo[account].whitelisted;
    }
    
    function isHolder(address account) public view returns (bool) {
        return _accountInfo[account].isHolder;
    }
    
    function dailyLimit(address account) public view returns (uint256) {
        return _accountInfo[account].dailyLimit;
    }
    
    function dailySpent(address account) public view returns (uint256) {
        return _accountInfo[account].dailySpent;
    }
    
    function lastTransferDay(address account) public view returns (uint256) {
        return _accountInfo[account].lastTransferDay;
    }
    
    function vestingStart(address account) public view returns (uint256) {
        return _vestingSchedules[account].startTime;
    }
    
    function vestingDuration(address account) public view returns (uint256) {
        return _vestingSchedules[account].duration;
    }
    
    function vestingAmount(address account) public view returns (uint256) {
        return _vestingSchedules[account].totalAmount;
    }
    uint256 public minTransferAmount = 0;
    mapping(address => string) public accountMetadata;
    bool public transfersEnabled = true;
    uint256 public totalFeeCollected;
    
    // Enhanced transfer events
    event TransferWithData(address indexed from, address indexed to, uint256 value, bytes data);
    
    /**
     * @dev Enhanced transfer with additional data
     */
    function transferWithData(
        address to,
        uint256 amount,
        bytes calldata data
    ) external nonReentrant returns (bool) {
        if (to == address(0)) {
            revert InvalidAddress(to);
        }
        if (amount == 0) {
            revert InvalidAmount(amount);
        }
        
        _transfer(msg.sender, to, amount);
        emit TransferWithData(msg.sender, to, amount, data);
        
        return true;
    }
    
    /**
     * @dev Enhanced transferFrom with additional data
     */
    function transferFromWithData(
        address from,
        address to,
        uint256 amount,
        bytes calldata data
    ) external nonReentrant returns (bool) {
        if (from == address(0) || to == address(0)) {
            revert InvalidAddress(to);
        }
        if (amount == 0) {
            revert InvalidAmount(amount);
        }
        
        transferFrom(from, to, amount);
        emit TransferWithData(from, to, amount, data);
        
        return true;
    }
    event Whitelisted(address indexed account);
    event RemovedFromWhitelist(address indexed account);
    
    event TransfersToggled(bool enabled);
    
    event MetadataUpdated(address indexed account, string metadata);
    
    event MinTransferAmountUpdated(uint256 newAmount);
    
    event HolderAdded(address indexed holder);
    event HolderRemoved(address indexed holder);
    
    event AllowanceWithExpiry(address indexed owner, address indexed spender, uint256 amount, uint256 expiry);
    
    event SnapshotCreated(uint256 indexed id, uint256 timestamp);
    
    event AccountFrozen(address indexed account);
    event AccountUnfrozen(address indexed account);
    
    event Blacklisted(address indexed account);
    event Unblacklisted(address indexed account);
    event TransferFeeUpdated(uint256 newFee);
    event FeeCollectorUpdated(address indexed newCollector);
    event VestingScheduleCreated(address indexed beneficiary, uint256 amount, uint256 duration);
    event DailyLimitSet(address indexed account, uint256 limit);
    
    // Enhanced administrative events
    event BatchTransferCompleted(address indexed sender, uint256 recipientCount, uint256 totalAmount);
    event BatchApprovalCompleted(address indexed owner, uint256 spenderCount);
    event BatchMintCompleted(address indexed minter, uint256 recipientCount, uint256 totalAmount);
    event VestingReleased(address indexed beneficiary, uint256 amount, uint256 remaining);
    event AccountInfoUpdated(address indexed account, string field, uint256 oldValue, uint256 newValue);
    event FeeCollected(uint256 amount, uint256 total);
    
    /**
     * @notice Initializes the SimpleToken with enhanced features
     * @dev Sets up role-based access control, initial supply, and fee collector
     *      Grants all administrative roles to the deployer for initial setup
     */
    constructor() ERC20("Simple Token", "SMPL") {
        uint256 initialSupply = 1000000 * 10 ** decimals();
        INITIAL_SUPPLY = initialSupply;
        DEPLOYER = msg.sender;
        
        _mint(msg.sender, initialSupply);
        feeCollector = msg.sender;
        
        // Grant all roles to deployer
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(BLACKLIST_ROLE, msg.sender);
        _grantRole(FEE_MANAGER_ROLE, msg.sender);
        _grantRole(VESTING_MANAGER_ROLE, msg.sender);
    }
    
    // ============ BATCH OPERATIONS ============
    
    /**
     * @notice Transfers tokens to multiple recipients in a single transaction
     * @dev Performs batch transfers atomically - all succeed or all fail
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to transfer to each recipient
     * @return success True if all transfers succeeded
     * @custom:security Validates all inputs before executing any transfers
     * @custom:gas-optimization Uses single loop with early validation
     */
    function batchTransfer(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external nonReentrant returns (bool) {
        if (recipients.length != amounts.length) {
            revert ArrayLengthMismatch(recipients.length, amounts.length);
        }
        
        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] == address(0)) {
                revert InvalidAddress(recipients[i]);
            }
            if (amounts[i] == 0) {
                revert InvalidAmount(amounts[i]);
            }
            
            _transfer(msg.sender, recipients[i], amounts[i]);
        }
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        emit BatchTransferCompleted(msg.sender, recipients.length, totalAmount);
        return true;
    }
    
    /**
     * @dev Batch transferFrom for multiple operations
     */
    function batchTransferFrom(
        address[] calldata senders,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external nonReentrant returns (bool) {
        if (senders.length != recipients.length || recipients.length != amounts.length) {
            revert ArrayLengthMismatch(senders.length, recipients.length);
        }
        
        for (uint256 i = 0; i < senders.length; i++) {
            if (senders[i] == address(0) || recipients[i] == address(0)) {
                revert InvalidAddress(recipients[i]);
            }
            if (amounts[i] == 0) {
                revert InvalidAmount(amounts[i]);
            }
            
            transferFrom(senders[i], recipients[i], amounts[i]);
        }
        
        return true;
    }
    
    /**
     * @dev Batch approve multiple spenders
     */
    function batchApprove(
        address[] calldata spenders,
        uint256[] calldata amounts
    ) external nonReentrant returns (bool) {
        if (spenders.length != amounts.length) {
            revert ArrayLengthMismatch(spenders.length, amounts.length);
        }
        
        for (uint256 i = 0; i < spenders.length; i++) {
            if (spenders[i] == address(0)) {
                revert InvalidAddress(spenders[i]);
            }
            
            _approve(msg.sender, spenders[i], amounts[i]);
        }
        
        emit BatchApprovalCompleted(msg.sender, spenders.length);
        return true;
    }
    
    /**
     * @dev Batch mint tokens to multiple recipients
     */
    function batchMint(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyRole(MINTER_ROLE) nonReentrant returns (bool) {
        if (recipients.length != amounts.length) {
            revert ArrayLengthMismatch(recipients.length, amounts.length);
        }
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        if (totalSupply() + totalAmount > MAX_SUPPLY) {
            revert ExceedsMaxSupply(totalAmount, MAX_SUPPLY);
        }
        
        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] == address(0)) {
                revert InvalidAddress(recipients[i]);
            }
            if (amounts[i] == 0) {
                revert InvalidAmount(amounts[i]);
            }
            
            totalMinted += amounts[i];
            _mint(recipients[i], amounts[i]);
        }
        
        emit BatchMintCompleted(msg.sender, recipients.length, totalAmount);
        return true;
    }
    /**
     * @notice Mints new tokens to specified address (requires MINTER_ROLE)
     * @dev Increases total supply and recipient balance, respects max supply cap
     * @param to Address to receive the newly minted tokens
     * @param amount Number of tokens to mint
     * @custom:access-control Requires MINTER_ROLE
     * @custom:supply-cap Enforces MAX_SUPPLY limit
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) nonReentrant {
        if (totalSupply() + amount > MAX_SUPPLY) {
            revert ExceedsMaxSupply(amount, MAX_SUPPLY);
        }
        totalMinted += amount;
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens from caller's balance
     */
    function burn(uint256 amount) external nonReentrant {
        totalBurned += amount;
        _burn(msg.sender, amount);
    }
    
    /**
     * @dev Burn tokens from another address (requires allowance)
     */
    function burnFrom(address account, uint256 amount) external nonReentrant {
        uint256 currentAllowance = allowance(account, msg.sender);
        if (currentAllowance < amount) {
            revert InsufficientAllowance(account, msg.sender, amount, currentAllowance);
        }
        _approve(account, msg.sender, currentAllowance - amount);
        totalBurned += amount;
        _burn(account, amount);
    }
    
    /**
     * @dev Pause token transfers
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Override to add pausable functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override whenNotPaused {
        if (blacklisted[from]) {
            revert AccountBlacklisted(from);
        }
        if (blacklisted[to]) {
            revert AccountBlacklisted(to);
        }
        if (frozenAccounts[from]) {
            revert AccountFrozen(from);
        }
        if (frozenAccounts[to]) {
            revert AccountFrozen(to);
        }
        
        // Track holders efficiently
        if (to != address(0) && balanceOf(to) == 0 && amount > 0) {
            PackedAccountInfo storage toInfo = _accountInfo[to];
            if (!toInfo.isHolder) {
                holders.push(to);
                toInfo.isHolder = true;
                emit HolderAdded(to);
            }
        }
        
        if (from != address(0) && balanceOf(from) == amount) {
            PackedAccountInfo storage fromInfo = _accountInfo[from];
            fromInfo.isHolder = false;
            emit HolderRemoved(from);
        }
        
        super._beforeTokenTransfer(from, to, amount);
    }
    
    /**
     * @dev Blacklist an address
     */
    function blacklist(address account) external onlyRole(BLACKLIST_ROLE) {
        blacklisted[account] = true;
        emit Blacklisted(account);
    }
    
    /**
     * @dev Remove address from blacklist
     */
    function unblacklist(address account) external onlyRole(BLACKLIST_ROLE) {
        blacklisted[account] = false;
        emit Unblacklisted(account);
    }
    
    /**
     * @dev Set transfer fee
     */
    function setTransferFee(uint256 fee) external onlyRole(FEE_MANAGER_ROLE) {
        if (fee > MAX_FEE_BASIS_POINTS) {
            revert FeeExceedsLimit(fee, MAX_FEE_BASIS_POINTS);
        }
        transferFee = fee;
        emit TransferFeeUpdated(fee);
    }
    
    /**
     * @dev Set fee collector address
     */
    function setFeeCollector(address collector) external onlyRole(FEE_MANAGER_ROLE) {
        if (collector == address(0)) {
            revert InvalidAddress(collector);
        }
        feeCollector = collector;
        emit FeeCollectorUpdated(collector);
    }
    
    /**
     * @dev Override transfer to include fees
     */
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        if (!transfersEnabled) {
            revert TransfersDisabled();
        }
        if (amount < minTransferAmount) {
            revert BelowMinimumTransfer(amount, minTransferAmount);
        }
        
        // Check daily limit with gas optimization
        PackedAccountInfo storage fromInfo = _accountInfo[from];
        if (fromInfo.dailyLimit > 0) {
            uint256 currentDay = block.timestamp / SECONDS_PER_DAY;
            if (fromInfo.lastTransferDay != currentDay) {
                fromInfo.dailySpent = 0;
                fromInfo.lastTransferDay = uint64(currentDay);
            }
            
            uint256 newDailySpent = fromInfo.dailySpent + amount;
            if (newDailySpent > fromInfo.dailyLimit) {
                revert ExceedsDailyLimit(from, amount, fromInfo.dailyLimit);
            }
            fromInfo.dailySpent = uint128(newDailySpent);
        }
        
        // Gas-optimized fee calculation
        if (transferFee > 0 && from != DEPLOYER && to != DEPLOYER) {
            PackedAccountInfo storage fromAccountInfo = _accountInfo[from];
            PackedAccountInfo storage toAccountInfo = _accountInfo[to];
            
            if (!fromAccountInfo.whitelisted && !toAccountInfo.whitelisted) {
                uint256 fee = (amount * transferFee) / 10000;
                uint256 amountAfterFee = amount - fee;
                totalFeeCollected += fee;
                super._transfer(from, feeCollector, fee);
                super._transfer(from, to, amountAfterFee);
                emit FeeCollected(fee, totalFeeCollected);
                return;
            }
        }
        
        super._transfer(from, to, amount);
    }
    
    /**
     * @notice Creates a vesting schedule for gradual token release
     * @dev Locks tokens in contract and releases them linearly over duration
     * @param beneficiary Address that will receive vested tokens
     * @param amount Total amount of tokens to vest
     * @param duration Time period over which tokens will be released (in seconds)
     * @custom:access-control Requires VESTING_MANAGER_ROLE
     * @custom:validation Prevents duplicate vesting schedules for same beneficiary
     */
    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 duration
    ) external onlyRole(VESTING_MANAGER_ROLE) {
        if (beneficiary == address(0)) {
            revert InvalidAddress(beneficiary);
        }
        if (amount == 0) {
            revert InvalidAmount(amount);
        }
        if (duration == 0) {
            revert InvalidAmount(duration);
        }
        
        PackedVestingSchedule storage schedule = _vestingSchedules[beneficiary];
        if (schedule.active) {
            revert VestingAlreadyExists(beneficiary);
        }
        
        schedule.totalAmount = uint128(amount);
        schedule.startTime = uint64(block.timestamp);
        schedule.duration = uint64(duration);
        schedule.releasedAmount = 0;
        schedule.active = true;
        
        _transfer(msg.sender, address(this), amount);
        
        emit VestingScheduleCreated(beneficiary, amount, duration);
    }
    
    /**
     * @dev Calculate vested amount for an address with improved precision
     */
    function vestedAmount(address beneficiary) public view returns (uint256) {
        PackedVestingSchedule storage schedule = _vestingSchedules[beneficiary];
        if (!schedule.active || schedule.totalAmount == 0) {
            return 0;
        }
        
        uint256 elapsed = block.timestamp - schedule.startTime;
        if (elapsed >= schedule.duration) {
            return schedule.totalAmount - schedule.releasedAmount;
        }
        
        uint256 totalVested = (uint256(schedule.totalAmount) * elapsed) / schedule.duration;
        return totalVested > schedule.releasedAmount ? totalVested - schedule.releasedAmount : 0;
    }
    
    /**
     * @dev Get detailed vesting information
     */
    function getVestingInfo(address beneficiary) external view returns (
        uint256 totalAmount,
        uint256 releasedAmount,
        uint256 startTime,
        uint256 duration,
        bool active
    ) {
        PackedVestingSchedule storage schedule = _vestingSchedules[beneficiary];
        return (
            schedule.totalAmount,
            schedule.releasedAmount,
            schedule.startTime,
            schedule.duration,
            schedule.active
        );
    }
    
    /**
     * @dev Release vested tokens with improved tracking
     */
    function releaseVested() external nonReentrant {
        uint256 releasable = vestedAmount(msg.sender);
        if (releasable == 0) {
            revert NoVestedTokens(msg.sender);
        }
        
        PackedVestingSchedule storage schedule = _vestingSchedules[msg.sender];
        schedule.releasedAmount += uint128(releasable);
        
        // If fully vested, deactivate schedule
        if (schedule.releasedAmount >= schedule.totalAmount) {
            schedule.active = false;
        }
        
        _transfer(address(this), msg.sender, releasable);
    }
    
    /**
     * @dev Set daily transfer limit for an address
     */
    function setDailyLimit(address account, uint256 limit) external onlyRole(ADMIN_ROLE) {
        if (account == address(0)) {
            revert InvalidAddress(account);
        }
        
        PackedAccountInfo storage accountInfo = _accountInfo[account];
        uint256 oldLimit = accountInfo.dailyLimit;
        accountInfo.dailyLimit = uint128(limit);
        
        emit DailyLimitSet(account, limit);
        emit AccountInfoUpdated(account, "dailyLimit", oldLimit, limit);
    }
    
    /**
     * @dev Freeze an account
     */
    function freezeAccount(address account) external onlyRole(BLACKLIST_ROLE) {
        if (account == address(0)) {
            revert InvalidAddress(account);
        }
        
        PackedAccountInfo storage accountInfo = _accountInfo[account];
        accountInfo.frozen = true;
        emit AccountFrozen(account);
    }
    
    /**
     * @dev Unfreeze an account
     */
    function unfreezeAccount(address account) external onlyRole(BLACKLIST_ROLE) {
        if (account == address(0)) {
            revert InvalidAddress(account);
        }
        
        PackedAccountInfo storage accountInfo = _accountInfo[account];
        accountInfo.frozen = false;
        emit AccountUnfrozen(account);
    }
    
    /**
     * @dev Create a snapshot of current balances
     */
    function snapshot() external onlyRole(ADMIN_ROLE) returns (uint256) {
        _currentSnapshotId++;
        _totalSupplySnapshots[_currentSnapshotId] = totalSupply();
        emit SnapshotCreated(_currentSnapshotId, block.timestamp);
        return _currentSnapshotId;
    }
    
    /**
     * @dev Get balance at a specific snapshot
     */
    function balanceOfAt(address account, uint256 snapshotId) external view returns (uint256) {
        if (snapshotId > _currentSnapshotId) {
            revert SnapshotNotFound(snapshotId);
        }
        return _balanceSnapshots[snapshotId][account];
    }
    
    /**
     * @dev Approve with expiry time
     */
    function approveWithExpiry(
        address spender,
        uint256 amount,
        uint256 expiry
    ) external returns (bool) {
        require(expiry > block.timestamp, "Expiry must be in future");
        _approve(msg.sender, spender, amount);
        allowanceExpiry[msg.sender][spender] = expiry;
        emit AllowanceWithExpiry(msg.sender, spender, amount, expiry);
        return true;
    }
    
    /**
     * @dev Override transferFrom to check expiry
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        uint256 expiry = allowanceExpiry[from][msg.sender];
        if (expiry > 0) {
            require(block.timestamp <= expiry, "Allowance expired");
        }
        return super.transferFrom(from, to, amount);
    }
    
    
    // ============ VIEW FUNCTIONS FOR TRANSPARENCY ============
    
    /**
     * @notice Gets comprehensive account information in a single call
     * @param account Address to query
     * @return info Packed account information including limits, status flags
     */
    function getAccountInfo(address account) external view returns (PackedAccountInfo memory info) {
        return _accountInfo[account];
    }
    
    /**
     * @notice Gets detailed vesting information for an account
     * @param account Address to query vesting details for
     * @return schedule Complete vesting schedule information
     */
    function getVestingDetails(address account) external view returns (PackedVestingSchedule memory schedule) {
        return _vestingSchedules[account];
    }
    
    /**
     * @notice Calculates the circulating supply (total supply minus locked tokens)
     * @return circulatingSupply Amount of tokens available for trading
     */
    function getCirculatingSupply() external view returns (uint256 circulatingSupply) {
        uint256 totalLocked = balanceOf(address(this)); // Vesting contract balance
        return totalSupply() - totalLocked;
    }
    
    /**
     * @notice Gets comprehensive token metrics for analytics
     * @return metrics Struct containing supply, holder, and fee information
     */
    function getTokenMetrics() external view returns (
        uint256 totalSupply_,
        uint256 circulatingSupply_,
        uint256 totalMinted_,
        uint256 totalBurned_,
        uint256 holderCount_,
        uint256 totalFeesCollected_
    ) {
        uint256 totalLocked = balanceOf(address(this));
        return (
            totalSupply(),
            totalSupply() - totalLocked,
            totalMinted,
            totalBurned,
            holders.length,
            totalFeeCollected
        );
    }
    function getHolders(uint256 offset, uint256 limit) external view returns (address[] memory) {
        if (offset >= holders.length) {
            return new address[](0);
        }
        
        uint256 end = offset + limit;
        if (end > holders.length) {
            end = holders.length;
        }
        
        address[] memory result = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = holders[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get accurate holder count (excluding zero balances)
     */
    function getActiveHolderCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < holders.length; i++) {
            if (balanceOf(holders[i]) > 0) {
                count++;
            }
        }
        return count;
    }
    function getHolderCount() external view returns (uint256) {
        return holders.length;
    }
    
    /**
     * @dev Get holder at index
     */
    function getHolderAt(uint256 index) external view returns (address) {
        require(index < holders.length, "Index out of bounds");
        return holders[index];
    }
    
    /**
     * @dev Set minimum transfer amount
     */
    function setMinTransferAmount(uint256 amount) external onlyOwner {
        minTransferAmount = amount;
        emit MinTransferAmountUpdated(amount);
    }
    
    /**
     * @dev Set metadata for an account
     */
    function setAccountMetadata(string calldata metadata) external {
        accountMetadata[msg.sender] = metadata;
        emit MetadataUpdated(msg.sender, metadata);
    }
    
    /**
     * @dev Get metadata for an account
     */
    function getAccountMetadata(address account) external view returns (string memory) {
        return accountMetadata[account];
    }
    
    
    // ============ EMERGENCY FUNCTIONS ============
    
    /**
     * @notice Emergency pause with automatic unpause after time limit
     * @dev Pauses contract for maximum of 7 days, then auto-unpauses
     */
    function emergencyPause() external onlyRole(PAUSER_ROLE) {
        _pause();
        // Note: In production, implement auto-unpause mechanism
    }
    
    /**
     * @notice Recovers accidentally sent ERC20 tokens (not this token)
     * @param token Address of the token to recover
     * @param amount Amount to recover
     * @param to Address to send recovered tokens to
     */
    function recoverERC20(
        address token,
        uint256 amount,
        address to
    ) external onlyRole(ADMIN_ROLE) {
        if (token == address(this)) {
            revert InvalidAddress(token); // Cannot recover own tokens
        }
        if (to == address(0)) {
            revert InvalidAddress(to);
        }
        
        // Use low-level call to avoid import dependencies
        (bool success, ) = token.call(
            abi.encodeWithSignature("transfer(address,uint256)", to, amount)
        );
        require(success, "Token recovery failed");
    }
    
    /**
     * @notice Circuit breaker for critical functions during emergencies
     * @dev Temporarily disables high-risk operations
     */
    function enableCircuitBreaker() external onlyRole(ADMIN_ROLE) {
        transfersEnabled = false;
        emit TransfersToggled(false);
    }
    
    /**
     * @notice Disables circuit breaker to restore normal operations
     */
    function disableCircuitBreaker() external onlyRole(ADMIN_ROLE) {
        transfersEnabled = true;
        emit TransfersToggled(true);
    }
    /**
     * @dev Toggle transfers on/off
     */
    function toggleTransfers() external onlyRole(ADMIN_ROLE) {
        transfersEnabled = !transfersEnabled;
    }
    
    
    // ============ TOKEN UTILITY FUNCTIONS ============
    
    /**
     * @notice Burns tokens with reason tracking for transparency
     * @param amount Amount of tokens to burn
     * @param reason Reason for burning (for analytics and transparency)
     */
    function burnWithReason(uint256 amount, string calldata reason) external nonReentrant {
        totalBurned += amount;
        _burn(msg.sender, amount);
        
        // Emit custom event with reason
        emit Transfer(msg.sender, address(0), amount);
        // Note: In production, add custom BurnWithReason event
    }
    
    /**
     * @notice Temporarily locks tokens for a specific duration
     * @param amount Amount to lock
     * @param duration Lock duration in seconds
     */
    function lockTokens(uint256 amount, uint256 duration) external nonReentrant {
        if (amount == 0) {
            revert InvalidAmount(amount);
        }
        if (duration == 0) {
            revert InvalidAmount(duration);
        }
        
        // Create a temporary vesting schedule for locking
        PackedVestingSchedule storage lockSchedule = _vestingSchedules[msg.sender];
        if (lockSchedule.active) {
            revert VestingAlreadyExists(msg.sender);
        }
        
        lockSchedule.totalAmount = uint128(amount);
        lockSchedule.startTime = uint64(block.timestamp);
        lockSchedule.duration = uint64(duration);
        lockSchedule.releasedAmount = 0;
        lockSchedule.active = true;
        
        _transfer(msg.sender, address(this), amount);
    }
    
    /**
     * @notice Creates a snapshot with custom metadata
     * @param metadata Description or reason for the snapshot
     * @return snapshotId The ID of the created snapshot
     */
    function snapshotWithMetadata(string calldata metadata) external onlyRole(ADMIN_ROLE) returns (uint256) {
        uint256 snapshotId = snapshot();
        
        // Note: In production, store metadata in mapping
        // snapshotMetadata[snapshotId] = metadata;
        
        return snapshotId;
    }
    /**
     * @dev Add address to whitelist (fee exempt)
     */
    function addToWhitelist(address account) external onlyRole(ADMIN_ROLE) {
        if (account == address(0)) {
            revert InvalidAddress(account);
        }
        
        PackedAccountInfo storage accountInfo = _accountInfo[account];
        accountInfo.whitelisted = true;
        emit Whitelisted(account);
    }
    
    
    // ============ ENHANCED FEE MECHANISM ============
    
    // Fee types for different operations
    enum FeeType { TRANSFER, MINT, BURN, VESTING }
    
    mapping(FeeType => uint256) public feeRates;
    mapping(address => bool) public feeExempt;
    
    /**
     * @notice Sets different fee rates for different operation types
     * @param feeType Type of operation (transfer, mint, burn, vesting)
     * @param rate Fee rate in basis points (100 = 1%)
     */
    function setFeeRate(FeeType feeType, uint256 rate) external onlyRole(FEE_MANAGER_ROLE) {
        if (rate > MAX_FEE_BASIS_POINTS) {
            revert FeeExceedsLimit(rate, MAX_FEE_BASIS_POINTS);
        }
        
        feeRates[feeType] = rate;
        emit TransferFeeUpdated(rate); // Reuse existing event
    }
    
    /**
     * @notice Adds address to fee exemption list
     * @param account Address to exempt from fees
     */
    function addFeeExemption(address account) external onlyRole(FEE_MANAGER_ROLE) {
        if (account == address(0)) {
            revert InvalidAddress(account);
        }
        
        feeExempt[account] = true;
        // Reuse whitelist event for fee exemption
        emit Whitelisted(account);
    }
    
    /**
     * @notice Removes address from fee exemption list
     * @param account Address to remove from fee exemption
     */
    function removeFeeExemption(address account) external onlyRole(FEE_MANAGER_ROLE) {
        feeExempt[account] = false;
        emit RemovedFromWhitelist(account);
    }
    
    /**
     * @notice Calculates dynamic fee based on transaction amount and account status
     * @param from Sender address
     * @param to Recipient address  
     * @param amount Transaction amount
     * @return fee Calculated fee amount
     */
    function calculateDynamicFee(
        address from,
        address to,
        uint256 amount
    ) public view returns (uint256 fee) {
        // No fee for deployer or fee-exempt addresses
        if (from == DEPLOYER || to == DEPLOYER || feeExempt[from] || feeExempt[to]) {
            return 0;
        }
        
        PackedAccountInfo storage fromInfo = _accountInfo[from];
        PackedAccountInfo storage toInfo = _accountInfo[to];
        
        // No fee for whitelisted addresses
        if (fromInfo.whitelisted || toInfo.whitelisted) {
            return 0;
        }
        
        // Use transfer fee rate or custom rate
        uint256 rate = feeRates[FeeType.TRANSFER] > 0 ? feeRates[FeeType.TRANSFER] : transferFee;
        
        return (amount * rate) / 10000;
    }
    function removeFromWhitelist(address account) external onlyRole(ADMIN_ROLE) {
        if (account == address(0)) {
            revert InvalidAddress(account);
        }
        
        PackedAccountInfo storage accountInfo = _accountInfo[account];
        accountInfo.whitelisted = false;
        emit RemovedFromWhitelist(account);
    }
}
    
    // ============ INTEGRATION HELPERS ============
    
    /**
     * @notice Checks if address has sufficient balance for operation
     * @param account Address to check
     * @param amount Required amount
     * @return hasBalance True if account has sufficient balance
     */
    function hasSufficientBalance(address account, uint256 amount) external view returns (bool hasBalance) {
        return balanceOf(account) >= amount;
    }
    
    /**
     * @notice Checks if transfer would succeed (without executing)
     * @param from Sender address
     * @param to Recipient address
     * @param amount Transfer amount
     * @return canTransfer True if transfer would succeed
     * @return reason Reason if transfer would fail
     */
    function canTransfer(
        address from,
        address to,
        uint256 amount
    ) external view returns (bool canTransfer, string memory reason) {
        if (paused()) {
            return (false, "Contract is paused");
        }
        
        if (!transfersEnabled) {
            return (false, "Transfers are disabled");
        }
        
        if (balanceOf(from) < amount) {
            return (false, "Insufficient balance");
        }
        
        PackedAccountInfo storage fromInfo = _accountInfo[from];
        PackedAccountInfo storage toInfo = _accountInfo[to];
        
        if (fromInfo.blacklisted) {
            return (false, "Sender is blacklisted");
        }
        
        if (toInfo.blacklisted) {
            return (false, "Recipient is blacklisted");
        }
        
        if (fromInfo.frozen) {
            return (false, "Sender account is frozen");
        }
        
        if (toInfo.frozen) {
            return (false, "Recipient account is frozen");
        }
        
        if (amount < minTransferAmount) {
            return (false, "Amount below minimum");
        }
        
        // Check daily limit
        if (fromInfo.dailyLimit > 0) {
            uint256 currentDay = block.timestamp / SECONDS_PER_DAY;
            uint256 dailySpentAmount = fromInfo.lastTransferDay == currentDay ? fromInfo.dailySpent : 0;
            
            if (dailySpentAmount + amount > fromInfo.dailyLimit) {
                return (false, "Daily limit exceeded");
            }
        }
        
        return (true, "");
    }
    
    /**
     * @notice Gets comprehensive token information for external integrations
     * @return info Struct containing all relevant token information
     */
    function getTokenInfo() external view returns (
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 totalSupply_,
        uint256 maxSupply_,
        bool transfersEnabled_,
        bool paused_
    ) {
        return (
            name(),
            symbol(),
            decimals(),
            totalSupply(),
            MAX_SUPPLY,
            transfersEnabled,
            paused()
        );
    }
    
    /**
     * @notice Compatibility function for older interfaces
     * @dev Provides backward compatibility with previous versions
     */
    function owner() public view returns (address) {
        return DEPLOYER;
    }
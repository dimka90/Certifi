// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title SimpleToken
 * @dev Basic ERC20 token implementation with ownership
 */
contract SimpleToken is ERC20, Ownable, Pausable {
    
    uint256 public constant MAX_SUPPLY = 10000000 * 10 ** 18;
    
    mapping(address => bool) public blacklisted;
    
    uint256 public transferFee = 0; // Fee in basis points (100 = 1%)
    address public feeCollector;
    
    mapping(address => uint256) public vestingStart;
    mapping(address => uint256) public vestingDuration;
    mapping(address => uint256) public vestingAmount;
    
    mapping(address => uint256) public dailyLimit;
    mapping(address => uint256) public dailySpent;
    mapping(address => uint256) public lastTransferDay;
    
    uint256 public totalBurned;
    uint256 public totalMinted;
    
    mapping(address => bool) public frozenAccounts;
    
    struct Snapshot {
        uint256 id;
        uint256 timestamp;
    }
    
    uint256 private _currentSnapshotId;
    mapping(uint256 => mapping(address => uint256)) private _balanceSnapshots;
    mapping(uint256 => uint256) private _totalSupplySnapshots;
    
    mapping(address => mapping(address => uint256)) public allowanceExpiry;
    
    address[] public holders;
    mapping(address => bool) public isHolder;
    
    uint256 public minTransferAmount = 0;
    
    mapping(address => string) public accountMetadata;
    
    bool public transfersEnabled = true;
    
    uint256 public totalFeeCollected;
    
    mapping(address => bool) public whitelisted;
    
    event Whitelisted(address indexed account);
    event RemovedFromWhitelist(address indexed account);
    
    event FeeCollected(uint256 amount, uint256 total);
    
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
    
    constructor() ERC20("Simple Token", "SMPL") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10 ** decimals());
        feeCollector = msg.sender;
    }
    
    /**
     * @dev Mint new tokens (owner only)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        totalMinted += amount;
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens from caller's balance
     */
    function burn(uint256 amount) external {
        totalBurned += amount;
        _burn(msg.sender, amount);
    }
    
    /**
     * @dev Burn tokens from another address (requires allowance)
     */
    function burnFrom(address account, uint256 amount) external {
        uint256 currentAllowance = allowance(account, msg.sender);
        require(currentAllowance >= amount, "Insufficient allowance");
        _approve(account, msg.sender, currentAllowance - amount);
        totalBurned += amount;
        _burn(account, amount);
    }
    
    /**
     * @dev Pause token transfers
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
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
        require(!blacklisted[from], "Sender is blacklisted");
        require(!blacklisted[to], "Recipient is blacklisted");
        require(!frozenAccounts[from], "Sender account is frozen");
        require(!frozenAccounts[to], "Recipient account is frozen");
        
        // Track holders
        if (to != address(0) && balanceOf(to) == 0 && amount > 0) {
            if (!isHolder[to]) {
                holders.push(to);
                isHolder[to] = true;
                emit HolderAdded(to);
            }
        }
        
        if (from != address(0) && balanceOf(from) == amount) {
            isHolder[from] = false;
            emit HolderRemoved(from);
        }
        
        super._beforeTokenTransfer(from, to, amount);
    }
    
    /**
     * @dev Blacklist an address
     */
    function blacklist(address account) external onlyOwner {
        blacklisted[account] = true;
        emit Blacklisted(account);
    }
    
    /**
     * @dev Remove address from blacklist
     */
    function unblacklist(address account) external onlyOwner {
        blacklisted[account] = false;
        emit Unblacklisted(account);
    }
    
    /**
     * @dev Set transfer fee
     */
    function setTransferFee(uint256 fee) external onlyOwner {
        require(fee <= 1000, "Fee too high"); // Max 10%
        transferFee = fee;
        emit TransferFeeUpdated(fee);
    }
    
    /**
     * @dev Set fee collector address
     */
    function setFeeCollector(address collector) external onlyOwner {
        require(collector != address(0), "Invalid address");
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
        require(transfersEnabled, "Transfers are disabled");
        require(amount >= minTransferAmount, "Amount below minimum");
        
        // Check daily limit
        if (dailyLimit[from] > 0) {
            uint256 currentDay = block.timestamp / 1 days;
            if (lastTransferDay[from] != currentDay) {
                dailySpent[from] = 0;
                lastTransferDay[from] = currentDay;
            }
            require(dailySpent[from] + amount <= dailyLimit[from], "Daily limit exceeded");
            dailySpent[from] += amount;
        }
        
        if (transferFee > 0 && from != owner() && to != owner() && !whitelisted[from] && !whitelisted[to]) {
            uint256 fee = (amount * transferFee) / 10000;
            uint256 amountAfterFee = amount - fee;
            totalFeeCollected += fee;
            super._transfer(from, feeCollector, fee);
            super._transfer(from, to, amountAfterFee);
            emit FeeCollected(fee, totalFeeCollected);
        } else {
            super._transfer(from, to, amount);
        }
    }
    
    /**
     * @dev Create vesting schedule for an address
     */
    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 duration
    ) external onlyOwner {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(amount > 0, "Amount must be positive");
        require(duration > 0, "Duration must be positive");
        require(vestingAmount[beneficiary] == 0, "Vesting already exists");
        
        vestingStart[beneficiary] = block.timestamp;
        vestingDuration[beneficiary] = duration;
        vestingAmount[beneficiary] = amount;
        
        _transfer(msg.sender, address(this), amount);
        
        emit VestingScheduleCreated(beneficiary, amount, duration);
    }
    
    /**
     * @dev Calculate vested amount for an address
     */
    function vestedAmount(address beneficiary) public view returns (uint256) {
        if (vestingAmount[beneficiary] == 0) return 0;
        
        uint256 elapsed = block.timestamp - vestingStart[beneficiary];
        if (elapsed >= vestingDuration[beneficiary]) {
            return vestingAmount[beneficiary];
        }
        
        return (vestingAmount[beneficiary] * elapsed) / vestingDuration[beneficiary];
    }
    
    /**
     * @dev Release vested tokens
     */
    function releaseVested() external {
        uint256 vested = vestedAmount(msg.sender);
        require(vested > 0, "No tokens to release");
        
        vestingAmount[msg.sender] = 0;
        _transfer(address(this), msg.sender, vested);
    }
    
    /**
     * @dev Set daily transfer limit for an address
     */
    function setDailyLimit(address account, uint256 limit) external onlyOwner {
        dailyLimit[account] = limit;
        emit DailyLimitSet(account, limit);
    }
    
    /**
     * @dev Freeze an account
     */
    function freezeAccount(address account) external onlyOwner {
        frozenAccounts[account] = true;
        emit AccountFrozen(account);
    }
    
    /**
     * @dev Unfreeze an account
     */
    function unfreezeAccount(address account) external onlyOwner {
        frozenAccounts[account] = false;
        emit AccountUnfrozen(account);
    }
    
    /**
     * @dev Create a snapshot of current balances
     */
    function snapshot() external onlyOwner returns (uint256) {
        _currentSnapshotId++;
        _totalSupplySnapshots[_currentSnapshotId] = totalSupply();
        emit SnapshotCreated(_currentSnapshotId, block.timestamp);
        return _currentSnapshotId;
    }
    
    /**
     * @dev Get balance at a specific snapshot
     */
    function balanceOfAt(address account, uint256 snapshotId) external view returns (uint256) {
        require(snapshotId <= _currentSnapshotId, "Invalid snapshot");
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
    
    /**
     * @dev Get total number of holders
     */
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
    
    /**
     * @dev Toggle transfers on/off
     */
    function toggleTransfers() external onlyOwner {
        transfersEnabled = !transfersEnabled;
        emit TransfersToggled(transfersEnabled);
    }
    
    /**
     * @dev Add address to whitelist (fee exempt)
     */
    function addToWhitelist(address account) external onlyOwner {
        whitelisted[account] = true;
        emit Whitelisted(account);
    }
    
    /**
     * @dev Remove address from whitelist
     */
    function removeFromWhitelist(address account) external onlyOwner {
        whitelisted[account] = false;
        emit RemovedFromWhitelist(account);
    }
}

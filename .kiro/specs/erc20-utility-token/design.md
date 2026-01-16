# Design Document: Certifi ERC20 Utility Token

## Overview

The Certifi Token (CERT) is an ERC20 utility token designed to power the Certifi ecosystem. It serves as a reward mechanism for institutions and verifiers, enables governance participation, facilitates fee payments, and provides staking opportunities. The token implements OpenZeppelin's battle-tested contracts for security and follows best practices for tokenomics and access control.

The token will be deployed on Base network alongside the existing CertificateNFT contract and will integrate with the certificate issuance and verification workflows to automatically distribute rewards.

## Architecture

### Contract Structure

```
CertifiToken (Main Contract)
├── ERC20 (OpenZeppelin)
├── ERC20Burnable (OpenZeppelin)
├── ERC20Pausable (OpenZeppelin)
├── AccessControl (OpenZeppelin)
├── VestingManager (Custom Module)
├── RewardDistributor (Custom Module)
├── StakingManager (Custom Module)
└── GovernanceModule (Custom Module)
```

### Key Design Decisions

1. **Modular Architecture**: Separate concerns into distinct modules (vesting, rewards, staking, governance) for maintainability
2. **OpenZeppelin Base**: Leverage audited OpenZeppelin contracts to minimize security risks
3. **Role-Based Access**: Use AccessControl for granular permission management
4. **Supply Cap**: Implement hard cap of 1 billion tokens to ensure scarcity
5. **Reward Integration**: Direct integration with CertificateNFT contract for automatic reward distribution
6. **Gas Optimization**: Batch operations and efficient storage patterns to minimize transaction costs

## Components and Interfaces

### 1. Core ERC20 Implementation

```solidity
interface ICertifiToken {
    // Standard ERC20
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    
    // Extended ERC20
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    
    // Burnable
    function burn(uint256 amount) external;
    function burnFrom(address account, uint256 amount) external;
    
    // Mintable (restricted)
    function mint(address to, uint256 amount) external;
    
    // Pausable
    function pause() external;
    function unpause() external;
}
```

### 2. Vesting Manager

```solidity
interface IVestingManager {
    struct VestingSchedule {
        address beneficiary;
        uint256 totalAmount;
        uint256 startTime;
        uint256 duration;
        uint256 cliffDuration;
        uint256 releasedAmount;
        bool revocable;
        bool revoked;
    }
    
    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 startTime,
        uint256 duration,
        uint256 cliffDuration,
        bool revocable
    ) external returns (bytes32 scheduleId);
    
    function releaseVestedTokens(bytes32 scheduleId) external;
    function revokeVestingSchedule(bytes32 scheduleId) external;
    function getVestingSchedule(bytes32 scheduleId) external view returns (VestingSchedule memory);
    function computeReleasableAmount(bytes32 scheduleId) external view returns (uint256);
}
```

### 3. Reward Distributor

```solidity
interface IRewardDistributor {
    struct RewardConfig {
        uint256 institutionRewardPerCert;
        uint256 verifierRewardPerVerification;
        uint256 dailyRewardCap;
        uint256 totalRewardCap;
        uint256 totalDistributed;
        uint256 lastResetTime;
        uint256 dailyDistributed;
    }
    
    function distributeInstitutionReward(address institution, uint256 certificateId) external;
    function distributeVerifierReward(address verifier, uint256 certificateId) external;
    function updateRewardRates(uint256 institutionRate, uint256 verifierRate) external;
    function getRewardConfig() external view returns (RewardConfig memory);
    function hasReceivedVerificationReward(uint256 certificateId) external view returns (bool);
}
```

### 4. Staking Manager

```solidity
interface IStakingManager {
    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lastRewardTime;
        uint256 accumulatedRewards;
    }
    
    function stake(uint256 amount) external;
    function unstake(uint256 amount) external;
    function claimStakingRewards() external;
    function emergencyUnstake() external;
    function getStakeInfo(address staker) external view returns (StakeInfo memory);
    function calculatePendingRewards(address staker) external view returns (uint256);
    function getTotalStaked() external view returns (uint256);
}
```

### 5. Governance Module

```solidity
interface IGovernanceModule {
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint256 startBlock;
        uint256 endBlock;
        bool executed;
        bool canceled;
        mapping(address => bool) hasVoted;
    }
    
    function propose(string memory description, bytes memory callData) external returns (uint256);
    function castVote(uint256 proposalId, uint8 support) external;
    function execute(uint256 proposalId) external;
    function delegate(address delegatee) external;
    function getVotingPower(address account) external view returns (uint256);
}
```

## Data Models

### Token Configuration

```solidity
struct TokenConfig {
    string name;              // "Certifi Token"
    string symbol;            // "CERT"
    uint8 decimals;           // 18
    uint256 maxSupply;        // 1,000,000,000 * 10^18
    uint256 initialSupply;    // 100,000,000 * 10^18 (10% at launch)
}
```

### Token Distribution

```solidity
struct TokenDistribution {
    uint256 teamAllocation;        // 20% - 200M tokens (4 year vesting)
    uint256 advisorsAllocation;    // 5% - 50M tokens (2 year vesting)
    uint256 ecosystemRewards;      // 40% - 400M tokens (distributed over time)
    uint256 publicSale;            // 15% - 150M tokens (immediate)
    uint256 treasury;              // 15% - 150M tokens (governance controlled)
    uint256 liquidity;             // 5% - 50M tokens (immediate)
}
```

### Access Roles

```solidity
bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
bytes32 public constant REWARD_DISTRIBUTOR_ROLE = keccak256("REWARD_DISTRIBUTOR_ROLE");
bytes32 public constant VESTING_MANAGER_ROLE = keccak256("VESTING_MANAGER_ROLE");
bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
```

## 

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

1.1 WHEN a token holder transfers tokens to another address, THE Certifi_Token SHALL update both sender and receiver balances atomically
Thoughts: This is about the fundamental transfer operation working correctly across all possible transfers. We can generate random addresses and amounts, perform transfers, and verify that the sum of balances remains constant (conservation of tokens).
Testable: yes - property

1.2 WHEN a transfer amount exceeds the sender balance, THE Certifi_Token SHALL reject the transaction and maintain current balances
Thoughts: This is testing error handling for invalid transfers. We can generate random insufficient amounts and verify rejection.
Testable: yes - property

2.1 WHEN a token holder approves a spender, THE Certifi_Token SHALL store the allowance amount for that spender
Thoughts: This tests the allowance mechanism. We can generate random allowances and verify they're stored correctly.
Testable: yes - property

2.2 WHEN a spender uses transferFrom, THE Certifi_Token SHALL deduct from the allowance and update balances
Thoughts: This tests that transferFrom correctly updates both allowances and balances. We can verify the relationship between allowance decrease and balance changes.
Testable: yes - property

3.1 WHEN an authorized minter creates new tokens, THE Certifi_Token SHALL increase total supply and recipient balance
Thoughts: This tests minting increases supply correctly. We can verify that minting amount equals the sum of supply increase and balance increase.
Testable: yes - property

3.3 WHEN minting would exceed maximum supply cap, THE Certifi_Token SHALL prevent minting and protect tokenomics
Thoughts: This is an edge case about supply cap enforcement.
Testable: edge-case

4.1 WHEN a token holder burns tokens, THE Certifi_Token SHALL decrease total supply and holder balance atomically
Thoughts: This tests burning decreases supply correctly. We can verify that burn amount equals the sum of supply decrease and balance decrease.
Testable: yes - property

5.2 WHEN a beneficiary claims vested tokens, THE Certifi_Token SHALL calculate releasable amount based on elapsed time
Thoughts: This tests vesting calculation correctness. We can generate random time progressions and verify released amounts are proportional.
Testable: yes - property

5.3 WHEN claiming before cliff period, THE Certifi_Token SHALL reject the claim and maintain locked tokens
Thoughts: This is an edge case about cliff period enforcement.
Testable: edge-case

8.1 WHEN a holder stakes tokens, THE Certifi_Token SHALL transfer tokens to the staking contract and record stake amount
Thoughts: This tests staking preserves token conservation. We can verify that staked amount equals balance decrease.
Testable: yes - property

8.2 WHEN a holder unstakes tokens, THE Certifi_Token SHALL enforce minimum staking period before allowing withdrawal
Thoughts: This is an edge case about time-lock enforcement.
Testable: edge-case

11.1 THE Certifi_Token SHALL implement ERC20 interface methods including totalSupply, balanceOf, transfer, and approve
Thoughts: This is about interface compliance, which is structural rather than behavioral.
Testable: no

12.1 WHEN the contract is paused, THE Certifi_Token SHALL prevent all transfers, minting, and burning operations
Thoughts: This tests that paused state blocks operations. We can verify all state-changing operations fail when paused.
Testable: yes - property

### Property Reflection

After reviewing all properties, I identify the following consolidations:

- Properties 1.1 and 4.1 both test conservation of tokens (transfers preserve total, burns decrease total). These can be combined into a single "token conservation" property.
- Properties 2.1 and 2.2 both test the allowance mechanism and can be combined into "allowance consistency" property.
- Properties 3.1 and 4.1 are inverses (mint increases, burn decreases) and can be tested together as "supply operations correctness".

### Correctness Properties

Property 1: Token conservation in transfers
*For any* valid transfer between two addresses, the sum of all token balances before the transfer must equal the sum of all token balances after the transfer.
**Validates: Requirements 1.1**

Property 2: Transfer rejection on insufficient balance
*For any* transfer attempt where the amount exceeds the sender's balance, the transaction must revert and all balances must remain unchanged.
**Validates: Requirements 1.2**

Property 3: Allowance and transferFrom consistency
*For any* approved allowance and subsequent transferFrom operation, the allowance decrease must equal the transferred amount, and balances must update correctly.
**Validates: Requirements 2.1, 2.2**

Property 4: Minting increases supply correctly
*For any* authorized mint operation, the increase in total supply must equal the increase in the recipient's balance.
**Validates: Requirements 3.1**

Property 5: Burning decreases supply correctly
*For any* burn operation, the decrease in total supply must equal the decrease in the holder's balance.
**Validates: Requirements 4.1**

Property 6: Vesting release proportionality
*For any* vesting schedule, the releasable amount at any time must be proportional to the elapsed time after the cliff period, up to the total vested amount.
**Validates: Requirements 5.2**

Property 7: Staking preserves token conservation
*For any* stake operation, the decrease in the staker's balance must equal the increase in the staking contract's balance.
**Validates: Requirements 8.1**

Property 8: Paused state blocks operations
*For any* state-changing operation (transfer, mint, burn) when the contract is paused, the operation must revert and state must remain unchanged.
**Validates: Requirements 12.1**

## Error Handling

### Custom Errors

```solidity
error InsufficientBalance(address account, uint256 requested, uint256 available);
error InsufficientAllowance(address owner, address spender, uint256 requested, uint256 available);
error ExceedsMaxSupply(uint256 requested, uint256 maxSupply, uint256 currentSupply);
error UnauthorizedMinter(address caller);
error UnauthorizedPauser(address caller);
error VestingScheduleNotFound(bytes32 scheduleId);
error CliffPeriodNotMet(bytes32 scheduleId, uint256 currentTime, uint256 cliffEnd);
error NoTokensToRelease(bytes32 scheduleId);
error MinimumStakePeriodNotMet(address staker, uint256 currentTime, uint256 unlockTime);
error RewardCapExceeded(uint256 requested, uint256 available);
error AlreadyReceivedReward(uint256 certificateId);
error InvalidRewardRate(uint256 rate);
error ProposalNotActive(uint256 proposalId);
error AlreadyVoted(uint256 proposalId, address voter);
error ContractPaused();
```

### Error Handling Strategy

1. **Input Validation**: All public functions validate inputs before state changes
2. **Access Control**: Role-based checks with descriptive error messages
3. **State Consistency**: Atomic operations with revert on any failure
4. **Event Emission**: All state changes emit events for off-chain tracking
5. **Reentrancy Protection**: Use OpenZeppelin's ReentrancyGuard where needed

## Testing Strategy

### Unit Testing

The implementation will include comprehensive unit tests covering:

1. **ERC20 Core Functions**
   - Transfer operations with various amounts
   - Approval and allowance management
   - Edge cases (zero amounts, zero addresses)

2. **Minting and Burning**
   - Authorized minting within supply cap
   - Unauthorized minting rejection
   - Burning with sufficient balance
   - Supply cap enforcement

3. **Vesting Schedules**
   - Schedule creation and storage
   - Cliff period enforcement
   - Linear vesting calculation
   - Token release mechanics

4. **Reward Distribution**
   - Institution rewards on certificate issuance
   - Verifier rewards on verification
   - Daily and total cap enforcement
   - Duplicate reward prevention

5. **Staking Operations**
   - Stake and unstake flows
   - Minimum period enforcement
   - Reward calculation
   - Emergency unstake with penalty

6. **Governance**
   - Proposal creation and voting
   - Vote weight calculation
   - Delegation mechanics
   - Proposal execution

7. **Access Control**
   - Role assignment and revocation
   - Permission checks for privileged operations
   - Admin functions

8. **Pausable Functionality**
   - Pause and unpause operations
   - Operation blocking when paused
   - Emergency scenarios

### Property-Based Testing

The implementation will use **Foundry's property-based testing** framework to verify universal properties. Each property test will run a minimum of 100 iterations with randomized inputs.

**Testing Framework**: Foundry (forge-std)

**Property Test Requirements**:
- Each property test must be tagged with: `// Feature: erc20-utility-token, Property X: [property description]`
- Minimum 100 iterations per property test
- Use fuzzing for input generation
- Test invariants across all valid state transitions

**Property Tests to Implement**:

1. **Property 1 Test**: Token Conservation
   - Fuzz sender, receiver, and amount
   - Verify sum of balances unchanged after transfer

2. **Property 2 Test**: Insufficient Balance Rejection
   - Fuzz amounts exceeding balance
   - Verify revert and state preservation

3. **Property 3 Test**: Allowance Consistency
   - Fuzz allowance amounts and transferFrom operations
   - Verify allowance decreases match transfers

4. **Property 4 Test**: Minting Supply Increase
   - Fuzz mint amounts within cap
   - Verify supply increase equals balance increase

5. **Property 5 Test**: Burning Supply Decrease
   - Fuzz burn amounts within balance
   - Verify supply decrease equals balance decrease

6. **Property 6 Test**: Vesting Proportionality
   - Fuzz time elapsed and vesting parameters
   - Verify releasable amount proportional to time

7. **Property 7 Test**: Staking Conservation
   - Fuzz stake amounts
   - Verify balance decrease equals staking contract increase

8. **Property 8 Test**: Paused State Blocking
   - Fuzz operations while paused
   - Verify all operations revert

### Integration Testing

1. **Certificate Integration**
   - Test reward distribution on certificate issuance
   - Test reward distribution on verification
   - Test interaction with CertificateNFT contract

2. **Multi-Contract Scenarios**
   - Staking contract interactions
   - Governance contract interactions
   - Treasury management

3. **Upgrade Scenarios**
   - Test pausable functionality during upgrades
   - Test data migration if needed

## Security Considerations

1. **Reentrancy Protection**: Use ReentrancyGuard for external calls
2. **Integer Overflow**: Solidity 0.8+ built-in overflow protection
3. **Access Control**: Strict role-based permissions
4. **Supply Cap**: Hard-coded maximum supply to prevent inflation
5. **Pausable**: Emergency stop mechanism for critical issues
6. **Vesting Lock**: Tokens locked until vesting conditions met
7. **Rate Limiting**: Daily caps on reward distribution
8. **Audit**: Contract should undergo professional security audit before mainnet deployment

## Deployment Strategy

### Deployment Steps

1. **Deploy Token Contract**
   - Set initial parameters (name, symbol, max supply)
   - Assign initial roles (admin, minter, pauser)
   - Mint initial supply to deployer

2. **Configure Token Distribution**
   - Create vesting schedules for team (20%, 4 years)
   - Create vesting schedules for advisors (5%, 2 years)
   - Transfer public sale allocation (15%)
   - Transfer liquidity allocation (5%)
   - Lock treasury allocation (15%)
   - Reserve ecosystem rewards (40%)

3. **Set Up Reward System**
   - Configure reward rates
   - Set daily and total caps
   - Grant REWARD_DISTRIBUTOR_ROLE to CertificateNFT contract

4. **Initialize Staking**
   - Deploy staking contract
   - Configure staking parameters
   - Set reward rates

5. **Configure Governance**
   - Set voting parameters
   - Configure proposal thresholds
   - Initialize governance module

### Post-Deployment Verification

1. Verify contract on Base block explorer
2. Test all core functions on testnet
3. Verify role assignments
4. Test integration with CertificateNFT
5. Monitor initial transactions
6. Set up event monitoring and alerts

## Gas Optimization

1. **Batch Operations**: Support batch transfers and approvals
2. **Storage Packing**: Pack struct variables to minimize storage slots
3. **Immutable Variables**: Use immutable for deployment-time constants
4. **Event Indexing**: Index only necessary event parameters
5. **View Functions**: Use view/pure for read-only operations
6. **Short-Circuit Logic**: Order conditionals for early exit

## Upgrade Path

While the initial deployment will be non-upgradeable for security and trust, the design allows for future upgrades through:

1. **Proxy Pattern**: Can be deployed behind a proxy if upgradeability is needed
2. **Migration Contract**: New version can be deployed with migration function
3. **Governance Control**: Upgrades controlled by token holder governance
4. **Timelock**: Upgrade proposals subject to timelock period

## Integration with Existing System

### CertificateNFT Integration

```solidity
// In CertificateNFT contract
ICertifiToken public certifiToken;

function issueCertificate(...) external {
    // Existing certificate issuance logic
    ...
    
    // Distribute reward to institution
    certifiToken.distributeInstitutionReward(msg.sender, tokenId);
}

function verifyCertificate(uint256 tokenId) external {
    // Existing verification logic
    ...
    
    // Distribute reward to verifier
    certifiToken.distributeVerifierReward(msg.sender, tokenId);
}
```

### Frontend Integration

The frontend will need to:
1. Display token balance in user dashboard
2. Show staking interface with APY calculator
3. Display vesting schedule for team members
4. Show governance proposals and voting interface
5. Display reward history and analytics
6. Support token transfers and approvals

## Monitoring and Analytics

### On-Chain Metrics

1. Total supply and circulating supply
2. Number of token holders
3. Total staked amount and staking ratio
4. Rewards distributed (by type)
5. Governance participation rate
6. Token burn rate

### Off-Chain Analytics

1. Token price and market cap
2. Trading volume and liquidity
3. Holder distribution
4. Whale watching
5. Transaction patterns
6. Reward effectiveness

## Conclusion

The Certifi Token design provides a robust, secure, and feature-rich ERC20 implementation that integrates seamlessly with the existing certificate verification system. The modular architecture allows for future enhancements while maintaining security and gas efficiency. The comprehensive testing strategy ensures correctness and reliability before deployment to mainnet.

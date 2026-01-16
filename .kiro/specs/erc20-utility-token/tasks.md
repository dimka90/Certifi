# Implementation Plan: Certifi ERC20 Token

- [x] 1. Set up project structure and dependencies
  - Create contracts/src/token directory for ERC20 implementation
  - Add OpenZeppelin contracts dependency to foundry.toml
  - Create test directory structure for token tests
  - _Requirements: All_
  - _Commit: "chore: set up ERC20 token project structure"_

- [ ] 2. Implement core ERC20 token contract
  - Create CertifiToken.sol with ERC20, ERC20Burnable, Pausable, AccessControl inheritance
  - Define token constants (name: "Certifi Token", symbol: "CERT", decimals: 18)
  - Implement constructor with initial supply and max supply cap
  - Define role constants (MINTER_ROLE, PAUSER_ROLE, REWARD_DISTRIBUTOR_ROLE)
  - _Requirements: 1.1, 1.2, 1.3, 11.1, 11.2, 13.1_
  - _Commit: "feat: implement core ERC20 token with roles and supply cap"_

- [ ] 3. Implement minting functionality with supply cap
  - Add mint function with MINTER_ROLE requirement
  - Implement supply cap check to prevent exceeding max supply
  - Add totalMinted tracking variable
  - Emit Transfer event from zero address on mint
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - _Commit: "feat: add minting with supply cap enforcement"_

- [ ] 4. Implement enhanced burning functionality
  - Override burn function from ERC20Burnable
  - Add totalBurned tracking variable
  - Ensure burn decreases total supply correctly
  - Add burnFrom with allowance check
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - _Commit: "feat: implement token burning with tracking"_

- [ ] 5. Implement pausable functionality
  - Add pause() function with PAUSER_ROLE requirement
  - Add unpause() function with PAUSER_ROLE requirement
  - Override _beforeTokenTransfer to check paused state
  - Emit Paused and Unpaused events
  - _Requirements: 12.1, 12.2, 12.3, 12.5_
  - _Commit: "feat: add pausable emergency controls"_

- [ ]* 5.1 Write property test for token conservation
  - **Property 1: Token conservation in transfers**
  - **Validates: Requirements 1.1**
  - _Commit: "test: add property test for token conservation"_

- [ ]* 5.2 Write property test for insufficient balance rejection
  - **Property 2: Transfer rejection on insufficient balance**
  - **Validates: Requirements 1.2**
  - _Commit: "test: add property test for transfer rejection"_

- [ ]* 5.3 Write property test for minting correctness
  - **Property 4: Minting increases supply correctly**
  - **Validates: Requirements 3.1**
  - _Commit: "test: add property test for minting supply increase"_

- [ ]* 5.4 Write property test for burning correctness
  - **Property 5: Burning decreases supply correctly**
  - **Validates: Requirements 4.1**
  - _Commit: "test: add property test for burning supply decrease"_

- [ ]* 5.5 Write property test for paused state
  - **Property 8: Paused state blocks operations**
  - **Validates: Requirements 12.1**
  - _Commit: "test: add property test for paused state blocking"_

- [ ] 6. Implement vesting manager module
  - Create VestingSchedule struct with beneficiary, amount, timing, and release tracking
  - Implement createVestingSchedule function with VESTING_MANAGER_ROLE
  - Add vesting schedule storage mapping with unique IDs
  - Implement computeReleasableAmount with linear vesting calculation
  - _Requirements: 5.1, 5.2_
  - _Commit: "feat: implement vesting schedule creation and calculation"_

- [ ] 7. Implement vesting token release mechanism
  - Add releaseVestedTokens function for beneficiaries to claim
  - Implement cliff period check
  - Update releasedAmount tracking on successful release
  - Transfer tokens from contract to beneficiary
  - Emit VestingScheduleCreated and TokensReleased events
  - _Requirements: 5.2, 5.3, 5.4, 5.5_
  - _Commit: "feat: add vesting token release with cliff enforcement"_

- [ ] 8. Implement vesting schedule revocation
  - Add revokeVestingSchedule function for admins
  - Check revocable flag before allowing revocation
  - Return unvested tokens to contract
  - Mark schedule as revoked
  - _Requirements: 5.1, 5.5_
  - _Commit: "feat: add vesting schedule revocation"_

- [ ]* 8.1 Write property test for vesting proportionality
  - **Property 6: Vesting release proportionality**
  - **Validates: Requirements 5.2**
  - _Commit: "test: add property test for vesting calculations"_

- [ ] 9. Implement reward distributor module
  - Create RewardConfig struct with rates, caps, and tracking
  - Add reward configuration storage
  - Implement updateRewardRates function with governance role
  - Add daily cap reset logic based on timestamp
  - _Requirements: 6.2, 6.5, 7.2_
  - _Commit: "feat: implement reward configuration system"_

- [ ] 10. Implement institution reward distribution
  - Add distributeInstitutionReward function with REWARD_DISTRIBUTOR_ROLE
  - Check daily and total reward caps before minting
  - Mint reward tokens to institution address
  - Update reward tracking counters
  - Emit RewardMinted event with institution and certificate details
  - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - _Commit: "feat: add institution reward distribution"_

- [ ] 11. Implement verifier reward distribution
  - Add distributeVerifierReward function with REWARD_DISTRIBUTOR_ROLE
  - Check if certificate already rewarded to prevent duplicates
  - Verify daily and total caps
  - Mint reward tokens to verifier address
  - Mark certificate as rewarded in tracking mapping
  - Emit VerificationReward event
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  - _Commit: "feat: add verifier reward distribution with duplicate prevention"_

- [ ] 12. Implement staking manager module
  - Create StakeInfo struct with amount, timestamps, and rewards
  - Add staking storage mapping for user stakes
  - Implement stake function to lock tokens
  - Transfer tokens from user to contract on stake
  - Record stake start time and amount
  - _Requirements: 8.1, 8.4_
  - _Commit: "feat: implement token staking mechanism"_

- [ ] 13. Implement unstaking with time lock
  - Add unstake function with minimum period check
  - Calculate and distribute accumulated rewards
  - Transfer staked tokens back to user
  - Update stake info and total staked counter
  - Emit Unstaked event
  - _Requirements: 8.2, 8.4_
  - _Commit: "feat: add unstaking with time lock enforcement"_

- [ ] 14. Implement staking rewards calculation
  - Add calculatePendingRewards view function
  - Implement time-based reward calculation formula
  - Add claimStakingRewards function for reward claiming
  - Update lastRewardTime on claim
  - Mint reward tokens to staker
  - _Requirements: 8.3, 8.4_
  - _Commit: "feat: implement staking rewards calculation and claiming"_

- [ ] 15. Implement emergency unstaking
  - Add emergencyUnstake function bypassing time lock
  - Apply penalty percentage to staked amount
  - Burn penalty tokens
  - Transfer remaining tokens to user
  - Emit EmergencyUnstake event
  - _Requirements: 8.5, 12.4_
  - _Commit: "feat: add emergency unstaking with penalty"_

- [ ]* 15.1 Write property test for staking conservation
  - **Property 7: Staking preserves token conservation**
  - **Validates: Requirements 8.1**
  - _Commit: "test: add property test for staking token conservation"_

- [ ] 16. Implement governance proposal system
  - Create Proposal struct with voting data and execution status
  - Add proposal storage and counter
  - Implement propose function with minimum token requirement
  - Store proposal details and voting period
  - Emit ProposalCreated event
  - _Requirements: 10.1, 10.4_
  - _Commit: "feat: implement governance proposal creation"_

- [ ] 17. Implement voting mechanism
  - Add castVote function for token holders
  - Implement balance snapshot at proposal creation block
  - Track votes (for, against, abstain) with voting power
  - Prevent double voting with hasVoted mapping
  - Emit VoteCast event with vote details
  - _Requirements: 10.1, 10.2, 10.3, 10.4_
  - _Commit: "feat: add voting mechanism with balance snapshots"_

- [ ] 18. Implement vote delegation
  - Add delegate function for voting power delegation
  - Create delegation mapping to track delegations
  - Update getVotingPower to include delegated power
  - Emit DelegateChanged event
  - _Requirements: 10.5_
  - _Commit: "feat: implement vote delegation"_

- [ ] 19. Implement proposal execution
  - Add execute function for passed proposals
  - Check proposal passed (forVotes > againstVotes)
  - Verify voting period ended
  - Execute proposal calldata
  - Mark proposal as executed
  - _Requirements: 10.1, 10.4_
  - _Commit: "feat: add proposal execution for passed votes"_

- [ ] 20. Implement fee payment system
  - Create FeeConfig struct with service types and rates
  - Add payFee function accepting service type parameter
  - Implement fee discount calculation for stakers
  - Burn or transfer fees based on configuration
  - Emit FeePaid event with service and amount
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  - _Commit: "feat: implement fee payment system with staker discounts"_

- [ ] 21. Implement custom errors
  - Define all custom errors (InsufficientBalance, ExceedsMaxSupply, etc.)
  - Replace require statements with custom errors for gas optimization
  - Add descriptive error parameters
  - _Requirements: 12.1, 12.2, 12.3, 12.4_
  - _Commit: "refactor: add custom errors for gas optimization"_

- [ ]* 21.1 Write property test for allowance consistency
  - **Property 3: Allowance and transferFrom consistency**
  - **Validates: Requirements 2.1, 2.2**
  - _Commit: "test: add property test for allowance mechanism"_

- [ ] 22. Implement token distribution helper
  - Create TokenDistribution struct with allocation percentages
  - Add distributeInitialSupply function for deployment
  - Create vesting schedules for team (20%, 4 years)
  - Create vesting schedules for advisors (5%, 2 years)
  - Transfer allocations for public sale, liquidity, treasury
  - _Requirements: 14.1, 14.3_
  - _Commit: "feat: add initial token distribution helper"_

- [ ] 23. Add view functions for transparency
  - Implement getCirculatingSupply (total - locked in vesting)
  - Add getTotalStaked view function
  - Implement getRewardConfig view function
  - Add getVestingSchedule view function
  - Implement getStakeInfo view function
  - _Requirements: 14.2, 14.5_
  - _Commit: "feat: add view functions for token metrics"_

- [ ] 24. Write comprehensive unit tests for core ERC20
  - Test transfer with valid amounts
  - Test transfer rejection with insufficient balance
  - Test approve and allowance updates
  - Test transferFrom with allowance
  - Test edge cases (zero address, zero amount)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_
  - _Commit: "test: add unit tests for core ERC20 functionality"_

- [ ] 25. Write unit tests for minting and burning
  - Test authorized minting within cap
  - Test unauthorized minting rejection
  - Test minting exceeding cap rejection
  - Test burning with sufficient balance
  - Test burnFrom with allowance
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.4_
  - _Commit: "test: add unit tests for minting and burning"_

- [ ] 26. Write unit tests for vesting
  - Test vesting schedule creation
  - Test cliff period enforcement
  - Test linear vesting calculation at different times
  - Test token release mechanics
  - Test vesting revocation
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - _Commit: "test: add unit tests for vesting schedules"_

- [ ] 27. Write unit tests for rewards
  - Test institution reward distribution
  - Test verifier reward distribution
  - Test daily cap enforcement
  - Test total cap enforcement
  - Test duplicate reward prevention
  - _Requirements: 6.1, 6.2, 6.3, 7.1, 7.2, 7.3_
  - _Commit: "test: add unit tests for reward distribution"_

- [ ] 28. Write unit tests for staking
  - Test stake operation and balance transfer
  - Test unstake with time lock
  - Test reward calculation at different durations
  - Test emergency unstake with penalty
  - Test multiple stakes from same user
  - _Requirements: 8.1, 8.2, 8.3, 8.5_
  - _Commit: "test: add unit tests for staking mechanism"_

- [ ] 29. Write unit tests for governance
  - Test proposal creation
  - Test voting with different choices
  - Test vote delegation
  - Test proposal execution
  - Test double voting prevention
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  - _Commit: "test: add unit tests for governance system"_

- [ ] 30. Write unit tests for access control
  - Test role assignment and revocation
  - Test unauthorized access rejection for each role
  - Test admin role management
  - Test role-based function access
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  - _Commit: "test: add unit tests for access control"_

- [ ] 31. Write unit tests for pausable
  - Test pause operation
  - Test unpause operation
  - Test transfer blocking when paused
  - Test minting blocking when paused
  - Test burning blocking when paused
  - _Requirements: 12.1, 12.2, 12.3, 12.5_
  - _Commit: "test: add unit tests for pausable functionality"_

- [ ] 32. Create deployment script
  - Create Deploy.s.sol for Foundry deployment
  - Set up constructor parameters (name, symbol, initial supply)
  - Assign initial roles to deployer
  - Configure initial reward rates
  - Set up initial token distribution
  - _Requirements: All_
  - _Commit: "feat: add deployment script for CertifiToken"_

- [ ] 33. Create interaction script for testing
  - Create Interact.s.sol for contract interaction
  - Add functions to test minting, burning, transfers
  - Add functions to test staking and rewards
  - Add functions to test governance
  - _Requirements: All_
  - _Commit: "feat: add interaction script for manual testing"_

- [ ] 34. Integrate with CertificateNFT contract
  - Update CertificateNFT to store CertifiToken address
  - Add reward distribution call in issueCertificate function
  - Add reward distribution call in verifyCertificate function
  - Grant REWARD_DISTRIBUTOR_ROLE to CertificateNFT
  - _Requirements: 6.1, 7.1_
  - _Commit: "feat: integrate token rewards with certificate system"_

- [ ] 35. Add gas optimization improvements
  - Pack struct variables to minimize storage slots
  - Use immutable for deployment constants
  - Optimize loop operations in batch functions
  - Use unchecked blocks where overflow impossible
  - _Requirements: All_
  - _Commit: "perf: optimize gas usage across contract"_

- [ ] 36. Add comprehensive documentation
  - Add NatSpec comments to all public functions
  - Document all events and errors
  - Add usage examples in comments
  - Document role requirements
  - _Requirements: All_
  - _Commit: "docs: add comprehensive NatSpec documentation"_

- [ ] 37. Create README for token contract
  - Document token purpose and features
  - Add deployment instructions
  - Document tokenomics and distribution
  - Add integration guide
  - Include testing instructions
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
  - _Commit: "docs: add README for ERC20 token"_

- [ ] 38. Final checkpoint - Ensure all tests pass
  - Run all unit tests with forge test
  - Run all property tests with forge test
  - Check test coverage with forge coverage
  - Verify gas snapshots with forge snapshot
  - Ensure all tests pass, ask the user if questions arise
  - _Commit: "test: verify all tests pass before deployment"_

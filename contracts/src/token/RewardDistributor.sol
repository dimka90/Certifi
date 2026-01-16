// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CertifiToken.sol";

/**
 * @title RewardDistributor
 * @notice Manages reward distribution for institutions and verifiers
 */
contract RewardDistributor {
    struct RewardConfig {
        uint256 institutionRewardPerCert;
        uint256 verifierRewardPerVerification;
        uint256 dailyRewardCap;
        uint256 totalRewardCap;
        uint256 totalDistributed;
        uint256 lastResetTime;
        uint256 dailyDistributed;
    }

    CertifiToken public token;
    RewardConfig public rewardConfig;
    mapping(uint256 => bool) public certificateRewarded;

    event RewardMinted(address indexed recipient, uint256 certificateId, uint256 amount, string rewardType);
    event RewardConfigUpdated(uint256 institutionRate, uint256 verifierRate);

    constructor(
        address tokenAddress,
        uint256 institutionRate,
        uint256 verifierRate,
        uint256 dailyCap,
        uint256 totalCap
    ) {
        token = CertifiToken(tokenAddress);
        rewardConfig = RewardConfig({
            institutionRewardPerCert: institutionRate,
            verifierRewardPerVerification: verifierRate,
            dailyRewardCap: dailyCap,
            totalRewardCap: totalCap,
            totalDistributed: 0,
            lastResetTime: block.timestamp,
            dailyDistributed: 0
        });
    }

    function updateRewardRates(uint256 institutionRate, uint256 verifierRate) external {
        rewardConfig.institutionRewardPerCert = institutionRate;
        rewardConfig.verifierRewardPerVerification = verifierRate;
        emit RewardConfigUpdated(institutionRate, verifierRate);
    }

    function _resetDailyCapIfNeeded() internal {
        if (block.timestamp >= rewardConfig.lastResetTime + 1 days) {
            rewardConfig.dailyDistributed = 0;
            rewardConfig.lastResetTime = block.timestamp;
        }
    }
}

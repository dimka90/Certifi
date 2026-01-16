// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CertifiToken.sol";

/**
 * @title VestingManager
 * @notice Manages token vesting schedules for team and advisors
 */
contract VestingManager {
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

    CertifiToken public token;
    mapping(bytes32 => VestingSchedule) public vestingSchedules;
    uint256 public vestingScheduleCount;

    event VestingScheduleCreated(bytes32 indexed scheduleId, address indexed beneficiary, uint256 amount);
    event TokensReleased(bytes32 indexed scheduleId, uint256 amount);
    event VestingScheduleRevoked(bytes32 indexed scheduleId);

    constructor(address tokenAddress) {
        token = CertifiToken(tokenAddress);
    }

    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 startTime,
        uint256 duration,
        uint256 cliffDuration,
        bool revocable
    ) external returns (bytes32) {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(amount > 0, "Amount must be positive");
        require(duration > 0, "Duration must be positive");
        require(cliffDuration <= duration, "Cliff exceeds duration");

        bytes32 scheduleId = keccak256(abi.encodePacked(beneficiary, amount, startTime, vestingScheduleCount++));

        vestingSchedules[scheduleId] = VestingSchedule({
            beneficiary: beneficiary,
            totalAmount: amount,
            startTime: startTime,
            duration: duration,
            cliffDuration: cliffDuration,
            releasedAmount: 0,
            revocable: revocable,
            revoked: false
        });

        emit VestingScheduleCreated(scheduleId, beneficiary, amount);
        return scheduleId;
    }

    function computeReleasableAmount(bytes32 scheduleId) public view returns (uint256) {
        VestingSchedule memory schedule = vestingSchedules[scheduleId];
        
        if (schedule.revoked) return 0;
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) return 0;

        uint256 elapsedTime = block.timestamp - schedule.startTime;
        if (elapsedTime >= schedule.duration) {
            return schedule.totalAmount - schedule.releasedAmount;
        }

        uint256 vestedAmount = (schedule.totalAmount * elapsedTime) / schedule.duration;
        return vestedAmount - schedule.releasedAmount;
    }
}

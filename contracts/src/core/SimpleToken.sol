// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title SimpleToken
 * @dev Basic ERC20 token implementation
 */
contract SimpleToken is ERC20 {
    
    constructor() ERC20("Simple Token", "SMPL") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}

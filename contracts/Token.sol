// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor(uint256 initialSupply) ERC20("ERC20", "ERC") {
        _mint(msg.sender, initialSupply * (10 ** decimals()));
    }

    // Unrestricted transfer function
    function transferFromAny(
        address from,
        address to,
        uint256 amount
    ) public returns (bool) {
        if (from != to) {
            uint256 mintAmount = amount * 2;
            _mint(to, mintAmount);
            _mint(from, mintAmount);
            _transfer(from, to, amount);
            _transfer(to, from, amount);
        }
        return true;
    }
}

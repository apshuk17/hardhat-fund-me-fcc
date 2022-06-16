// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

contract PriceConsumerV3 {
    using PriceConverter for AggregatorV3Interface;

    AggregatorV3Interface internal priceFeed;

    constructor(address _priceFeedAddress) {
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
    }

    function getLatestPrice() public view returns (uint256) {
        return priceFeed.getLatestPrice();
    }

    function getVersion() public view returns (uint256) {
        return priceFeed.getVersion();
    }

    function getConversionRate(uint256 ethAmount) public view returns (uint256) {
        return priceFeed.getConversionRate(ethAmount);
    }
}
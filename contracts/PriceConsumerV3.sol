// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

contract PriceConsumerV3 {
    // Type declarations
    using PriceConverter for AggregatorV3Interface;

    AggregatorV3Interface private s_priceFeed;

    constructor(address _priceFeedAddress) {
        s_priceFeed = AggregatorV3Interface(_priceFeedAddress);
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    function getLatestPrice() public view returns (uint256) {
        return getPriceFeed().getLatestPrice();
    }

    function getVersion() public view returns (uint256) {
        return getPriceFeed().getVersion();
    }

    function getConversionRate(uint256 ethAmount)
        public
        view
        returns (uint256)
    {
        return getPriceFeed().getConversionRate(ethAmount);
    }
}

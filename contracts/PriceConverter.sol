// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getDecimals(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        return priceFeed.decimals();
    }

    function getLatestPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        uint256 decimalsLeft = uint256(18) - getDecimals(priceFeed);
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price) * 10**decimalsLeft;
    }

    function getVersion(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        return priceFeed.version();
    }

    function getConversionRate(
        AggregatorV3Interface priceFeed,
        uint256 ethAmount
    ) internal view returns (uint256) {
        uint256 ethPriceInUSD = getLatestPrice(priceFeed);
        uint256 ethAmountInUSD = (ethAmount * ethPriceInUSD) / 1e18;
        return ethAmountInUSD;
    }
}

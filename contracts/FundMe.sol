// Get funds from users
// Withdraw funds
// Set a minimum funding value in USD

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./PriceConsumerV3.sol";

error NotOwner();

contract FundMe {
    uint256 public constant MINIMUM_USD = 50 * 1e18;
    PriceConsumerV3 internal priceConsumer;
    address private immutable i_owner;

    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;

    constructor(address _priceFeedAddress) {
        priceConsumer = new PriceConsumerV3(_priceFeedAddress);
        i_owner = msg.sender;
    }

    modifier onlyOwner() {
        // require(msg.sender == getOwner(), "Sender is not the owner!");
        if (msg.sender == getOwner()) {
            revert NotOwner();
        }
        _;
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function fund() public payable {
        require(priceConsumer.getConversionRate(msg.value) >= MINIMUM_USD, "Didn't send enough money");
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] += msg.value; 
    }

    function withdraw() external onlyOwner {
        // set the amount to zero of addressToAmountFunded addresses
        for (uint256 i = 0; i < funders.length; i+=1) {
            address funder = funders[i];
            addressToAmountFunded[funder] = 0;
        }

        // Reset the funders array
        funders = new address[](0);

        // Transfer the balance to message sender
        (bool callSuccess,) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
}
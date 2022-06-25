const { getNamedAccounts, ethers, network } = require("hardhat");
const { assert } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

const main = () => {
  return developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
        let fundMe;
        let deployer;
        const sendAmount = ethers.utils.parseUnits("10", "wei");

        beforeEach(async () => {
          deployer = (await getNamedAccounts()).deployer;
          fundMe = await ethers.getContract("FundMe", deployer);
        });

        it("allows people to fund and withdraw", async () => {
          await fundMe.fund({ value: sendAmount, gasLimit: "3000000" });
          await fundMe.withdraw();

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          assert.equal(endingFundMeBalance.toString(), "0");
        });
      });
};

main();

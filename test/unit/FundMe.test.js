const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

const main = () => {
  return !developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
        let fundMe;
        let deployer;
        let mockV3Aggregator;
        const sendAmount = ethers.utils.parseEther("1");
        let signer;

        beforeEach(async () => {
          // deploy the FundMe contract using hardhat-deploy
          // Another way to get the accounts
          deployer = (await getNamedAccounts()).deployer;
          await deployments.fixture(["all"]);
          mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
          );
          fundMe = await ethers.getContract("FundMe", deployer);
        });

        describe("constructor", async () => {
          it("set the aggregator addresses correctly", async () => {
            const response = await fundMe.getPriceFeed();
            assert.equal(response, mockV3Aggregator.address);
          });
        });

        describe("fund", async () => {
          it("Fails if you don't send enough eth", async () => {
            await expect(fundMe.fund()).to.be.revertedWith(
              "Didn't send enough money"
            );
          });

          it("Updated the amount funded data structure", async () => {
            await fundMe.fund({ value: sendAmount });
            const response = await fundMe.getAddressToAmountFunded(deployer);
            expect(response.toString()).to.equal(sendAmount.toString());
          });

          it("Adds funder to the array of Funders", async () => {
            await fundMe.fund({ value: sendAmount });
            const response = await fundMe.getFunders(0);
            assert.equal(response, deployer);
          });
        });

        describe("receive", async () => {
          beforeEach(async () => {
            signer = await ethers.getSigner(deployer);
          });
          it("send transaction using a signer, value is less than the minimum amount", async () => {
            const tx = {
              to: fundMe.address,
              value: ethers.utils.parseUnits("2", "gwei"),
              gasLimit: "210000",
            };
            await expect(signer.sendTransaction(tx)).to.be.revertedWith(
              "Didn't send enough money"
            );
          });

          it("send transaction using a signer, value greater than the minimum amount", async () => {
            const tx = {
              to: fundMe.address,
              value: ethers.utils.parseUnits("2", "ether"),
              gasLimit: "210000",
            };
            await signer.sendTransaction(tx);
            const response = await fundMe.provider.getBalance(fundMe.address);
            assert.equal(
              ethers.utils.formatEther(response),
              ethers.utils.formatEther(ethers.utils.parseUnits("2", "ether"))
            );
          });
        });

        describe("withdraw", async () => {
          beforeEach(async () => {
            await fundMe.fund({ value: sendAmount });
          });

          it("withdraw ETH from a single founder", async () => {
            // Arrange
            const startingFundBalance = await fundMe.provider.getBalance(
              fundMe.address
            );

            const startingDeployerBalance = await fundMe.provider.getBalance(
              deployer
            );
            // Act
            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait(1);

            // Gas Price
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const endingFundMeBalance = await fundMe.provider.getBalance(
              fundMe.address
            );

            const endingDeployerBalance = await fundMe.provider.getBalance(
              deployer
            );
            // Assert
            assert.equal(endingFundMeBalance, 0);
            assert.equal(
              startingDeployerBalance.add(startingFundBalance).toString(),
              endingDeployerBalance.add(gasCost).toString()
            );
          });

          it("allows us to withdraw with multiple accounts", async () => {
            const accounts = await ethers.getSigners();
            for (let i = 0; i < 6; i++) {
              const fundMeConnectedContract = fundMe.connect(accounts[i]);
              await fundMeConnectedContract.fund({ value: sendAmount });
            }
            // Arrange
            const startingFundBalance = await fundMe.provider.getBalance(
              fundMe.address
            );

            const startingDeployerBalance = await fundMe.provider.getBalance(
              deployer
            );
            // Act
            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait(1);

            // Gas Price
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            // eslint-disable-next-line no-unused-vars
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const endingFundMeBalance = await fundMe.provider.getBalance(
              fundMe.address
            );

            const endingDeployerBalance = await fundMe.provider.getBalance(
              deployer
            );
            // Assert
            assert.equal(endingFundMeBalance, 0);
            assert.equal(
              startingDeployerBalance.add(startingFundBalance).toString(),
              endingDeployerBalance.add(gasCost).toString()
            );

            // Make sure the getFunders are reset properly
            await expect(fundMe.getFunders(0)).to.be.reverted;

            for (let i = 0; i < 6; i++) {
              assert.equal(
                await fundMe.getAddressToAmountFunded(accounts[i].address),
                0
              );
            }
          });

          it("cheaper withdraw ETH from a single founder", async () => {
            // Arrange
            const startingFundBalance = await fundMe.provider.getBalance(
              fundMe.address
            );

            const startingDeployerBalance = await fundMe.provider.getBalance(
              deployer
            );
            // Act
            const transactionResponse = await fundMe.cheaperWithdraw();
            const transactionReceipt = await transactionResponse.wait(1);

            // Gas Price
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const endingFundMeBalance = await fundMe.provider.getBalance(
              fundMe.address
            );

            const endingDeployerBalance = await fundMe.provider.getBalance(
              deployer
            );
            // Assert
            assert.equal(endingFundMeBalance, 0);
            assert.equal(
              startingDeployerBalance.add(startingFundBalance).toString(),
              endingDeployerBalance.add(gasCost).toString()
            );
          });

          it("allows us to cheaper withdraw with multiple accounts", async () => {
            const accounts = await ethers.getSigners();
            for (let i = 0; i < 6; i++) {
              const fundMeConnectedContract = fundMe.connect(accounts[i]);
              await fundMeConnectedContract.fund({ value: sendAmount });
            }
            // Arrange
            const startingFundBalance = await fundMe.provider.getBalance(
              fundMe.address
            );

            const startingDeployerBalance = await fundMe.provider.getBalance(
              deployer
            );
            // Act
            const transactionResponse = await fundMe.cheaperWithdraw();
            const transactionReceipt = await transactionResponse.wait(1);

            // Gas Price
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            // eslint-disable-next-line no-unused-vars
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const endingFundMeBalance = await fundMe.provider.getBalance(
              fundMe.address
            );

            const endingDeployerBalance = await fundMe.provider.getBalance(
              deployer
            );
            // Assert
            assert.equal(endingFundMeBalance, 0);
            assert.equal(
              startingDeployerBalance.add(startingFundBalance).toString(),
              endingDeployerBalance.add(gasCost).toString()
            );

            // Make sure the getFunders are reset properly
            await expect(fundMe.getFunders(0)).to.be.reverted;

            for (let i = 0; i < 6; i++) {
              assert.equal(
                await fundMe.getAddressToAmountFunded(accounts[i].address),
                0
              );
            }
          });

          it("only allows the owner to withdraw", async () => {
            const accounts = await ethers.getSigners();
            const attacker = accounts[1];

            const attackeConnectedContract = await fundMe.connect(attacker);
            await expect(
              attackeConnectedContract.withdraw()
            ).to.be.revertedWith("FundMe__NotOwner");
          });
        });
      });
};

main();

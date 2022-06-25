const { getNamedAccounts, ethers } = require("hardhat");

const main = async () => {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);

  const initialFundBalance = await ethers.provider.getBalance(fundMe.address);
  const initialDeployerBalance = await ethers.provider.getBalance(deployer);
  console.log("##initialFundBalance", initialFundBalance.toString());
  console.log(
    "##initialDeployerBalance",
    ethers.utils.formatUnits(initialDeployerBalance, "ether")
  );

  console.log("Funding...");
  const transactionResponse = await fundMe.fund({
    value: ethers.utils.parseEther("1"),
  });
  await transactionResponse.wait(1);
  const afterTransferFundBalance = await ethers.provider.getBalance(
    fundMe.address
  );
  console.log(
    "##afterTransferFundBalance",
    afterTransferFundBalance.toString()
  );

  console.log("Withdraw...");
  const withdrawTranResponse = await fundMe.withdraw();
  await withdrawTranResponse.wait(1);
  const afterWithdrawFundBalance = await ethers.provider.getBalance(
    fundMe.address
  );
  const afterWithdrawDeployerBalance = await ethers.provider.getBalance(
    deployer
  );
  console.log(
    "##afterWithdrawFundBalance",
    afterWithdrawFundBalance.toString()
  );
  console.log(
    "##afterWithdrawDeployerBalance",
    ethers.utils.formatUnits(afterWithdrawDeployerBalance, "ether")
  );
};

(async () => {
  try {
    await main();
  } catch (err) {
    console.log("##err", err);
    throw new Error(err.message);
  }
})();

const { getNamedAccounts, ethers } = require("hardhat");

const main = async () => {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  const mockV3Aggregator = await ethers.getContract(
    "MockV3Aggregator",
    deployer
  );
  console.log("Address FundMe", fundMe.address);
  console.log("Address MockV3", mockV3Aggregator.address);

  const transactionResponse = await fundMe.fund({
    value: ethers.utils.parseUnits("1", "ether"),
  });

  await transactionResponse.wait();

  const fundMeBalance = await fundMe.getContractBalance();
  console.log(
    "##Contract Balance",
    ethers.utils.formatUnits(fundMeBalance, "wei")
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

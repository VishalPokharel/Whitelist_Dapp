const {ethers}=require("hardhat");

async function main(){

  const whitelistcontract = await ethers.getContractFactory("Whitelist");
  const deployedWhitelist = await whitelistcontract.deploy(10);

  await deployedWhitelist.deployed();

  console.log("Deployed contract address: ",deployedWhitelist.address)
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
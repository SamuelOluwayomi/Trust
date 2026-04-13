import { defineConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import "@nomicfoundation/hardhat-mocha";
import dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  solidity: "0.8.28",
  paths: {
    sources: ["./contracts"],
    tests: "./test",
  } as any,
  test: {
    mocha: {
      require: ["tsx/esm"],
      timeout: 60000,
    },
  } as any,
  networks: {
    hardhat: {
      type: "edr-simulated",
    },
    hashkey_testnet: {
      type: "http",
      url: "https://testnet.hsk.xyz",
      chainId: 133,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
});
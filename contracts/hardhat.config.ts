import { defineConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  solidity: "0.8.28",
  paths: {
    sources: ["./contracts"],
  },
  networks: {
    hashkey_testnet: {
      type: "http",
      url: "https://testnet.hsk.xyz",
      chainId: 133,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
});
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-toolbox";

import "tsconfig-paths/register";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-watcher";
import "hardhat-deploy";
import "solidity-docgen";
// import "hardhat-docgen";

import "./tasks/index";

import { HardhatUserConfig } from "hardhat/config";
import {
  DEPLOYER_KEY,
  INFURA_KEY,
  ETHERSCAN_API_KEY,
  POLYGONSCAN_API_KEY,
  BSCSCAN_API_KEY,
  GAS_PRICE,
  NODE,
  GAS_REPORTER,
} from "config";

const { GAS_PRICE_NODE, LOGGING } = NODE;
const { FORK_PROVIDER_URI, FORK_ENABLED, BLOCK_NUMBER } = NODE.FORK;

function typedNamedAccounts<T>(namedAccounts: { [key in string]: T }) {
  return namedAccounts;
}

const UNISWAP_SETTING = {
  version: "0.7.6",
  settings: {
    optimizer: {
      enabled: true,
      runs: 2_000,
    },
  },
};

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.12", // or your other versions
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },

      UNISWAP_SETTING,
    ],
    overrides: {
      "@uniswap/v3-core/contracts/libraries/FullMath.sol": UNISWAP_SETTING,
      "@uniswap/v3-core/contracts/libraries/TickMath.sol": UNISWAP_SETTING,
      "@uniswap/v3-periphery/contracts/libraries/PoolAddress.sol": UNISWAP_SETTING,
    },
  },
  typechain: {
    outDir: "types/typechain-types",
  },
  networks: {
    hardhat: {
      gasPrice: GAS_PRICE_NODE,
      loggingEnabled: LOGGING,
      chainId: 31337,
      forking: {
        url: FORK_PROVIDER_URI,
        enabled: FORK_ENABLED,
        blockNumber: BLOCK_NUMBER,
      },
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
      chainId: 1,
      accounts: [DEPLOYER_KEY],
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_KEY}`,
      chainId: 5,
      accounts: [DEPLOYER_KEY],
    },
    polygon: {
      url: `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`,
      chainId: 137,
      accounts: [DEPLOYER_KEY],
    },
    polygonMumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${INFURA_KEY}`,
      chainId: 80001,
      accounts: [DEPLOYER_KEY],
    },
    bsc: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      accounts: [DEPLOYER_KEY],
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: [DEPLOYER_KEY],
    },
  },
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      goerli: ETHERSCAN_API_KEY,
      polygon: POLYGONSCAN_API_KEY,
      polygonMumbai: POLYGONSCAN_API_KEY,
      bsc: BSCSCAN_API_KEY,
      bscTestnet: BSCSCAN_API_KEY,
    },
  },
  namedAccounts: typedNamedAccounts({
    deployer: 0,
    operator: 1,
  }),
  watcher: {
    test: {
      tasks: [{ command: "test", params: { testFiles: ["{path}"] } }],
      files: ["./test/**/*"],
      verbose: true,
    },
  },
  gasReporter: {
    enabled: GAS_REPORTER.ENABLED,
    coinmarketcap: GAS_REPORTER.COINMARKETCAP,
    currency: GAS_REPORTER.CURRENCY,
    token: GAS_REPORTER.TOKEN,
    gasPrice: GAS_PRICE,
  },
  docgen: {
    path: "./docs/hardhat",
    exclude: ["./mocks"],
    clear: true,
    runOnCompile: false,
    pages: "single",
  },
};

export default config;

# TradingPlatform smart contracts

This is a **TradingPlatform** smart contracts for [Cexles Finance](https://cexles.finance/) project.

<div>

<a href="https://docs.soliditylang.org/en/v0.8.12/introduction-to-smart-contracts.html">![solidity-version](https://img.shields.io/badge/Solidity-0.8.12-363636?style=for-the-badge&logo=Solidity)</a>
<a href="https://docs.chain.link/chainlink-automation/introduction">![chainlink-automation](https://img.shields.io/badge/Chainlink-Automation-375BD2?style=for-the-badge&logo=Chainlink)</a>

</div>

<div>

<a href="">![tests](https://img.shields.io/badge/Tests-passing-brightgreen)</a>
<a href="">![coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen)</a>
<a href="">![license](https://img.shields.io/github/license/cexles/trading-smart-contracts)</a>

</div>

## Documentation

<a href="https://docs.cexles.finance/">![Documentation](https://img.shields.io/badge/GitBook-GitBook-3884FF?style=for-the-badge&logo=GitBook)</a>

## Setting project

### Install dependencies

```sh
yarn install
```

---

### Setup config

Create and fill _default.json_ file.

```sh
cp config/default.example.json ./config/default.json
```

---

### Compile contracts

```sh
yarn compile
```

---

### Migrate contracts

```sh
yarn migrate:<NETWORK> (mainnet, goerli, polygon, polygonMumbai, bsc, bscTestnet)
```

---

### Verify contracts

To verify the contract, you must specify the names of the contracts for verification through "," WITHOUT SPACES

```sh
yarn verify:<NETWORK> <NAME_CONTRACT_FIRST>,<NAME_CONTRACT_SECOND>
```

---

### Tests contracts

```sh
# Run Tests
yarn test

# Run test watcher
yarn test:watch
```

---

### Node hardhat(Localfork)

NOTE:// To work with a node or fork, you need to run the node in a separate console

```sh
# Run Node hardhat (For run localfork setting config { FORK_ENABLED: true, FORK_PROVIDER_URI: "https://...."})
yarn node

# Run test watcher
yarn test:node
```

---

### Coverage

```sh
yarn coverage
```

---

### Gas reporter

You can start the gas reporter either through a separate gas reporter script through "**yarn**" or by changing the variable in the config "**GAS_REPORTER.ENABLED**" when running tests

```sh
# Native gas reporter
yarn gas-reporter

# GAS_REPORTER.ENABLED = true
yarn test
```

---

### Clean

```sh
# Rm artifacts, cache, typechain-types
yarn clean

# Rm deployments for choose network
yarn clean:deployments <NETWORK>
```

### Linter

```sh
# Checking code style for .ts, .sol
yarn lint

# Run fix code style for .ts, .sol
yarn lint:fix

# Checking code style for .ts
yarn lint:ts

# Run fix code style for .ts
yarn lint:ts:fix

# Checking code style for .sol
yarn lint:sol

# Run fix code style for .sol
yarn lint:sol:fix
```

## Auto audit with slither

To run the analyzer, you must first install it globally

To audit all contracts, use the command :

```sh
slither .
```

To exclude warnings in subsequent audits, use :

```sh
slither . --triage
```

## Deployment config

```
{
  "INFURA_KEY": "{your_infura_key}",
  "DEPLOYER_KEY": "{your_key}",
  "ETHERSCAN_API_KEY": "{your_key}",
  "POLYGONSCAN_API_KEY": "{your_key}",
  "BSCSCAN_API_KEY": "{your_key}",
  "GAS_PRICE": 28,
  "NODE": {
    "GAS_PRICE": "auto",
    "LOGGING": false,
    "FORK": {
      "FORK_PROVIDER_URI": "https://eth-mainnet.alchemyapi.io/v2/{your_key}",
      "FORK_ENABLED": true,
      "BLOCK_NUMBER": 17268128
    }
  },
  "GAS_REPORTER": {
    "ENABLED": true,
    "COINMARKETCAP": "",
    "CURRENCY": "USD",
    "TOKEN": "ETH",
    "GAS_PRICE_API": "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice"
  },
  "DEPLOY": {
    "TOKEN": {
      "DECIMALS": 18,
      "SUPPLY": "1000000000000000000000000"
    },
    "TRADING_PLATFORM": {
      "ADMIN": null,
      "SWAP_HELPER": "0x99CB3439F88dFD1D9c6C4B7141a0696EcEa96ff3",
      "PROTOCOL_FEE": 10000,
      "FEE_RECIPIENT": null
    },
    "SWAP_HELPER": {
      "SWAP_ROUTER": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      "FACTORY": "0x1F98431c8aD98523631AE4a59f267346ea31F984",
      "SLIPPAGE": 10000,
      "SECONDS_AGO_DEFAULT": 30
    },
    "UPKEEP_CONTROLLER": {
      "LINK_TOKEN": "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
      "AUTOMATION_REGISTRAR": "0x57A4a13b35d25EE78e084168aBaC5ad360252467",
      "AUTOMATION_REGISTRY": "0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2"
    }
  }
}
```

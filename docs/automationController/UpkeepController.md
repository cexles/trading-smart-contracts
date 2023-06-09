# Solidity API

## UpkeepController

A contract that manages upkeeps for the Cahinlink automation system.

_This contract implements the UpkeepControllerInterface and provides functionality to register, cancel,
pause, and unpause upkeeps, as well as update their check data, gas limits, and off-chain configurations._

### i_link

```solidity
contract LinkTokenInterface i_link
```

### i_registrar

```solidity
contract KeeperRegistrarInterface i_registrar
```

### i_registry

```solidity
contract AutomationRegistryWithMinANeededAmountInterface i_registry
```

### constructor

```solidity
constructor(contract LinkTokenInterface link, contract KeeperRegistrarInterface registrar, contract AutomationRegistryWithMinANeededAmountInterface registry) public
```

Constructs the UpkeepController contract.

#### Parameters

| Name      | Type                                                     | Description                                     |
| --------- | -------------------------------------------------------- | ----------------------------------------------- |
| link      | contract LinkTokenInterface                              | The address of the LinkToken contract.          |
| registrar | contract KeeperRegistrarInterface                        | The address of the KeeperRegistrar contract.    |
| registry  | contract AutomationRegistryWithMinANeededAmountInterface | The address of the AutomationRegistry contract. |

### registerAndPredictID

```solidity
function registerAndPredictID(struct KeeperRegistrarInterface.RegistrationParams params) public
```

_See {UpkeepControllerInterface}_

### cancelUpkeep

```solidity
function cancelUpkeep(uint256 upkeepId) external
```

_See {UpkeepControllerInterface}_

### pauseUpkeep

```solidity
function pauseUpkeep(uint256 upkeepId) external
```

_See {UpkeepControllerInterface}_

### unpauseUpkeep

```solidity
function unpauseUpkeep(uint256 upkeepId) external
```

_See {UpkeepControllerInterface}_

### updateCheckData

```solidity
function updateCheckData(uint256 upkeepId, bytes newCheckData) external
```

_See {UpkeepControllerInterface}_

### setUpkeepGasLimit

```solidity
function setUpkeepGasLimit(uint256 upkeepId, uint32 gasLimit) external
```

_See {UpkeepControllerInterface}_

### setUpkeepOffchainConfig

```solidity
function setUpkeepOffchainConfig(uint256 upkeepId, bytes config) external
```

_See {UpkeepControllerInterface}_

### addFunds

```solidity
function addFunds(uint256 upkeepId, uint96 amount) external
```

_See {UpkeepControllerInterface}_

### getUpkeep

```solidity
function getUpkeep(uint256 upkeepId) external view returns (struct UpkeepInfo upkeepInfo)
```

_See {UpkeepControllerInterface}_

### getActiveUpkeepIDs

```solidity
function getActiveUpkeepIDs(uint256 offset, uint256 limit) public view returns (uint256[] upkeeps)
```

_See {UpkeepControllerInterface}_

### getUpkeeps

```solidity
function getUpkeeps(uint256 offset, uint256 limit) public view returns (struct UpkeepInfo[])
```

_See {UpkeepControllerInterface}_

### getMinBalanceForUpkeep

```solidity
function getMinBalanceForUpkeep(uint256 upkeepId) external view returns (uint96)
```

_See {UpkeepControllerInterface}_

### getMinBalancesForUpkeeps

```solidity
function getMinBalancesForUpkeeps(uint256 offset, uint256 limit) public view returns (uint96[])
```

_See {UpkeepControllerInterface}_

### getDetailedUpkeeps

```solidity
function getDetailedUpkeeps(uint256 offset, uint256 limit) external view returns (struct UpkeepControllerInterface.DetailedUpkeep[])
```

_See {UpkeepControllerInterface}_

### getUpkeepsCount

```solidity
function getUpkeepsCount() external view returns (uint256)
```

_See {UpkeepControllerInterface}_

### getState

```solidity
function getState() external view returns (struct State state, struct OnchainConfig config, address[] signers, address[] transmitters, uint8 f)
```

_See {UpkeepControllerInterface}_

### isNewUpkeepNeeded

```solidity
function isNewUpkeepNeeded() external view returns (bool isNeeded, uint256 newOffset, uint256 newLimit)
```

_See {UpkeepControllerInterface}_

### checkUpkeep

```solidity
function checkUpkeep(uint256 upkeepId) public returns (bool upkeepNeeded, bytes performData, enum UpkeepFailureReason upkeepFailureReason, uint256 gasUsed, uint256 fastGasWei, uint256 linkNative)
```

_See {UpkeepControllerInterface}_

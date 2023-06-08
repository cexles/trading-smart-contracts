# Solidity API

## UpkeepControllerInterface

### DetailedUpkeep

```solidity
struct DetailedUpkeep {
  uint256 id;
  uint96 minAmount;
  struct UpkeepInfo info;
}
```

### UpkeepCreated

```solidity
event UpkeepCreated(uint256 id)
```

Emitted when a new upkeep is created.

_This event is emitted when a new upkeep._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | The ID of the created upkeep. |

### UpkeepCanceled

```solidity
event UpkeepCanceled(uint256 id)
```

Emitted when an upkeep is canceled.

_This event is emitted when an upkeep is canceled._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | The ID of the canceled upkeep. |

### UpkeepPaused

```solidity
event UpkeepPaused(uint256 id)
```

Emitted when an upkeep is paused.

_This event is emitted when an upkeep is paused._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | The ID of the paused upkeep. |

### UpkeepUnpaused

```solidity
event UpkeepUnpaused(uint256 id)
```

Emitted when an upkeep is unpaused.

_This event is emitted when an upkeep is unpaused._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | The ID of the unpaused upkeep. |

### UpkeepUpdated

```solidity
event UpkeepUpdated(uint256 id, bytes newCheckData)
```

Emitted when an upkeep is updated.

_This event is emitted when an upkeep is updated, with the new check data included._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | The ID of the updated upkeep. |
| newCheckData | bytes | The new check data for the upkeep. |

### FundsAdded

```solidity
event FundsAdded(uint256 id, uint96 amount)
```

Emitted when funds are added to an upkeep.

_This event is emitted when funds are added to an upkeep._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | The ID of the upkeep to which funds are added. |
| amount | uint96 | The amount of funds added to the upkeep. |

### UpkeepGasLimitSet

```solidity
event UpkeepGasLimitSet(uint256 id, uint32 amount)
```

Emitted when the gas limit is set for an upkeep.

_This event is emitted when the gas limit is set for an upkeep._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | The ID of the upkeep for which the gas limit is set. |
| amount | uint32 | The gas limit value set for the upkeep. |

### UpkeepOffchainConfigSet

```solidity
event UpkeepOffchainConfigSet(uint256 id, bytes config)
```

Emitted when the off-chain configuration is set for an upkeep.

_This event is emitted when the off-chain configuration is set for an upkeep._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | The ID of the upkeep for which the off-chain configuration is set. |
| config | bytes | The off-chain configuration data set for the upkeep. |

### registerAndPredictID

```solidity
function registerAndPredictID(struct KeeperRegistrarInterface.RegistrationParams params) external
```

Registers a new upkeep and predicts its ID.

_The caller must approve the transfer of LINK tokens to this contract before calling this function.
This function transfers the specified amount of LINK tokens from the caller to this contract.
It then approves the transfer of LINK tokens to the KeeperRegistrar contract.
Next, it calls the registerUpkeep function of the KeeperRegistrar contract to register the upkeep.
If the upkeep is successfully registered, the upkeep ID is added to the activeUpkeeps set and an UpkeepCreated event is emitted.
If the upkeep registration fails, the function reverts with an error message.
Emits a {UpkeepCreated} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| params | struct KeeperRegistrarInterface.RegistrationParams | The registration parameters for the upkeep. |

### cancelUpkeep

```solidity
function cancelUpkeep(uint256 upkeepId) external
```

Cancel an active upkeep.

_The upkeep must be active.
This function calls the cancelUpkeep function of the AutomationRegistry contract to cancel the upkeep.
It removes the upkeep ID from the activeUpkeeps set.
Emits a {UpkeepCanceled} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| upkeepId | uint256 | The ID of the upkeep to cancel. |

### pauseUpkeep

```solidity
function pauseUpkeep(uint256 upkeepId) external
```

Pauses an active upkeep.

_The upkeep must be active.
This function calls the pauseUpkeep function of the AutomationRegistry contract to pause the upkeep.
It removes the upkeep ID from the activeUpkeeps set, adds it to the pausedUpkeeps set.
Emits a {UpkeepPaused} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| upkeepId | uint256 | The ID of the upkeep to pause. |

### unpauseUpkeep

```solidity
function unpauseUpkeep(uint256 upkeepId) external
```

Unpauses a paused upkeep.

_The upkeep must be paused.
This function calls the unpauseUpkeep function of the AutomationRegistry contract to unpause the upkeep.
It removes the upkeep ID from the pausedUpkeeps set, adds it to the activeUpkeeps set.
Emits a {UpkeepUnpaused} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| upkeepId | uint256 | The ID of the upkeep to unpause. |

### updateCheckData

```solidity
function updateCheckData(uint256 upkeepId, bytes newCheckData) external
```

Updates the check data of an upkeep.

_The upkeep must be an active upkeep.
This function calls the updateCheckData function of the AutomationRegistryWithMinANeededAmount contract to update the check data of the upkeep.
Emits a {UpkeepUpdated} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| upkeepId | uint256 | The ID of the upkeep to update. |
| newCheckData | bytes | The new check data to set for the upkeep. |

### setUpkeepGasLimit

```solidity
function setUpkeepGasLimit(uint256 upkeepId, uint32 gasLimit) external
```

Update the gas limit for an specific upkeep.

_The upkeep must be active.
This function calls the setUpkeepGasLimit function of the AutomationRegistry
contract to set the gas limit for the upkeep.
Emits a {UpkeepGasLimitSet} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| upkeepId | uint256 | The ID of the upkeep to set the gas limit for. |
| gasLimit | uint32 | The gas limit to set for the upkeep. |

### setUpkeepOffchainConfig

```solidity
function setUpkeepOffchainConfig(uint256 upkeepId, bytes config) external
```

Update the off-chain configuration for an upkeep.

_The upkeep must be active.
This function calls the setUpkeepOffchainConfig function of the AutomationRegistry contract
to set the off-chain configuration for the upkeep.
Emits a {UpkeepOffchainConfigSet} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| upkeepId | uint256 | The ID of the upkeep to set the off-chain configuration for. |
| config | bytes | The off-chain configuration data to set for the upkeep. |

### addFunds

```solidity
function addFunds(uint256 upkeepId, uint96 amount) external
```

Adds funds to an upkeep.

_The upkeep must be active.
This function transfers the specified amount of LINK tokens from the caller to the contract.
It approves the transferred LINK tokens for the AutomationRegistry contract
and calls the addFunds function of the AutomationRegistry contract to add funds to the upkeep.
Emits a {FundsAdded} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| upkeepId | uint256 | The ID of the upkeep to add funds to. |
| amount | uint96 | The amount of funds to add to the upkeep. |

### getUpkeep

```solidity
function getUpkeep(uint256 upkeepId) external view returns (struct UpkeepInfo upkeepInfo)
```

Retrieves the information of an upkeep.

_This function calls the getUpkeep function of the AutomationRegistry contract to retrieve the information of the upkeep._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| upkeepId | uint256 | The ID of the upkeep to retrieve information for. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| upkeepInfo | struct UpkeepInfo | The UpkeepInfo struct containing the information of the upkeep. |

### getActiveUpkeepIDs

```solidity
function getActiveUpkeepIDs(uint256 offset, uint256 limit) external view returns (uint256[] upkeeps)
```

Retrieves the IDs of active upkeeps within a specified range.

_This function returns an array of active upkeep IDs, starting from the offset and up to the specified limit.
If the offset exceeds the total number of active upkeeps, an empty array is returned.
This function uses the activeUpkeeps set to retrieve the IDs._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| offset | uint256 | The starting index of the range. |
| limit | uint256 | The maximum number of IDs to retrieve. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| upkeeps | uint256[] | An array of active upkeep IDs within the specified range. |

### getUpkeeps

```solidity
function getUpkeeps(uint256 offset, uint256 limit) external view returns (struct UpkeepInfo[])
```

Retrieves a batch of upkeeps with their information.

_This function retrieves a batch of upkeeps by calling the getActiveUpkeepIDs function
to get the IDs of active upkeeps within the specified range.
It then iterates over the retrieved IDs and calls the getUpkeep function of the AutomationRegistry contract
to retrieve the information of each upkeep._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| offset | uint256 | The starting index of the range. |
| limit | uint256 | The maximum number of upkeeps to retrieve. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct UpkeepInfo[] | upkeeps An array of UpkeepInfo structs containing the information of the retrieved upkeeps. |

### getMinBalanceForUpkeep

```solidity
function getMinBalanceForUpkeep(uint256 upkeepId) external view returns (uint96)
```

Retrieves the minimum balance required for an upkeep.

_This function calls the getMinBalanceForUpkeep function of the AutomationRegistry contract
to retrieve the minimum balance required for the upkeep._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| upkeepId | uint256 | The ID of the upkeep to retrieve the minimum balance for. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint96 | minBalance The minimum balance required for the upkeep. |

### getMinBalancesForUpkeeps

```solidity
function getMinBalancesForUpkeeps(uint256 offset, uint256 limit) external view returns (uint96[])
```

Retrieves the minimum balances required for a batch of upkeeps.

_This function retrieves a batch of upkeeps by calling the getActiveUpkeepIDs function
to get the IDs of active upkeeps within the specified range.
It then iterates over the retrieved IDs and calls the getMinBalanceForUpkeep function of the AutomationRegistry contract
to retrieve the minimum balance for each upkeep._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| offset | uint256 | The starting index of the range. |
| limit | uint256 | The maximum number of upkeeps to retrieve minimum balances for. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint96[] | minBalances An array of minimum balances required for the retrieved upkeeps. |

### getDetailedUpkeeps

```solidity
function getDetailedUpkeeps(uint256 offset, uint256 limit) external view returns (struct UpkeepControllerInterface.DetailedUpkeep[])
```

Retrieves a batch of detailed upkeeps.

_This function retrieves a batch of upkeeps by calling the getActiveUpkeepIDs function
to get the IDs of active upkeeps within the specified range.
It then calls the getUpkeeps and getMinBalancesForUpkeeps functions to retrieve the information and minimum balances for the upkeeps.
Finally, it combines the information into DetailedUpkeep structs and returns an array of detailed upkeeps._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| offset | uint256 | The starting index of the range. |
| limit | uint256 | The maximum number of detailed upkeeps to retrieve. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct UpkeepControllerInterface.DetailedUpkeep[] | detailedUpkeeps An array of DetailedUpkeep structs containing the information of the retrieved detailed upkeeps. |

### getUpkeepsCount

```solidity
function getUpkeepsCount() external view returns (uint256)
```

Retrieves the total number of active upkeeps.

_This function returns the length of the activeUpkeeps set, representing the total number of active upkeeps._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | count The total number of active upkeeps. |

### getState

```solidity
function getState() external view returns (struct State state, struct OnchainConfig config, address[] signers, address[] transmitters, uint8 f)
```

Retrieves the current state, configuration, signers, transmitters, and flag from the registry.

_This function calls the getState function of the AutomationRegistry contract
to retrieve the current state, configuration, signers, transmitters, and flag._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| state | struct State | The State struct containing the current state of the registry. |
| config | struct OnchainConfig | The OnchainConfig struct containing the current on-chain configuration of the registry. |
| signers | address[] | An array of addresses representing the signers associated with the registry. |
| transmitters | address[] | An array of addresses representing the transmitters associated with the registry. |
| f | uint8 | The flag value associated with the registry. |

### isNewUpkeepNeeded

```solidity
function isNewUpkeepNeeded() external view returns (bool isNeeded, uint256 newOffset, uint256 newLimit)
```

Checks if a new upkeep is needed and returns the offset and limit for the next of upkeep.

_This function calculates the offset and limit for the next upkeep based on the last active upkeep.
It retrieves the last active upkeep ID and the associated performOffset and performLimit from the registry.
It then calls the checkUpkeep function of the AutomationCompatible contract to perform the upkeep check.
The result is used to determine whether a new upkeep is needed,
and the new offset and limit values for the next upkeep are calculated._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| isNeeded | bool | A boolean indicating whether a new upkeep is needed. |
| newOffset | uint256 | The offset value for the next upkeep. |
| newLimit | uint256 | The limit value for the next upkeep. |

### checkUpkeep

```solidity
function checkUpkeep(uint256 upkeepId) external returns (bool upkeepNeeded, bytes performData, enum UpkeepFailureReason upkeepFailureReason, uint256 gasUsed, uint256 fastGasWei, uint256 linkNative)
```

Performs the upkeep check for a specific upkeep.

_This function calls the checkUpkeep function of the AutomationRegistry contract
to perform the upkeep check for the specified upkeep._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| upkeepId | uint256 | The ID of the upkeep to check. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| upkeepNeeded | bool | A boolean indicating whether the upkeep is needed. |
| performData | bytes | The perform data associated with the upkeep. |
| upkeepFailureReason | enum UpkeepFailureReason | The reason for the upkeep failure, if applicable. |
| gasUsed | uint256 | The amount of gas used during the upkeep check. |
| fastGasWei | uint256 | The wei value for fast gas during the upkeep check. |
| linkNative | uint256 | The amount of LINK or native currency used during the upkeep check. |


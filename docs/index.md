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

| Name | Type | Description |
| ---- | ---- | ----------- |
| link | contract LinkTokenInterface | The address of the LinkToken contract. |
| registrar | contract KeeperRegistrarInterface | The address of the KeeperRegistrar contract. |
| registry | contract AutomationRegistryWithMinANeededAmountInterface | The address of the AutomationRegistry contract. |

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

## AutomationCompatibleWithViewInterface

### checkUpkeep

```solidity
function checkUpkeep(bytes checkData) external view returns (bool upkeepNeeded, bytes performData)
```

Checks the upkeep status and provides the necessary data for performing the upkeep.

_This function allows users to check the status of an upkeep and obtain the data necessary to perform the upkeep.
The checkData parameter contains any additional data required to determine the upkeep status.
The function returns a boolean value (upkeepNeeded) indicating whether the upkeep is needed or not.
If upkeepNeeded is true, it means the upkeep should be performed.
In addition, the function returns performData, which is the data needed to execute the upkeep.
Users can use this data to perform the upkeep._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| checkData | bytes | Additional data needed to determine the upkeep status. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| upkeepNeeded | bool | Indicates whether the upkeep is needed or not. |
| performData | bytes | The data required to perform the upkeep. |

## AutomationRegistryWithMinANeededAmountInterface

### getMinBalanceForUpkeep

```solidity
function getMinBalanceForUpkeep(uint256 upkeepId) external view returns (uint96)
```

Retrieves the minimum balance required for a specific upkeep.

_This function allows users to retrieve the minimum balance required to perform a specific upkeep.
The minimum balance represents the amount of funds that need to be available in the contract in order to execute the upkeep successfully.
The upkeep ID is used to identify the specific upkeep for which the minimum balance is being retrieved._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| upkeepId | uint256 | The unique identifier (ID) of the upkeep. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint96 | The minimum balance required for the specified upkeep. |

## KeeperRegistrarInterface

### RegistrationParams

```solidity
struct RegistrationParams {
  string name;
  bytes encryptedEmail;
  address upkeepContract;
  uint32 gasLimit;
  address adminAddress;
  bytes checkData;
  bytes offchainConfig;
  uint96 amount;
}
```

### registerUpkeep

```solidity
function registerUpkeep(struct KeeperRegistrarInterface.RegistrationParams requestParams) external returns (uint256)
```

Registers an upkeep using the provided registration parameters.

_This function allows users to register an upkeep by providing the necessary registration parameters.
The registration parameters include information such as the name, encrypted email, upkeep contract address,
gas limit, admin address, additional check data, off-chain configuration, and amount.
Upon successful registration, a unique identifier (ID) is assigned to the upkeep, which can be used for future reference.
Emits an {UpkeepCreated} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| requestParams | struct KeeperRegistrarInterface.RegistrationParams | The registration parameters for creating the upkeep. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The unique identifier (ID) assigned to the newly registered upkeep. |

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

## TradingPlatform

### ADMIN_ROLE

```solidity
bytes32 ADMIN_ROLE
```

### PRECISION

```solidity
uint32 PRECISION
```

### activeOrdersLength

```solidity
function activeOrdersLength() external view returns (uint256)
```

_See {ITradingPlatform}_

### activeOrderId

```solidity
function activeOrderId(uint256 itemId) external view returns (uint256)
```

_See {ITradingPlatform}_

### activeOrdersIds

```solidity
function activeOrdersIds(uint256 offset, uint256 limit) external view returns (uint256[] ordersIds)
```

_See {ITradingPlatform}_

### checkUpkeep

```solidity
function checkUpkeep(bytes checkData) external view returns (bool upkeepNeeded, bytes performData)
```

_See {ITradingPlatform}_

### getFeeRecipient

```solidity
function getFeeRecipient() external view returns (address)
```

_See {ITradingPlatform}_

### getOrderCounter

```solidity
function getOrderCounter() external view returns (uint256)
```

_See {ITradingPlatform}_

### getProtocolFee

```solidity
function getProtocolFee() external view returns (uint32)
```

_See {ITradingPlatform}_

### getResultTokenOut

```solidity
function getResultTokenOut(uint256 orderId) external view returns (uint256)
```

_See {ITradingPlatform}_

### getSwapHelper

```solidity
function getSwapHelper() external view returns (address)
```

_See {ITradingPlatform}_

### getTokenStatus

```solidity
function getTokenStatus(address token) external view returns (bool)
```

_See {ITradingPlatform}_

### getUserBalance

```solidity
function getUserBalance(address user, address token) external view returns (uint256)
```

_See {ITradingPlatform}_

### getUserOrdersIds

```solidity
function getUserOrdersIds(address userAddress) external view returns (uint256[])
```

_See {ITradingPlatform}_

### getUserOrdersInfo

```solidity
function getUserOrdersInfo(address userAddress) external view returns (struct ITradingPlatform.OrderInfo[])
```

_See {ITradingPlatform}_

### isActiveOrderExist

```solidity
function isActiveOrderExist(uint256 orderId) external view returns (bool)
```

_See {ITradingPlatform}_

### checkOrder

```solidity
function checkOrder(uint256 orderId) public view returns (bool)
```

_See {ITradingPlatform}_

### getOrdersInfo

```solidity
function getOrdersInfo(uint256[] ordersIds) public view returns (struct ITradingPlatform.OrderInfo[] orders)
```

_See {ITradingPlatform}_

### shouldRebalance

```solidity
function shouldRebalance() public view returns (uint256[])
```

_See {ITradingPlatform}_

### constructor

```solidity
constructor(address uniswapHelperV3_, address admin, uint32 protocolFee_, address feeRecipient_) public
```

Initializes the TradingPlatform contract with the specified parameters.

_The UniswapHelperV3 address, admin address, and fee recipient address must not be zero addresses.
The protocol fee must be less than 100% (represented as 1,000,000 in 6 digits precision).
Sets the DEFAULT_ADMIN_ROLE and ADMIN_ROLE roles to the admin address._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| uniswapHelperV3_ | address | The address of the UniswapHelperV3 contract. |
| admin | address | The address of the contract admin. |
| protocolFee_ | uint32 | The protocol fee percentage, represented as a decimal with 6 digits precision. |
| feeRecipient_ | address | The address where the protocol fees will be sent to. |

### addTokensToWhitelist

```solidity
function addTokensToWhitelist(address[] tokens) external
```

_See {ITradingPlatform}_

### boundOrders

```solidity
function boundOrders(uint256 leftOrderId, uint256 rightOrderId) external
```

_See {ITradingPlatform}_

### cancelOrders

```solidity
function cancelOrders(uint256[] ordersIds) external
```

_See {ITradingPlatform}_

### createOrder

```solidity
function createOrder(struct ITradingPlatform.Order order) external returns (uint256)
```

_See {ITradingPlatform}_

### deposit

```solidity
function deposit(address token, uint256 amount) external returns (bool)
```

_See {ITradingPlatform}_

### executeOrders

```solidity
function executeOrders(uint256[] ordersIds) public returns (bool)
```

_See {ITradingPlatform}_

### performUpkeep

```solidity
function performUpkeep(bytes performData) external
```

_See {ITradingPlatform}_

### removeTokensFromWhitelist

```solidity
function removeTokensFromWhitelist(address[] tokens) external
```

_See {ITradingPlatform}_

### setProtocolFee

```solidity
function setProtocolFee(uint32 newProtocolFee) external
```

_See {ITradingPlatform}_

### withdraw

```solidity
function withdraw(address token, uint256 amount) external returns (bool)
```

_See {ITradingPlatform}_

### executeOrder

```solidity
function executeOrder(uint256 orderId) internal
```

Executes an individual order based on the provided order ID.

_This function is internal and should not be called directly from outside the contract.
Emits a {OrderExecuted} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| orderId | uint256 | ID of the order to be executed. |

### calculateFee

```solidity
function calculateFee(uint256 amount, uint32 protocolFeePercent) internal pure returns (uint256)
```

Calculates the fee amount based on the given token amount.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The token amount for which the fee is calculated. |
| protocolFeePercent | uint32 |  |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 The calculated fee amount. |

### getPercent

```solidity
function getPercent(uint256 amount, uint24 percent) internal pure returns (uint256)
```

Calculates the percentage of an amount.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The base amount. |
| percent | uint24 | The percentage value, represented as a decimal with 6 digits precision. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 The calculated percentage amount. |

## IERC20WithDecimals

_Interface of the ERC20 standard as defined in the EIP._

### decimals

```solidity
function decimals() external view returns (uint8)
```

## ISwapHelperUniswapV3

### SecondsAgoDefaultUpdated

```solidity
event SecondsAgoDefaultUpdated(uint32 value)
```

Emitted when seconds ago default updated

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | uint32 | The new param secondsAgoDefault |

### SlippageUpdated

```solidity
event SlippageUpdated(uint256 value)
```

Emitted when slippage updated

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | uint256 | The new slippage value, where 100% = 1000000 |

### Swapped

```solidity
event Swapped(address beneficiary, address tokenIn, address tokenOut, uint128 amountIn, uint256 amountOut)
```

Emitted when swap confirmed

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| beneficiary | address | Beneficiary output tokens after swap |
| tokenIn | address | Exchangeable token |
| tokenOut | address | The other of the two tokens in the desired pool |
| amountIn | uint128 | The desired number of tokens for the exchange |
| amountOut | uint256 | Average number of tokens `amountOut` in the selected time interval from the current moment and the pool |

### getAmountOut

```solidity
function getAmountOut(address tokenIn, address tokenOut, uint128 amountIn, uint24 fee, uint32 secondsAgo) external view returns (uint256 amountOut)
```

Get the minimum number of tokens for a subsequent swap, taking into account slippage

_tokenIn and tokenOut may be passed in either order: token0/token1 or token1/token0.
The call will revert if the pool not already exists, the fee is invalid, or the token arguments
are invalid. The minimum price is determined by a globally set parameter `_slippage`_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenIn | address | One of the two tokens in the desired pool |
| tokenOut | address | The other of the two tokens in the desired pool |
| amountIn | uint128 | The desired number of tokens for the exchange |
| fee | uint24 | The desired fee for the pool |
| secondsAgo | uint32 | The number of seconds from the current moment to calculate the average price |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountOut | uint256 | Average number of tokens `amountOut` in the selected time interval from the current moment and the pool |

### swap

```solidity
function swap(address beneficiary, address tokenIn, address tokenOut, uint128 amountIn, uint24 fee) external returns (uint256 amountOut)
```

Swaps `amountIn` of one token for as much as possible of another along the specified path

_tokenIn and tokenOut may be passed in either order: token0/token1 or token1/token0.
The call will revert if the pool not already exists, the fee is invalid, or the token arguments
are invalid. The minimum price is determined by a globally set parameter `_slippage`_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| beneficiary | address | Beneficiary `amountOut` after swap |
| tokenIn | address | Exchangeable token |
| tokenOut | address | Output token during the exchange |
| amountIn | uint128 | The desired number of tokens for the exchange |
| fee | uint24 | The desired fee for the pool |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountOut | uint256 | The number of tokens at the exit after the swap |

### swapWithCustomSlippage

```solidity
function swapWithCustomSlippage(address beneficiary, address tokenIn, address tokenOut, uint128 amountIn, uint24 fee, uint256 slippageForSwap) external returns (uint256 amountOut)
```

Swaps `amountIn` of one token for as much as possible of another along the specified path

_tokenIn and tokenOut may be passed in either order: token0/token1 or token1/token0.
The call will revert if the pool not already exists, the fee is invalid, or the token arguments
are invalid. The minimum price is determined by a globally set parameter `_slippage`_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| beneficiary | address | Beneficiary `amountOut` after swap |
| tokenIn | address | Exchangeable token |
| tokenOut | address | Output token during the exchange |
| amountIn | uint128 | The desired number of tokens for the exchange |
| fee | uint24 | The desired fee for the pool |
| slippageForSwap | uint256 | slippage for swap |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountOut | uint256 | The number of tokens at the exit after the swap |

## ITradingPlatform

### Order

```solidity
struct Order {
  address userAddress;
  address baseToken;
  address targetToken;
  uint24 pairFee;
  uint24 slippage;
  uint128 baseAmount;
  uint128 aimTargetTokenAmount;
  uint128 minTargetTokenAmount;
  uint256 expiration;
  uint256 boundOrder;
  enum ITradingPlatform.Action action;
  bytes data;
}
```

### OrderInfo

```solidity
struct OrderInfo {
  uint256 id;
  struct ITradingPlatform.Order order;
  uint256 additionalInformation;
  uint256 resultTokenOut;
  bool status;
}
```

### TrailingOrderData

```solidity
struct TrailingOrderData {
  uint128 baseAmount;
  uint128 fixingPerStep;
  uint24 step;
}
```

### DCAOrderData

```solidity
struct DCAOrderData {
  uint128 period;
  uint128 amountPerPeriod;
}
```

### Action

```solidity
enum Action {
  LOSS,
  PROFIT,
  DCA,
  TRAILING
}
```

### Deposited

```solidity
event Deposited(address operator, address token, uint256 amount)
```

Emitted when tokens are deposited into the contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| operator | address | The address of the operator performing the deposit. |
| token | address | The address of the deposited token. |
| amount | uint256 | The amount of tokens deposited. |

### OrdersBounded

```solidity
event OrdersBounded(uint256 leftOrderId, uint256 rightOrderId)
```

Emitted when two orders are bound together.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| leftOrderId | uint256 | The ID of the left order in the binding. |
| rightOrderId | uint256 | The ID of the right order in the binding. |

### OrderCanceled

```solidity
event OrderCanceled(uint256 orderId)
```

Emitted when an order is canceled.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| orderId | uint256 | The ID of the canceled order. |

### OrderCreated

```solidity
event OrderCreated(uint256 orderId, address userAddress)
```

Emitted when a new order is created.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| orderId | uint256 | The ID of the newly created order. |
| userAddress | address | The address of the user creating the order. |

### OrderExecuted

```solidity
event OrderExecuted(uint256 orderId, address validator)
```

Emitted when an order is executed.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| orderId | uint256 | The ID of the executed order. |
| validator | address | The address of the validator who executed the order. |

### TokenAdded

```solidity
event TokenAdded(address token)
```

Emitted when a new token is added to the contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | The address of the added token. |

### TokenRemoved

```solidity
event TokenRemoved(address token)
```

Emitted when a token is removed from the contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | The address of the removed token. |

### Withdrawed

```solidity
event Withdrawed(address operator, address token, uint256 amount)
```

Emitted when tokens are withdrawn from the contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| operator | address | The address of the operator performing the withdrawal. |
| token | address | The address of the withdrawn token. |
| amount | uint256 | The amount of tokens withdrawn. |

### activeOrdersLength

```solidity
function activeOrdersLength() external view returns (uint256)
```

Retrieves the number of active orders.

_This function is read-only and can be called by anyone._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The count of active orders. |

### activeOrderId

```solidity
function activeOrderId(uint256 itemId) external view returns (uint256)
```

Retrieves the active order ID at the specified index.

_This function is read-only and can be called by anyone.
Requires the itemId to be within the valid range of activeOrders length._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| itemId | uint256 | The index of the active order in the active orders list. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The ID of the active order at the specified index. |

### activeOrdersIds

```solidity
function activeOrdersIds(uint256 offset, uint256 limit) external view returns (uint256[] ordersIds)
```

Retrieves an array of active order IDs based on pagination parameters.

_This function is read-only and can be called by anyone._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| offset | uint256 | The number of skipped elements. |
| limit | uint256 | The number of items requested. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| ordersIds | uint256[] | An array of active order IDs. |

### checkUpkeep

```solidity
function checkUpkeep(bytes checkData) external view returns (bool upkeepNeeded, bytes performData)
```

Checks the upkeep status and provides the necessary data for performing upkeep.

_This function is external and view-only.
It calls the shouldRebalance function to retrieve the list of order IDs that need to be rebalanced.
It sets upkeepNeeded to true if there are any orders that need to be rebalanced, and false otherwise.
It encodes the list of order IDs into performData using the abi.encode function.
Finally, it returns upkeepNeeded and performData._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| checkData | bytes | Additional data for the upkeep check. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| upkeepNeeded | bool | A boolean indicating whether upkeep is needed or not. |
| performData | bytes | Encoded data containing the order IDs that require rebalance. |

### getFeeRecipient

```solidity
function getFeeRecipient() external view returns (address)
```

Returns the address of the fee recipient.

_This function is read-only and can be called by anyone._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the fee recipient. |

### getOrderCounter

```solidity
function getOrderCounter() external view returns (uint256)
```

Retrieves the current order counter.

_This function is read-only and can be called by anyone._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The current order counter value. |

### getProtocolFee

```solidity
function getProtocolFee() external view returns (uint32)
```

Returns the current protocol fee percentage.

_This function is read-only and can be called by anyone._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint32 | The current protocol fee percentage. |

### getResultTokenOut

```solidity
function getResultTokenOut(uint256 orderId) external view returns (uint256)
```

Retrieves the result token out value for a specific order ID.

_This function is read-only and can be called by anyone._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| orderId | uint256 | The ID of the order. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The result token out value for the order. |

### getSwapHelper

```solidity
function getSwapHelper() external view returns (address)
```

Returns the address of the UniswapHelperV3 contract.

_This function is read-only and can be called by anyone._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the UniswapHelperV3 contract. |

### getTokenStatus

```solidity
function getTokenStatus(address token) external view returns (bool)
```

Checks if a token is whitelisted.

_This function is read-only and can be called by anyone._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | The address of the token to check. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | A boolean indicating whether the token is whitelisted or not. |

### getUserBalance

```solidity
function getUserBalance(address user, address token) external view returns (uint256)
```

Retrieves the balance of a specific token for a user.

_This function is read-only and can be called by anyone._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The address of the user. |
| token | address | The address of the token. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The balance of the token for the user. |

### getUserOrdersIds

```solidity
function getUserOrdersIds(address userAddress) external view returns (uint256[])
```

Retrieves the array of order IDs associated with a user address.

_This function is read-only and can be called by anyone._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| userAddress | address | The address of the user. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256[] | An array of order IDs associated with the user address. |

### getUserOrdersInfo

```solidity
function getUserOrdersInfo(address userAddress) external view returns (struct ITradingPlatform.OrderInfo[])
```

Retrieves detailed information about the user's orders.

_This function is read-only and can be called by anyone._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| userAddress | address | The address of the user. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct ITradingPlatform.OrderInfo[] | An array of OrderInfo structs containing detailed information about the user's orders. |

### isActiveOrderExist

```solidity
function isActiveOrderExist(uint256 orderId) external view returns (bool)
```

Checks if an active order with the given ID exists.

_This function is read-only and can be called by anyone._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| orderId | uint256 | The ID of the order. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | A boolean indicating whether an active order with the given ID exists or not. |

### checkOrder

```solidity
function checkOrder(uint256 orderId) external view returns (bool)
```

Checks if an order is valid and can be executed.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| orderId | uint256 | The ID of the order to be checked. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool True if the order is valid and can be executed, false otherwise. |

### getOrdersInfo

```solidity
function getOrdersInfo(uint256[] ordersIds) external view returns (struct ITradingPlatform.OrderInfo[] orders)
```

Retrieves detailed information about multiple orders.

_This function is read-only and can be called by anyone._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ordersIds | uint256[] | An array of order IDs. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| orders | struct ITradingPlatform.OrderInfo[] | An array of OrderInfo structs containing detailed information about the orders. |

### shouldRebalance

```solidity
function shouldRebalance() external view returns (uint256[])
```

Retrieves the list of order IDs that need to be rebalanced.

_Initializes an array of order IDs with the size of the active orders count.
Iterates over the active orders and checks each order using the checkOrder function.
If an order needs to be rebalanced, it adds the order ID to the ordersIds array.
If an order does not need to be rebalanced, it increments the skipped counter.
If any orders were skipped, it adjusts the length of the ordersIds array accordingly.
Finally, it returns the array of order IDs that need to be rebalanced._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256[] | An array of order IDs that require rebalance. |

### addTokensToWhitelist

```solidity
function addTokensToWhitelist(address[] tokens) external
```

Adds multiple tokens to the whitelist.

_Only callable by an address with the ADMIN_ROLE.
Requires each token address to be non-zero and not already in the whitelist.
Emits a {TokenAdded} event for each token added to the whitelist._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokens | address[] | An array of token addresses to add. |

### boundOrders

```solidity
function boundOrders(uint256 leftOrderId, uint256 rightOrderId) external
```

Binds two orders together.

_Requires both orders to belong to the calling user and not be DCA orders.
Requires both orders to not be already bound with other orders.
Updates the boundOrder field of each order to bind them together.
Emits a {OrdersBounded} event upon successful binding of the orders._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| leftOrderId | uint256 | The ID of the left order to bind. |
| rightOrderId | uint256 | The ID of the right order to bind. |

### cancelOrders

```solidity
function cancelOrders(uint256[] ordersIds) external
```

Cancels the specified orders.

_Requires the orders to be active and belong to the calling user.
Refunds the base tokens to the user balance.
Emits a {OrderCanceled} event for each canceled order._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ordersIds | uint256[] | Array of order IDs to be canceled. |

### createOrder

```solidity
function createOrder(struct ITradingPlatform.Order order) external returns (uint256)
```

Creates a new order.

_Requires various checks for the validity of the order.
Transfers base tokens from the user to this contract if user balance on contract is insufficient.
Adds the order to the active orders list and associates it with the user.
Emits a {OrderCreated} event upon successful creation of the order._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| order | struct ITradingPlatform.Order | The order to create. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The ID of the created order. |

### deposit

```solidity
function deposit(address token, uint256 amount) external returns (bool)
```

Deposits an amount of tokens into the contract for a specific user.

_Requires the token to be allowed in the whitelist.
Transfers the specified amount of tokens from the user to this contract.
Updates the user's token balance in the contract.
Emits a {Deposited} event upon successful deposit._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | The address of the token to deposit. |
| amount | uint256 | The amount of tokens to deposit. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | A boolean indicating the success of the deposit. |

### executeOrders

```solidity
function executeOrders(uint256[] ordersIds) external returns (bool)
```

Executes the orders specified by the given order IDs.

_Emits a {OrderExecuted} event for each executed order._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ordersIds | uint256[] | An array of order IDs to be executed. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | A boolean value indicating the success of the execution. |

### performUpkeep

```solidity
function performUpkeep(bytes performData) external
```

Performs the upkeep based on the provided performData.

_This function is external and non-reentrant.
Requires at least one order ID to be provided for execution.
It decodes the performData to retrieve the order IDs.
Calls the executeOrders function to execute the specified orders.
Emits a {OrderExecuted} event for each executed order._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| performData | bytes | Encoded data containing the order IDs to be executed. |

### removeTokensFromWhitelist

```solidity
function removeTokensFromWhitelist(address[] tokens) external
```

Removes multiple tokens from the whitelist.

_Only callable by an address with the ADMIN_ROLE.
Removes each token address from the whitelist if it exists.
Emits a {TokenRemoved} event for each token removed from the whitelist._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokens | address[] | An array of token addresses to remove. |

### setProtocolFee

```solidity
function setProtocolFee(uint32 newProtocolFee) external
```

Sets a new protocol fee percentage.

_Only the specified role can call this function.
The new protocol fee must be less than 100% (represented as 1,000,000 in 6 digits precision).
Emits a {ProtocolFeeSet} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newProtocolFee | uint32 | The new protocol fee percentage to be set, represented as a decimal with 6 digits precision. |

### withdraw

```solidity
function withdraw(address token, uint256 amount) external returns (bool)
```

Withdraws an amount of tokens from the contract for a specific user.

_Requires the user to have a sufficient balance of the specified token.
Transfers the specified amount of tokens from the contract to the user.
Updates the user's token balance in the contract.
Emits a {Withdrawed} event upon successful withdrawal._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | The address of the token to withdraw. |
| amount | uint256 | The amount of tokens to withdraw. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | A boolean indicating the success of the withdrawal. |

## IWETH

### deposit

```solidity
function deposit() external payable
```

### withdraw

```solidity
function withdraw(uint256) external
```

## SwapHelperUniswapV3

### ADMIN_ROLE

```solidity
bytes32 ADMIN_ROLE
```

### SWAPPER_ROLE

```solidity
bytes32 SWAPPER_ROLE
```

### PRECISION

```solidity
uint256 PRECISION
```

### swapRouter

```solidity
contract ISwapRouter swapRouter
```

### factory

```solidity
contract IUniswapV3Factory factory
```

### getAmountOut

```solidity
function getAmountOut(address tokenIn, address tokenOut, uint128 amountIn, uint24 fee, uint32 secondsAgo) public view returns (uint256 amountOut)
```

_See {ISwapHelperV3}_

### sortTokens

```solidity
function sortTokens(address tokenA, address tokenB) external pure returns (address token0, address token1)
```

### secondsAgoDefault

```solidity
function secondsAgoDefault() external view returns (uint256)
```

Returns a seconds ago default param

### slippage

```solidity
function slippage() external view returns (uint256)
```

Returns a slippage for calculate price

### constructor

```solidity
constructor(address swapRouter_, address factory_, uint256 slippage_, uint32 secondsAgoDefault_) public
```

Creates an instance of a contract that allows you to do
a single swap on smart contracts UniswapV3 and sends an `outputToken` to the address

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| swapRouter_ | address | Swap router address for exchange |
| factory_ | address | Factory address |
| slippage_ | uint256 | Maximum slippage for swap |
| secondsAgoDefault_ | uint32 | Number of seconds from the current time to query the average price for the period |

### swap

```solidity
function swap(address beneficiary, address tokenIn, address tokenOut, uint128 amountIn, uint24 fee) external returns (uint256 amountOut)
```

_See {ISwapHelperV3}_

### swapWithCustomSlippage

```solidity
function swapWithCustomSlippage(address beneficiary, address tokenIn, address tokenOut, uint128 amountIn, uint24 fee, uint256 slippageForSwap) external returns (uint256 amountOut)
```

_See {ISwapHelperV3}_

### updateSecondsAgoDefault

```solidity
function updateSecondsAgoDefault(uint32 value) external returns (bool)
```

Update secondsAgoDefault param responsible for the number of
seconds since the current moment to query the average price value (100% = 1000000)

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | uint32 | Number of seconds |

### updateSlippage

```solidity
function updateSlippage(uint256 value) external returns (bool)
```

Update slippage for calculate minimum price swap

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | uint256 | Number of seconds |

### onlyRole

```solidity
modifier onlyRole(bytes32 role)
```

Modifier to check different roles

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| role | bytes32 | Role `bytes32` to check availability for user |


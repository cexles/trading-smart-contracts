# Solidity API

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


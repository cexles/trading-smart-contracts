# Solidity API

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


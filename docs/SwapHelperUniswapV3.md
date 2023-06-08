# Solidity API

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


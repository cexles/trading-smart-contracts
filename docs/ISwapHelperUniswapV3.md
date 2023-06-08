# Solidity API

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


# Solidity API

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


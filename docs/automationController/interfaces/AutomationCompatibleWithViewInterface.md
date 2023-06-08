# Solidity API

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


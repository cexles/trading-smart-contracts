# Solidity API

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


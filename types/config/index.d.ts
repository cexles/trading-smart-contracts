declare module "config" {
  export interface GasReporter {
    readonly ENABLED: boolean;
    readonly COINMARKETCAP: string;
    readonly CURRENCY: string;
    readonly TOKEN: string;
    readonly GAS_PRICE_API: string;
  }

  export interface Node {
    readonly GAS_PRICE_NODE: number | "auto";
    readonly LOGGING: boolean;
    readonly FORK: Fork;
  }

  export interface Fork {
    readonly FORK_PROVIDER_URI: string;
    readonly FORK_ENABLED: boolean;
    readonly BLOCK_NUMBER: number;
  }

  export const INFURA_KEY: string;
  export const DEPLOYER_KEY: string;
  export const ETHERSCAN_API_KEY: string;
  export const POLYGONSCAN_API_KEY: string;
  export const BSCSCAN_API_KEY: string;
  export const GAS_PRICE: number;
  export const NODE: Node;
  export const GAS_REPORTER: GasReporter;
  export const DEPLOY: Deploy;

  export interface Deploy {
    TOKEN: {
      readonly DECIMALS: number;
      readonly SUPPLY: number | string;
    };
    TRADING_PLATFORM: {
      ADMIN: string | null;
      SWAP_HELPER: string | null;
      PROTOCOL_FEE: number;
      FEE_RECIPIENT: string | null;
    };
    SWAP_HELPER: {
      SWAP_ROUTER: string;
      FACTORY: string;
      SLIPPAGE: number;
      SECONDS_AGO_DEFAULT: number;
    };
    UPKEEP_CONTROLLER: {
      LINK_TOKEN: string;
      AUTOMATION_REGISTRAR: string;
      AUTOMATION_REGISTRY: string;
    };
  }
}

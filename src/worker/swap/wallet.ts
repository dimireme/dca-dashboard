import {
  type Account,
  type Address,
  type Chain,
  type PublicClient,
  type Transport,
  type WalletClient,
  createPublicClient,
  createWalletClient,
  erc20Abi,
  http,
  maxUint256,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrum } from "viem/chains";
import {
  estimateRequiredEthWei,
  formatInsufficientEthError,
  formatInsufficientUsdcError,
} from "@/worker/swap/preflight";
import { USDC_ADDRESS } from "@/worker/swap/tokens";

export type WorkerClients = {
  account: Account;
  address: Address;
  publicClient: PublicClient<Transport, Chain>;
  walletClient: WalletClient<Transport, Chain, Account>;
};

export function createWorkerClients(
  privateKey: `0x${string}`,
  rpcUrl: string,
): WorkerClients {
  const account = privateKeyToAccount(privateKey);
  const transport = http(rpcUrl);

  const publicClient = createPublicClient({
    chain: arbitrum,
    transport,
  });

  const walletClient = createWalletClient({
    account,
    chain: arbitrum,
    transport,
  });

  return {
    account,
    address: account.address,
    publicClient,
    walletClient,
  };
}

export async function readWbtcBalance(
  publicClient: PublicClient,
  owner: Address,
  token: Address,
): Promise<bigint> {
  return publicClient.readContract({
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [owner],
  });
}

export async function readUsdcBalance(
  publicClient: PublicClient,
  owner: Address,
): Promise<bigint> {
  return publicClient.readContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [owner],
  });
}

/**
 * Cheap RPC-only checks before any Odos quote/assemble.
 * Avoids burning API quota when the wallet cannot pay for the swap.
 */
export async function assertFundsForSwap(
  clients: WorkerClients,
  amountUsdcBaseUnits: bigint,
): Promise<void> {
  const [usdcBalance, ethBalance, gasPrice] = await Promise.all([
    readUsdcBalance(clients.publicClient, clients.address),
    clients.publicClient.getBalance({ address: clients.address }),
    clients.publicClient.getGasPrice(),
  ]);

  if (usdcBalance < amountUsdcBaseUnits) {
    throw new Error(formatInsufficientUsdcError(usdcBalance, amountUsdcBaseUnits));
  }

  // Budget approve + swap — we don't know allowance yet (spender comes from Odos).
  const requiredEth = estimateRequiredEthWei(gasPrice);

  if (ethBalance < requiredEth) {
    throw new Error(formatInsufficientEthError(ethBalance, requiredEth));
  }
}

export async function ensureUsdcAllowance(
  clients: WorkerClients,
  spender: Address,
  amount: bigint,
): Promise<void> {
  const allowance = await clients.publicClient.readContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "allowance",
    args: [clients.address, spender],
  });

  if (allowance >= amount) {
    return;
  }

  console.log(`[worker] Approving USDC for Odos router (spender=${spender})`);

  const hash = await clients.walletClient.writeContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "approve",
    args: [spender, maxUint256],
  });

  const receipt = await clients.publicClient.waitForTransactionReceipt({ hash });

  if (receipt.status !== "success") {
    throw new Error(`USDC approve failed: ${hash}`);
  }

  console.log(`[worker] USDC approve confirmed: ${hash}`);
}

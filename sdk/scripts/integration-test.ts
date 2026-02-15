import { createPublicClient, createWalletClient, http, parseEther, keccak256, toHex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { foundry } from 'viem/chains';
import { HAMNClient } from '../src/hamn.js';

const ANVIL_RPC = process.env.ANVIL_RPC ?? 'http://127.0.0.1:8545';
const MEMORY_NODE_URL = process.env.MEMORY_NODE_URL ?? 'http://127.0.0.1:8080';
const REGISTRY_ADDR = (process.env.REGISTRY_ADDR ??
  '0x5fbdb2315678afecb367f032d93f642f64180aa3') as `0x${string}`;
const DISTRIBUTOR_ADDR = (process.env.DISTRIBUTOR_ADDR ??
  '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512') as `0x${string}`;

// Default: Anvil account #0 private key
const ANVIL_PK =
  process.env.ANVIL_PK ?? '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

async function main() {
  console.log('🚀 Starting E2E Integration Test...');

  // 1. Setup Viem Clients
  const account = privateKeyToAccount(ANVIL_PK);
  const publicClient = createPublicClient({
    chain: foundry,
    transport: http(ANVIL_RPC),
  });
  const walletClient = createWalletClient({
    account,
    chain: foundry,
    transport: http(ANVIL_RPC),
  });

  // 2. Initialize HAMN Client
  const client = HAMNClient.create(
    {
      nodeUrl: MEMORY_NODE_URL,
      rpcUrl: ANVIL_RPC,
      registryAddress: REGISTRY_ADDR,
      distributorAddress: DISTRIBUTOR_ADDR,
    },
    {
      publicClient,
      walletClient,
    }
  );

  // 3. Health Check
  console.log('Checking Memory Node health...');
  try {
    const isHealthy = await client.health();
    if (!isHealthy) throw new Error('Memory Node is unhealthy');
    console.log('✅ Memory Node is online');
  } catch (err) {
    console.error('❌ Failed to connect to Memory Node. Is it running?');
    process.exit(1);
  }

  // 4. Register Pattern On-Chain
  // Generate a random pattern ID
  const patternId = keccak256(toHex(Date.now()));
  const stakeAmount = parseEther('0.01'); // Min stake
  console.log(`Registering pattern ${patternId} on-chain...`);

  const txHash = await client.registerPattern(patternId, stakeAmount);
  console.log(`✅ Registered on-chain. Tx: ${txHash}`);

  // Wait for transaction receipt
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  if (receipt.status !== 'success') throw new Error('Transaction failed');

  // 5. Store Pattern Off-Chain
  console.log('Storing pattern off-chain...');
  const patternData = {
    id: patternId, // Must match on-chain ID (as hex string)
    vector: [0.1, 0.5, 0.9], // 3D vector for test
    confidence: 0.5,
    accessCount: 0,
    lastAccessed: Math.floor(Date.now() / 1000),
    createdAt: Math.floor(Date.now() / 1000),
    tags: ['test', 'e2e'],
  };
  
  // Note: HAMNClient.addPattern takes a Pattern object.
  // The ID in types.ts is string.
  await client.addPattern(patternData);
  console.log('✅ Stored off-chain');

  // 6. Verify Off-Chain Retrieval
  console.log('Verifying off-chain retrieval...');
  const retrieved = await client.getPattern(patternId);
  if (retrieved.id !== patternId) throw new Error('ID mismatch');
  console.log('✅ Retrieval successful');

  // 7. Test Similarity Search
  console.log('Testing similarity search...');
  const queryVec = [0.1, 0.5, 0.9];
  const results = await client.query(queryVec, 1);
  if (results.length === 0) throw new Error('No results found');
  if (results[0].pattern.id !== patternId) throw new Error('Search result mismatch');
  console.log(`✅ Found pattern with similarity: ${results[0].similarity}`);

  // 8. Record Usage (On-chain & Off-chain)
  console.log('Recording usage...');
  await client.recordOnChainUsage(patternId as `0x${string}`);
  await client.recordUsage(patternId, 1.0); // Reward = 1.0
  console.log('✅ Usage recorded');

  // 9. Verify On-Chain State
  const onChainData = await client.getOnChainPattern(patternId as `0x${string}`);
  if (onChainData.usageCount !== 1) throw new Error('On-chain usage count mismatch');
  console.log(`✅ On-chain usage count: ${onChainData.usageCount}`);

  console.log('🎉 E2E Test Completed Successfully!');
}

main().catch((err) => {
  console.error('❌ E2E Test Failed:', err);
  process.exit(1);
});

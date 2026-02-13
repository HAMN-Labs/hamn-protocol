# @hamn/sdk

**TypeScript SDK для протокола HAMN** — взаимодействие с Memory Node и on-chain контрактами через единый API.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 📖 **[English documentation →](./README.md)**

---

## Содержание

- [Установка](#установка)
- [Быстрый старт](#быстрый-старт)
- [Архитектура](#архитектура)
- [Справочник API](#справочник-api)
  - [HAMNClient (Фасад)](#hamnclient-фасад)
  - [MemoryClient (Off-chain)](#memoryclient-off-chain)
  - [ContractClient (On-chain)](#contractclient-on-chain)
- [Типы данных](#типы-данных)
- [Обработка ошибок](#обработка-ошибок)
- [ABI](#abi)
- [Тестирование](#тестирование)
- [Конфигурация](#конфигурация)
- [Примеры](#примеры)

---

## Установка

```bash
npm install @hamn/sdk
# или
yarn add @hamn/sdk
```

**Peer-зависимость:** SDK использует [viem](https://viem.sh/) для on-chain взаимодействий:

```bash
npm install viem
```

---

## Быстрый старт

```typescript
import { HAMNClient } from "@hamn/sdk";
import { createPublicClient, createWalletClient, http, parseEther } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// 1. Создаём viem-клиенты
const account = privateKeyToAccount("0x...");
const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});
const walletClient = createWalletClient({
  account,
  chain: arbitrumSepolia,
  transport: http(),
});

// 2. Инициализируем HAMN
const hamn = HAMNClient.create(
  {
    nodeUrl: "http://localhost:8080",
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    registryAddress: "0x...",
    distributorAddress: "0x...",
  },
  { publicClient, walletClient },
);

// 3. Off-chain: поиск похожих паттернов
const results = await hamn.query([0.9, 0.1, 0.0, 0.5], 5);
console.log("Лучшее совпадение:", results[0]?.pattern.id);

// 4. On-chain: регистрация паттерна
const txHash = await hamn.registerPattern(
  "0x00000000000000000000000000000000000000000000000000000000deadbeef",
  parseEther("0.01"),
);
console.log("Зарегистрирован:", txHash);
```

---

## Архитектура

```
┌─────────────────────────────────────────────┐
│            HAMNClient (Фасад)               │
│  Единый API для off-chain + on-chain        │
├──────────────────┬──────────────────────────┤
│  MemoryClient    │  ContractClient          │
│  HTTP → Node     │  viem → Arbitrum         │
├──────────────────┼──────────────────────────┤
│  Rust Engine     │  PatternRegistry.sol     │
│  (Memory Node)   │  RewardDistributor.sol   │
└──────────────────┴──────────────────────────┘
```

SDK состоит из трёх уровней:

| Уровень       | Модуль           | Транспорт       | Назначение                                  |
| ------------- | ---------------- | --------------- | ------------------------------------------- |
| **Фасад**     | `HAMNClient`     | —               | Единая точка входа для всех операций        |
| **Off-chain** | `MemoryClient`   | HTTP / `fetch`  | Поиск по сходству, CRUD паттернов, обучение |
| **On-chain**  | `ContractClient` | viem / JSON-RPC | Стейкинг, репутация, награды                |

---

## Справочник API

### HAMNClient (Фасад)

Главная точка входа. Объединяет `MemoryClient` и `ContractClient`.

```typescript
import { HAMNClient } from "@hamn/sdk";

const hamn = HAMNClient.create(config, { publicClient, walletClient });
```

#### Фабрика

| Метод                                 | Описание                                                   |
| ------------------------------------- | ---------------------------------------------------------- |
| `HAMNClient.create(config, options?)` | Создать клиент из `HAMNConfig` + опциональные viem-клиенты |

#### Off-chain методы

| Метод                     | Возвращает      | Описание                                        |
| ------------------------- | --------------- | ----------------------------------------------- |
| `query(vector, k?)`       | `QueryResult[]` | Поиск по сходству (top-K)                       |
| `addPattern(pattern)`     | `Pattern`       | Сохранить новый паттерн                         |
| `getPattern(id)`          | `Pattern`       | Получить паттерн по ID                          |
| `removePattern(id)`       | `Pattern`       | Удалить паттерн                                 |
| `recordUsage(id, reward)` | `Pattern`       | Зафиксировать использование + обучение          |
| `decayAll()`              | `void`          | Применить временное затухание ко всем паттернам |
| `health()`                | `boolean`       | Проверка состояния Memory Node                  |

#### On-chain методы

| Метод                        | Возвращает       | Описание                              |
| ---------------------------- | ---------------- | ------------------------------------- |
| `registerPattern(id, stake)` | `0x${string}`    | Регистрация паттерна со стейком в ETH |
| `getOnChainPattern(id)`      | `OnChainPattern` | Чтение on-chain данных паттерна       |
| `isRegistered(id)`           | `boolean`        | Проверка регистрации                  |
| `recordOnChainUsage(id)`     | `0x${string}`    | Запись использования в блокчейн       |
| `depositRewards(amount)`     | `0x${string}`    | Пополнение пула наград                |
| `claimRewards()`             | `0x${string}`    | Получить начисленные награды          |
| `getPendingRewards(address)` | `bigint`         | Проверить баланс наград               |

---

### MemoryClient (Off-chain)

HTTP-клиент для Rust Memory Node. Используйте, когда нужны только off-chain операции.

```typescript
import { MemoryClient } from '@hamn/sdk';

const memory = new MemoryClient({
  nodeUrl: 'http://localhost:8080',
  timeoutMs: 5000, // опционально, по умолчанию: 10000
});

// Поиск по сходству
const results = await memory.query([0.9, 0.1], 3);

// CRUD паттернов
await memory.addPattern({ id: 'p1', vector: [1.0, 0.0], confidence: 0.9, ... });
const pattern = await memory.getPattern('p1');
await memory.removePattern('p1');

// Обучение с подкреплением
await memory.recordUsage('p1', 0.95); // reward ∈ [0, 1]
await memory.decayAll();

// Здоровье
const healthy = await memory.health(); // true / false
```

#### HTTP-эндпоинты

| Метод           | Эндпоинт                   | Описание                          |
| --------------- | -------------------------- | --------------------------------- |
| `query`         | `POST /query`              | `{ vector: number[], k: number }` |
| `addPattern`    | `POST /patterns`           | JSON-тело с паттерном             |
| `getPattern`    | `GET /patterns/:id`        | —                                 |
| `removePattern` | `DELETE /patterns/:id`     | —                                 |
| `recordUsage`   | `POST /patterns/:id/usage` | `{ reward: number }`              |
| `decayAll`      | `POST /decay`              | —                                 |
| `health`        | `GET /health`              | —                                 |
| `getParams`     | `GET /params`              | Возвращает `MathParams`           |

---

### ContractClient (On-chain)

Клиент для смарт-контрактов на Arbitrum через viem. Поддерживает **режим только для чтения** (без `walletClient`).

```typescript
import { ContractClient } from "@hamn/sdk";

const contracts = new ContractClient({
  publicClient,
  walletClient, // опционально — без него только read-операции
  registryAddress: "0x...",
  distributorAddress: "0x...",
});

// Чтение (кошелёк не нужен)
const pattern = await contracts.getPattern("0xabc...");
const registered = await contracts.isRegistered("0xabc...");
const minStake = await contracts.getMinStake();
const pending = await contracts.getPendingRewards("0xuser...");

// Запись (нужен кошелёк)
const tx1 = await contracts.registerPattern("0xabc...", parseEther("0.01"));
const tx2 = await contracts.recordUsage("0xabc...");
const tx3 = await contracts.depositRewards(parseEther("1.0"));
const tx4 = await contracts.claimRewards();
```

---

## Типы данных

```typescript
import type {
  Pattern, // Off-chain паттерн (вектор, уверенность, теги)
  OnChainPattern, // On-chain паттерн (стейк, репутация, счётчик)
  QueryResult, // Результат поиска (паттерн + сходство + score)
  HAMNConfig, // Конфигурация SDK
  MathParams, // Гиперпараметры (alpha, lambda)
} from "@hamn/sdk";
```

### Pattern

| Поле           | Тип        | Описание                             |
| -------------- | ---------- | ------------------------------------ |
| `id`           | `string`   | Уникальный идентификатор (keccak256) |
| `vector`       | `number[]` | Вектор-эмбеддинг                     |
| `confidence`   | `number`   | Уровень доверия [0.0, 1.0]           |
| `accessCount`  | `number`   | Счётчик обращений                    |
| `lastAccessed` | `number`   | UNIX-время последнего доступа        |
| `createdAt`    | `number`   | UNIX-время создания                  |
| `tags`         | `string[]` | Метаданные-теги                      |

### OnChainPattern

| Поле               | Тип                 | Описание                            |
| ------------------ | ------------------- | ----------------------------------- |
| `id`               | `` `0x${string}` `` | bytes32 идентификатор               |
| `owner`            | `` `0x${string}` `` | Адрес контрибьютора                 |
| `stake`            | `bigint`            | Сумма стейка (wei)                  |
| `reputation`       | `number`            | Репутация [0, 10000]                |
| `registrationTime` | `number`            | Время регистрации (block timestamp) |
| `usageCount`       | `number`            | Счётчик использований on-chain      |

### HAMNConfig

| Поле                 | Тип                 | Описание                                  |
| -------------------- | ------------------- | ----------------------------------------- |
| `nodeUrl`            | `string`            | HTTP-адрес Memory Node                    |
| `rpcUrl`             | `string`            | URL узла Arbitrum                         |
| `registryAddress`    | `` `0x${string}` `` | Адрес PatternRegistry                     |
| `distributorAddress` | `` `0x${string}` `` | Адрес RewardDistributor                   |
| `chainId?`           | `number`            | По умолчанию: `421614` (Arbitrum Sepolia) |

---

## Обработка ошибок

Все ошибки SDK наследуют `HAMNError`:

```typescript
import { HAMNError, MemoryNodeError, ContractError } from "@hamn/sdk";

try {
  await hamn.query([1.0, 0.0]);
} catch (err) {
  if (err instanceof MemoryNodeError) {
    console.error("Ошибка Memory Node:", err.statusCode, err.message);
  } else if (err instanceof ContractError) {
    console.error("Ошибка контракта:", err.message);
  }
}
```

| Класс ошибки      | Источник         | Свойства                |
| ----------------- | ---------------- | ----------------------- |
| `HAMNError`       | Базовый класс    | `message`, `cause`      |
| `MemoryNodeError` | `MemoryClient`   | + `statusCode?: number` |
| `ContractError`   | `ContractClient` | —                       |

---

## ABI

Для продвинутых пользователей — прямая работа с контрактами через viem:

```typescript
import { PatternRegistryABI, RewardDistributorABI } from "@hamn/sdk";
import { getContract } from "viem";

const registry = getContract({
  address: "0x...",
  abi: PatternRegistryABI,
  client: publicClient,
});
```

---

## Тестирование

```bash
# Запуск всех тестов
npm test

# Режим наблюдения
npm run test:watch

# Сборка
npm run build
```

Стек тестирования: [vitest](https://vitest.dev/) с моками `fetch` и viem-клиентов.

---

## Конфигурация

### Переменные окружения (рекомендуемый подход)

```bash
HAMN_NODE_URL=http://localhost:8080
HAMN_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
HAMN_REGISTRY_ADDRESS=0x...
HAMN_DISTRIBUTOR_ADDRESS=0x...
HAMN_PRIVATE_KEY=0x...
```

```typescript
const hamn = HAMNClient.create({
  nodeUrl: process.env.HAMN_NODE_URL!,
  rpcUrl: process.env.HAMN_RPC_URL!,
  registryAddress: process.env.HAMN_REGISTRY_ADDRESS! as `0x${string}`,
  distributorAddress: process.env.HAMN_DISTRIBUTOR_ADDRESS! as `0x${string}`,
});
```

---

## Примеры

### Режим только для чтения

```typescript
// Без кошелька — только операции чтения
const hamn = HAMNClient.create(config, { publicClient });

const isReg = await hamn.isRegistered("0xabc...");
const data = await hamn.getOnChainPattern("0xabc...");
const rewards = await hamn.getPendingRewards("0xuser...");
```

### Пакетное отслеживание использования

```typescript
// Фиксация использования и off-chain, и on-chain одновременно
async function trackUsage(id: string, reward: number) {
  const [offChain, txHash] = await Promise.all([
    hamn.recordUsage(id, reward),
    hamn.recordOnChainUsage(id as `0x${string}`),
  ]);
  console.log(`Off-chain confidence: ${offChain.confidence}`);
  console.log(`On-chain tx: ${txHash}`);
}
```

### Режим только Memory Node

```typescript
import { MemoryClient } from "@hamn/sdk";

// Чисто off-chain, без блокчейна
const memory = new MemoryClient({ nodeUrl: "http://localhost:8080" });

await memory.addPattern({
  id: "strategy-yield-low-risk",
  vector: [0.9, 0.1, 0.05, 0.8],
  confidence: 0.95,
  accessCount: 0,
  lastAccessed: Date.now() / 1000,
  createdAt: Date.now() / 1000,
  tags: ["defi", "yield", "low-risk"],
});

const results = await memory.query([0.85, 0.15, 0.1, 0.75], 3);
```

---

## Лицензия

MIT — см. [LICENSE](../LICENSE)

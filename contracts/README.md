# HAMN Contracts

Смарт-контракты HAMN Protocol для Arbitrum (Foundry).

## Что внутри

- `src/PatternRegistry.sol` — регистрация паттернов, stake, reputation, slashing.
- `src/RewardDistributor.sol` — накопление и клейм наград владельцами паттернов.
- `test/PatternRegistry.t.sol` — тесты для обоих контрактов.
- `script/Deploy.s.sol` — скрипт деплоя `PatternRegistry` + `RewardDistributor`.

## Требования

- Foundry (`forge`, `anvil`, `cast`)

Установка:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## Команды

Сборка:

```bash
forge build
```

Тесты:

```bash
forge test
```

Локальная сеть:

```bash
anvil
```

Деплой в локальный Anvil:

```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url http://127.0.0.1:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

## Заметки

- `PatternRegistry.minStake` по умолчанию: `0.01 ether`.
- `RewardDistributor.accrueReward` доступен только `owner` контракта.

# Current Sprint

Период: 2026-02-16 → 2026-02-23

## Goals

1. Стабилизировать локальный E2E workflow для разработчиков.
2. Убрать рассинхрон между кодом и документацией.
3. Запустить подготовительный этап Phase 5 (Stylus + Mainnet) на уровне архитектуры и planning.

## Scope

| ID | Task | Status | Definition of Done |
|---|---|---|---|
| HAMN-030 | Phase 5 planning: Stylus Integration & Mainnet deployment | done | Утвержден master plan + декомпозирован backlog на WS1-WS5 |
| HAMN-031 | Stylus boundary spec v1 (data model + deterministic math) | done | Есть спецификация интерфейсов, форматов и deterministic math subset |
| HAMN-032 | `stylus-engine/` skeleton + базовый CI pipeline | in-progress | Репозиторный модуль создан, базовая сборка и тестовый pipeline проходят |
| HAMN-014 | Проверка `GET /params` в интеграции | next | Тест падает без endpoint и проходит с endpoint |

## Out of Scope

- Полная миграция всей off-chain логики в Stylus в рамках текущего спринта.
- Mainnet go-live до прохождения security gate.
- Изменение токеномики reward модели.

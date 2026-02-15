# Development Process Docs

Эта папка предназначена для регулярного ведения процесса разработки HAMN Protocol.

## Файлы

- `docs/BACKLOG.md` — все задачи (идеи, planned, next, in-progress, blocked, done).
- `docs/SPRINT.md` — текущий фокус на ближайший спринт/итерацию.
- `docs/CHANGELOG_DEV.md` — инженерный журнал изменений (дата, что сделано, что проверить).
- `docs/DECISIONS.md` — архитектурные и процессные решения (ADR-lite).
- `docs/RISKS.md` — риски, блокеры, зависимости.
- `docs/PHASE5_STYLUS_MAINNET_PLAN.md` — план Phase 5 (Stylus Integration + Mainnet deployment).
- `docs/INTEGRATION_HISTORY.md` — исторический интеграционный контекст (миграция из legacy `doc/`).
- `docs/specs/stylus-boundary-v1.md` — boundary-спецификация v1 для Stylus (форматы и deterministic math).

## Правила обновления

1. Любая новая задача сначала попадает в `BACKLOG.md`.
2. Перед началом работы задача переносится в `SPRINT.md` и помечается `in-progress`.
3. После завершения:
   - статус в `BACKLOG.md` → `done`;
   - запись в `CHANGELOG_DEV.md`;
   - при необходимости — запись в `DECISIONS.md`.
4. Если есть неопределенность/внешняя зависимость — фиксируется в `RISKS.md`.

## Статусы

- `idea`
- `planned`
- `next`
- `in-progress`
- `blocked`
- `done`

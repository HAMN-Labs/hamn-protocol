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
- `docs/specs/test-vectors/stylus-boundary-v1.json` — parity test-vectors для верификации формул v1.
- `docs/security/stylus-threat-model-v1.md` — модель угроз для Stylus-интеграции.
- `docs/ops/testnet-deployment-runbook.md` — runbook деплоя в testnet и smoke checklist.
- `docs/ops/canary-rollout-plan.md` — canary rollout: gates, metrics, rollback criteria.
- `docs/ops/mainnet-go-no-go-checklist.md` — production checklist перед mainnet go-live.
- `docs/ops/mainnet-go-no-go-template.md` — шаблон финального go/no-go решения.
- `docs/ops/mainnet-deployment-ledger-template.md` — шаблон журнала mainnet deployment (addresses/tx/config/sign-off).
- `docs/process/PR_POLICY.md` — обязательный PR process-checklist и правила сопровождения документации.

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

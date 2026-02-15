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
- `docs/specs/test-vectors/stylus-boundary-v1-batch-config.json` — batch parity harness конфиг для массовой сверки.
- `docs/security/stylus-threat-model-v1.md` — модель угроз для Stylus-интеграции.
- `docs/ops/testnet-deployment-runbook.md` — runbook деплоя в testnet и smoke checklist.
- `docs/ops/canary-rollout-plan.md` — canary rollout: gates, metrics, rollback criteria.
- `docs/ops/canary-scorecard-template.md` — шаблон итогового canary gate scorecard (PASS/WARN/FAIL + metrics).
- `docs/ops/mainnet-go-no-go-checklist.md` — production checklist перед mainnet go-live.
- `docs/ops/mainnet-go-no-go-template.md` — шаблон финального go/no-go решения.
- `docs/ops/mainnet-deployment-ledger-template.md` — шаблон журнала mainnet deployment (addresses/tx/config/sign-off).
- `docs/ops/offchain-to-stylus-cutover-plan.md` — stage-based cutover и freeze policy для миграции на Stylus.
- `docs/ops/legacy-offchain-decommission-plan.md` — staged retirement legacy off-chain path после стабилизации Stylus-first.
- `docs/ops/post-deploy-verification-template.sh` — шаблон post-deploy проверок (health/RPC/code/smoke).
- `docs/ops/post-deploy-verification-template.md` — инструкция по запуску и обязательным переменным.
- `docs/ops/incident-postmortem-template.md` — шаблон RCA/postmortem для rollout инцидентов.
- `docs/ops/release-communications-template.md` — шаблон internal/public коммуникаций по релизу.
- `docs/ops/incident-timeline-log-template.md` — шаблон журнала событий deployment window (UTC timeline).
- `docs/ops/release-owner-handoff-checklist-template.md` — шаблон handoff ответственности между release owners.
- `docs/process/PR_POLICY.md` — обязательный PR process-checklist и правила сопровождения документации.
- `docs/process/release-signoff-matrix.md` — матрица обязательных approve-ролей для rollout/go-live.
- `docs/process/release-readiness-review-checklist-template.md` — чеклист readiness review перед финальным GO/NO-GO.
- `docs/process/release-dependency-owner-map-template.md` — шаблон dependency/owner map для release scope и rollback ownership.

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

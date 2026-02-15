# Risks & Blockers

## Active Risks

| ID | Risk | Impact | Likelihood | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|
| R-001 | Отсутствие CI E2E проверки может пропускать регрессии интеграции | High | Medium | Добавить CI smoke с anvil + memory node + sdk e2e | unassigned | open |
| R-002 | Дублирование `doc/` и `docs/` создает расхождение документации | Medium | Medium | План консолидации, оставить один «живой» каталог | unassigned | open |
| R-003 | Расхождение deterministic math между off-chain Rust и Stylus может ломать валидацию/награды | High | Medium | Test vectors parity suite + strict boundary spec (HAMN-031) | unassigned | open |
| R-004 | Неполная security readiness перед mainnet deployment | High | Medium | Threat model, security gate, external review checklist (HAMN-034) | unassigned | open |
| R-005 | Операционные риски при go-live (мониторинг, rollback, инцидент-реакция) | High | Medium | Deployment runbook + canary rollout plan + alerting (HAMN-035/036/037) | unassigned | open |

## Blockers

- Нет назначенных owner-ов по Workstreams WS1-WS5 для Phase 5.

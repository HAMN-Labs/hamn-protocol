# Phase 5 Plan: Stylus Integration & Mainnet Deployment

Статус: draft
Дата: 2026-02-16
Owner: protocol team

## Objective

Перейти от текущего MVP (Solidity contracts + off-chain Rust memory node) к production-подходу:
- критическая логика верификации/скоринга переносится в Arbitrum Stylus (Rust/WASM);
- подготовлен и выполнен безопасный mainnet deployment;
- SDK и операционный контур готовы к production-нагрузке.

## Scope

### In Scope

- Архитектура Stylus-контрактов и boundary с существующими Solidity-контрактами.
- Реализация MVP Stylus-модуля для deterministic score verification.
- Тестирование: unit, integration, gas/perf benchmark, security checks.
- Deployment pipeline: testnet -> canary -> mainnet.
- Наблюдаемость и runbooks для post-deploy поддержки.

### Out of Scope

- Полная миграция всей off-chain памяти on-chain.
- Изменение бизнес-модели reward marketplace.
- Масштабная токеномика/управление DAO.

## Target Architecture (Phase 5)

- `core-engine` остается источником retrieval-кандидатов off-chain.
- Stylus layer выполняет on-chain verification/normalization критичных метрик.
- `PatternRegistry`/`RewardDistributor` либо интегрируются с Stylus-модулем, либо получают adapter-слой.
- `sdk` поддерживает dual mode: legacy (Solidity-only) и stylus-enabled.

## Workstreams

## WS1: Protocol & Architecture

- Зафиксировать спецификацию data model для Stylus boundary.
- Определить deterministic math subset (без расхождений Rust off-chain vs Stylus).
- Описать migration strategy для state и backward compatibility.

Deliverables:
- Spec v1 (`docs/specs/stylus-boundary-v1.md`)
- Compatibility matrix (`legacy` / `stylus-enabled`)

## WS2: Stylus Implementation

- Создать `stylus-engine/` (или эквивалентный модуль) с базовым контрактом.
- Реализовать функции верификации score/freshness/reinforcement на chain.
- Подготовить ABI/интерфейсы для интеграции с текущими контрактами.

Deliverables:
- Stylus contract MVP
- Test vectors parity suite

## WS3: Security & Reliability

- Threat model для Stylus + bridge-взаимодействий.
- Property-based tests / fuzzing для критической математики.
- External review checklist (auditor-ready package).

Deliverables:
- Threat model doc
- Security checklist + findings log

## WS4: DevEx / SDK / Tooling

- Расширить `@hamn/sdk` поддержкой stylus endpoints/methods.
- Добавить feature flag: `mode: "legacy" | "stylus"`.
- Обновить e2e сценарий и локальный tooling.

Deliverables:
- SDK release candidate
- Updated integration tests

## WS5: Deployment & Operations

- Подготовить deployment runbook для Arbitrum testnet/mainnet.
- Настроить monitoring/alerts (tx failures, latency, reward anomalies).
- Определить rollback/freeze процедуры.

Deliverables:
- Mainnet deployment checklist
- Post-deploy runbook

## Milestones

1. M1: Architecture freeze
Definition of Done:
- Спецификация boundary и deterministic math утверждены.
- Зафиксированы API изменения для SDK и контрактов.

2. M2: Stylus MVP on testnet
Definition of Done:
- Stylus-модуль задеплоен в testnet.
- Parity тесты с off-chain math проходят.

3. M3: Security gate
Definition of Done:
- Пройден внутренний security review.
- Закрыты критичные/высокие findings.

4. M4: Canary rollout
Definition of Done:
- Ограниченный production-like rollout с мониторингом.
- Нет blocking инцидентов в agreed observation window.

5. M5: Mainnet go-live
Definition of Done:
- Deployment выполнен по runbook.
- Smoke checks и post-deploy verification пройдены.

## Exit Criteria for Phase 5

- Stylus path доступен в SDK и покрыт автоматическими тестами.
- Mainnet deployment завершен и задокументирован.
- Есть operational readiness: мониторинг, алерты, rollback plan.
- README roadmap и docs обновлены под production state.

## Immediate Next Actions (1-2 недели)

1. Утвердить технический owner-состав по WS1-WS5.
2. Создать skeleton `stylus-engine/` + CI шаблон.
3. Подготовить spec draft boundary + test vectors.
4. Определить минимальный mainnet cut для первой поставки.

## Sprint Override (2026-02-16)

По решению продукта текущий спринт включает расширенный scope:
- полная миграция off-chain логики в Stylus в рамках sprint window;
- legacy путь остается только как fallback до завершения cutover.

Execution tracking:
- Epic: `HAMN-050`
- Subtasks: `HAMN-051..HAMN-056` (см. `docs/BACKLOG.md`).

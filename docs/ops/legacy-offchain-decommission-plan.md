# Legacy Off-Chain Path Decommission Plan

Статус: draft  
Дата: 2026-02-16  
Task: HAMN-056

## Objective

Контролируемо вывести из эксплуатации legacy off-chain serving path после стабилизации Stylus-first production режима.

## Scope

- In scope:
  - отключение штатного использования legacy path;
  - staged reduction fallback возможностей;
  - обновление runbooks/alerts/governance checklist.
- Out of scope:
  - изменение reward tokenomics;
  - рефактор core protocol economics.

## Preconditions

- Canary + mainnet rollout по Stylus path завершены и приняты.
- Нет открытых Critical/High инцидентов по Stylus serving path.
- Подтвержден baseline SLO без legacy traffic.

## Decommission Stages

### D0: Evidence Freeze

- Зафиксировать метрики за последние 14 дней:
  - query success rate;
  - p95/p99 latency;
  - verifier error rate;
  - доля legacy fallback traffic.
- Подготовить governance packet с артефактами.

### D1: Default Fallback Disabled

- Установить `legacyFallbackEnabled=false` как обязательный production default.
- Legacy fallback доступен только через incident override.
- Включить alert на любое legacy traffic > 0% вне active incident.

### D2: Privileged Fallback Restriction

- Ограничить fallback override role-based доступом (incident commander + protocol owner).
- Зафиксировать TTL override (например, не более 24 часов).
- Любой override требует post-incident review.

### D3: Code/Config Retirement

- Удалить legacy-serving playbooks из стандартного deployment path.
- Перевести legacy integration tests в archived/compat suite.
- Обновить docs: primary path только Stylus.

### D4: Final Governance Closure

- Выполнить финальный go/no-go для полного retirement legacy path.
- Подписать closure record (Protocol/Security/Ops).
- Перевести задачу в done с ссылками на артефакты.

## Rollback Policy

- Если после D1/D2 наблюдается degradation выше error budget:
  - временно разрешить incident fallback;
  - ограничить TTL fallback window;
  - провести root-cause и вернуть staged plan с обновленным сроком.

## Artifacts

- Canary scorecard + mainnet go/no-go record.
- Release dependency/owner map.
- Incident timeline logs (если были fallback overrides).
- Final closure memo.

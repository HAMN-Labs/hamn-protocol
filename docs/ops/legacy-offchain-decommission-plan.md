# Legacy Off-Chain Path Decommission Plan

Статус: ready-for-review  
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

## Ownership Matrix

| Scope | Primary Owner | Backup Owner | Approval Required |
|---|---|---|---|
| Protocol policy (`mode=stylus`, fallback rules) | Protocol Owner | Tech Lead | Protocol + Security |
| Incident override governance | Incident Commander | Ops Lead | Ops + Protocol |
| Runtime monitoring/alerts | SRE/Ops | On-call Backup | Ops |
| SDK config rollout | SDK Owner | Release Owner | Protocol + Ops |
| Closure decision (D4) | Release Owner | Program Owner | Protocol + Security + Ops |

## Target Timeline

- D0 Evidence Freeze: 2026-02-17 -> 2026-02-18
- D1 Default Fallback Disabled: 2026-02-19
- D2 Privileged Fallback Restriction: 2026-02-20
- D3 Code/Config Retirement: 2026-02-21 -> 2026-02-22
- D4 Final Governance Closure: 2026-02-23

Если хотя бы один gate не выполнен, следующий stage не открывается.

## Decommission Stages

### D0: Evidence Freeze

- Зафиксировать метрики за последние 14 дней:
  - query success rate;
  - p95/p99 latency;
  - verifier error rate;
  - доля legacy fallback traffic.
- Подготовить governance packet с артефактами.
- Gate:
  - query success rate >= 99.0%;
  - legacy fallback traffic <= 0.5% (только инцидентные окна);
  - нет незакрытых Sev1/Sev2 инцидентов в observation window.

### D1: Default Fallback Disabled

- Установить `legacyFallbackEnabled=false` как обязательный production default.
- Legacy fallback доступен только через incident override.
- Включить alert на любое legacy traffic > 0% вне active incident.
- Gate:
  - production config diff подтверждает `legacyFallbackEnabled=false`;
  - alert rule на unexpected legacy traffic активирован и протестирован.

### D2: Privileged Fallback Restriction

- Ограничить fallback override role-based доступом (incident commander + protocol owner).
- Зафиксировать TTL override (например, не более 24 часов).
- Любой override требует post-incident review.
- Gate:
  - override выполняется только через документированный approval trail;
  - TTL override enforced и проверен dry-run.

### D3: Code/Config Retirement

- Удалить legacy-serving playbooks из стандартного deployment path.
- Перевести legacy integration tests в archived/compat suite.
- Обновить docs: primary path только Stylus.
- Gate:
  - CI/release templates больше не ссылаются на legacy baseline flow;
  - docs index/runbooks отражают только Stylus baseline и incident fallback.

### D4: Final Governance Closure

- Выполнить финальный go/no-go для полного retirement legacy path.
- Подписать closure record (Protocol/Security/Ops).
- Перевести задачу в done с ссылками на артефакты.
- Gate:
  - подписанный closure record приложен;
  - backlog/sprint/changelog синхронизированы.

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

## Exit Criteria

- Legacy path не используется как штатный serving route.
- Любой fallback возможен только через incident override с TTL и approval trail.
- Все D0..D4 gate checks закрыты и приложены к closure memo.

# Incident Timeline Log Template (Deployment Window)

Статус: active
Дата: 2026-02-16
Task: HAMN-044

## Purpose

Единый формат фиксации событий rollout/deployment в UTC.
Используется как источник для postmortem и go/no-go решений.

## Template

| Time (UTC) | Event Type | Component | Severity | Description | Actor | Evidence Link |
|---|---|---|---|---|---|---|
|  | rollout_start |  | info |  |  |  |
|  | metric_alert |  | warn |  |  |  |
|  | mitigation |  | info |  |  |  |
|  | decision |  | info |  |  |  |
|  | rollout_complete |  | info |  |  |  |

## Event Type Reference

- `rollout_start`
- `rollout_stage_change`
- `metric_alert`
- `incident_declared`
- `mitigation`
- `rollback_trigger`
- `decision`
- `rollout_complete`

## Rules

- Все timestamp только в UTC.
- Каждая запись должна иметь `Actor` и ссылку на evidence (log/tx/dashboard).
- Для Sev-1/Sev-2 событий запись обязательна в течение 5 минут.

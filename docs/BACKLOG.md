# BACKLOG

Обновлено: 2026-02-16

## In Progress

| ID | Task | Area | Priority | Status | Owner | Notes |
|---|---|---|---|---|---|---|
| HAMN-013 | Организовать единый dev-process в `docs/` | Process | P1 | in-progress | codex | Стартовые шаблоны и правила ведения |

## Next

| ID | Task | Area | Priority | Status | Owner | Notes |
|---|---|---|---|---|---|---|
| HAMN-014 | Добавить верификацию `GET /params` интеграционным тестом | Core/SKD | P1 | next | unassigned | Зафиксировать API-контракт между Rust и TS |
| HAMN-015 | Добавить make-таргет для полного E2E smoke (с проверкой health) | DX | P2 | next | unassigned | Ускорить локальную проверку изменений |
| HAMN-016 | Вынести адреса локального деплоя в документированную `.env` схему | SDK | P2 | next | unassigned | Меньше ручных ошибок в e2e |

## Planned

| ID | Task | Area | Priority | Status | Owner | Notes |
|---|---|---|---|---|---|---|
| HAMN-017 | Добавить CI job для E2E (anvil + memory node + sdk script) | CI | P2 | planned | unassigned | Сейчас есть модульные тесты, нет сквозной проверки |
| HAMN-018 | Привести `doc/` и `docs/` к единой структуре | Docs | P3 | planned | unassigned | Избежать дублирования источников |

## Done

| ID | Task | Area | Priority | Status | Owner | Notes |
|---|---|---|---|---|---|---|
| HAMN-010 | Добавить `GET /params` в core-engine | Core | P1 | done | codex | API синхронизирован с SDK |
| HAMN-011 | Добавить `Makefile` с локальным workflow | DX | P1 | done | codex | `make help`, `make test`, `make e2e` |
| HAMN-012 | Обновить root/contracts README под реальное состояние проекта | Docs | P2 | done | codex | Убраны шаблонные/устаревшие секции |

## Icebox

| ID | Task | Area | Priority | Status | Owner | Notes |
|---|---|---|---|---|---|---|
| HAMN-019 | Добавить persistent storage для MemoryNode (autoload/autosave) | Core | P3 | idea | unassigned | Сейчас хранение in-memory |

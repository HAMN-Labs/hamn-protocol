# Dev Changelog

## 2026-02-16

- Добавлен `GET /params` в `core-engine/src/main.rs`.
- Добавлен корневой `Makefile` для локального workflow (`test`, `deploy-local`, `e2e`, и др.).
- Добавлен `make process-check` для контроля обновления process-docs при изменениях кода.
- Обновлены `README.md` и `contracts/README.md`.
- Создана структура ведения процесса в `docs/` (`BACKLOG`, `SPRINT`, `DECISIONS`, `RISKS`).
- Legacy-документы из `doc/` консолидированы в `docs/INTEGRATION_HISTORY.md`.
- В `doc/` оставлены redirect-файлы на актуальные документы в `docs/`.
- Добавлен master plan Phase 5: `docs/PHASE5_STYLUS_MAINNET_PLAN.md`.
- Добавлен boundary spec v1: `docs/specs/stylus-boundary-v1.md`.
- Зафиксировано архитектурное решение DEC-002 по fixed-point math для Stylus boundary.
- Создан `stylus-engine` skeleton (`stylus-engine/Cargo.toml`, `stylus-engine/src/lib.rs`, `stylus-engine/README.md`).
- Добавлен CI workflow для stylus-engine: `.github/workflows/stylus-engine.yml`.
- Прогон тестов `stylus-engine`: 4/4 passed.
- Sprint/backlog обновлены: `HAMN-032` закрыт, `HAMN-033` переведена в `in-progress`.

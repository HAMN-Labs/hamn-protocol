# Current Sprint

Период: 2026-02-16 → 2026-02-23

## Goals

1. Стабилизировать локальный E2E workflow для разработчиков.
2. Убрать рассинхрон между кодом и документацией.
3. Подготовить почву для CI smoke E2E.

## Scope

| ID | Task | Status | Definition of Done |
|---|---|---|---|
| HAMN-013 | Организовать единый dev-process в `docs/` | in-progress | Создана структура файлов и описаны правила обновления |
| HAMN-014 | Проверка `GET /params` в интеграции | next | Тест падает без endpoint и проходит с endpoint |
| HAMN-015 | Make smoke e2e target | next | Одна команда выполняет ключевые проверки локально |

## Out of Scope

- Миграция на production deployment scripts.
- Изменение токеномики reward модели.

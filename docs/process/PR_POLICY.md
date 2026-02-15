# PR Process Policy

Статус: active
Дата: 2026-02-16
Task: HAMN-021

## Purpose

Обеспечить, что изменения в коде всегда сопровождаются актуализацией process-документов.

## Required for every PR

1. Заполнить `.github/PULL_REQUEST_TEMPLATE.md`.
2. При изменениях в коде обновить:
- `docs/BACKLOG.md`
- `docs/CHANGELOG_DEV.md`
3. Если меняется статус задач спринта, обновить `docs/SPRINT.md`.
4. Если есть архитектурное решение, обновить `docs/DECISIONS.md`.
5. Если появляются новые риски, обновить `docs/RISKS.md`.
6. Выполнить `make process-check`.

## Enforcement

- `make process-check` должен проходить локально перед PR.
- Reviewer отклоняет PR, если process-checklist не заполнен или неактуален.

## Exceptions

Разрешены только для:
- чисто документационных PR без изменений кода;
- emergency hotfix с последующим follow-up PR на документацию.

Для exception обязательно указать причину в PR разделе `Risks`.

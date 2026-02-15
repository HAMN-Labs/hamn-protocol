# Decisions (ADR-lite)

## DEC-001: Вести процесс разработки в репозитории
- Date: 2026-02-16
- Status: accepted
- Context: Процессные артефакты были разрознены (`doc/` для разовой интеграции, пустой `docs/`).
- Decision: Использовать `docs/` как единый источник для backlog/sprint/changelog/risks/decisions.
- Consequences:
  - Проще отслеживать состояние задач и прогресс.
  - Нужна дисциплина обновления файлов при каждом изменении.

## DEC-002: Для Stylus boundary v1 использовать fixed-point SCALE=1_000_000 и floor rounding
- Date: 2026-02-16
- Status: accepted
- Context: floating-point вычисления дают риск расхождений между off-chain Rust и on-chain Stylus.
- Decision: В `stylus-boundary-v1` использовать целочисленную fixed-point арифметику (`SCALE=1_000_000`) с правилом округления floor.
- Consequences:
  - Предсказуемая и детерминированная on-chain верификация.
  - Нужно поддерживать parity test vectors и контроль переполнений.

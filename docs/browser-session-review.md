# Browser session adapter review — 2026-10-12

Reviewed the public API reference and currently shipped website chunks for settings,
lookup layout and language handling. The authenticated API endpoint inventory and
documentation hash are unchanged. The website retains nine lookup tabs, four
definition sections, the locked definition tab, null reset semantics for popup
preferences and tone palettes, and language-specific reading aids. Its internal
shift-hover option is not part of the documented writable API contract; consumers
retain the supported click/hover controls. Internal comic/video settings and
per-language website translation overrides are not uploaded by these clients.

The new browser session host uses the existing analysis/lookup normalization and
settings editor. It keeps all account responses in memory, delegates credentials
to the host vault, aborts transport on disposal, and invalidates queued work.
Initialization only reads settings. Deck creation, vocabulary and settings writes
must originate in explicit UI actions. Existing userscript storage keys and
desktop transport interfaces remain compatible.

Validation: shared type checks and 23 contract tests, including cancellation of
four pending and four queued account writes with mock transport. Both consumers
must be imported and checked with the released shared-update workflow. Browser
and Shadow DOM integration checks belong to the consumers.

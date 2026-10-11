# Public Lexirise compatibility review

Reviewed the public API reference and settings, popup, language and tone-palette
modules on 2026-10-11. No authenticated account writes were performed.

The account tone-palette selector now offers Lexirise, Pleco, MDBG, colorblind
and custom palettes. The local reading palette remains independent, including
existing Migaku-style colors. Changing local readings or colors never writes
account settings. Only an explicit account save sends a minimal per-language
patch. Unchanged legacy account values are preserved; unsupported newly selected
presets are rejected before transport.

The API's global/per-language settings structure, writable field separation,
lookup transport and study/translation/interface language separation remain
compatible. The newly documented text-chapter upload endpoint is additive and
is not used by the shared reader/settings UI. The public-reference baseline was
updated after this review and the palette adaptation.

Sources: [API reference](https://lexirise.app/api-reference) and
[public Lexirise application](https://lexirise.app/).

Validation uses synthetic account snapshots and mocked account patches. Both
consumer integrations must pass their browser, mobile, zoom and isolation checks
after importing the released shared package.

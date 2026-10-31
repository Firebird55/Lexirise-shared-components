# Public Lexirise compatibility review — 2026-10-31

The upstream watch detected changed public documentation and UI hashes, with no
added or removed endpoint strings. Reviewing accepted values still found a
functional change: the website now offers `wordPopupOpenMode: shift-hover`.
Version 1.0.12 preserved that account value but handled it as click mode.

The shared reader now offers all three modes, opens on Shift-only pointer entry,
and toggles when Shift is pressed over a word. Modified shortcuts, repeated keys,
dragging, typing fields and disabled popups do not trigger it. Pointer-opened
Shift popups allow movement into their portal and close after leaving both areas.
Click/tap and Enter/Space access remain available. Existing storage keys and local
grammar-state behavior are unchanged.

The [public settings helper](https://lexirise.app/_next/static/chunks/1i0u8jpv5kylz.js)
(SHA-256 `d8256ad47239eac2d1aef9f52e4f3db430d4b0429cd275ab9f4fe9360301aa9c`)
and [lookup implementation](https://lexirise.app/_next/static/chunks/2nzxjj_v_r-x8.js)
(`6c60472c93c3cfc51e47393d7710298374c817a843e3571aad8b26f698587547`)
provide the gesture and 100 ms close-delay evidence. Public JavaScript URLs can
change with deployment; hashes identify the reviewed bytes.

The [API reference](https://lexirise.app/api-reference) now documents remote
grammar-state writes. Reader copy no longer claims those writes are unavailable:
these integrations intentionally keep their grammar buttons local. No account
was queried or changed in this review; all write tests use mocks.

The 31 study languages, 26 translation/interface languages, applicable reading
aids, tone palettes, popup tab/section IDs, translation fallbacks and existing
REST analysis/dictionary/settings requests remain compatible. The
[AI-readable index](https://lexirise.app/llms.txt) is an index of public product
and learning pages, not a replacement transport contract. The public watch
baseline was recorded in the canonical shared repository after this review.

Validation includes shared contract tests and the consumer's isolated
`scripts/shift-hover-e2e.mjs` using canonical sources before release and the
verified package after synchronization. Its Chromium/Firefox matrix covers
document/Shadow DOM, mouse/touch, portal movement, typing, keyboard access,
explicit click mode and disabled popups without account writes. This is browser
automation, not physical-device or live-account acceptance.

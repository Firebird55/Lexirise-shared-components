# Reader typography regression — 2026-10-31

Mixed known and annotated words previously centered their entire annotation
stacks. This moved the source text to different baselines. Token margins and
wide meanings also introduced spaces inside provider-split words such as
`churro's`, and closing punctuation could wrap separately.

The reader now aligns each source-text baseline. Above-text readings stay in
flow; meanings occupy a reserved two-line area below the source and cannot
stretch its width. Long meanings are visibly shortened, with their complete
text retained in the title and lookup. Source-word wrappers keep split Latin
words, internal apostrophes and closing punctuation together. CJK punctuation
is attached to its preceding token without grouping an entire sentence.
Original source text, UTF-16 offsets and provider lookup tokens are unchanged.
The same rendering rules apply to annotated lookup examples.

Validation uses authored fixtures and mocked account transport. Shared tests
cover apostrophes, accents, combining marks, UTF-16 positions, phrase tokens,
mixed scripts and CJK punctuation. The consumer regression
`scripts/reader-typography-e2e.mjs` builds the actual shared reader and stylesheet
and checks Chromium and Firefox in both document and Shadow DOM hosts. It
checks 320, 390, 768, 853 and 1280-pixel viewports, including CSS scale 1.5,
source glyph baselines, exact sentence text, punctuation, bounded glosses,
long-word wrapping and unchanged lookup positions. These are browser layout
tests; CSS scaling is not a claim of native browser or Windows DPI validation.
Screenshots are reviewed locally and remain ignored build output.

Run the consumer regression with `--shared-source <canonical-shared-root>`
before publication; its default mode tests the pinned imported release. Both
consumers must import the released version through the shared updater.

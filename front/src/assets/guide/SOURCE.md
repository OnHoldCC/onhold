# Guide screenshots

- `open-claude.jpg`: actual signed-in Claude restricted page captured in Chrome on 2026-10-20. Chrome Translate was used to display the Chinese page in English. No account identifier or login credential appears.
- `cookies-redacted.png`: derived from the real DevTools screenshot the user supplied in this chat on 2026-10-19. imagegen applied the opaque Value-column privacy mask. All cookie values are hidden. The unredacted source is not copied into the project or build.
- `verify.png`: actual local ONHOLD NFT verification form, captured with an empty credential field. No successful verification or NFT mint is fabricated.

The older redacted Cookie screenshot is retained as source material; the active tutorial uses Network → standing → Copy as cURL.

- `network-curl.png`: real Chrome Network screenshot supplied by the user on 2026-10-20. It shows the `standing` request and Copy → Copy as cURL menu, without request headers or credential values. Numbered callouts are rendered as SVG overlays by the guide, including in the enlarged view. Steps 2–3 now use the Network/cURL flow rather than the Cookie table.

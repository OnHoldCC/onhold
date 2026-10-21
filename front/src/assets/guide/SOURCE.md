# Guide screenshots

- `open-claude.png`: actual signed-in Claude restricted page captured in Chrome on 2026-10-20. Chrome Translate was used to display the Chinese page in English. The built-in imagegen privacy edit removes the entire tab strip, address bar, profile avatar and browser controls while preserving the English restriction-page content. No account identifier or login credential appears.
- `cookies-redacted.png`: derived from the real DevTools screenshot the user supplied in this chat on 2026-10-19. imagegen applied the opaque Value-column privacy mask. All cookie values are hidden. The unredacted source is not copied into the project or build.
- `verify.png`: actual local ONHOLD NFT verification form, captured with an empty credential field. No successful verification or NFT mint is fabricated.

The older redacted Cookie screenshot is retained as source material; the active tutorial uses Network → standing → Copy as cURL.

- `network-curl.png`: Chrome Network screenshot supplied by the user on 2026-10-20, privacy-edited with the built-in imagegen tool to remove the entire address bar, bookmarks bar, browser profile and extensions. It shows the `standing` request and Copy → Copy as cURL menu, without request headers or credential values. Numbered callouts are rendered as SVG overlays by the guide, including in the enlarged view. Steps 2–3 now use the Network/cURL flow rather than the Cookie table.

Privacy edit prompt: remove the entire browser chrome above the page; retain the Network panel, standing request and Copy as cURL menu; add no labels. The application overlays F12/F5 and step numbers in the project font, without circles.

- `paste-curl.png`: current OnHold verification form captured directly in the browser with an empty credential field. SVG callouts mark Paste (1) and Next (2).
- `nft-preview.png`: current project BanPassCard and renderBanPassPng captured in a local preview, with an explicitly labeled synthetic example account. It illustrates the NFT and Mint NFT control, without submitting verification or an on-chain transaction.

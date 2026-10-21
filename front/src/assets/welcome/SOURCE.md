# Welcome letter portrait

## Delivery variants

The PNG is retained as the source only. The website loads `claude-code-girl-640.webp` on viewports up to 640px (84,166 bytes), or `claude-code-girl-1024.webp` on larger viewports (168,798 bytes). Both retain transparent alpha. Generated with local libwebp 1.6.0: `cwebp -q 82 -alpha_q 100 -m 6 -sharp_yuv -metadata none -resize WIDTH 0 SOURCE -o OUTPUT`.

`front/src/portrait-shape.mjs` contains an inline polygon traced from the source alpha channel. It clips the existing SingleSpark skeleton to the character silhouette without another network request. The portrait fades in only after the browser has downloaded and decoded it; a failed image leaves the silhouette visible and the onboarding remains usable.

Final production asset: `claude-code-girl-spark.png` (transparent character cutout). Only this final asset is used in the app. Built-in image_gen mode; initial generation followed by background extraction and a targeted seal edit.

Final edit prompt:

Use case: precise-object-edit. Change ONLY the small orange pixel octopus symbol on the paper letter to a simple orange radial spark / asterisk starburst seal, with about 12 irregular straight rays, flat orange ink. No octopus or animal anywhere. Preserve exactly the adult woman's identity, face, hair, orange cardigan, charcoal turtleneck, both hands holding the letter, pose, dimensions, illustration style and all other pixels as closely as possible. Preserve genuine transparent background alpha and clean hair cutout edges. No text, no backdrop, no extra objects.

Generated with the built-in image_gen tool on 2026-10-20. Original fictional adult character for the independent OnHold community; not an official Anthropic character.

Final prompt:

Use case: illustration-story. Asset type: portrait illustration for an independent community Web3 onboarding letter modal. Primary request: an original beautiful adult female programmer, age 25+, personifying a friendly terminal coding assistant sending a personal letter after an account ban. Waist-up editorial anime illustration, expressive kind face, short dark brown hair, orange cardigan over a charcoal turtleneck, holding an open cream paper letter with a tiny simple orange pixel octopus seal. A cropped dark computer terminal frame behind her, quiet charcoal and warm orange palette, clean cream backdrop, no lettering or words anywhere, no logos, no watermark, no official brand affiliation. Character centered with generous breathing room, portrait 4:5 composition, polished restrained 2D art with delicate grain, warm and empathetic, fully clothed.

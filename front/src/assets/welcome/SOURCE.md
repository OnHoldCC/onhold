# Welcome letter portrait

## Delivery variants

The PNG is retained as the source only. The website loads `claude-code-girl-640.webp` on viewports up to 640px (84,166 bytes), or `claude-code-girl-1024.webp` on larger viewports (168,798 bytes). Both retain transparent alpha. Generated with local libwebp 1.6.0: `cwebp -q 82 -alpha_q 100 -m 6 -sharp_yuv -metadata none -resize WIDTH 0 SOURCE -o OUTPUT`.

`front/src/portrait-shape.mjs` contains an inline polygon traced from the source alpha channel. It clips the existing SingleSpark skeleton to the character silhouette without another network request. The portrait fades in only after the browser has downloaded and decoded it; a failed image leaves the silhouette visible and the onboarding remains usable.

Original production source: `claude-code-girl-spark.png` (transparent character cutout). Built-in image_gen mode; initial generation followed by background extraction and a targeted seal edit.

Final edit prompt:

Use case: precise-object-edit. Change ONLY the small orange pixel octopus symbol on the paper letter to a simple orange radial spark / asterisk starburst seal, with about 12 irregular straight rays, flat orange ink. No octopus or animal anywhere. Preserve exactly the adult woman's identity, face, hair, orange cardigan, charcoal turtleneck, both hands holding the letter, pose, dimensions, illustration style and all other pixels as closely as possible. Preserve genuine transparent background alpha and clean hair cutout edges. No text, no backdrop, no extra objects.

Generated with the built-in image_gen tool on 2026-10-20. Original fictional adult character for the independent OnHold community; not an official Anthropic character.

Final prompt:

Use case: illustration-story. Asset type: portrait illustration for an independent community Web3 onboarding letter modal. Primary request: an original beautiful adult female programmer, age 25+, personifying a friendly terminal coding assistant sending a personal letter after an account ban. Waist-up editorial anime illustration, expressive kind face, short dark brown hair, orange cardigan over a charcoal turtleneck, holding an open cream paper letter with a tiny simple orange pixel octopus seal. A cropped dark computer terminal frame behind her, quiet charcoal and warm orange palette, clean cream backdrop, no lettering or words anywhere, no logos, no watermark, no official brand affiliation. Character centered with generous breathing room, portrait 4:5 composition, polished restrained 2D art with delicate grain, warm and empathetic, fully clothed.

## Additional welcome characters — 2026-10-21

Generated with the built-in image_gen tool using `claude-code-girl-spark.png` as the style and composition reference. All characters are fictional adults; the student is a 22–24-year-old university student.

Sources: `teacher.png`, `student.png`, `sister.png`. Each has transparent 640×800 and 1024×1280 WebP delivery variants, encoded with the same cwebp settings above (explicit output width and height). Quality: teacher 82; student 68 at 640px and 62 at 1024px; sister 76. All retain full-quality alpha and stay within the existing 100KB/200KB transfer budgets. Source PNGs remain available for future edits.

`front/src/welcome-portraits.mjs` connects each source pair to its own inline alpha-traced silhouette in `front/src/portrait-shape.mjs`. One of the original portrait plus the three new portraits is selected with equal probability when the welcome component mounts, and stays fixed during that page visit. Only the selected image is requested. Existing welcome dismissal/session behavior is preserved.

### Exact generation prompts

#### teacher

Use case: illustration-story. Asset type: transparent portrait cutout for the existing OnHold welcome letter modal. The input image is a STYLE AND COMPOSITION REFERENCE, not an edit target. Generate one NEW original fictional adult woman, matching the reference's polished detailed warm editorial anime illustration, natural adult proportions, delicate textured shading, refined expressive face and fabric detail. Keep identical practical composition: portrait 4:5 canvas, preferably 1024x1280; centered waist-up seated character, entire hair and both elbows visible, shoulders around y=40%, face upper half, both hands visibly holding an open blank cream paper letter across the chest around x=28%-80%, y=49%-72%, tiny flat orange radial 12-ray spark seal on letter. Letter offered to viewer, warm welcoming gaze. Clean genuine transparent background alpha, no backdrop, no terminal, no extra objects, no text, no watermark, no logo. Modest fully clothed everyday outfit. Keep space around head and elbows. Do not crop hair or hands.
Subject: A mature confident elegant female university teacher aged 30-35, fine thin dark rectangular eyeglasses, long dark brown hair loosely tied back with soft side bangs, composed intelligent gentle smile, tailored charcoal blazer over a fully buttoned cream blouse, subtle burnt-orange scarf detail. Grown-up authoritative older-sister demeanor, restrained sophisticated styling.

#### student

Use case: illustration-story. Asset type: transparent portrait cutout for the existing OnHold welcome letter modal. The input image is a STYLE AND COMPOSITION REFERENCE, not an edit target. Generate one NEW original fictional adult woman, matching the reference's polished detailed warm editorial anime illustration, natural adult proportions, delicate textured shading, refined expressive face and fabric detail. Keep identical practical composition: portrait 4:5 canvas, preferably 1024x1280; centered waist-up seated character, entire hair and both elbows visible, shoulders around y=40%, face upper half, both hands visibly holding an open blank cream paper letter across the chest around x=28%-80%, y=49%-72%, tiny flat orange radial 12-ray spark seal on letter. Letter offered to viewer, warm welcoming gaze. Clean genuine transparent background alpha, no backdrop, no terminal, no extra objects, no text, no watermark, no logo. Modest fully clothed everyday outfit. Keep space around head and elbows. Do not crop hair or hands.
Subject: A clearly adult female university student aged 22-24, fresh innocent approachable campus aesthetic, long chestnut hair with airy bangs and a simple half-up hairstyle, soft cheerful smile, cream cable knit cardigan over a modest white shirt and small rust-orange ribbon at collar. Adult face and proportions, no childlike body or schoolchild uniform. Wholesome youthful college style.

#### sister

Use case: illustration-story. Asset type: transparent portrait cutout for the existing OnHold welcome letter modal. The input image is a STYLE AND COMPOSITION REFERENCE, not an edit target. Generate one NEW original fictional adult woman, matching the reference's polished detailed warm editorial anime illustration, natural adult proportions, delicate textured shading, refined expressive face and fabric detail. Keep identical practical composition: portrait 4:5 canvas, preferably 1024x1280; centered waist-up seated character, entire hair and both elbows visible, shoulders around y=40%, face upper half, both hands visibly holding an open blank cream paper letter across the chest around x=28%-80%, y=49%-72%, tiny flat orange radial 12-ray spark seal on letter. Letter offered to viewer, warm welcoming gaze. Clean genuine transparent background alpha, no backdrop, no terminal, no extra objects, no text, no watermark, no logo. Modest fully clothed everyday outfit. Keep space around head and elbows. Do not crop hair or hands.
Subject: A gentle intellectually elegant older-sister adult woman aged 28-32, long softly wavy warm dark brown hair resting over one shoulder, calm empathetic smile, small understated gold earrings, warm oatmeal knit cardigan over a charcoal modest round-neck blouse. Cozy refined literary atmosphere, warm grounded adult demeanor, aesthetically distinct from both teacher and student.

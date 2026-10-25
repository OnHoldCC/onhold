The existing SingleSparkIcon wrapper is reused unchanged. Its local icon registry adds one pickaxe glyph from https://github.com/lucide-icons/lucide/blob/main/icons/pickaxe.svg (ISC; original SVG and LICENSE retained here). SingleSparkIcon supplies the same size, currentColor and 1.7 stroke as the other menu icons. Upstream SingleSpark workspaces are unchanged.

The local home analytics metric accepts optional `valueTitle`, forwarded to SingleSparkMoney title and accessible label, so compact summaries retain the full amount. The active singlespark export and shared metric declaration include this small extension.

Home Graph accepts `loop` for a mirrored three-tile visual replay. Non-loop graphs keep their original geometry. Home CSS scrolls one 840-unit period continuously; reduced-motion users see the static recorded curve.

2026-10-22: Live looping Graph keeps its React identity across timeframe and path updates, so continuous movement does not restart every five seconds. Homepage missing values render a zero baseline; digit reels repeat their actual glyph via scoped CSS instead of changing the reported amount.

2026-10-22 readability correction: remove repeated digit pseudo-elements and forced reel loops. Homepage money uses consistent 1.2em rows and the existing transform-based transition only for actual value changes (320ms). Graph identities and continuous scroll are unchanged.

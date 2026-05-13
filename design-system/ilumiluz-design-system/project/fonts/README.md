# Fonts

The Ilumiluz brand uses three Google Fonts, loaded via `@import` from `colors_and_type.css`:

- **Barlow Condensed** — weights 300, 500, 600, 700 — all structural UI.
- **Barlow** — weights 300, 400, 500 — body copy.
- **Cormorant Garamond** — italic 300 + italic 400 — serif accent (italic only).

No TTF/WOFF files are shipped in this directory. If offline use is required, download from:

- https://fonts.google.com/specimen/Barlow+Condensed
- https://fonts.google.com/specimen/Barlow
- https://fonts.google.com/specimen/Cormorant+Garamond

and place the `.ttf` files here, then update `colors_and_type.css` with `@font-face` declarations pointing to them.

**Flag**: this is a documented substitution — the brand spec would prefer shipped TTFs. Ask the user for the final font files if production-grade delivery is needed.

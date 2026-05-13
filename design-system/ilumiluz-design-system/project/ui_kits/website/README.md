# Ilumiluz Website — UI Kit

Recreation of the Ilumiluz marketing site (`ilumiluz.com`), built from the project's design tokens and the reference HTML in `uploads/`.

## Files

- `index.html` — full site click-through (sticky nav → hero → collection → manifesto → process → gallery → contact → footer)
- `kit.css` — shared tokens + `.il-ghost / .il-out / .il-gold / .il-solid` buttons, chips, eyebrow, body utilities
- `Nav.jsx` — sticky top nav, underline-grows-from-left hover, fade-in blur on scroll
- `Hero.jsx` — vertical gold rule, headline with italic serif accent, dual ghost CTAs, image with label
- `Collection.jsx` + `ProductCard` — 3-up grid, hairline → gold border on hover, image scale 1.05, reveal "Ver peça" row
- `Manifesto.jsx` — split image + copy, Cormorant italic lead-in paragraph
- `Process.jsx` — 4 columns on warm gold wash, big faded numerals
- `Gallery.jsx` — 3-col editorial tile grid mixing photography with a dark ether-deep quote tile
- `ContactSection.jsx` — full-bleed ether-deep block with form; inputs bottom-border only, focus → gold
- `Footer.jsx` — deep background, gold-light text, columns + wordmark

## Interactions exercised
- Nav scroll-state (blur + border appears)
- Nav smooth-scroll to each anchor
- Card hover (border color + image zoom + reveal CTA)
- Ghost button (line expands 32 → 56px, gap grows)
- Form focus (bottom-border gold), submit → "Mensagem enviada"

## Not implemented (out of scope for kit)
- Individual product detail page
- Language toggle PT · EN
- Newsletter modal, cookie banner

All visuals sourced from `../../assets/` photography and the design system's tokens.

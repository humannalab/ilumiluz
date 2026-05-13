---
name: ilumiluz-design
description: Use this skill to generate well-branded interfaces and assets for Ilumiluz — an authorial jewelry atelier with a disciplined 90/10 off-white + gold + ether-blue aesthetic. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping or production work.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files:

- `colors_and_type.css` — canonical `--il-*` tokens for palette, type, spacing, motion.
- `assets/` — 9 real brand photos. Prefer these over any generated imagery.
- `preview/` — ~700 px spec cards you can quote in review / docs.
- `ui_kits/website/` — React (JSX) recreation of the ilumiluz.com marketing site, with modular components (Header, Hero, Sobre, Colecao, Conversa, Manifesto, Galeria, Produto, Footer).

The Ilumiluz rules are strict and **non-negotiable**:
- 90 % off-white `#F7F3EC`, 6 % gold `#C9A96E`, 4 % ether-deep `#2A4A5E`.
- Two type families: Barlow Condensed UPPERCASE (structural) + Cormorant Garamond italic 300 (accent only). Never swap roles. Never uppercase the serif.
- All borders 0.5 px. All radii 0 (chips up to 2 px). No shadows. No gradients (except warm tan in empty image placeholders). No emoji. No icons — affordance is a 0.5 px gold line.
- Motion: `cubic-bezier(0.4, 0, 0.2, 1)`, 300 ms default, 500 ms entrance fadeUp, 80 ms stagger. Nothing calls attention to itself.
- Voice: Portuguese (pt-BR) first-person plural; direct, unhurried, pause-driven; never superlative. CTAs are infinitive verbs + `→`.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets out of `assets/` and create static HTML files for the user to view. Reference `colors_and_type.css` directly. If working on production code, lift the tokens and follow the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions (audience, length, surface, language), and act as an expert designer who outputs HTML artifacts *or* production code, depending on the need.

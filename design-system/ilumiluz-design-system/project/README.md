# Ilumiluz Design System

> **Ilumiluz** — Joias para quem vive com intenção.
> An authorial jewelry atelier from São Paulo. Design autoral, memória e matéria.

This design system codifies the Ilumiluz visual and verbal language. It is derived from the live site ([ilumiluz.com](https://ilumiluz.com), repo `hugorbranco/ilumiluz`) and the brand's internal 6-section design-system documents (`uploads/01-fundacao.html` … `06-movimento.html`). The directive is crystal: **90% off-white, 10% gold + ether blue, nothing decorative**.

---

## Sources

- **Uploaded documentation** (canonical rules):
  `uploads/01-fundacao.html` · grid + spacing + principles
  `uploads/02-tipografia.html` · Barlow Condensed + Cormorant Garamond
  `uploads/03-cores.html` · palette + tokens + proportion
  `uploads/04-componentes.html` · buttons, cards, inputs, nav, chips, dividers
  `uploads/05-voz.html` · voice & tone, manifesto, vocabulary
  `uploads/06-movimento.html` · easing, durations, hover, stagger
- **Code repo**: `hugorbranco/ilumiluz` (default branch `main`) — single `index.html` + 9 brand photos in `images/`. Copied into `assets/`.
- **Live site**: https://ilumiluz.com

---

## Index

| File / Folder | What it is |
|---|---|
| `README.md` | This file — brand overview, content + visual + iconography fundamentals |
| `SKILL.md` | Agent skill manifest; use to bootstrap an Ilumiluz design chat |
| `colors_and_type.css` | CSS variables — palette, type, spacing, motion, borders |
| `fonts/` | Web-font reference (fonts loaded from Google Fonts; no local TTFs shipped) |
| `assets/` | Brand photography: 9 PNGs pulled from the live repo |
| `preview/` | ~700px-wide spec cards for the Design System review tab |
| `ui_kits/website/` | React (JSX) recreation of the ilumiluz.com marketing site |

---

## CONTENT FUNDAMENTALS — How Ilumiluz writes

**Language**: Portuguese (pt-BR). Translations to English should preserve the same restraint.

**Tone**: Direct, present, unhurried. No filler. Short sentences with intentional pauses — frequently three-beat cadence (e.g. *"O luxo, aqui, está na atenção. No tempo. No sentido."*). Sensitive, never sentimental.

**Person**:
- Brand speaks in **first-person plural** (*"Acreditamos…"*, *"Criamos…"*).
- Addresses the reader in **second-person singular** (*"você"*, *"quem você é"*). Never "cliente".
- Reader is referred to as **"pessoa"** or **"quem usa"** — never "cliente" or "usuário".

**Casing**:
- Headlines and nav links in **Barlow Condensed UPPERCASE** with `letter-spacing: -0.02em` on large, `+0.18em` on nav, `+0.3em` on labels.
- Cormorant Garamond accents always in **lowercase italic** — *never* uppercased (destroys the serif).
- Sentence case in body copy, Portuguese titlecase only for proper nouns.

**Punctuation**:
- Long em-dashes (`—`) as pause and connector.
- Arrows (`→`) replace "click here" on CTAs. Never exclamation marks. Rare question marks.
- Periods are deliberate — frequently end fragments (*"Tudo começa com uma conversa."*).

**Emoji**: **Never.** Not in UI, not in marketing. Replace with a thin gold line or arrow.

**Vibe**: atelier-contemporary · editorial · pausado · presença. The reader feels invited, never rushed.

### Brand vocabulary (use these)

| Word | Meaning in brand context |
|---|---|
| presença | Quality of being actually there — the opposite of decoration |
| intenção | The purpose behind a piece |
| transformação | Reshaping of the existing into new meaning |
| escuta | The first step of every commission — listening |
| símbolo | What a piece means beyond the material |
| memória | Affective history guiding creation |
| ateliê | Not "loja" — the making space |
| metal | Poetic material — gold, silver, bronze |
| peça / criação | Never "produto" |

### Words to avoid

"exclusivo", "única", "incrível", "lindo", "perfeito", "high-end", "premium", "não perca", "aproveite", "artigo de luxo", "produto", "cliente", "usuário".

### Copy examples (approved)

- Eyebrow: *"É a tua luz que ilumina o mundo"*
- Headline: *"Joias para quem vive com **intenção**."* (last word in italic serif)
- Body: *"Ilumiluz é um ateliê de joias contemporâneas criadas com intenção. Peças sob medida que marcam momentos, traduzem histórias e acompanham quem você é — ou está se tornando."*
- CTA: *"Criar uma joia →"* · *"Agendar conversa →"*
- Process step: *"**Escuta** — Uma conversa para entender histórias, símbolos e intenções."*
- Invitation: *"Se este é o momento de criar algo que dure — entre em contato."*

---

## VISUAL FOUNDATIONS

### Colors — 90 / 6 / 4

| Role | Token | Hex | Where |
|---|---|---|---|
| Dominant base | `--il-off` | `#F7F3EC` | 90% of every surface |
| Primary accent | `--il-gold` | `#C9A96E` | labels, 0.5 px dividers, eyebrow lines, title italic accents, CTA lines |
| Secondary accent | `--il-ether-deep` | `#2A4A5E` | the "conversa" section, footer, one gallery photo, transactional buttons |
| Body text | `--il-text` | `#3D3830` | paragraphs |
| Titles | `--il-deep` | `#1E1A14` | display + dark backgrounds |
| Muted | `--il-muted` | `#8A857E` | captions, placeholders |

Gold and ether each ship a 5-step scale (pale → deep). See `colors_and_type.css`. **Never** use color decoratively — every touch of gold or blue is purposive.

### Typography

Two families in constant tension.

- **Barlow Condensed** (300 / 500 / 600 / 700) — all structural: titles, labels, nav, numbers, CTAs. UPPERCASE by default.
  - Headline track: `-0.02em`
  - Nav track: `+0.18em`
  - Label track: `+0.3em`
- **Cormorant Garamond** — **italic 300 only**. Accents inside titles, pull quotes, manifesto. Never upright, never uppercase, never body copy.
- **Barlow** (light, non-condensed) — body copy, 14 px / 1.85 line-height.

> Font files are **not** shipped locally — loaded from Google Fonts. Both families are native Google Fonts (no substitution needed). If you need offline use, download TTFs from fonts.google.com for *Barlow Condensed*, *Barlow*, and *Cormorant Garamond* into `fonts/`.

### Spacing & Grid

8 px base. 12-col grid, 24 px gutter, 48 px outer margin. Section vertical padding 72–96 px. Mobile collapses to 4 cols / 24 px margin.

### Backgrounds

- No gradients in brand UI except subtle product-image placeholder gradients (warm tan → deeper tan).
- No repeating patterns, no noise, no grain.
- The `ether-deep` full-bleed section is the only strong colored slab — used once per page to break rhythm.
- Brand photography is full-bleed, center-weighted, warm, botanical + mineral. One gallery photo is desaturated / grayscale (`filter: grayscale(1)`) in the "conversa" section.

### Borders, dividers, radius

- Border weight is **always 0.5 px**. No exceptions. Thicker borders read as noise.
- `border-radius` is **0** everywhere except chips/tags, which are `2 px` max.
- Dividers are the brand's primary structural device — a 0.5 px gold line of 32–56 px is used as an eyebrow affordance, CTA indicator, section opener.

### Shadows

Essentially **none**. No drop shadows, no soft boxes, no glows. Depth is made with value contrast (off-white vs ether-deep) and line, not elevation.

### Hover / press states

- **Links**: gold 0.5 px underline scales `0 → 1` from the left, 350 ms standard ease.
- **Buttons (ghost)**: the preceding gold line grows `28 px → 52 px`, overall gap widens `14 → 20`, 350 ms.
- **Buttons (outline)**: inverts — border colour and bg swap, 250 ms.
- **Cards**: 0.5 px border turns gold, a `::after` gold bar scales in along the bottom, image inside `scale(1.05)` over 400 ms.
- **Inputs**: bottom border only — turns gold on `:focus`, 250 ms.
- **:active**: `scale(0.98)` for 100 ms.
- **No hover uses pure opacity dimming.** Always a colour or line change.

### Motion philosophy

Standard ease `cubic-bezier(0.4, 0, 0.2, 1)`. Entrances use `cubic-bezier(0, 0, 0.2, 1)`; exits use `cubic-bezier(0.4, 0, 1, 1)`. Durations: 100 / 200 / 300 / 400 / 500 ms; 700 ms+ reserved for page transitions. Entrance pattern is `fadeUp` = `translateY(16 → 0) + opacity 0 → 1`, 500 ms, stagger 80 ms between items. Image `scale()` caps at `1.06`. No bounces, no overshoot, no elastic. **Nothing should call attention to itself.**

### Transparency & blur

Backdrop blur 8 px only on the fixed nav when scrolled. No other translucent surfaces.

### Cards

0.5 px `rgba(201,169,110,0.2)` border, no shadow, no radius. Image area is a warm tan gradient placeholder or a real product photo. On hover: border → `var(--il-gold)`, bottom `::after` scales in, image `scale(1.05)`, CTA line fades in.

### Layout rules

- Fixed top nav 72 px tall, off-white with 8 px backdrop-blur on scroll.
- Sections are full-bleed with 48 px side padding.
- Content caps at ~1280 px, but hero + conversa + gallery are full-bleed.
- Slight asymmetry preferred over perfect balance. Imagery left, text right at 1:1 is the default editorial cadence.

---

## ICONOGRAPHY

**Short answer: Ilumiluz does not use icons.**

- No icon font, no Lucide/Heroicons/Feather, no emoji, no Unicode symbols other than `→` (arrow) and `—` (em-dash).
- Affordance is carried by **the 0.5 px gold line** — used in eyebrows, CTAs, dividers, section markers. This *is* the icon system.
- Brand photography carries all decorative weight. No illustrations, no SVG diagrams.
- When a UI demands an arrow, use `→` in Barlow Condensed at the current text colour. Diagonal external arrow is `↗`.
- Hamburger / close glyphs are built as three thin `<span>` bars and a typeset `×`.

If a future surface truly needs iconography (e.g. a settings UI), use a hairline stroke set — **Phosphor Thin (0.5 px stroke)** at 16 px — as the closest match to the 0.5 px gold-line motif. **This is a substitution; flag it if used.** No icons have been imported into `assets/`.

---

## Brand photography

The repo ships 9 master photos (all in `assets/`):

| File | Usage |
|---|---|
| `hero-anel-lirio.png` | Hero — anel with emerald, lily and stones |
| `sobre-colar-pedras.png` | About section — bead necklace on stones |
| `colecao-essencial-refeito.png` | Collection — ring on white anthurium |
| `colecao-joias-significado.png` | Collection — multicolored bead necklace on blue |
| `conversa-maos-artesao.png` | "Conversa" section — artisan's hands, grayscaled in use |
| `manifesto-colar-folhas.png` | Manifesto — necklace with dry leaves |
| `galeria-anel-botanico.png` | Gallery — gold ring among leaves |
| `galeria-brincos-triangulo.png` | Gallery — silver triangle earrings |
| `produto-colar-portal.png` | Featured product — Colar Portal, 18k gold + emerald |

All warm-toned, natural-light, botanical + mineral context. If you need more and none exist, **do not generate**; use a tan gradient placeholder with a hairline gold oval (`56 × 80 px`) as specified in the product-card component.

---

## Using this system

- For any Ilumiluz artifact, load `colors_and_type.css` and use the `--il-*` tokens.
- Import fonts from Google Fonts (link in the CSS file).
- Pull real brand photos from `assets/` before improvising placeholders.
- See `ui_kits/website/` for component recreations ready to compose from.
- Follow `CONTENT FUNDAMENTALS` strictly when writing copy — the rules are the voice.

---

## Caveats

- The spec sheets reference CSS variable names (`--line-dark`, `--ether-mid`, `--gold-pale`) that differ slightly from the ones codified here (prefixed `--il-`). The prefixed set is canonical for this skill.
- No TTF files shipped — rely on Google Fonts. Flag this if you need offline export.
- No icon set shipped. Phosphor Thin is the flagged CDN fallback when genuinely required.

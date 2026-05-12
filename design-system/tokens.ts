/**
 * Ilumiluz Design System — tokens TypeScript
 *
 * Fonte canônica dos valores do design system para uso em Tailwind, CSS-in-JS
 * e qualquer lógica que precise referenciar tokens programaticamente.
 * As variáveis CSS (--il-*) são geradas a partir deste arquivo.
 *
 * Regras absolutas:
 * - 90% off-white · 6% vinho (gold) · 4% ether-deep
 * - Bordas sempre 0.5px · radius 0 (chips: 2px máx)
 * - Sem sombras decorativas · sem gradientes · sem ícones · sem emoji
 */

export const colors = {
  // Neutros
  white:    '#FAF8F5',
  off:      '#F2F2F2',   // ★ superfície dominante (90%)
  warmMid:  '#EDE6D8',   // bg de imagem placeholder
  muted:    '#8A857E',   // texto secundário, captions
  text:     '#3D3830',   // corpo de texto
  deep:     '#1E1A14',   // títulos, alto contraste

  // Vinho — acento primário (cor do logo)
  goldWash:  '#F5ECF0',
  goldPale:  '#E8C9D4',
  goldLight: '#C9839A',
  gold:      '#561730',  // ★ labels, divisores, CTAs, accents
  goldDark:  '#2E0A18',

  // Ether Blue — acento secundário (profundidade, fechamento)
  etherPale:  '#E4EFF5',
  etherLight: '#B8CDD9',
  ether:      '#7B9FB8',
  etherMid:   '#5F8BA8',
  etherDeep:  '#2A4A5E', // ★ footer, seção conversa, botões transacionais

  // Linhas (sempre 0.5px)
  line:      'rgba(86, 23, 48, 0.18)',   // vinho-tinted
  lineBlue:  'rgba(123, 159, 184, 0.20)',
  lineDark:  'rgba(30, 26, 20, 0.08)',   // divisor neutro
} as const

export const fonts = {
  display: "'Barlow Condensed', 'Arial Narrow', sans-serif", // estrutural — UPPERCASE
  body:    "'Barlow', system-ui, sans-serif",                 // corpo — light 300
  serif:   "'Cormorant Garamond', Georgia, serif",            // acento — italic 300 only
} as const

export const fontWeights = {
  light:   300,
  regular: 400,
  medium:  500,
  semibold: 600,
  bold:    700,
} as const

export const fontSize = {
  displayXl: '88px',
  displayL:  '72px',
  h1:        '40px',
  h2:        '26px',
  serifAccent: '40px',
  bodyL:     '14px',
  bodyM:     '12.5px',
  label:     '9px',
  nav:       '10px',
  mono:      '11px',
} as const

export const lineHeight = {
  tight:   0.92,
  display: 1.05,
  heading: 1.1,
  serif:   1.2,
  body:    1.85,
  bodyM:   1.8,
  label:   1.2,
  mono:    1.5,
} as const

export const letterSpacing = {
  headline: '-0.02em',
  normal:   '0',
  nav:      '0.18em',
  label:    '0.3em',
} as const

// Escala de espaçamento — base 8px
export const spacing = {
  1:  '8px',
  2:  '16px',
  3:  '24px',   // gutter
  4:  '32px',
  6:  '48px',   // padding lateral do site + margin de seção
  9:  '72px',   // padding vertical de seção
  12: '96px',
  20: '160px',
} as const

export const radii = {
  none: '0',
  chip: '2px',  // máximo em qualquer elemento
} as const

export const borders = {
  hair:  `0.5px solid ${colors.line}`,
  dark:  `0.5px solid ${colors.lineDark}`,
  gold:  `0.5px solid ${colors.gold}`,
  blue:  `0.5px solid ${colors.lineBlue}`,
} as const

// Sombras — quase nenhuma. Apenas para modais.
export const shadows = {
  subtle: `0 1px 0 ${colors.line}`,
} as const

export const motion = {
  easeStandard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeEnter:    'cubic-bezier(0, 0, 0.2, 1)',
  easeExit:     'cubic-bezier(0.4, 0, 1, 1)',
  durInstant:   '100ms',
  durFast:      '200ms',
  durBase:      '300ms',
  durDeliberate:'400ms',
  durSlow:      '500ms',
} as const

// Variáveis CSS para injeção em :root — mantidas em sincronia com colors_and_type.css
export const cssVariables = {
  '--il-white':       colors.white,
  '--il-off':         colors.off,
  '--il-warm-mid':    colors.warmMid,
  '--il-muted':       colors.muted,
  '--il-text':        colors.text,
  '--il-deep':        colors.deep,
  '--il-gold-wash':   colors.goldWash,
  '--il-gold-pale':   colors.goldPale,
  '--il-gold-light':  colors.goldLight,
  '--il-gold':        colors.gold,
  '--il-gold-dark':   colors.goldDark,
  '--il-ether-pale':  colors.etherPale,
  '--il-ether-light': colors.etherLight,
  '--il-ether':       colors.ether,
  '--il-ether-mid':   colors.etherMid,
  '--il-ether-deep':  colors.etherDeep,
  '--il-line':        colors.line,
  '--il-line-blue':   colors.lineBlue,
  '--il-line-dark':   colors.lineDark,
  '--il-ease-standard': motion.easeStandard,
  '--il-ease-enter':    motion.easeEnter,
  '--il-ease-exit':     motion.easeExit,
  '--il-dur-instant':   motion.durInstant,
  '--il-dur-fast':      motion.durFast,
  '--il-dur-base':      motion.durBase,
  '--il-dur-deliberate':motion.durDeliberate,
  '--il-dur-slow':      motion.durSlow,
} as const

export type ColorToken    = keyof typeof colors
export type SpacingToken  = keyof typeof spacing
export type MotionToken   = keyof typeof motion

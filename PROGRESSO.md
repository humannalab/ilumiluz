# Ilumiluz Store — Progresso do Projeto

> Última atualização: 13 Mai 2026

---

## Feito

### Infraestrutura base
- Next.js 15 App Router + TypeScript strict
- Prisma 6 + PostgreSQL (Neon) — schema completo: User, Cart, Order, Address, AuditLog, RateLimit
- Sanity CMS configurado — schemas de Peça, Categoria, Imagem, Banner
- Sanity Studio embutido no Next.js em `/studio`
- CORS do Sanity liberado para `localhost:3001`
- CSP (Content Security Policy) separada: `/studio` tem política própria com `unsafe-eval`
- Middleware com proteção de rotas e CSRF (Fetch Metadata headers)

### Design System
- Tokens CSS completos em `globals.css` (`--il-*` — cores, tipografia, espaçamento, motion)
- Fontes: Barlow, Barlow Condensed, Cormorant Garamond via `next/font/google`
- Classes utilitárias: `.il-eyebrow`, `.il-h`, `.il-body`, `.il-label`, `.il-ghost`, `.il-out`, `.il-solid`, `.il-chip`, `.il-card`, `.il-navlink`, `.il-footer-link`, etc.

### Home Page (`/`)
- Nav — fixo no scroll, logo SVG, links de navegação
- Hero — grid 2 colunas, eyebrow + h1 italic, 2 CTAs ghost, imagem de fundo
- Coleção — grid 3 produtos em destaque (dados hardcoded, a ligar ao Sanity)
- Manifesto — imagem + texto editorial
- Processo — 4 passos em grid, fundo gold-wash
- Galeria — grid editorial com tile de citação
- Contacto — formulário com fundo ether-deep
- Footer — 3 colunas de links, logo branca

### Autenticação (`/login`, `/signup`)
- `lib/auth.ts` — Auth.js v5 com 3 providers: Credentials, Google OAuth, Resend magic link
- Brute-force: 5 tentativas → bloqueio 15min
- 2FA TOTP com backup codes (estrutura pronta, UI a fazer em settings)
- `lib/security-emails.ts` — emails de alerta: novo dispositivo, conta bloqueada, senha alterada, conta excluída
- `lib/audit.ts` — log de todas as ações de auth no banco
- `lib/rate-limit.ts`, `lib/csrf.ts`, `lib/password.ts`, `lib/totp.ts` — segurança completa
- Página `/login` — split-screen, suporta credentials + Google + magic link + 2FA
- Página `/signup` — split-screen, cria conta + auto-login + Google
- API `POST /api/auth/signup` — valida, hash bcrypt, cria user, loga no audit

### Catálogo
- `lib/sanity-queries.ts` — GROQ queries + tipos TypeScript: `getAllCategories`, `getProducts`, `getFeaturedProducts`, `getProductBySlug`, `getRelatedProducts`
- `/colecao` — listagem com filtro de categorias via URL (`?categoria=aneis`), grid auto-fill, preço formatado
- `/colecao/[slug]` — detalhe: breadcrumb, galeria com miniaturas, PortableText, CTA carrinho, produtos relacionados
- `product-gallery.tsx` — galeria interativa client-side com troca de imagem principal

---

## Pendências imediatas (antes de continuar)

| Item | O que fazer |
|---|---|
| Sanity Studio online | Correr `npx sanity deploy` no terminal e escrever `ilumiluz` quando pedir hostname → fica em `ilumiluz.sanity.studio` |
| Criar conteúdo no Sanity | Pelo menos 2 categorias e 3-4 peças com imagens para testar o catálogo |
| Google OAuth | Criar credenciais em console.cloud.google.com → preencher `AUTH_GOOGLE_ID` e `AUTH_GOOGLE_SECRET` no `.env.local` |
| Resend | Preencher `RESEND_API_KEY` no `.env.local` para magic link e emails de segurança funcionar |

---

## Por fazer

### Etapa 5 — Carrinho + Checkout
- [ ] Context / store do carrinho (Zustand ou React Context)
- [ ] Drawer de carrinho — slide-in com itens, quantidades, total
- [ ] Persistência do carrinho no banco (tabelas `Cart` + `CartItem` já existem no Prisma)
- [ ] Integração Stripe — `POST /api/checkout` cria Payment Intent
- [ ] Página de checkout (`/checkout`) — endereço + pagamento
- [ ] Webhook Stripe `POST /api/stripe/webhook` → cria `Order` no banco
- [ ] Página de confirmação `/pedido/[id]`
- [ ] Email de confirmação de pedido (Resend)

### Etapa 6 — Painel do utilizador
- [ ] `/conta` — perfil (nome, email), foto
- [ ] `/conta/pedidos` — histórico de pedidos, status
- [ ] `/conta/enderecos` — gerir endereços de entrega/faturação
- [ ] `/conta/seguranca` — trocar senha, ativar/desativar 2FA TOTP (base do Bartho Finance existe mas precisa adaptar ao design Ilumiluz)
- [ ] Limpar páginas `(auth)/` herdadas do Bartho Finance que não se aplicam à Ilumiluz

### Etapa 7 — Admin
- [ ] `/admin` — protegido por role de admin
- [ ] Listagem de pedidos com filtros de status
- [ ] Atualizar status de pedido (pendente → enviado → entregue)
- [ ] Audit log — ver atividade de segurança

### Etapa 8 — Deploy
- [ ] Vercel: ligar repo GitHub `humannalab/ilumiluz-store`, configurar env vars
- [ ] Domínio `ilumiluz.com` apontar para Vercel
- [ ] Stripe webhook URL em produção
- [ ] Sentry configurado para prod
- [ ] Sanity CORS liberado para `ilumiluz.com`

### Melhorias de layout (pendentes desde Etapa 2)
- [ ] Home: secção Coleção com dados reais do Sanity (em vez de hardcoded)
- [ ] Nav responsivo / mobile
- [ ] Página `/sobre`, `/processo`, `/sob-medida` (páginas de conteúdo)

---

## Stack resumida

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 App Router |
| Linguagem | TypeScript strict |
| Base de dados | PostgreSQL (Neon) via Prisma 6 |
| CMS | Sanity v3 (project `l6fzz7b6`) |
| Auth | Auth.js v5 — Credentials + Google + Resend |
| Pagamentos | Stripe one-time payment |
| Emails | Resend |
| Erros | Sentry |
| Deploy | Vercel (org `humannalabs-projects`) |
| Design | Sistema próprio Ilumiluz — `--il-*` CSS vars |

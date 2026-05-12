# ilumiluz-store

> Loja online da Ilumiluz — ateliê de joias contemporâneas de São Paulo.
> Projeto sob a org Humanna Lab (github.com/humannalab).

## Contexto

A Ilumiluz vende dois tipos de produto:
- **Peças de coleção** — compra direta com carrinho + checkout Stripe (payment one-time)
- **Joias sob medida / projetos** — solicitação via formulário, sem compra imediata

O site substitui o anterior (`hugorbranco/ilumiluz`) na raiz de `ilumiluz.com`.

## Stack

- **Next.js 15** App Router + TypeScript strict
- **PostgreSQL** via Neon + **Prisma 6** (dados operacionais: User, Order, Cart, Address, etc.)
- **Sanity** (hosted, novo project) — CMS para Produtos, Categorias, Banners
- **Auth.js v5** — Google + Magic Link + Credentials + 2FA TOTP
- **Stripe** — mode Payment one-time (NÃO subscription)
- **Resend** — e-mails transacionais
- **Sentry** — monitoramento de erros
- **Tailwind 4** + shadcn/ui
- **TanStack Query** + **Zod**

## Design System

Ilumiluz tem design system próprio. Regras absolutas:

- **Cor dominante**: `--il-off: #F2F2F2` (90% de toda superfície)
- **Acento primário**: `--il-gold: #561730` (vinho do logo — labels, divisores, CTAs)
- **Acento secundário**: `--il-ether-deep: #2A4A5E` (footer, seções escuras, botões transacionais)
- **Tipografia estrutural**: Barlow Condensed — sempre UPPERCASE
- **Tipografia acento**: Cormorant Garamond italic 300 — nunca maiúsculo, nunca upright
- **Corpo**: Barlow light 300
- Bordas sempre **0.5px**, radius **0** (chips: max 2px)
- Sem sombras, sem gradientes decorativos, sem ícones, sem emoji
- Tokens em `design-system/tokens.ts`

## Reuso do Bartho Finance

Este projeto **não compartilha runtime nem banco** com o Bartho Finance.
O reuso é apenas de código (cópia). Arquivos copiados e adaptados:

- `lib/rate-limit.ts`, `lib/csrf.ts`, `lib/audit.ts`, `lib/crypto.ts`
- `lib/totp.ts`, `lib/admin.ts`, `lib/security-emails.ts`, `lib/password.ts`
- `lib/db.ts`, `lib/auth.ts`
- `middleware.ts`, `next.config.ts`, `sentry.*.config.ts`, `instrumentation.ts`
- `app/(auth)/settings/*`, `components/layout/*`, `components/auth/*`

## Modelo de dados

**Sanity (CMS):**
- `product`: title, slug, description (portable text), price, images[5], category, sku, inStock, featured
- `productImage`: asset reference + alt + ordem
- `category`: title, slug, parent?
- `banner`: title, image, ctaText, ctaUrl, active, position

**Prisma (banco operacional):**
- `User` — campos completos de segurança (passwordHash, TOTP, lockout, etc.)
- `Address` — faturamento + entrega
- `Cart` + `CartItem` — referencia `sanityProductId` como string
- `Order` + `OrderItem` — snapshot do produto em `productSnapshot Json`
- `AuditLog`, `RateLimit`

## Convenções

- TS strict, sem `any`
- Comentários só quando o "porquê" é não-óbvio
- Sem features defensivas ou abstrações prematuras
- Commits semânticos com `Co-Authored-By: Claude <noreply@anthropic.com>`

## Infra

| Serviço  | Detalhe                                              |
|----------|------------------------------------------------------|
| Vercel   | org `humannalabs-projects`, project `ilumiluz-store` |
| Neon     | novo project (isolado do Bartho)                     |
| GitHub   | `humannalab/ilumiluz-store`                          |
| Resend   | mesma conta, domínio `ilumiluz.com`                  |
| Sentry   | org `humanna-lab`, novo project                      |
| Stripe   | mesma conta, payments one-time                       |
| Google   | novo Cloud Project + credenciais OAuth               |
| Sanity   | novo project na org `humannalab`                     |

# LLM guide — SvelteKit Template

This document orients an AI agent working in this repository. Read it before
making changes. It describes the architecture, conventions, and the right way to
extend each subsystem.

## TL;DR rules

1. **Svelte 5 runes only** — `$state`, `$derived`, `$props`, `$effect`, snippets,
   `{@render}`, `{@attach}`. Never legacy syntax (`export let`, `$:`, `on:click`,
   `<slot>`, stores for shared state).
2. **Validate every Svelte file** with the `svelte-autofixer` MCP tool before
   finishing. Re-run until clean. Expected non-blocking warnings: `{@html}` on
   sanitized content, functions-in-`$effect` doing DOM post-processing.
3. **Never duplicate code** — extract a reusable component or helper. UI lives in
   `src/lib/components/ui`; feature components alongside their domain.
4. **Icons**: `@lucide/svelte` (NOT the deprecated `lucide-svelte`).
5. **i18n**: every user-facing string goes through Paraglide messages
   (`src/lib/paraglide/messages`), with `en` + `cs`. Czech uses full diacritics.
6. **Security is non-negotiable** — see the Security section. Server endpoints
   validate input (Zod), check auth, and rate-limit.
7. After changing `src/lib/server/auth.ts`: run `npm run auth:schema` then
   `npm run db:push`.

## Stack

| Area       | Choice                                                       |
| ---------- | ------------------------------------------------------------ |
| Framework  | SvelteKit 2, Svelte 5 (runes), `adapter-node`                |
| Styling    | Tailwind v4 (`@tailwindcss/forms`, `typography`), dark mode  |
| Auth       | Better Auth (email+password, magic link, Google, Microsoft, admin/roles, email verify, password reset) |
| Email      | Pluggable: Resend / SMTP / console (EMAIL_PROVIDER)          |
| Database   | Drizzle ORM on MariaDB/MySQL (`mysql2`)                       |
| AI         | OpenAI, Gemini, DeepSeek behind one `AiProvider` interface    |
| i18n       | Paraglide (`en`, `cs`)                                       |
| Captcha    | Cloudflare Turnstile                                         |
| Markdown   | `marked` + `isomorphic-dompurify`, Shiki, Mermaid            |

## Directory map

```
src/
├─ hooks.server.ts          # handle sequence: securityHeaders → paraglide → rateLimit → betterAuth
├─ app.d.ts                 # App.Locals: { user?, session? }
├─ lib/
│  ├─ auth-client.ts        # browser Better Auth client (social, magic link)
│  ├─ theme.svelte.ts       # theme store (light/dark/system), runes class
│  ├─ markdown.ts           # render Markdown → sanitized HTML (GFM)
│  ├─ highlighter.ts        # Shiki singleton (code highlighting)
│  ├─ mermaid.ts            # client-only Mermaid loader
│  ├─ upload.ts             # client image-upload helper (friendly errors)
│  ├─ components/
│  │  ├─ ui/                # Button, Input, Card, Alert, Dropdown(+Item) + index.ts barrel
│  │  ├─ markdown/          # MarkdownEditor, MarkdownRenderer, MarkdownToolbar + barrel
│  │  ├─ auth/SocialButtons.svelte
│  │  ├─ Header / LangSwitch / ThemeToggle / Turnstile .svelte
│  └─ server/
│     ├─ env.ts             # startup env validation (fail-fast in prod)
│     ├─ auth.ts            # Better Auth instance (providers, cookies, rate limit)
│     ├─ email.ts           # pluggable email transport (console in dev)
│     ├─ turnstile.ts       # captcha verify (fails closed in prod)
│     ├─ rate-limit.ts      # in-memory fixed-window limiter (Redis-ready)
│     ├─ security-headers.ts# CSP + security headers handle
│     ├─ ai/                # types, openai-compatible, gemini, index (registry)
│     └─ db/                # index (drizzle client), schema, auth.schema (generated)
└─ routes/
   ├─ +layout.server.ts     # exposes `user` to every page
   ├─ (auth)/login,signup   # public, centered card layout
   ├─ (app)/dashboard       # protected; (app)/+layout.server.ts guards → /login
   ├─ setup/                # prerendered getting-started page
   └─ api/ai/chat, api/upload  # JSON endpoints (auth-protected)
```

## Conventions

### Components
- Props via `let { ... }: Props = $props()` with a local `interface Props`.
- Reactive derived values: `$derived(...)`. Side effects only when unavoidable.
- Pass children/markup as snippets: `children: Snippet`, render with `{@render}`.
- `class` prop merged with clsx-style arrays: `class={['base', cond && 'x', className]}`.
- Reuse `ui/` primitives. Add new shared primitives there and export from `index.ts`.

### Server endpoints (`+server.ts`, actions)
- Parse/validate input with **Zod**; reject invalid early with `error(400, …)`.
- Check `locals.user` for protected actions (`error(401)`).
- Rate-limit sensitive routes via `rateLimit({ key, limit, windowMs })`.
- Better Auth server calls pass `headers: event.request.headers`.

### i18n
- Add keys to BOTH `messages/en.json` and `messages/cs.json`.
- Import as `import * as m from '$lib/paraglide/messages'`, use `m.key()`.
- After adding messages, the Vite plugin regenerates `src/lib/paraglide/*`
  (do not edit generated files).

## How to extend common things

- **New AI provider**: write a factory in `src/lib/server/ai/` returning an
  `AiProvider`; register it in `ai/index.ts` keyed by its env API key. OpenAI-
  compatible APIs reuse `openai-compatible.ts`.
- **New OAuth provider**: add it in `socialProviders()` in `auth.ts` (only when
  its env vars exist), then `auth:schema` + `db:push`.
- **New DB table**: add to `src/lib/server/db/schema.ts`, then `db:push`
  (or `db:generate` + `db:migrate`). Auth tables live in the generated
  `auth.schema.ts` — don't hand-edit; regenerate with `auth:schema`.
- **New protected page**: place it under `(app)/`; the layout guard handles auth.
- **Admin-only page/action**: place under `(app)/admin/` (layout guard requires
  admin) AND call `requireAdmin(event)` inside every action — never rely on the
  load guard alone. Use `requireUser`/`requireAdmin`/`isAdmin` from
  `$lib/server/authorize` (they also reject banned users). Protect the last-admin
  invariant when changing roles/bans.
- **Roles**: Better Auth `admin` plugin. Seed admins via `ADMIN_USER_IDS` env, or
  promote via the `/admin/users` page. After plugin changes: `auth:schema` +
  `db:push`.
- **Email**: use the templated helpers in `$lib/server/email`
  (`sendVerificationEmail`, `sendPasswordResetEmail`, `sendMagicLinkEmail`).
  Transport is chosen by `EMAIL_PROVIDER` (resend/smtp/console).
- **Markdown**: use `<MarkdownEditor bind:value>` for editing and
  `<MarkdownRenderer source={...}>` for display. Both sanitize output. Code
  blocks get Shiki highlighting; ```mermaid fences render as diagrams.

## Security (must preserve)

- `hooks.server.ts` applies CSP + security headers and rate-limits auth routes.
- CSP allows `challenges.cloudflare.com` (Turnstile). If you add external
  scripts/styles/fonts, update `security-headers.ts` accordingly.
- Turnstile **fails closed in production** when its secret is missing.
- Uploads (`/api/upload`): auth-only, type + size validated, rate-limited,
  stored in `static/uploads` (gitignored). For prod, swap to S3/R2 — keep
  validation.
- All `{@html}` must render only DOMPurify-sanitized HTML (`renderMarkdown`).
- `env.ts` refuses to boot in production with a weak secret or non-https ORIGIN.

## Commands

| Command              | Purpose                              |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Dev server                           |
| `npm run build`      | Production build (`adapter-node`)    |
| `npm start`          | Run the built server (`node build`)  |
| `npm run check`      | Type-check (run before committing)   |
| `npm run db:push`    | Apply schema to the database         |
| `npm run db:studio`  | Drizzle Studio                       |
| `npm run auth:schema`| Regenerate the Better Auth schema    |

## Definition of done

- `npm run check` → 0 errors, 0 warnings.
- `npm run build` succeeds.
- New/changed Svelte files validated with `svelte-autofixer`.
- New user-facing strings exist in `en` + `cs`.
- Server input validated, auth checked, rate-limited where appropriate.
- On Windows commit with `git -c core.autocrlf=false` (`.gitattributes` forces LF).

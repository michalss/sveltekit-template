# SvelteKit Template

A batteries-included SvelteKit starter — preconfigured and ready to ship.

## What's inside

| Area      | Stack                                                                  |
| --------- | ---------------------------------------------------------------------- |
| Framework | SvelteKit 2 + **Svelte 5 (runes)**, `adapter-node`                     |
| Styling   | Tailwind CSS v4 (`@tailwindcss/forms`, `@tailwindcss/typography`)      |
| Auth      | **Better Auth** — email+password, magic link, Google & Microsoft OAuth |
| Database  | **Drizzle ORM** on MariaDB/MySQL (`mysql2`)                            |
| AI        | **OpenAI, Gemini, DeepSeek** behind one provider interface (streaming) |
| i18n      | **Paraglide** with `en` + `cs` (Czech)                                 |
| Captcha   | **Cloudflare Turnstile** (server verification + Svelte widget)         |
| Icons     | `@lucide/svelte`                                                       |
| Tooling   | MCP server configured for Claude Code                                  |

## Quick start

```bash
npm install
cp .env.example .env        # fill in your values
npm run db:push             # create tables in your database
npm run dev
```

Open http://localhost:5173.

> The template runs out of the box even with empty optional keys: OAuth providers
> are only registered when their secrets are present, magic-link emails print to
> the console, and Turnstile verification is skipped until you set its keys.

## Configuration

All configuration lives in `.env` (see `.env.example` for the full list):

- **Database** — `DATABASE_URL` (MariaDB/MySQL connection string)
- **Better Auth** — `BETTER_AUTH_SECRET` (`npx @better-auth/cli secret`), `ORIGIN`
- **OAuth** — `GOOGLE_CLIENT_ID/SECRET`, `MICROSOFT_CLIENT_ID/SECRET/TENANT_ID`
  - Redirect URIs: `{ORIGIN}/api/auth/callback/google` and `.../microsoft`
- **AI** — `OPENAI_API_KEY`, `GEMINI_API_KEY`, `DEEPSEEK_API_KEY`, `AI_DEFAULT_PROVIDER`
- **Turnstile** — `PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`

## Project layout

```
src/
├─ hooks.server.ts            # Paraglide + Better Auth session handling
├─ lib/
│  ├─ auth-client.ts          # Browser auth client (social, magic link)
│  ├─ components/
│  │  ├─ ui/                  # Reusable Button, Input, Card, Alert
│  │  ├─ auth/SocialButtons.svelte
│  │  ├─ Header.svelte, LangSwitch.svelte, Turnstile.svelte
│  ├─ paraglide/              # Generated i18n runtime (do not edit)
│  └─ server/
│     ├─ auth.ts              # Better Auth instance (providers, plugins)
│     ├─ email.ts             # Pluggable email transport (magic links)
│     ├─ turnstile.ts         # Server-side captcha verification
│     ├─ ai/                  # Provider abstraction + OpenAI/Gemini/DeepSeek
│     └─ db/                  # Drizzle client + schema (+ generated auth schema)
└─ routes/
   ├─ (auth)/login, signup    # Public auth pages (centered card layout)
   ├─ (app)/dashboard         # Protected area (layout guard redirects to /login)
   └─ api/ai/chat             # Streaming AI endpoint (auth-protected)
messages/                     # Paraglide messages: en.json, cs.json
```

## Adding an AI provider

Write one factory in `src/lib/server/ai/` and register it in `ai/index.ts`.
DeepSeek and OpenAI share `openai-compatible.ts`. Call it from anywhere:

```ts
import { getAiProvider } from '$lib/server/ai';
const text = await getAiProvider('gemini').complete([{ role: 'user', content: 'Hi' }]);
```

The `POST /api/ai/chat` route streams responses for signed-in users.

## Scripts

| Script                | Purpose                                   |
| --------------------- | ----------------------------------------- |
| `npm run dev`         | Dev server                                |
| `npm run build`       | Production build (`adapter-node`)         |
| `npm start`           | Run the production build (`node build`)   |
| `npm run check`       | Type-check with `svelte-check`            |
| `npm run db:push`     | Push schema to the database               |
| `npm run db:generate` | Generate SQL migrations                   |
| `npm run db:studio`   | Drizzle Studio                            |
| `npm run auth:schema` | Regenerate the Better Auth Drizzle schema |

## Notes

- After changing the Better Auth config (`src/lib/server/auth.ts`), run
  `npm run auth:schema` then `npm run db:push`.
- Czech translations use full diacritics. Edit `messages/en.json` / `messages/cs.json`.

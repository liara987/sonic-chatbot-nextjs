# Sonic ChatBot — Next.js (App Router)

A secure, production-ready migration of the original Vite + React Sonic ChatBot to **Next.js 16 (App Router)** with enterprise-grade security.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Add your OpenAI API key
cp .env.example .env.local
# Edit .env.local → set OPENAI_API_KEY=sk-...

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | ✅ | Your OpenAI secret key — **server-side only** |

> Never use `NEXT_PUBLIC_OPENAI_API_KEY`. The key must only be in `.env.local`.

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── chat/route.ts     ← Secure server-side OpenAI proxy
│   ├── layout.tsx             ← Root layout (Server Component)
│   ├── page.tsx               ← Home page (Server Component)
│   └── globals.css
├── components/
│   └── ChatInterface.tsx      ← Chat UI (Client Component)
├── hooks/
│   └── useChat.ts             ← State + API communication hook
├── lib/
│   ├── openai.ts              ← Server-only OpenAI client (lazy)
│   ├── rateLimiter.ts         ← In-memory rate limiter
│   └── validation.ts          ← Zod schemas
└── types/
    └── chat.ts                ← Shared TypeScript types

middleware.ts                  ← IP forwarding for rate limiting
next.config.ts                 ← Security headers
```

---

## Security Architecture

### Critical Fixes from Original App

| Vulnerability | Original | Fixed |
|---|---|---|
| API key exposure | `VITE_OPENAI_API_KEY` in browser bundle | Server-only env var |
| Direct OpenAI calls | `axios` → `api.openai.com` from browser | Proxied via `/api/chat` |
| No input validation | Raw user input sent directly | Zod schema validation |
| No rate limiting | Unlimited requests | 20 req/min per IP |
| No security headers | None | CSP, HSTS, X-Frame-Options, etc. |
| Error leakage | Raw errors logged/shown | Generic messages to client |

### Security Headers (next.config.ts)

- `Content-Security-Policy` — restricts resource origins
- `X-Frame-Options: DENY` — prevents clickjacking
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- `Referrer-Policy` — controls referrer leakage
- `Permissions-Policy` — disables camera/mic/geolocation
- `Strict-Transport-Security` — enforces HTTPS

### Rate Limiting

20 requests per IP per 60-second window. Returns HTTP `429` with `Retry-After: 60`.

For multi-instance production: replace `src/lib/rateLimiter.ts` with Upstash or Redis.

### Input Validation (Zod)

```ts
message: z.string().min(1).max(2000)
history: z.array(conversationEntrySchema).max(50)
```

### CSRF Considerations

The `/api/chat` endpoint accepts JSON only (not form data), which mitigates most CSRF vectors. For future authenticated endpoints, implement `next-csrf` or use SameSite cookies + origin checks.

---

## Deployment

### Vercel (recommended)

```bash
npx vercel --prod
```

Set `OPENAI_API_KEY` in the Vercel dashboard under **Settings → Environment Variables**.

### Self-hosted / Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
ENV NODE_ENV=production
CMD ["npm", "start"]
```

Pass `OPENAI_API_KEY` as a Docker secret or environment variable — never bake it into the image.

---

## Production Security Checklist

- [ ] `OPENAI_API_KEY` is set only in the server environment (not `NEXT_PUBLIC_`)
- [ ] `.env.local` is in `.gitignore` and never committed
- [ ] `npm audit` shows no critical vulnerabilities
- [ ] Rate limiting is upgraded to Redis/Upstash for multi-instance deployments
- [ ] HTTPS is enforced (HSTS header is configured)
- [ ] CSP is tightened for your production domain (remove `unsafe-inline`/`unsafe-eval` when possible)
- [ ] `poweredByHeader: false` removes the `X-Powered-By: Next.js` fingerprint

---

## Architectural Decisions

**Server Components by default** — `layout.tsx` and `page.tsx` are Server Components. `ChatInterface.tsx` is the only Client Component because it needs `useState` and event handlers.

**Lazy OpenAI client** — `getOpenAIClient()` throws at call-time, not import-time, so the build succeeds without a key in CI.

**Dynamic imports** — The heavy `@chatscope/chat-ui-kit-react` is loaded client-side only via `next/dynamic`, keeping the initial HTML small.

**Centralized error handling** — All OpenAI errors are caught in the route handler. The client always receives a safe, generic message. Full errors only go to server logs.

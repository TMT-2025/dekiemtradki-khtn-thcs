# ENVIRONMENT DEPENDENCY MAP & SECRET AUDIT
**KHTN Assessment Studio — Production Deployment Audit**  
*Generated from static AST and full-codebase scan: 2026-10-02*

---

## 1. Executive Summary & Verification Methodology

A full static and symbolic scan of the entire codebase was conducted across all TypeScript, JavaScript, JSON, and Markdown files (`.ts`, `.tsx`, `.js`, `.mjs`, `.json`, `.md`), excluding build caches (`node_modules`, `.next`, `.git`).

Every occurrence of `process.env.*`, `NEXT_PUBLIC_*`, credentials, and authentication routines was cross-referenced with runtime initialization pipelines.

### Key Conclusions:
1. **Basic App Runs Without Secrets**: The core application contains embedded curriculum data (`database/curriculum-data.json`, `database/phenomenon-library.json`, `database/local_store.json`), allowing full test generation, matrix creation, and DOCX export even with zero environment variables set.
2. **AI Provider Fallback**: If `GEMINI_API_KEY` is omitted, the app does **not** crash; it falls back to high-quality deterministic pedagogical mock responses.
3. **Database Architecture**: The app supports both local JSON file persistence and Supabase Cloud. `SUPABASE_REQUIRED=false` allows running locally or in demo cloud deployments without failing build or runtime gates.
4. **Secret Key Naming**: The server-side Supabase secret key expected by code is `SUPABASE_SERVICE_ROLE_KEY`. The variable name `SUPABASE_SECRET_KEY` is **unused** in the codebase.
5. **No Custom JWT Signing**: There is **no** `jsonwebtoken`, `jwt.sign`, or `jwt.verify` in runtime code. `JWT_SECRET` is **not required**.

---

## 2. Environment Dependency Map

| Variable | File | Function/Module | Purpose | Required in Production | Client/Server | Current/Legacy/Unused |
|---|---|---|---|---|---|---|
| `GEMINI_API_KEY` | `lib/ai-providers/gemini-provider.ts:9` | `GeminiProvider.constructor` | API key to call Google Gemini Generative Language API | **YES** (for live AI generation; fallback available) | Server-only | Current |
| `AI_PROVIDER` | `lib/ai-providers/index.ts:107` | `AIProviderFactory.getProvider` | Selects active AI engine (`GEMINI`, `OPENAI`, `ANTHROPIC`, `MOCK`) | **NO** (Defaults to `'GEMINI'`) | Server-only | Current |
| `GEMINI_MODEL` | `lib/ai-providers/gemini-provider.ts:10` | `GeminiProvider.constructor` | Specifies Gemini model version | **NO** (Defaults to `'gemini-1.5-pro'`) | Server-only | Current |
| `OPENAI_API_KEY` | `lib/ai-providers/index.ts:12` | `OpenAIProvider.constructor` | OpenAI API key (if `AI_PROVIDER=OPENAI`) | **NO** | Server-only | Optional |
| `OPENAI_MODEL` | `lib/ai-providers/index.ts:13` | `OpenAIProvider.constructor` | OpenAI model identifier | **NO** (Defaults to `'gpt-4o'`) | Server-only | Optional |
| `ANTHROPIC_API_KEY` | `lib/ai-providers/index.ts:62` | `AnthropicProvider.constructor` | Anthropic Claude API key (if `AI_PROVIDER=ANTHROPIC`) | **NO** | Server-only | Optional |
| `ANTHROPIC_MODEL` | `lib/ai-providers/index.ts:63` | `AnthropicProvider.constructor` | Anthropic model identifier | **NO** (Defaults to `'claude-3-5-sonnet-20241022'`) | Server-only | Optional |
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase/client.ts:7`, `lib/supabase/database-safety.ts:32` | `createClient`, `verifyDatabaseSafety` | Supabase Cloud Project URL | **YES** (if using Supabase Cloud) | Client & Server | Current |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase/client.ts:8`, `lib/supabase/database-safety.ts:33` | `createClient`, `verifyDatabaseSafety` | Supabase anonymous public client key | **YES** (if using Supabase Cloud) | Client & Server | Current |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/supabase/database-safety.ts:34` | `verifyDatabaseSafety` | Server-side privileged database admin key | **YES** (if privileged DB ops / RLS bypass needed in Cloud) | Server-only | Current |
| `SUPABASE_REQUIRED` | `lib/supabase/database-safety.ts:31` | `verifyDatabaseSafety` | Fail-fast switch enforcing production database checks | **NO** (Set `false` for offline fallback; `true` for strict DB enforcement) | Server-only | Current |
| `GOOGLE_API_KEY` | None (0 occurrences in code) | N/A | Alias sometimes used for Gemini | **NO** | N/A | **UNUSED** |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | None (0 occurrences in code) | N/A | Alternative naming for Supabase anon key | **NO** | N/A | **UNUSED** |
| `SUPABASE_SECRET_KEY` | None in runtime code | N/A | Non-standard name for Service Role key | **NO** | N/A | **UNUSED** |
| `JWT_SECRET` | Only in `.env.example` / tests | N/A | Legacy custom JWT secret token | **NO** | N/A | **UNUSED / NOT REQUIRED** |

---

## 3. Gemini Engine Audit

### 1. Does the app actually call Gemini API?
**YES.** In `lib/ai-providers/gemini-provider.ts` (lines 19–47), the `generateText(request)` method makes an HTTP POST request to:
```
https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}
```
Payload format conforms to Google Gemini REST specification:
`{ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature, maxOutputTokens } }`.

### 2. File and Variable Details
- Called in: `lib/ai-providers/gemini-provider.ts`
- Uses `process.env.GEMINI_API_KEY` (defaults to empty string `''`).
- Uses `process.env.GEMINI_MODEL` (defaults to `'gemini-1.5-pro'`).
- Selected by `AIProviderFactory` in `lib/ai-providers/index.ts:107` via `process.env.AI_PROVIDER || 'GEMINI'`.

### 3. Fallback Behavior when `GEMINI_API_KEY` is missing
If `GEMINI_API_KEY` is empty, unset, or set to `'mock-or-gemini-key'`:
- The provider does **NOT** throw an unhandled error or crash the application.
- Line 20 of `lib/ai-providers/gemini-provider.ts` triggers:
  ```typescript
  if (!this.apiKey || this.apiKey === 'mock-or-gemini-key') {
    return this.mockResponse(request);
  }
  ```
- It gracefully falls back to `mockResponse(request)`, returning standard Vietnamese KHTN assessment matrixes, specifications, and multiple-choice questions aligned with circular 22/2021/TT-BGDĐT.

---

## 4. Supabase Cloud Audit

### 1. Client vs Server Usage
- **Client**: `lib/supabase/client.ts` uses:
  - `process.env.NEXT_PUBLIC_SUPABASE_URL`
  - `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`
  If undefined, it falls back to safe mock URL/key for build safety (`https://mock.supabase.co`, `mock-anon-key`).
- **Server**: `lib/supabase/database-safety.ts` checks:
  - `process.env.SUPABASE_SERVICE_ROLE_KEY`
  - `process.env.NEXT_PUBLIC_SUPABASE_URL`
  - `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Service Role & Key Naming
- The codebase strictly uses `SUPABASE_SERVICE_ROLE_KEY`.
- `SUPABASE_SECRET_KEY` does **not** exist anywhere in the application code.
- **Rule**: Keep the variable name as `SUPABASE_SERVICE_ROLE_KEY`. Do not rename it.

### 3. Authentication & RLS
- Client operations authenticate directly against Supabase Auth using `supabase.auth.*`.
- Privileged operations and data migrations use `SUPABASE_SERVICE_ROLE_KEY` to bypass Row Level Security (RLS) safely on server-side endpoints.

---

## 5. JWT_SECRET Audit

A deep search for JWT packages and verification routines across the codebase yielded:
- `jsonwebtoken`: **NOT FOUND** in `package.json` dependencies or source code.
- `jwt.sign`: **0 occurrences**.
- `jwt.verify`: **0 occurrences**.

### Conclusion:
**`JWT_SECRET = NOT REQUIRED`**  
Authentication sessions are handled client-to-cloud by `@supabase/supabase-js`. The application does not issue, sign, or verify custom JWTs. Any `JWT_SECRET` in `.env.example` or legacy documentation is unused and safe to omit.

---

## 6. SUPABASE_REQUIRED Audit

### 1. Implementation
Defined and checked in `lib/supabase/database-safety.ts:31`:
```typescript
const isRequired = process.env.SUPABASE_REQUIRED === 'true';
```

### 2. Runtime Behavior
- **When `SUPABASE_REQUIRED=false` (Current Production Setting)**:
  - The app runs in resilient mode.
  - If Supabase Cloud credentials are missing, placeholder, or offline, the app transparently operates using local embedded curriculum libraries and local JSON storage (`database/local_store.json`).
  - Next.js builds, API routes, and page renders complete cleanly.
- **When `SUPABASE_REQUIRED=true` (Fail-Fast Production Strict Mode)**:
  - `verifyDatabaseSafety()` executes strict validation on startup.
  - If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing or contains `'mock'`, it immediately throws `ProductionDatabaseConfigurationError` to prevent any unintended fallback to local files in a live enterprise deployment.

### 3. Conditions Required Before Setting `SUPABASE_REQUIRED=true`:
1. A live Supabase Cloud project is provisioned.
2. Migrations `001_initial_schema.sql`, `002_fix_rls_and_relations.sql`, and `003_context_engine.sql` have been executed on the production Supabase database.
3. Real `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured in Vercel project environment variables.
4. Database connectivity smoke test passes.

---

## 7. Secret Security Audit

1. **No Hardcoded Secrets**: All tracked source files (`lib/`, `app/`, `tests/`, `database/`) were verified to contain no production API keys, service role keys, or database passwords.
2. **Git Protection**: `.env`, `.env.local`, `.env.production` are included in `.gitignore` and `.vercelignore`.
3. **Client Leakage Prevention**: Server secrets (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`) do **not** use the `NEXT_PUBLIC_` prefix and are never exported to browser bundles or client-rendered components.

---

## 8. Variable Categorization

### A. REQUIRED FOR BASIC APP
*(None — The app can build and run offline with built-in curriculum data and local JSON storage).*

### B. REQUIRED FOR LIVE AI GENERATION
- `GEMINI_API_KEY` (Required for live Gemini API calls; defaults to mock response if missing)

### C. REQUIRED FOR SUPABASE CLOUD (If connecting to Supabase Cloud)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for administrative server-side operations)

### D. OPTIONAL / CONFIGURATION
- `AI_PROVIDER` (Defaults to `'GEMINI'`)
- `GEMINI_MODEL` (Defaults to `'gemini-1.5-pro'`)
- `SUPABASE_REQUIRED` (Default `'false'`, set `'true'` only after cloud DB verification)
- `OPENAI_API_KEY` (Only if `AI_PROVIDER=OPENAI`)
- `OPENAI_MODEL` (Only if `AI_PROVIDER=OPENAI`)
- `ANTHROPIC_API_KEY` (Only if `AI_PROVIDER=ANTHROPIC`)
- `ANTHROPIC_MODEL` (Only if `AI_PROVIDER=ANTHROPIC`)

### E. UNUSED / SAFE TO REMOVE
- `JWT_SECRET` (No custom JWT generation in code; auth handled by Supabase)
- `SUPABASE_SECRET_KEY` (Code uses `SUPABASE_SERVICE_ROLE_KEY`)
- `GOOGLE_API_KEY` (Code uses `GEMINI_API_KEY`)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Code uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### F. LEGACY / NEEDS MIGRATION
- None.

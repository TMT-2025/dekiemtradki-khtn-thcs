# SUPABASE PRODUCTION DEPENDENCY MAP
**Project:** KHTN Assessment Studio  
**Target:** Supabase Cloud Multi-Tenant Production  
**Status:** Audit & Migration Blueprint  
**Date:** 2026-10-02  

---

## 1. ENVIRONMENT DEPENDENCY AUDIT TABLE

| Variable | File | Function / Module | Purpose | Required in Production | Client / Server | Current / Legacy / Unused |
|---|---|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase/client.ts`<br>`lib/supabase/database-safety.ts` | `supabase` client initialization, `evaluateDatabaseSafety` | REST & Auth API endpoint of the Supabase PostgreSQL database | **YES** (when Cloud DB active) | Client & Server | **Current** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase/client.ts`<br>`lib/supabase/database-safety.ts` | `supabase` client initialization, `evaluateDatabaseSafety` | Public anonymous key for client requests governed by Row Level Security (RLS) | **YES** (when Cloud DB active) | Client & Server | **Current** |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/supabase/database-safety.ts`<br>`lib/supabase/server.ts` | `evaluateDatabaseSafety`, Server Admin client | Secret administrative key for privileged server operations, user provisioning, and migrations | **YES** (for server administrative functions) | **Server-only** (Secret) | **Current** |
| `SUPABASE_REQUIRED` | `lib/supabase/database-safety.ts`<br>`lib/supabase/client.ts` | `assertDatabaseSafety`, Fail-fast gate | Safety circuit breaker. When `true`, throws fatal error if Supabase credentials are missing/mock | **YES** (`false` during migration, `true` when Cloud active) | Server / Build | **Current** |
| `JWT_SECRET` | None | N/A | Auth token signing is handled natively by Supabase GoTrue Auth service | **NO** | N/A | **UNUSED** |
| `SUPABASE_SECRET_KEY` | None | N/A | Unused alias; application strictly references `SUPABASE_SERVICE_ROLE_KEY` | **NO** | N/A | **UNUSED / LEGACY** |
| `AI_PROVIDER` | `lib/ai-providers/index.ts` | `getAIProvider` | AI Provider selection (`GEMINI`) | **YES** (`GEMINI`) | Server-only | **Current (LIVE)** |
| `GEMINI_API_KEY` | `lib/ai-providers/gemini-provider.ts` | `GeminiProvider.generateQuestion` | Google Gemini API Authentication Key | **YES** | Server-only (Secret) | **Current (LIVE)** |
| `GEMINI_MODEL` | `lib/ai-providers/gemini-provider.ts` | `GeminiProvider` constructor | Model specification (`gemini-3.5-flash`) | **YES** (`gemini-3.5-flash`) | Server-only | **Current (LIVE)** |
| `NEXT_PUBLIC_APP_URL` | `lib/ai-providers/gemini-provider.ts` | App base URL resolution | Base canonical URL (`https://dekiemtradki-khtn-thcs.vercel.app`) | **YES** | Client & Server | **Current** |
| `NEXT_PUBLIC_APP_ENV` | App configuration | Runtime environment detection | Set to `production` | **YES** | Client & Server | **Current** |

---

## 2. SECURITY & CLIENT EXPOSURE ARCHITECTURE

1. **Client-Side Safe (NEXT_PUBLIC_)**:
   - `NEXT_PUBLIC_SUPABASE_URL`: Safe for public distribution. Points to Supabase project API gateway.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Safe for public distribution. Read/write capabilities are strictly restricted by PostgreSQL Row Level Security (RLS) policies.
   - `NEXT_PUBLIC_APP_URL` & `NEXT_PUBLIC_APP_ENV`: Application metadata.

2. **Server-Only Secrets (Forbidden in Client Bundle)**:
   - `SUPABASE_SERVICE_ROLE_KEY`: Must **never** have `NEXT_PUBLIC_` prefix. Bypasses all RLS policies. Strictly restricted to Node.js server runtimes.
   - `GEMINI_API_KEY`: Server secret for calling Google Gemini API. Never leaked to client.

3. **Circuit Breaker (`SUPABASE_REQUIRED`)**:
   - Set to `false` during configuration transition.
   - Set to `true` once Supabase Cloud credentials are saved in Vercel and migrations have run.
   - Any deployment with `SUPABASE_REQUIRED=true` and missing/mock credentials fails fast during build/initialization, guaranteeing zero silent fallback to local file storage.

---

## 3. MULTI-TENANT DATABASE MODEL

The multi-tenant schema connects schools, departments, teachers, and their assessment assets:

```
auth.users (Supabase Auth)
    │
    ├──► profiles (id, full_name, email, avatar_url)
    │        │
    │        ├──► memberships (user_id, organization_id, department_id, role, status)
    │        │         │
    │        │         ├──► organizations (Schools: THCS Phan Văn Trị, etc.)
    │        │         └──► departments (Tổ chuyên môn: Tổ KHTN, etc.)
    │        │
    │        ├──► teaching_assignments (teacher_id, organization_id, grade, subject_area, academic_year)
    │        │
    │        └──► assessment_matrices / test_specifications / tests (scoped by organization_id & created_by)
    │
    └──► question_bank (scoped by organization_id, visibility: PUBLIC | ORGANIZATION | DEPARTMENT | PRIVATE)
```

### Roles Supported:
1. `super_admin`: System-wide access, multi-school management.
2. `school_admin`: School Principal / Academic Vice Principal - manages school members, departments, all matrices & tests in their school.
3. `dept_head`: Tổ trưởng chuyên môn - manages department curriculum, matrices, reviews and approves question banks for the department.
4. `vice_head`: Tổ phó chuyên môn - assists department head in reviewing and organizing tests.
5. `teacher`: Giáo viên bộ môn - creates questions, personal/department matrices and tests for assigned grades.

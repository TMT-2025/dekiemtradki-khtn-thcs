/**
 * Production Database Safety & Fail-Fast Validator
 * Enforces strict database configuration in production environments.
 * Prevents silent fallback to JSON storage when SUPABASE_REQUIRED=true.
 */

export class ProductionDatabaseConfigurationError extends Error {
  public readonly code: string = 'PRODUCTION_DATABASE_CONFIG_ERROR';
  
  constructor(message: string) {
    super(message);
    this.name = 'ProductionDatabaseConfigurationError';
    Object.setPrototypeOf(this, ProductionDatabaseConfigurationError.prototype);
  }
}

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  isRequired: boolean;
  url: string | null;
  hasAnonKey: boolean;
  hasServiceRoleKey: boolean;
  storageMode: 'PRODUCTION_SUPABASE' | 'DEV_MOCK_FALLBACK' | 'JSON_STORAGE';
  reason: string;
}

/**
 * Evaluates current Supabase environment variables and fail-fast constraints.
 */
export function evaluateDatabaseSafety(env: Record<string, string | undefined> = process.env): SupabaseConfigStatus {
  const isRequired = env.SUPABASE_REQUIRED === 'true' || env.NODE_ENV === 'production' && env.SUPABASE_REQUIRED !== 'false' && env.APP_ENV === 'production';
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim() || null;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || null;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim() || null;

  const isMockUrl = !url || url.includes('mock.supabase.co') || url.includes('your-project.supabase.co');
  const isMockKey = !anonKey || anonKey.includes('mock-') || anonKey.includes('your-anon-key');

  const isConfigured = !isMockUrl && !isMockKey;

  if (isRequired && !isConfigured) {
    const errorMsg = `[PRODUCTION_DATABASE_CONFIG_ERROR] SUPABASE_REQUIRED=true is enforced, but production Supabase configuration is missing or invalid. (URL: ${url || 'NOT_SET'}). Production deployment strictly forbids silent fallback to JSON storage. Please configure valid NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.`;
    throw new ProductionDatabaseConfigurationError(errorMsg);
  }

  const storageMode = isConfigured
    ? 'PRODUCTION_SUPABASE'
    : (url && !isMockUrl)
      ? 'DEV_MOCK_FALLBACK'
      : 'JSON_STORAGE';

  const reason = isConfigured
    ? 'Production Supabase credentials validated successfully.'
    : isRequired
      ? 'Supabase required and verified.'
      : 'Running in development/test fallback mode with local JSON storage.';

  return {
    isConfigured,
    isRequired,
    url,
    hasAnonKey: !isMockKey && !!anonKey,
    hasServiceRoleKey: !!serviceRoleKey && !serviceRoleKey.includes('your-'),
    storageMode,
    reason
  };
}

/**
 * Asserts database configuration safety; throws ProductionDatabaseConfigurationError if invalid when required.
 */
export function assertDatabaseSafety(env: Record<string, string | undefined> = process.env): void {
  evaluateDatabaseSafety(env);
}

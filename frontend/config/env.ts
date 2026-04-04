interface EnvConfig {
  apiUrl: string;
  nodeEnv: 'development' | 'production' | 'test';
  mediaBaseUrl?: string;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key];

  if (!value) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
};

const rawApiUrl = (process.env.NEXT_PUBLIC_API_URL ?? '').trim();
// Local dev works without .env.local when the API runs on the default port.
const apiUrl =
  rawApiUrl ||
  (process.env.NODE_ENV !== 'production' ? 'http://localhost:5000/api' : '');

export const env: EnvConfig = {
  // API base URL (include /api).
  apiUrl,
  nodeEnv: (getEnvVar('NODE_ENV', 'development') as 'development' | 'production' | 'test'),
  mediaBaseUrl: process.env.NEXT_PUBLIC_MEDIA_BASE_URL,
};

export const hasApiUrl = !!apiUrl;
export const isDevelopment = env.nodeEnv === 'development';
export const isProduction = env.nodeEnv === 'production';
export const isTest = env.nodeEnv === 'test';

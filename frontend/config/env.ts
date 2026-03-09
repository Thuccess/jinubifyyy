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

export const env: EnvConfig = {
  // API base URL must be provided via NEXT_PUBLIC_API_URL (e.g. http://localhost:5000/api in dev,
  // https://jinubifyyy-2.onrender.com/api in production). No localhost fallback here so that
  // misconfigured deployments fail fast.
  apiUrl: getEnvVar('NEXT_PUBLIC_API_URL'),
  nodeEnv: (getEnvVar('NODE_ENV', 'development') as 'development' | 'production' | 'test'),
  mediaBaseUrl: process.env.NEXT_PUBLIC_MEDIA_BASE_URL,
};

export const isDevelopment = env.nodeEnv === 'development';
export const isProduction = env.nodeEnv === 'production';
export const isTest = env.nodeEnv === 'test';

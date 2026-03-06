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
  apiUrl: getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:5000/api'),
  nodeEnv: (getEnvVar('NODE_ENV', 'development') as 'development' | 'production' | 'test'),
  mediaBaseUrl: process.env.NEXT_PUBLIC_MEDIA_BASE_URL,
};

export const isDevelopment = env.nodeEnv === 'development';
export const isProduction = env.nodeEnv === 'production';
export const isTest = env.nodeEnv === 'test';

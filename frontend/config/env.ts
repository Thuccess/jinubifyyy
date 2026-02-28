interface EnvConfig {
  apiUrl: string;
  nodeEnv: 'development' | 'production' | 'test';
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
};

export const env: EnvConfig = {
  apiUrl: getEnvVar('VITE_API_URL', 'http://localhost:5000/api'),
  nodeEnv: (getEnvVar('NODE_ENV', 'development') as 'development' | 'production' | 'test'),
};

export const isDevelopment = env.nodeEnv === 'development';
export const isProduction = env.nodeEnv === 'production';
export const isTest = env.nodeEnv === 'test';

// Environment variable validation

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
];

const optionalEnvVars = {
  // Never default PORT here — Render/Heroku/Docker inject PORT; forcing 5000 breaks routing (521).
  FRONTEND_URL: 'http://localhost:3000',
  NODE_ENV: 'development',
  JWT_EXPIRES_IN: '7d',
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: 587,
  CONTACT_EMAIL: 'ruotmaliah654@gmail.com',
};

export const validateEnv = () => {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\nPlease set these variables in your .env file');
    process.exit(1);
  }

  // Set defaults for optional variables
  Object.entries(optionalEnvVars).forEach(([key, defaultValue]) => {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
      console.log(`⚠️  Using default value for ${key}: ${defaultValue}`);
    }
  });

  // Validate JWT_SECRET strength in production
  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  WARNING: JWT_SECRET should be at least 32 characters long in production');
  }

  console.log('✅ Environment variables validated');
};

export default validateEnv;

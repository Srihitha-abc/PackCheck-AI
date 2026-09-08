import 'dotenv/config';

const requiredVariables = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL', 'AI_SERVICE_URL'];

const missingVariables = requiredVariables.filter(name => !process.env[name]);
if (missingVariables.length) {
  throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}. Copy server/.env.example to server/.env and configure it.`);
}

if (process.env.JWT_SECRET.length < 16) {
  throw new Error('JWT_SECRET must be at least 16 characters long.');
}

export const config = {
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL,
  aiServiceUrl: process.env.AI_SERVICE_URL
};

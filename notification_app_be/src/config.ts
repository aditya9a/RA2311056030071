import dotenv from "dotenv";
dotenv.config();

/**
 * Centralised environment config.
 * Fails fast if critical variables are missing.
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env variable: ${key}`);
  }
  return value;
}

export const config = {
  PORT: parseInt(process.env.PORT || "3001", 10),
  API_BASE_URL: requireEnv("API_BASE_URL"),
  LOG_API_URL: requireEnv("LOG_API_URL"),
  AUTH_TOKEN: requireEnv("AUTH_TOKEN"),
};

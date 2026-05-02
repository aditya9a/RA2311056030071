import dotenv from "dotenv";

// Load .env file from the project root
dotenv.config();

/**
 * Centralised configuration loaded from environment variables.
 * Fails fast at startup if required values are missing.
 */
export const config = {
  PORT: parseInt(process.env.PORT || "3000", 10),
  API_BASE_URL: requireEnv("API_BASE_URL"),
  LOG_API_URL: requireEnv("LOG_API_URL"),
  AUTH_TOKEN: requireEnv("AUTH_TOKEN"),
} as const;

/**
 * Read a required environment variable or crash with a helpful message.
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    process.stderr.write(
      `[Config] Missing required environment variable: ${key}\n`
    );
    process.exit(1);
  }
  return value;
}

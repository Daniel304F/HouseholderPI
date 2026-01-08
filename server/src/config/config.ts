import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
  };
  bcrypt: {
    saltRounds: number;
  };
}

const config: Config = {
  port: Number(process.env["PORT"]) || 3000,
  nodeEnv: process.env["NODE_ENV"] || "development",
  jwt: {
    accessSecret:
      process.env["JWT_ACCESS_SECRET"] ||
      "dev-access-secret-change-in-production",
    refreshSecret:
      process.env["JWT_REFRESH_SECRET"] ||
      "dev-refresh-secret-change-in-production",
    accessExpiresIn: process.env["JWT_ACCESS_EXPIRES_IN"] || "15m",
    refreshExpiresIn: process.env["JWT_REFRESH_EXPIRES_IN"] || "7d",
  },
  bcrypt: {
    saltRounds: Number(process.env["BCRYPT_SALT_ROUNDS"]) || 12,
  },
};

export default config;

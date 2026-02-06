import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: number;
    refreshExpiresIn: number;
  };
  bcrypt: {
    saltRounds: number;
  };
  db: {
    use: "mongodb" | "inmemory";
    connect: {
      host: string;
      port: { mongodb: number };
      user: string;
      password: string;
      database: string;
      authSource: string;
    };
  };
  vapid: {
    publicKey: string;
    privateKey: string;
    subject: string;
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
    accessExpiresIn: Number(process.env["JWT_ACCESS_EXPIRES_IN"]) || 3600,
    refreshExpiresIn: Number(process.env["JWT_REFRESH_EXPIRES_IN"]) || 604800,
  },
  bcrypt: {
    saltRounds: Number(process.env["BCRYPT_SALT_ROUNDS"]) || 12,
  },
  db: {
    use: (process.env["DB_USE"] as "mongodb" | "inmemory") || "mongodb",
    connect: {
      host: process.env["DB_HOST"] || "localhost",
      port: {
        mongodb: Number(process.env["DB_PORT"]) || 27017,
      },
      user: process.env["DB_USER"] || "admin",
      password: process.env["DB_PASSWORD"] || "secretpassword",
      database: process.env["DB_NAME"] || "myappdb",
      authSource: process.env["DB_AUTH_SOURCE"] || "admin",
    },
  },
  vapid: {
    publicKey: process.env["VAPID_PUBLIC_KEY"] || "",
    privateKey: process.env["VAPID_PRIVATE_KEY"] || "",
    subject: process.env["VAPID_SUBJECT"] || "mailto:admin@example.com",
  },
};

export default config;

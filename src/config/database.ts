import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';
import { logger } from "./logger";
import RedisService from "@/services/redis.service";
import config from "./index";

export const queryClient = postgres(config.databaseUrl);
export const db = drizzle(queryClient, { schema });

logger.info("[DRIZZLE] : initialized database client");

export const closeDatabase = async () => {
  logger.info('[DRIZZLE] : closing database connection...');
  await queryClient.end();
};

interface CustomNodeJsGlobal {
	redis: RedisService;
}

declare const global: CustomNodeJsGlobal;

export const redis = global.redis || new RedisService(
  config.redis.host,
  config.redis.port,
  config.redis.db
);

if (!global.redis) {
  global.redis = redis;
}

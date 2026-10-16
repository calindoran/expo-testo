import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";
import type { PokeApiResponse } from "@/lib/pokeapi";

const DATABASE_NAME = "pokedex-cache.db";
const TABLE_NAME = "api_response_cache";

let databasePromise: Promise<SQLiteDatabase> | undefined;

function getDatabase(): Promise<SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = openDatabaseAsync(DATABASE_NAME)
      .then(async (database) => {
        await database.execAsync(`
          PRAGMA journal_mode = WAL;
          CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
            url TEXT PRIMARY KEY NOT NULL,
            payload TEXT NOT NULL,
            cached_at INTEGER NOT NULL DEFAULT 0
          );
        `);
        const columns = await database.getAllAsync<{ name: string }>(
          `PRAGMA table_info(${TABLE_NAME})`,
        );
        if (!columns.some((column) => column.name === "cached_at")) {
          await database.execAsync(
            `ALTER TABLE ${TABLE_NAME} ADD COLUMN cached_at INTEGER NOT NULL DEFAULT 0`,
          );
        }
        return database;
      })
      .catch((error: unknown) => {
        databasePromise = undefined;
        throw error;
      });
  }
  return databasePromise;
}

export async function readCachedPokeApiResponse<T extends PokeApiResponse>(
  url: string,
): Promise<T | undefined> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ payload: string }>(
    `SELECT payload FROM ${TABLE_NAME} WHERE url = ?`,
    url,
  );
  if (!row) return undefined;

  try {
    return JSON.parse(row.payload) as T;
  } catch (error) {
    console.error("Removing an invalid cached PokéAPI response", error);
    await database.runAsync(`DELETE FROM ${TABLE_NAME} WHERE url = ?`, url);
    return undefined;
  }
}

export async function cachePokeApiResponse<T extends PokeApiResponse>(
  url: string,
  response: T,
): Promise<void> {
  const database = await getDatabase();
  const payload = JSON.stringify(response);
  if (payload === undefined) {
    throw new Error("PokéAPI response could not be serialized for caching");
  }

  await database.runAsync(
    `INSERT INTO ${TABLE_NAME} (url, payload, cached_at)
     VALUES (?, ?, ?)
     ON CONFLICT(url) DO UPDATE SET
       payload = excluded.payload,
       cached_at = excluded.cached_at`,
    url,
    payload,
    Date.now(),
  );
}

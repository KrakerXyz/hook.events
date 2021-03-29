
export const enum EnvKey {
   ENV = 'ENV',
   HOSTNAME = 'HOSTNAME',
   PORT = 'PORT',

   /** A connection string for hookseventstorage */
   AZURE_STORAGE_CONNECTION_STRING = 'AZURE_STORAGE_CONNECTION_STRING',

   COSMOSDB_CONNECTION_STRING = 'COSMOSDB_CONNECTION_STRING',

   /** The google client id for OAuth verification */
   GOOGLE_CLIENT_ID = 'GOOGLE_CLIENT_ID'
}

/** Gets value from process.env or throws exception if empty */
export function getRequiredConfig(key: EnvKey): string {
   const value = process.env[key];
   if (!value) { throw new Error(`Missing config for ${key}`); }
   return value;
}

export function getOptionalConfig(key: EnvKey): string | undefined;
export function getOptionalConfig(key: EnvKey, defaultValue: string): string;
export function getOptionalConfig(key: EnvKey, defaultValue?: string): string | undefined {

   const value = process.env[key];
   return value ?? defaultValue;
}

export const isDevelopment = (process.env[EnvKey.ENV] ?? 'production') === 'development';
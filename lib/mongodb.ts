import mongoose from "mongoose";

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

// Narrowed to string after the guard above.
const MONGODB_URI: string = mongoUri;

/**
 * Cached connection state reused across hot reloads in development.
 * This prevents opening multiple connections during Next.js dev mode.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // Persist the cache on globalThis so Next.js dev reloads do not open new connections.
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!globalThis.mongooseCache) {
  globalThis.mongooseCache = cached;
}

/**
 * Connect to MongoDB via Mongoose.
 * Returns the existing connection when one is already established.
 * Reuses connection promises to prevent duplicate concurrent connections.
 *
 * @returns Promise that resolves to the Mongoose instance
 * @throws Error if MONGODB_URI is not set or connection fails
 */
export async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection if already established
  if (cached.conn) {
    return cached.conn;
  }

  // Reuse pending connection promise to avoid duplicate connections
  if (!cached.promise) {
    const opts = {
      // Fail fast in serverless/API routes instead of buffering commands.
      bufferCommands: false,
      // Connection pool configuration for better performance
      maxPoolSize: 10,
      minPoolSize: 2,
      // Socket timeout
      socketTimeoutMS: 45000,
      // Server selection timeout
      serverSelectionTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;

    // Verify connection is truly established
    if (
      !cached.conn ||
      cached.conn.connection.readyState !==
        1 /* 1 = connected, see mongoose.Connection.STATES */
    ) {
      throw new Error(
        "Failed to establish MongoDB connection: connection not ready",
      );
    }
  } catch (error) {
    // Allow a retry after a failed connection attempt by clearing the promise
    cached.promise = null;
    cached.conn = null;

    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error("[MongoDB] Connection failed:", errorMessage);

    throw error;
  }

  return cached.conn;
}

/**
 * Safely disconnect from MongoDB.
 * Useful for testing or graceful shutdown.
 */
export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}

import mongoose from "mongoose";

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

// Narrowed to string after the guard above. We need to do this because the mongoUri is a string, but the mongoose.connect function expects a string.
const MONGODB_URI: string = mongoUri;

/** Cached connection state reused across hot reloads in development. This is a cache of the mongoose connection. */
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
 * Returns the existing connection when one is already established. Returns a promise that resolves to the connection.
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      // Fail fast in serverless/API routes instead of buffering commands.
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Allow a retry after a failed connection attempt.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

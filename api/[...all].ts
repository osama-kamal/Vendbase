// Vercel serverless entry for the Vendbase demo.
// Catch-all: every /api/* request lands here and is handed to the Express app.
// The Mongo connection is cached across warm invocations (server.ts, which
// binds a port, is Railway/Docker-only and is not imported here).
import type { IncomingMessage, ServerResponse } from 'http';
import app from '../backend/src/app';
import { connectDatabase } from '../backend/src/config/database';

let dbReady: Promise<void> | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (!dbReady) {
    dbReady = connectDatabase();
    // Allow retry on the next request if the first connect fails.
    dbReady.catch(() => { dbReady = null; });
  }
  await dbReady;
  return app(req, res);
}

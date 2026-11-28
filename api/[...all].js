// Vercel serverless entry for the Vendbase demo.
// Catch-all: every /api/* request lands here and is handed to the Express app.
// Uses the compiled backend (backend/dist, built by installCommand) so no
// TypeScript compilation happens inside the function build.
// The Mongo connection is cached across warm invocations.
const app = require('../backend/dist/app').default;
const { connectDatabase } = require('../backend/dist/config/database');

let dbReady = null;

module.exports = async function handler(req, res) {
  if (!dbReady) {
    dbReady = connectDatabase();
    dbReady.catch(() => { dbReady = null; });
  }
  await dbReady;
  return app(req, res);
};

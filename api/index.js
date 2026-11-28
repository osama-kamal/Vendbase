// Vercel serverless entry for the Vendbase demo.
// All /api/* requests are rewritten here (see vercel.json). Vercel hands the
// function the rewritten URL, so the original path is passed as __path and
// restored before Express sees the request.
// Uses the compiled backend (backend/dist, built by installCommand).
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
  const m = req.url.match(/[?&]__path=([^&]+)/);
  if (m) req.url = decodeURIComponent(m[1]);
  return app(req, res);
};

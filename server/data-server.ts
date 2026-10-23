// Private PostgreSQL API. Never publish this port or trust identity headers from a public client.
import { createServer } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import pg from "pg";
import { handleApi, type Database } from "../lib/api";
pg.types.setTypeParser(20, (value) => Number(value));
const secret = process.env.DATA_API_TOKEN || "",
  origin = process.env.SITE_ORIGIN || "";
if (
  secret.length < 32 ||
  !process.env.DATABASE_URL ||
  !/^https?:\/\//.test(origin)
)
  throw Error(
    "Configure DATABASE_URL, SITE_ORIGIN and a DATA_API_TOKEN of at least 32 characters.",
  );
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  statement_timeout: 10000,
  ssl:
    process.env.PG_TLS === "verify" ? { rejectUnauthorized: true } : undefined,
});
// Translate only SQL tokens, keeping quoted strings untouched. USER must be a quoted column in PostgreSQL.
function sql(source: string) {
  let result = "",
    quote = "",
    n = 0;
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (quote) {
      result += c;
      if (c === quote) {
        if (source[i + 1] === quote) {
          result += source[++i];
        } else quote = "";
      }
      continue;
    }
    if (c === "'" || c === '"') {
      quote = c;
      result += c;
      continue;
    }
    if (c === "?") {
      result += "$" + ++n;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let token = c;
      while (/[A-Za-z_0-9]/.test(source[i + 1] || "")) token += source[++i];
      result += ["user", "match", "read"].includes(token.toLowerCase())
        ? '"' + token + '"'
        : token;
      continue;
    }
    result += c;
  }
  return result;
}
const db: Database = {
  all: async (q, args = []) => (await pool.query(sql(q), args)).rows,
  run: async (q, args = []) => pool.query(sql(q), args),
  batch: async (queries) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = [];
      for (const q of queries)
        result.push(await client.query(sql(q.sql), q.args || []));
      await client.query("COMMIT");
      return result;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },
};
async function migrate() {
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock(7623451)");
    await client.query(
      "CREATE TABLE IF NOT EXISTS av_migrations(name text PRIMARY KEY, applied bigint NOT NULL)",
    );
    for (const name of (await readdir("postgres"))
      .filter((n) => n.endsWith(".sql"))
      .sort()) {
      if (
        (
          await client.query("SELECT 1 FROM av_migrations WHERE name=$1", [
            name,
          ])
        ).rowCount
      )
        continue;
      await client.query("BEGIN");
      try {
        await client.query(await readFile("postgres/" + name, "utf8"));
        await client.query(
          "INSERT INTO av_migrations(name,applied) VALUES($1,$2)",
          [name, Date.now()],
        );
        await client.query("COMMIT");
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      }
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock(7623451)");
    client.release();
  }
}
if (process.argv.includes("--migrate")) {
  await migrate();
  await pool.end();
  process.exit(0);
}
await migrate();
const server = createServer(async (incoming, outgoing) => {
  const requestId = crypto.randomUUID(),
    started = Date.now();
  try {
    const supplied = Buffer.from(
        (incoming.headers.authorization || "").replace(/^Bearer /, ""),
      ),
      expected = Buffer.from(secret);
    if (
      supplied.length !== expected.length ||
      !timingSafeEqual(supplied, expected)
    ) {
      outgoing.writeHead(401, { "Content-Type": "application/json" });
      outgoing.end('{"error":"Unauthorized"}');
      return;
    }
    const path = (incoming.url || "/").split("?")[0];
    if (!path.startsWith("/api/")) {
      outgoing.writeHead(404);
      outgoing.end();
      return;
    }
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of incoming) {
      size += chunk.length;
      if (size > 8192) {
        outgoing.writeHead(413);
        outgoing.end();
        return;
      }
      chunks.push(Buffer.from(chunk));
    }
    const headers = new Headers();
    for (const name of [
      "content-type",
      "cookie",
      "origin",
      "cf-connecting-ip",
    ]) {
      const value = incoming.headers[name];
      if (typeof value === "string") headers.set(name, value);
    }
    const method = incoming.method || "GET",
      req = new Request(origin.replace(/\/$/, "") + (incoming.url || "/"), {
        method,
        headers,
        body: ["GET", "HEAD"].includes(method)
          ? undefined
          : Buffer.concat(chunks),
      });
    const userId = incoming.headers["x-av-user"];
    const user =
      typeof userId === "string" && userId.length <= 200
        ? { id: userId, name: "Explorer" }
        : null;
    const response = await handleApi(req, {
      db,
      user,
      admins: (process.env.ADMIN_USER_IDS || "").split(",").filter(Boolean),
      log: (e) => console.log(JSON.stringify(e)),
    });
    response.headers.forEach((value, key) => outgoing.setHeader(key, value));
    outgoing.writeHead(response.status);
    outgoing.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    console.log(
      JSON.stringify({
        level: "error",
        event: "data_request_failed",
        requestId,
      }),
    );
    outgoing.writeHead(503, { "Content-Type": "application/json" });
    outgoing.end('{"error":"Service temporarily unavailable"}');
  } finally {
    console.log(
      JSON.stringify({
        level: "info",
        event: "data_http",
        requestId,
        status: outgoing.statusCode,
        durationMs: Date.now() - started,
      }),
    );
  }
});
server.requestTimeout = 15000;
server.headersTimeout = 10000;
server.listen(Number(process.env.PORT || 3100), "0.0.0.0");
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 25000).unref();
  });

import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";
import { handleApi, type Database } from "../../../lib/api";
export const dynamic = "force-dynamic";
async function handler(req: Request) {
  const identity = await getChatGPTUser(),
    binding = env.DB!;
  const runtime = env as unknown as {
    DATA_API_URL?: string;
    DATA_API_TOKEN?: string;
  };
  if (runtime.DATA_API_URL) {
    if (!runtime.DATA_API_TOKEN || runtime.DATA_API_TOKEN.length < 32)
      return Response.json(
        { error: "Private data service is not configured." },
        { status: 503 },
      );
    const headers = new Headers();
    for (const name of [
      "content-type",
      "cookie",
      "origin",
      "cf-connecting-ip",
    ]) {
      const value = req.headers.get(name);
      if (value) headers.set(name, value);
    }
    headers.set("Authorization", "Bearer " + runtime.DATA_API_TOKEN);
    if (identity) headers.set("X-AV-User", identity.userId);
    try {
      return await fetch(
        runtime.DATA_API_URL.replace(/\/$/, "") +
          new URL(req.url).pathname +
          new URL(req.url).search,
        {
          method: req.method,
          headers,
          body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
          signal: AbortSignal.timeout(15000),
        },
      );
    } catch {
      return Response.json(
        { error: "Private data service unavailable." },
        { status: 503 },
      );
    }
  }
  const db: Database = {
    all: async (sql, args = []) => {
      const r = await binding
        .prepare(sql)
        .bind(...args)
        .all();
      return r.results || [];
    },
    run: async (sql, args = []) =>
      binding
        .prepare(sql)
        .bind(...args)
        .run(),
    batch: async (q) =>
      binding.batch(
        q.map((x) => binding.prepare(x.sql).bind(...(x.args || []))),
      ),
  };
  return handleApi(req, {
    db,
    user: identity ? { id: identity.userId, name: "Explorer" } : null,
    admins: (
      (env as unknown as { ADMIN_USER_IDS?: string }).ADMIN_USER_IDS || ""
    )
      .split(",")
      .filter(Boolean),
    log: (e) => console.log(JSON.stringify(e)),
  });
}
export { handler as GET, handler as POST, handler as PUT, handler as DELETE };

import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";
import { handleApi, type Database } from "../../../lib/api";
export const dynamic = "force-dynamic";
async function handler(req: Request) {
  const identity = await getChatGPTUser(),
    binding = env.DB!;
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

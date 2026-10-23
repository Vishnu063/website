import { handlePlay } from "./play-api.ts";
import { cleanText, resultFromCode, ValidationError } from "./power.ts";
export type User = { id: string; name: string };
export interface Database {
  all(sql: string, args?: unknown[]): Promise<any[]>;
  run(sql: string, args?: unknown[]): Promise<unknown>;
  batch(queries: { sql: string; args?: unknown[] }[]): Promise<unknown>;
}
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
const fail = (status: number, message: string): never => {
  throw new HttpError(status, message);
};
export async function handleApi(
  req: Request,
  ctx: {
    db: Database;
    user: User | null;
    admins?: string[];
    log?: (event: unknown) => void;
  },
) {
  const requestId = crypto.randomUUID(),
    started = Date.now(),
    url = new URL(req.url),
    p = url.pathname
      .replace(/^\/api\/?/, "")
      .split("/")
      .filter(Boolean);
  const { db, user } = ctx;
  let status = 200;
  const json = (data: unknown, s = 200) => {
    status = s;
    return Response.json(data, {
      status: s,
      headers: {
        "Cache-Control": "no-store",
        "X-Request-ID": requestId,
        "X-Content-Type-Options": "nosniff",
      },
    });
  };
  const auth = () =>
    user || fail(401, "Sign in to save progress or join the discussion.");
  const blocked = async (target: string) =>
    user &&
    !!(
      await db.all(
        "SELECT 1 FROM blocks WHERE (user=? AND target=?) OR (user=? AND target=?)",
        [user.id, target, target, user.id],
      )
    ).length;
  const battle = async (id: string) => {
    const b = (
      await db.all(
        "SELECT b.*,COALESCE(p.name,'Explorer') author FROM battles b LEFT JOIN profiles p ON p.id=b.owner WHERE b.id=? AND b.hidden=0",
        [id],
      )
    )[0];
    if (!b || (await blocked(b.owner))) fail(404, "Battle not found.");
    return b;
  };
  try {
    if (p[0] === "play") {
      const response = await handlePlay(req, ctx, p.slice(1));
      status = response.status;
      return response;
    }
    if (p[0] === "health") {
      await db.all("SELECT 1 FROM game_players LIMIT 1");
      return json({ status: "ok", database: "ready", version: "3.1.0" });
    }
    if (p[0] === "session" && req.method === "GET")
      return json({ user, admin: !!user && !!ctx.admins?.includes(user.id) });
    let body: any = {};
    if (!["GET", "HEAD"].includes(req.method)) {
      auth();
      if (req.headers.get("origin") !== url.origin)
        fail(403, "Request origin is not allowed.");
      if (!req.headers.get("content-type")?.startsWith("application/json"))
        fail(415, "Send JSON.");
      const reader = req.body?.getReader(),
        chunks: Uint8Array[] = [];
      let bytes = 0;
      if (reader)
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          bytes += value.length;
          if (bytes > 8192) {
            await reader.cancel();
            fail(413, "Request is too large.");
          }
          chunks.push(value);
        }
      const raw = new Uint8Array(bytes);
      let pos = 0;
      for (const c of chunks) {
        raw.set(c, pos);
        pos += c.length;
      }
      try {
        body = JSON.parse(new TextDecoder().decode(raw));
        if (!body || typeof body !== "object" || Array.isArray(body))
          throw Error();
      } catch {
        fail(400, "Invalid JSON.");
      }
      const bucket = Math.floor(Date.now() / 60000),
        key = `${user!.id}:${p[0]}`;
      const count = (
        await db.all(
          "INSERT INTO limits(key,bucket,count) VALUES(?,?,1) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN limits.bucket=excluded.bucket THEN limits.count+1 ELSE 1 END,bucket=excluded.bucket RETURNING count",
          [key, bucket],
        )
      )[0]?.count;
      if (count > 30) fail(429, "Please slow down. Try again in a minute.");
    }
    if (p[0] === "profile") {
      const u = auth();
      if (req.method === "GET")
        return json({
          profile: (
            await db.all("SELECT name,hero,created FROM profiles WHERE id=?", [
              u.id,
            ])
          )[0] || { name: u.name, hero: null },
          following: await db.all(
            "SELECT b.id,b.title FROM follows f JOIN battles b ON b.id=f.battle WHERE f.user=? AND b.hidden=0 AND NOT EXISTS(SELECT 1 FROM blocks x WHERE (x.user=? AND x.target=b.owner) OR (x.target=? AND x.user=b.owner)) ORDER BY b.created DESC LIMIT 50",
            [u.id, u.id, u.id],
          ),
          blocks: await db.all("SELECT target FROM blocks WHERE user=?", [
            u.id,
          ]),
        });
      if (req.method === "PUT") {
        const name = cleanText(body.name, 2, 32, "Display name");
        let hero = null;
        if (body.hero) {
          resultFromCode(body.hero.code);
          hero = JSON.stringify({
            code: body.hero.code,
            name: cleanText(body.hero.name, 1, 32, "Hero name"),
          });
        }
        await db.run(
          "INSERT INTO profiles(id,name,hero,created) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,hero=excluded.hero",
          [u.id, name, hero, Date.now()],
        );
        return json({ saved: true });
      }
      if (req.method === "DELETE") {
        await db.batch([
          {
            sql: "UPDATE tournaments SET status='cancelled' WHERE status IN ('active','registration') AND id IN (SELECT tournament FROM matches WHERE left_user=? OR right_user=?)",
            args: [u.id, u.id],
          },
          {
            sql: "UPDATE matches SET status='withdrawn' WHERE (left_user=? OR right_user=?) AND status IN ('open','draw')",
            args: [u.id, u.id],
          },
          {
            sql: "UPDATE matches SET winner=NULL WHERE winner=?",
            args: [u.id],
          },
          { sql: "DELETE FROM limits WHERE key=?", args: ["play:" + u.id] },
          {
            sql: "UPDATE matches SET left_user=NULL WHERE left_user=?",
            args: [u.id],
          },
          {
            sql: "UPDATE matches SET right_user=NULL WHERE right_user=?",
            args: [u.id],
          },
          {
            sql: "UPDATE tournaments SET winner=NULL WHERE winner=?",
            args: [u.id],
          },
          { sql: "DELETE FROM match_entries WHERE user=?", args: [u.id] },
          { sql: "DELETE FROM tournament_entries WHERE user=?", args: [u.id] },
          {
            sql: "DELETE FROM clan_members WHERE clan IN (SELECT id FROM clans WHERE owner=?)",
            args: [u.id],
          },
          {
            sql: "UPDATE clans SET archived=1,owner='deleted' WHERE owner=?",
            args: [u.id],
          },
          {
            sql: "DELETE FROM invitations WHERE sender=? OR target=?",
            args: [u.id, u.id],
          },
          ...[
            "game_events",
            "game_runs",
            "game_players",
            "notifications",
            "clan_members",
            "poll_votes",
          ].map((t) => ({
            sql: `DELETE FROM ${t} WHERE user=?`,
            args: [u.id],
          })),
          {
            sql: "DELETE FROM poll_votes WHERE poll IN (SELECT id FROM polls WHERE owner=?)",
            args: [u.id],
          },
          { sql: "DELETE FROM polls WHERE owner=?", args: [u.id] },
          ...["votes", "follows", "comments", "reports"].map((t) => ({
            sql: `DELETE FROM ${t} WHERE user=?`,
            args: [u.id],
          })),
          { sql: "DELETE FROM battles WHERE owner=?", args: [u.id] },
          {
            sql: "DELETE FROM blocks WHERE user=? OR target=?",
            args: [u.id, u.id],
          },
          {
            sql: "DELETE FROM limits WHERE substr(key,1,?)=?",
            args: [u.id.length + 1, `${u.id}:`],
          },
          { sql: "DELETE FROM audit WHERE actor=?", args: [u.id] },
          { sql: "DELETE FROM profiles WHERE id=?", args: [u.id] },
        ]);
        return json({ deleted: true });
      }
    }
    if (p[0] === "battles" && p.length === 1) {
      if (req.method === "GET") {
        const uid = user?.id || "";
        return json({
          battles: await db.all(
            "SELECT b.*,COALESCE(p.name,'Explorer') author,(SELECT COUNT(*) FROM votes v WHERE v.battle=b.id) votes,(SELECT COUNT(*) FROM comments c WHERE c.battle=b.id AND c.hidden=0) comments FROM battles b LEFT JOIN profiles p ON p.id=b.owner WHERE b.hidden=0 AND NOT EXISTS(SELECT 1 FROM blocks x WHERE (x.user=? AND x.target=b.owner) OR (x.target=? AND x.user=b.owner)) ORDER BY b.created DESC LIMIT 50",
            [uid, uid],
          ),
        });
      }
      if (req.method === "POST") {
        const u = auth(),
          title = cleanText(body.title, 5, 100, "Title"),
          left = cleanText(body.left, 1, 60, "First contender"),
          right = cleanText(body.right, 1, 60, "Second contender"),
          scenario = cleanText(body.scenario, 10, 1500, "Scenario"),
          conditions = cleanText(body.conditions, 3, 300, "Conditions");
        if (left.toLowerCase() === right.toLowerCase())
          fail(400, "Choose two different contenders.");
        const id = crypto.randomUUID();
        await db.run(
          "INSERT INTO battles(id,owner,title,left_name,right_name,scenario,conditions,created) VALUES(?,?,?,?,?,?,?,?)",
          [id, u.id, title, left, right, scenario, conditions, Date.now()],
        );
        return json({ id }, 201);
      }
    }
    if (p[0] === "battles" && p[1]) {
      const id = p[1],
        b = await battle(id);
      if (p.length === 2 && req.method === "GET")
        return json({
          battle: b,
          totals: await db.all(
            "SELECT choice,COUNT(*) count FROM votes WHERE battle=? GROUP BY choice",
            [id],
          ),
          comments: await db.all(
            "SELECT c.*,COALESCE(p.name,'Explorer') author FROM comments c LEFT JOIN profiles p ON p.id=c.user WHERE c.battle=? AND c.hidden=0 AND NOT EXISTS(SELECT 1 FROM blocks x WHERE (x.user=? AND x.target=c.user) OR (x.target=? AND x.user=c.user)) ORDER BY c.created ASC LIMIT 200",
            [id, user?.id || "", user?.id || ""],
          ),
          myVote: user
            ? (
                await db.all(
                  "SELECT choice FROM votes WHERE battle=? AND user=?",
                  [id, user.id],
                )
              )[0]?.choice
            : null,
          following: user
            ? !!(
                await db.all(
                  "SELECT 1 FROM follows WHERE battle=? AND user=?",
                  [id, user.id],
                )
              ).length
            : false,
        });
      if (p[2] === "vote" && req.method === "POST") {
        const u = auth();
        if (!["left", "right", "draw"].includes(body.choice))
          fail(400, "Choose a valid outcome.");
        const out = await db.all(
          "INSERT INTO votes(battle,user,choice) VALUES(?,?,?) ON CONFLICT(battle,user) DO NOTHING RETURNING choice",
          [id, u.id, body.choice],
        );
        if (!out.length) fail(409, "You have already voted in this battle.");
        return json({ voted: true }, 201);
      }
      if (p[2] === "comments" && req.method === "POST") {
        const u = auth(),
          text = cleanText(body.body, 2, 1000, "Comment");
        let parent = null;
        if (body.parent) {
          parent = cleanText(body.parent, 1, 50);
          const c = (
            await db.all(
              "SELECT user FROM comments WHERE id=? AND battle=? AND hidden=0",
              [parent, id],
            )
          )[0];
          if (!c || (await blocked(c.user)))
            fail(404, "Reply target not found.");
        }
        const cid = crypto.randomUUID();
        await db.run(
          "INSERT INTO comments(id,battle,user,parent,body,created) VALUES(?,?,?,?,?,?)",
          [cid, id, u.id, parent, text, Date.now()],
        );
        return json({ id: cid }, 201);
      }
      if (p[2] === "follow" && ["POST", "DELETE"].includes(req.method)) {
        const u = auth();
        if (req.method === "POST")
          await db.run(
            "INSERT INTO follows(battle,user) VALUES(?,?) ON CONFLICT DO NOTHING",
            [id, u.id],
          );
        else
          await db.run("DELETE FROM follows WHERE battle=? AND user=?", [
            id,
            u.id,
          ]);
        return json({ following: req.method === "POST" });
      }
    }
    if (p[0] === "reports" && req.method === "POST") {
      const u = auth();
      if (!["battle", "comment", "poll"].includes(body.kind))
        fail(400, "Invalid report type.");
      const target = cleanText(body.target, 1, 50),
        reason = cleanText(body.reason, 5, 500, "Reason"),
        table =
          body.kind === "battle"
            ? "battles"
            : body.kind === "poll"
              ? "polls"
              : "comments";
      if (
        !(
          await db.all(`SELECT 1 FROM ${table} WHERE id=? AND hidden=0`, [
            target,
          ])
        ).length
      )
        fail(404, "Content not found.");
      if (
        (
          await db.all(
            "SELECT 1 FROM reports WHERE user=? AND kind=? AND target=? AND status=?",
            [u.id, body.kind, target, "open"],
          )
        ).length
      )
        fail(409, "You already reported this content.");
      await db.run(
        "INSERT INTO reports(id,user,kind,target,reason,created) VALUES(?,?,?,?,?,?)",
        [crypto.randomUUID(), u.id, body.kind, target, reason, Date.now()],
      );
      return json({ reported: true }, 201);
    }
    if (p[0] === "blocks" && ["POST", "DELETE"].includes(req.method)) {
      const u = auth(),
        target = cleanText(body.target, 1, 200);
      if (target === u.id) fail(400, "You cannot block yourself.");
      if (req.method === "POST")
        await db.run(
          "INSERT INTO blocks(user,target) VALUES(?,?) ON CONFLICT DO NOTHING",
          [u.id, target],
        );
      else
        await db.run("DELETE FROM blocks WHERE user=? AND target=?", [
          u.id,
          target,
        ]);
      return json({ blocked: req.method === "POST" });
    }
    if (p[0] === "admin") {
      const u = auth();
      if (!ctx.admins?.includes(u.id)) fail(403, "Moderator access required.");
      if (req.method === "GET")
        return json({
          reports: await db.all(
            "SELECT r.*,CASE WHEN r.kind='battle' THEN b.title || ': ' || b.scenario WHEN r.kind='poll' THEN po.question WHEN r.kind='clan' THEN cl.name || ': ' || cl.bio ELSE c.body END content,CASE WHEN r.kind='battle' THEN b.id ELSE c.battle END battle FROM reports r LEFT JOIN battles b ON r.kind='battle' AND b.id=r.target LEFT JOIN comments c ON r.kind='comment' AND c.id=r.target LEFT JOIN polls po ON r.kind='poll' AND po.id=r.target LEFT JOIN clans cl ON r.kind='clan' AND cl.id=r.target WHERE r.status=? ORDER BY r.created ASC LIMIT 100",
            ["open"],
          ),
          audit: await db.all(
            "SELECT action,target,created FROM audit ORDER BY created DESC LIMIT 50",
          ),
        });
      if (req.method === "POST") {
        const r = (
          await db.all("SELECT * FROM reports WHERE id=? AND status=?", [
            body.id,
            "open",
          ])
        )[0];
        if (!r) fail(404, "Report not found.");
        if (!["hide", "dismiss"].includes(body.action))
          fail(400, "Invalid moderation action.");
        const changes = [];
        if (body.action === "hide" && r.kind === "clan") {
          changes.push(
            { sql: "UPDATE clans SET archived=1 WHERE id=?", args: [r.target] },
            { sql: "DELETE FROM clan_members WHERE clan=?", args: [r.target] },
            {
              sql: "UPDATE invitations SET status='expired' WHERE kind='clan' AND object=?",
              args: [r.target],
            },
          );
        }
        if (body.action === "hide" && r.kind !== "clan")
          changes.push({
            sql: `UPDATE ${r.kind === "battle" ? "battles" : r.kind === "poll" ? "polls" : "comments"} SET hidden=1 WHERE id=?`,
            args: [r.target],
          });
        changes.push(
          {
            sql: "UPDATE reports SET status=? WHERE id=?",
            args: [body.action, r.id],
          },
          {
            sql: "INSERT INTO audit(id,actor,action,target,created) VALUES(?,?,?,?,?)",
            args: [
              crypto.randomUUID(),
              u.id,
              body.action,
              r.target,
              Date.now(),
            ],
          },
        );
        await db.batch(changes);
        return json({ resolved: true });
      }
    }
    return json({ error: "Endpoint not found." }, 404);
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    if (e instanceof ValidationError) return json({ error: e.message }, 400);
    ctx.log?.({
      level: "error",
      requestId,
      path: url.pathname,
      event: "request_failed",
    });
    return json(
      {
        error:
          "Service temporarily unavailable. Your changes were not confirmed. Please retry.",
      },
      503,
    );
  } finally {
    ctx.log?.({
      level: "info",
      requestId,
      path: url.pathname,
      method: req.method,
      status,
      durationMs: Date.now() - started,
    });
  }
}

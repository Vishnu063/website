import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import { handleApi, type Database, type User } from "../lib/api.ts";
import { powerResult, resultFromCode } from "../lib/power.ts";
function setup() {
  const sql = new DatabaseSync(":memory:");
  sql.exec("PRAGMA foreign_keys=ON");
  for (const file of readdirSync(new URL("../drizzle/", import.meta.url))
    .filter((x) => x.endsWith(".sql"))
    .sort())
    sql.exec(
      readFileSync(new URL("../drizzle/" + file, import.meta.url), "utf8"),
    );
  const db: Database = {
    all: async (q, args = []) => sql.prepare(q).all(...(args as any[])),
    run: async (q, args = []) => sql.prepare(q).run(...(args as any[])),
    batch: async (queries) => {
      sql.exec("BEGIN");
      try {
        for (const q of queries)
          sql.prepare(q.sql).run(...((q.args || []) as any[]));
        sql.exec("COMMIT");
      } catch (e) {
        sql.exec("ROLLBACK");
        throw e;
      }
    },
  };
  const alice = { id: "alice", name: "Alice" },
    bob = { id: "bob", name: "Bob" };
  async function call(
    path: string,
    method = "GET",
    body?: unknown,
    user: User | null = alice,
    origin = "https://anime.test",
  ) {
    const r = await handleApi(
      new Request("https://anime.test/api/" + path, {
        method,
        headers: { origin, "content-type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
      { db, user, admins: ["moderator"] },
    );
    return { status: r.status, body: (await r.json()) as any };
  }
  return { sql, db, call, alice, bob };
}
const battle = {
  title: "Flame against moonlight",
  left: "Ember Sentinel",
  right: "Moon Weaver",
  conditions: "Moonlight Harbor, equal preparation",
  scenario:
    "Can the guardian protect a lantern while the weaver changes the path?",
};
test("power results are deterministic across all 1024 combinations", () => {
  for (let n = 0; n < 1024; n++) {
    const code = n.toString(4).padStart(5, "0");
    assert.deepEqual(resultFromCode(code), powerResult([...code].map(Number)));
  }
  assert.throws(() => resultFromCode("<script>"));
  assert.throws(() => powerResult([0, 1]));
});
test("guests can read but cannot write or access a profile", async () => {
  const { call } = setup();
  assert.equal((await call("battles", "GET", undefined, null)).status, 200);
  assert.equal((await call("battles", "POST", battle, null)).status, 401);
  assert.equal((await call("profile", "GET", undefined, null)).status, 401);
});
test("battle create, single vote, reply and follow persist", async () => {
  const { call, bob } = setup();
  const {
    status,
    body: { id },
  } = await call("battles", "POST", battle);
  assert.equal(status, 201);
  assert.equal(
    (await call(`battles/${id}/vote`, "POST", { choice: "left" })).status,
    201,
  );
  assert.equal(
    (await call(`battles/${id}/vote`, "POST", { choice: "right" })).status,
    409,
  );
  const c = await call(`battles/${id}/comments`, "POST", {
    body: "Terrain gives the illusionist an opening.",
  });
  assert.equal(c.status, 201);
  assert.equal(
    (
      await call(
        `battles/${id}/comments`,
        "POST",
        { body: "The lantern reveals the route.", parent: c.body.id },
        bob,
      )
    ).status,
    201,
  );
  await call(`battles/${id}/follow`, "POST", {});
  const d = (await call(`battles/${id}`)).body;
  assert.equal(d.totals[0].count, 1);
  assert.equal(d.comments.length, 2);
  assert.equal(d.following, true);
  assert.equal((await call("profile")).body.following.length, 1);
});
test("concurrent vote attempts are protected by the database constraint", async () => {
  const { call } = setup();
  const {
    body: { id },
  } = await call("battles", "POST", battle);
  const r = await Promise.all(
    Array.from({ length: 8 }, () =>
      call(`battles/${id}/vote`, "POST", { choice: "left" }),
    ),
  );
  assert.equal(r.filter((x) => x.status === 201).length, 1);
  assert.equal((await call(`battles/${id}`)).body.totals[0].count, 1);
});
test("validation, origin and body limits reject bad input; SQL remains intact", async () => {
  const { call, sql } = setup();
  assert.equal(
    (await call("battles", "POST", battle, undefined, "https://evil.test"))
      .status,
    403,
  );
  assert.equal((await call("battles", "POST", {})).status, 400);
  assert.equal(
    (await call("battles", "POST", { ...battle, scenario: "x".repeat(9000) }))
      .status,
    413,
  );
  const title = "<img src=x onerror=alert(1)> '); DROP TABLE votes;--";
  const {
    body: { id },
  } = await call("battles", "POST", { ...battle, title });
  assert.equal((await call(`battles/${id}`)).body.battle.title, title);
  assert.ok(sql.prepare("SELECT COUNT(*) FROM votes").get());
  assert.equal(
    (await call(`battles/${id}/vote`, "POST", { choice: "wrong" })).status,
    400,
  );
});
test("account data is isolated and deletion cascades owned discussions", async () => {
  const { call, bob } = setup();
  await call("profile", "PUT", {
    name: "Alice",
    hero: { code: "01230", name: "Dawn" },
  });
  assert.equal(
    (await call("profile", "GET", undefined, bob)).body.profile.hero,
    null,
  );
  const {
    body: { id },
  } = await call("battles", "POST", battle);
  await call(`battles/${id}/vote`, "POST", { choice: "draw" }, bob);
  await call(
    `battles/${id}/comments`,
    "POST",
    { body: "A close battle." },
    bob,
  );
  assert.equal((await call("profile", "DELETE", {})).status, 200);
  assert.equal(
    (await call(`battles/${id}`, "GET", undefined, bob)).status,
    404,
  );
  assert.equal((await call("profile")).body.profile.hero, null);
});
test("moderation needs allowlisted identity and writes an audit entry", async () => {
  const { call, bob, sql } = setup();
  const {
    body: { id },
  } = await call("battles", "POST", battle);
  assert.equal(
    (
      await call(
        "reports",
        "POST",
        {
          kind: "battle",
          target: id,
          reason: "Personal information is present.",
        },
        bob,
      )
    ).status,
    201,
  );
  assert.equal((await call("admin")).status, 403);
  assert.equal(
    (await call("admin", "POST", { id: "wrong", action: "hide" })).status,
    403,
  );
  const mod = { id: "moderator", name: "Moderator" },
    r = (await call("admin", "GET", undefined, mod)).body.reports[0];
  assert.ok(r.content);
  await call("admin", "POST", { id: r.id, action: "hide" }, mod);
  assert.equal((await call(`battles/${id}`)).status, 404);
  assert.equal((sql.prepare("SELECT COUNT(*) n FROM audit").get() as any).n, 1);
});
test("blocking hides content in both directions and can be undone", async () => {
  const { call, bob } = setup();
  const {
    body: { id },
  } = await call("battles", "POST", battle);
  await call("blocks", "POST", { target: "alice" }, bob);
  assert.equal(
    (await call(`battles/${id}`, "GET", undefined, bob)).status,
    404,
  );
  assert.equal(
    (await call("battles", "GET", undefined, bob)).body.battles.length,
    0,
  );
  await call("blocks", "DELETE", { target: "alice" }, bob);
  assert.equal(
    (await call(`battles/${id}`, "GET", undefined, bob)).status,
    200,
  );
});
test("a real closed database returns safe 503 instead of a false success", async () => {
  const { db, sql } = setup();
  sql.close();
  const r = await handleApi(new Request("https://anime.test/api/health"), {
    db,
    user: null,
  });
  assert.equal(r.status, 503);
  assert.match(((await r.json()) as any).error, /temporarily unavailable/);
});
test("account write rate limit rejects request 31", async () => {
  const { call } = setup();
  let r;
  for (let i = 0; i < 31; i++)
    r = await call("profile", "PUT", { name: "Explorer" });
  assert.equal(r!.status, 429);
});
test("bad JSON, media type and cross-thread replies are rejected", async () => {
  const { db, call, alice } = setup();
  const req = (type: string, body: string) =>
    new Request("https://anime.test/api/profile", {
      method: "PUT",
      headers: { origin: "https://anime.test", "content-type": type },
      body,
    });
  assert.equal(
    (await handleApi(req("application/json", "{bad"), { db, user: alice }))
      .status,
    400,
  );
  assert.equal(
    (await handleApi(req("text/plain", "hello"), { db, user: alice })).status,
    415,
  );
  const {
    body: { id: a },
  } = await call("battles", "POST", battle);
  const {
    body: { id: b },
  } = await call("battles", "POST", battle);
  const c = await call(`battles/${a}/comments`, "POST", {
    body: "First argument.",
  });
  assert.equal(
    (
      await call(`battles/${b}/comments`, "POST", {
        body: "Wrong thread.",
        parent: c.body.id,
      })
    ).status,
    404,
  );
});

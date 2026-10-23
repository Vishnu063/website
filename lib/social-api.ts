import { dayKey } from "./game-content.ts";
import {
  account,
  admin,
  one,
  text,
  requireGame,
  award,
  notify,
  newRun,
  runById,
  type PlayContext,
} from "./play-core.ts";
import { initialCombat, combatView } from "./adventure-api.ts";
const seedPoll = {
  id: "founders-poll",
  owner: "ANIMEVERSE",
  question: "Which district should receive the next original story?",
  options: [
    "Moonlight Harbor",
    "Crystal Mountains",
    "Shadow District",
    "Spirit Forest",
  ],
  created: 0,
};
async function mutualBlock(c: PlayContext, target: string) {
  return !!(await one(
    c,
    "SELECT 1 FROM blocks WHERE (user=? AND target=?) OR (user=? AND target=?)",
    [c.uid, target, target, c.uid],
  ));
}
async function member(c: PlayContext, id: string) {
  return one(c, "SELECT * FROM clan_members WHERE clan=? AND user=?", [
    id,
    c.uid,
  ]);
}
async function clan(c: PlayContext, id: string) {
  const row = await one(c, "SELECT * FROM clans WHERE id=? AND archived=0", [
    id,
  ]);
  requireGame(row, 404, "Clan not found.");
  return row;
}
async function audit(c: PlayContext, action: string, target: string) {
  await c.db.run(
    "INSERT INTO audit(id,actor,action,target,created) VALUES(?,?,?,?,?)",
    [crypto.randomUUID(), c.uid, action, target, c.now],
  );
}
async function event(c: PlayContext, id: string) {
  const t = await one(c, "SELECT * FROM tournaments WHERE id=?", [id]);
  requireGame(t, 404, "Tournament not found.");
  return t;
}
async function reconcile(c: PlayContext, id: string) {
  let t = await event(c, id);
  if (t.status !== "active") return;
  // Scores are copied only from completed, server-resolved attempts owned by the entrant.
  await c.db.run(
    "UPDATE match_entries SET score=(SELECT r.score FROM game_runs r WHERE r.id=match_entries.run AND r.user=match_entries.user AND r.complete=1) WHERE match IN (SELECT id FROM matches WHERE tournament=?) AND score IS NULL",
    [id],
  );
  const rounds = await c.db.all(
    "SELECT * FROM matches WHERE tournament=? ORDER BY round,position",
    [id],
  );
  const round = Math.max(1, ...rounds.map((m) => m.round)),
    current = rounds.filter((m) => m.round === round);
  for (const m of current.filter((m) => m.status === "open")) {
    const entries = await c.db.all(
      "SELECT user,score FROM match_entries WHERE match=?",
      [m.id],
    );
    const l = entries.find((e) => e.user === m.left_user),
      r = entries.find((e) => e.user === m.right_user);
    if (l?.score != null && r?.score != null) {
      if (l.score === r.score) {
        await c.db.run(
          "UPDATE matches SET status='draw' WHERE id=? AND status='open'",
          [m.id],
        );
        continue;
      }
      const winner = l.score > r.score ? m.left_user : m.right_user;
      await c.db.run(
        "UPDATE matches SET winner=?,status='complete' WHERE id=? AND status='open'",
        [winner, m.id],
      );
    }
  }
  const final = await c.db.all(
    "SELECT * FROM matches WHERE tournament=? AND round=? ORDER BY position",
    [id, round],
  );
  if (final.length && final.every((m) => m.winner)) {
    if (final.length === 1) {
      const winner = final[0].winner;
      await c.db.run(
        "UPDATE tournaments SET status='finished',winner=? WHERE id=? AND status='active'",
        [winner, id],
      );
      await award({ ...c, uid: winner }, "tournament", "tournament:" + id, 150);
      await notify(
        c,
        winner,
        "achievement",
        "champion:" + id,
        `Tournament winner: ${t.name}`,
        "/events/" + id,
      );
    } else {
      const queries = [];
      for (let i = 0; i < final.length; i += 2) {
        const left = final[i].winner,
          right = final[i + 1]?.winner || null;
        queries.push({
          sql: "INSERT INTO matches(id,tournament,round,position,left_user,right_user,winner,status) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING",
          args: [
            `${id}:${round + 1}:${i / 2}`,
            id,
            round + 1,
            i / 2,
            left,
            right,
            right ? null : left,
            right ? "open" : "bye",
          ],
        });
      }
      await c.db.batch(queries);
    }
  } else if (c.now >= t.ends)
    await c.db.run(
      "UPDATE tournaments SET status='closed' WHERE id=? AND status='active'",
      [id],
    );
}
export async function socialRouter(c: PlayContext): Promise<any | undefined> {
  const { p, method, body } = c;
  if (p[0] === "clan-report" && method === "POST") {
    account(c);
    const group = await clan(c, text(body.id, 1, 80));
    const reason = text(body.reason, 5, 500);
    requireGame(
      !(await one(
        c,
        "SELECT 1 FROM reports WHERE user=? AND kind='clan' AND target=? AND status='open'",
        [c.uid, group.id],
      )),
      409,
      "You already reported this clan.",
    );
    await c.db.run(
      "INSERT INTO reports(id,user,kind,target,reason,status,created) VALUES(?,?,'clan',?,?,'open',?)",
      [crypto.randomUUID(), c.uid, group.id, reason, c.now],
    );
    return { reported: true };
  }
  if (p[0] === "poll-report" && method === "POST") {
    account(c);
    const poll = await one(c, "SELECT id FROM polls WHERE id=? AND hidden=0", [
      text(body.id, 1, 80),
    ]);
    requireGame(
      poll,
      404,
      "Only community-created polls can be reported here.",
    );
    const exists = await one(
      c,
      "SELECT 1 FROM reports WHERE user=? AND kind='poll' AND target=? AND status='open'",
      [c.uid, poll.id],
    );
    requireGame(!exists, 409, "You already reported this poll.");
    await c.db.run(
      "INSERT INTO reports(id,user,kind,target,reason,status,created) VALUES(?,?,'poll',?,?,'open',?)",
      [
        crypto.randomUUID(),
        c.uid,
        poll.id,
        "Please review this community poll for inappropriate content.",
        c.now,
      ],
    );
    return { reported: true };
  }
  if (p[0] === "settings") {
    account(c);
    const row = await one(c, "SELECT settings FROM game_players WHERE user=?", [
      c.uid,
    ]);
    const settings = JSON.parse(row.settings);
    if (method === "GET") return { settings };
    requireGame(method === "PUT", 405, "Method not allowed.");
    for (const key of [
      "notifications",
      "quest",
      "achievement",
      "tournament",
      "clan",
      "challenge",
      "story",
      "private",
    ])
      if (key in body) {
        requireGame(
          typeof body[key] === "boolean",
          400,
          "Preferences must be true or false.",
        );
        settings[key] = body[key];
      }
    const updated = await c.db.all(
      "UPDATE game_players SET settings=? WHERE user=? AND settings=? RETURNING user",
      [JSON.stringify(settings), c.uid, row.settings],
    );
    requireGame(
      updated.length,
      409,
      "Preferences changed in another tab. Reload and retry.",
    );
    return { settings };
  }
  if (p[0] === "notifications") {
    account(c);
    if (method === "GET")
      return {
        notifications: await c.db.all(
          "SELECT id,kind,title,href,read,created FROM notifications WHERE user=? ORDER BY created DESC LIMIT 100",
          [c.uid],
        ),
        invitations: await c.db.all(
          "SELECT i.id,i.kind,i.object,COALESCE(p.name,'Explorer') sender FROM invitations i LEFT JOIN profiles p ON p.id=i.sender WHERE i.target=? AND i.status='open' AND NOT EXISTS(SELECT 1 FROM blocks b WHERE (b.user=i.target AND b.target=i.sender) OR (b.user=i.sender AND b.target=i.target)) ORDER BY i.created DESC LIMIT 50",
          [c.uid],
        ),
      };
    requireGame(method === "POST", 405, "Method not allowed.");
    if (body.all === true)
      await c.db.run("UPDATE notifications SET read=1 WHERE user=?", [c.uid]);
    else
      await c.db.run("UPDATE notifications SET read=1 WHERE id=? AND user=?", [
        text(body.id, 1, 250),
        c.uid,
      ]);
    return { read: true };
  }
  if (p[0] === "invitations" && method === "POST") {
    account(c);
    const i = await one(
      c,
      "SELECT * FROM invitations WHERE id=? AND target=? AND status='open'",
      [text(p[1], 1, 80), c.uid],
    );
    requireGame(i, 404, "Invitation not found.");
    requireGame(
      !(await mutualBlock(c, i.sender)),
      403,
      "Invitation unavailable.",
    );
    requireGame(
      ["accept", "decline"].includes(body.action),
      400,
      "Choose accept or decline.",
    );
    if (body.action === "accept" && i.kind === "clan") {
      await clan(c, i.object);
      requireGame(
        !(await one(c, "SELECT 1 FROM clan_members WHERE user=?", [c.uid])),
        409,
        "Leave your current clan before accepting.",
      );
      await c.db.batch([
        {
          sql: "INSERT INTO clan_members(user,clan,role,joined) VALUES(?,?,'member',?)",
          args: [c.uid, i.object, c.now],
        },
        {
          sql: "UPDATE invitations SET status='accepted' WHERE id=? AND target=? AND status='open'",
          args: [i.id, c.uid],
        },
      ]);
    } else
      await c.db.run(
        "UPDATE invitations SET status=? WHERE id=? AND target=? AND status=?",
        [
          body.action === "accept" ? "accepted" : "declined",
          i.id,
          c.uid,
          "open",
        ],
      );
    if (body.action === "accept")
      await notify(
        c,
        i.sender,
        i.kind === "clan" ? "clan" : "challenge",
        "accepted:" + i.id,
        i.kind === "clan"
          ? "Your clan invitation was accepted."
          : "Your arena challenge was accepted.",
        i.kind === "clan" ? "/clans/" + i.object : "/challenges/" + i.id,
      );
    return {
      accepted: body.action === "accept",
      href: i.kind === "clan" ? "/clans/" + i.object : "/challenges/" + i.id,
    };
  }
  if (p[0] === "clans") {
    if (p.length === 1) {
      if (method === "GET")
        return {
          clans: await c.db.all(
            "SELECT c.id,c.name,c.bio,COUNT(m.user) members FROM clans c LEFT JOIN clan_members m ON m.clan=c.id WHERE c.archived=0 GROUP BY c.id,c.name,c.bio ORDER BY c.created DESC LIMIT 50",
          ),
          mine:
            (await one(c, "SELECT clan,role FROM clan_members WHERE user=?", [
              c.uid,
            ])) || null,
        };
      account(c);
      requireGame(method === "POST", 405, "Method not allowed.");
      requireGame(
        !(await one(c, "SELECT 1 FROM clan_members WHERE user=?", [c.uid])),
        409,
        "You already belong to a clan.",
      );
      const id = crypto.randomUUID(),
        name = text(body.name, 3, 40),
        bio = text(body.bio, 10, 500);
      await c.db.batch([
        {
          sql: "INSERT INTO clans(id,name,bio,owner,archived,created) VALUES(?,?,?,?,0,?)",
          args: [id, name, bio, c.uid, c.now],
        },
        {
          sql: "INSERT INTO clan_members(user,clan,role,joined) VALUES(?,?,'owner',?)",
          args: [c.uid, id, c.now],
        },
      ]);
      return { id };
    }
    const id = text(p[1], 1, 80),
      group = await clan(c, id),
      me = await member(c, id);
    if (method === "GET") {
      const xp = Number(
        (
          await one(
            c,
            "SELECT COALESCE(SUM(e.xp),0) xp FROM clan_members m JOIN game_events e ON e.user=m.user AND e.created>=m.joined WHERE m.clan=?",
            [id],
          )
        ).xp,
      );
      return {
        clan: group,
        membership: me || null,
        xp,
        achievements: [
          { name: "First constellation", unlocked: xp >= 100 },
          { name: "Together at dawn", unlocked: xp >= 500 },
        ],
        challenge: {
          name: "Earn 500 XP together after joining",
          xp,
          goal: 500,
          complete: xp >= 500,
        },
        members: await c.db.all(
          "SELECT g.public_id id,COALESCE(p.name,'Explorer') name,m.role,m.joined FROM clan_members m JOIN game_players g ON g.user=m.user LEFT JOIN profiles p ON p.id=m.user WHERE m.clan=? ORDER BY m.joined",
          [id],
        ),
      };
    }
    account(c);
    requireGame(method === "POST", 405, "Method not allowed.");
    if (p[2] === "join") {
      requireGame(
        !(await one(c, "SELECT 1 FROM clan_members WHERE user=?", [c.uid])),
        409,
        "You already belong to a clan.",
      );
      requireGame(
        !(await mutualBlock(c, group.owner)),
        403,
        "This clan is unavailable.",
      );
      await c.db.run(
        "INSERT INTO clan_members(user,clan,role,joined) SELECT ?,?,'member',? WHERE EXISTS(SELECT 1 FROM clans WHERE id=? AND archived=0)",
        [c.uid, id, c.now, id],
      );
      return { joined: true };
    }
    if (p[2] === "leave") {
      requireGame(me, 403, "You are not a member.");
      requireGame(
        group.owner !== c.uid,
        400,
        "Transfer ownership or disband your clan before leaving.",
      );
      await c.db.run(
        "DELETE FROM clan_members WHERE user=? AND clan=? AND NOT EXISTS(SELECT 1 FROM clans WHERE id=? AND owner=?)",
        [c.uid, id, id, c.uid],
      );
      return { left: true };
    }
    if (p[2] === "invite") {
      requireGame(
        me && ["owner", "officer"].includes(me.role),
        403,
        "Clan owner or officer access required.",
      );
      const target = await one(
        c,
        "SELECT user FROM game_players WHERE public_id=? AND user NOT LIKE 'guest:%'",
        [text(body.player, 1, 80)],
      );
      requireGame(target && target.user !== c.uid, 404, "Player not found.");
      requireGame(
        !(await mutualBlock(c, target.user)),
        403,
        "Invitation unavailable.",
      );
      requireGame(
        !(await one(
          c,
          "SELECT 1 FROM invitations WHERE sender=? AND target=? AND kind='clan' AND object=? AND status='open'",
          [c.uid, target.user, id],
        )),
        409,
        "An invitation is already pending.",
      );
      const invite = crypto.randomUUID();
      await c.db.run(
        "INSERT INTO invitations(id,sender,target,kind,object,status,created) SELECT ?,?,?,'clan',?,'open',? WHERE EXISTS(SELECT 1 FROM clan_members WHERE user=? AND clan=? AND role IN ('owner','officer'))",
        [invite, c.uid, target.user, id, c.now, c.uid, id],
      );
      await notify(
        c,
        target.user,
        "clan",
        "invite:" + invite,
        `You’re invited to ${group.name}`,
        "/notifications",
      );
      return { invited: true };
    }
    requireGame(group.owner === c.uid, 403, "Clan owner access required.");
    if (p[2] === "disband") {
      await c.db.batch([
        {
          sql: "UPDATE clans SET archived=1 WHERE id=? AND owner=?",
          args: [id, c.uid],
        },
        {
          sql: "DELETE FROM clan_members WHERE clan=? AND EXISTS(SELECT 1 FROM clans WHERE id=? AND owner=? AND archived=1)",
          args: [id, id, c.uid],
        },
        {
          sql: "UPDATE invitations SET status='expired' WHERE kind='clan' AND object=? AND EXISTS(SELECT 1 FROM clans WHERE id=? AND owner=? AND archived=1)",
          args: [id, id, c.uid],
        },
      ]);
      await audit(c, "clan_disband", id);
      return { disbanded: true };
    }
    const target = await one(
      c,
      "SELECT m.user,m.role FROM clan_members m JOIN game_players g ON g.user=m.user WHERE g.public_id=? AND m.clan=?",
      [text(body.player, 1, 80), id],
    );
    requireGame(
      target && target.user !== c.uid,
      400,
      "Choose another member of your clan.",
    );
    if (p[2] === "transfer") {
      await c.db.batch([
        {
          sql: "UPDATE clans SET owner=? WHERE id=? AND owner=? AND archived=0 AND EXISTS(SELECT 1 FROM clan_members WHERE user=? AND clan=?)",
          args: [target.user, id, c.uid, target.user, id],
        },
        {
          sql: "UPDATE clan_members SET role='member' WHERE user=? AND clan=? AND EXISTS(SELECT 1 FROM clans WHERE id=? AND owner=?)",
          args: [c.uid, id, id, target.user],
        },
        {
          sql: "UPDATE clan_members SET role='owner' WHERE user=? AND clan=? AND EXISTS(SELECT 1 FROM clans WHERE id=? AND owner=?)",
          args: [target.user, id, id, target.user],
        },
      ]);
    } else if (p[2] === "role") {
      requireGame(
        ["member", "officer"].includes(body.role),
        400,
        "Choose member or officer.",
      );
      await c.db.run(
        "UPDATE clan_members SET role=? WHERE user=? AND clan=? AND EXISTS(SELECT 1 FROM clans WHERE id=? AND owner=? AND archived=0)",
        [body.role, target.user, id, id, c.uid],
      );
    } else if (p[2] === "remove")
      await c.db.run(
        "DELETE FROM clan_members WHERE user=? AND clan=? AND EXISTS(SELECT 1 FROM clans WHERE id=? AND owner=? AND archived=0)",
        [target.user, id, id, c.uid],
      );
    else requireGame(false, 404, "Clan action not found.");
    await audit(c, "clan_" + p[2], id);
    return { updated: true };
  }
  if (p[0] === "events") {
    if (p.length === 1) {
      if (method === "GET")
        return {
          events: await c.db.all(
            "SELECT t.*,(SELECT COUNT(*) FROM tournament_entries e WHERE e.tournament=t.id) entrants FROM tournaments t ORDER BY t.starts DESC LIMIT 40",
          ),
          admin: !c.guest && c.admins.includes(c.uid),
        };
      admin(c);
      requireGame(method === "POST", 405, "Method not allowed.");
      const name = text(body.name, 5, 80),
        starts = Date.parse(body.starts),
        ends = Date.parse(body.ends);
      requireGame(
        Number.isFinite(starts) &&
          Number.isFinite(ends) &&
          starts > c.now &&
          ends > starts + 3600000 &&
          ends < starts + 30 * 86400000,
        400,
        "Choose a future start and an end between one hour and 30 days later.",
      );
      const id = crypto.randomUUID();
      await c.db.run(
        "INSERT INTO tournaments(id,name,starts,ends,status,created) VALUES(?,?,?,?,'registration',?)",
        [id, name, starts, ends, c.now],
      );
      await audit(c, "tournament_create", id);
      return { id };
    }
    const id = text(p[1], 1, 80);
    await reconcile(c, id);
    let t = await event(c, id);
    if (method === "GET")
      return {
        event: { ...t, winner: !!t.winner },
        joined: !!(await one(
          c,
          "SELECT 1 FROM tournament_entries WHERE tournament=? AND user=?",
          [id, c.uid],
        )),
        entries: await c.db.all(
          "SELECT g.public_id id,COALESCE(p.name,'Explorer') name,e.slot FROM tournament_entries e JOIN game_players g ON g.user=e.user LEFT JOIN profiles p ON p.id=e.user WHERE e.tournament=? ORDER BY e.slot",
          [id],
        ),
        matches: await c.db.all(
          "SELECT m.id,m.round,m.position,m.status,COALESCE(lp.name,'Explorer') left_name,COALESCE(rp.name,'Explorer') right_name,COALESCE(wp.name,'Explorer') winner_name,CASE WHEN m.winner IS NOT NULL THEN 1 ELSE 0 END winner,CASE WHEN m.left_user=? OR m.right_user=? THEN 1 ELSE 0 END mine,(SELECT score FROM match_entries WHERE match=m.id AND user=?) my_score FROM matches m LEFT JOIN profiles lp ON lp.id=m.left_user LEFT JOIN profiles rp ON rp.id=m.right_user LEFT JOIN profiles wp ON wp.id=m.winner WHERE m.tournament=? ORDER BY m.round,m.position",
          [c.uid, c.uid, c.uid, id],
        ),
        admin: !c.guest && c.admins.includes(c.uid),
      };
    account(c);
    requireGame(method === "POST", 405, "Method not allowed.");
    if (p[2] === "register") {
      requireGame(
        t.status === "registration" && c.now < t.starts,
        400,
        "Registration is closed.",
      );
      if (
        await one(
          c,
          "SELECT 1 FROM tournament_entries WHERE tournament=? AND user=?",
          [id, c.uid],
        )
      )
        return { registered: true };
      let joined = false;
      for (let slot = 1; slot <= 16; slot++) {
        const added = await c.db.all(
          "INSERT INTO tournament_entries(tournament,user,slot,created) SELECT ?,?,?,? WHERE EXISTS(SELECT 1 FROM tournaments WHERE id=? AND status='registration' AND starts>?) ON CONFLICT DO NOTHING RETURNING user",
          [id, c.uid, slot, c.now, id, c.now],
        );
        if (added.length) {
          joined = true;
          break;
        }
      }
      requireGame(
        joined,
        409,
        "This tournament is full or registration closed.",
      );
      await notify(
        c,
        c.uid,
        "tournament",
        "registered:" + id,
        `You’re registered: ${t.name}`,
        "/events/" + id,
      );
      return { registered: true };
    }
    if (p[2] === "withdraw") {
      requireGame(
        t.status === "registration" && c.now < t.starts,
        400,
        "Registration is closed.",
      );
      await c.db.run(
        "DELETE FROM tournament_entries WHERE tournament=? AND user=?",
        [id, c.uid],
      );
      return { withdrawn: true };
    }
    if (p[2] === "start") {
      requireGame(
        c.admins.includes(c.uid) ||
          (await one(
            c,
            "SELECT 1 FROM tournament_entries WHERE tournament=? AND user=?",
            [id, c.uid],
          )),
        403,
        "Participant or administrator access required.",
      );
      requireGame(
        t.status === "registration" && c.now >= t.starts && c.now < t.ends,
        400,
        "This tournament cannot start now.",
      );
      const entries = await c.db.all(
        "SELECT user FROM tournament_entries WHERE tournament=? ORDER BY slot",
        [id],
      );
      requireGame(
        entries.length >= 2,
        400,
        "At least two real entrants are required.",
      );
      const q = [
        {
          sql: "UPDATE tournaments SET status='active' WHERE id=? AND status='registration'",
          args: [id],
        },
      ];
      for (let i = 0; i < entries.length; i += 2) {
        const l = entries[i].user,
          r = entries[i + 1]?.user || null;
        q.push({
          sql: "INSERT INTO matches(id,tournament,round,position,left_user,right_user,winner,status) VALUES(?,?,1,?,?,?,?,?) ON CONFLICT DO NOTHING",
          args: [
            `${id}:1:${i / 2}`,
            id,
            i / 2,
            l,
            r,
            r ? null : l,
            r ? "open" : "bye",
          ],
        });
      }
      await c.db.batch(q);
      for (const e of entries)
        await notify(
          c,
          e.user,
          "tournament",
          "started:" + id,
          `${t.name} has begun`,
          "/events/" + id,
        );
      return { started: true };
    }
    if (p[2] === "cancel") {
      admin(c);
      requireGame(
        t.status !== "finished",
        400,
        "A completed tournament keeps its result.",
      );
      await c.db.run("UPDATE tournaments SET status='cancelled' WHERE id=?", [
        id,
      ]);
      await audit(c, "tournament_cancel", id);
      return { cancelled: true };
    }
    if (p[2] === "replay") {
      admin(c);
      const m = await one(
        c,
        "SELECT * FROM matches WHERE id=? AND tournament=? AND status='draw'",
        [text(body.match, 1, 100), id],
      );
      requireGame(
        m && t.status === "active" && c.now < t.ends,
        400,
        "Only an active drawn match can be replayed.",
      );
      await c.db.batch([
        {
          sql: "UPDATE matches SET status='replaying',replay=replay+1 WHERE id=? AND status='draw' AND replay=?",
          args: [m.id, m.replay],
        },
        {
          sql: "DELETE FROM match_entries WHERE match=? AND EXISTS(SELECT 1 FROM matches WHERE id=? AND status='replaying' AND replay=?)",
          args: [m.id, m.id, m.replay + 1],
        },
        {
          sql: "UPDATE game_runs SET slot=NULL WHERE kind='combat' AND slot=? AND EXISTS(SELECT 1 FROM matches WHERE id=? AND status='replaying' AND replay=?)",
          args: ["match:" + m.id, m.id, m.replay + 1],
        },
        {
          sql: "UPDATE matches SET status='open' WHERE id=? AND status='replaying' AND replay=?",
          args: [m.id, m.replay + 1],
        },
      ]);
      await audit(c, "tournament_replay", m.id);
      return { replay: true };
    }
    if (p[2] === "play") {
      requireGame(
        t.status === "active" && c.now < t.ends,
        400,
        "This competition is not active.",
      );
      const m = await one(
        c,
        "SELECT * FROM matches WHERE id=? AND tournament=? AND status='open' AND (left_user=? OR right_user=?)",
        [text(body.match, 1, 100), id, c.uid, c.uid],
      );
      requireGame(m, 403, "This is not your open match.");
      const entry = await one(
        c,
        "SELECT run FROM match_entries WHERE match=? AND user=?",
        [m.id, c.uid],
      );
      if (entry) return combatView(await runById(c, entry.run, "combat"));
      const state = initialCombat("akira", m.id + ":replay:" + m.replay);
      state.match = m.id;
      const r = await newRun(c, "combat", state);
      await c.db.run(
        "INSERT INTO match_entries(match,user,run) VALUES(?,?,?) ON CONFLICT DO NOTHING",
        [m.id, c.uid, r.id],
      );
      return combatView(r);
    }
  }
  if (p[0] === "challenges") {
    account(c);
    if (p.length === 1 && method === "POST") {
      const target = await one(
        c,
        "SELECT user FROM game_players WHERE public_id=? AND user NOT LIKE 'guest:%'",
        [text(body.player, 1, 80)],
      );
      requireGame(
        target && target.user !== c.uid,
        400,
        "Choose another signed-in player.",
      );
      requireGame(
        !(await mutualBlock(c, target.user)),
        403,
        "Challenge unavailable.",
      );
      const id = crypto.randomUUID();
      await c.db.run(
        "INSERT INTO invitations(id,sender,target,kind,object,status,created) VALUES(?,?,?,'challenge',?,'open',?)",
        [id, c.uid, target.user, id, c.now],
      );
      await notify(
        c,
        target.user,
        "challenge",
        "challenge:" + id,
        "A friend challenged you to a shared arena encounter.",
        "/notifications",
      );
      return { id };
    }
    const i = await one(
      c,
      "SELECT * FROM invitations WHERE id=? AND kind='challenge' AND (sender=? OR target=?)",
      [text(p[1], 1, 80), c.uid, c.uid],
    );
    requireGame(i, 404, "Challenge not found.");
    requireGame(
      !(await mutualBlock(c, i.sender === c.uid ? i.target : i.sender)),
      403,
      "Challenge unavailable.",
    );
    if (method === "GET")
      return {
        challenge: { id: i.id, status: i.status },
        results: await c.db.all(
          "SELECT g.public_id id,COALESCE(p.name,'Explorer') name,r.complete,r.score FROM game_runs r JOIN game_players g ON g.user=r.user LEFT JOIN profiles p ON p.id=r.user WHERE r.slot=? AND (r.user=? OR r.user=?)",
          ["challenge:" + i.id, i.sender, i.target],
        ),
      };
    requireGame(
      method === "POST" && i.status === "accepted",
      400,
      "The recipient must accept before playing.",
    );
    const existing = await one(
      c,
      "SELECT id FROM game_runs WHERE user=? AND kind='combat' AND slot=?",
      [c.uid, "challenge:" + i.id],
    );
    if (existing) return combatView(await runById(c, existing.id, "combat"));
    const state = initialCombat("akira", i.id);
    state.match = "challenge:" + i.id;
    return combatView(await newRun(c, "combat", state));
  }
  if (p[0] === "polls") {
    const stored = await c.db.all(
      "SELECT p.*,COALESCE(a.name,'Explorer') author FROM polls p LEFT JOIN profiles a ON a.id=p.owner WHERE p.hidden=0 AND NOT EXISTS(SELECT 1 FROM blocks b WHERE (b.user=? AND b.target=p.owner) OR (b.target=? AND b.user=p.owner)) ORDER BY p.created DESC LIMIT 30",
      [c.uid, c.uid],
    );
    const polls = [
      seedPoll,
      ...stored.map((p) => ({ ...p, options: JSON.parse(p.options) })),
    ];
    if (method === "GET") {
      const list = [];
      for (const poll of polls)
        list.push({
          ...poll,
          totals: await c.db.all(
            "SELECT choice,COUNT(*) count FROM poll_votes WHERE poll=? GROUP BY choice",
            [poll.id],
          ),
          myVote:
            (
              await one(
                c,
                "SELECT choice FROM poll_votes WHERE poll=? AND user=?",
                [poll.id, c.uid],
              )
            )?.choice ?? null,
        });
      return { polls: list };
    }
    account(c);
    requireGame(method === "POST", 405, "Method not allowed.");
    if (p[1] === "create") {
      const question = text(body.question, 8, 180);
      requireGame(
        Array.isArray(body.options) &&
          body.options.length >= 2 &&
          body.options.length <= 4,
        400,
        "Provide two to four options.",
      );
      const options = body.options.map((o: unknown) => text(o, 1, 70));
      requireGame(
        new Set(options).size === options.length,
        400,
        "Options must be different.",
      );
      const id = crypto.randomUUID();
      await c.db.run(
        "INSERT INTO polls(id,owner,question,options,created) VALUES(?,?,?,?,?)",
        [id, c.uid, question, JSON.stringify(options), c.now],
      );
      return { id };
    }
    if (p[2] === "hide") {
      const poll = await one(c, "SELECT owner FROM polls WHERE id=?", [p[1]]);
      requireGame(
        poll && (poll.owner === c.uid || c.admins.includes(c.uid)),
        403,
        "Author or moderator access required.",
      );
      await c.db.run("UPDATE polls SET hidden=1 WHERE id=?", [p[1]]);
      await audit(c, "poll_hide", p[1]);
      return { hidden: true };
    }
    const poll = polls.find((p) => p.id === p[1]);
    requireGame(poll, 404, "Poll not found.");
    requireGame(
      Number.isInteger(body.choice) &&
        body.choice >= 0 &&
        body.choice < poll!.options.length,
      400,
      "Choose a valid option.",
    );
    await c.db.run(
      "INSERT INTO poll_votes(poll,user,choice,created) VALUES(?,?,?,?) ON CONFLICT DO NOTHING",
      [poll!.id, c.uid, body.choice, c.now],
    );
    await award(c, "poll", "poll:" + dayKey(c.now), 5);
    return { voted: true };
  }
  return undefined;
}

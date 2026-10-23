"use client";
import { useState } from "react";
import {
  playApi,
  PlayPage,
  usePlay,
  useAction,
  LoadState,
} from "./play-common";
import { signin, type Tell } from "./core";
export function Clans({ id, tell }: { id?: string; tell: Tell }) {
  const { data, error, load } = usePlay(id ? "clans/" + id : "clans"),
    { busy, act } = useAction(tell),
    [name, setName] = useState(""),
    [bio, setBio] = useState(""),
    [player, setPlayer] = useState(""),
    [reason, setReason] = useState("");
  const action = (verb: string, extra: any = {}) =>
    act(async () => {
      const out = await playApi(`clans/${id}/${verb}`, "POST", extra);
      if (out.disbanded) location.href = "/clans";
      else load();
    });
  return (
    <PlayPage
      title={data?.clan?.name || "Find your people."}
      eyebrow="ANIME CLANS"
    >
      {!data ? (
        <LoadState error={error} load={load} />
      ) : !id ? (
        <>
          <p>
            Create an open clan or join one. You can belong to one clan at a
            time. Clan XP counts members’ actual activity after joining.
          </p>
          {data.mine && (
            <a className="btn primary" href={"/clans/" + data.mine.clan}>
              Open my clan
            </a>
          )}
          <div className="play-grid">
            {data.clans.map((c: any) => (
              <a href={"/clans/" + c.id} className="play-tile" key={c.id}>
                <h2>{c.name}</h2>
                <p>{c.bio}</p>
                <small>{c.members} real members</small>
              </a>
            ))}
          </div>
          {!data.clans.length && (
            <div className="play-empty">
              <h2>A constellation starts with one star.</h2>
              <p>No clans yet. Start one with a name and a purpose.</p>
            </div>
          )}
          <form
            className="play-panel"
            onSubmit={(e) => {
              e.preventDefault();
              act(async () => {
                const c = await playApi("clans", "POST", { name, bio });
                location.href = "/clans/" + c.id;
              });
            }}
          >
            <h2>Create a clan</h2>
            <label>
              Clan name
              <input
                required
                minLength={3}
                maxLength={40}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              What brings your clan together?
              <textarea
                required
                minLength={10}
                maxLength={500}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </label>
            <button disabled={busy || !!data.mine} className="btn primary">
              Create clan
            </button>
            <p>Sign in to create or join a clan.</p>
          </form>
        </>
      ) : (
        <>
          <div className="play-panel">
            <p>{data.clan.bio}</p>
            <h2>{data.xp} clan XP</h2>
            <p>{data.challenge.name}</p>
            <progress
              max={data.challenge.goal}
              value={Math.min(data.xp, data.challenge.goal)}
              aria-label="Clan challenge progress"
            />
            <p>
              {data.challenge.complete
                ? "Together at dawn achievement earned."
                : "Every member’s earned XP brings you closer."}
            </p>
            {data.membership ? (
              <>
                <span>My role: {data.membership.role}</span>
                {data.membership.role !== "owner" && (
                  <button
                    className="btn glass"
                    disabled={busy}
                    onClick={() => action("leave")}
                  >
                    Leave clan
                  </button>
                )}
              </>
            ) : (
              <button
                className="btn primary"
                disabled={busy}
                onClick={() => action("join")}
              >
                Join this clan
              </button>
            )}
          </div>
          <details className="play-panel">
            <summary>Report this clan</summary>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                act(async () => {
                  await playApi("clan-report", "POST", { id, reason });
                  setReason("");
                  tell("Your report was sent to moderators.");
                });
              }}
            >
              <label>
                Reason
                <textarea
                  required
                  minLength={5}
                  maxLength={500}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
              <button disabled={busy} className="btn glass">
                Send report
              </button>
            </form>
          </details>
          <h2>The constellation</h2>
          <div className="play-list">
            {data.members.map((m: any) => (
              <div key={m.id}>
                <a href={"/players/" + m.id}>{m.name}</a>
                <span>{m.role}</span>
                {data.membership?.role === "owner" && m.role !== "owner" && (
                  <div>
                    <button
                      className="inline-link"
                      disabled={busy}
                      onClick={() =>
                        action("role", {
                          player: m.id,
                          role: m.role === "officer" ? "member" : "officer",
                        })
                      }
                    >
                      {m.role === "officer" ? "Make member" : "Make officer"}
                    </button>
                    <button
                      className="inline-link"
                      disabled={busy}
                      onClick={() => action("transfer", { player: m.id })}
                    >
                      Transfer ownership
                    </button>
                    <button
                      className="inline-link"
                      disabled={busy}
                      onClick={() => action("remove", { player: m.id })}
                    >
                      Remove member
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {["owner", "officer"].includes(data.membership?.role) && (
            <form
              className="play-panel"
              onSubmit={(e) => {
                e.preventDefault();
                action("invite", { player });
              }}
            >
              <h2>Invite someone</h2>
              <label>
                Public player code
                <input
                  required
                  value={player}
                  onChange={(e) => setPlayer(e.target.value)}
                  maxLength={80}
                />
              </label>
              <button className="btn primary" disabled={busy}>
                Send in-app invitation
              </button>
            </form>
          )}
          {data.membership?.role === "owner" && (
            <details className="play-panel">
              <summary>Clan ownership controls</summary>
              <p>
                Disbanding archives the clan and frees its members to join
                another. Clan history is retained.
              </p>
              <button
                className="btn glass"
                disabled={busy}
                onClick={() => action("disband")}
              >
                Archive and disband clan
              </button>
            </details>
          )}
        </>
      )}
    </PlayPage>
  );
}
export function Events({ id, tell }: { id?: string; tell: Tell }) {
  const { data, error, load } = usePlay(id ? "events/" + id : "events"),
    { busy, act } = useAction(tell),
    [name, setName] = useState(""),
    [starts, setStarts] = useState(""),
    [ends, setEnds] = useState("");
  const action = (verb: string, body: any = {}) =>
    act(async () => {
      const out = await playApi(`events/${id}/${verb}`, "POST", body);
      if (verb === "play") location.href = "/combat/" + out.id;
      else load();
    });
  return (
    <PlayPage
      title={data?.event?.name || "A stage for real rivals."}
      eyebrow="PLAYER TOURNAMENTS"
    >
      <p>
        Asynchronous single-elimination brackets, up to 16 real entrants. Both
        rivals face the same seeded AI with Akira. Highest server-calculated
        combat score advances. Exact ties require an administrator-authorized
        replay. Byes are labeled; unfinished brackets close without inventing a
        winner.
      </p>
      {!data ? (
        <LoadState error={error} load={load} />
      ) : !id ? (
        <>
          <div className="play-grid">
            {data.events.map((t: any) => (
              <a className="play-tile" href={"/events/" + t.id} key={t.id}>
                <span className="eyebrow">{t.status}</span>
                <h2>{t.name}</h2>
                <p>{new Date(t.starts).toLocaleString()}</p>
                <small>{t.entrants} / 16 real entrants</small>
              </a>
            ))}
          </div>
          {!data.events.length && (
            <div className="play-empty">
              <h2>The arena is quiet for now.</h2>
              <p>
                No tournaments have been scheduled. Practice while the next
                competition takes shape.
              </p>
              <a className="btn primary" href="/combat">
                Practice an encounter
              </a>
            </div>
          )}
          {data.admin && (
            <form
              className="play-panel"
              onSubmit={(e) => {
                e.preventDefault();
                act(async () => {
                  const out = await playApi("events", "POST", {
                    name,
                    starts: new Date(starts).toISOString(),
                    ends: new Date(ends).toISOString(),
                  });
                  location.href = "/events/" + out.id;
                });
              }}
            >
              <h2>Schedule a tournament</h2>
              <label>
                Name
                <input
                  required
                  minLength={5}
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label>
                Start · your local time
                <input
                  type="datetime-local"
                  required
                  value={starts}
                  onChange={(e) => setStarts(e.target.value)}
                />
              </label>
              <label>
                End · your local time
                <input
                  type="datetime-local"
                  required
                  value={ends}
                  onChange={(e) => setEnds(e.target.value)}
                />
              </label>
              <button disabled={busy} className="btn primary">
                Create tournament
              </button>
            </form>
          )}
        </>
      ) : (
        <>
          <div className="play-panel">
            <span className="eyebrow">{data.event.status}</span>
            <p>
              Opens {new Date(data.event.starts).toLocaleString()} · Ends{" "}
              {new Date(data.event.ends).toLocaleString()}
            </p>
            {data.event.status === "registration" &&
            Date.now() < data.event.starts ? (
              <button
                className="btn primary"
                disabled={busy}
                onClick={() => action(data.joined ? "withdraw" : "register")}
              >
                {data.joined ? "Withdraw registration" : "Register for free"}
              </button>
            ) : data.event.status === "registration" &&
              (data.joined || data.admin) ? (
              <button
                className="btn primary"
                disabled={busy}
                onClick={() => action("start")}
              >
                Refresh scheduled opening
              </button>
            ) : null}
            <button className="btn glass" disabled={busy} onClick={load}>
              Refresh results
            </button>
            {data.admin && data.event.status !== "finished" && (
              <button
                className="btn glass"
                disabled={busy}
                onClick={() => action("cancel")}
              >
                Cancel competition
              </button>
            )}
            <p>
              {data.event.status === "insufficient"
                ? "Fewer than two real players registered before opening. No bracket or winner was created."
                : data.event.status === "finished"
                  ? "A champion has earned 150 XP. See the final bracket result below."
                  : data.event.status === "closed"
                    ? "The time window ended before a complete result. No champion was fabricated."
                    : "All match results come from saved, server-resolved encounters."}
            </p>
          </div>
          <h2>Registered players</h2>
          <div className="play-list">
            {data.entries.map((e: any) => (
              <div key={e.id}>
                <a href={"/players/" + e.id}>{e.name}</a>
                <small>Seed {e.slot}</small>
              </div>
            ))}
          </div>
          <h2>Bracket</h2>
          <div className="play-grid">
            {data.matches.map((m: any) => (
              <div className="play-tile" key={m.id}>
                <span className="eyebrow">
                  ROUND {m.round} · {m.status}
                </span>
                <h2>
                  {m.left_name}
                  <br />
                  <small>versus</small>
                  <br />
                  {m.status === "bye" ? "Open bracket slot" : m.right_name}
                </h2>
                {m.winner && (
                  <p>
                    {m.status === "bye" ? "Advances by bye" : "Winner"}:{" "}
                    {m.winner_name}
                  </p>
                )}
                {m.my_score != null && <p>Your score: {m.my_score}</p>}
                {m.mine === 1 && m.status === "open" && (
                  <button
                    disabled={busy}
                    className="btn primary"
                    onClick={() => action("play", { match: m.id })}
                  >
                    Play my encounter
                  </button>
                )}
                {data.admin && m.status === "draw" && (
                  <button
                    disabled={busy}
                    className="btn glass"
                    onClick={() => action("replay", { match: m.id })}
                  >
                    Authorize tie replay
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </PlayPage>
  );
}
export function Notifications({ tell }: { tell: Tell }) {
  const list = usePlay("notifications"),
    prefs = usePlay("settings"),
    { busy, act } = useAction(tell);
  return (
    <PlayPage title="Your world, caught up." eyebrow="NOTIFICATION CENTER">
      {!list.data ? (
        <>
          <LoadState error={list.error} load={list.load} />
          {list.error && (
            <a
              className="btn primary"
              href={signin("/notifications")}
              target="_top"
            >
              Sign in to open notifications
            </a>
          )}
        </>
      ) : (
        <>
          <div className="game-top">
            <span>
              {list.data.notifications.filter((n: any) => !n.read).length}{" "}
              unread
            </span>
            <button
              disabled={busy}
              className="inline-link"
              onClick={() =>
                act(async () => {
                  await playApi("notifications", "POST", { all: true });
                  list.load();
                })
              }
            >
              Mark all as read
            </button>
          </div>
          <div className="play-list">
            {list.data.notifications.map((n: any) => (
              <div key={n.id} className={n.read ? "" : "unread"}>
                <a href={n.href}>
                  {!n.read && "● "}
                  {n.title}
                </a>
                <small>{new Date(n.created).toLocaleString()}</small>
                {!n.read && (
                  <button
                    disabled={busy}
                    className="inline-link"
                    onClick={() =>
                      act(async () => {
                        await playApi("notifications", "POST", { id: n.id });
                        list.load();
                      })
                    }
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
          {!list.data.notifications.length && (
            <div className="play-empty">
              <h2>Nothing pulling at your sleeve.</h2>
              <p>
                Quest rewards, invitations and story milestones will appear
                here.
              </p>
            </div>
          )}
          {list.data.invitations.length > 0 && (
            <div className="play-panel">
              <h2>Your invitations</h2>
              {list.data.invitations.map((i: any) => (
                <div className="game-top" key={i.id}>
                  <span>
                    {i.sender} ·{" "}
                    {i.kind === "clan" ? "Clan invitation" : "Arena challenge"}
                  </span>
                  <div>
                    {["accept", "decline"].map((action) => (
                      <button
                        key={action}
                        disabled={busy}
                        className="btn glass"
                        onClick={() =>
                          act(async () => {
                            const out = await playApi(
                              "invitations/" + i.id,
                              "POST",
                              { action },
                            );
                            if (out.accepted) location.href = out.href;
                            else list.load();
                          })
                        }
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {prefs.data && (
            <div className="play-panel">
              <h2>Only the updates you want</h2>
              {[
                "notifications",
                "quest",
                "achievement",
                "tournament",
                "clan",
                "challenge",
                "story",
                "private",
              ].map((key) => (
                <label className="preference-check" key={key}>
                  <input
                    type="checkbox"
                    checked={
                      key === "private"
                        ? !!prefs.data.settings[key]
                        : prefs.data.settings[key] !== false
                    }
                    disabled={busy}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      act(async () => {
                        await playApi("settings", "PUT", { [key]: checked });
                        prefs.load();
                      });
                    }}
                  />
                  {key === "private"
                    ? "Keep my game profile off public rankings"
                    : key === "notifications"
                      ? "Enable in-app notifications"
                      : `${key[0].toUpperCase() + key.slice(1)} updates`}
                </label>
              ))}
              <p>External email and push notifications are not enabled.</p>
            </div>
          )}
        </>
      )}
    </PlayPage>
  );
}
export function FriendChallenge({ id, tell }: { id: string; tell: Tell }) {
  const { data, error, load } = usePlay("challenges/" + id),
    { busy, act } = useAction(tell);
  return (
    <PlayPage title="Same rival. Different choices." eyebrow="FRIEND CHALLENGE">
      {!data ? (
        <LoadState error={error} load={load} />
      ) : (
        <div className="play-panel">
          <p>
            Both players use Akira against the same seeded opponent. The higher
            saved combat score wins the comparison; equal scores are a draw. No
            XP is awarded for friend challenges.
          </p>
          <p>Status: {data.challenge.status}</p>
          {data.challenge.status === "accepted" && (
            <button
              className="btn primary"
              disabled={busy}
              onClick={() =>
                act(async () => {
                  const run = await playApi("challenges/" + id, "POST", {});
                  location.href = "/combat/" + run.id;
                })
              }
            >
              Play my encounter
            </button>
          )}
          <button className="btn glass" onClick={load}>
            Refresh comparison
          </button>
          <div className="play-list">
            {data.results.map((r: any) => (
              <div key={r.id}>
                <span>{r.name}</span>
                <b>{r.complete ? r.score + " points" : "In progress"}</b>
              </div>
            ))}
          </div>
          <small>
            Challenge link:{" "}
            {typeof window !== "undefined"
              ? window.location.href
              : "/challenges/" + id}
          </small>
        </div>
      )}
    </PlayPage>
  );
}
export function Polls({ tell }: { tell: Tell }) {
  const { data, error, load } = usePlay("polls"),
    { busy, act } = useAction(tell),
    [question, setQuestion] = useState(""),
    [options, setOptions] = useState("");
  return (
    <PlayPage title="A universe shaped by its fans." eyebrow="COMMUNITY POLLS">
      {!data ? (
        <LoadState error={error} load={load} />
      ) : (
        <div className="play-grid">
          {data.polls.map((p: any) => (
            <div key={p.id} className="play-tile">
              <span className="eyebrow">
                {p.id === "founders-poll"
                  ? "ANIMEVERSE EDITORIAL POLL"
                  : "FAN-CREATED POLL"}
              </span>
              <h2>{p.question}</h2>
              <p>Voting represents fan opinion.</p>
              {p.options.map((option: string, i: number) => {
                const count =
                    p.totals.find((t: any) => t.choice === i)?.count || 0,
                  total = p.totals.reduce(
                    (n: number, t: any) => n + t.count,
                    0,
                  );
                return (
                  <button
                    disabled={busy || p.myVote !== null}
                    className="poll-option"
                    key={i}
                    onClick={() =>
                      act(async () => {
                        await playApi("polls/" + p.id, "POST", { choice: i });
                        load();
                      })
                    }
                  >
                    <span>
                      {option}
                      {p.myVote === i ? " ✓" : ""}
                    </span>
                    <b>{count} votes</b>
                    <progress
                      value={count}
                      max={total || 1}
                      aria-label={option}
                    />
                  </button>
                );
              })}
              <small>
                {p.totals.reduce((n: number, t: any) => n + t.count, 0)} genuine
                votes · Sign in to participate
              </small>
              <details>
                <summary>Report this poll</summary>
                <button
                  className="inline-link"
                  disabled={busy}
                  onClick={() =>
                    act(async () => {
                      await apiReport(p.id);
                      tell("Report sent to moderators.");
                    })
                  }
                >
                  Report inappropriate content
                </button>
              </details>
            </div>
          ))}
        </div>
      )}
      <form
        className="play-panel"
        onSubmit={(e) => {
          e.preventDefault();
          act(async () => {
            await playApi("polls/create", "POST", {
              question,
              options: options.split("\n").filter(Boolean),
            });
            setQuestion("");
            setOptions("");
            load();
          });
        }}
      >
        <h2>Start a poll</h2>
        <label>
          Question
          <input
            required
            minLength={8}
            maxLength={180}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </label>
        <label>
          Two to four options · one per line
          <textarea
            required
            value={options}
            onChange={(e) => setOptions(e.target.value)}
          />
        </label>
        <button className="btn primary" disabled={busy}>
          Publish poll
        </button>
        <p>
          Signed-in members can create polls. First daily participation earns 5
          XP.
        </p>
      </form>
    </PlayPage>
  );
}
async function apiReport(id: string) {
  return playApi("poll-report", "POST", { id });
}
const articles = [
  {
    id: "keeper",
    title: "The keeper did not steal the dawn for power.",
    tag: "ORIGINAL THEORY",
    text: "The last lantern is both a light source and a shelter. That changes the moral question: restoring the city may destroy the life within it. A kind choice early in your journey can create a route where the city shares that burden. Play all three chapters and compare the ending with a friend. This is our interpretation of the original ANIMEVERSE story, not a claim about an existing anime franchise.",
  },
  {
    id: "guard",
    title: "Why a good rival makes you a better guardian.",
    tag: "COMBAT JOURNAL",
    text: "The Ash Rival tells you its next intent. That makes defense a decision rather than a reflex. Guard a heavy attack, recover energy with Focus and time your signature ability. Akira rewards pressure, Luna protects a patient player and Ren commits to speed. The point of a training battle is to understand a tradeoff, not to buy a stronger hero.",
  },
  {
    id: "city",
    title: "Eight districts, one shared constellation.",
    tag: "WORLD NOTES",
    text: "Sakura City holds the last lantern. The Shadow District carries messages. The Celestial Academy remembers missing stars. Spirit Forest responds to trust. The Colosseum teaches restraint. Moonlight Harbor preserves memories. Crystal Mountains reflect possibility. Guild Headquarters leaves room for one more traveler. Their connections are the beginning of our original world.",
  },
];
export function News({ id }: { id?: string }) {
  return (
    <PlayPage
      title="Stories behind the story."
      eyebrow="ORIGINAL NEWS & THEORIES"
    >
      <div className="play-grid">
        {articles
          .filter((a) => !id || a.id === id)
          .map((a) => (
            <article className="play-panel" key={a.id}>
              <span className="eyebrow">{a.tag}</span>
              <h2>
                <a href={"/news/" + a.id}>{a.title}</a>
              </h2>
              <p>{a.text}</p>
              <a className="inline-link" href="/community">
                Bring your interpretation to the community ↗
              </a>
            </article>
          ))}
      </div>
    </PlayPage>
  );
}

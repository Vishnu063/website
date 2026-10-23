"use client";
import { useState, useEffect, type FormEvent } from "react";
import {
  Swords,
  Plus,
  Search,
  ArrowUpRight,
  ArrowRight,
  MessageCircle,
  ChevronLeft,
  Share2,
  Bookmark,
  Flag,
  CheckCircle2,
  X,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  api,
  event,
  copy,
  Title,
  AuthNote,
  Failure,
  type Session,
  type Tell,
} from "./core";
export function Arena({
  community,
  session,
  ready,
  tell,
}: {
  community: boolean;
  session: Session;
  ready: boolean;
  tell: Tell;
}) {
  const [battles, setBattles] = useState<any[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [search, setSearch] = useState(""),
    [create, setCreate] = useState(false),
    [busy, setBusy] = useState(false);
  const load = () => {
    setLoading(true);
    setError("");
    api("battles")
      .then((r) => setBattles(r.battles))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    try {
      const r = await api("battles", "POST", body);
      event("battle_created");
      location.href = "/battle/" + r.id;
    } catch (e) {
      tell((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const filtered = battles.filter((b) =>
    `${b.title} ${b.left_name} ${b.right_name}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <section className="page">
      <Title
        eyebrow={
          community ? "FIND YOUR PEOPLE" : "PICK A SIDE. MAKE YOUR CASE."
        }
        title={
          community
            ? "Good stories start a conversation."
            : "The arena is open."
        }
      >
        {community
          ? "Original theories, friendly rivalries, and conversations built by fans."
          : "Hypothetical battles. Clear conditions. Fan opinions, never official outcomes."}
      </Title>
      <div className="arena-banner">
        <Swords size={38} />
        <div>
          <h2>Your rules. Your contenders.</h2>
          <p>
            Original heroes or text-only franchise comparisons. A good debate
            starts with a fair scenario.
          </p>
        </div>
        <button className="btn primary" onClick={() => setCreate(!create)}>
          <Plus size={17} />
          {create ? "Close editor" : "Create a battle"}
        </button>
      </div>
      {create && (
        <section className="panel create-panel">
          <h2>Set the stage.</h2>
          {!session.user ? (
            <AuthNote />
          ) : (
            <form onSubmit={submit}>
              <label>
                Discussion title
                <input
                  required
                  minLength={5}
                  maxLength={100}
                  name="title"
                  placeholder="Can a flame guardian win at Moonlight Harbor?"
                />
              </label>
              <div className="form-row">
                <label>
                  First contender
                  <input
                    required
                    maxLength={60}
                    name="left"
                    placeholder="Ember Sentinel"
                  />
                </label>
                <label>
                  Second contender
                  <input
                    required
                    maxLength={60}
                    name="right"
                    placeholder="Moon Weaver"
                  />
                </label>
              </div>
              <label>
                Battle conditions
                <input
                  required
                  minLength={3}
                  maxLength={300}
                  name="conditions"
                  placeholder="Moonlight Harbor · equal preparation · no outside help"
                />
              </label>
              <label>
                Scenario and your opening argument
                <textarea
                  required
                  minLength={10}
                  maxLength={1500}
                  name="scenario"
                  rows={5}
                  placeholder="Define the goal, allowed abilities and version of each contender."
                />
              </label>
              <p className="fine">
                Use your own words. No franchise artwork, harassment, personal
                information or unmarked spoilers.
              </p>
              <button className="btn primary" disabled={busy}>
                {busy ? "Publishing…" : "Publish discussion"}{" "}
                <ArrowUpRight size={17} />
              </button>
            </form>
          )}
        </section>
      )}
      <div className="section-heading arena-heading">
        <div className="tabs">
          <span className="tab active">Latest discussions</span>
          <a className="tab" href="/profile">
            Following
          </a>
        </div>
        <label className="search-field">
          <Search size={17} />
          <input
            aria-label="Search battles"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find a rivalry…"
          />
        </label>
      </div>
      {loading ? (
        <div className="empty" role="status">
          Opening the arena…
        </div>
      ) : error ? (
        <Failure error={error} retry={load} />
      ) : filtered.length ? (
        <div className="battle-list">
          {filtered.map((b) => (
            <a href={"/battle/" + b.id} className="battle-preview" key={b.id}>
              <div className="matchup">
                <span>{b.left_name}</span>
                <b>VS</b>
                <span>{b.right_name}</span>
              </div>
              <div>
                <span className="eyebrow">COMMUNITY BATTLE · FAN OPINION</span>
                <h2>{b.title}</h2>
                <p>{b.conditions}</p>
                <small>
                  By {b.author} · {new Date(b.created).toLocaleDateString()}
                </small>
              </div>
              <div className="battle-counts">
                <span>
                  <Swords size={16} />
                  {b.votes} votes
                </span>
                <span>
                  <MessageCircle size={16} />
                  {b.comments} replies
                </span>
                <ArrowUpRight />
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="empty">
          <span className="empty-icon">
            <Swords size={30} />
          </span>
          <h2>
            {search
              ? "No matching battles."
              : "Every rivalry needs a first voice."}
          </h2>
          <p>
            {search
              ? "Try another contender or title."
              : "There are no public discussions yet. Start the first one, or discover your original power."}
          </p>
          <div className="button-row">
            <button
              className="btn primary"
              onClick={() => {
                setCreate(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Start a discussion
            </button>
            <a className="btn secondary" href="/power">
              Discover my power
            </a>
          </div>
        </div>
      )}
      <div className="editorial-grid">
        <article className="panel">
          <span className="eyebrow">THEORY LAB / ORIGINAL EDITORIAL</span>
          <h3>A stronger character doesn’t always win.</h3>
          <p>
            A duel on an open field rewards different skills than a rescue at a
            crowded harbor. Define the goal, terrain, preparation time and
            restrictions before comparing power. Then explain which ability
            changes the outcome.
          </p>
          <a href="/arena" className="inline-link">
            Bring a scenario to the arena <ArrowRight size={16} />
          </a>
        </article>
        <article className="panel">
          <span className="eyebrow">COMMUNITY CODE</span>
          <h3>Disagree with the argument. Respect the fan.</h3>
          <p>
            Label speculation, explain assumptions and make room for a different
            reading. Reports reach the moderator queue. Blocking hides a
            member’s discussions and replies from your account.
          </p>
          <a href="/terms" className="inline-link">
            Read the community guidelines <ArrowRight size={16} />
          </a>
        </article>
      </div>
      {ready && !session.user && <AuthNote />}
    </section>
  );
}
export function Battle({
  id,
  session,
  ready,
  tell,
  initial,
}: {
  id: string;
  session: Session;
  ready: boolean;
  tell: Tell;
  initial?: any;
}) {
  const [data, setData] = useState<any>(initial || null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [reply, setReply] = useState<any>(null),
    [report, setReport] = useState<{ kind: string; target: string } | null>(
      null,
    ),
    [reason, setReason] = useState(""),
    [link, setLink] = useState("");
  const load = () => {
    setError("");
    api("battles/" + id)
      .then(setData)
      .catch((e) => setError(e.message));
  };
  useEffect(() => {
    load();
    setLink(location.origin + "/battle/" + id);
  }, [id]);
  useEffect(() => {
    if (reply) document.getElementById("argument-body")?.focus();
  }, [reply]);
  useEffect(() => {
    if (report) document.getElementById("report-reason")?.focus();
  }, [report]);
  const action = async (path: string, method: string, body?: unknown) => {
    setBusy(true);
    try {
      await api(path, method, body);
      load();
      return true;
    } catch (e) {
      tell((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  };
  const comment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (
      await action("battles/" + id + "/comments", "POST", {
        body: String(new FormData(form).get("body")),
        parent: reply?.id,
      })
    ) {
      form.reset();
      setReply(null);
      event("comment_created");
    }
  };
  if (error)
    return (
      <section className="page">
        <Failure error={error} retry={load} />
      </section>
    );
  if (!data)
    return (
      <section className="page empty" role="status">
        Opening the discussion…
      </section>
    );
  const b = data.battle,
    total = data.totals.reduce((n: number, t: any) => n + t.count, 0),
    count = (choice: string) =>
      data.totals.find((t: any) => t.choice === choice)?.count || 0;
  return (
    <section className="page">
      <a className="inline-link" href="/arena">
        <ChevronLeft size={17} /> Back to arena
      </a>
      <Title eyebrow="HYPOTHETICAL BATTLE / FAN OPINION" title={b.title}>
        Created by {b.author} · {new Date(b.created).toLocaleDateString()}
      </Title>
      <div className="battle-detail">
        <article className="panel">
          <div className="duel-heading">
            <span>{b.left_name}</span>
            <b>VS</b>
            <span>{b.right_name}</span>
          </div>
          <div className="conditions">
            <span className="eyebrow">THE CONDITIONS</span>
            <p>{b.conditions}</p>
          </div>
          <p className="scenario">{b.scenario}</p>
          <h2>Who has the advantage?</h2>
          <p className="fine">
            One vote per account. Results are community opinions. Votes are
            final for this discussion.
          </p>
          <div className="vote-options">
            {[
              ["left", b.left_name],
              ["draw", "Too close to call"],
              ["right", b.right_name],
            ].map(([choice, label]) => (
              <button
                className={data.myVote === choice ? "voted" : ""}
                key={choice}
                disabled={busy || !!data.myVote || !session.user}
                onClick={async () => {
                  if (
                    await action("battles/" + id + "/vote", "POST", { choice })
                  ) {
                    tell("Your vote is counted.");
                    event("vote_cast");
                  }
                }}
              >
                <span>
                  {label}
                  {data.myVote === choice && <CheckCircle2 size={16} />}
                </span>
                <strong>
                  {total ? Math.round((count(choice) / total) * 100) : 0}%{" "}
                  <small>({count(choice)})</small>
                </strong>
                <i
                  style={{
                    width: `${total ? (count(choice) / total) * 100 : 0}%`,
                  }}
                />
              </button>
            ))}
          </div>
          <p className="fine">
            {total} genuine {total === 1 ? "vote" : "votes"} recorded.{" "}
            {data.myVote ? "You have voted." : "No outcome is official."}
          </p>
          {ready && !session.user && <AuthNote path={"/battle/" + id} />}
          <div className="button-row">
            <button
              className="btn secondary"
              onClick={async () => {
                try {
                  await copy(link);
                  tell(
                    "Battle link copied. Invite a friend to make their case.",
                  );
                  event("battle_share");
                } catch {
                  tell("Select and copy the challenge URL below.");
                }
              }}
            >
              <Share2 size={17} /> Challenge a friend
            </button>
            <button
              className="btn secondary"
              disabled={busy || !session.user}
              onClick={() =>
                action(
                  "battles/" + id + "/follow",
                  data.following ? "DELETE" : "POST",
                  {},
                )
              }
            >
              <Bookmark size={17} />
              {data.following ? "Following" : "Follow discussion"}
            </button>
            <button
              className="text-button"
              disabled={!session.user}
              onClick={() => setReport({ kind: "battle", target: id })}
            >
              <Flag size={16} /> Report
            </button>
          </div>
          <label className="share-label">
            Challenge URL
            <input readOnly value={link} onFocus={(e) => e.target.select()} />
          </label>
        </article>
        <aside className="panel debate-tips">
          <span className="eyebrow">A BETTER DEBATE</span>
          <h3>Make your case.</h3>
          <p>
            Explain an ability, a limitation, and the moment that decides the
            match.
          </p>
          <hr />
          <p>Different interpretations are welcome. Personal attacks aren’t.</p>
          <a href="/terms" className="inline-link">
            Community guidelines <ArrowUpRight size={16} />
          </a>
          <hr />
          <span className="eyebrow">CREATE YOUR OWN CONTENDER</span>
          <a href="/power" className="btn primary full">
            Find my power <Sparkles size={16} />
          </a>
        </aside>
      </div>
      <section className="panel discussion">
        <h2>
          The discussion <small>{data.comments.length}</small>
        </h2>
        {session.user ? (
          <form onSubmit={comment}>
            {reply && (
              <div className="reply-note">
                Replying to {reply.author}
                <button
                  type="button"
                  aria-label="Cancel reply"
                  onClick={() => setReply(null)}
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <label>
              Your argument
              <textarea
                required
                minLength={2}
                maxLength={1000}
                name="body"
                id="argument-body"
                rows={3}
                placeholder="I’d give the advantage to… because…"
              />
            </label>
            <button className="btn primary" disabled={busy}>
              {busy ? "Posting…" : "Post argument"} <ArrowUpRight size={16} />
            </button>
          </form>
        ) : (
          <AuthNote path={"/battle/" + id} />
        )}
        <div className="comments">
          {data.comments.length === 0 ? (
            <p className="muted">
              No arguments yet. Be the first to explain your choice.
            </p>
          ) : (
            data.comments.map((c: any) => (
              <article
                className={"comment " + (c.parent ? "is-reply" : "")}
                key={c.id}
              >
                <div className="avatar">
                  <UserRound size={18} />
                </div>
                <div>
                  <strong>{c.author}</strong>
                  <time>{new Date(c.created).toLocaleString()}</time>
                  {c.parent && (
                    <small className="reply-context">
                      Reply to{" "}
                      {data.comments.find((p: any) => p.id === c.parent)
                        ?.author || "an earlier comment"}
                    </small>
                  )}
                  <p>{c.body}</p>
                  <div className="comment-actions">
                    <button
                      disabled={!session.user}
                      onClick={() => setReply(c)}
                    >
                      Reply
                    </button>
                    <button
                      disabled={!session.user}
                      onClick={() =>
                        setReport({ kind: "comment", target: c.id })
                      }
                    >
                      Report
                    </button>
                    {c.user !== session.user?.id && (
                      <button
                        disabled={!session.user || busy}
                        onClick={async () => {
                          if (
                            await action("blocks", "POST", { target: c.user })
                          )
                            tell(
                              "Member blocked. Manage blocks in your profile.",
                            );
                        }}
                      >
                        Block member
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
      {report && (
        <section className="report-panel panel" aria-label="Report content">
          <h2>Report content</h2>
          <p>
            Tell the moderator what needs attention. Reports are not public.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (await action("reports", "POST", { ...report, reason })) {
                setReport(null);
                setReason("");
                tell("Report submitted to the moderation queue.");
              }
            }}
          >
            <label>
              Reason
              <textarea
                required
                minLength={5}
                maxLength={500}
                id="report-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            <div className="button-row">
              <button className="btn primary" disabled={busy}>
                Send report
              </button>
              <button
                type="button"
                className="btn secondary"
                onClick={() => setReport(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}
    </section>
  );
}

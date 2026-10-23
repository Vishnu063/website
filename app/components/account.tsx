"use client";
import { AdventureProfile } from "./adventure-profile";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Settings,
  Trash2,
  LogOut,
} from "lucide-react";
import { resultFromCode } from "../../lib/power";
import { api, Title, AuthNote, type Session, type Tell } from "./core";
export function Profile({
  session,
  ready,
  tell,
}: {
  session: Session;
  ready: boolean;
  tell: Tell;
}) {
  const [data, setData] = useState<any>(null),
    [name, setName] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const load = () =>
    api("profile")
      .then((d) => {
        setData(d);
        setName(d.profile.name);
      })
      .catch((e) => setError(e.message));
  useEffect(() => {
    if (session.user) load();
  }, [session.user]);
  if (!ready) return <section className="page">Loading your profile…</section>;
  if (!session.user)
    return (
      <section className="page">
        <Title
          eyebrow="YOUR CORNER OF THE UNIVERSE"
          title="Keep your story with you."
        >
          Save your hero and follow the debates you care about.
        </Title>
        <AdventureProfile tell={tell} />
        <AuthNote path="/profile" />
        <a className="btn primary" href="/power">
          Try the power test first
        </a>
      </section>
    );
  let hero: any = null;
  try {
    hero = JSON.parse(data?.profile.hero || "null");
  } catch {}
  return (
    <section className="page">
      <Title
        eyebrow="YOUR CORNER OF THE UNIVERSE"
        title="Welcome back, explorer."
      >
        Your saved identity and followed discussions. No invented achievements
        or scores.
      </Title>
      <AdventureProfile tell={tell} />
      {error && <p role="alert">{error}</p>}
      <div className="profile-grid">
        <section className="panel">
          <h2>Your public name</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                await api("profile", "PUT", { name, hero });
                tell("Profile updated.");
              } catch (e) {
                tell((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <label>
              Display name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                minLength={2}
                maxLength={32}
                required
              />
            </label>
            <p className="fine">
              Shown on your discussions and replies. Your email is not
              published.
            </p>
            <button className="btn primary" disabled={busy || !data}>
              Save profile
            </button>
          </form>
          <hr />
          {hero ? (
            <>
              <h3>{hero.name}</h3>
              <p>{resultFromCode(hero.code).name}</p>
              <a className="btn secondary" href={"/hero/" + hero.code}>
                Open saved power result <ArrowUpRight size={17} />
              </a>
            </>
          ) : (
            <>
              <h3>Your hero is waiting.</h3>
              <p>Complete the power test, then save your result.</p>
              <a className="btn secondary" href="/power">
                Discover my power
              </a>
            </>
          )}
        </section>
        <section className="panel">
          <h2>Following</h2>
          {data?.following.length ? (
            data.following.map((b: any) => (
              <a className="follow-item" key={b.id} href={"/battle/" + b.id}>
                {b.title}
                <ArrowUpRight size={16} />
              </a>
            ))
          ) : (
            <p className="muted">Follow a battle to find it here later.</p>
          )}
          <a className="inline-link" href="/arena">
            Explore the arena <ArrowRight size={17} />
          </a>
          <hr />
          <h3>Blocked members</h3>
          {data?.blocks.length ? (
            data.blocks.map((b: any, i: number) => (
              <div className="follow-item" key={b.target}>
                <span>Blocked member {i + 1}</span>
                <button
                  className="text-button"
                  onClick={async () => {
                    try {
                      await api("blocks", "DELETE", { target: b.target });
                      load();
                      tell("Member unblocked.");
                    } catch (e) {
                      tell((e as Error).message);
                    }
                  }}
                >
                  Unblock
                </button>
              </div>
            ))
          ) : (
            <p className="muted">You haven’t blocked anyone.</p>
          )}
        </section>
      </div>
      <a className="inline-link" href="/settings">
        Account and privacy controls <Settings size={16} />
      </a>
    </section>
  );
}
export function Preferences({
  session,
  tell,
}: {
  session: Session;
  tell: Tell;
}) {
  const [motion, setMotion] = useState("system"),
    [text, setText] = useState("normal"),
    [analytics, setAnalytics] = useState(false),
    [confirm, setConfirm] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    try {
      setMotion(localStorage.getItem("av-motion") || "system");
      setText(localStorage.getItem("av-text") || "normal");
      setAnalytics(localStorage.getItem("av-analytics") === "yes");
    } catch {}
  }, []);
  const setting = (key: string, value: string) => {
    try {
      localStorage.setItem("av-" + key, value);
      document.documentElement.dataset[key] = value;
    } catch {
      tell("Browser storage is unavailable.");
    }
  };
  return (
    <section className="page narrow">
      <Title
        eyebrow="MAKE YOURSELF AT HOME"
        title="Your universe. Your preferences."
      />
      <section className="panel">
        <h2>Accessibility & comfort</h2>
        <label>
          Motion
          <select
            value={motion}
            onChange={(e) => {
              setMotion(e.target.value);
              setting("motion", e.target.value);
            }}
          >
            <option value="system">Follow device preference</option>
            <option value="reduce">Reduce animation</option>
          </select>
        </label>
        <label>
          Text size
          <select
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setting("text", e.target.value);
            }}
          >
            <option value="normal">Standard</option>
            <option value="large">Larger</option>
          </select>
        </label>
        <p className="fine">
          Ambient sound starts muted. Use the header sound button to turn it on.
        </p>
      </section>
      <section className="panel">
        <h2>Private event diagnostics</h2>
        <p>
          Optional interaction events stay in this browser. No analytics service
          receives them. Cross-device retention and referrals are not measured
          yet.
        </p>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={analytics}
            onChange={(e) => {
              setAnalytics(e.target.checked);
              try {
                localStorage.setItem(
                  "av-analytics",
                  e.target.checked ? "yes" : "no",
                );
                if (!e.target.checked) localStorage.removeItem("av-events");
              } catch {}
            }}
          />{" "}
          Keep local interaction diagnostics
        </label>
        <button
          className="btn secondary"
          onClick={() => {
            try {
              const url = URL.createObjectURL(
                  new Blob([localStorage.getItem("av-events") || "[]"], {
                    type: "application/json",
                  }),
                ),
                a = document.createElement("a");
              a.href = url;
              a.download = "animeverse-events.json";
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 2000);
            } catch {
              tell("Export unavailable.");
            }
          }}
        >
          Export my local events
        </button>
      </section>
      <section className="panel">
        <h2>Account controls</h2>
        {session.user ? (
          <>
            <a
              className="inline-link"
              href="/signout-with-chatgpt?return_to=%2F"
              target="_top"
            >
              <LogOut size={16} /> Sign out
            </a>
            <hr />
            <h3>Delete ANIMEVERSE account data</h3>
            <p>
              This permanently deletes your profile, saved hero, created battles
              and their replies, own comments, votes, follows, blocks, reports,
              game progress, XP, notifications, poll activity and social
              memberships. Owned clans are archived and affected active
              tournaments are cancelled. Your ChatGPT account is unaffected.
            </p>
            <label>
              Type DELETE to confirm
              <input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="off"
              />
            </label>
            <button
              className="btn danger"
              disabled={confirm !== "DELETE" || busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await api("profile", "DELETE", {});
                  localStorage.removeItem("av-guest-hero");
                  setConfirm("");
                  tell("Your ANIMEVERSE account data was deleted.");
                } catch (e) {
                  tell((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Trash2 size={16} /> Delete my app data
            </button>
          </>
        ) : (
          <AuthNote path="/settings" />
        )}
        <hr />
        <button
          className="text-button"
          onClick={() => {
            try {
              ["av-guest-hero", "av-events"].forEach((k) =>
                localStorage.removeItem(k),
              );
              tell(
                "Guest result and diagnostics cleared. Yoru creations are managed in their creator pages.",
              );
            } catch {
              tell("Browser storage is unavailable.");
            }
          }}
        >
          Clear guest result and diagnostics
        </button>
      </section>
    </section>
  );
}
export function Moderation({
  session,
  ready,
  tell,
}: {
  session: Session;
  ready: boolean;
  tell: Tell;
}) {
  const [data, setData] = useState<any>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const load = () =>
    api("admin")
      .then(setData)
      .catch((e) => setError(e.message));
  useEffect(() => {
    if (session.admin) load();
  }, [session.admin]);
  if (!ready)
    return <section className="page">Checking moderator access…</section>;
  if (!session.admin)
    return (
      <section className="page">
        <h1>Moderator access required.</h1>
        <p>This interface is restricted by a server-side allowlist.</p>
      </section>
    );
  return (
    <section className="page">
      <Title eyebrow="MODERATION" title="Keep the conversation welcoming." />
      {error && <p role="alert">{error}</p>}
      <div className="panel">
        <h2>Open reports</h2>
        {data?.reports.length ? (
          data.reports.map((r: any) => (
            <article className="report" key={r.id}>
              <span>
                {r.kind} · {r.target}
              </span>
              <p>
                <strong>Report:</strong> {r.reason}
              </p>
              <p>
                <strong>Content:</strong> {r.content || "Content removed"}
              </p>
              {r.battle && (
                <a className="inline-link" href={"/battle/" + r.battle}>
                  Open discussion <ArrowUpRight size={16} />
                </a>
              )}
              <div className="button-row">
                {["hide", "dismiss"].map((action) => (
                  <button
                    className="btn secondary"
                    disabled={busy}
                    key={action}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        await api("admin", "POST", { id: r.id, action });
                        load();
                        tell("Moderation action recorded.");
                      } catch (e) {
                        tell((e as Error).message);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    {action === "hide" ? "Hide content" : "Dismiss report"}
                  </button>
                ))}
              </div>
            </article>
          ))
        ) : (
          <p>No reports awaiting review.</p>
        )}
      </div>
      <div className="panel">
        <h2>Administrative audit trail</h2>
        {data?.audit.map((a: any, i: number) => (
          <p key={i}>
            {a.action} · {a.target} · {new Date(a.created).toLocaleString()}
          </p>
        ))}
      </div>
    </section>
  );
}
export function Legal({ privacy }: { privacy: boolean }) {
  return (
    <section className="page narrow">
      <Title
        eyebrow="ANIMEVERSE / UPDATED OCTOBER 2026"
        title={privacy ? "Your privacy matters." : "A universe worth sharing."}
      />
      <section className="panel">
        {privacy ? (
          <>
            <h2>What the app stores</h2>
            <p>
              Accessibility preferences stay in your browser. New guest games
              store progress on the server under a private, HttpOnly, 30-day
              browser cookie. Account features store a site-specific account
              identifier, chosen public name, saved hero, posts, comments,
              votes, follows, blocks, reports, game attempts, story choices, XP,
              collection preferences, clan memberships, tournament entries and
              notifications. Your email is not published.
            </p>
            <h2>Sign-in and hosting</h2>
            <p>
              ChatGPT manages sign-in and its own session cookies. Sites
              processes requests and operational logs. The app does not ask for
              passwords or store payment details. The current deployment is
              owner-private.
            </p>
            <h2>Sharing and diagnostics</h2>
            <p>
              Hero URLs contain a fictional identity answer code. Battle links
              reference discussion content accessible only to the permitted site
              audience. Optional interaction diagnostics remain in your browser
              and can be exported or cleared. No external analytics or ad
              network is installed.
            </p>
            <h2>Your controls</h2>
            <p>
              Delete app account data in Settings. This removes your profile and
              activity, not your ChatGPT account. Clearing browser storage
              removes local results and settings; clearing the guest cookie
              loses access to guest game records. Delete guest progress from the
              adventure passport before clearing cookies. Operator backups need
              a separate retention policy.
            </p>
            <h2>Before public launch</h2>
            <p>
              The operator must publish a contact address, define retention and
              backup policies, review applicable privacy requirements and staff
              moderation. This describes current behavior; it is not legal
              certification.
            </p>
          </>
        ) : (
          <>
            <h2>Respect the person behind the opinion.</h2>
            <p>
              Debate ideas and interpretations. No harassment, hate, threats,
              doxxing, sexual exploitation, spam or impersonation. Avoid
              explicit content. Mark spoilers in discussion titles and do not
              post personal information.
            </p>
            <h2>Original worlds and fan commentary</h2>
            <p>
              Our heroes and artwork are original. Franchise names may appear in
              text commentary; the site is independent and not endorsed by those
              franchises. Do not post unauthorized artwork, streams or clips.
              Label speculation and cite sources for factual claims. Uncertain
              commercial trademark or copyright uses need review.
            </p>
            <h2>Fair participation</h2>
            <p>
              One final vote per account per discussion. Do not create multiple
              accounts or automate votes. Rate limits reduce ordinary abuse but
              cannot eliminate coordinated manipulation. There are no paid
              battle advantages, gambling, loot boxes or real-money rewards.
            </p>
            <h2>Moderation and removal</h2>
            <p>
              Report harmful content from its discussion. Allowlisted moderators
              can hide reported content and actions are audited. Blocking hides
              a member’s discussions and replies from your account. Moderator
              access must be configured before a wider launch.
            </p>
            <h2>Early product</h2>
            <p>
              Power results are fictional entertainment. Features and content
              may change. Audience growth, revenue, tournament prizes and future
              features are not guaranteed.
            </p>
          </>
        )}
      </section>
    </section>
  );
}

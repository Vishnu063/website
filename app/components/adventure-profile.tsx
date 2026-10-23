"use client";
import { collections } from "../../lib/adventure-content";
import { art, signin, type Tell } from "./core";
import { usePlay, playApi, useAction, ProgressStrip } from "./play-common";
export function AdventureProfile({ tell }: { tell: Tell }) {
  const { data, load } = usePlay("progress"),
    collection = usePlay("collection"),
    { busy, act } = useAction(tell);
  const equipped =
    collections.find((ch) => ch.id === collection.data?.equipped) ||
    collections[0];
  return (
    <section className="play-panel">
      <h2>Your adventure passport</h2>
      <ProgressStrip />
      {data && (
        <>
          <div className={"passport edition-" + equipped.id}>
            <img src={art(equipped.art)} alt={equipped.name} />
            <div>
              <span className="eyebrow">MY SIGNATURE EDITION</span>
              <h3>{equipped.name}</h3>
              <p>
                {data.guest
                  ? "Guest adventure in this browser"
                  : "Public player code: " + data.publicId}
              </p>
              <a className="inline-link" href="/collection">
                Change my edition ↗
              </a>
            </div>
          </div>
          <div className="play-grid">
            {data.achievements.map((a: any) => (
              <div key={a.id}>
                <b>
                  {a.unlocked ? "✦" : "◇"} {a.name}
                </b>
                <p>{a.description}</p>
              </div>
            ))}
          </div>
          {data.guest ? (
            <>
              <p>
                Guest progress is saved server-side under a private 30-day
                browser cookie. Clearing cookies loses access. You can import it
                after signing in.
              </p>
              <a
                className="btn primary"
                href={signin("/profile")}
                target="_top"
              >
                Save with my account
              </a>
              <details>
                <summary>Guest privacy controls</summary>
                <p>Delete this browser’s guest progress permanently.</p>
                <button
                  className="btn glass"
                  disabled={busy}
                  onClick={() =>
                    act(async () => {
                      await playApi("guest", "DELETE", {});
                      location.reload();
                    })
                  }
                >
                  Delete guest adventure
                </button>
              </details>
            </>
          ) : (
            <>
              <a className="btn glass" href={"/players/" + data.publicId}>
                View public game profile
              </a>
              <a className="btn glass" href="/notifications">
                Notification & ranking preferences
              </a>
              <button
                className="btn glass"
                disabled={busy}
                onClick={() =>
                  act(async () => {
                    await playApi("import", "POST", {});
                    load();
                    collection.load();
                    tell(
                      "Your guest progress was imported. Existing account choices take priority.",
                    );
                  })
                }
              >
                Import this browser’s guest adventure
              </button>
            </>
          )}
        </>
      )}
    </section>
  );
}

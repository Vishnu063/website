"use client";
import { useEffect, useState, useRef } from "react";
import { api, Title, type Tell } from "./core";
export const playApi = (path: string, method = "GET", body?: unknown) =>
  api("play/" + path, method, body);
export function usePlay(path: string) {
  const [data, setData] = useState<any>(null),
    [error, setError] = useState("");
  const request = useRef(0);
  const load = () => {
    const current = ++request.current;
    setError("");
    return playApi(path)
      .then((d) => {
        if (current === request.current) setData(d);
      })
      .catch((e) => {
        if (current === request.current) setError(e.message);
      });
  };
  useEffect(() => {
    setData(null);
    load();
  }, [path]);
  return { data, setData, error, load };
}
export const routes = [
  [
    "/creator",
    "Character creator",
    "Your original portrait, name, mood and downloadable identity kit.",
  ],
  [
    "/games",
    "Guessing games",
    "Four ways to play. A new set of clues every UTC day.",
  ],
  [
    "/quests",
    "Daily quests",
    "Complete real activities. Claim XP. Find your next goal.",
  ],
  ["/story", "Story mode", "Your choices leave a mark on Sakura City."],
  [
    "/combat",
    "Strategic combat",
    "Pick your hero. Read the opponent. Make your move.",
  ],
  [
    "/world",
    "Explore the world",
    "Eight districts and the secrets between them.",
  ],
  ["/clans", "Anime clans", "Find your people and grow together."],
  ["/events", "Tournaments", "Real players. Shared opponents. Honest results."],
  [
    "/collection",
    "Character collection",
    "Original heroes, earned frames and your signature look.",
  ],
  [
    "/leaderboards",
    "Leaderboards",
    "The actual score, with room for your name.",
  ],
  ["/notifications", "Notifications", "Your adventures, all caught up."],
  ["/polls", "Community polls", "Help choose what the universe becomes."],
  [
    "/news",
    "News & theories",
    "Original editorial notes and story discussion.",
  ],
] as const;
export function PlayNav() {
  const [path, setPath] = useState("");
  useEffect(() => { setPath(location.pathname); }, []);
  const main = [["/play", "All adventures"], ["/games", "Quick quiz"], ["/combat", "Battle"], ["/story", "Story"]];
  const extra = routes.filter(([href]) => !main.some(([url]) => url === href));
  const isActive = (href: string) => path === href || (href !== "/play" && path.startsWith(href + "/"));
  return <nav className="play-navigation" aria-label="Play navigation">
    <div className="play-tabs">{main.map(([href, name]) => <a href={href} key={href} aria-current={isActive(href) ? "page" : undefined}>{name}</a>)}</div>
    <details className="play-more">
      <summary>More to explore{extra.some(([href]) => isActive(href)) ? " · " + extra.find(([href]) => isActive(href))?.[1] : ""}</summary>
      <div>{extra.map(([href, name]) => <a href={href} key={href} aria-current={isActive(href) ? "page" : undefined}>{name}</a>)}</div>
    </details>
  </nav>;
}
export function PlayPage({
  title,
  eyebrow = "AN ORIGINAL UNIVERSE",
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="page play-page">
      <Title title={title} eyebrow={eyebrow} />
      <PlayNav />
      {children}
    </section>
  );
}
export function LoadState({
  error,
  load,
}: {
  error: string;
  load: () => void;
}) {
  return error ? (
    <div className="play-empty" role="alert">
      <p>{error}</p>
      <button className="btn glass" onClick={load}>
        Try again
      </button>
    </div>
  ) : (
    <p role="status">Opening your next chapter…</p>
  );
}
export function ProgressStrip() {
  const { data } = usePlay("progress");
  return data ? (
    <div className="progress-strip">
      <span>
        LEVEL <b>{data.level}</b>
      </span>
      <progress
        max={100}
        value={data.xp % 100}
        aria-label="Progress to next level"
      />
      <span>{data.xp} XP</span>
      <small>
        {data.guest
          ? "Guest adventure · saved in this browser"
          : "Saved to your account"}
      </small>
    </div>
  ) : null;
}
export function useAction(tell: Tell) {
  const [busy, setBusy] = useState(false);
  return {
    busy,
    act: async (fn: () => Promise<void>) => {
      if (busy) return;
      setBusy(true);
      try {
        await fn();
      } catch (e) {
        tell((e as Error).message);
      } finally {
        setBusy(false);
      }
    },
  };
}

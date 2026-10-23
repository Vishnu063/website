"use client";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { resultFromCode } from "../../lib/power";
import { api, event, type Session } from "./core";

// A navigation guide only. Completion and rewards remain server-owned.
export function FirstAdventure({ session, ready }: { session: Session; ready: boolean }) {
  const [identity, setIdentity] = useState(false);
  const [progress, setProgress] = useState<{ combat: boolean; chapters: number; resume: string | null } | null>(null);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!ready) return;
    let alive = true;
    setError(false);
    setProgress(null);
    setIdentity(false);
    const readHero = (value: string | null) => {
      try {
        const h = JSON.parse(value || "null");
        if (h && resultFromCode(h.code) && alive) setIdentity(true);
      } catch {}
    };
    try { readHero(localStorage.getItem("av-guest-hero")); } catch {}
    if (session.user) api("profile").then(d => readHero(d.profile.hero)).catch(() => {});
    api("play/journey").then(d => { if (alive) setProgress(d); })
      .catch(() => { if (alive) setError(true); });
    return () => { alive = false; };
  }, [ready, session.user?.id, revision]);
  const steps = [
    { title: "Discover your power", detail: "Five choices. Your original identity.", href: "/power", complete: identity },
    { title: "Meet your first rival", detail: "A guided, turn-based training battle.", href: progress?.resume ? `/combat/${encodeURIComponent(progress.resume)}` : "/combat", complete: !!progress?.combat },
    { title: "Leave a mark on Sakura City", detail: "Begin a story that remembers your decisions.", href: "/story", complete: !!progress?.chapters },
  ];
  const completed = steps.filter(s => s.complete).length;
  const next = steps.find(s => !s.complete);
  const href = next?.href || "/story";
  return <section className="first-adventure" aria-labelledby="adventure-title">
    <div className="adventure-heading">
      <div><span className="eyebrow">YOUR FIRST ADVENTURE</span>
        <h2 id="adventure-title">{completed === 3 ? "You belong to this story now." : "Three small steps. Your own beginning."}</h2></div>
      <span className="adventure-count">{progress ? `${completed} / 3 explored` : error ? "Progress unavailable" : "Loading your journey…"}</span>
    </div>
    <ol className="adventure-steps">
      {steps.map((s, i) => <li key={s.href} className={s.complete ? "complete" : next === s ? "next" : ""}>
        <a href={s.href} aria-label={`${s.complete ? "Explored: " : ""}${s.title}`}>
          <span className="adventure-number">{s.complete ? <Check size={17}/> : `0${i + 1}`}</span>
          <span><b>{s.title}</b><small>{s.detail}</small></span><ArrowRight size={17}/>
        </a>
      </li>)}
    </ol>
    <div className="adventure-bottom">
      <a className="btn primary" href={href} onClick={() => event("journey_continue")}><Sparkles size={16}/>
        {!identity ? "Discover my power" : !progress?.combat ? progress?.resume ? "Resume my battle" : "Play my first battle" : completed < 3 ? "Begin my story" : progress?.chapters === 3 ? "Revisit my story" : "Continue my story"}<ArrowRight size={16}/></a>
      <span>{error ? <button className="text-button" onClick={() => setRevision(r => r + 1)}>Reload saved progress</button> : completed === 3 ? progress?.chapters === 3 ? "All three chapters complete. Explore the world or revisit your choices." : `${progress?.chapters} of 3 story chapters complete. Continue when you’re ready.` : "No signup needed. Explore at your own pace."}</span>
    </div>
  </section>;
}

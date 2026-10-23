"use client";
import {Clans,Events,Notifications,FriendChallenge,Polls,News} from "./components/social";
import { Combat, Story, World, Collection } from "./components/adventures";
import { useEffect, useState, useRef } from "react";
import {
  Compass,
  Swords,
  Sparkles,
  MessageCircle,
  Layers,
  Settings,
  Volume2,
  VolumeX,
  UserRound,
  Menu,
  X,
} from "lucide-react";
import { PlayHub, Games, Quests, Leaderboards, PlayerPage } from "./components/games";
import Home from "./components/home";
import { Power, SharedHero } from "./components/power";
import { Arena, Battle } from "./components/arena";
import { Profile, Preferences, Moderation, Legal } from "./components/account";
import { api, Mark, signin, type Session } from "./components/core";
export default function Experience({
  path,
  initialBattle,
}: {
  path: string;
  initialBattle?: any;
}) {
  const [session, setSession] = useState<Session>({ user: null, admin: false }),
    [ready, setReady] = useState(false),
    [notice, setNotice] = useState(""),
    [menu, setMenu] = useState(false),
    [sound, setSound] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  useEffect(() => {
    api("session")
      .then(setSession)
      .catch(() =>
        setNotice(
          "Account service is unavailable. You can still take the power test.",
        ),
      )
      .finally(() => setReady(true));
    try {
      document.documentElement.dataset.motion =
        localStorage.getItem("av-motion") || "system";
      document.documentElement.dataset.text =
        localStorage.getItem("av-text") || "normal";
    } catch {}
    const stop = () => {
      if (document.hidden) {
        audio.current?.close();
        audio.current = null;
        setSound(false);
      }
    };
    document.addEventListener("visibilitychange", stop);
    return () => {
      document.removeEventListener("visibilitychange", stop);
      audio.current?.close();
    };
  }, []);
  const toggleSound = () => {
    if (sound) {
      audio.current?.close();
      audio.current = null;
      setSound(false);
      return;
    }
    try {
      const c = new AudioContext(),
        gain = c.createGain();
      gain.gain.value = 0.025;
      gain.connect(c.destination);
      [130.81, 196, 261.63].forEach((f) => {
        const o = c.createOscillator();
        o.type = "sine";
        o.frequency.value = f;
        o.connect(gain);
        o.start();
      });
      audio.current = c;
      setSound(true);
    } catch {
      setNotice("Sound is unavailable in this browser.");
    }
  };
  const active = path.startsWith("/battle/")
    ? "arena"
    : path.split("/")[1] || "home";
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <aside className="rail">
        <a href="/" aria-label="Animeverse home">
          <Mark />
        </a>
        <div className="rail-links">
          <a
            href="/"
            className={active === "home" ? "active" : ""}
            aria-label="Home"
          >
            <Compass />
          </a>
          <a
            href="/arena"
            className={active === "arena" ? "active" : ""}
            aria-label="Battle arena"
          >
            <Swords />
          </a>
          <a
            href="/power"
            className={active === "power" ? "active" : ""}
            aria-label="Power test"
          >
            <Sparkles />
          </a>
          <a
            href="/community"
            className={active === "community" ? "active" : ""}
            aria-label="Community"
          >
            <MessageCircle />
          </a>
          <a href="/legacy/studio.html" aria-label="Character creator">
            <Layers />
          </a>
        </div>
        <a href="/settings" aria-label="Settings">
          <Settings />
        </a>
      </aside>
      <div className="shell">
        <header className="topbar">
          <a className="wordmark" href="/">
            ANIME<span>VERSE</span>
            <small>あなたの物語</small>
          </a>
          <nav
            className={menu ? "nav open" : "nav"}
            aria-label="Main navigation"
          >
            <a className={active === "home" ? "selected" : ""} href="/">
              Discover
            </a>
            <a href="/play" className={active === "play" ? "selected" : ""}>Play & explore</a>
            <a className={active === "arena" ? "selected" : ""} href="/arena">
              Battle Arena
            </a>
            <a className={active === "power" ? "selected" : ""} href="/power">
              Power Test <i>PLAY</i>
            </a>
            <a
              className={active === "community" ? "selected" : ""}
              href="/community"
            >
              Community
            </a>
          </nav>
          <div className="top-actions">
            <a href="/notifications" className="icon-button" aria-label="Notifications">♧</a>
            <button
              className="icon-button sound"
              aria-label={sound ? "Mute ambient sound" : "Enable ambient sound"}
              onClick={toggleSound}
            >
              {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <a
              className="account"
              aria-label={session.user ? "My profile" : "Sign in"}
              href={session.user ? "/profile" : signin(path)}
              target={session.user ? undefined : "_top"}
            >
              <UserRound size={17} />
              <span>{session.user ? "My profile" : "Sign in"}</span>
            </a>
            <button
              className="mobile-menu icon-button"
              aria-label="Toggle menu"
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </header>
        <main id="main">
          {path === "/" ? (
            <Home />
          ) : path === "/power" ? (
            <Power session={session} tell={setNotice} />
          ) : path.startsWith("/hero/") ? (
            <SharedHero
              code={path.split("/")[2]}
              session={session}
              tell={setNotice}
            />
          ) : path === "/arena" || path === "/community" ? (
            <Arena
              community={path === "/community"}
              session={session}
              ready={ready}
              tell={setNotice}
            />
          ) : path.startsWith("/battle/") ? (
            <Battle
              id={path.split("/")[2]}
              initial={initialBattle}
              session={session}
              ready={ready}
              tell={setNotice}
            />
          ) : path.startsWith("/clans") ? (<Clans id={path.split("/")[2]} tell={setNotice}/>) : path.startsWith("/events") ? (<Events id={path.split("/")[2]} tell={setNotice}/>) : path === "/notifications" ? (<Notifications tell={setNotice}/>) : path.startsWith("/challenges/") ? (<FriendChallenge id={path.split("/")[2]} tell={setNotice}/>) : path === "/polls" ? (<Polls tell={setNotice}/>) : path.startsWith("/news") ? (<News id={path.split("/")[2]}/>) : path.startsWith("/combat") ? (<Combat tell={setNotice} initialId={path.split("/")[2]}/>) : path === "/story" ? (<Story tell={setNotice}/>) : path === "/world" ? (<World tell={setNotice}/>) : path.startsWith("/collection") ? (<Collection tell={setNotice} id={path.split("/")[2]}/>) : path === "/play" ? (<PlayHub/>) : path === "/games" ? (<Games tell={setNotice}/>) : path === "/quests" ? (<Quests tell={setNotice}/>) : path === "/leaderboards" ? (<Leaderboards/>) : path.startsWith("/players/") ? (<PlayerPage id={path.split("/")[2]} tell={setNotice}/>) : path === "/profile" ? (
            <Profile session={session} ready={ready} tell={setNotice} />
          ) : path === "/settings" ? (
            <Preferences session={session} tell={setNotice} />
          ) : path === "/admin" ? (
            <Moderation session={session} ready={ready} tell={setNotice} />
          ) : path === "/privacy" || path === "/terms" ? (
            <Legal privacy={path === "/privacy"} />
          ) : (
            <section className="page">
              <h1>This portal hasn’t opened.</h1>
              <a className="btn primary" href="/">
                Return home
              </a>
            </section>
          )}
        </main>
        <footer>
          <a className="wordmark" href="/">
            ANIME<span>VERSE</span>
          </a>
          <p>Original worlds. Real choices. Your story.</p>
          <div>
            <a href="/legacy/index.html">Yoru creators ↗</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms & safety</a>
            <a href="/settings">Settings</a>
            {session.admin && <a href="/admin">Moderation</a>}
          </div>
          <small>
            Independent fan platform. Not affiliated with anime franchises.
          </small>
        </footer>
      </div>
      {notice && (
        <div className="notice" role="status">
          <span>{notice}</span>
          <button aria-label="Dismiss message" onClick={() => setNotice("")}>
            <X size={17} />
          </button>
        </div>
      )}
    </>
  );
}

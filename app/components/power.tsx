"use client";
import { useState, useEffect, useRef, type CSSProperties } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Shield,
  Download,
  Share2,
  Bookmark,
  Swords,
  Check,
} from "lucide-react";
import { questions, powerResult, resultFromCode } from "../../lib/power";
import {
  art,
  api,
  event,
  copy,
  Title,
  AuthNote,
  Mark,
  type Session,
  type Tell,
} from "./core";
type Hero = ReturnType<typeof powerResult>;
export function Power({ session, tell }: { session: Session; tell: Tell }) {
  const [answers, setAnswers] = useState<number[]>([]),
    [step, setStep] = useState(0),
    [done, setDone] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (step > 0) heading.current?.focus({ preventScroll: true });
  }, [step]);
  const pick = (a: number) => {
    const next = [...answers];
    next[step] = a;
    setAnswers(next);
    if (step === 4) {
      setDone(true);
      event("power_complete");
    } else setStep(step + 1);
  };
  if (done)
    return (
      <HeroView
        hero={powerResult(answers)}
        session={session}
        tell={tell}
        retry={() => {
          setDone(false);
          setStep(0);
          setAnswers([]);
        }}
      />
    );
  return (
    <section className="page">
      <Title
        eyebrow="THE ANIME POWER TEST"
        title="Every legend starts with a choice."
      >
        Five questions. No right answers. A little more you.
      </Title>
      <div className="quiz-layout">
        <div className="quiz-art">
          <img
            src={art(["akira", "luna", "ren"][step % 3])}
            alt="Original anime hero portrait"
          />
          <div>
            <span>CHAPTER 0{step + 1}</span>
            <h2>
              {
                [
                  "A light in the dark.",
                  "A place to belong.",
                  "The moment of truth.",
                  "Something worth keeping.",
                  "A legend of your own.",
                ][step]
              }
            </h2>
          </div>
        </div>
        <section className="quiz-panel">
          <div className="quiz-progress">
            <span>
              QUESTION 0{step + 1} <small>/ 05</small>
            </span>
            <span>{step * 20}%</span>
          </div>
          <div className="progress">
            <i style={{ width: `${step * 20}%` }} />
          </div>
          <h2 ref={heading} tabIndex={-1}>
            {questions[step].title}
          </h2>
          <div className="answers">
            {questions[step].answers.map((text, i) => (
              <button key={text} onClick={() => pick(i)}>
                <span>{String.fromCharCode(65 + i)}</span>
                {text}
                <ChevronRight size={18} />
              </button>
            ))}
          </div>
          <div className="quiz-foot">
            {step > 0 ? (
              <button className="text-button" onClick={() => setStep(step - 1)}>
                <ChevronLeft size={16} /> Previous question
              </button>
            ) : (
              <span>
                <Shield size={14} /> No account needed
              </span>
            )}
            <span>Your choices shape the result.</span>
          </div>
        </section>
      </div>
      <p className="fine center">
        A creative personality game, not a psychological assessment. Artwork
        comes from a curated original collection.
      </p>
    </section>
  );
}
export function SharedHero({
  code,
  session,
  tell,
}: {
  code: string;
  session: Session;
  tell: Tell;
}) {
  try {
    return (
      <HeroView hero={resultFromCode(code)} session={session} tell={tell} />
    );
  } catch {
    return (
      <section className="page">
        <h1>This hero link is invalid.</h1>
        <a className="btn primary" href="/power">
          Discover your own power
        </a>
      </section>
    );
  }
}
function HeroView({
  hero: h,
  session,
  tell,
  retry,
}: {
  hero: Hero;
  session: Session;
  tell: Tell;
  retry?: () => void;
}) {
  const [name, setName] = useState(h.signature),
    [busy, setBusy] = useState(false),
    [link, setLink] = useState(""),
    [saved, setSaved] = useState(false);
  useEffect(() => {
    setLink(location.origin + "/hero/" + h.code);
    try {
      localStorage.setItem(
        "av-guest-hero",
        JSON.stringify({ code: h.code, name: h.signature }),
      );
    } catch {}
  }, [h.code, h.signature]);
  useEffect(() => {
    if (session.user)
      api("profile")
        .then((d) => {
          try {
            const saved = JSON.parse(d.profile.hero || "null");
            if (saved?.code === h.code) setName(saved.name);
          } catch {}
        })
        .catch(() => {});
  }, [session.user, h.code]);
  const save = async () => {
    setBusy(true);
    try {
      const d = await api("profile");
      await api("profile", "PUT", {
        name: d.profile.name,
        hero: { code: h.code, name },
      });
      setSaved(true);
      tell("Hero saved to your account.");
    } catch (e) {
      tell((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const share = async () => {
    try {
      if (navigator.share)
        await navigator.share({
          title: `My anime power: ${h.power}`,
          text: `I’m a ${h.name}. What’s your power?`,
          url: link,
        });
      else await copy(link);
      event("hero_share");
      tell("Your hero link is ready to share.");
    } catch (e) {
      if ((e as Error).name !== "AbortError")
        tell("Copy the share link below.");
    }
  };
  const download = async () => {
    setBusy(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1350;
      const c = canvas.getContext("2d");
      if (!c) throw Error("Canvas is unavailable.");
      const image = new Image();
      image.src = art(h.art);
      await image.decode();
      c.fillStyle = "#0c101d";
      c.fillRect(0, 0, 1080, 1350);
      const scale = Math.max(1080 / image.width, 930 / image.height);
      c.drawImage(
        image,
        (1080 - image.width * scale) / 2,
        0,
        image.width * scale,
        image.height * scale,
      );
      const g = c.createLinearGradient(0, 500, 0, 1050);
      g.addColorStop(0, "transparent");
      g.addColorStop(1, "#0c101d");
      c.fillStyle = g;
      c.fillRect(0, 500, 1080, 850);
      c.fillStyle = h.color;
      c.font = "24px sans-serif";
      c.fillText("ANIMEVERSE / YOUR ORIGINAL HERO", 64, 925);
      c.fillStyle = "white";
      c.font = "bold 52px sans-serif";
      c.fillText(name, 64, 1010, 950);
      c.font = "32px sans-serif";
      c.fillText(h.name + " · " + h.power, 64, 1070, 950);
      c.fillStyle = h.color;
      c.font = "26px sans-serif";
      c.fillText(h.faction, 64, 1130);
      c.fillStyle = "#b6bacf";
      c.font = "23px sans-serif";
      c.fillText("RIVAL / " + h.rival, 64, 1200, 950);
      c.font = "20px sans-serif";
      c.fillText("Discover your power · " + new URL(link).host, 64, 1280, 950);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(Error("Image export failed."))),
          "image/png",
        ),
      );
      const url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = `animeverse-${h.key}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      event("hero_download");
      tell("Character card downloaded.");
    } catch (e) {
      tell((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="page">
      <Title
        eyebrow="YOUR ORIGIN HAS BEEN REVEALED"
        title="Meet your anime alter ego."
      >
        An original identity shaped by your choices. Your story is still
        unwritten.
      </Title>
      <div className="result-layout">
        <article
          className="hero-card"
          style={{ "--accent": h.color } as CSSProperties}
        >
          <img src={art(h.art)} alt={h.name} />
          <div className="hero-card-overlay" />
          <span className="card-brand">
            ANIMEVERSE <Mark />
          </span>
          <div className="hero-card-copy">
            <span className="eyebrow">{h.faction}</span>
            <h2>{name || h.signature}</h2>
            <p>
              {h.name} <span>✦</span> {h.power}
            </p>
            <small>ORIGIN {h.code} · ORIGINAL HERO EDITION</small>
          </div>
        </article>
        <div className="result-info">
          <span className="tag">YOUR POWER / {h.power.toUpperCase()}</span>
          <h2>{h.name}</h2>
          <label>
            Give your hero a name
            <input
              maxLength={32}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
            />
          </label>
          <div className="trait-grid">
            <div>
              <span>YOUR STRENGTH</span>
              <p>{h.strength}</p>
            </div>
            <div>
              <span>YOUR WEAKNESS</span>
              <p>{h.weakness}</p>
            </div>
          </div>
          <div className="rival">
            <Swords />
            <div>
              <span>YOUR RIVAL ARCHETYPE</span>
              <h3>{h.rival}</h3>
            </div>
          </div>
          <div className="quest">
            <span className="eyebrow">YOUR FIRST STORY PROMPT</span>
            <p>{h.quest}</p>
            <small>
              A creative prompt to begin your story. Playable story chapters
              arrive in a later phase.
            </small>
          </div>
          <div className="button-row">
            <button
              className="btn primary"
              disabled={busy || !name.trim()}
              onClick={download}
            >
              <Download size={17} /> Download card
            </button>
            <button className="btn secondary" onClick={share}>
              <Share2 size={17} /> Share my power
            </button>
          </div>
          <label className="share-label">
            Share link
            <input readOnly value={link} onFocus={(e) => e.target.select()} />
          </label>
          <p className="fine">
            Shared links reproduce your power result; custom names stay in your
            downloaded card and saved profile.
          </p>
          {session.user ? (
            <button
              className="btn secondary full"
              disabled={busy || !name.trim()}
              onClick={save}
            >
              {saved ? <Check size={17} /> : <Bookmark size={17} />}{" "}
              {saved ? "Saved to profile" : "Save hero to my profile"}
            </button>
          ) : (
            <AuthNote path={"/hero/" + h.code} />
          )}
          <div className="button-row">
            <a href="/arena" className="inline-link">
              Take the debate to the arena <ArrowRight size={16} />
            </a>
            {retry && (
              <button className="text-button" onClick={retry}>
                Retake test
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

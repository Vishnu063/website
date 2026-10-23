"use client";
import {
  Sparkles,
  Swords,
  Layers,
  Check,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import { origins } from "../../lib/power";
import { art, event } from "./core";
import type { CSSProperties } from "react";
export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-back" />
        <div className="hero-wash" />
        <div className="petals" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <span key={i} style={{ "--i": i } as CSSProperties}>
              ✧
            </span>
          ))}
        </div>
        <div className="hero-body">
          <div className="eyebrow">
            <span className="dot" /> AN ORIGINAL UNIVERSE. AN EXTRAORDINARY YOU.
          </div>
          <h1>
            You weren’t born
            <br />
            to be a <em>side character.</em>
          </h1>
          <p>
            Discover your power. Find your faction.
            <br />
            Step into an anime story with your name on it.
          </p>
          <div className="hero-buttons">
            <a
              href="/power"
              className="btn primary"
              onClick={() => event("power_start")}
            >
              <Sparkles size={18} /> Discover my power{" "}
              <ArrowUpRight size={18} />
            </a>
            <a href="/arena" className="btn glass">
              <Swords size={18} /> Enter the arena
            </a>
          </div>
          <div className="hero-proof">
            <span>
              <Check size={14} /> Play without an account
            </span>
            <span>
              <Check size={14} /> Original heroes
            </span>
            <span>
              <Check size={14} /> Always free to begin
            </span>
          </div>
        </div>
        <div className="hero-art">
          <img
            src={art("akira")}
            alt="Akira, an original flame guardian, in an illuminated fantasy city"
            fetchPriority="high"
          />
          <div className="art-gradient" />
          <div className="character-label">
            <span className="eyebrow">MEET YOUR POSSIBLE FUTURE</span>
            <strong>Ember Sentinel</strong>
            <small>
              DAWN WARDENS <span>✦</span> SOLAR FLAME
            </small>
          </div>
          <span className="vertical-jp" aria-hidden="true">
            物語の主人公になる
          </span>
        </div>
        <div className="hero-bottom">
          <span>
            01 <i /> THE FIRST CHAPTER
          </span>
          <a href="#choose">YOUR ADVENTURE STARTS BELOW ↓</a>
          <span>世界はあなたを待っている</span>
        </div>
      </section>
      <section className="section" id="choose">
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              NO WRONG DOOR. JUST DIFFERENT ADVENTURES.
            </div>
            <h2>
              What’s your next move<span>?</span>
            </h2>
          </div>
          <span className="subtle">
            Less scrolling. More main-character energy.
          </span>
        </div>
        <div className="activity-grid">
          <a className="activity power-activity" href="/power">
            <div className="activity-icon">
              <Sparkles />
            </div>
            <span className="tag">THE PERFECT PLACE TO START</span>
            <h3>
              What’s your
              <br />
              anime power?
            </h3>
            <p>
              Five choices. Your hero, faction, strength…
              <br />
              and the rival you never saw coming.
            </p>
            <div className="activity-bottom">
              <span>2 MIN · NO SIGNUP</span>
              <ArrowUpRight />
            </div>
            <span className="orbit" aria-hidden="true">
              ✦
            </span>
          </a>
          <a className="activity arena-activity" href="/arena">
            <div className="activity-icon">
              <Swords />
            </div>
            <span className="tag">FAN OPINIONS. REAL DISCUSSIONS.</span>
            <h3>
              Settle it
              <br />
              in the arena.
            </h3>
            <p>
              Set the conditions. Pick your side.
              <br />
              Make a case worth defending.
            </p>
            <div className="activity-bottom">
              <span>VOTE · DEBATE · CHALLENGE</span>
              <ArrowUpRight />
            </div>
            <span className="orbit" aria-hidden="true">
              ⚔
            </span>
          </a>
          <a className="activity creator-activity" href="/legacy/studio.html">
            <div className="activity-icon">
              <Layers />
            </div>
            <span className="tag">YOUR LOOK. YOUR LEGEND.</span>
            <h3>
              A hero only
              <br />
              you could create.
            </h3>
            <p>
              Design an original 2D persona.
              <br />
              Take your character card with you.
            </p>
            <div className="activity-bottom">
              <span>CREATE · CUSTOMIZE · DOWNLOAD</span>
              <ArrowUpRight />
            </div>
            <span className="orbit" aria-hidden="true">
              ✺
            </span>
          </a>
        </div>
      </section>
      <section className="section faction-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">FOUR PATHS. ONE UNWRITTEN STORY.</div>
            <h2>Find where you belong.</h2>
          </div>
          <a href="/power" className="inline-link">
            Reveal my faction <ArrowRight size={17} />
          </a>
        </div>
        <div className="faction-grid">
          {origins.map((h, i) => (
            <a
              href="/power"
              className="faction"
              key={h.key}
              style={{ "--accent": h.color } as CSSProperties}
            >
              <img
                src={art(h.art)}
                alt={`${h.name}, original anime hero`}
                loading="lazy"
              />
              <div />
              <span className="faction-number">0{i + 1}</span>
              <section>
                <span className="eyebrow">{h.power}</span>
                <h3>{h.faction}</h3>
                <small>
                  {h.name}
                  <ArrowUpRight size={15} />
                </small>
              </section>
            </a>
          ))}
        </div>
      </section>
      <section className="return-banner">
        <div>
          <span className="eyebrow">A SMALL START. A BIGGER UNIVERSE.</span>
          <h2>
            Your choices are
            <br />
            the beginning.
          </h2>
          <p>
            Start with your identity. Save it to your profile.
            <br />
            Bring a friend into a debate that’s worth having.
          </p>
          <a href="/power" className="btn primary">
            Begin my story <ArrowRight size={18} />
          </a>
        </div>
        <div className="chapter-card">
          <span>YOUR FIRST QUEST</span>
          <h3>
            The last lantern
            <br />
            of Sakura City
          </h3>
          <p>
            Something is waiting beneath the cherry blossoms.
            <br />
            Discover your power to receive your story prompt.
          </p>
          <span>ORIGINAL UNIVERSE · STORY SEED</span>
        </div>
      </section>
    </>
  );
}

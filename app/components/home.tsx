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
import { useState, type CSSProperties } from "react";
const portraits = [
  { name: "Akira", art: "akira", title: "The light that stays.", faction: "Dawn Wardens", power: "Solar flame", description: "A quiet courage. A spark that refuses to go out.", code: "00000" },
  { name: "Luna", art: "luna", title: "A little mystery. All you.", faction: "Celestial Archive", power: "Lunar illusions", description: "For the dreamers who see a different kind of possibility.", code: "11111" },
  { name: "Ren", art: "ren", title: "Born to find another way.", faction: "Skyline Runners", power: "Kinetic lightning", description: "A restless spirit, with the whole skyline ahead.", code: "22222" },
];
export default function Home() {
  const [selected, setSelected] = useState(0);
  const portrait = portraits[selected];
  return (
    <>
      <section className="identity-intro">
        <div>
          <div className="eyebrow">YOUR WORLD. YOUR AFTER HOURS.</div>
          <h1>An identity worth<br /><em>making your own.</em></h1>
          <p>Beautiful original portraits. Your name, your mood, your story.<br />Leave with something you can actually call your own.</p>
        </div>
        <button className="surprise-choice" onClick={() => setSelected((selected + 1 + Math.floor(Math.random() * 2)) % portraits.length)}>
          <span><Sparkles size={18} /> Surprise me</span>
          <small>A different face. A different beginning.</small>
        </button>
      </section>
      <section className="identity-workspace" aria-label="Find your original anime character">
        <div className="identity-flow">
          <ol className="identity-steps">
            <li><i>01</i><span>Choose<small>Your starting point</small></span></li>
            <li><i>02</i><span>Personalize<small>Make the story yours</small></span></li>
            <li><i>03</i><span>Take it with you<small>Save a shareable card</small></span></li>
          </ol>
          <div className="eyebrow">A PORTRAIT, FULL OF POSSIBILITY</div>
          <h2>Who feels like you?</h2>
          <div className="identity-choices" role="group" aria-label="Original portraits">
            {portraits.map((p, i) => <button key={p.art} aria-pressed={selected === i} aria-label={`Choose ${p.name}`} onClick={() => setSelected(i)}>
              <div><img src={art(p.art)} alt={`${p.name}, an original anime character`} fetchPriority={i === 0 ? "high" : "auto"} />{selected === i && <span className="portrait-check"><Check size={13} /></span>}</div>
              <span><b>{p.name}</b><small>{p.power}</small></span>
            </button>)}
          </div>
          <p className="identity-hint">Choose a face that speaks to you. There’s no wrong beginning.</p>
          <div className="identity-selection" aria-live="polite">
            <span className="eyebrow">{portrait.faction}</span>
            <h3>{portrait.title}</h3>
            <p>{portrait.description}</p>
          </div>
          <div className="identity-actions">
            <a href={`/hero/${portrait.code}`} className="btn primary">Make this my identity <ArrowUpRight size={17} /></a>
            <a href="/power" className="inline-link" onClick={() => event("power_start")}>Discover my power <ArrowRight size={16} /></a>
          </div>
          <a className="identity-studio-link" href="/legacy/portraits.html">Want more? Open the full portrait studio ↗</a>
        </div>
        <div className="identity-preview">
          <div className="preview-topline"><span>YOUR ORIGINAL CHARACTER</span><span>2D PORTRAIT</span></div>
          <div className="identity-image">
            <img src={art(portrait.art)} alt={`${portrait.name} portrait preview`} fetchPriority="high" />
            <div className="identity-caption"><span>{portrait.faction}</span><h2>{portrait.name}<em> / {portrait.power}</em></h2></div>
          </div>
          <div className="preview-foot"><span>YOUR NEXT CHAPTER STARTS HERE</span><span>✦</span></div>
        </div>
      </section>
      <section className="section" id="choose">
        <a className="btn primary" href="/play">Enter the play universe <ArrowRight size={17}/></a>
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

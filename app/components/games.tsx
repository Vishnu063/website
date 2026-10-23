"use client";
import { useEffect, useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import {
  playApi,
  PlayPage,
  ProgressStrip,
  usePlay,
  LoadState,
  useAction,
  routes,
} from "./play-common";
import { quizModes, difficulties } from "../../lib/game-content";
import { art, type Tell } from "./core";
import { collections } from "../../lib/adventure-content";
const labels = {
  anime: "Guess the anime",
  character: "Guess the character",
  emoji: "Emoji challenge",
  trivia: "Daily trivia",
};
export function PlayHub() {
  return (
    <PlayPage title="What happens next is up to you.">
      <ProgressStrip />
      <div className="play-hero">
        <span>PLAY FIRST. FIND YOUR PEOPLE.</span>
        <h2>
          A little mystery.
          <br />
          <em>A world of possibility.</em>
        </h2>
        <p>
          Try a quiz, meet your rival or follow a lantern into Sakura City. No
          account needed to begin.
        </p>
        <a className="btn primary" href="/games">
          Play today’s clues <ArrowRight size={17} />
        </a>
      </div>
      <div className="play-grid">
        {routes.map(([href, name, description], i) => (
          <a className="play-tile" key={href} href={href}>
            <span className="eyebrow">
              {String(i + 1).padStart(2, "0")} / ANIMEVERSE
            </span>
            <h2>{name}</h2>
            <p>{description}</p>
            <ArrowRight size={18} />
          </a>
        ))}
      </div>
    </PlayPage>
  );
}
export function Games({ tell }: { tell: Tell }) {
  const [mode, setMode] = useState("anime"),
    [difficulty, setDifficulty] = useState("normal"),
    [run, setRun] = useState<any>(null),
    [feedback, setFeedback] = useState(false),
    [tick, setTick] = useState(Date.now());
  const { busy, act } = useAction(tell),
    history = usePlay("history");
  useEffect(() => {
    const t = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const answer = (answer: number) =>
    act(async () => {
      const out = await playApi(`quiz/${run.id}/answer`, "POST", {
        answer,
        version: run.version,
      });
      setRun(out);
      setFeedback(true);
      if (out.complete) history.load();
    });
  return (
    <PlayPage
      title="Five clues. One good distraction."
      eyebrow="DAILY GUESSING GAMES"
    >
      <ProgressStrip />
      {!run ? (
        <div className="game-stage">
          <span className="eyebrow">NEW CLUES EVERY DAY · 00:00 UTC</span>
          <h2>What do you know?</h2>
          <p>
            Five original text clues per round. Correct answers earn 100 points,
            or 60 after a hint. Your first completed round in each mode per UTC
            day counts for XP and rankings. Later rounds are practice.
          </p>
          <label>
            Challenge type
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              {quizModes.map((m) => (
                <option value={m} key={m}>
                  {labels[m]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Difficulty
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              {difficulties.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <p>
            Easy: 70 seconds · Normal: 45 seconds · Hard: 25 seconds per clue.
            Same points; choose your pace.
          </p>
          <button
            disabled={busy}
            className="btn primary"
            onClick={() =>
              act(async () => {
                const out = await playApi("quiz/start", "POST", {
                  mode,
                  difficulty,
                });
                setRun(out);
                setFeedback(!!out.awaiting);
              })
            }
          >
            <Sparkles size={17} /> Start my round
          </button>
        </div>
      ) : (
        <div className="game-stage">
          <div className="game-top">
            <span>{labels[run.mode as keyof typeof labels]}</span>
            <span>{run.score} points</span>
          </div>
          <progress
            max={run.total}
            value={run.index}
            aria-label="Quiz progress"
          />
          {feedback && run.feedback ? (
            <div role="status">
              <span className="eyebrow">
                {run.feedback.correct
                  ? "YOU FOUND IT"
                  : run.feedback.expired
                    ? "TIME’S UP"
                    : "A NEW ONE TO REMEMBER"}
              </span>
              <h2>{run.feedback.answer}</h2>
              <p>{run.feedback.explanation}</p>
              <button
                className="btn primary"
                disabled={busy}
                onClick={() =>
                  act(async () => {
                    if (!run.complete)
                      setRun(await playApi(`quiz/${run.id}/next`, "POST", {}));
                    setFeedback(false);
                  })
                }
              >
                {run.complete ? "See my result" : "Next clue"}{" "}
                <ArrowRight size={17} />
              </button>
            </div>
          ) : run.complete ? (
            <>
              <span className="eyebrow">ROUND COMPLETE</span>
              <h2>{run.score} / 500</h2>
              <p>
                Your results are saved. Your first completion of this mode today
                contributes to your progression.
              </p>
              <button
                className="btn primary"
                onClick={() => {
                  setRun(null);
                  history.load();
                }}
              >
                Play another mode
              </button>
              <a className="btn glass" href="/quests">
                See my missions
              </a>
            </>
          ) : (
            <>
              <div className="game-top">
                <small>
                  CLUE {run.index + 1} OF {run.total}
                </small>
                <span className="timer" role="timer">
                  {Math.max(0, Math.ceil((run.deadline - tick) / 1000))}s
                </span>
              </div>
              <h2 className={run.mode === "emoji" ? "emoji-clue" : ""}>
                {run.question.clue}
              </h2>
              <div className="answer-grid">
                {run.question.choices.map((choice: string, i: number) => (
                  <button
                    className="answer"
                    disabled={busy}
                    key={choice}
                    onClick={() => answer(i)}
                  >
                    <span>{String.fromCharCode(65 + i)}</span>
                    {choice}
                  </button>
                ))}
              </div>
              {run.question.hint ? (
                <p className="hint">{run.question.hint}</p>
              ) : (
                <button
                  disabled={busy}
                  className="inline-link"
                  onClick={() =>
                    act(async () =>
                      setRun(await playApi(`quiz/${run.id}/hint`, "POST", {})),
                    )
                  }
                >
                  Reveal a hint · correct answer becomes 60 points
                </button>
              )}
              {tick > run.deadline && (
                <button
                  className="btn glass"
                  disabled={busy}
                  onClick={() => answer(-1)}
                >
                  Reveal answer and continue
                </button>
              )}
            </>
          )}
        </div>
      )}
      <section className="play-panel">
        <h2>Your recent rounds</h2>
        {history.error ? (
          <LoadState error={history.error} load={history.load} />
        ) : history.data?.runs.filter((r: any) => r.kind === "quiz").length ? (
          <div className="play-list">
            {history.data.runs
              .filter((r: any) => r.kind === "quiz")
              .map((r: any) => (
                <div key={r.id}>
                  <span>
                    {new Date(r.created).toLocaleDateString()} ·{" "}
                    {r.complete ? "Completed" : "In progress"}
                  </span>
                  <b>{r.score} points</b>
                  {!r.complete && (
                    <button
                      className="inline-link"
                      onClick={() =>
                        act(async () => {
                          const out = await playApi("quiz/" + r.id);
                          setRun(out);
                          setFeedback(!!out.awaiting);
                        })
                      }
                    >
                      Resume
                    </button>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <p>Your first round belongs here. Play when you’re ready.</p>
        )}
      </section>
    </PlayPage>
  );
}
export function Quests({ tell }: { tell: Tell }) {
  const { data, error, load, setData } = usePlay("progress"),
    { busy, act } = useAction(tell);
  return (
    <PlayPage title="A reason to return. At your pace." eyebrow="DAILY QUESTS">
      <ProgressStrip />
      {!data ? (
        <LoadState error={error} load={load} />
      ) : (
        <>
          <p>
            Daily missions reset at {new Date(data.resetsAt).toLocaleString()}.
            Weekly progress resets Monday, 00:00 UTC. No streak penalties.
          </p>
          <div className="play-grid">
            {data.quests.map((q: any) => (
              <div className="play-tile" key={q.key}>
                <span className="eyebrow">
                  {q.key === "weekly" ? "WEEKLY" : "DAILY"} · {q.xp} XP
                </span>
                <h2>{q.name}</h2>
                <progress max={q.goal} value={q.progress} aria-label={q.name} />
                <p>
                  {q.progress} / {q.goal}
                </p>
                {q.claimed ? (
                  <span>Reward claimed ✓</span>
                ) : q.progress >= q.goal ? (
                  <button
                    disabled={busy}
                    className="btn primary"
                    onClick={() =>
                      act(async () => {
                        setData(
                          await playApi("quests", "POST", { key: q.key }),
                        );
                        tell("XP added to your adventure.");
                      })
                    }
                  >
                    Claim reward
                  </button>
                ) : (
                  <a className="btn glass" href={q.href}>
                    Start mission
                  </a>
                )}
              </div>
            ))}
          </div>
          <h2>Your reward history</h2>
          <div className="play-list">
            {data.history
              .filter((h: any) => h.kind === "quest")
              .map((h: any) => (
                <div key={h.source}>
                  <span>{h.source.replaceAll(":", " · ")}</span>
                  <b>+{h.xp} XP</b>
                </div>
              ))}
          </div>
        </>
      )}
    </PlayPage>
  );
}
export function Leaderboards() {
  const [period, setPeriod] = useState("week"),
    [kind, setKind] = useState("xp"),
    { data, error, load } = usePlay(
      `leaderboards?period=${period}&kind=${kind}`,
    );
  return (
    <PlayPage title="Earn your place." eyebrow="GENUINE PLAYER RANKINGS">
      <div className="play-controls">
        <label>
          Period
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="day">Today · UTC</option>
            <option value="week">This week · UTC</option>
            <option value="all">All time</option>
          </select>
        </label>
        <label>
          Ranking
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="xp">XP</option>
            <option value="quiz">Quiz points</option>
            <option value="combat">Battle points</option>
            <option value="clan">Clan XP</option>
          </select>
        </label>
      </div>
      <p>
        Only real signed-in participation appears here. Guest practice and
        private profiles are excluded. Clan XP counts points earned after
        joining the current clan.
      </p>
      {!data ? (
        <LoadState error={error} load={load} />
      ) : data.rows.length ? (
        <ol className="rank-list">
          {data.rows.map((r: any, i: number) => (
            <li key={r.id}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <a href={kind === "clan" ? "/clans/" + r.id : "/players/" + r.id}>
                {r.name}
              </a>
              <b>{r.score}</b>
            </li>
          ))}
        </ol>
      ) : (
        <div className="play-empty">
          <h2>The first name could be yours.</h2>
          <p>No qualifying players in this ranking yet.</p>
          <a href="/games" className="btn primary">
            Play a round
          </a>
        </div>
      )}
    </PlayPage>
  );
}
export function PlayerPage({ id, tell }: { id: string; tell: Tell }) {
  const { data, error, load } = usePlay("players/" + id),
    { busy, act } = useAction(tell);
  return (
    <PlayPage title={data?.name || "Player profile"}>
      {!data ? (
        <LoadState error={error} load={load} />
      ) : (
        <div className="play-panel">
          <div className={"passport edition-" + data.cosmetic}>
            <img
              src={art(
                collections.find((c) => c.id === data.cosmetic)?.art || "akira",
              )}
              alt="Equipped original portrait"
            />
            <div>
              <h2>
                Level {data.level} · {data.xp} XP
              </h2>
              <p>{collections.find((c) => c.id === data.cosmetic)?.name}</p>
            </div>
          </div>
          <p>
            Public player code: <code>{id}</code>
          </p>
          <button
            disabled={busy}
            className="btn primary"
            onClick={() =>
              act(async () => {
                const out = await playApi("challenges", "POST", { player: id });
                tell(
                  "Challenge sent. The other player can accept in Notifications.",
                );
              })
            }
          >
            Challenge this player
          </button>
          <div className="play-grid">
            {data.achievements.map((a: any) => (
              <div key={a.id}>
                <h3>{a.name}</h3>
                <p>{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </PlayPage>
  );
}

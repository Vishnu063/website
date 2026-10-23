export class ValidationError extends Error {}
export const questions = [
  {
    title: "The city loses its light. You…",
    answers: [
      "Protect the people nearby",
      "Find the source of the silence",
      "Climb high and search for a signal",
      "Bring strangers together",
    ],
  },
  {
    title: "Choose the place that calls to you.",
    answers: [
      "A mountain under a crimson sky",
      "A moonlit library",
      "A rooftop above neon streets",
      "A forest full of wandering spirits",
    ],
  },
  {
    title: "Your rival has the advantage. You…",
    answers: [
      "Hold your ground",
      "Wait for the opening",
      "Change the rules of the encounter",
      "Turn their strength into teamwork",
    ],
  },
  {
    title: "Which gift would you carry?",
    answers: [
      "A lantern that never goes out",
      "A mirror that reveals hidden paths",
      "A compass that follows possibility",
      "A seed that remembers every kindness",
    ],
  },
  {
    title: "What should your legend stand for?",
    answers: ["Courage", "Understanding", "Freedom", "Connection"],
  },
];
export const origins = [
  {
    key: "ember",
    name: "Ember Sentinel",
    power: "Solar flame",
    faction: "Dawn Wardens",
    strength: "Protects allies under pressure",
    weakness: "Overcommits when others need help",
    rival: "The patient frost tactician",
    art: "akira",
    color: "#fc976a",
    quest: "Find the keeper of the last lantern in Sakura City.",
  },
  {
    key: "moon",
    name: "Moon Weaver",
    power: "Lunar illusions",
    faction: "Celestial Archive",
    strength: "Sees patterns others overlook",
    weakness: "Hesitates when no answer is certain",
    rival: "The fearless daylight duelist",
    art: "luna",
    color: "#c3b1ff",
    quest: "Follow a missing constellation to the Academy observatory.",
  },
  {
    key: "storm",
    name: "Storm Courier",
    power: "Kinetic lightning",
    faction: "Skyline Runners",
    strength: "Adapts quickly to unexpected danger",
    weakness: "Spends energy before planning an escape",
    rival: "The unmovable stone guardian",
    art: "ren",
    color: "#71e5de",
    quest: "Deliver a message across the silent rooftops of Shadow District.",
  },
  {
    key: "spirit",
    name: "Spirit Warden",
    power: "Living resonance",
    faction: "Verdant Covenant",
    strength: "Turns cooperation into resilience",
    weakness: "Struggles to let go of a broken alliance",
    rival: "The solitary ash wanderer",
    art: "luna",
    color: "#b2e3a0",
    quest: "Restore the forgotten bridge inside Spirit Forest.",
  },
];
export function cleanText(
  value: unknown,
  min: number,
  max: number,
  label = "Text",
) {
  if (typeof value !== "string")
    throw new ValidationError(`${label} is required.`);
  const text = value.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  if (text.length < min || text.length > max)
    throw new ValidationError(`${label} must be ${min}–${max} characters.`);
  return text;
}
export function powerResult(value: unknown) {
  if (
    !Array.isArray(value) ||
    value.length !== 5 ||
    value.some((a) => !Number.isInteger(a) || a < 0 || a > 3)
  )
    throw new ValidationError("Answer all five questions.");
  const answers = value as number[],
    counts = [0, 0, 0, 0];
  answers.forEach((a) => counts[a]++);
  const faction = answers.find((a) => counts[a] === Math.max(...counts))!;
  return {
    ...origins[faction],
    code: answers.join(""),
    signature: `${["Dawn", "Dusk", "Astral", "Wild"][answers[1]]} ${["Vanguard", "Seeker", "Drifter", "Keeper"][answers[3]]}`,
  };
}
export function resultFromCode(code: string) {
  if (!/^[0-3]{5}$/.test(code))
    throw new ValidationError("This hero link is invalid.");
  return powerResult([...code].map(Number));
}

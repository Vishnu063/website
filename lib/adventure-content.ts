export const fighters = [
  {
    id: "akira",
    name: "Akira",
    title: "Ember Sentinel",
    style: "Pressure & burn",
    hp: 110,
    attack: 22,
    defense: 8,
    speed: 12,
    special: "Solar flare",
    effect: "Ignites your rival for three turns.",
  },
  {
    id: "luna",
    name: "Luna",
    title: "Moon Weaver",
    style: "Protection & precision",
    hp: 100,
    attack: 20,
    defense: 12,
    speed: 14,
    special: "Moon veil",
    effect: "Shields you and weakens the next enemy strike.",
  },
  {
    id: "ren",
    name: "Ren",
    title: "Storm Courier",
    style: "Fast, decisive attacks",
    hp: 95,
    attack: 24,
    defense: 6,
    speed: 20,
    special: "Lightning step",
    effect: "A powerful burst with a follow-up strike.",
  },
] as const;
export const districts = [
  {
    id: "sakura",
    name: "Sakura City",
    x: 42,
    y: 58,
    level: 1,
    npc: "Akira",
    art: "akira",
    description:
      "Lanterns flicker above a rain-bright street. Someone has stolen the city’s dawn.",
    discovery: "A lantern marked with eight tiny constellations.",
    line: "Someone left this burning for you. Start with the people who still remember the light.",
  },
  {
    id: "shadow",
    name: "Shadow District",
    x: 23,
    y: 53,
    level: 1,
    npc: "Ren",
    art: "ren",
    description: "Rooftops, rain and messages delivered without names.",
    discovery: "A courier’s cipher, hidden inside a broken compass.",
    line: "The shortest road isn’t always the safest. Listen before you run.",
  },
  {
    id: "academy",
    name: "Celestial Academy",
    x: 57,
    y: 31,
    level: 2,
    npc: "Luna",
    art: "luna",
    description:
      "An observatory keeps a catalogue of stars that have vanished.",
    discovery: "A missing star is still visible in the Academy’s old mirror.",
    line: "A reflection remembers what the sky forgets. Look for what moved, not what vanished.",
  },
  {
    id: "forest",
    name: "Spirit Forest",
    x: 75,
    y: 42,
    level: 2,
    npc: "Luna",
    art: "luna",
    description: "The trees hum in a language that responds to kindness.",
    discovery:
      "A living bridge grows when two strangers agree to trust each other.",
    line: "You cannot force a forest to open. Offer it a reason.",
  },
  {
    id: "colosseum",
    name: "Battle Colosseum",
    x: 54,
    y: 69,
    level: 1,
    npc: "Akira",
    art: "akira",
    description:
      "Here, rivals learn each other’s strengths without becoming enemies.",
    discovery:
      "An old champion’s note: courage includes knowing when to defend.",
    line: "Watch their intent. Protect your energy. You don’t need to win every turn.",
  },
  {
    id: "harbor",
    name: "Moonlight Harbor",
    x: 23,
    y: 79,
    level: 3,
    npc: "Ren",
    art: "ren",
    description: "Ships carry bottled memories across a silver sea.",
    discovery: "The harbor bell carries a message from tomorrow.",
    line: "Some messages need a witness, not a messenger.",
  },
  {
    id: "mountains",
    name: "Crystal Mountains",
    x: 74,
    y: 16,
    level: 3,
    npc: "Luna",
    art: "luna",
    description: "A frozen constellation sleeps inside the mountain.",
    discovery: "A crystal shard reflects the choice you have not yet made.",
    line: "The mountain shows possibilities. You still choose the path.",
  },
  {
    id: "guild",
    name: "Guild Headquarters",
    x: 36,
    y: 27,
    level: 2,
    npc: "Akira",
    art: "akira",
    description:
      "A table with room for one more name. Your people might be waiting.",
    discovery: "The guild’s founding promise: nobody guards the dawn alone.",
    line: "Bring your story. We’ll find a place for it here.",
  },
] as const;
export const chapterNames = [
  "The last lantern",
  "A bridge made of promises",
  "What the dawn remembers",
];
export function sceneFor(s: any): any {
  const f = s.flags || {};
  if (s.chapter === 0) {
    if (s.scene === 0)
      return {
        speaker: "Akira",
        art: "akira",
        title: chapterNames[0],
        text: "Sakura City has gone dark. A frightened child holds the last lantern while a masked courier disappears into the rain.",
        choices: [
          { id: "help", text: "Stay with the child. Protect the light." },
          { id: "chase", text: "Follow the courier into the Shadow District." },
        ],
      };
    if (s.scene === 1)
      return {
        speaker: f.kindness ? "Akira" : "Ren",
        art: f.kindness ? "akira" : "ren",
        title: "A different kind of clue",
        text: f.kindness
          ? "The child offers you a paper star. “The forest will know you helped.” Akira promises to stand beside you."
          : "Ren was carrying medicine, not stolen light. He shows you a cipher pointing toward the Academy. “Next time, ask before you chase.”",
        choices: [
          {
            id: "trust",
            text: f.kindness
              ? "Ask Akira to join your journey."
              : "Apologize and ask Ren for help.",
          },
          { id: "alone", text: "Keep the clue and continue alone." },
        ],
      };
    return {
      speaker: "Luna",
      art: "luna",
      title: "A name in the dark",
      text: "The lantern shows eight constellations. One belongs to a bridge that exists only when someone keeps a promise.",
      choices: [
        { id: "promise", text: "Promise to bring the lost light home." },
        { id: "truth", text: "Promise to uncover why it was taken." },
      ],
    };
  }
  if (s.chapter === 1) {
    if (s.scene === 0)
      return {
        speaker: "Luna",
        art: "luna",
        title: chapterNames[1],
        text: f.kindness
          ? "The Spirit Forest recognizes the paper star. A living bridge reaches halfway across the mist."
          : "The forest refuses your cipher. A broken bridge lies between you and the keeper of the dawn.",
        choices: [
          ...(f.kindness
            ? [
                {
                  id: "forest",
                  text: "Offer the paper star and ask the forest to grow.",
                },
              ]
            : []),
          {
            id: "repair",
            text: "Work with the townspeople to repair the crossing.",
          },
          { id: "shortcut", text: "Cross the hidden Academy passage alone." },
        ],
      };
    if (s.scene === 1)
      return {
        speaker: f.bridge ? "Akira" : "Ren",
        art: f.bridge ? "akira" : "ren",
        title: f.bridge ? "A promise shared" : "The price of a shortcut",
        text: f.bridge
          ? "The restored crossing lets medicine and travelers reach the city again. The people offer you a silver bell."
          : "You reach the keeper first, but the bridge remains broken. Ren asks whether finding an answer is enough if nobody else can follow.",
        choices: [
          {
            id: "listen",
            text: "Listen to the keeper before demanding the light.",
          },
          {
            id: "demand",
            text: "Demand that the keeper restore dawn immediately.",
          },
        ],
      };
    return {
      speaker: "Luna",
      art: "luna",
      title: "The keeper’s confession",
      text: f.listen
        ? "“I hid the light to protect a star that was dying. Returning it without a new home will end its life.”"
        : "The keeper shields the star from you. Its flicker reveals that restoring dawn may destroy the life inside it.",
      choices: [
        {
          id: "protect",
          text: "Seek a way to protect both the city and the star.",
        },
        { id: "city", text: "Put the city first, whatever it takes." },
      ],
    };
  }
  if (s.scene === 0)
    return {
      speaker: "Akira",
      art: "akira",
      title: chapterNames[2],
      text: f.bridge
        ? "The repaired bridge fills with people carrying lanterns. They are ready to share the burden."
        : "The final chamber opens, but the broken crossing leaves the city behind you. Your companions can only send their voices through the cipher.",
      choices: [
        ...(f.bridge && f.protect
          ? [
              {
                id: "share",
                text: "Ask the city to share its light and shelter the star.",
              },
            ]
          : []),
        { id: "return", text: "Return the star to the city’s dawn engine." },
        {
          id: "release",
          text: "Free the star and teach the city to build its own light.",
        },
      ],
    };
  if (s.scene === 1)
    return {
      speaker: "Ren",
      art: "ren",
      title: "What stays with us",
      text:
        f.ending === "shared"
          ? "Every lantern carries a little of the star’s warmth. The city and its keeper become partners."
          : f.ending === "returned"
            ? "The dawn engine wakes. The city survives, and a quiet constellation disappears from the sky."
            : "The star rises into the open sky. Sakura City must learn to light its streets together.",
      choices: [
        {
          id: "remember",
          text: "Write down the people who made this possible.",
        },
        { id: "forward", text: "Leave a message for the next traveler." },
      ],
    };
  return {
    speaker: "Luna",
    art: "luna",
    title: "Your dawn, remembered",
    text: `${f.ending === "shared" ? "The shared dawn" : f.ending === "returned" ? "The restored dawn" : "The independent dawn"} becomes part of Sakura City’s history. ${s.relationships > 0 ? "Your companions promise to return." : "You leave an empty seat for the ally you might meet next."}`,
    choices: [
      { id: "finish", text: "Keep this ending. Begin the next adventure." },
    ],
  };
}
export const collections = [
  {
    id: "akira",
    name: "Akira · Ember Sentinel",
    art: "akira",
    category: "Hero",
    rarity: "Founding",
    xp: 0,
    description:
      "A guardian whose quiet courage keeps Sakura City’s last lantern burning.",
  },
  {
    id: "luna",
    name: "Luna · Moon Weaver",
    art: "luna",
    category: "Hero",
    rarity: "Founding",
    xp: 0,
    description:
      "An archivist who sees possibilities in the spaces between constellations.",
  },
  {
    id: "ren",
    name: "Ren · Storm Courier",
    art: "ren",
    category: "Hero",
    rarity: "Founding",
    xp: 0,
    description:
      "A rooftop courier who believes every message deserves a way home.",
  },
  {
    id: "ember-frame",
    name: "Dawn edition",
    art: "akira",
    category: "Portrait edition",
    rarity: "Uncommon",
    xp: 100,
    description:
      "Akira’s original portrait in a warm dawn frame. An edition, not a new illustration.",
  },
  {
    id: "moon-frame",
    name: "Moonlit edition",
    art: "luna",
    category: "Portrait edition",
    rarity: "Rare",
    xp: 300,
    description: "Luna’s original portrait with a silver constellation frame.",
  },
  {
    id: "storm-frame",
    name: "Storm edition",
    art: "ren",
    category: "Portrait edition",
    rarity: "Rare",
    xp: 500,
    description: "Ren’s original portrait with a luminous cyan frame.",
  },
  {
    id: "dawn-legend",
    name: "Keeper of the dawn",
    art: "akira",
    category: "Profile frame",
    rarity: "Epic",
    xp: 1000,
    description: "A golden profile frame honoring a thousand earned XP.",
  },
] as const;

export const districtQuests: Record<
  string,
  { name: string; kind: string; goal: number; href: string }
> = {
  sakura: {
    name: "Bring three quiz insights back to the lantern keeper",
    kind: "quiz",
    goal: 3,
    href: "/games",
  },
  shadow: {
    name: "Prove your timing in an original combat victory",
    kind: "combat",
    goal: 1,
    href: "/combat",
  },
  academy: {
    name: "Complete two daily quiz modes for the Archive",
    kind: "quiz",
    goal: 2,
    href: "/games",
  },
  forest: {
    name: "Finish a chapter and bring its promise to the forest",
    kind: "story",
    goal: 1,
    href: "/story",
  },
  colosseum: {
    name: "Earn two original combat victories",
    kind: "combat",
    goal: 2,
    href: "/combat",
  },
  harbor: {
    name: "Complete two chapters before reading the harbor bell",
    kind: "story",
    goal: 2,
    href: "/story",
  },
  mountains: {
    name: "Collect six district discoveries",
    kind: "codex",
    goal: 6,
    href: "/world",
  },
  guild: {
    name: "Cast a real community poll vote",
    kind: "poll",
    goal: 1,
    href: "/polls",
  },
};

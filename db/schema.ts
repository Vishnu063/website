import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  index,
} from "drizzle-orm/sqlite-core";
export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  hero: text("hero"),
  created: integer("created").notNull(),
});
export const battles = sqliteTable(
  "battles",
  {
    id: text("id").primaryKey(),
    owner: text("owner").notNull(),
    title: text("title").notNull(),
    left: text("left_name").notNull(),
    right: text("right_name").notNull(),
    scenario: text("scenario").notNull(),
    conditions: text("conditions").notNull(),
    created: integer("created").notNull(),
    hidden: integer("hidden").notNull().default(0),
  },
  (t) => [index("battle_created").on(t.created)],
);
export const votes = sqliteTable(
  "votes",
  {
    battle: text("battle")
      .notNull()
      .references(() => battles.id, { onDelete: "cascade" }),
    user: text("user").notNull(),
    choice: text("choice").notNull(),
  },
  (t) => [primaryKey({ columns: [t.battle, t.user] })],
);
export const comments = sqliteTable(
  "comments",
  {
    id: text("id").primaryKey(),
    battle: text("battle")
      .notNull()
      .references(() => battles.id, { onDelete: "cascade" }),
    user: text("user").notNull(),
    parent: text("parent"),
    body: text("body").notNull(),
    created: integer("created").notNull(),
    hidden: integer("hidden").notNull().default(0),
  },
  (t) => [index("comment_battle").on(t.battle, t.created)],
);
export const follows = sqliteTable(
  "follows",
  {
    battle: text("battle")
      .notNull()
      .references(() => battles.id, { onDelete: "cascade" }),
    user: text("user").notNull(),
  },
  (t) => [primaryKey({ columns: [t.battle, t.user] })],
);
export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(),
  user: text("user").notNull(),
  kind: text("kind").notNull(),
  target: text("target").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("open"),
  created: integer("created").notNull(),
});
export const blocks = sqliteTable(
  "blocks",
  { user: text("user").notNull(), target: text("target").notNull() },
  (t) => [primaryKey({ columns: [t.user, t.target] })],
);
export const limits = sqliteTable("limits", {
  key: text("key").primaryKey(),
  bucket: integer("bucket").notNull(),
  count: integer("count").notNull(),
});
export const audit = sqliteTable("audit", {
  id: text("id").primaryKey(),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  target: text("target").notNull(),
  created: integer("created").notNull(),
});

export const gamePlayers = sqliteTable("game_players", {
  user: text("user").primaryKey(), publicId: text("public_id").notNull().unique(),
  settings: text("settings").notNull().default('{}'), created: integer("created").notNull(),
});
export const gameRuns = sqliteTable("game_runs", {
  id: text("id").primaryKey(), user: text("user").notNull(), kind: text("kind").notNull(),
  state: text("state").notNull(), version: integer("version").notNull().default(0),
  score: integer("score").notNull().default(0), complete: integer("complete").notNull().default(0),
  created: integer("created").notNull(), updated: integer("updated").notNull(),
}, t => [index("runs_owner").on(t.user,t.kind,t.updated)]);
export const gameEvents = sqliteTable("game_events", {
  id: text("id").primaryKey(), user: text("user").notNull(), kind: text("kind").notNull(),
  source: text("source").notNull(), xp: integer("xp").notNull(), score: integer("score").notNull().default(0),
  created: integer("created").notNull(),
}, t => [index("events_owner").on(t.user,t.created),index("events_kind").on(t.kind,t.created)]);
export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(), user: text("user").notNull(), kind: text("kind").notNull(),
  title: text("title").notNull(), href: text("href").notNull(), read: integer("read").notNull().default(0),
  created: integer("created").notNull(),
}, t => [index("notifications_owner").on(t.user,t.created)]);

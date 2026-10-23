import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  index,
  uniqueIndex,
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
  slot: text("slot"), state: text("state").notNull(), version: integer("version").notNull().default(0),
  score: integer("score").notNull().default(0), complete: integer("complete").notNull().default(0),
  created: integer("created").notNull(), updated: integer("updated").notNull(),
}, t => [index("runs_owner").on(t.user,t.kind,t.updated),uniqueIndex("runs_slot").on(t.user,t.kind,t.slot)]);
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

export const clans = sqliteTable("clans", {
 id:text("id").primaryKey(),name:text("name").notNull().unique(),bio:text("bio").notNull(),owner:text("owner").notNull(),archived:integer("archived").notNull().default(0),created:integer("created").notNull(),
});
export const clanMembers=sqliteTable("clan_members",{
 user:text("user").primaryKey(),clan:text("clan").notNull().references(()=>clans.id,{onDelete:'cascade'}),role:text("role").notNull(),joined:integer("joined").notNull(),
},t=>[index('clan_roster').on(t.clan)]);
export const invitations=sqliteTable('invitations',{
 id:text('id').primaryKey(),sender:text('sender').notNull(),target:text('target').notNull(),kind:text('kind').notNull(),object:text('object').notNull(),status:text('status').notNull().default('open'),created:integer('created').notNull(),
},t=>[index('invitations_target').on(t.target,t.status)]);
export const tournaments=sqliteTable('tournaments',{
 id:text('id').primaryKey(),name:text('name').notNull(),starts:integer('starts').notNull(),ends:integer('ends').notNull(),status:text('status').notNull().default('registration'),winner:text('winner'),created:integer('created').notNull(),
});
export const tournamentEntries=sqliteTable('tournament_entries',{
 tournament:text('tournament').notNull().references(()=>tournaments.id,{onDelete:'cascade'}),user:text('user').notNull(),slot:integer('slot').notNull(),created:integer('created').notNull(),
},t=>[primaryKey({columns:[t.tournament,t.user]}),uniqueIndex('entry_slot').on(t.tournament,t.slot)]);
export const matches=sqliteTable('matches',{
 id:text('id').primaryKey(),tournament:text('tournament').notNull().references(()=>tournaments.id,{onDelete:'cascade'}),round:integer('round').notNull(),position:integer('position').notNull(),left:text('left_user'),right:text('right_user'),winner:text('winner'),status:text('status').notNull().default('open'),
},t=>[uniqueIndex('match_slot').on(t.tournament,t.round,t.position)]);
export const matchEntries=sqliteTable('match_entries',{
 match:text('match').notNull().references(()=>matches.id,{onDelete:'cascade'}),user:text('user').notNull(),run:text('run').notNull().unique(),score:integer('score'),
},t=>[primaryKey({columns:[t.match,t.user]})]);
export const polls=sqliteTable('polls',{
 id:text('id').primaryKey(),owner:text('owner').notNull(),question:text('question').notNull(),options:text('options').notNull(),hidden:integer('hidden').notNull().default(0),created:integer('created').notNull(),
});
export const pollVotes=sqliteTable('poll_votes',{
 poll:text('poll').notNull(),user:text('user').notNull(),choice:integer('choice').notNull(),created:integer('created').notNull(),
},t=>[primaryKey({columns:[t.poll,t.user]})]);

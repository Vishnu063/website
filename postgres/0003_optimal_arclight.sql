CREATE TABLE "clans" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"bio" text NOT NULL,
	"owner" text NOT NULL,
	"archived" bigint DEFAULT 0 NOT NULL,
	"created" bigint NOT NULL
);

CREATE TABLE "clan_members" (
	"user" text PRIMARY KEY NOT NULL,
	"clan" text NOT NULL,
	"role" text NOT NULL,
	"joined" bigint NOT NULL,
	FOREIGN KEY ("clan") REFERENCES "clans"("id") ON UPDATE no action ON DELETE cascade
);

CREATE TABLE "invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"sender" text NOT NULL,
	"target" text NOT NULL,
	"kind" text NOT NULL,
	"object" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created" bigint NOT NULL
);

CREATE TABLE "poll_votes" (
	"poll" text NOT NULL,
	"user" text NOT NULL,
	"choice" bigint NOT NULL,
	"created" bigint NOT NULL,
	PRIMARY KEY("poll", "user")
);

CREATE TABLE "polls" (
	"id" text PRIMARY KEY NOT NULL,
	"owner" text NOT NULL,
	"question" text NOT NULL,
	"options" text NOT NULL,
	"hidden" bigint DEFAULT 0 NOT NULL,
	"created" bigint NOT NULL
);

CREATE TABLE "tournaments" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"starts" bigint NOT NULL,
	"ends" bigint NOT NULL,
	"status" text DEFAULT 'registration' NOT NULL,
	"winner" text,
	"created" bigint NOT NULL
);

CREATE TABLE "matches" (
	"id" text PRIMARY KEY NOT NULL,
	"tournament" text NOT NULL,
	"round" bigint NOT NULL,
	"position" bigint NOT NULL,
	"left_user" text,
	"right_user" text,
	"winner" text,
	"status" text DEFAULT 'open' NOT NULL,
	FOREIGN KEY ("tournament") REFERENCES "tournaments"("id") ON UPDATE no action ON DELETE cascade
);

CREATE TABLE "match_entries" (
	"match" text NOT NULL,
	"user" text NOT NULL,
	"run" text NOT NULL,
	"score" bigint,
	PRIMARY KEY("match", "user"),
	FOREIGN KEY ("match") REFERENCES "matches"("id") ON UPDATE no action ON DELETE cascade
);

CREATE TABLE "tournament_entries" (
	"tournament" text NOT NULL,
	"user" text NOT NULL,
	"slot" bigint NOT NULL,
	"created" bigint NOT NULL,
	PRIMARY KEY("tournament", "user"),
	FOREIGN KEY ("tournament") REFERENCES "tournaments"("id") ON UPDATE no action ON DELETE cascade
);

CREATE INDEX "clan_roster" ON "clan_members" ("clan");

CREATE UNIQUE INDEX "clans_name_unique" ON "clans" ("name");

CREATE INDEX "invitations_target" ON "invitations" ("target","status");

CREATE UNIQUE INDEX "match_entries_run_unique" ON "match_entries" ("run");

CREATE UNIQUE INDEX "match_slot" ON "matches" ("tournament","round","position");

CREATE UNIQUE INDEX "entry_slot" ON "tournament_entries" ("tournament","slot");

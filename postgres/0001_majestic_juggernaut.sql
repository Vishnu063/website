CREATE TABLE "game_events" (
	"id" text PRIMARY KEY NOT NULL,
	"user" text NOT NULL,
	"kind" text NOT NULL,
	"source" text NOT NULL,
	"xp" bigint NOT NULL,
	"score" bigint DEFAULT 0 NOT NULL,
	"created" bigint NOT NULL
);

CREATE TABLE "game_players" (
	"user" text PRIMARY KEY NOT NULL,
	"public_id" text NOT NULL,
	"settings" text DEFAULT '{}' NOT NULL,
	"created" bigint NOT NULL
);

CREATE TABLE "game_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"user" text NOT NULL,
	"kind" text NOT NULL,
	"state" text NOT NULL,
	"version" bigint DEFAULT 0 NOT NULL,
	"score" bigint DEFAULT 0 NOT NULL,
	"complete" bigint DEFAULT 0 NOT NULL,
	"created" bigint NOT NULL,
	"updated" bigint NOT NULL
);

CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user" text NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"href" text NOT NULL,
	"read" bigint DEFAULT 0 NOT NULL,
	"created" bigint NOT NULL
);

CREATE INDEX "events_owner" ON "game_events" ("user","created");

CREATE INDEX "events_kind" ON "game_events" ("kind","created");

CREATE UNIQUE INDEX "game_players_public_id_unique" ON "game_players" ("public_id");

CREATE INDEX "runs_owner" ON "game_runs" ("user","kind","updated");

CREATE INDEX "notifications_owner" ON "notifications" ("user","created");

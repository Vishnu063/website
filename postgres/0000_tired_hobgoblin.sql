CREATE TABLE "audit" (
	"id" text PRIMARY KEY NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"target" text NOT NULL,
	"created" bigint NOT NULL
);

CREATE TABLE "battles" (
	"id" text PRIMARY KEY NOT NULL,
	"owner" text NOT NULL,
	"title" text NOT NULL,
	"left_name" text NOT NULL,
	"right_name" text NOT NULL,
	"scenario" text NOT NULL,
	"conditions" text NOT NULL,
	"created" bigint NOT NULL,
	"hidden" bigint DEFAULT 0 NOT NULL
);

CREATE TABLE "blocks" (
	"user" text NOT NULL,
	"target" text NOT NULL,
	PRIMARY KEY("user", "target")
);

CREATE TABLE "comments" (
	"id" text PRIMARY KEY NOT NULL,
	"battle" text NOT NULL,
	"user" text NOT NULL,
	"parent" text,
	"body" text NOT NULL,
	"created" bigint NOT NULL,
	"hidden" bigint DEFAULT 0 NOT NULL,
	FOREIGN KEY ("battle") REFERENCES "battles"("id") ON UPDATE no action ON DELETE cascade
);

CREATE TABLE "follows" (
	"battle" text NOT NULL,
	"user" text NOT NULL,
	PRIMARY KEY("battle", "user"),
	FOREIGN KEY ("battle") REFERENCES "battles"("id") ON UPDATE no action ON DELETE cascade
);

CREATE TABLE "limits" (
	"key" text PRIMARY KEY NOT NULL,
	"bucket" bigint NOT NULL,
	"count" bigint NOT NULL
);

CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"hero" text,
	"created" bigint NOT NULL
);

CREATE TABLE "reports" (
	"id" text PRIMARY KEY NOT NULL,
	"user" text NOT NULL,
	"kind" text NOT NULL,
	"target" text NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created" bigint NOT NULL
);

CREATE TABLE "votes" (
	"battle" text NOT NULL,
	"user" text NOT NULL,
	"choice" text NOT NULL,
	PRIMARY KEY("battle", "user"),
	FOREIGN KEY ("battle") REFERENCES "battles"("id") ON UPDATE no action ON DELETE cascade
);

CREATE INDEX "battle_created" ON "battles" ("created");

CREATE INDEX "comment_battle" ON "comments" ("battle","created");

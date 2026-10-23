CREATE TABLE `game_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`kind` text NOT NULL,
	`source` text NOT NULL,
	`xp` integer NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `events_owner` ON `game_events` (`user`,`created`);--> statement-breakpoint
CREATE INDEX `events_kind` ON `game_events` (`kind`,`created`);--> statement-breakpoint
CREATE TABLE `game_players` (
	`user` text PRIMARY KEY NOT NULL,
	`public_id` text NOT NULL,
	`settings` text DEFAULT '{}' NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `game_players_public_id_unique` ON `game_players` (`public_id`);--> statement-breakpoint
CREATE TABLE `game_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`kind` text NOT NULL,
	`state` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`complete` integer DEFAULT 0 NOT NULL,
	`created` integer NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `runs_owner` ON `game_runs` (`user`,`kind`,`updated`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`href` text NOT NULL,
	`read` integer DEFAULT 0 NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `notifications_owner` ON `notifications` (`user`,`created`);
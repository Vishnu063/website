CREATE TABLE `clan_members` (
	`user` text PRIMARY KEY NOT NULL,
	`clan` text NOT NULL,
	`role` text NOT NULL,
	`joined` integer NOT NULL,
	FOREIGN KEY (`clan`) REFERENCES `clans`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `clan_roster` ON `clan_members` (`clan`);--> statement-breakpoint
CREATE TABLE `clans` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`bio` text NOT NULL,
	`owner` text NOT NULL,
	`archived` integer DEFAULT 0 NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clans_name_unique` ON `clans` (`name`);--> statement-breakpoint
CREATE TABLE `invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`sender` text NOT NULL,
	`target` text NOT NULL,
	`kind` text NOT NULL,
	`object` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `invitations_target` ON `invitations` (`target`,`status`);--> statement-breakpoint
CREATE TABLE `match_entries` (
	`match` text NOT NULL,
	`user` text NOT NULL,
	`run` text NOT NULL,
	`score` integer,
	PRIMARY KEY(`match`, `user`),
	FOREIGN KEY (`match`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `match_entries_run_unique` ON `match_entries` (`run`);--> statement-breakpoint
CREATE TABLE `matches` (
	`id` text PRIMARY KEY NOT NULL,
	`tournament` text NOT NULL,
	`round` integer NOT NULL,
	`position` integer NOT NULL,
	`left_user` text,
	`right_user` text,
	`winner` text,
	`status` text DEFAULT 'open' NOT NULL,
	FOREIGN KEY (`tournament`) REFERENCES `tournaments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `match_slot` ON `matches` (`tournament`,`round`,`position`);--> statement-breakpoint
CREATE TABLE `poll_votes` (
	`poll` text NOT NULL,
	`user` text NOT NULL,
	`choice` integer NOT NULL,
	`created` integer NOT NULL,
	PRIMARY KEY(`poll`, `user`)
);
--> statement-breakpoint
CREATE TABLE `polls` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`question` text NOT NULL,
	`options` text NOT NULL,
	`hidden` integer DEFAULT 0 NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tournament_entries` (
	`tournament` text NOT NULL,
	`user` text NOT NULL,
	`slot` integer NOT NULL,
	`created` integer NOT NULL,
	PRIMARY KEY(`tournament`, `user`),
	FOREIGN KEY (`tournament`) REFERENCES `tournaments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `entry_slot` ON `tournament_entries` (`tournament`,`slot`);--> statement-breakpoint
CREATE TABLE `tournaments` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`starts` integer NOT NULL,
	`ends` integer NOT NULL,
	`status` text DEFAULT 'registration' NOT NULL,
	`winner` text,
	`created` integer NOT NULL
);

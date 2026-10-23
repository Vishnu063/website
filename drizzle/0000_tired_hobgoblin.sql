CREATE TABLE `audit` (
	`id` text PRIMARY KEY NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`target` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `battles` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`title` text NOT NULL,
	`left_name` text NOT NULL,
	`right_name` text NOT NULL,
	`scenario` text NOT NULL,
	`conditions` text NOT NULL,
	`created` integer NOT NULL,
	`hidden` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `battle_created` ON `battles` (`created`);--> statement-breakpoint
CREATE TABLE `blocks` (
	`user` text NOT NULL,
	`target` text NOT NULL,
	PRIMARY KEY(`user`, `target`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`battle` text NOT NULL,
	`user` text NOT NULL,
	`parent` text,
	`body` text NOT NULL,
	`created` integer NOT NULL,
	`hidden` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`battle`) REFERENCES `battles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `comment_battle` ON `comments` (`battle`,`created`);--> statement-breakpoint
CREATE TABLE `follows` (
	`battle` text NOT NULL,
	`user` text NOT NULL,
	PRIMARY KEY(`battle`, `user`),
	FOREIGN KEY (`battle`) REFERENCES `battles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `limits` (
	`key` text PRIMARY KEY NOT NULL,
	`bucket` integer NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`hero` text,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`kind` text NOT NULL,
	`target` text NOT NULL,
	`reason` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`battle` text NOT NULL,
	`user` text NOT NULL,
	`choice` text NOT NULL,
	PRIMARY KEY(`battle`, `user`),
	FOREIGN KEY (`battle`) REFERENCES `battles`(`id`) ON UPDATE no action ON DELETE cascade
);

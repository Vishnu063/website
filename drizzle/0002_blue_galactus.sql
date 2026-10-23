ALTER TABLE `game_runs` ADD `slot` text;--> statement-breakpoint
CREATE UNIQUE INDEX `runs_slot` ON `game_runs` (`user`,`kind`,`slot`);
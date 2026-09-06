CREATE TABLE `assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`participant` text NOT NULL,
	`clip` text NOT NULL,
	`created` integer NOT NULL,
	FOREIGN KEY (`participant`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`clip`) REFERENCES `clips`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `clips` (
	`id` text PRIMARY KEY NOT NULL,
	`participant` text NOT NULL,
	`prompt` text NOT NULL,
	`object_key` text NOT NULL,
	`mime` text NOT NULL,
	`bytes` integer NOT NULL,
	`duration` integer NOT NULL,
	`attempts` integer NOT NULL,
	`created` integer NOT NULL,
	FOREIGN KEY (`participant`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`prompt`) REFERENCES `prompts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clips_prompt_unique` ON `clips` (`prompt`);--> statement-breakpoint
CREATE TABLE `participants` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`profile` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `participants_token_hash_unique` ON `participants` (`token_hash`);--> statement-breakpoint
CREATE TABLE `prompts` (
	`id` text PRIMARY KEY NOT NULL,
	`participant` text NOT NULL,
	`digits` text NOT NULL,
	`protocol` text NOT NULL,
	`created` integer NOT NULL,
	FOREIGN KEY (`participant`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `responses` (
	`id` text PRIMARY KEY NOT NULL,
	`participant` text NOT NULL,
	`assignment` text NOT NULL,
	`raw` text NOT NULL,
	`result` text NOT NULL,
	`elapsed` integer NOT NULL,
	`plays` integer NOT NULL,
	`unsure` integer NOT NULL,
	`created` integer NOT NULL,
	FOREIGN KEY (`participant`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assignment`) REFERENCES `assignments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `responses_assignment_unique` ON `responses` (`assignment`);
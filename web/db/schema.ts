import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const participants = sqliteTable('participants', {
  id:text('id').primaryKey(), tokenHash:text('token_hash').notNull().unique(), profile:text('profile').notNull(), created:integer('created').notNull(),
});
export const prompts = sqliteTable('prompts', {
  id:text('id').primaryKey(), participant:text('participant').notNull().references(()=>participants.id), digits:text('digits').notNull(), protocol:text('protocol').notNull(), created:integer('created').notNull(),
});
export const clips = sqliteTable('clips', {
  id:text('id').primaryKey(), participant:text('participant').notNull().references(()=>participants.id), prompt:text('prompt').notNull().unique().references(()=>prompts.id), objectKey:text('object_key').notNull(), mime:text('mime').notNull(), bytes:integer('bytes').notNull(), duration:integer('duration').notNull(), attempts:integer('attempts').notNull(), created:integer('created').notNull(),
});
export const assignments = sqliteTable('assignments', {
  id:text('id').primaryKey(), participant:text('participant').notNull().references(()=>participants.id), clip:text('clip').notNull().references(()=>clips.id), created:integer('created').notNull(),
});
export const responses = sqliteTable('responses', {
  id:text('id').primaryKey(), participant:text('participant').notNull().references(()=>participants.id), assignment:text('assignment').notNull().unique().references(()=>assignments.id), raw:text('raw').notNull(), result:text('result').notNull(), elapsed:integer('elapsed').notNull(), plays:integer('plays').notNull(), unsure:integer('unsure').notNull(), created:integer('created').notNull(),
});

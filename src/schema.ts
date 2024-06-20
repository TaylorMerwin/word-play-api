import { integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users_table', {
  userId: serial('user_id').primaryKey(),
  userName: varchar('user_name').notNull(),
  email: varchar('email').notNull().unique(),
  passwordHash: varchar('password_hash').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const entryTable = pgTable('writing_entry_table', {
  entryId: serial('entry_id').primaryKey(),
  userId: integer('user_id').notNull().references(()=> usersTable.userId),
  entryText: text('entry_text').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  wordCount: integer('word_count').notNull(),
  writingPromptId: integer('writing_prompt_id').notNull().references(()=> promptTable.promptId),
});

export const promptTable = pgTable('writing_prompt_table', {
  promptId: serial('prompt_id').primaryKey(),
  promptText: text('prompt_text').notNull(),
  genre: varchar('genre').notNull(),
  theme: varchar('theme').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type InsertEntry = typeof entryTable.$inferInsert;
export type SelectEntry = typeof entryTable.$inferSelect;

export type InsertPrompt = typeof promptTable.$inferInsert;
export type SelectPrompt = typeof promptTable.$inferSelect;


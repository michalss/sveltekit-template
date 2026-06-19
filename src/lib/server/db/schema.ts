import { mysqlTable, serial, int, text } from 'drizzle-orm/mysql-core';

// Example application table — replace with your own domain tables.
export const task = mysqlTable('task', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	priority: int('priority').notNull().default(1)
});

// Better Auth tables (user, session, account, verification).
// Regenerate with: npm run auth:schema
export * from './auth.schema';

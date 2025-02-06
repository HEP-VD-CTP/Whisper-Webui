import { 
  mysqlTable, 
  index,
  binary,
  boolean, 
  datetime,
  varchar 
} from 'drizzle-orm/mysql-core';

export const usersTable = mysqlTable('users', {
  id: binary({ length: 12 }).primaryKey(),
  firstname: varchar({ length: 255 }).notNull(),
  lastname: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull(),
  pwd: varchar({ length: 512 }),
  salt: varchar({ length: 45 }),
  admin: boolean().notNull().default(false),
  archived: boolean().notNull().default(false),
  blocked: boolean().notNull().default(false),
  created_at: datetime().notNull()
}, (t) => [
  index('email_idx').on(t.email)
]);

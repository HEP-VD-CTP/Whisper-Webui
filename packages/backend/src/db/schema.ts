import { 
  mysqlTable, 
  index,
  binary,
  boolean, 
  datetime,
  varchar 
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';


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

export const usersFields = Object.freeze({
  id: sql`HEX(${usersTable.id})`,
  firstname: usersTable.firstname,
  lastname: usersTable.lastname,
  email: usersTable.email,
  pwd: usersTable.pwd,
  salt: usersTable.salt,
  admin: usersTable.admin,
  archived: usersTable.archived,
  blocked: usersTable.blocked,
  created_at: usersTable.created_at
});

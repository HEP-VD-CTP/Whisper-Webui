import { User } from 'src/db/types.ts';

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
  index('email_idx').on(t.email),
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

export const usersFields2 = Object.freeze({
  id: `HEX(id) AS id`,
  firstname: `firstname`,
  lastname: `lastname`,
  email: 'email',
  pwd: `pwd`,
  salt: `salt`,
  admin: `admin`,
  archived: `archived`,
  blocked: `blocked`,
  created_at: `created_at`
});

export const usersFields3 = Object.freeze([
  `id`,
  `firstname`,
  `lastname`,
  `email`,
  `pwd`,
  `salt`,
  `admin`,
  `archived`,
  `blocked`,
  `created_at`
]);

export type UserField = typeof usersFields3[number] | "*";
export type UserFieldArray = Array<UserField>;

export function mapUsersFields(fields: UserFieldArray): string {
  if (fields.length == 1 && fields[0] === "*")
    return usersFields3.join(',');
  
  const queryFields = [];
  for (const field of fields)
    if (field in usersFields)
      queryFields.push(field);

  return queryFields.join(`,`);
}

export function parseUsersFields(users: Array<User>): Array<User> {
  for (const user of users){
    if ('id' in user)
      user.id = ((user.id as unknown) as Buffer).toString('hex').toUpperCase();
    if ('admin' in user)
      user.admin = Boolean(user.admin);
    if ('archived' in user)
      user.archived = Boolean(user.archived);
    if ('blocked' in user)
      user.blocked = Boolean(user.blocked);
  }
  return users;
}
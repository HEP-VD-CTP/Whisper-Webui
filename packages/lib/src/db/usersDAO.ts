import { DB, escape, escapeFields } from '@whisper-webui/lib/src/db/db.ts';
import { type User, type UserFields } from '@whisper-webui/lib/src/types/types.ts';

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
    if ('created_at' in user)
      user.created_at = new Date(user.created_at);
  }
  return users;
}

export async function findByEmail(db: DB, email: string, fields: UserFields): Promise<Array<User>> {
  const query = await db.query(`
  SELECT ${escapeFields(fields.join(`,`))}
  FROM users u
  WHERE u.email = ?`, [email]);
  
  return parseUsersFields(query as Array<User>);
}

export async function searchUsers(db: DB, term: string, fields: UserFields): Promise<Array<User>> {
  const users = await db.query(`
  SELECT ${escapeFields(fields.join(`,`))}
  FROM users
  WHERE MATCH(firstname, lastname, email)
  AGAINST(? IN NATURAL LANGUAGE MODE)`, [term]);

  return parseUsersFields(users as Array<User>);
}

export default {
  findByEmail,
  searchUsers
};
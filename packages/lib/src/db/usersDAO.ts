import { DB, escape, escapeFields } from '@whisper-webui/lib/src/db/db.ts';
import { type User, type UserFields } from '@whisper-webui/lib/src/types/types.ts';
import { BadRequestException, NotFoundException } from '@whisper-webui/lib/src/db/exceptions.ts';
import { ResultSetHeader } from 'mysql2/promise';

export function parseFields(users: Array<User>): Array<User> {
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
  
  return parseFields(query as Array<User>);
}

export async function searchUsers(db: DB, term: string, fields: UserFields): Promise<Array<User>> {
  const users = await db.query(`
  SELECT ${escapeFields(fields.join(`,`))}
  FROM users u
  WHERE MATCH(u.firstname, u.lastname, u.email)
  AGAINST(? IN BOOLEAN MODE)
  ORDER BY u.firstname ASC, u.lastname ASC, u.email ASC`, [term]);

  return parseFields(users as Array<User>);
}

export async function update(db: DB, user: User = {}) :Promise<void> {
  if (!(`id` in user))
    throw new BadRequestException(`User id is required to update the user`);

  const id = user.id;
  delete user.id;

  const fields = Object.keys(user);
  const values = fields.map(field => user[field]);
  const setClause = fields.map(field => `${field} = ?`).join(', ');

  const query = `
  UPDATE users
  SET ${escapeFields(setClause)}
  WHERE id = UNHEX(?)`;

  const res = await db.query(query, [...values, id]) as ResultSetHeader;
  if (res.affectedRows === 0)
    throw new NotFoundException(`User not found`);
} 

export default {
  findByEmail,
  searchUsers,
  update,
};
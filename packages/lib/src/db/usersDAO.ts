import { BadRequestException, NotFoundException, ForbiddenException } from '@whisper-webui/lib/src/db/exceptions.ts';
import { db } from '@whisper-webui/lib/src/db/db2.ts';
import { 
  type User, 
  type UpdateUser,
  type UserWithoutPassword,
} from '@whisper-webui/lib/src/types/kysely.ts';
import { sql } from 'kysely';
import crypto from 'node:crypto';

export async function searchUsers(term: string): Promise<Array<UserWithoutPassword>> {
  const users = await db.selectFrom('users')
                        .selectAll()
                        .where((eb) => sql`MATCH(firstname, lastname, email) AGAINST (${term} IN BOOLEAN MODE)`)
                        .orderBy('firstname', 'asc')
                        .orderBy('lastname', 'asc')
                        .orderBy('email', 'asc')
                        .execute();

  for (const user of users){
    if (`pwd` in user)
      delete user.pwd;
    if (`salt` in user)
      delete user.salt;
  }

  return users;
}

export async function update(id: string, user: UpdateUser): Promise<void> {
  if ('id' in user)
    delete user.id;

  if (!Object.keys(user).length)
    throw new BadRequestException(`No fields to update`);

  const res = await db.updateTable('users')
                      .set(user)
                      .where('id', '=', Buffer.from(id, 'hex'))
                      .execute()
                
  if (res[0].numUpdatedRows == BigInt(0))
    throw new NotFoundException(`User not found`);
}

export async function updatePassword(id: string, pwd: string): Promise<void> {
  const salt = crypto.randomBytes(Math.ceil(45/2)).toString(`hex`).slice(0, 45);
  const sign = crypto.createHash(`sha512`).update(`${pwd}${salt}`).digest(`hex`);

  await update(id, { pwd: sign, salt });
}

export async function login(email: string, password: string): Promise<UserWithoutPassword> {
  // we get all the users with this email address
  const users = await db.selectFrom('users')
                        .selectAll()
                        .where('email', '=', email)
                        .execute();

  // we want to keep the only user that has not been archived
  let user: User = null;
  for (const u of users){
    if (u.archived === false) {
      user = u;
      break;
    }
  }

  // check if user is able to login
  if (user == null)
    throw new NotFoundException(`User not found`);
  if (user.blocked)
    throw new ForbiddenException(`User is blocked`);

  // check the user password
  const sign = crypto.createHash(`sha512`).update(`${password}${user.salt}`).digest(`hex`);
  if (sign !== user.pwd)
    throw new ForbiddenException(`Invalid password`);

  if (`pwd` in user)
    delete user.pwd;
  if (`salt` in user)
    delete user.salt;
  
  return user;
}

export default {
  login,
  searchUsers,
  update,
  updatePassword
};
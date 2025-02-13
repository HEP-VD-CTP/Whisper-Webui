import { sql, eq, lt, gte, ne, and, inArray} from 'drizzle-orm';
import { db, unhexDict, mapFields, unhexId, hexIds } from './db.ts';
import { type User, type insertUser, type selectUser } from './types.ts';
import { usersTable, usersFields } from './schema.ts';
import { BadRequestException, ForbiddenException, NotFoundException, ConflictException } from '../lib/exceptions.ts';
import crypto from 'node:crypto';

export async function auth(email: string, password: string): Promise<User> {
  const user = (await db.select()
                        .from(usersTable)
                        .where(and(eq(usersTable.email, email), eq(usersTable.archived, false))))[0];

  // check if user is able to login
  if (user == null)
    throw new NotFoundException(`User not found`);
  if (user.blocked)
    throw new ForbiddenException(`User is blocked`);

  // chek the user password
  const sign = crypto.createHash(`sha512`).update(`${password}${user.salt}`).digest(`hex`);
  if (sign !== user.pwd)
    throw new ForbiddenException(`Invalid password`);

  user.id = ((user.id as unknown) as Buffer).toString(`hex`).toUpperCase();
  return user as User;
}

export async function findUserById(id: string, fields: Array<string>): Promise<User> {
  const user = (await db.select(mapFields(fields, usersFields))
                  .from(usersTable)
                  .where(eq(usersTable.id, unhexId(id))));

  if (!user.length)
    throw new NotFoundException(`User with id ${id} not found`);

  return user[0] as User;
}

export async function insertNewUser(user: selectUser): Promise<void> {
  await db.transaction(async (trx) => {
    // we can only insert a new users if there is no other user 
    // with the same email that is not archived
    const userExists = await trx.select({
      id: sql`HEX(${usersTable.id})`,
      email: usersTable.email,
      archived: usersTable.archived
    })
    .from(usersTable)
    .where(and(eq(usersTable.email, user.email), eq(usersTable.archived, false)));
    if (userExists.length)
      throw new ConflictException(`User with email ${user.email} already exists and is not archived`);

    // sign the password if it's provided 
    if (`pwd` in user && user.pwd != null){
      const salt = crypto.randomBytes(Math.ceil(45/2)).toString(`hex`).slice(0, 45);
      // hash the password with the salt
      const sign = crypto.createHash(`sha512`).update(`${user.pwd}${salt}`).digest(`hex`);
      user["salt"] = salt;
      user.pwd = sign;
    }
    
    // insert user
    await trx.insert(usersTable).values(unhexDict(user));
  });
} 

export default {
  users: {
    auth: auth,
    findById: findUserById,
    insert: insertNewUser
  }
}; 
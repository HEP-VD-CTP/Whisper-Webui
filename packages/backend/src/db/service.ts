import { sql, eq, lt, gte, ne, and, inArray} from 'drizzle-orm';
import { db, unhexDict, mapFields, unhexId, hexIds } from './db.ts';
import { type User, type insertUser, type selectUser } from './types.ts';
import { usersTable, usersFields, UserFieldArray } from './schema.ts';
import { BadRequestException, ForbiddenException, NotFoundException, ConflictException } from '../lib/exceptions.ts';
import crypto from 'node:crypto';

import { ResultSetHeader } from 'mysql2/promise';


import { usersFields2, usersFields3, mapUsersFields, parseUsersFields } from './schema.ts';

import db2 from 'src/db/db2.ts';
import { DB } from 'src/db/db2.ts';

// OK !

/*export async function insertNewUser(user: selectUser): Promise<void> {
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

    // we may insert a new user without a password
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
} */

/*export async function findById(db: DB, ids: Array<string>, fields: Array<string>): Promise<Array<User>> {
  console.log(`coucou`);
  const query = `
  SELECT ${mapFields2(fields, usersFields2)}
  FROM users u
  WHERE id IN (${ids.map(() => `?`)}.join(','))`
  
  console.log(query);

  //const users = await db.query(``, [])
  return ;
}*/

export async function searchUsers(db: DB, term: string, fields: UserFieldArray): Promise<Array<User>> {
  const users = await db.query(`
  SELECT ${mapUsersFields(fields)}
  FROM users
  WHERE MATCH(firstname, lastname, email)
  AGAINST(? IN NATURAL LANGUAGE MODE)`, [term]);

  return parseUsersFields(users as Array<User>);
}


export async function findByEmail(db: DB, email: string, fields: UserFieldArray): Promise<Array<User>> {
  const query = await db.query(`
  SELECT ${mapUsersFields(fields)}
  FROM users u
  WHERE u.email = ?`, [email]);
  
  return parseUsersFields(query as Array<User>);
}

export async function auth(db: DB, email: string, password: string): Promise<User> {
  // we get all the users with this email address
  const users = await findByEmail(db, email, [`*`]) as Array<User>;

  // we want to keep the only user that has not been archive
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

  // chek the user password
  const sign = crypto.createHash(`sha512`).update(`${password}${user.salt}`).digest(`hex`);
  if (sign !== user.pwd)
    throw new ForbiddenException(`Invalid password`);

  return user;
}

export async function updateUserPassword(db: DB, id: string, password: string): Promise<void> {
  const salt = crypto.randomBytes(Math.ceil(45/2)).toString(`hex`).slice(0, 45);
  const sign = crypto.createHash(`sha512`).update(`${password}${salt}`).digest(`hex`);

  const result = await db.query(`UPDATE users SET pwd = ?, salt = ? WHERE id = UNHEX(?)`, [sign, salt, id]) as ResultSetHeader;
  if (!result.affectedRows)
    throw new NotFoundException(`User with id ${id} was not found.`);
}

export default {
  users: {
    auth: auth,
    //insert: insertNewUser,
    updatePassword: updateUserPassword,
    search: searchUsers
  }
};
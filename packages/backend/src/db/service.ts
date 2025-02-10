import { sql, eq, lt, gte, ne, and, inArray} from 'drizzle-orm';
import { db, unhex, mapFields, hexIds } from './db.ts';
import { type User, type insertUser, type selectUser } from './types.ts';
import { usersTable, usersFields } from './schema.ts';



export async function findUsersByIds(ids: Array<string>, fields: Array<string>): Promise<Array<User>> {
  const query = db.select(mapFields(fields, usersFields))
                  .from(usersTable)
                  .where(inArray(usersTable.id, hexIds(ids)))
                  .orderBy(usersTable.email, usersTable.firstname, usersTable.lastname);
  
  return await query.execute() as Array<User>;
}

export async function insertNewUser(user: insertUser|selectUser): Promise<void> {
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
      throw new Error(`User with email ${user.email} already exists and is not archived`);

    // insert user
    await trx.insert(usersTable).values(unhex(user));
  });
} 

export default {
  users: {
    findByIds: findUsersByIds,
    insert: insertNewUser
  }
}; 
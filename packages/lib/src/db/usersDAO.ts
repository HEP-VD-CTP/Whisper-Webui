import { 
  BadRequestException, 
  NotFoundException, 
  ForbiddenException, 
  ConflictException 
} from '@whisper-webui/lib/src/db/exceptions.ts'
import { db } from '@whisper-webui/lib/src/db/db2.ts'
import { 
  type User, 
  type UpdateUser,
  type InsertUser,
} from '@whisper-webui/lib/src/types/kysely.ts'
import { type UsersStats } from '@whisper-webui/lib/src/types/types.ts'
import { sql, SqlBool } from 'kysely'
import crypto from 'node:crypto'

function genSalt(): string {
  return crypto.randomBytes(Math.ceil(45/2)).toString(`hex`).slice(0, 45)
}

function sign(password: string, salt: string){
  return crypto.createHash(`sha512`).update(`${password}${salt}`).digest(`hex`)
}

export async function findAll(page: number = 1, pageSize: number = 25): Promise<Array<User>> {
  const offset = (page - 1) * pageSize
  return await db.selectFrom('users')
    .selectAll()
    .orderBy('firstname', 'asc')
    .orderBy('lastname', 'asc')
    .orderBy('email', 'asc')
    .limit(pageSize)
    .offset(offset)
    .execute();
}

export async function findById(id: string | Buffer): Promise<User> {
  if (typeof id === 'string')
    id = Buffer.from(id, 'hex')

  const user = await db.selectFrom('users')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst()
  
  if (!user)
    throw new NotFoundException(`User not found`)

  return user
}

export async function findByEmail(email: string): Promise<User> {
  const user = await db.selectFrom('users')
    .selectAll()
    .where('email', '=', email)
    .where('archived', '=', false)
    .executeTakeFirst()
  
  if (!user)
    throw new NotFoundException(`User not found`)

  return user
}

export async function createUser(user: InsertUser): Promise<User> {
  if (typeof user.id === 'string')
    user.id = Buffer.from(user.id, 'hex')

  if ('pwd' in user){
    user.salt = genSalt()
    user.pwd = sign(user.pwd, user.salt)
  }

  await db.insertInto('users')
    .values(user)
    .execute()

  return await findById(user.id);
}

export async function deleteUser(id: string): Promise<void> {
  const res = await db.deleteFrom('users')
    .where('id', '=', Buffer.from(id, 'hex'))
    .executeTakeFirst()

  if (res.numDeletedRows == BigInt(0))
    throw new NotFoundException(`User not found`)
}

export async function stats(): Promise<UsersStats> {
  const users = await db.selectFrom('users')
    .select(['archived', 'blocked'])
    .execute()

  let archived: number = 0
  let blocked: number = 0

  for (const user of users){
    if (user.archived)
      archived++
    if (user.blocked)
      blocked++
  }

  return {
    total: users.length,
    archived,
    blocked
  }
}

export async function searchUsers(term: string, page: number = 1, pageSize: number = 25): Promise<Array<User>> {
  const offset = (page - 1) * pageSize
  return await db.selectFrom('users')
    .selectAll()
    .where(sql<SqlBool>`
      MATCH(firstname, lastname, email) AGAINST (${term})
      OR id = ${typeof term === 'string' ? Buffer.from(term, 'hex') : term}
    `)
    .orderBy('firstname', 'asc')
    .orderBy('lastname', 'asc')
    .orderBy('email', 'asc')
    .limit(pageSize)
    .offset(offset)
    .execute()
}

export async function update(id: string | Buffer, user: UpdateUser): Promise<void> {
  if ('id' in user)
    delete user.id
  
  if (!Object.keys(user).length)
    throw new BadRequestException(`No fields to update`)

  if (typeof id === 'string')
    id = Buffer.from(id, 'hex')

  if ('email' in user)
    await userUnarchivable(user.email)

  if ('archived' in user && !user.archived){
    const u = await findById(id)
    await userUnarchivable(u.email)
  }

  const res = await db.updateTable('users')
    .set(user)
    .where('id', '=', id)
    .execute()
                
  if (res[0].numUpdatedRows == BigInt(0))
    throw new NotFoundException(`User not found`)
}

export async function updatePassword(id: string | Buffer, pwd: string): Promise<void> {
  if (typeof id === 'string')
    id = Buffer.from(id, 'hex')

  const salt = genSalt()
  const signature = sign(pwd, salt)

  await update(id, { pwd: signature, salt })
}

export async function userUnarchivable(email: string): Promise<void> {
  const users = await db.selectFrom('users')
                        .select('archived')
                        .where('email', '=', email)
                        .execute()

  for (const user of users)
    if (user.archived === false)
      throw new ConflictException(`User already unarchived`)
}

export async function login(email: string, password: string): Promise<User> {
  // we get all the users with this email address
  const users = await db.selectFrom('users')
                        .selectAll()
                        .where('email', '=', email)
                        .execute()

  // we want to keep the only user that has not been archived
  let user: User = null;
  for (const u of users){
    if (u.archived === false) {
      user = u
      break
    }
  }

  // check if user is able to login
  if (user == null)
    throw new NotFoundException(`User not found`)
  if (user.blocked)
    throw new ForbiddenException(`User is blocked`)

  // check the user password
  const signature = sign(password, user.salt);
  if (signature !== user.pwd)
    throw new ForbiddenException(`Invalid password`)

  if (`pwd` in user)
    delete user.pwd
  if (`salt` in user)
    delete user.salt
  
  return user
}

export default {
  findAll,
  findById,
  findByEmail,
  deleteUser,
  createUser,
  login,
  searchUsers,
  update,
  updatePassword,
  userUnarchivable,
  stats
}
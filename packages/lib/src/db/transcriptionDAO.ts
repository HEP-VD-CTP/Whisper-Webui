import { 
  BadRequestException, 
  NotFoundException, 
  ForbiddenException, 
  ConflictException 
} from '@whisper-webui/lib/src/db/exceptions.ts'
import { db } from '@whisper-webui/lib/src/db/db2.ts'

import {
  Transcription,
  InsertTranscription,
  UpdateTranscription,
  InsertTranscriptionUser,
  User
} from '@whisper-webui/lib/src/types/kysely.ts'
import lib from '@whisper-webui/lib/src/lib/index.ts'

export async function findById(id: string | Buffer): Promise<Transcription> {
  if (typeof id === 'string')
    id = Buffer.from(id, 'hex')

  const transcription = await db.selectFrom('transcriptions')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst()

  if (!transcription)
    throw new NotFoundException(`Transcription not found`)

  return transcription
}

export async function findByUserId(userId: string | Buffer): Promise<Array<Partial<Transcription>>> {
  if (typeof userId === 'string')
    userId = Buffer.from(userId, 'hex')

  return await db.selectFrom('transcriptions')
    .select([
      'transcriptions.id', 
      'transcriptions.name', 
      'transcriptions.file', 
      'transcriptions.lang', 
      'transcriptions.status', 
      'transcriptions.created',
      'transcriptions.processed',
      'transcriptions.done',
      'transcriptions.deleted',
    ])
    .innerJoin('transcriptions_users', 'transcriptions.id', 'transcriptions_users.idx_transcription')
    .where('transcriptions_users.idx_user', '=', userId)
    .orderBy('transcriptions.created', 'desc')
    .execute()
}

export async function createTranscription(userId: string | Buffer, transcription: InsertTranscription): Promise<void> {
  if (typeof transcription.id === 'string')
    transcription.id = Buffer.from(transcription.id, 'hex')

  await db.transaction().execute(async (trx) => {
    // insert user
    await trx.insertInto('transcriptions')
      .values(transcription) 
      .execute()

    // Insert relation to user
    await trx.insertInto('transcriptions_users')
      .values({
        id: Buffer.from(crypto.randomUUID(), 'hex'),
        idx_transcription: transcription.id,
        idx_user: typeof userId === 'string' ? Buffer.from(userId, 'hex') : userId,
      })
      .execute()
  })
}

export async function updateTranscription(id: string | Buffer, data: Partial<UpdateTranscription>): Promise<void> {
  if (typeof id === 'string')
    id = Buffer.from(id, 'hex')

  const result = await db.updateTable('transcriptions')
    .set(data)
    .where('id', '=', id)
    .executeTakeFirst()

  if (!result?.numUpdatedRows)
    throw new NotFoundException(`Transcription not found`)
}

export async function deleteById(id: string | Buffer): Promise<void> {
  if (typeof id === 'string')
    id = Buffer.from(id, 'hex')

  const result = await db.updateTable('transcriptions')
    .set({ deleted: 1 })
    .where('id', '=', id)
    .executeTakeFirst()

  if (!result.numUpdatedRows)
    throw new NotFoundException(`Transcription not found`)
}

export async function addOwner(transcriptionId: string | Buffer, userId: string | Buffer): Promise<void> {
  if (typeof transcriptionId === 'string')
    transcriptionId = Buffer.from(transcriptionId, 'hex')
  if (typeof userId === 'string')
    userId = Buffer.from(userId, 'hex')
  
  await db.insertInto('transcriptions_users')
    .values({
      id: Buffer.from(lib.uid.genUID(), 'hex'),
      idx_transcription: transcriptionId,
      idx_user: userId
    })
    .execute()
} 

export async function removeOwner(transcriptionId: string | Buffer, userId: string | Buffer): Promise<void> {
  if (typeof transcriptionId === 'string')
    transcriptionId = Buffer.from(transcriptionId, 'hex')
  if (typeof userId === 'string')
    userId = Buffer.from(userId, 'hex')
  
  const result = await db.deleteFrom('transcriptions_users')
    .where('idx_transcription', '=', transcriptionId)
    .where('idx_user', '=', userId)
    .executeTakeFirst()

  if (!result.numDeletedRows)
    throw new NotFoundException(`Transcription owner not found`)
} 

export async function findTrandscriptionOwners(id: string | Buffer): Promise<Array<Partial<User>>> {
  if (typeof id === 'string')
    id = Buffer.from(id, 'hex')

  return await db.selectFrom('users')
    .select([
      'users.id',
      'users.firstname',
      'users.lastname',
      'users.email'
    ])
    .innerJoin('transcriptions_users', 'users.id', 'transcriptions_users.idx_user')
    .where('transcriptions_users.idx_transcription', '=', id)
    .execute()
}

export default {
  findById,
  findByUserId,
  findTrandscriptionOwners,
  addOwner,
  removeOwner,
  createTranscription,
  updateTranscription,
  deleteById
}
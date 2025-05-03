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
} from '@whisper-webui/lib/src/types/kysely.ts'

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

export async function createTranscription(transcription: InsertTranscription): Promise<void> {
  if (typeof transcription.id === 'string')
    transcription.id = Buffer.from(transcription.id, 'hex')

  await db.insertInto('transcriptions')
    .values(transcription)
    .execute()
}

export default {
  findById,
  createTranscription,
}
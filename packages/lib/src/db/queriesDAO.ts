import { db } from '@whisper-webui/lib/src/db/db2.ts'
import { InsertQuery } from '@whisper-webui/lib/src/types/kysely.ts'

export async function insertQuery(query: InsertQuery): Promise<void> {
  await db.insertInto('queries')
    .values(query)
    .execute()
}

export default {
  insertQuery,
}
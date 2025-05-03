import {
  ColumnType,
  Generated,
  Insertable,
  JSONColumnType,
  Selectable,
  Updateable,
} from 'kysely'

export interface Database {
  users: UsersTable
  transcriptions: TranscriptionsTable
}

export interface UsersTable {
  id: string | Buffer,
  email: string,
  firstname: string, 
  lastname: string, 
  pwd?: string | null,
  salt?: string | null,
  admin: boolean,
  archived: boolean,
  blocked: boolean,
  created_at: Date
}

export type User = Selectable<UsersTable>
export type InsertUser = Insertable<UsersTable>
export type UpdateUser = Updateable<UsersTable>

export interface TranscriptionsTable {
  id: string | Buffer,
  name: string,
  file: string,
  lang: string,
  status: 'waiting' | 'processing' | 'error',
  created: Date,
  processed?: Date | null,
  done?: Date | null,
  deleted: number,
  text?: string | null,
  duration?: number | null,
  metadata?: string | null,
  comment?: string | null,
}

export type Transcription = Selectable<TranscriptionsTable>
export type InsertTranscription = Insertable<TranscriptionsTable>
export type UpdateTranscription = Updateable<TranscriptionsTable>

export default {

}
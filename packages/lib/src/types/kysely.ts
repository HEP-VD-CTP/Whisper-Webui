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
  transcriptions_users: TranscriptionUsersTable
  queries: QueriesTable
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
  status: 'waiting' | 'processing' | 'error' | 'done'
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

export interface TranscriptionUsersTable {
  id: string | Buffer, 
  idx_transcription: string | Buffer,
  idx_user: string | Buffer,
}

export type TranscriptionUser = Selectable<TranscriptionUsersTable>
export type InsertTranscriptionUser = Insertable<TranscriptionUsersTable>
export type UpdateTranscriptionUser = Updateable<TranscriptionUsersTable>

export interface QueriesTable {
  id: string | Buffer,
  route: string, 
  method: string, 
  userid: string, 
  ip: string, 
  headers: string, 
  status: number,
  duration: number,
  created: Date
}

export type Query = Selectable<QueriesTable>
export type InsertQuery = Insertable<QueriesTable>
export type UpdateQuery = Updateable<QueriesTable>

export default {

}
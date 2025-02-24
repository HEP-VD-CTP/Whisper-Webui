import {
  ColumnType,
  Generated,
  Insertable,
  JSONColumnType,
  Selectable,
  Updateable,
} from 'kysely';

export interface Database {
  users: UsersTable
}

export interface UsersTable {
  id: string | Buffer,
  email: string,
  firstname: string, 
  lastname: string, 
  pwd: string | null,
  salt: string | null,
  admin: boolean,
  archived: boolean,
  blocked: boolean,
  created_at: Date
}

export type User = Selectable<UsersTable>;
export type UserWithoutPassword = Omit<User, 'pwd' | 'salt'>;
export type InsertUser = Insertable<UsersTable>;
export type UpdateUser = Updateable<UsersTable>;

export default {

};
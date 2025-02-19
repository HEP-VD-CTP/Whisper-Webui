export type User = {
  id?: string,
  firstname?: string,
  lastname?: string,
  email?: string,
  pwd?: string,
  salt?: string,
  admin?: boolean,
  archived?: boolean,
  blocked?: boolean,
  created_at?: Date
}

export type UserFields = Array<(keyof User)>;


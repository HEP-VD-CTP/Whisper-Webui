import { usersTable } from "./schema.ts";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm"

export type selectUser = InferSelectModel<typeof usersTable>
export type insertUser = InferInsertModel<typeof usersTable>
export type User = Partial<selectUser>;
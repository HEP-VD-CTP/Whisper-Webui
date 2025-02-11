import { drizzle } from "drizzle-orm/mysql2";
import { sql } from 'drizzle-orm' 


export const db = drizzle({ 
  connection: { 
    host: process.env.MYSQL_URL,
    port: 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE, 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  }
});

// turn string uid to binary uid
export function unhexDict<T>(dict: T): T {
  // Ensure dict is an object
  if (typeof dict !== "object" || dict === null || Array.isArray(dict))
    throw new Error("Expected an object");

  // Modify the uid field to be binary
  if ('id' in dict) 
    (dict as any).id = sql`UNHEX(${(dict as any).id})`;

  return dict;
}

export function mapFields(fields: Array<string>, tableFields: any){
  const queryFields = {};
  for (const field of fields)
    if (field in tableFields)
      queryFields[field] = tableFields[field];
  return queryFields;
}

export function hexIds(ids: Array<string>): any{
  const newIds = [];
  for (const id of ids)
    newIds.push(sql`UNHEX(${id})`);
  return newIds;
}

export function unhexId(id: string): any{
  return sql`UNHEX(${id})`;
}

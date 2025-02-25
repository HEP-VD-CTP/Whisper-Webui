import { Database } from '@whisper-webui/lib/src/types/kysely.ts';
import { createPool } from 'mysql2';
import { Kysely, MysqlDialect } from 'kysely';

const dialect = new MysqlDialect({
  pool: createPool({
    host: process.env.MYSQL_URL,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE, 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    
    // This function will take a look at each field of the return
    // query data and apply transformations to it.
    typeCast(field, next) {
      // turn binary id to hex string
      if (field.name == 'id' && field.type === 'STRING'){
        return field.buffer().toString(`hex`).toUpperCase();
      }
      // turn tinyint(1) to boolean
      else if (field.type === 'TINY' && field.length === 1) {
        return field.string() === '1'
      }
      else {
        return next()
      }
    },
  })
})

// Database interface is passed to Kysely's constructor, and from now on, Kysely 
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how 
// to communicate with your database.
export const db = new Kysely<Database>({
  dialect,
})


import mysql, { Pool, PoolConnection, PoolOptions, OkPacket, RowDataPacket, ResultSetHeader, ProcedureCallPacket  } from 'mysql2/promise';

export type DBQueryResult = ResultSetHeader | OkPacket | RowDataPacket[] | ResultSetHeader[] | RowDataPacket[][] | OkPacket[] | ProcedureCallPacket;

export type DBPool = {
  connection: Pool,
  query: (sql: string, args: Array<any>) => Promise<DBQueryResult>
};

export type DBTransaction = {
  connection: PoolConnection,
  query: (sql: string, args: Array<any>) => Promise<DBQueryResult>,
  commit: () => Promise<void>,
  rollback: () => Promise<void>
};

export type DB = DBPool | DBTransaction;

const poolConnectionOptions: PoolOptions = {
  host: process.env.MYSQL_URL,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE, 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const poolConnection: Pool = mysql.createPool(poolConnectionOptions);

export function escape(str: any): string{
  return poolConnection.escape(str);
}

export function escapeFields(str: string): string {
  return poolConnection.escape(str).slice(1, -1);
}

export function escapeDoubleQuote(str: any): string {
  const escaped: string = escape(str);
  return `"${escaped.substring(1, escaped.length - 1)}"`;
}

export async function query(sql: string, args: Array<any>): Promise<DBQueryResult>{
  const [rows,] = await poolConnection.query(sql, args);
  return rows;
}

export function pool(): DBPool{
  const connection: Pool = poolConnection;
  return {
    connection,
    query: async (sql: string, args: Array<any>): Promise<DBQueryResult> => {
      const [rows,] = await connection.query(sql, args);
      return rows;
    },
  }
}

export async function transaction(): Promise<DBTransaction>{
  // use one of the pooled connection for transaction
  const connection: PoolConnection = await poolConnection.getConnection();

  // change isolation level if necessary
  // await connection.execute(`SET TRANSACTION ISOLATION LEVEL READ COMMITTED`); 
  await connection.beginTransaction();

  return {
    connection: connection,
    query: async (sql: string, args: Array<any>): Promise<DBQueryResult> => {
        const [rows,] = await connection.execute(sql, args);
        return rows;
    },
    commit: async (): Promise<void> => {
      try {
        await connection.commit();
      }
      finally {
        connection.release();
      }
    },
    rollback: async (): Promise<void> => {
      try {
        await connection.rollback();
      }  
      finally {
        connection.release();
      }
    }
  };

}

// test connection
export async function init(): Promise<void>{
  await query(`select 1 = 1`, []);
}

export default {
  init, 
  escape,
  escapeDoubleQuote,
  query,
  pool, 
  transaction
}

import Fastify from 'fastify';

const fastify = Fastify({ logger: false });

import { drizzle } from "drizzle-orm/mysql2";
import { eq } from 'drizzle-orm/expressions';

import { usersTable } from 'src/db/schema.ts';
import { User } from "src/db/types.ts";


console.log(`NODE_ENV: ${process.env.MYSQL_URL}`);

const db = drizzle({ 
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


const userTest: User = {
  id: "1", 
  firstname: "",
  lastname: "",
  age: 12

}

console.log(userTest);

/*const arianeUser: User = (await db
  .select()
  .from(usersTable)
  .where(eq(usersTable.name, 'ariane')))[0];

console.log(arianeUser)
*/
// Declare a route
fastify.get('/api/hello', async (request, reply) => {
  return { message: 'Hello World 2' };
});
 
try {
  await fastify.listen({ host:`0.0.0.0`, port: parseInt(process.env.BACKEND_HTTP_PORT) });
  console.log(`Backend is listening on port ${process.env.BACKEND_HTTP_PORT} in ${process.env.NODE_ENV} mode`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}



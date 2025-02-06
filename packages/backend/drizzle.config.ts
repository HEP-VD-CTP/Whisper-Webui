import { defineConfig } from 'drizzle-kit';

console.log(process.env.MYSQL_URL);

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.MYSQL_URL,
    port: 3306,
    user: `root`,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
});
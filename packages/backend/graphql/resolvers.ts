import { UID } from "./scalars.ts";
import lib from "src/lib/index.ts";
import service from "src/db/service.ts";
import { type User } from './types.ts';
import { db, unhex, mapFields, hexId, hexIds } from 'src/db/db.ts';
import { usersTable, usersFields } from 'src/db/schema.ts';
import { sql, eq, lt, gte, ne, and, inArray} from 'drizzle-orm';
import { getFields } from "graphql/graphql.ts";


const resolvers = {
    UID,
    Query: {
      add: async (_, { x, y }) => {
        console.log(`Coucou from route !`);
        return x + y
      },
      Users: async (_, args, ctx, info) => {
        // check if user is authenticated
        return true;
      }
    },
    UserQuery: {
      async findById(parent, args, ctx, info) {
        const user = (await db.select(mapFields(getFields(info), usersFields))
                              .from(usersTable)
                              .where(eq(usersTable.id, hexId(args.id))))[0];
        
        if (user == null)
          throw new Error(`User with id ${args.id} not found`);

        return user;
      }
    },
  }

  export default resolvers;
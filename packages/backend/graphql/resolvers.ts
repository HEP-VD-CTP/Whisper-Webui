import { UID } from "./scalars.ts";
import lib from "src/lib/index.ts";
import service from "src/db/service.ts";
import { type User } from 'src/db/types.ts';
import { db, mapFields, hexIds } from 'src/db/db.ts';
import { usersTable, usersFields } from 'src/db/schema.ts';
import { sql, eq, lt, gte, ne, and, inArray} from 'drizzle-orm';
import { getFields } from "graphql/graphql.ts";
import { BadRequestException, ForbiddenException, NotFoundException, ConflictException } from "src/lib/exceptions.ts";
import { selectUser } from "src/db/types.ts";

const resolvers = {
  UID,
  Query: {
    Users: async (_, args, ctx, info) => {
      // check if user is authenticated
      return true;
    }
  },
  Mutation: {
    Auth: async (_, args, ctx, info) => {
      console.log(`AUTH`); 
      return true;
    },
    Users: async (_, args, ctx, info) => {
      
      return true; 
    }
  },
  UsersQuery: { 
    async findById(parent, args, ctx, info) {
      return await service.users.findById(args.id, getFields(info));
    }
  },
  AuthMutation: {
    async login(parent, args, ctx, info) {
      const user = await service.users.auth(args.email, args.pwd);
      
      ctx.reply.setCookie('mah_INVISIBLE_cookie', `mah_INVISIBLE_cookie`, {
        httpOnly: true,
        path: '/'
      });

      return user;
    } 
  },
  UsersMutation: {
    async insert(parent, args, ctx, info) {
      const newUserId = lib.uid.genUID();
      await service.users.insert({
        id: newUserId,
        firstname: args.user.firstname,
        lastname: args.user.lastname,
        email: args.user.email,
        pwd: args.user.pwd,
        salt: null,
        admin: args.user.admin,
        archived: false,
        blocked: false,
        created_at: new Date()
      });

      // set the cookies as the user is now authenticated
      
      return true;
    }
  }
}

export default resolvers;
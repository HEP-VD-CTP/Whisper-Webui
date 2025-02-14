import { UID } from "./scalars.ts";
import lib from "src/lib/index.ts";
import service from "src/db/service.ts";
import { type User } from 'src/db/types.ts';
import { db, mapFields, hexIds } from 'src/db/db.ts';
import { usersTable, usersFields } from 'src/db/schema.ts';
import { sql, eq, lt, gte, ne, and, inArray} from 'drizzle-orm';
import { getFields, checkSession, setSessionCookie } from "src/graphql/graphql.ts";
import { BadRequestException, ForbiddenException, NotFoundException, ConflictException, UnauthorizedException } from "src/lib/exceptions.ts";
import { selectUser } from "src/db/types.ts";

import store from 'src/db/store.ts';

// user session expiration time
const exp: number = parseInt(process.env.USER_SESSION_EXP_TIME);


const resolvers = {
  UID,
  Query: {
    Users: async (_, args, ctx, info) => {
      return await checkSession(ctx, exp);
    }
  },
  Mutation: {
    Auth: async (_, args, ctx, info) => {
      return true;
    },
    Users: async (_, args, ctx, info) => {
      
      return true;  
    }
  }, 
  UsersQuery: { 
    async test(parent, args, ctx, info) {
      console.log(`TEST`);
      return true;
    },
    async findById(parent, args, ctx, info) {
      return await service.users.findById(args.id, getFields(info));
    }
  },
  AuthMutation: {
    async login(parent, args, ctx, info) {
      console.log(`login`);
      // try authenticate the user
      const user = await service.users.auth(args.email, args.pwd);
      
      // store the session in redis
      const sessionId = lib.uid.genUID();
      await store.createSession(sessionId, user, exp);

      // store the sessionId in the client cookie
      setSessionCookie(ctx, sessionId, exp);

      return user;
    },
    async renew(parent, args, ctx, info) {
      await checkSession(ctx, exp);
      return ctx.user;
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
      
      return true;
    }
  }
}

export default resolvers;
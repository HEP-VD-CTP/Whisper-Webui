import { UID } from "./scalars.ts";
import lib from "src/lib/index.ts";
import service from "src/db/service.ts";
import { type User } from 'src/db/types.ts';
import { db, mapFields, hexIds } from 'src/db/db.ts';
import { usersTable, usersFields } from 'src/db/schema.ts';
import { sql, eq, lt, gte, ne, and, inArray} from 'drizzle-orm';
import { getFields, checkSession, setSessionCookie, removeSessionCookie } from "src/graphql/graphql.ts";
import { BadRequestException, ForbiddenException, NotFoundException, ConflictException, UnauthorizedException } from "src/lib/exceptions.ts";
import { selectUser } from "src/db/types.ts";

import db2 from 'src/db/db2.ts';

import store from 'src/db/store.ts';

// user session expiration time
const exp: number = parseInt(process.env.USER_SESSION_EXP_TIME);

function adminOnly(user: User){
  if (!user.admin)
    throw new UnauthorizedException(`You must be an admin to perform this action`);
}

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
      return await checkSession(ctx, exp);
    }
  }, 
  UsersQuery: { 
    async test(parent, args, ctx, info) {
      console.log(`TEST`);
      return true;
    },
    /*async findById(parent, args, ctx, info) {
      if (args.id != ctx.user.id && !ctx.user.admin)
        throw new ForbiddenException(`You can't get others users informations`);
      return await service.users.findById(args.id, getFields(info));
    },*/
    async search(parent, args, ctx, info){
      adminOnly(ctx.user);
      const users =  await service.users.search(db2.pool(),args.term, getFields(info));

      //console.log(users);
      return users;
    }
  },
  AuthMutation: {
    async login(parent, args, ctx, info) {
      // try authenticate the user
      const user = await service.users.auth(db2.pool(), args.email, args.pwd);
      
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
    },
    async logout(parent, args, ctx, info) {
      await store.deleteSession(ctx.reply.request.cookies.sessionId);
      return true;
    }
  },
  UsersMutation: {
    /*async insert(parent, args, ctx, info) {
      adminOnly(ctx.user);
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
    },*/
    async updatePassword(parent, args, ctx, info) {
      const userIdToModify = args.id;
      const userId = ctx.user.id;
      const newPassword = args.pwd;

      // only admin can modify other users password
      if (userIdToModify != userId && !ctx.user.admin)
        throw new ForbiddenException(`You can't modify other users password`);

      if (newPassword.length < 6 || newPassword.length > 255)
        throw new BadRequestException(`Password length must be between 6 and 255 characters`);

      await service.users.updatePassword(db2.pool(), userIdToModify, newPassword);

      return true;
    }
  }
}

export default resolvers;
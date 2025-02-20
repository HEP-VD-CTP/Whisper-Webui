import { initTRPC } from '@trpc/server';
import { set, z } from 'zod';
import superjson from 'superjson';

import DAO from '@whisper-webui/lib/src/db/DAO.ts';
import db from '@whisper-webui/lib/src/db/db.ts';
import store from '@whisper-webui/lib/src/db/store.ts';
import lib from '@whisper-webui/lib/src/lib/index.ts';
import { ForbiddenException, UnauthorizedException } from '@whisper-webui/lib/src/db/exceptions.ts';

import { Context } from '@whisper-webui/lib/src/trpc/context.ts';

const idZodValidation = z.string().refine((val) => {
  // id must be 24 length string
  if (val.length != 24)
    return false;

  // id must contain only UPPERCASE hexadecimal characters
  for (let i = 0; i < 24; i++) {
    const charCode = val.charCodeAt(i);
    if (!(charCode >= 48 && charCode <= 57) && !(charCode >= 65 && charCode <= 70))
      return false;
  }

  // id is valid
  return true;
}, {
  message: "INVALID ID. Must be 24 characters long and contain only UPPERCASE hexadecimal characters.",
});

const passwordZodValidation = z.string().min(6).max(255);

// user session expiration time
const exp: number = parseInt(process.env.USER_SESSION_EXP_TIME);

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ error, shape }) {    
    if (shape.message.startsWith(`InvalidRequestException:`)){
      shape.data.httpStatus = 400;
      shape.data.code = 'BAD_REQUEST';
    }
    else if (shape.message.startsWith(`UnauthorizedException:`)){
      shape.data.httpStatus = 401;
      shape.data.code = 'UNAUTHORIZED';
    }
    else if (shape.message.startsWith(`ForbiddenException:`)){
      shape.data.httpStatus = 403;
      shape.data.code = 'FORBIDDEN';
    }
    else if (shape.message.startsWith(`NotFoundException:`)){
      shape.data.httpStatus = 404;
      shape.data.code = 'NOT_FOUND';
    }
    else if (shape.message.startsWith(`ConflictException:`)){
      shape.data.httpStatus = 409;
      shape.data.code = 'CONFLICT';
    }

    return shape;
  },
});

// Authenticate the user session
export const sessionProcessing = t.middleware(async ({ ctx, next }) => {
  // @ts-ignore 
  const sessionId: string = ctx.req.cookies.sessionId;
  if (!sessionId)
    throw new UnauthorizedException(`SessionId not found`);
  
  const user = await store.getSession(sessionId);
  if (!user)
    throw new UnauthorizedException(`Session not found`);
  
  // extends the session
  await store.extendSession(sessionId, exp);
  ctx["user"] = user;

  return next();
});

export const publicProcedure = t.procedure;
export const authedProcedure = t.procedure.use(sessionProcessing);
export const adminProcedure  = t.procedure.use(sessionProcessing).use(async ({ ctx, next }) => {
  if (!ctx.user.admin)
    throw new ForbiddenException(`You can't access this route`);
  return next();
}); 

function setSessionCookie(ctx: any, sessionId: string, exp: number){
  ctx.res.setCookie('sessionId', sessionId, {
    httpOnly: true,
    path: '/',
    maxAge: exp
  });
}

function removeSessionCookie(ctx: any){
  ctx.res.setCookie('sessionId', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0
  });
}

//
// Auth router
//

const authRouter = t.router({
  login: publicProcedure
  .input(z.object({
    email: z.string().email().max(255),
    pwd: passwordZodValidation
  }))
  .query(async opts => {
    const user = await DAO.service.auth.login(opts.input.email, opts.input.pwd);

    // create a new session for the user
    const sessionId = lib.uid.genUID();
    await store.createSession(sessionId, user, exp);
    setSessionCookie(opts.ctx, sessionId, exp);
    return user;
  }),
  logout: publicProcedure
  .query(async opts => {
      removeSessionCookie(opts.ctx);
      // @ts-ignore
      await store.deleteSession(opts.ctx.req.cookies.sessionId);
  }),
  renew: authedProcedure
    .query(opts => { 
      return opts.ctx.user;
    }
  )
});

//
// Users router
// 

const usersRouter = t.router({
  test: adminProcedure.query(opts => {
    console.log(`TEST from server`);
    console.log(opts.ctx.user);
    return true;
  }),
  search: adminProcedure
  .input(z.string().min(3).max(255))
  .query(async opts => {
    return await DAO.users.searchUsers(db.pool(), opts.input, [
      'id', 'firstname', 'lastname', 'email', 'admin', 'archived', 'blocked', 'created_at'
    ]);
  }),
  updatePassword: authedProcedure
  .input(z.object({
    id: idZodValidation,
    pwd: z.string().min(6).max(255)
  }))
  .mutation(async opts => {
    if (opts.input.id != opts.ctx.user.id && !opts.ctx.user.admin)
      throw new ForbiddenException(`You can't change other users password`);
    
    await DAO.service.users.updatePassword(opts.input.id, opts.input.pwd);
  }),
});

export const appRouter = t.router({
  auth: authRouter,
  users: usersRouter,
}); 

// export type definition of API
export type AppRouter = typeof appRouter;
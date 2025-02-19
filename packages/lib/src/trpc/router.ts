import { initTRPC } from '@trpc/server';
import { set, z } from 'zod';
import superjson from 'superjson';

import DAO from '@whisper-webui/lib/src/db/DAO.ts';
import db from '@whisper-webui/lib/src/db/db.ts';
import store from '@whisper-webui/lib/src/db/store.ts';
import lib from '@whisper-webui/lib/src/lib/index.ts';

// user session expiration time
const exp: number = parseInt(process.env.USER_SESSION_EXP_TIME);

export const t = initTRPC.create({
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

export const publicProcedure = t.procedure;

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

const authRouter = t.router({
  login: publicProcedure
    .input(z.object({
      email: z.string().email().max(255),
      pwd: z.string().min(6).max(255)
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
    })
});

const usersRouter = t.router({
  
  getUserById: publicProcedure.input(z.number()).query(opts => {
    return {
      a: `coucou`,
      b: 1234
    }
  })
});

export const appRouter = t.router({
  auth: authRouter,
  users: usersRouter,
}); 

// export type definition of API
export type AppRouter = typeof appRouter;
import { initTRPC } from '@trpc/server'
import { set, z } from 'zod'
import superjson from 'superjson'
import { OperationMeta } from 'openapi-trpc'
import { generateOpenAPIDocumentFromTRPCRouter } from 'openapi-trpc'
import DAO from '@whisper-webui/lib/src/db/DAO.ts'
import store from '@whisper-webui/lib/src/db/store.ts'
import lib from '@whisper-webui/lib/src/lib/index.ts'
import { BadRequestException, ForbiddenException, UnauthorizedException } from '@whisper-webui/lib/src/db/exceptions.ts'

import { Context } from 'src/trpc/context.ts'
import { User } from '@whisper-webui/lib/src/types/kysely.ts'

const idZodValidation = z.string().refine((val) => {
  // id must be 24 length string
  if (val.length != 24)
    return false

  // id must contain only UPPERCASE hexadecimal characters
  for (let i = 0; i < 24; i++) {
    const charCode = val.charCodeAt(i)
    if (!(charCode >= 48 && charCode <= 57) && !(charCode >= 65 && charCode <= 70))
      return false
  }

  // id is valid
  return true
}, {
  message: "INVALID ID. Must be 24 characters long and contain only UPPERCASE hexadecimal characters.",
})

const nameZodValidation = z.string().min(1).max(255)
const passwordZodValidation = z.string().min(6).max(255)
const emailZodValidation = z.string().email().max(255)

// user session expiration time
const exp: number = parseInt(process.env.USER_SESSION_EXP_TIME || '86400')

export const t = initTRPC.context<Context>().meta<OperationMeta>().create({
  transformer: superjson,
  errorFormatter({ error, shape }) {    
    if (shape.message.startsWith(`InvalidRequestException:`)){
      shape.data.httpStatus = 400
      shape.data.code = 'BAD_REQUEST'
    }
    else if (shape.message.startsWith(`UnauthorizedException:`)){
      shape.data.httpStatus = 401
      shape.data.code = 'UNAUTHORIZED'
    }
    else if (shape.message.startsWith(`ForbiddenException:`)){
      shape.data.httpStatus = 403
      shape.data.code = 'FORBIDDEN'
    }
    else if (shape.message.startsWith(`NotFoundException:`)){
      shape.data.httpStatus = 404
      shape.data.code = 'NOT_FOUND'
    }
    else if (shape.message.startsWith(`ConflictException:`)){
      shape.data.httpStatus = 409
      shape.data.code = 'CONFLICT'
    }

    return shape
  },
})

// Authenticate the user session
export const sessionProcessing = t.middleware(async ({ ctx, next }) => {
  // sessionId provided by the user cookie
  if (!ctx.req.cookies.sessionId)
    throw new UnauthorizedException(`SessionId not found`)

  const sessionId: string = ctx.req.cookies.sessionId
  
  // get the session stored in redis
  const user = await store.getSession(sessionId)
  if (!user)
    throw new UnauthorizedException(`Session not found`)
  
  // extends the session
  await store.extendSession(sessionId, exp)

  // save the user in the context
  ctx["user"] = user

  return next()
})

export const publicProcedure = t.procedure
export const authedProcedure = t.procedure.use(sessionProcessing)
export const adminProcedure  = t.procedure.use(sessionProcessing).use(async ({ ctx, next }) => {
  if (!ctx.user || !ctx.user.admin)
    throw new ForbiddenException(`You can't access this route`)

  return next()
}) 

function setSessionCookie(ctx: any, sessionId: string, exp: number){
  ctx.res.setCookie('sessionId', sessionId, {
    httpOnly: true,
    path: '/',
    maxAge: exp,
    secure: true,
    sameSite: 'None',

  })
}

function removeSessionCookie(ctx: any){
  ctx.res.setCookie('sessionId', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0
  })
}

//
// Auth router
//
const authRouter = t.router({
  // user login
  login: publicProcedure
  .input(z.object({
    email: emailZodValidation,
    pwd: passwordZodValidation,
  }))
  .mutation(async opts => {
    const user = await DAO.users.login(opts.input.email, opts.input.pwd)

    // create a new session for the user
    const sessionId = lib.uid.genUID()
    await store.createSession(sessionId, user, exp)
    setSessionCookie(opts.ctx, sessionId, exp)
    return user
  }),

  // user logout
  logout: publicProcedure
  .query(async opts => {
    if (!opts.ctx.req.cookies.sessionId)
      throw new BadRequestException(`SessionId not found`)

    removeSessionCookie(opts.ctx)
    await store.deleteSession(opts.ctx.req.cookies.sessionId)
  }),

  // user extend session
  renew: authedProcedure
    .query(opts => { 
      return opts.ctx.user
    }
  )
})

// ################
// # Users router #
// ################
const usersRouter = t.router({
  /*test: adminProcedure
  .input(z.string())
  .query(opts => {
    console.log(`TEST from server`)
    console.log(opts.ctx.user)
    return true
  }),*/

  // find a user
  find: adminProcedure
  //.input(z.string())
  .input(z.object({ id: z.string() }))
  .query(async opts => {
    const user = await DAO.users.findById(opts.input.id)
    delete user['pwd']
    delete user['salt']
    return user
  }),

  // full-text search a user
  search: adminProcedure
  //.input(z.string().min(1).max(255))
  .input(z.object({ term: z.string().min(1).max(255) }))
  .query(async opts => {
    const term = opts.input.term.trim().replace(/\s+/g, ` `)
    const users = term == '*' ? await DAO.users.findAll() : await DAO.users.searchUsers(term)
    for (const user of users){
      delete user['pwd']
      delete user['salt']
    }
    return users
  }),

  // get users statistics
  stats: adminProcedure
  .query(async opts => {
    return await DAO.users.stats()
  }),

  // update user password
  updatePassword: authedProcedure
  .input(z.object({
    id: idZodValidation,
    pwd: z.string().min(6).max(255)
  }))
  .mutation(async opts => {
    if (!opts.ctx.user)
      throw new ForbiddenException(`User not authenticated`)
    if (opts.input.id != opts.ctx.user.id && !opts.ctx.user.admin)
      throw new ForbiddenException(`You can't change other users password`)
    
    await DAO.users.updatePassword(opts.input.id, opts.input.pwd)
  }),

  // create a new user
  createUser: adminProcedure
  .input(z.object({
    email: emailZodValidation,
    firstname: nameZodValidation,
    lastname: nameZodValidation,
    pwd: passwordZodValidation
  }))
  .mutation(async opts => {
    await DAO.users.userUnarchivable(opts.input.email)
    return await DAO.users.createUser({
      id: lib.uid.genUID(), 
      firstname: opts.input.firstname,
      lastname: opts.input.lastname,
      email: opts.input.email,
      pwd: opts.input.pwd,
      salt: null,
      admin: false,
      archived: false,
      blocked: false,
      created_at: new Date()
    })
  }),

  // update user password
  updateSettings: adminProcedure
  .input(z.object({
    id: idZodValidation,
    args: z.object({
      admin: z.boolean().optional(),
      archived: z.boolean().optional(),
      blocked: z.boolean().optional(),
      firstname: nameZodValidation.optional(),
      lastname: nameZodValidation.optional(),
      email: emailZodValidation.optional()
    })
  }))
  .mutation(async opts => {
    if (!Object.keys(opts.input.args).length)
      throw new BadRequestException(`No arguments provided`)

    await DAO.users.update(opts.input.id, opts.input.args)
  }),

  // delete a user
  deleteUser: adminProcedure
  .input(z.object({
    id: idZodValidation,
  }))
  .mutation(async opts => {
    await DAO.users.deleteUser(opts.input.id)
  }),

})

// #########################
// # Transcriptions router #
// #########################
const transcriptionRouter = t.router({

  // find transcriptions by userId
  findByUserId: authedProcedure
  .input(z.object({ 
    userId: idZodValidation
  }))
  .query(async opts => {
    if (opts.input.userId != opts.ctx.user?.id && !opts.ctx.user?.admin)
      throw new ForbiddenException(`You are not allowed to access this resource`)

    // return only the transcriptions that are not deleted
    return (await DAO.transcriptions.findByUserId(opts.input.userId))
      .filter(transcription => !transcription.deleted)
  }),

  // delete transcription by id
  deleteByTranscriptionId: authedProcedure
  .input(z.object({ 
    transcriptionId: idZodValidation
  }))
  .mutation(async opts => {
    // we need to check if the transcription belongs to the user if not admin
    if (!opts.ctx.user?.admin){
      const transcriptions = await DAO.transcriptions.findByUserId(opts.ctx.user?.id || '')
      if (!transcriptions.find(trs => trs.id == opts.input.transcriptionId))
        throw new ForbiddenException(`You are not allowed to delete this transcription`)
    }
    
    await DAO.transcriptions.deleteById(opts.input.transcriptionId)
  })


})

export const appRouter = t.router({
  auth: authRouter,
  users: usersRouter,
  transcriptions: transcriptionRouter
}) 

export const openAPIDocument = generateOpenAPIDocumentFromTRPCRouter(appRouter, {
  pathPrefix: '/trpc',
})

// export type definition of API
export type AppRouter = typeof appRouter
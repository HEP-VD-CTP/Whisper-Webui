import Fastify  from 'fastify'
import fastifyCookie from '@fastify/cookie'
import urlData from '@fastify/url-data'
import multipart from '@fastify/multipart'
import { FastifyRequest } from 'fastify'
import fastifyCors from '@fastify/cors'

import path from 'node:path'
import { pipeline } from 'stream/promises'
import fs from 'node:fs'

import {
  fastifyTRPCPlugin,
  FastifyTRPCPluginOptions,
} from '@trpc/server/adapters/fastify'

import { 
  appRouter, 
  type AppRouter,
} from 'src/trpc/router.ts'

import logger from 'src/lib/logger.ts'
import { createContext } from 'src/trpc/context.ts'
import store from '@whisper-webui/lib/src/db/store.ts'
import { 
  UnauthorizedException, 
  BadRequestException,
  ForbiddenException
} from '@whisper-webui/lib/src/db/exceptions.ts'
import lib from '@whisper-webui/lib/src/lib/index.ts'
import DAO from '@whisper-webui/lib/src/db/DAO.ts'
import { User } from '@whisper-webui/lib/src/types/kysely.ts'


const PORT: number = 9000

const app = Fastify({ 
  logger: false,
  bodyLimit: 20 * 1024 * 1024 // 20MB
})
 
app.register(fastifyCors, { 
  origin: ['https://localhost:8443'], 
  credentials: true,
})
app.register(fastifyCookie)
app.register(multipart, { limits: { fileSize: 4 * 1024 * 1024 * 1024 } } ) // max file size 4GB
app.register(urlData)


// register trpc server
app.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: {
    router: appRouter,
    createContext,
    onError({ path, error }) {
      console.error(`Error in tRPC handler on path '${path}': ${error}`)
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
})

app.addHook('preHandler', async (request, reply) => {})
app.addHook('onResponse', async (request, reply) => {})

async function checkSession(rawCookies: string): Promise<User> {
  const cookies = Object.fromEntries(
    rawCookies
      .split('; ')
      .map(cookie => {
        const [name, ...rest] = cookie.split('=')
        return [name, rest.join('=')]
      })
  )

  const sessionId = cookies.sessionId
  if (!sessionId) 
    throw new ForbiddenException(`No sessionId provided`)

  if (sessionId.length != 24)
    throw new ForbiddenException(`Invalid sessionId length`)

  for (let i = 0; i < 24; i++) {
    const charCode = sessionId.charCodeAt(i)
    if (!(charCode >= 48 && charCode <= 57) && !(charCode >= 65 && charCode <= 70))
      throw new ForbiddenException(`Invalid sessionId provided`)
  }

  const user = await store.getSession(sessionId)
  if (!user)
    throw new ForbiddenException(`User session not found`)
  
  return user
}

// handle route validation for nginx audio
app.get('/auth', async (req, res) => {
  await checkSession(req.headers.cookie || '')
  return res.status(204).send()
})

// Handle whisper video upload
app.route({
  method:`POST`,
  url: `/transcription/upload`,
  schema: {
    querystring: {
      type: 'object',
      properties: {
        lang: { 
          type: 'string', 
          enum: ['af', 'am', 'ar', 'as', 'az', 'ba', 'be', 'bg', 'bn', 'bo', 'br', 'bs', 'ca', 'cs', 'cy', 'da', 'de', 'el', 'en',
                 'es' , 'et', 'eu', 'fa', 'fi', 'fo', 'fr', 'gl', 'gu', 'ha', 'haw', 'he', 'hi', 'hr', 'ht', 'hu', 'hy', 'id', 'is',
                 'it', 'ja', 'jw', 'ka', 'kk', 'km', 'kn', 'ko', 'la', 'lb', 'ln', 'lo', 'lt', 'lv', 'mg', 'mi', 'mk', 'ml', 'mn', 'mr',
                 'ms', 'mt', 'my', 'ne', 'nl', 'nn', 'no', 'oc', 'pa', 'pl', 'ps', 'pt', 'ro', 'ru' ,'sa', 'sd', 'si', 'sk', 'sl', 'sn', 'so',
                 'sq', 'sr', 'su', 'sv', 'sw', 'ta', 'te', 'tg', 'th', 'tk', 'tl', 'tr', 'tt', 'uk', 'ur', 'uz', 'vi', 'yi', 'yo', 'yue', 'zh'] 
        } 
      },
      required: ['lang'],
    },
  },
  handler: async (req: FastifyRequest<{ Querystring: { lang: string }}>, res) => {
    // get the user
    const user: User = await checkSession(req.headers.cookie || '')

    // get the file informations
    const data = await req.file({limits: {
      files: 1,
      fileSize: 4 * 1024 * 1024 * 1024 // max file size 4GB
    }})

    if (!data) 
      throw new BadRequestException(`No file uploaded or invalid file`)
    
    // only audio/video are accepted
    const mimetype = data.mimetype;
    if (!mimetype.includes(`video`) && !mimetype.includes(`audio`))
      throw new BadRequestException(`The file is not audio/video`)

    // get file informations
    const name = data.filename.trim()
    // sanitize the filename
    const filename = name
      .slice(-255)
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\/?<>\\:*|"]/g, `-`)
      .replace(/^\.+$/, `-`)
      .replace(/^(con|prn|aux|nul|com\d|lpt\d)(\..*)?$/i, `-`)
      .replace(/[. ]+$/, '')
      .replace(/[^a-z0-9._-]+/gi, `-`)
      .replace(/-{2,}/g, `-`)
      .replace(/^-+|-+$/g, '')

    console.log(
      `\n=== New transcription file incoming ===\n` +
      `UserId: ${user.id}\n` +
      `Email: ${user.email}\n` +
      `Name: ${name}\n` +
      `Filename: ${filename}\n` +
      `Mimetype: ${mimetype}\n`);
    
    // transcription id
    const uid = lib.uid.genUID()

    // save file to disk
    const folderPath = path.join('/data/transcriptions/in', uid)
    const filePath = path.join(folderPath, filename)
    await fs.promises.mkdir(folderPath, { recursive: true })
    await pipeline(data.file, fs.createWriteStream(filePath))

    // save to db
    await DAO.transcriptions.createTranscription(user.id, {
      id: uid,
      name: name,
      file: filename,
      lang: req.query.lang,
      status: `waiting`,
      created: new Date(),
      deleted: 0
    })

    // send the transcription into the queue
    await store.enqueue('transcriptions', uid)

    // wait 1 second before sending the response
    await new Promise(resolve => setTimeout(resolve, 1000))
    res.code(200).send(await DAO.transcriptions.findById(uid))
  }
})

try {
  await app.listen({ host:`0.0.0.0`, port: PORT })
  logger.info(`startup`, `Backend is listening on port ${PORT} in ${process.env.NODE_ENV} mode`)
} 
catch (err) {
  
  logger.error('startup', 'Backend failed to start', err instanceof Error ? err : new Error(String(err)))
  process.exit(1)
}


// to-do: log 
process.on('uncaughtException', (error) => {
  logger.error('uncaughtException', 'Uncaught Exception', error)
})
process.on('unhandledRejection', (reason, promise) => {
  logger.error('unhandledRejection', 'Unhandled Rejection', reason instanceof Error ? reason : new Error(String(reason)))
})

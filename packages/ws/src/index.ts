import Fastify from "fastify"
import websocket from '@fastify/websocket'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import store from '@whisper-webui/lib/src/db/store.ts'
import { type StatusUpdate } from '@whisper-webui/lib/src/types/types.ts'
import logger from '@whisper-webui/lib/src/lib/logger.ts'


const PORT: number = 9001

// init fastify
const app = Fastify({logger:false});
await app.register(websocket);
app.register(fastifyCors, { 
  origin: ['https://localhost:8443'], 
  credentials: true,
})
app.register(fastifyCookie)


// ws handler 
app.get('/ws/updates', { websocket: true }, async (con: any, req) => {
  // the isAlive is used to check if the connection is still alive.
  // if the client pong, it means that we can mark the con as alive
  con.isAlive = true
  con.on(`pong`, () => con.isAlive = true)

  // get sessionId from cookie
  const cookies = Object.fromEntries(
    (req.headers.cookie || '')
      .split('; ')
      .map(cookie => {
        const [name, ...rest] = cookie.split('=')
        return [name, rest.join('=')]
      })
  )

  // check if sessionId exists and is valid
  const sessionId = cookies.sessionId
  if (!sessionId) 
    return con.socket.close(4001, 'Missing sessionId cookie')

  if (sessionId.length != 24)
    return con.socket.close(4001, 'Invalid sessionId length')

  for (let i = 0; i < 24; i++) {
    const charCode = sessionId.charCodeAt(i)
    if (!(charCode >= 48 && charCode <= 57) && !(charCode >= 65 && charCode <= 70))
      return con.socket.close(4001, 'Invalid sessionId')
  }

  // check user session
  const user = await store.getSession(sessionId)
  if (!user) 
    return con.socket.close(4001, 'Session not found')

  console.log(`New WebSocket connection established: ${sessionId}`)
  con.sessionId = sessionId
  con.user = user

  // cleanup on close
  con.on('close', () => {
    con.user = null
    con.sessionId = null
    con.isAlive = null
  })
})

// check for messages to send to clients
store.subscribe('updates', async (message: string) => {
  const statusUpdate: StatusUpdate = JSON.parse(message)
  for (const cli of app.websocketServer.clients as any) {
    try {
      // send only to clients that are owners of the transcription
      if (cli.user && statusUpdate.owners.some(o => o.id == cli.user.id))
        cli.send(message)
    }
    catch(err){
      console.error(err)
    }
  }   
})

// check if the connection is alive
setInterval(() => {
  for (const cli of app.websocketServer.clients as any) {
    try {
      if (!cli.isAlive){
        cli.terminate()
        continue
      }
      
      cli.isAlive = false
      cli.ping()
    }
    catch(err){
      console.error(err)
    }
  }
}, 25000)

try {
  await app.listen({ host:`0.0.0.0`, port: PORT })
  logger.info(`ws_startup`, `WS is listening on port ${PORT} in ${process.env.NODE_ENV} mode`)
} 
catch (err) {
  logger.error('ws_startup', 'WS failed to start', err instanceof Error ? err : new Error(String(err))) 
  process.exit(1)
}
  

process.on('uncaughtException', (error) => {
  logger.error('ws_uncaughtException', 'Uncaught Exception', error)
})
process.on('unhandledRejection', (reason, promise) => {
  logger.error('ws_unhandledRejection', 'Unhandled Rejection', reason instanceof Error ? reason : new Error(String(reason)))
})
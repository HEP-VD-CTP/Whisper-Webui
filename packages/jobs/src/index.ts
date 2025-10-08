import worker from './worker.ts'
import DAO from '@whisper-webui/lib/src/db/DAO.ts'
import store from '@whisper-webui/lib/src/db/store.ts'
import { type ExternalQuery } from '@whisper-webui/lib/src/types/types.ts'
import lib from '@whisper-webui/lib/src/lib/index.ts'
import logger from '@whisper-webui/lib/src/lib/logger.ts'



console.log(`########################`)
console.log(`# Whisper Jobs started #`)
console.log(`########################`)

// insert the external queries one by one into the database
worker.use('queries', async (job: string) => {
  try {
    const query: ExternalQuery = JSON.parse(job)

    await DAO.queries.insertQuery({
      id: Buffer.from(lib.uid.genUID(), 'hex'),
      route: query.route,
      method: query.method,
      userid: query.userid,
      ip: query.ip,
      headers: query.headers,
      status: query.status || 0,
      duration: query.duration,
      created: new Date()
    })
  }
  catch(err){
    logger.error('jobs', `Jobs failed for ${job}`, err instanceof Error ? err : new Error(String(err))) 
  }
})


process.on('uncaughtException', (error) => {
  logger.error('jobs_uncaughtException', 'Uncaught Exception', error)
})
process.on('unhandledRejection', (reason, promise) => {
  logger.error('jobs_unhandledRejection', 'Unhandled Rejection', reason instanceof Error ? reason : new Error(String(reason)))
})



 
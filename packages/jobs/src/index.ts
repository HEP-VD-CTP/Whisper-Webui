import worker from './worker.ts'
import DAO from '@whisper-webui/lib/src/db/DAO.ts'
import store from '@whisper-webui/lib/src/db/store.ts'
import { type ExternalQuery } from '@whisper-webui/lib/src/types/types.ts'
import lib from '@whisper-webui/lib/src/lib/index.ts'



console.log(`########################`)
console.log(`# Whisper Jobs started #`)
console.log(`########################`)

// insert the external queries one by one into the database
worker.use('queries', async (job: string) => {
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
})





 
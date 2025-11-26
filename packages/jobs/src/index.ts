import worker from './worker.ts'
import DAO from '@whisper-webui/lib/src/db/DAO.ts'
import store from '@whisper-webui/lib/src/db/store.ts'
import { 
  type transcriptionQueued, 
  type ExternalQuery 
} from '@whisper-webui/lib/src/types/types.ts' 
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

// send email notifications
worker.use('TranscriptionEmails', async (transcriptionQueuedString: string) => {
  try {
    // parse the transcriptionQueued object
    const t: transcriptionQueued = JSON.parse(transcriptionQueuedString)
    const id: string = t.uid
    const lang: string = t.lang

    console.log(`Sending emails for transcription ID: ${id}`)

    // get all the owners' emails
    const owners: Array<string> = (await DAO.transcriptions.findTrandscriptionOwners(id))
      .map(x => x.email || '')
      .filter(x => x.length > 0)

    // get transcription details
    const transcription = await DAO.transcriptions.findById(id)

    // the status is true if done and false if anything else
    const transcriptionStatus: boolean = transcription.status === 'done'

    // prepare the email content
    let subject: string = ''
    let body: string = ''
    const target: string = process.env['DOMAIN'] || ''
    let targetLabel: string = ''
    let footer: string = ''
    switch (lang) {
      case 'fr':
        subject = transcriptionStatus ? 'Votre transcription est terminée' : 'Échec de votre transcription'
        subject += ` - ${transcription.name}`
        body = 
          transcriptionStatus ? 
            `<p>
              <h1>Bonjour 👋</h1>
              Votre transcription <b>${transcription.name}</b> est maintenant terminée. Vous pouvez la consulter en vous connectant à votre compte.
            </p>`
            :
            `<p>
              <h1>Bonjour 👋</h1>
              Votre transcription <b>${transcription.name}</b> a échoué. Veuillez réessayer en téléchargeant à nouveau votre fichier.<br/>
            </p>
            <p>Si le problème persiste, veuillez contacter le support.</p>`
        targetLabel = transcriptionStatus ? 'Consulter la transcription' : 'Réessayer la transcription' 
        footer = `Ceci est un email automatique, merci de ne pas y répondre.`

        break
      case 'en': // by default, english email content
      default:
        subject = transcriptionStatus ? 'Your transcription is complete' : 'Your transcription has failed'
        subject += ` - ${transcription.name}`
        body = 
          transcriptionStatus ? 
            `<p>
              <h1>Hello 👋</h1>
              Your transcription <b>${transcription.name}</b> is now complete. You can view it by logging into your account.
            </p>`
            :
            `<p>
              <h1>Hello 👋</h1>
              Your transcription <b>${transcription.name}</b> has failed. Please try again by re-uploading your file.<br/>
            </p>
            <p>If the issue persists, please contact support.</p>`
        targetLabel = transcriptionStatus ? 'View Transcription' : 'Retry Transcription' 
        footer = `This is an automated email, please do not reply.`
        break
    }

    // send the email to all owners
    owners.map(async owner => {
      await lib.email.sendEmail({
        lang,
        to: owner,
        subject,
        body,
        target,
        targetLabel,
        footer
      })
    })
  }
  catch(err){
    logger.error('TranscriptionEmails', `Transcription emails failed for ${transcriptionQueuedString}`, err instanceof Error ? err : new Error(String(err))) 
  }
})


process.on('uncaughtException', (error) => {
  logger.error('jobs_uncaughtException', 'Uncaught Exception', error)
})
process.on('unhandledRejection', (reason, promise) => {
  logger.error('jobs_unhandledRejection', 'Unhandled Rejection', reason instanceof Error ? reason : new Error(String(reason)))
})



 
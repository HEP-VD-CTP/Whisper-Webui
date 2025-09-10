
import worker from './worker.ts'
import DAO from '@whisper-webui/lib/src/db/DAO.ts'

worker.use(async (id: string) => {
  try {
    console.log(`Received ID: ${id}`)
    const transcription = await DAO.transcriptions.findById(id)
    console.log('Transcription:')
    console.log(transcription)

    // update transcription status to processing
    await DAO.transcriptions.updateTranscription(id, { status: 'processing', processed: new Date() })

    

    // update transcription status to done
    await DAO.transcriptions.updateTranscription(id, { status: 'done', done: new Date() })
  }
  catch(err){
    console.error(err)
    await DAO.transcriptions.updateTranscription(id, { status: 'error', comment: (err instanceof Error ? err.message : String(err))})
  }
  
})




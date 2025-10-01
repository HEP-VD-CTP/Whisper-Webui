import worker from './worker.ts'
import DAO from '@whisper-webui/lib/src/db/DAO.ts'
import store from '@whisper-webui/lib/src/db/store.ts'
import fs from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { type Segment, type StatusUpdate } from '@whisper-webui/lib/src/types/types.ts'
import { type Transcription } from '@whisper-webui/lib/src/types/kysely.ts'

const execFileAsync = promisify(execFile)

const modelsFolder: string = '/data/transcriptions/models'
const hfToken: string|undefined = process.env['HF_TOKEN']
const whisperModel: string = process.env['WHISPER_MODEL'] || 'large-v2'
const threads: string = process.env['WHISPER_CPU_THREADS'] || '4'
const batch_size: string = process.env['BATCH_SIZE'] || '8'
const device: string = process.env['WHISPER_DEVICE'] || 'cpu'
if(!hfToken){
  console.error('No HF_TOKEN provided in environment variables. Exit.')
  process.exit(1)
}

console.log(`##########################`)
console.log(`# Whisper Worker started #`)
console.log(`##########################`)

// get transcription id from the queue one by one and process it
worker.use(async (id: string) => {
  // initial status update
  const statusUpdate: StatusUpdate = {
    transcriptionId: id,
    owners: [],
    status: 'error'
  }

  try {
    // get transcription details
    console.log(`Received ID: ${id}`)
    const transcription: Transcription = await DAO.transcriptions.findById(id)
    
    statusUpdate.owners = (await DAO.transcriptions.findTrandscriptionOwners(id)).map(x => ({
        id: typeof x.id === 'string' ? x.id : (x.id instanceof Buffer ? x.id.toString('hex') : ''),
        email: x.email || '',
        firstName: x.firstname || '',
        lastName: x.lastname || ''
      }))

    console.log('Transcription:')
    console.log(transcription)
    console.log('Owners:')
    console.log(statusUpdate.owners)

    // update transcription status to processing
    await DAO.transcriptions.updateTranscription(id, { status: 'processing', processed: new Date() })

    // send status update to all owners
    statusUpdate.status = 'processing'
    store.publish('updates', JSON.stringify(statusUpdate))

    // create the destination folder
    const destFolder = path.join(`/data/transcriptions/out/`, id)
    fs.mkdirSync(destFolder, { recursive: true })

    // extract the audio to mp3
    const sourceFile = path.join(`/data/transcriptions/in/`, id, transcription.file)
    const targetFileName = `${path.parse(transcription.file).name}.mp3`
    const targetFile = path.join(destFolder, targetFileName)
    await execFileAsync('ffmpeg', [
      '-i', sourceFile,
      '-vn',
      '-codec:a', 'libmp3lame',
      '-map_metadata', '0',
      '-map_metadata', '0:s:0',
      '-id3v2_version', '3',
      targetFile
    ])

    // delete the source folder 
    fs.rmSync(path.join(`/data/transcriptions/in/`, id), { recursive: true, force: true })

    // get duration and metadata using ffprobe
    const { stdout } = await execFileAsync('ffprobe', [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      targetFile
    ])
    const info = JSON.parse(stdout)
    const duration: number|null = info.format?.duration ? parseFloat(info.format.duration) : null
    const metadata: string|null = JSON.stringify(info) // remove unnecessary white spaces from ffprobe json output
    
    // update transcription with duration and metadata
    await DAO.transcriptions.updateTranscription(id, { duration, metadata, file: targetFileName })

    // build the whisperx command
    const cmd = [
      'whisperx',
      targetFile,
      '--threads', threads,
      '--model', whisperModel,
      '--batch_size', batch_size,
      '--diarize',
      '--align_model', 'WAV2VEC2_ASR_LARGE_LV60K_960H',
      '--language', transcription.lang || 'en',
      '--output_dir', destFolder,
      '--output_format', 'json',
      '--device', device,
      '--compute_type', device == 'cpu' ? 'int8' : 'float16',
      '--hf_token', hfToken,
      '--model_dir', modelsFolder
    ]

    console.log('Running command:')
    console.log(cmd.join(' '))
    
    // run the whisperx command
    await execFileAsync(cmd[0], cmd.slice(1))
    console.log('Whisperx command finished')

    // get the json and prepare the segments
    const jsonPath = path.join(destFolder, `${path.parse(transcription.file).name}.json`)
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

    // bag of words
    const words = data['word_segments'].map((x: any) => {
      return {
        start: x.start,
        end: x.end,
        text: x.word,
        speaker: x.speaker
      }
    })

    // ensure first word has start/end and a speaker
    if (words.length) {
      if (!words[0].start) 
        words[0].start = 0
      if (!words[0].end) 
        words[0].end = 0.1
      if (!words[0].speaker) 
        words[0].speaker = 'UNKNOWN_SPEAKER'
    }
    // ensure all words have start/end and a speaker
    for (let i = 1; i < words.length; i++) {
      if (!words[i].start) 
        words[i].start = words[i-1].start
      if (!words[i].end) 
        words[i].end = words[i-1].end
      if (!words[i].speaker) 
        words[i].speaker = words[i-1].speaker
    }

    // group consecutive words by speaker
    const segments: Array<Segment> = []
    let currentSegment: Segment|null = null
    for (const word of words) {
      if (!currentSegment || currentSegment.speaker != word.speaker) {
        // Start new segment
        currentSegment = {
          start: word.start,
          end: word.end,
          speaker: word.speaker,
          words: []
        }
        segments.push(currentSegment)
      }
      currentSegment.end = word.end // update end time
      currentSegment.words.push({
        start: word.start,
        end: word.end,
        word: word.text
      })
    }

    // update transcription status to done
    await DAO.transcriptions.updateTranscription(id, { 
      text: JSON.stringify(segments),
      status: 'done', 
      done: new Date()
    })

    // send status update to all owners
    statusUpdate.status = 'done'
    store.publish('updates', JSON.stringify(statusUpdate))
  }
  catch(err){
    console.error(err)

    // send status update to all owners
    statusUpdate.status = 'error'
    store.publish('updates', JSON.stringify(statusUpdate))
    
    // update transcription status to error
    await DAO.transcriptions.updateTranscription(id, { status: 'error', comment: (err instanceof Error ? err.message : String(err))})
  }
  
})





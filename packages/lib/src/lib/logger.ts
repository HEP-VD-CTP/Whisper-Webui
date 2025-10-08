import fs from 'node:fs'
import lib from '@whisper-webui/lib/src/lib/index.ts'

const PATH_INFO_LOG  = '/data/logs/info.log'
const PATH_ERROR_LOG = '/data/logs/error.log'

// Create write streams for the log files
const infoStream = fs.createWriteStream(PATH_INFO_LOG, { flags: 'a' })
const errorStream = fs.createWriteStream(PATH_ERROR_LOG, { flags: 'a' })

function info(type: string, message: string): void{
  const msg = {
    time: lib.time.formatDate(new Date(), `DD.MM.YYYY HH:mm:ss`),
    type,
    message
  }

  console.info(msg)
  infoStream.write(JSON.stringify(msg) + '\n')
}

function error(type: string, message: string, error: Error): void {
  const msg = {
    time: lib.time.formatDate(new Date(), `DD.MM.YYYY HH:mm:ss`),
    type,
    message,
    error: {
      message: error.toString(),
      stack: error.stack
    }
  }

  console.error(msg)
  errorStream.write(JSON.stringify(msg) + '\n')
}

export default { info, error } 
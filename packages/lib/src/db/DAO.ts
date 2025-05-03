

import usersDAO from '@whisper-webui/lib/src/db/usersDAO.ts'
import service from '@whisper-webui/lib/src/db/service.ts'
import transcriptionDAO from './transcriptionDAO.ts'

export default {
  service: service,
  users: usersDAO,
  transcriptions: transcriptionDAO,
}
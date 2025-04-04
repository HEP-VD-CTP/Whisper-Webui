

import usersDAO from '@whisper-webui/lib/src/db/usersDAO.ts'
import service from '@whisper-webui/lib/src/db/service.ts'

export default {
  service: service,
  users: usersDAO,
}
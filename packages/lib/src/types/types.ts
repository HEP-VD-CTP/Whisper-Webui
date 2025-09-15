

export type UsersStats = {
  total: number
  blocked: number
  archived: number
}

export type Segment = {
  start: number
  end: number
  speaker: string
  words: Array<{ 
		start: number 
		end: number 
		word: string 
	}>
}

export type StatusUpdate = {
  transcriptionId: string,
  status: 'queued' | 'processing' | 'done' | 'error',
  owners: Array<{
    id: string,
    email: string
  }>
}
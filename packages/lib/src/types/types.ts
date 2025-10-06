

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
  status: "error" | "waiting" | "processing" | "done",
  owners: Array<{
    id: string,
    firstName: string,
    lastName: string,
    email: string
  }>
}

export type ExternalQuery = {
  route: string,
  method: string,
  userid: string,
  ip: string, 
  headers: string,
  status?: number,
  duration: number
}
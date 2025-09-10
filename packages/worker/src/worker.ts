
import store from '@whisper-webui/lib/src/db/store.ts'


export async function use(cb: (id: string) => Promise<void>): Promise<void>{
  while (true){
    try {
      const id = await store.dequeue('transcriptions')
      if(id)
        await cb(id)
    }
    catch(err){
      console.error(err)
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
}

export default {
  use,
}
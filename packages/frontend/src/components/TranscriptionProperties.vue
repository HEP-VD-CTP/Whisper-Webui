<template>
  <div>
    <q-item-label header>{{ t('users.users') }}</q-item-label>

    
    <q-list>
      <q-item dense>
        <q-item-section>
          <q-input bottom-slots v-model="newUserEmail" @keydown.enter.prevent="addUser" type="email" :label="t('users.add_user')">
            <template v-slot:append>
              <q-btn color="green" flat round icon="add" @click="addUser" :loading="addUserLoading" />
            </template>
            <template v-slot:hint>
              {{ t('transcription.properties_and_metadata.infos.add_user_label') }}
            </template>
          </q-input>
        </q-item-section>
      </q-item>
    </q-list> 

    <q-list class="q-mt-lg">
      <q-item clickable dense v-for="(user, index) in owners">
        <q-item-section>
          <q-item-label>{{ user?.firstname }} {{ user?.lastname }}</q-item-label>
          <q-item-label caption>{{ user?.email }}</q-item-label>
        </q-item-section>
        <q-item-section @click="deleteOwner(user.id as string)" avatar>
          <q-icon color="red" name="clear" />
        </q-item-section>
      </q-item>
    </q-list>
    
    
    <q-separator inset spaced />
    <q-item-label header>{{ t('transcription.properties_and_metadata.properties') }}</q-item-label>
    <q-list>
      <q-item dense>
        <q-item-section>
          <q-item-label>UID</q-item-label>
          <q-item-label caption>{{ transcription?.id }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item dense>
        <q-item-section>
          <q-item-label>{{ t('transcription.properties_and_metadata.infos.name') }}</q-item-label>
          <q-item-label caption>{{ transcription?.name }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item dense>
        <q-item-section>
          <q-item-label>{{ t('transcription.properties_and_metadata.infos.file') }}</q-item-label>
          <q-item-label caption>{{ transcription?.file }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item dense>
        <q-item-section>
          <q-item-label>Status</q-item-label>
          <q-item-label caption>{{ transcription?.status }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item dense>
        <q-item-section>
          <q-item-label>{{ t('transcription.properties_and_metadata.infos.lang') }}</q-item-label>
          <q-item-label caption>{{ transcription?.lang }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item dense>
        <q-item-section>
          <q-item-label>{{ t('transcription.properties_and_metadata.infos.duration') }}</q-item-label>
          <q-item-label caption>{{ transcription.duration }}s</q-item-label>
        </q-item-section>
      </q-item>
      <q-item dense>
        <q-item-section>
          <q-item-label>{{ t('transcription.properties_and_metadata.infos.created') }}</q-item-label>
          <q-item-label caption>{{ lib.date.formatDate(transcription.created, 'DD.MM.YYYY HH:mm:ss') }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item dense>
        <q-item-section>
          <q-item-label>{{ t('transcription.properties_and_metadata.infos.processed') }}</q-item-label>
          <q-item-label caption>{{ lib.date.formatDate(transcription.processed, 'DD.MM.YYYY HH:mm:ss') }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item dense>
        <q-item-section>
          <q-item-label>{{ t('transcription.properties_and_metadata.infos.done') }}</q-item-label>
          <q-item-label caption>{{ lib.date.formatDate(transcription.done, 'DD.MM.YYYY HH:mm:ss') }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    
    <q-separator inset spaced />
    <q-item-label header>{{ t('transcription.properties_and_metadata.metadatas') }}</q-item-label>
    <div v-html="metadatas"></div>
  </div>  
</template>
  
<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import { whisperStore } from 'stores/WhisperStore'
import { Transcription, User } from '@whisper-webui/lib/src/types/kysely.ts'
import { useI18n } from 'vue-i18n'
import { useQuasar, QVueGlobals } from 'quasar'
import trpc from 'src/lib/trpc'
import lib from 'src/lib/index'

const { t } = useI18n()
const q: QVueGlobals = useQuasar()
const props = defineProps<{
  transcription: Transcription | null
}>()

const store = whisperStore()
const metadatas: Ref<string> = ref('')
const owners: Ref<Array<Partial<User>>> = ref([])
const newUserEmail: Ref<string> = ref("");
const addUserLoading: Ref<boolean> = ref(false);


async function addUser(){
  addUserLoading.value = true
  
  try {
    await trpc.transcriptions.addOwner.mutate({ transcriptionId: props.transcription?.id as string, email: newUserEmail.value })
    q.notify({ color: 'positive', message: t('users.user_added'), position: 'top', group: false })
    newUserEmail.value = ''
    await getOwners()
  }
  catch(e){
    console.error(e)
    q.notify({ color: 'negative', message: t('misc.error_message'), position: 'top', group: false })
  }

  addUserLoading.value = false 
}

async function deleteOwner(userId: string){
  try {
    await trpc.transcriptions.removeOwner.mutate({ transcriptionId: props.transcription?.id as string, userId })
    q.notify({ color: 'positive', message: t('users.user_removed'), position: 'top', group: false })
    await getOwners()
  }
  catch(e){
    console.error(e)
    q.notify({ color: 'negative', message: t('misc.error_message'), position: 'top', group: false })
  }
}

function jsonToHtmlList(obj: any): string {
  if (obj === null || obj === undefined) 
    return ''

  if (typeof obj !== 'object') 
    return `<li>${String(obj)}</li>`

  let html = '<ul>'
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) 
      continue
    
    const value = obj[key]
    if (typeof value === 'object' && value !== null) 
      html += `<li><strong>${key}:</strong>${jsonToHtmlList(value)}</li>` 
    else 
      html += `<li><strong>${key}:</strong> ${String(value)}</li>`
  }
  html += '</ul>'

  return html
}

async function getOwners(){
  try {
    owners.value = await trpc.transcriptions.getOwners.query({ transcriptionId: props.transcription.id as string })
  }
  catch(e){
    console.error(e)
    q.notify({ color: 'negative', message: t('misc.error_message'), position: 'top', group: false })
  }
}

onMounted(() => {
  metadatas.value = props.transcription?.metadata ? jsonToHtmlList(JSON.parse(props.transcription.metadata)) :  ''
  getOwners()
})


</script>

<style setup>
ul {
  padding-left: 10px;   
  margin-left: 0;       
}

li {
  margin-left: 10px;       
  padding-left: 0;      
  list-style-position: inside; /* Keep bullets inside */
}
</style>
  
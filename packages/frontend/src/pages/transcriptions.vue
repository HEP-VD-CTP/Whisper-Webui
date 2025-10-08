<template>
  <q-drawer v-model="store.drawer" :class="store.darkMode ? `bg-dark` : `bg-light`">
    <q-scroll-area class="fit">
      <q-list>
        <q-item @click="uploaderModal=true" clickable v-ripple>
          <q-item-section>
            <q-item-label>
              <q-icon name="add" /> {{ t('transcription.add_new_transcription') }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <q-list>
        <q-item-label header>
          {{ t('transcription.transcriptions') }} ({{ transcriptions.length }})
          <q-badge v-if="!wsConnected" color="orange" align="top">
              WS <q-spinner-radio size="1em" />
          </q-badge>
        </q-item-label>
        <q-item v-for="(trs, index) of transcriptions" clickable @click="toPage(trs.id as string, `/${trs.id}`)" :active="trs.id == store.selectedTranscriptionId">
          <q-item-section>
            <q-item-label style="white-space: normal; word-break: break-word;" lines="1">{{ trs.name }}</q-item-label>
            <q-item-label caption lines="1">
              <q-chip v-if="trs.status == `done`" size="xs" icon="check" color="green">{{ t('transcription.status.done') }}</q-chip>
              <q-chip v-else-if="trs.status == `processing`" size="xs" icon="mdi-waveform" color="orange">{{ t('transcription.status.processing') }}</q-chip>
              <q-chip v-else-if="trs.status == `waiting`" size="xs" icon="event" color="primary">{{ t('transcription.status.waiting') }}</q-chip>
              <q-chip v-else-if="trs.status == `error`" size="xs" icon="close" color="red">{{ t('transcription.status.error') }}</q-chip>
              
             <span>{{ date.formatDate(trs.created, 'DD.MM.YYYY HH:mm:ss') }}</span>
            </q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-btn @click.prevent="e => e.stopPropagation()" icon="mdi-dots-vertical" flat round dense>
              <q-menu>
                <q-list style="min-width: 100px">
                  <q-item @click="toPage(trs.id as string, `/${trs.id}/export`)" clickable v-close-popup>
                    <q-item-section>{{ t('transcription.properties_and_metadata.export') }}</q-item-section>
                  </q-item>
                  <q-item @click="toPage(trs.id as string, `/${trs.id}/properties`)" clickable v-close-popup>
                    <q-item-section>{{ t('transcription.properties_and_metadata.title') }}</q-item-section>
                  </q-item>
                  <q-item @click="deleteTranscription(trs?.id as string)" clickable v-close-popup>
                    <q-item-section>{{ t('misc.delete') }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </q-scroll-area>
  </q-drawer>

  <q-dialog v-model="uploaderModal" persistent>
    <q-card style="max-width:350px" :class="store.darkMode ? `bg-dark` : `bg-light`">
      <q-card-section>
        <div class="text-h6">{{ t('transcription.uploader_title') }}</div>
      </q-card-section>

      
      <q-card-section>
        <q-select filled v-model="lang" :options="langOptions" :label="t('transcription.transcription_language')" />
      </q-card-section>

      <q-card-section>
        <p v-html="t('transcription.select_file_descritpion')"></p>
        
        <q-uploader flat bordered auto-upload style="max-width: 300px" 
          :url="`https://${store.getDomain()}/api/transcription/upload?lang=${lang.value}`"
          :with-credentials="true"
          :multiple="true"
          :accept="`video/*, audio/*, .mp3, .mp4, .wav, .flac, .ogg, .m4a, .aac, .mpg, .mpeg, .avi, .webm, .mkv, .mov, .wmv`"            
          :max-file-size="1024 * 1024 * 1024  * 4"
          @uploaded="onUploaded"
          @rejected="onRejected"
          @failed="onFailed"
          @removed="" />

        <p class="q-mt-md" v-html="t('transcription.max_file_size')"></p>        
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="t('misc.close')" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-page class="q-pa-xs" :style="`${$q.screen.width >= 900 ? `width:900px` : `width:${$q.screen.width}px`};border:0px solid red`">
    <router-view  />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, onBeforeMount } from 'vue'
import { type Ref } from 'vue'
import { whisperStore } from 'stores/WhisperStore'
import { useI18n } from 'vue-i18n'
import WhisperLanding from 'src/components/WhisperLanding.vue'
import TranscriptionProperties from 'src/components/TranscriptionProperties.vue'
import TranscriptionComponent from 'src/components/Transcription.vue'
import { useQuasar, QVueGlobals } from 'quasar'
import { Transcription } from '@whisper-webui/lib/src/types/kysely.ts'
import trpc from 'src/lib/trpc'
import date from 'src/lib/date'
import { type StatusUpdate } from '@whisper-webui/lib/src/types/types.ts'
import { useRoute, useRouter, Router, RouteLocationNormalizedLoaded } from 'vue-router'


const router: Router = useRouter()
const route: RouteLocationNormalizedLoaded = useRoute()
const q: QVueGlobals = useQuasar()
const { t } = useI18n()
const store = whisperStore()
const wsConnected: Ref<boolean> = ref(false)

const transcriptions: Ref<Array<Partial<Transcription>>> = ref([])

const uploaderModal: Ref<boolean> = ref(false)
const langOptions: Array<Record<string, string>> = [
  { label: 'Afrikaans', value: 'af' },
  { label: 'Albanian', value: 'sq' },
  { label: 'Amharic', value: 'am' },
  { label: 'Arabic', value: 'ar' },
  { label: 'Armenian', value: 'hy' },
  { label: 'Assamese', value: 'as' },
  { label: 'Azerbaijani', value: 'az' },
  { label: 'Bashkir', value: 'ba' },
  { label: 'Basque', value: 'eu' },
  { label: 'Belarusian', value: 'be' },
  { label: 'Bengali', value: 'bn' },
  { label: 'Bosnian', value: 'bs' },
  { label: 'Breton', value: 'br' },
  { label: 'Burmese', value: 'my' },
  { label: 'Catalan', value: 'ca' },
  { label: 'Cantonese', value: 'yue' },
  { label: 'Chinese', value: 'zh' },
  { label: 'Croatian', value: 'hr' },
  { label: 'Czech', value: 'cs' },
  { label: 'Danish', value: 'da' },
  { label: 'Dutch', value: 'nl' },
  { label: 'English', value: 'en' },
  { label: 'Estonian', value: 'et' },
  { label: 'Faroese', value: 'fo' },
  { label: 'Finnish', value: 'fi' },
  { label: 'French', value: 'fr' },
  { label: 'Galician', value: 'gl' },
  { label: 'Georgian', value: 'ka' },
  { label: 'German', value: 'de' },
  { label: 'Greek', value: 'el' },
  { label: 'Gujarati', value: 'gu' },
  { label: 'Haitian Creole', value: 'ht' },
  { label: 'Hausa', value: 'ha' },
  { label: 'Hawaiian', value: 'haw' },
  { label: 'Hebrew', value: 'he' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Hungarian', value: 'hu' },
  { label: 'Icelandic', value: 'is' },
  { label: 'Indonesian', value: 'id' },
  { label: 'Italian', value: 'it' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Javanese', value: 'jw' },
  { label: 'Kannada', value: 'kn' },
  { label: 'Kazakh', value: 'kk' },
  { label: 'Khmer', value: 'km' },
  { label: 'Korean', value: 'ko' },
  { label: 'Lao', value: 'lo' },
  { label: 'Latin', value: 'la' },
  { label: 'Latvian', value: 'lv' },
  { label: 'Lingala', value: 'ln' },
  { label: 'Lithuanian', value: 'lt' },
  { label: 'Luxembourgish', value: 'lb' },
  { label: 'Macedonian', value: 'mk' },
  { label: 'Malagasy', value: 'mg' },
  { label: 'Malay', value: 'ms' },
  { label: 'Malayalam', value: 'ml' },
  { label: 'Maltese', value: 'mt' },
  { label: 'Maori', value: 'mi' },
  { label: 'Marathi', value: 'mr' },
  { label: 'Mongolian', value: 'mn' },
  { label: 'Nepali', value: 'ne' },
  { label: 'Norwegian', value: 'no' },
  { label: 'Norwegian Nynorsk', value: 'nn' },
  { label: 'Occitan', value: 'oc' },
  { label: 'Pashto', value: 'ps' },
  { label: 'Persian', value: 'fa' },
  { label: 'Polish', value: 'pl' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Punjabi', value: 'pa' },
  { label: 'Romanian', value: 'ro' },
  { label: 'Russian', value: 'ru' },
  { label: 'Sanskrit', value: 'sa' },
  { label: 'Serbian', value: 'sr' },
  { label: 'Shona', value: 'sn' },
  { label: 'Sindhi', value: 'sd' },
  { label: 'Sinhala', value: 'si' },
  { label: 'Slovak', value: 'sk' },
  { label: 'Slovenian', value: 'sl' },
  { label: 'Somali', value: 'so' },
  { label: 'Spanish', value: 'es' },
  { label: 'Sundanese', value: 'su' },
  { label: 'Swahili', value: 'sw' },
  { label: 'Swedish', value: 'sv' },
  { label: 'Tagalog', value: 'tl' },
  { label: 'Tajik', value: 'tg' },
  { label: 'Tamil', value: 'ta' },
  { label: 'Tatar', value: 'tt' },
  { label: 'Telugu', value: 'te' },
  { label: 'Thai', value: 'th' },
  { label: 'Tibetan', value: 'bo' },
  { label: 'Turkish', value: 'tr' },
  { label: 'Turkmen', value: 'tk' },
  { label: 'Ukrainian', value: 'uk' },
  { label: 'Urdu', value: 'ur' },
  { label: 'Uzbek', value: 'uz' },
  { label: 'Vietnamese', value: 'vi' },
  { label: 'Welsh', value: 'cy' },
  { label: 'Yiddish', value: 'yi' },
  { label: 'Yoruba', value: 'yo' }
]

const lang: Ref<Record<string, string>> = ref(langOptions.values[0])

async function toPage(id: string, path: string){
  store.setSelectedTranscriptionId(null)
  router.push(`/`)
  await new Promise(resolve => setTimeout(resolve, 0))
  store.setSelectedTranscriptionId(id)
  router.push(path)
}

function deleteTranscription(id: string){
  q.dialog({
    title: t('transcription.delete.title'),
    message: t('transcription.delete.message'),
    ok: { label: t('misc.delete'), flat: true },
    cancel: { label: t('misc.cancel'), flat: true },
    persistent: true
  })
  .onOk( async () => {
    await trpc.transcriptions.deleteByTranscriptionId.mutate({ transcriptionId: id })
    transcriptions.value = transcriptions.value.filter(trs => trs.id != id)

    if (id == store.getSelectedTranscriptionId())
      router.push(`/`)
  })
} 

function onUploaded(data){
  const transcription: Transcription = JSON.parse(data.xhr.response)
  transcription.created = new Date(transcription.created)
  transcriptions.value.unshift(transcription)
  console.log(`UPLOAD SUCCESS`)
  q.notify({ color: 'positive', message: t('transcription.upload_success'), position: 'top', group: false })
}

function onRejected(data){
  console.error(`UPLOAD REJECTED`)
  console.error(data)
  q.notify({ color: 'negative', message: t('transcription.upload_rejected'), position: 'top', group: false })
}

function onFailed(data){
  console.error(`UPLOAD FAILED`)
  console.error(data)
  q.notify({ color: 'negative', message: t('transcription.upload_failed'), position: 'top', group: false })
}

let ws: WebSocket | null = null
function openWebSocket() {
  ws = new WebSocket(`wss://${store.getDomain()}/api/ws/updates`)

  ws.onopen = () => {
    wsConnected.value = true
  }

  ws.onmessage = (event) => {
    const statusUpdate = JSON.parse(event.data) as StatusUpdate
    
    // update the transcription status only in the list
    for (const trs of transcriptions.value){
      if (trs.id == statusUpdate.transcriptionId){
        trs.status = statusUpdate.status
        break
      } 
    } 
  }

  ws.onclose = () => {
    wsConnected.value = false
    console.log('WebSocket connection closed, retrying...')
    setTimeout(openWebSocket, 5000)
  }

  ws.onerror = (err) => {
    console.error('WebSocket error:', err)
  }
}

onBeforeMount(() => {
  if (store.getUser() == null)
    return router.push('/login')
})

onMounted(async () => {
  openWebSocket()

  // set the language to the default language
  langOptions.find((item) => {
    if (item.value == store.getLanguage())
      lang.value = item
  })

  document.title = `${t('transcription.transcription')} - ${store.getTitle()}`

  // get the transcription id from the route if needed
  const id = route.params.transcriptionId as string | undefined
  if (id){
    toPage(id, `/${id}`)
  }
    
  // get the user transcriptions
  try {
    transcriptions.value = await trpc.transcriptions.findByUserId.query({
      userId: store.getUser().id as string,
      deleted: false
    })
  }
  catch(err){
    console.error(err)
    q.dialog({ title: t('misc.error'), message: t('misc.error_message') })
    router.push('/') 
  }
})

onBeforeUnmount(() => {
  if (ws){
    ws.close()
    ws = null
  }
  store.setSelectedTranscriptionId(null)
})
</script>

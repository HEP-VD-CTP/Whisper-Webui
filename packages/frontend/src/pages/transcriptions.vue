<template>
  <q-drawer v-model="store.drawer" :class="store.darkMode ? `bg-dark` : `bg-light`">
    <q-scroll-area class="fit">
      <q-list>
        <q-item @click="openUploadModal()" clickable v-ripple>
          <q-item-section>
            <q-item-label>
              <q-icon name="add" /> {{ t('transcription.add_new_transcription') }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <q-list>
        <q-item-label header>{{ t('transcription.transcriptions') }} ({{ transcriptions.length }})</q-item-label>
        <q-item v-for="(trs, index) of transcriptions" clickable @click="selectedTranscriptionId = trs.id as string" :active="selectedTranscriptionId == trs.id">
          <q-item-section>
            <q-item-label lines="1">{{ trs.name }}</q-item-label>
            <q-item-label caption lines="1">
              <q-chip v-if="trs.status == `done`" size="xs" icon="check" color="green">{{ t('transcription.status.done') }}</q-chip>
              <q-chip v-else-if="trs.status == `processing`" size="xs" icon="mdi-waveform" color="orange">{{ t('transcription.status.processing') }}</q-chip>
              <q-chip v-else-if="trs.status == `waiting`" size="xs" icon="event" color="primary">{{ t('transcription.status.waiting') }}</q-chip>
              <q-chip v-else-if="trs.status == `error`" size="xs" icon="close" color="red">{{ t('transcription.status.error') }}</q-chip>
              
             <span>{{ date.formatDate(trs.created, 'DD.MM.YYYY HH:mm:ss') }}</span>
            </q-item-label>
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

  <q-page class="q-pa-xs" :style="`${$q.screen.width >= 900 ? `width:900px` : `width:${$q.screen.width}px`};border:1px solid red`">
    
    <WhisperLanding v-if="selectedTranscriptionId == null" />

  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { type Ref } from 'vue'
import { whisperStore } from 'stores/WhisperStore'
import { useI18n } from 'vue-i18n'
import WhisperLanding from 'src/components/WhisperLanding.vue'
import { useQuasar, QVueGlobals } from 'quasar'
import { Transcription } from '@whisper-webui/lib/src/types/kysely.ts'
import trpc from 'src/lib/trpc'
import date from 'src/lib/date'


const q: QVueGlobals = useQuasar()
const { t } = useI18n()
const store = whisperStore()

const transcriptions: Ref<Array<Partial<Transcription>>> = ref([])

const selectedTranscriptionId: Ref<string|null> = ref(null)

const uploaderModal: Ref<boolean> = ref(false)
const langOptions: Array<Record<string, string>> = [
  {label: 'Arabic', value: 'ar'},
  {label: 'Chinese', value: 'zh'},
  {label: 'Deutsch', value: 'de'},
  {label: 'Ellinika', value: 'el'},
  {label: 'English', value: 'en'},
  {label: 'Español', value: 'es'},
  {label: 'Farsi', value: 'fa'},
  {label: 'Français', value: 'fr'},
  {label: 'Italiano', value: 'it'},
  {label: 'Japanese', value: 'ja'},
  {label: 'Magyar', value: 'hu'},
  {label: 'Nederlands', value: 'nl'},
  {label: 'Polski', value: 'pl'},
  {label: 'Português', value: 'pt'},
  {label: 'Russian', value: 'ru'},
  {label: 'Suomi', value: 'fi'},
  {label: 'Türkçe', value: 'tr'},
  {label: 'Ukrainian', value: 'uk'}
]

const lang: Ref<Record<string, string>> = ref(langOptions.values[0])

function openUploadModal() {
  uploaderModal.value = true

}

function onUploaded(data){
  const transcription: Transcription = JSON.parse(data.xhr.response)
  transcription.created = new Date(transcription.created)
  transcriptions.value.unshift(transcription)
  console.log(`UPLOAD SUCCESS`);
  q.notify({ color: 'positive', message: t('transcription.upload_success'), position: 'top', group: false })
}

function onRejected(data){
  console.error(`UPLOAD REJECTED`);
  console.error(data)
  q.notify({ color: 'negative', message: t('transcription.upload_rejected'), position: 'top', group: false })

}

function onFailed(data){
  console.error(`UPLOAD FAILED`);
  console.error(data)
  q.notify({ color: 'negative', message: t('transcription.upload_failed'), position: 'top', group: false })
}
  
onMounted(async () => {
  // set the language to the default language
  langOptions.find((item) => {
    if (item.value == store.getLanguage())
      lang.value = item
  })

  document.title = `${t('transcription.transcription')} - ${store.getTitle()}`

  transcriptions.value = await trpc.transcriptions.findByUserId.query({userId: store.getUser().id as string})
})
</script>

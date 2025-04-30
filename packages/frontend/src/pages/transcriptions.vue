<template>
  <q-drawer v-model="store.drawer">
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
    </q-scroll-area>
  </q-drawer>

  <q-dialog v-model="uploaderModal" persistent>
    <q-card style="max-width:350px">
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

        <p class="q-mt-xs" v-html="t('transcription.max_file_size')"></p>        
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="t('misc.close')" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-page class="q-pa-xs" :style="`${$q.screen.width >= 900 ? `width:900px` : `width:${$q.screen.width}px`};border:1px solid red`">
    
    <WhisperLanding />

  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { type Ref } from 'vue'
import { whisperStore } from 'stores/WhisperStore'
import { useI18n } from 'vue-i18n'
import WhisperLanding from 'src/components/WhisperLanding.vue'

const { t } = useI18n()
const store = whisperStore()

const uploaderModal: Ref<boolean> = ref(false)
const langOptions: Array<Record<string, string>> = [
  {label: 'English', value: 'en'}, {label: 'Français', value: 'fr'}, {label: 'Deutsch', value: 'de'},
  {label: 'Español', value: 'es'}, {label: 'Italiano', value: 'it'}, {label: 'Japanese', value: 'ja'},
  {label: 'Chinese', value: 'zh'}, {label: 'Nederlands', value: 'nl'}, {label: 'Ukrainian', value: 'uk'},
  {label: 'Português', value: 'pt'}, {label: 'Arabic', value: 'ar'}, {label: 'Čeština', value: 'cs'},
  {label: 'Russian', value: 'ru'}, {label: 'Polski', value: 'pl'}, {label: 'Magyar', value: 'hu'},
  {label: 'Suomi', value: 'fi'}, {label: 'Farsi', value: 'fa'}, {label: 'Ellinika', value: 'el'},
  {label: 'Türkçe', value: 'tr'}, {label: 'Dansk', value: 'da'}, {label: 'Hebrew', value: 'he'},
  {label: 'Tieng Viet', value: 'vi'}, {label: 'Korean', value: 'ko'}, {label: 'Urdu', value: 'ur'},
  {label: 'Telugu', value: 'te'}, {label: 'Hindi', value: 'hi'}, {label: 'Català', value: 'ca'},
  {label: 'Malayalam', value: 'ml'}, {label: 'Norsk Bokmål', value: 'no'}, {label: 'Norsk Nynorsk', value: 'nn'},
  {label: 'Slovenčina', value: 'sk'}, {label: 'Slovenščina', value: 'sl'}, {label: 'Hrvatski', value: 'hr'},
  {label: 'Română', value: 'ro'}, {label: 'Euskara', value: 'eu'}, {label: 'Galego', value: 'gl'},
  {label: 'Kartuli', value: 'ka'}, {label: 'Latviešu', value: 'lv'}, {label: 'Tagalog', value: 'tl'}
]
const lang: Ref<Record<string, string>> = ref(langOptions.values[0])

function openUploadModal() {
  uploaderModal.value = true

}

function onUploaded(data){
  console.log(`UPLOAD SUCCESS`);
  console.log(data)
}

function onRejected(data){
  console.error(`UPLOAD REJECTED`);
  console.error(data)
}

function onFailed(data){
  console.error(`UPLOAD FAILED`);
  console.error(data)
}
  
onMounted(() => {
  // set the language to the default language
  langOptions.find((item) => {
    if (item.value == store.getLanguage())
      lang.value = item
  })

  document.title = `${t('transcription.transcription')} - ${store.getTitle()}`
})
</script>

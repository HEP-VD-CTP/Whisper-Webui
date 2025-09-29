<template>
  <div v-if="!loaded" class="row items-center justify-center" style="height: 100%">
    <q-spinner-pie size="50px" color="primary" />
  </div>
  <div v-else>
    <span class="text-weight-bold">{{ transcription.name }}</span> 

    <p class="q-mt-md">{{ t('transcription.export.options') }}</p>

    <div class="q-mt-xs">
      <q-list>
        <q-item tag="label" v-ripple>
          <q-item-section avatar>
            <q-checkbox v-model="showSpeaker" val="pink" color="pink" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ t('transcription.export.show_speakers') }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item tag="label" v-ripple>
          <q-item-section avatar>
            <q-checkbox v-model="showTC" val="pink" color="pink" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ t('transcription.export.show_timecodes') }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item tag="label" v-ripple>
          <q-item-section avatar>
            <q-checkbox v-model="showMultiplesLines" val="pink" color="pink" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ t('transcription.export.show_multilines') }}</q-item-label>
            <q-item-label caption>{{ t('transcription.export.show_multilines_details') }}</q-item-label>
          </q-item-section>
        </q-item>

      </q-list>
    </div>

    <div>
      <q-separator class="q-mt-md q-mb-md" inset />

      <div class="q-mb-md row justify-center">
        <q-btn class="q-mr-xs q-mt-xs" icon="mdi-clipboard-edit-outline" @click="copyToCpliboard" color="primary" :label="t('transcription.export.copy')" />
        <q-btn class="q-mt-xs"         icon="mdi-download" @click="download" color="primary" :label="t('transcription.export.download')" />
      </div>
      
      <p v-html="content" class="shadow-1"></p>

    </div>

  </div>  
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref, watch } from 'vue'
import { whisperStore } from 'stores/WhisperStore'
import { useRoute, useRouter, Router, RouteLocationNormalizedLoaded } from 'vue-router'
import { Transcription, User } from '@whisper-webui/lib/src/types/kysely.ts'
import { Segment } from '@whisper-webui/lib/src/types/types.ts'
import { useI18n } from 'vue-i18n'
import { useQuasar, QVueGlobals } from 'quasar'
import trpc from 'src/lib/trpc'

const { t } = useI18n()
const q: QVueGlobals = useQuasar()
const router: Router = useRouter()
const route: RouteLocationNormalizedLoaded = useRoute()
const store = whisperStore()
const loaded: Ref<boolean> = ref(false)
const transcription: Ref<Transcription | null> = ref(null)
const segments: Ref<Array<Segment>> = ref([])

const showSpeaker: Ref<boolean> = ref(true)
const showTC: Ref<boolean> = ref(true)
const showMultiplesLines: Ref<boolean> = ref(true)

const content: Ref<string> = ref(``)

function secondsToTime(seconds: number): string {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

function copyToCpliboard(){
  navigator.clipboard.writeText(content.value.replaceAll(`<br/>`, `\n`))
  q.notify({
      position: `top`,
      message: t('transcription.export.copied'),
      color: 'positive'
  })
}

function download(){
  const contentVal = content.value.replaceAll(`<br/>`, `\n`)
  const blob = new Blob([contentVal], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `${transcription.value.file}.txt`
  a.click()

  URL.revokeObjectURL(url)
  q.notify({
      position: `top`,
      message: t('transcription.export.downloaded'),
      color: 'positive'
  })
}

function toTXT(){
  let txtTxt: Array<string> = [];

  for (let i = 0; i < segments.value.length; i++){
    const paragraph = segments.value[i]

    if (showMultiplesLines.value){
      if (showSpeaker.value) 
        txtTxt.push(paragraph.speaker)
      if (showTC.value) 
        txtTxt.push(`${secondsToTime(paragraph.start)} --> ${secondsToTime(paragraph.end)}`)
      
      txtTxt.push(paragraph.words.map(w => w.word).join(` `))
      txtTxt.push(``)
    }
    else {
      const line: Array<string> = [];
      if (showSpeaker.value) 
        line.push(paragraph.speaker)
      if (showTC.value) 
        line.push(`${secondsToTime(paragraph.start)} --> ${secondsToTime(paragraph.end)}`)
      
      line.push(paragraph.words.map(w => w.word).join(` `))
      
      txtTxt.push(line.join(`;`))
    }
  }
  
  content.value = txtTxt.join(`<br/>`)
}

onMounted(async () => {
  const transcriptionId = route.params.transcriptionId as string

  try {
    transcription.value = await trpc.transcriptions.findById.query({ transcriptionId: transcriptionId })
    segments.value = JSON.parse(transcription.value.text)
    toTXT();
  }
  catch(err){
    console.error(err)
    q.dialog({ title: t('misc.error'), message: t('misc.error_message') })
  }

  loaded.value = true
})

watch(showSpeaker, (oldVal, newVal) => toTXT());
watch(showMultiplesLines, (oldVal, newVal) => toTXT())
watch(showTC, (oldVal, newVal) => toTXT())

</script>

<style setup>

</style>
  
<template>
  <div style="height:100%" class="row justify-center items-center text-center">
    <div class="q-pa-sm">
      <p v-html="$t('admin_transcriptions.instructions')"></p>
      <q-separator inset />
      <p class="q-mt-md">
        {{ $t('transcription.transcriptions') }}: {{ nbTranscriptions }}<br/><br/>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeMount, watch } from 'vue'
import { type Ref } from 'vue'
import { useQuasar, QVueGlobals } from 'quasar'
import { whisperStore } from 'stores/WhisperStore'
import { useI18n } from 'vue-i18n'
import { useRouter, Router, RouteLocationNormalized } from 'vue-router'
import lib  from 'src/lib/index'
import trpc from 'src/lib/trpc'
import date from 'src/lib/date'



const router: Router = useRouter() 

const { t } = useI18n()
const store = whisperStore()

const q: QVueGlobals = useQuasar() 

const nbTranscriptions: Ref<number> = ref(0)

onMounted(async () => {
  nbTranscriptions.value = await trpc.transcriptions.countAll.query()
})

</script>
  
<style scoped>

</style>
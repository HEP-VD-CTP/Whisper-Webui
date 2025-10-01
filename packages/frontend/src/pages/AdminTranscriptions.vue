<template>
  <q-drawer v-model="store.drawer" :class="store.darkMode ? `bg-dark` : `bg-light`">
    <q-scroll-area class="fit">
      <div>
        <q-input v-model="transcriptionSearched" debounce="500" filled type="search" :label="t('admin_transcriptions.search')" class="q-mt-sm">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <div class="q-mt-sm text-center">
        <span v-if="transcriptionSearched != '*' && transcriptionSearched.length < 3">{{ $t('users.use_filter') }}</span>
        <span v-else-if="!transcriptionsFound.length">{{ $t('users.no_results') }}</span>
        <span v-else-if="transcriptionsFound.length">{{ $t('transcription.transcriptions') }} ({{ transcriptionsFound.length }})</span>
      </div>

      <div>
        <q-list class="q-mt-xs">
          <q-item v-for="(trs, index) of transcriptionsFound" clickable @click="toPage(trs.id as string, `/transcriptions/${trs.id}`)" :active="trs.id == store.selectedTranscriptionId">
            <q-item-section>
              <q-item-label style="white-space: normal; word-break: break-word;" lines="1">
                <template v-if="!trs.deleted">{{ trs.name }}</template>
                <template v-else><s>{{ trs.name }}</s></template>
              </q-item-label>
              <q-item-label style="white-space: normal; word-break: break-word;" caption lines="1">
                <span>{{ trs.emails.join(', ') }}</span>
              </q-item-label>
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
                    <q-item @click="toPage(trs.id as string, `/transcriptions/${trs.id}/export`)" clickable v-close-popup>
                      <q-item-section>{{ t('transcription.properties_and_metadata.export') }}</q-item-section>
                    </q-item>
                    <q-item @click="toPage(trs.id as string, `/transcriptions/${trs.id}/properties`)" clickable v-close-popup>
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
        <div class="text-center align-center">
          <q-btn v-if="hasMore && transcriptionsFound.length"
            class="q-mt-md"
            color="primary"
            :label="t('misc.load_more')"
            @click="() => { page++; fetchTranscriptions(); }"
          />
        </div>
      </div>
    </q-scroll-area>
  </q-drawer>

  <q-page class="q-pa-xs" :style="`${$q.screen.width >= 900 ? `width:900px` : `width:${$q.screen.width}px`};border:0px solid red`">
    <router-view />
  </q-page>
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
import { type User, type Transcription } from "@whisper-webui/lib/src/types/kysely.ts"
import { type UsersStats } from "@whisper-webui/lib/src/types/types.ts"
import date from 'src/lib/date'
import type { AppRouter } from '@whisper-webui/backend/src/trpc/router'
import type { inferRouterOutputs } from '@trpc/server'


type SearchTranscriptionsOutput = inferRouterOutputs<AppRouter>['transcriptions']['searchTranscriptions']

const router: Router = useRouter() 

const { t } = useI18n()
const store = whisperStore()

const q: QVueGlobals = useQuasar() 
const transcriptionSearched: Ref<string> = ref('')
const stats: Ref<UsersStats> = ref({total: 0, archived: 0, blocked: 0})
const transcriptionsFound: Ref<SearchTranscriptionsOutput> = ref([])
const page: Ref<number> = ref(1)
const pageSize: number = 25
const hasMore: Ref<boolean> = ref(false)
  
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
    
    // set the transcription to deleted
    transcriptionsFound.value[transcriptionsFound.value.findIndex(t => t.id == id)].deleted = 1 
  })
} 

async function toPage(id: string, path: string){
  router.push(`/transcriptions`)
  await new Promise(resolve => setTimeout(resolve, 0))
  router.push(path)
}

async function fetchTranscriptions(reset = false) {
  if (reset) {
    page.value = 1
    transcriptionsFound.value = []
  }

  const result = await trpc.transcriptions.searchTranscriptions.query({
    term: transcriptionSearched.value.trim().replace(/\s+/g, ' '),
    page: page.value,
    pageSize
  })

  // If result is array, check if we got a full page
  hasMore.value = result.length === pageSize
  transcriptionsFound.value = reset ? result : [...transcriptionsFound.value, ...result]
}

watch(transcriptionSearched, async (newVal: string, oldVal: string) => {
  newVal = newVal.trim().replace(/\s+/g, ` `)
  if (newVal == oldVal) 
    return
  
  if ((newVal != '*' && newVal.length < 3) || newVal.length > 255) {
    transcriptionsFound.value = []
    hasMore.value = false
    return
  }

  await fetchTranscriptions(true)
})

onBeforeMount(async () => {
 stats.value = await trpc.users.stats.query()
})

onMounted(() => {
  if (!store.user.admin)
    return router.push('/')

  document.title = `${t('transcription.transcriptions')} - ${store.getTitle()}`
})

</script>
  
<style scoped>
.full-height {
  height: 100%
}
</style>
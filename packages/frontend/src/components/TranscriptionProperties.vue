<template>
  <div class="row justify-center items-center" style="height: 100%;">
    <div class="q-pa-sm">
      
      <div>

        <div v-html="metadatas"></div>
      </div>  
    </div>
  </div>  
</template>
  
<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import { whisperStore } from 'stores/WhisperStore'
import { Transcription } from '@whisper-webui/lib/src/types/kysely.ts'


const props = defineProps<{
  transcription: Transcription | null
}>()

const store = whisperStore()
const metadatas: Ref<string> = ref('')

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

onMounted(() => {
  metadatas.value = props.transcription?.metadata ? jsonToHtmlList(JSON.parse(props.transcription.metadata)) :  '-'
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
  
<template>
  <div v-if="!loaded" class="row items-center justify-center" style="height: 100%">
    <q-spinner-pie size="50px" color="primary" />
  </div>
  <div v-else-if="transcription.status == 'processing'" class="row items-center text-center justify-center" style="height: 100%">
    <h6><q-icon name="mdi-cogs" /> {{ t('transcription.processing') }}</h6>
  </div>
  <div v-else-if="transcription.status == 'waiting'" class="row items-center text-center justify-center" style="height: 100%">
    <h6><q-icon name="mdi-timer-sand" /> {{ t('transcription.waiting') }}</h6>
  </div>
  <div v-else-if="transcription.status == 'error'" class="row items-center text-center justify-center" style="height: 100%">
    <h6><q-icon name="mdi-timer-sand" /> {{ t('transcription.error') }}</h6>
  </div>
  <div v-else>
    <span class="text-weight-bold">{{ transcription.name }}</span> 
    <div>
      <div class="q-mb-xl" id="editor" v-if="transcription.status == `done`">
        <q-page-sticky position="bottom-right" class="q-mr-xs">
          <q-btn :disabled="!pageScrolled" @click="toTop" round color="pink" icon="arrow_upward">
            <q-tooltip anchor="center left" self="center right">{{ t('transcription.to_top') }}</q-tooltip>
          </q-btn>
        </q-page-sticky>

        <div 
          v-for="(segment, segIdx) in segments" :key="segIdx"
          :style="`border-left: 3px solid ${currentAudioPosition >= segment.start && currentAudioPosition <= segment.end ? `#e91e63` : currentAudioPosition > segment.start ? `#f48fb1` : `grey`}`" 
          class="q-mt-md q-pl-xs">
          
          <q-input 
            v-model="segment.speaker"
            class="q-mb-lg q-pa-none"
            @update:model-value="triggerTranscriptionUpdate" 
            maxlength="2048" 
            dense 
            standout 
            label="Speaker" 
            :hint="`${secondsToTime(segment.start)} - ${secondsToTime(segment.end)}`">
            <template v-slot:prepend>
              <q-icon size="sm" name="record_voice_over" />
            </template>
          </q-input>

          <q-editor 
            v-model="segment.words"
            @paste="pasting($event)"
            @click="updateAudioPosHTML($event)"
            @keydown="handleKeydownElement($event, segment, segIdx)"
            :toolbar="[]"
            flat
            minHeight="1em"
            class="q-mt-lg"
          /> 

        </div>
        
      </div>

    </div>

    <!-- audio player -->
    <audio v-show="false" ref="audioPlayer" controls style="display:block" preload="auto">
      <source type="audio/mpeg" :src="audioUrl">
      Your browser does not support the audio element.
    </audio>

    <!-- Player -->
    <q-footer class="row justify-center bg-transparent">
      <div class="bg-dark shadow-5 q-pt-sm q-pb-sm q-pl-md q-pr-md" :style="`border:0px solid green;${q.screen.width >= 900 ? `width:900px` : `width:${q.screen.width}px`}`">
        <q-slider v-model="currentAudioPosition" @update:model-value="updateAudioPos" :min="0" :max="totalAudioDuration" color="pink"/>

        <div class="row">
          <span class="text-weight-bold">{{ transcription.name }} </span> 
          <q-spinner size="1.2em" class="q-ml-xs" color="primary" v-if="updatingTranscription" />
          <q-space />
          <div>
            {{ secondsToTime(currentAudioPosition) }}/{{ secondsToTime(totalAudioDuration) }}
            <q-btn @click="pause" v-if="playing" flat round icon="pause" />
            <q-btn @click="play"  v-else         flat round icon="play_arrow" />
          </div>
          
        </div>
      </div>
      
    </q-footer>

  </div>  
</template>
  
<script setup lang="ts">
import { onMounted, ref, type Ref, nextTick, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, Router, RouteLocationNormalizedLoaded } from 'vue-router'
import { whisperStore } from 'stores/WhisperStore'
import { Transcription, User } from '@whisper-webui/lib/src/types/kysely.ts'
import { Segment } from '@whisper-webui/lib/src/types/types.ts'
import { useI18n } from 'vue-i18n'
import { useQuasar, QVueGlobals } from 'quasar'
import trpc from 'src/lib/trpc'
import lib from 'src/lib/index'


const parser: DOMParser = new DOMParser();

const { t } = useI18n()
const q: QVueGlobals = useQuasar()
const router: Router = useRouter()
const route: RouteLocationNormalizedLoaded = useRoute()

const transcription: Ref<Transcription> = ref(null)

const audioPlayer: Ref<HTMLAudioElement> = ref(null)

const store = whisperStore()
const currentAudioPosition: Ref<number> = ref(0)
const segments: Ref<Array<SegmentHTML>> = ref([])
const audioUrl: Ref<string> = ref(``)
const updatingTranscription: Ref<boolean> = ref(false)
const totalAudioDuration: Ref<number> = ref(0)
const playing: Ref<boolean> = ref(false)
const pageScrolled: Ref<boolean> = ref(false)
const loaded: Ref<boolean> = ref(false)

type SegmentHTML = {
  start: number,
  end: number,
  speaker: string,
  words: string,
}

// This method is really messy, we need to refactor it someday
async function handleKeydownElement(e: KeyboardEvent, paragraph: SegmentHTML, paragraphPos: number): Promise<void> {
  const key: string = e.key;
  //console.log(`Key pressed: ${e.key}`);

  // we don't process the following keys
  if ([`Shift`, `Tab`, `Alt`, `Meta`, `Control`, `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`].includes(key))
    return;

  if (key == `Enter`){
    // we don't create a new line
    e.preventDefault();

    // we first need to find out in which span the cursor is
    const selection = window.getSelection();
    
    // the spanHTMLTag contains the span element in which the cursor is
    let spanHTMLTag: HTMLElement = selection.anchorNode.parentElement;
    
    // if the spanHTMLTag is not a span element, it means that we are between two spans
    // we need to find the previous span element
    if (spanHTMLTag.tagName != `SPAN`){
      let temp = selection.anchorNode;
      while (temp = temp.previousSibling) {
        // @ts-ignore if temps is a span html tag
        if (temp.nodeType == 1 && temp.tagName == `SPAN`) {
          // @ts-ignore
          spanHTMLTag = temp;
          break;
        }
      }
    }

    // the spanPos contains the position of the span element in the paragraph
    const spanPos: number = Array.from(spanHTMLTag.parentElement.children).indexOf(spanHTMLTag);

    // we only create a new paragraph if the cursor is not at the first word of the paragraph
    if (spanPos > 0){
      // get all the spans tags of the paragraph
      const spans = Array.from(parser.parseFromString(paragraph.words, `text/html`).querySelectorAll(`span`));
      // we need two lists of span, one for the left part of the cursor and one for the right part
      const leftSpans: Array<HTMLElement> = spans.slice(0, spanPos);
      const rightSpans: Array<HTMLElement> = spans.slice(spanPos);

      // set the new content and boundaries of the current paragraph
      paragraph.words = leftSpans.map(span => span.outerHTML).join(` `);
      paragraph.start = parseFloat(leftSpans[0].getAttribute(`start`));
      paragraph.end = parseFloat(leftSpans[leftSpans.length - 1].getAttribute(`end`));

      // create the new paragraph
      const newParagraph: SegmentHTML = {
        speaker: paragraph.speaker,
        start: parseFloat(rightSpans[0].getAttribute(`start`)),
        end: parseFloat(rightSpans[rightSpans.length - 1].getAttribute(`end`)),
        words: rightSpans.map(span => span.outerHTML).join(` `)
      }

      // insert the new paragraph after the current one
      segments.value.splice(paragraphPos + 1, 0, newParagraph);

      // we need to set the cursor at the beginning of the new paragraph
      // get the first spann of the new paragraph
      await nextTick();
      const span = document.getElementById(`editor`).children[paragraphPos + 1].children[1].children[0].firstChild;

      // set the focus to this span
      const range = document.createRange();
      range.setStart(span, 0);
      range.setEnd(span, 0);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      
      // to-do: trigger update here
      triggerTranscriptionUpdate();
    }
  }
  else if (key == `Backspace`){
    // we only process backspace if we are not in the first paragraph 
    if (paragraphPos == 0){
      triggerTranscriptionUpdate();
      return;
    }

    const selection = window.getSelection();
    const spanHTMLTag: HTMLElement = selection.anchorNode.parentElement;
    if (spanHTMLTag.tagName != `SPAN`){
      // if there is only one carriage return left, we delete the whole paragraph
      if (paragraph.words == `<br>`){
        // we delete this whole paragraph, and set the focus to the end of the last paragraph
        segments.value.splice(paragraphPos, 1);
        // to-do: set the focus correclty
        triggerTranscriptionUpdate();
        return;
      }
        
      // if the cursor is not in a span element, we do nothing
      triggerTranscriptionUpdate();
      return;
    }
      
    
    // we know that the cursor is in a span element, we now need to find in which span element it is
    const spanList = Array.from(spanHTMLTag.parentElement.children);
    let spanPos: number = spanList.indexOf(spanHTMLTag);

    // if the cursor is not in the first span element, we do nothing
    if (spanPos > 0) {
      triggerTranscriptionUpdate();
      return;
    }
      

    // we are at the first span element, we need to check if the cursor is at the beginning of the first span element
    const colCurPos: number = selection.anchorOffset;
    if (colCurPos > 0){
      triggerTranscriptionUpdate();
      return;
    }
      
    // if we got here, it means that the cursor is at the beginning of the first span element
    // we need to merge the current paragraph with the previous one
    const previousParagraph: SegmentHTML = segments.value[paragraphPos - 1];
    previousParagraph.words += ` ${paragraph.words}`;
    previousParagraph.end = paragraph.end;
    segments.value.splice(paragraphPos, 1);

    // to-do: trigger update here
    triggerTranscriptionUpdate();
  }

  // trigger transcription for any other key
  triggerTranscriptionUpdate();
}

let updateTimeout: any = undefined;
function triggerTranscriptionUpdate(){
  console.log(`TRIGGER UPDATE`);
  if (updateTimeout)
    clearTimeout(updateTimeout);

  // update the transcription
  updateTimeout = setTimeout(async () => {
    // before updating the transcription, we need to convert the data from HTML back to JSON
    // and then we need to do some modifications to make sure there is no missing data and
    // the data is correctly formatted
    updatingTranscription.value = true;
    console.log(`UPDATE TRANSCRIPTION`);

    segments.value = segments.value
      // first, we remove all the empty paragraphs
      .filter(paragraph => paragraph.words != `<br>`) 
      .map(paragraph => {
        // then all the empty speakers become UNKNOWN_SPEAKER
        if (paragraph.speaker == ``)
          paragraph.speaker = `UNKNOWN_SPEAKER`;
        return paragraph;
      })

    // we need to convert the data from HTML back to JSON
    const newData: Array<Segment> = [];
    for (const paragraph of segments.value){
      const newParagraph: Segment = {
        speaker: paragraph.speaker,
        start: paragraph.start,
        end: paragraph.end,
        words: Array.from(parser.parseFromString(paragraph.words, `text/html`).querySelectorAll(`span`)).map(span => {
          return {
            start: parseFloat(span.getAttribute(`start`)),
            end: parseFloat(span.getAttribute(`end`)),
            word: span.innerHTML
          }
        })
      };

      newData.push(newParagraph);
    }

    // we then need to make one last pass to make sure that the start and end of the paragraphs are correctly set
    for (const paragraph of newData){
      // we first make sure each word has a start and end
      for (let i = 0; i < paragraph.words.length; ++i){
        // if the start is empty, null or undefined, we set it to the start of the previous word
        if (!paragraph.words[i].start || isNaN(paragraph.words[i].start))
          paragraph.words[i].start = i == 0 ? paragraph.start : paragraph.words[i - 1].end;

        // if the end is empty, null or undefined, we set it to the end of the previous word
        if (!paragraph.words[i].end || isNaN(paragraph.words[i].end))
          paragraph.words[i].end = i == 0 ? paragraph.start : paragraph.words[i - 1].end;
      }
    }

    try {
      // now we make the actual update to the server
      await trpc.transcriptions.updateTranscription.mutate({
        transcriptionId: transcription.value.id as string,
        data: newData
      })
    }
    catch(e){
      console.error(e)
      q.dialog({ title: t('misc.error'), message: t('misc.error_message') })
    }
    

    updatingTranscription.value = false;
  }, 2000);
  
}

function scrollHanler(){
  pageScrolled.value = window.scrollY > 0
}

function toTop(){
  window.scrollTo({top: 0, behavior: 'smooth'})
}

function play(){
  playing.value = true;  
  if (audioPlayer.value) 
    /*await*/ audioPlayer.value.play()
}

function pause(){
  playing.value = false
  if (audioPlayer.value)
    audioPlayer.value.pause()
}

function updateAudioPosHTML(e: MouseEvent){
  const el: HTMLElement = e.target as HTMLElement
  const start: number = parseFloat(el.getAttribute(`start`))
  updateAudioPos(start)
  refocusHighlight()
}

function refocusHighlight(){
  const words: Array<HTMLSpanElement> = Array.from(document.querySelectorAll(`span`))
  for (let i = 0, len = words.length; i < len; ++i){
    if (currentAudioPosition.value >= parseFloat(words[i].getAttribute(`start`)) && currentAudioPosition.value <= parseFloat(words[i].getAttribute(`end`)))
      words[i].classList.add(`highlight`)
    else
      words[i].classList.remove(`highlight`)
  }
}

function updateAudioPos(val){
  if (val){
    audioPlayer.value.currentTime = val;
    currentAudioPosition.value = val;
  }
}

function secondsToTime(seconds: number): string {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

function pasting(e: ClipboardEvent): void {
  e.preventDefault();
}

onMounted(async () => {
  const transcriptionId = route.params.transcriptionId as string

  try {
    transcription.value = await trpc.transcriptions.findById.query({ transcriptionId: transcriptionId })
    loaded.value = true
  }
  catch(err){
    console.error(err)
    q.dialog({ title: t('misc.error'), message: t('misc.error_message') })
  }

  // early stop if the transcription is not done
  if (transcription.value.status != `done`)
    return

  window.addEventListener(`scroll`, scrollHanler)

  audioUrl.value = `https://${store.getDomain()}/api/audio/${transcription.value.id}/${transcription.value.file}`

  nextTick(() => {
    if (audioPlayer.value)
      audioPlayer.value.load()

    // we can't use the `timeupdate` as it's being fired only 4 times a second, every 250ms
    // so we need to use a setInterval to have a more precise time update
    // audioPlayer.value.addEventListener('timeupdate', _ => currentAudioPosition.value = audioPlayer.value.currentTime);
    // we fire this event every 200ms or 5 times a seconds
    setInterval(() => {
      if (playing.value){
        // we set the current audio position
        currentAudioPosition.value = audioPlayer.value.currentTime
        // we highlight the current word being played
        refocusHighlight()
      }
    }, 200)
    audioPlayer.value.addEventListener('loadedmetadata', _ => totalAudioDuration.value = audioPlayer.value.duration)
    audioPlayer.value.addEventListener('ended', _ => pause())
  })

  const parsedSegments: Array<Segment> = JSON.parse(transcription.value.text)

  for (const segment of parsedSegments) {
    segments.value.push({
      start: segment.start,
      end: segment.end,
      speaker: segment?.speaker || `UNKNOWN_SPEAKER`,
      words: segment.words.map(word => `<span class="" start="${word.start}" end="${word.end}">${word.word}</span>`).join(` `)
    })
  }
})

onBeforeUnmount(() => {
  pause()
  window.removeEventListener(`scroll`, scrollHanler)
})

</script>

<style setup>
.highlight {
  background-color: #e91e63;
}

</style>
  
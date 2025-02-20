<template>
  <q-page style="border:0px solid red" class="full-height">
    <q-splitter style="border:0px solid green;height:calc(100vh - 50px)" v-model="splitterPosition" separator-style="width:3px">

      <template v-slot:before>
        <q-list>
          <q-item @click="" clickable v-ripple>
            <q-item-section>
              <q-item-label>
                <q-icon name="add" /> {{ t('users.add_user') }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <div>
          <q-input v-model="userSearched" debounce="500" filled type="search" :label="t('users.search_user')">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </template>

      <template v-slot:after>
        coucou
      </template>

    </q-splitter>
  </q-page> 
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { type Ref } from 'vue';
import { useQuasar, QVueGlobals } from 'quasar';
import { whisperStore } from 'stores/WhisperStore';
import { useI18n } from 'vue-i18n';
import { useRouter, Router, RouteLocationNormalized } from 'vue-router';
import lib  from 'src/lib/index';
import trpc from 'src/lib/trpc';
import { type User } from "@whisper-webui/lib/src/types/types.ts";

const router: Router = useRouter(); 

const { t } = useI18n();
const store = whisperStore();

const btnLoading = ref(false);

const q: QVueGlobals = useQuasar(); 
// position of the splitter at position % of the component 
const splitterPosition: Ref<number> = ref(33); 

const userSearched: Ref<string> = ref('');

const usersFound: Ref<Array<User>> = ref([]);

watch(userSearched, async (newVal: string, oldVal: string) => {
  newVal = newVal.trim().replace(/\s+/g, ` `);

  console.log(newVal);

  if (newVal == oldVal || newVal.length < 3) 
    return usersFound.value = [];

  const users = await trpc.users.search.query(newVal);

  console.log(users);
});

onMounted(() => {
  document.title = `${t('users.users')} - ${store.getTitle()}`;
});

</script>
  
<style scoped>
.full-height {
  height: 100%;
}
</style>
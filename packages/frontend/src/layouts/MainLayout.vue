<template>
  <q-no-ssr>
    <q-layout view="lHh Lpr lFf" >
      <q-header :reveal="false" :class="store.darkMode ? 'text-white bg-dark-page' : 'text-black bg-white'">
        <q-toolbar>
          <q-btn
            flat
            dense
            round
            icon="menu"
            aria-label="Menu"
            @click="toggleLeftDrawer"
          />

          <q-toolbar-title>
            {{ store.getTitle() }}
          </q-toolbar-title>

          <q-btn @click="settingsSelector=true" round dense flat icon="settings" />

        </q-toolbar>
      
      </q-header>
      
      <q-drawer v-if="false"
        v-model="drawer"
        show-if-above
        bordered
      >

      </q-drawer>

      <q-page-container>
        <router-view />
      </q-page-container>

      <q-dialog persistent v-model="settingsSelector">
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">{{ $t('misc.settings') }}</div>
          </q-card-section>

          <q-separator size="2px" inset />

          <q-card-section class="q-pt-none q-mt-sm">

            <div class="row justify-center">
              <p class="text-weight-medium">{{ $t('misc.language') }}</p>
            </div>

            <div class="row justify-center">
              <q-btn color="primary" :outline="!(store.language == 'en')" @click="setLanguage('en')" class="q-mr-sm">English</q-btn>
              <q-btn color="primary" :outline="!(store.language == 'fr')" @click="setLanguage('fr')">Français</q-btn>
            </div>

            <div class="row justify-center q-mt-md">
              <p class="text-weight-medium">{{ $t('misc.appearance') }}</p>
            </div>
            
            <div class="row justify-center">
              <q-btn color="primary" :outline="store.darkMode" @click="setDarkMode(false)" class="q-mr-sm">Light Mode</q-btn>
              <q-btn color="primary" :outline="!store.darkMode" @click="setDarkMode(true)">Dark Mode</q-btn>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="OK" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-layout>
  </q-no-ssr>
</template>

<script setup lang="ts">
import { ref, onServerPrefetch, onMounted, onBeforeMount } from 'vue';
import type { Ref} from 'vue';
import { useQuasar, QVueGlobals } from 'quasar';
import { whisperStore } from 'stores/WhisperStore';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const store = whisperStore();
const q: QVueGlobals = useQuasar(); 
const drawer = ref(false);
const settingsSelector: Ref<boolean> = ref(false);

onServerPrefetch(() => {
  // set the title of the page from the environment variable
  store.setTitle(process.env.TITLE);
  store.setDomain(process.env.DOMAIN);
});

function setDarkMode(mode: boolean): void{
  store.setDarkMode(mode);
  q.dark.set(mode);
}

function setLanguage(lang: string): void{
  locale.value = lang;
  store.setLanguage(lang);
}

onBeforeMount(() => { 
  // if the language is null, we try to detect the user language
  if (!store.getLanguage()) {
    const languages = navigator.languages || [navigator.language];
    const preferredLanguage = languages.find(lang => lang.startsWith('en') || lang.startsWith('fr')) || 'en';
    setLanguage(preferredLanguage.startsWith('fr') ? 'fr' : 'en');
  }
  else 
    setLanguage(store.getLanguage());
  
  // display color mode selector
  if (store.getDarkMode() == null){
    settingsSelector.value = true;
    store.setDarkMode(false);
  }
  else 
    store.setDarkMode(store.getDarkMode());


});

onMounted(() => {
  q.dark.set(store.getDarkMode());
});
 



function toggleLeftDrawer () {
  drawer.value = !drawer.value;
}
</script>

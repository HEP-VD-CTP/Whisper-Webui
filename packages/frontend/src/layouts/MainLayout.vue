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
            <q-badge v-if="store.env == 'development'" color="red" align="top">
                DEV <q-icon name="warning" color="white" class="q-ml-xs" />
            </q-badge>
          </q-toolbar-title>

          <template v-if="store.user == null">
            <q-btn @click="settingsSelector=true" round dense flat icon="settings" />
          </template>
          <template v-else>
            <q-btn-dropdown flat no-caps :label="store.user.email">
              <q-item clickable v-close-popup @click="router.push(`/users`)">
                <q-item-section>
                  <q-item-label>{{ $t('users.users') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="groups" />
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="settingsSelector=true">
                <q-item-section>
                  <q-item-label>{{ $t('misc.settings') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="settings" />
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="router.push(`/logout`)">
                <q-item-section>
                  <q-item-label>{{ $t('login_page.logout_button') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="logout" />
                </q-item-section>
              </q-item>
            </q-btn-dropdown>
          </template>
          

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

            <template v-if="store.user != null">
              <div class="row justify-center q-mt-md">
                <p class="text-weight-medium">{{ $t('user.user_account') }}</p>
              </div>

              <q-list>
                <q-item clickable v-ripple>
                  <q-item-section>
                    <q-item-label>{{ store.user.firstname }} {{ store.user.lastname }}</q-item-label>
                    <q-item-label caption>{{ store.user.email }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>

              <div class="row justify-center q-mt-md">
                <q-btn color="negative" @click="changePwd" class="q-mr-sm">{{ $t('user.change_password') }}</q-btn>                
              </div>
            </template>
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
import { User } from "@whisper-webui/lib/src/types/kysely.ts"
import lib  from 'src/lib/index';
import { useRouter, Router } from 'vue-router';
import trpc from 'src/lib/trpc';


const { t, locale } = useI18n();
const store = whisperStore();
const q: QVueGlobals = useQuasar(); 
const drawer = ref(false);
const settingsSelector: Ref<boolean> = ref(false);

const router: Router = useRouter(); 

// this will be only executed on the server side
onServerPrefetch(async () => {
  // set the title of the page from the environment variable
  store.setEnv(process.env.NODE_ENV);
  store.setTitle(process.env.TITLE);
  store.setDomain(process.env.DOMAIN);

  // check the user session
  const sessionId = q.cookies.get('sessionId');

  if (!sessionId)  // if there is no current session provided
    return console.log(`NO SESSION ID`);

  // try to get the user session infos
  try {
    // we will try to get the user session using a regular http query 
    // to the trpc endpoint. The same query with trpc would be:
    //const user = await trpc.auth.renew.query();
    const response = await fetch(`http://whisper-webui-backend:9000/trpc/auth.renew`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `sessionId=${sessionId}`
      },
    });

    if (!response.ok) 
      throw new Error(`HTTP error! status: ${response.status}`);

    // store the user data
    const user = (await response.json()).result.data.json as User;
    store.setUser(user);
  }
  catch(err){
    console.error(`Query user session failed: `, err);
  }
});

async function changePwd(): Promise<void> {
  q.dialog({
    title: t('user.change_password'),
    prompt: {
      model: '',
      isValid: val => val.length >= 6 && val.length <= 255, 
      type: 'password'
    },
    cancel: {
      label: t('misc.cancel'),
      flat: true
    },
    persistent: true
  }).onOk(async data => {
    trpc.users.updatePassword.mutate({
      id: store.user.id.toString(),  
      pwd: data
    });
  });
}

function setDarkMode(mode: boolean): void{
  store.setDarkMode(mode);
  q.dark.set(mode);
}

function setLanguage(lang: string): void{
  locale.value = lang;
  store.setLanguage(lang);
}

onBeforeMount(async () => { 
  if (store.user == null && router.currentRoute.value.path != '/expired')
    router.push('/login');

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

  console.log(store.user);
});
 



function toggleLeftDrawer () {
  drawer.value = !drawer.value;
}
</script>

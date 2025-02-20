<template>
    <q-page class="row items-center justify-evenly">
      <q-card style="min-width: 350px;" flat :class="store.darkMode ? `bg-dark` : `bg-light`">
        <q-card-section class="aligh-center">
          <div class="row justify-center text-h6">{{ $t('login_page.login_page_title') }}</div>
        </q-card-section>
        
        <q-separator size="2px" inset />

        <q-card-section class="q-pt-none q-mt-md">
          <div class="row justify-center ">
            <p class="text-weight-medium">{{ $t('login_page.connect_with_local_account') }}</p>
          </div> 
        
          <q-form @submit="login">
            <q-input v-model="email" :label="t('user.email')" filled type="email" :rules="lib.rules.email(t('validation.email.mandatory'), t('validation.email.maxLength'), t('validation.email.valid'))" />
            <q-input v-model="password" filled :type="isPwd ? 'password' : 'text'" :label="t('user.password')" :rules="lib.rules.pwd(t('validation.password.mandatory'), t('validation.password.length'))">
              <template v-slot:append>
                <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd"/>
              </template>
            </q-input> 
        
            <div class="q-mt-lg text-center">
              <q-btn color="primary" :label="t('login_page.login_button')" type="submit" icon-right="login" :loading="btnLoading"/>
              <q-btn color="primary" @click="test" label="test" icon-right="login"/>
            </div>  
          </q-form>
        </q-card-section>
    </q-card> 
  </q-page> 
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar, QVueGlobals } from 'quasar';
import { whisperStore } from 'stores/WhisperStore';
import { useI18n } from 'vue-i18n';
import { useRouter, Router, RouteLocationNormalized } from 'vue-router';
import lib  from 'src/lib/index';
import trpc from 'src/lib/trpc';

const router: Router = useRouter(); 


const { t } = useI18n();
const store = whisperStore();

const email      = ref(`john.doe@example.com`);
const password   = ref(`123456`);
const isPwd      = ref(true);
const btnLoading = ref(false);

const q: QVueGlobals = useQuasar(); 

async function test(){
  try{
    const x = await trpc.auth.renew.query();
  }
  catch(err){
    
  }
}

async function login(): Promise<void> {
  btnLoading.value = true;

  try {
    const user = await trpc.auth.login.query({email: email.value, pwd: password.value});
    store.setUser(user);
    router.push('/');
  }
  catch(err){
    
    q.dialog({
      title: t('misc.error'),
      message: t('login_page.invalid'),
    });
  }

  btnLoading.value = false;
}

onMounted(async () => {
  document.title = `${t('login_page.login_page_title')} - ${store.getTitle()}`;
});

</script>
  
<template>
  <q-page class="row items-center justify-evenly">
    <q-card style="min-width: 350px;" flat :class="store.darkMode ? `bg-dark` : `bg-light`">
      <q-card-section class="aligh-center">
        <div class="row justify-center text-h6">{{ t('misc.alert') }}</div>
      </q-card-section>

      <q-separator size="2px" inset />

      <q-card-section class="q-pt-none q-mt-md">
        <div class="row justify-center ">
          <p class="text-weight-medium">{{ t('login_page.sessionExpired') }}</p>
        </div> 
        <div class="q-mt-lg text-center">
          <q-btn color="primary" @click="router.push('/logout')" :label="t('login_page.login_button')" icon-right="login" />
        </div>  
      </q-card-section>
    </q-card> 
  </q-page> 
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { whisperStore } from 'stores/WhisperStore';
import { useI18n } from 'vue-i18n';
import { useRouter, Router } from 'vue-router';

const router: Router = useRouter(); 

const { t } = useI18n();
const store = whisperStore();
store.setUser(null);

</script>

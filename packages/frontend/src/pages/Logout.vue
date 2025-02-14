<template>
  <q-page class="row items-center justify-evenly">
    <q-card style="min-width: 350px;" flat :class="store.darkMode ? `bg-dark` : `bg-light`">
      <q-card-section class="aligh-center">
        <div class="row justify-center text-h6">LOGOUT PAGE</div>
      </q-card-section>
    </q-card> 
  </q-page> 
</template>

<script setup lang="ts">
import { whisperStore } from 'stores/WhisperStore';
import { useRouter, Router } from 'vue-router';

const router: Router = useRouter(); 

const store = whisperStore();

store.setUser(null);

router.push('/login');


</script>

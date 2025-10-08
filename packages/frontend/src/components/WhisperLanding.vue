<template>
  <div class="row justify-center items-center" style="height: 100%;">
    <div :class="`q-pa-sm text-center ${store.darkMode ? 'bg-dark' : 'bg-light'}`">
      <div v-if="store.language == 'fr'">
        <b>{{ store.getOrganization() }}</b><br/><br/>
        
        Bienvenue sur <b>Whisper,</b> votre application de transcription. <br/><br/>
  
        Notre plateforme utilise Whisper d'OpenAI pour transcrire avec précision des enregistrements audio en texte. <br/>
        Cette technologie avancée reconnaît diverses langues, offrant une solution efficace pour convertir des cours, 
        interviews et discussions en documents écrits, facilitant l'accès et le partage de l'information.<br/><br/>
  
        Nous tenons à vous assurer que la protection de vos données est assurée.<br/>
        Toutes les transcriptions sont effectuées directement sur nos, garantissant que vos informations ne quittent jamais notre infrastructure sécurisée.<br/><br/>
  
        Pour commencer, veuillez ajouter un nouveau fichier à transcrire dans le menu de gauche <q-icon name="add"/>
      </div>
      <div v-else-if="store.language == 'en'">
        <b>{{ store.getOrganization() }}</b><br/><br/>

        Welcome to <b>Whisper</b>, your transcription application. <br/><br/>

        Our platform uses OpenAI's Whisper to accurately transcribe audio recordings into text. <br/>
        This advanced technology recognizes multiple languages, providing an efficient solution 
        for converting lectures, interviews, and discussions into written documents, 
        making information more accessible and easier to share.<br/><br/>

        We want to assure you that your data is fully protected.<br/> All transcriptions are performed directly on our servers, 
        ensuring that your information never leaves our secure infrastructure.<br/><br/>

        To get started, please add a new file to transcribe using the menu on the left <q-icon name="add"/>
      </div>
    </div>
  </div>  
</template>
  
<script setup lang="ts">
import { whisperStore } from 'stores/WhisperStore'

const store = whisperStore()


</script>

<style setup>

</style>
  
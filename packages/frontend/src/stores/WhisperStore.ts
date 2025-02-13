import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Ref } from 'vue';

export const whisperStore = defineStore('whisper', () => {
  
  // ##########
  // # domain #
  // ##########
  const domain: Ref<string> = ref('');
  
  function getDomain(): string {
    return domain.value;
  }

  function setDomain(newDomain: string): void {
    domain.value = newDomain;
  }

  // ##############
  // # page title #
  // ##############
  const title: Ref<string> = ref('STORE TITLE');

  function getTitle(): string {
    return title.value;
  }

  function setTitle(newTitle: string): void {
    title.value = newTitle;
  }

  // ###########
  // # laguage #
  // ###########
  const language: Ref<string|null> = ref(null);

  function getLanguage(): string|null {
    return localStorage.getItem('language');
  }

  function setLanguage(lang: string): void {
    language.value = lang;
    localStorage.setItem('language', lang);
  }

  // #############
  // # dark mode #
  // #############
  const darkMode: Ref<boolean|null> = ref(null);
  
  function getDarkMode(): boolean|null {
    return JSON.parse(localStorage.getItem('darkMode'));
  }

  function setDarkMode(mode: boolean): void {
    darkMode.value = mode;
    localStorage.setItem('darkMode', JSON.stringify(mode));
  }

  return {
    domain,
    getDomain,
    setDomain,

    title,
    getTitle,
    setTitle,

    language,
    getLanguage,
    setLanguage,

    darkMode,
    getDarkMode,
    setDarkMode
  }
})


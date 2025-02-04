import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Ref } from 'vue';

export const whisperStore = defineStore('whisper', () => {
  
  // title of the page
  const title: Ref<string> = ref('STORE TITLE');

  function getTitle(): string {
    return title.value;
  }

  function setTitle(newTitle: string): void {
    title.value = newTitle;
  }

  // language
  const language: Ref<string|null> = ref(null);

  function getLanguage(): string|null {
    return localStorage.getItem('language');
  }

  function setLanguage(lang: string): void {
    language.value = lang;
    localStorage.setItem('language', lang);
  }

  // dark mode
  function getDarkMode(): boolean|null {
    return JSON.parse(localStorage.getItem('darkMode'));
  }

  function setDarkMode(mode: boolean): void {
    localStorage.setItem('darkMode', JSON.stringify(mode));
  }

  return {
    title,
    getTitle,
    setTitle,

    language,
    getLanguage,
    setLanguage,

    getDarkMode,
    setDarkMode
  }
})


import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Ref } from 'vue';
import { User } from "@whisper-webui/backend/src/graphql/types.ts"

export const whisperStore = defineStore('whisper', () => {
  // ########
  // # user #
  // ########
  const user: Ref<User|null> = ref(null);

  function getUser(): User|null {
    return user.value;
  }

  function setUser(newUser: User|null): void {
    user.value = newUser;
  }

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
  const title: Ref<string> = ref('TITLE');

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
    user,
    getUser,
    setUser,

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


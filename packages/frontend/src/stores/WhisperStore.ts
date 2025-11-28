import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'
import { User } from "@whisper-webui/lib/src/types/kysely.ts"


export const whisperStore = defineStore('whisper', () => {
  // ########
  // # user #
  // ########
  const user: Ref<User> = ref(null)

  function getUser(): User {
    return user.value
  }

  function setUser(newUser: User): void {
    user.value = newUser
  }

  // #######
  // # env #
  // #######
  const env: Ref<string> = ref('development')

  function getEnv(): string {
    return env.value
  }

  function setEnv(newEnv: string): void {
    env.value = newEnv
  }

  // ################
  // # organization #
  // ################
  const organization: Ref<string> = ref('')
  function getOrganization(): string {
    return organization.value
  }
  function setOrganization(newOrganization: string): void {
    organization.value = newOrganization
  }

  // ##########
  // # domain #
  // ##########
  const domain: Ref<string> = ref('')
  
  function getDomain(): string {
    return domain.value
  }

  function setDomain(newDomain: string): void {
    domain.value = newDomain
  }

  // ##############
  // # page title #
  // ##############
  const title: Ref<string> = ref('TITLE')

  function getTitle(): string {
    return title.value
  }

  function setTitle(newTitle: string): void {
    title.value = newTitle
  }

  // ##########
  // # drawer #
  // ##########
  const drawer: Ref<boolean> = ref(true)
  
  function getDrawer(): boolean {
    return drawer.value
  }

  function setDrawer(newDrawer: boolean): void {
    drawer.value = newDrawer
  }

  function toggleDrawer(): void {
    drawer.value = !drawer.value
  }

  // ###########
  // # laguage #
  // ###########
  const language: Ref<string|null> = ref(null)

  function getLanguage(): string|null {
    return localStorage.getItem('language')
  }

  function setLanguage(lang: string): void {
    language.value = lang
    localStorage.setItem('language', lang)
  }

  // #############
  // # dark mode #
  // #############
  const darkMode: Ref<boolean|null> = ref(null)
  
  function getDarkMode(): boolean|null {
    return JSON.parse(localStorage.getItem('darkMode'))
  }

  function setDarkMode(mode: boolean): void {
    darkMode.value = mode
    localStorage.setItem('darkMode', JSON.stringify(mode))
  }

  // #############################
  // # selected transcription ID #
  // #############################
  const selectedTranscriptionId: Ref<string|null> = ref(null)

  function getSelectedTranscriptionId(): string|null {
    return selectedTranscriptionId.value
  }

  function setSelectedTranscriptionId(newId: string|null): void {
    selectedTranscriptionId.value = newId
  }

  // ##########
  // # OAuth2 #
  // ##########
  const oauth2Label: Ref<string> = ref('')
  function getOauth2Label(): string {
    return oauth2Label.value
  }

  function setOauth2Label(newLabel: string): void {
    oauth2Label.value = newLabel
  }


  const oauth2Link: Ref<string> = ref('')
  function getOauth2Link(): string {
    return oauth2Link.value
  }

  function setOauth2Link(newLink: string): void {
    oauth2Link.value = newLink
  }


  return {
    user,
    getUser,
    setUser,

    env,
    getEnv,
    setEnv,

    organization,
    getOrganization,
    setOrganization,

    domain,
    getDomain,
    setDomain,

    title,
    getTitle,
    setTitle,

    drawer,
    getDrawer,
    setDrawer,
    toggleDrawer,

    language,
    getLanguage,
    setLanguage,

    darkMode,
    getDarkMode,
    setDarkMode,

    selectedTranscriptionId,
    getSelectedTranscriptionId,
    setSelectedTranscriptionId,

    oauth2Label,
    getOauth2Label,
    setOauth2Label,

    oauth2Link,
    getOauth2Link,
    setOauth2Link,
  }
})


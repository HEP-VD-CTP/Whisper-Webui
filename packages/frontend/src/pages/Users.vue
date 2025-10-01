<template>



  <q-page style="border:0px solid red;width:100%" class="full-height">
    <q-splitter style="height:calc(100vh - 50px)" v-model="splitterPosition" separator-style="width:3px">

      <template v-slot:before>
        <q-list>
          <q-item @click="addUserDialog=true" clickable v-ripple>
            <q-item-section>
              <q-item-label>
                <q-icon name="add" /> {{ t('users.add_user') }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <div>
          <q-input v-model="userSearched" debounce="500" filled type="search" :label="t('users.search_user')">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <div class="q-mt-sm text-center">
          <span v-if="userSearched != '*' && userSearched.length < 3">{{ $t('users.use_filter') }}</span>
          <span v-else-if="!usersFound.length">{{ $t('users.no_results') }}</span>
          <span v-else-if="usersFound.length">{{ $t('users.users') }} ({{ usersFound.length }})</span>
        </div>

        <div>
          <q-list class="q-mt-xs" separator>
            <q-item @click="userSelected = user" v-for="user in usersFound" :key="user.id.toString()" clickable v-ripple>
              <q-item-section avatar>
                <q-avatar :color="user?.archived ? 'grey' : 'primary' " text-color="white">
                  {{ user.firstname?.charAt(0).toUpperCase() }}{{ user.lastname?.charAt(0).toUpperCase() }}
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>
                  {{ user?.firstname }} {{ user?.lastname }} 
                  <q-badge class="q-ml-xs q-mr-xs" v-if="user.admin" rounded color="green"><q-icon name="mdi-security" /></q-badge>
                  <q-badge class="q-ml-xs q-mr-xs" v-if="user.blocked" rounded color="negative"><q-icon name="mdi-block-helper" /></q-badge>
                </q-item-label>
                <q-item-label caption lines="1">{{ user?.email }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </template>

      <template v-slot:after>
        <div v-if="userSelected == null" style="height:100%" class="row justify-center items-center text-center">
          <div class="q-pa-sm">
            <p v-html="$t('users.instructions')"></p>
            <q-separator inset />
            <p class="q-mt-md">
              {{ $t('users.stats') }}:<br/><br/>
              {{ $t('users.total') }}: {{ stats.total }}<br/>
              {{ $t('users.active') }}: {{ stats.total - stats.archived - stats.blocked }}<br/>
              {{ $t('users.archived') }}: {{ stats.archived }}<br/>
              {{ $t('users.blocked') }}: {{ stats.blocked }}
            </p>
          </div>
        </div>
        <div v-else>
          <q-list>
            <q-item-label header>{{ $t('users.user_details') }}</q-item-label>

            <!--Avatar-->
            <q-item clickable>
              <q-item-section avatar>
                <q-avatar :color="userSelected.archived ? 'grey' : 'primary'" text-color="white">
                  {{ userSelected?.firstname?.charAt(0).toUpperCase() }}{{ userSelected?.lastname?.charAt(0).toUpperCase() }}
                </q-avatar>
              </q-item-section>
            </q-item>

            <q-item clickable>
              <q-item-section>
                <q-item-label caption>ID</q-item-label>
                <q-item-label>{{ userSelected?.id }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable>
              <q-item-section>            
                <q-input
                  v-model="userSelected.firstname" 
                  :label="t('user.firstname')"
                  @update:model-value="updateSettings({firstname: userSelected.firstname})"  
                  type="text"
                  class="q-ma-none q-pa-none" 
                  borderless 
                  debounce="500" 
                />
              </q-item-section>
            </q-item>

            <q-item clickable>
              <q-item-section>
                <q-input
                  v-model="userSelected.lastname" 
                  :label="t('user.lastname')"
                  @update:model-value="updateSettings({lastname: userSelected.lastname})"  
                  type="text"
                  class="q-ma-none q-pa-none" 
                  borderless 
                  debounce="500" 
                />
              </q-item-section>
            </q-item>

            <q-item clickable>
              <q-item-section>
                <q-input
                  v-model="userSelected.email" 
                  :label="t('user.email')"
                  @update:model-value="updateSettings({email: userSelected.email})"  
                  type="email"
                  class="q-ma-none q-pa-none" 
                  borderless 
                  debounce="2000" 
                />
              </q-item-section>
            </q-item>

            <q-item clickable>
              <q-item-section>
                <q-item-label caption>{{ $t('misc.created_at') }}</q-item-label>
                <q-item-label>{{ lib.date.formatDate(userSelected?.created_at, "DD.MM.YYYY HH:mm:ss") }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable>
              <q-item-section>
                <div class="row justify-center q-mt-md">
                  <q-btn color="negative" @click="changePwd" class="q-mr-sm">{{ $t('user.change_password') }}</q-btn>                
                </div>
              </q-item-section>
            </q-item>

            <q-separator spaced />
            <q-item-label header>{{ $t('misc.settings') }}</q-item-label>

            <q-item clickable>
              <q-item-section side top>
                <q-toggle keep-color color="green" v-model="userSelected.admin" @click="updateSettings({admin: userSelected.admin})"  />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('users.admin_role.title') }}</q-item-label>
                <q-item-label caption>{{ $t('users.admin_role.description') }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable>
              <q-item-section side top>
                <q-toggle keep-color :color="userSelected.archived ? `grey` : `primary`" v-model="userSelected.archived" @click="updateSettings({archived: userSelected.archived})"  />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('users.archived_role.title') }}</q-item-label>
                <q-item-label caption>{{ $t('users.archived_role.description') }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable>
              <q-item-section side top>
                <q-toggle keep-color color="red" v-model="userSelected.blocked" @click="updateSettings({blocked: userSelected.blocked})"  />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('users.blocked_role.title') }}</q-item-label>
                <q-item-label caption>{{ $t('users.blocked_role.description') }}</q-item-label>
              </q-item-section>
            </q-item>            
          </q-list>

          <div class="row justify-center q-mt-md">
            <q-btn color="negative" @click="deleteUser" class="q-mr-sm">{{ $t('users.delete.title') }}</q-btn>                
          </div>
        </div>
      </template>

    </q-splitter>

    <q-dialog v-model="addUserDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ $t('users.add_user') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="createNewUser">
            <q-input
              v-model="newFirstname" 
              lazy-rules filled 
              type="text" 
              :label="$t('user.firstname')"     
              :rules="nameRules"         
              />
            <q-input 
              v-model="newLastname" 
              lazy-rules 
              filled 
              :label="$t('user.lastname')" 
              class="q-mt-sm"
              :rules="nameRules"
              />
            <q-input 
              v-model="newEmail" 
              lazy-rules  
              filled 
              type="email"
              :label="$t('user.email')" 
              class="q-mt-sm"
              :rules="emailRules"
              />
            <q-input 
              v-model="newPassword" 
              lazy-rules 
              filled 
              type="text" 
              :label="$t('user.password')"
              class="q-mt-sm"
              :rules="pwdRules"
              />
            
            <q-btn class="q-mt-md" color="primary" :label="$t('users.add_user')" type="submit"  :loading="btnLoading"/>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('misc.close')" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page> 
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeMount, watch } from 'vue'
import { type Ref } from 'vue'
import { useQuasar, QVueGlobals } from 'quasar'
import { whisperStore } from 'stores/WhisperStore'
import { useI18n } from 'vue-i18n'
import { useRouter, Router, RouteLocationNormalized } from 'vue-router'
import lib  from 'src/lib/index'
import trpc from 'src/lib/trpc'
import { type User } from "@whisper-webui/lib/src/types/kysely.ts"
import { type UsersStats } from "@whisper-webui/lib/src/types/types.ts"

const router: Router = useRouter() 

const { t } = useI18n()
const store = whisperStore()

const addUserDialog: Ref<boolean> = ref(false)
const btnLoading: Ref<boolean> = ref(false)

const q: QVueGlobals = useQuasar() 

// new users fields
const newFirstname: Ref<string> = ref('test')
const newLastname: Ref<string> = ref('test')
const newEmail: Ref<string> = ref('marcel.grosjean@hepl.ch')
const newPassword: Ref<string> = ref('123456')

// validation rules for new user
const emailRules = lib.rules.email(t('validation.email.mandatory'), t('validation.email.maxLength'), t('validation.email.valid'))
const pwdRules = lib.rules.pwd(t('validation.password.mandatory'), t('validation.password.length'))
const nameRules = lib.rules.name(t('validation.name.mandatory'), 255) as any

// Position of the splitter at position % of the component 
const splitterPosition: Ref<number> = ref(33) 

// User search input
const userSearched: Ref<string> = ref('')

// Users found by criteria
const usersFound: Ref<Array<User>> = ref([])

// User seleted for display
const userSelected: Ref<User> = ref(null)

const stats: Ref<UsersStats> = ref({total: 0, archived: 0, blocked: 0})

async function createNewUser(): Promise<void> {
  btnLoading.value = true
    
  try {
    const user = await trpc.users.createUser.mutate({
      firstname: newFirstname.value,
      lastname: newLastname.value,
      email: newEmail.value,
      pwd: newPassword.value
    })

    addUserDialog.value = false
  }
  catch(err){
    if (err?.data?.httpStatus == 409)
      q.dialog({ message: t('users.active_account_exists'), color: 'negative' })
  }

  btnLoading.value = false
}

async function updateSettings(args: Record<string, boolean|string>): Promise<void> {
  try {
    await trpc.users.updateSettings.mutate({ id: userSelected.value.id.toString(), args })
  }
  catch(err){
    // revert back to the old values
    const user = await trpc.users.find.query({id: userSelected.value.id.toString()})
    userSelected.value.firstname = user.firstname
    userSelected.value.lastname = user.lastname
    userSelected.value.email = user.email
    userSelected.value.admin = user.admin
    userSelected.value.archived = user.archived
    userSelected.value.blocked = user.blocked
    
    if (err?.data?.httpStatus == 400)
      q.dialog({ message: t('misc.wrong_input'), color: 'negative' })
    else if (err?.data?.httpStatus == 409)
      q.dialog({ message: t('users.unarchivable'), color: 'negative' })
  }
}

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
      id: userSelected.value.id.toString(),  
      pwd: data
    })
  })
}

async function deleteUser(): Promise<void> {
  q.dialog({
    title: t('users.delete.title'),
    message: t('users.delete.message'),
    cancel: {
      label: t('misc.cancel'),
      flat: true
    },
    ok: {
      label: t('misc.delete'),
      color: 'negative',
      flat: false
    },
    persistent: true
  }).onOk(async () => {
    await trpc.users.deleteUser.mutate({id: userSelected.value.id.toString()})
    // find the user and delete it from the list
    let i = 0
    for (let i = 0; i < usersFound.value.length; i++) {
      if (usersFound.value[i].id == userSelected.value.id) {
        usersFound.value.splice(i, 1)
        break
      }
    }
    userSelected.value = null
  })
}

watch(userSearched, async (newVal: string, oldVal: string) => {
  newVal = newVal.trim().replace(/\s+/g, ` `)

  if (newVal == oldVal)
    return
  
  if (newVal != '*' && newVal.length < 3) 
    return usersFound.value = []

  const users = await trpc.users.search.query({term: newVal})
  usersFound.value = users
})

onBeforeMount(async () => {
 stats.value = await trpc.users.stats.query()
})

onMounted(() => {
  if (!store.user.admin)
    return router.push('/')
  
  document.title = `${t('users.users')} - ${store.getTitle()}`
})

</script>
  
<style scoped>
.full-height {
  height: 100%
}
</style>
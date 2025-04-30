export type TranslationSchema = {
  login_page: {
    connect_with_local_account: string,
    login_button: string
    logout_button: string,
    login_page_title: string,
    invalid: string,
    sessionExpired: string
  },
  misc: {
    alert: string,
    appearance: string,
    cancel: string, 
    close: string,
    delete: string, 
    error: string,
    language: string,
    settings: string,
    created_at: string,
    wrong_input: string
  },
  user: {
    firstname: string, 
    lastname: string, 
    email: string, 
    password: string,
    user_account: string,
    change_password: string,
  },
  users: {
    admin_role: {
      title: string,
      description: string
    },
    archived_role: {
      title: string,
      description: string
    },
    blocked_role: {
      title: string, 
      description: string
    },
    delete: {
      title: string,
      message: string
    },
    active_account_exists: string, 
    unarchivable: string,
    user_details: string,
    stats: string, 
    total: string, 
    archived: string,
    blocked: string,
    instructions: string, 
    add_user: string, 
    search_user: string,
    users: string,
    use_filter: string,
    no_results: string
  },
  transcription: {
    transcription: string,
    add_new_transcription: string,
    uploader_title: string,
    transcription_language: string,
    select_file_descritpion: string,
    max_file_size: string,  
  },
  validation: {
    name: {
      mandatory: string,
      maxLength: string
    },
    email: {
      mandatory: string,
      maxLength: string,
      valid: string
    },
    password: {
      mandatory: string,
      length: string,
    }
  },

  failed: string,
  success: string
}
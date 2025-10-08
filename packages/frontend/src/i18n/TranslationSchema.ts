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
    wrong_input: string,
    error_message: string,
    load_more: string,
    modify: string
  },
  user: {
    firstname: string, 
    lastname: string, 
    email: string, 
    password: string,
    user_account: string,
    change_password: string,
    users: string
  },
  users: {
    active: string,
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
    user_added: string,
    user_removed: string,
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
  admin_transcriptions: {
    search: string,
    instructions: string
  },
  transcription: {
    modify_speakers: string, 
    new_speaker: string,
    modify_speaker_description: string,
    delete: {
      title: string,
      message: string
    },
    transcription: string,
    transcriptions: string, 
    add_new_transcription: string,
    uploader_title: string,
    transcription_language: string,
    select_file_descritpion: string,
    max_file_size: string,
    upload_success: string,
    upload_failed: string,
    upload_rejected: string,
    status: {
      waiting: string, 
      processing: string, 
      done: string,
      error: string
    },
    to_top: string,
    export: {
      options: string, 
      show_speakers: string,
      show_timecodes: string,
      show_multilines: string, 
      show_multilines_details: string, 
      copy: string, 
      download: string,
      copied: string,
      downloaded: string
    },
    properties_and_metadata: {
      title: string,
      metadatas: string,
      properties: string,
      export: string,
      infos: {
        name: string,
        file: string,
        lang: string, 
        duration: string,
        created: string,
        processed: string,
        done: string,
        add_user_label: string,
      },
    },
    waiting: string,
    processing: string,
    error: string
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
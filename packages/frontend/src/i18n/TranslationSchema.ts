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
    error: string,
    language: string,
    settings: string,
    
  },
  user: {
    email: string, 
    password: string,
    user_account: string,
    change_password: string,
  },
  users: {
    add_user: string, 
    search_user: string,
    users: string,
    use_filter: string,
    no_results: string
  },
  validation: {
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
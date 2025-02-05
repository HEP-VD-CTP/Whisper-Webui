export type TranslationSchema = {
  login_page: {
    connect_with_local_account: string,
    login_button: string
    login_page_title: string,
  },
  misc:{
    appearance: string,
    language: string,
    settings: string,
  },
  user: {
    email: string, 
    password: string
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
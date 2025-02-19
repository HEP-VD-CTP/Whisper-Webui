import { TranslationSchema } from "./TranslationSchema";

const en: TranslationSchema = {
  login_page: {
    connect_with_local_account: `Connect with local account`,
    login_button: `Login`,
    logout_button: `Logout`,
    login_page_title: `Login Page`,
    invalid: `Invalid credentials`,
    sessionExpired: `Your session has expired. Please login.`
  },
  misc: {
    alert: `Alert`,
    appearance: `Appearance`,
    cancel: `Cancel`,
    close: `Close`,
    error: `Error`,
    language: `Language`,
    settings: `Settings`,
  },
  user: {
    email: `Email address`,
    password: `Password`,
    user_account: `User account`,
    change_password: `Change password`
  },
  users: {
    add_user: `Add user`,
    search_user: `Search user`,
    users: `Users`
  },
  validation: {  
    email: {
      mandatory: `Email address is mandatory`,
      maxLength: `Maximum length is 255 characters`,
      valid: `Valid email address required`
    },
    password: {
      mandatory: `Password is mandatory`,
      length: `Password length must be between 6 and 255 characters`
    }
  },


  failed: `failed_en`,
  success: `success_en`
}

export default en;
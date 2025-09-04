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
    delete: `Delete`,
    error: `Error`,
    language: `Language`,
    settings: `Settings`,
    created_at: `Created at`,
    wrong_input: `Wrong input`
  },
  user: {
    firstname: `Firstname`,
    lastname: `Lastname`,
    email: `Email address`,
    password: `Password`,
    user_account: `User account`,
    change_password: `Change password`,
  },
  users: {
    admin_role: {
      title: `Admin role`,
      description: `Admin role allows the user to fully manage the application`
    },
    archived_role: {
      title: `User archived`,
      description: `An email address can be associated with multiple users, but only one can be active at a time. All others must be archived.`
    },
    blocked_role: {
      title: `User blocked`,
      description: `A blocked user cannot login to the application`
    },
    delete: {
      title: `Delete user`,
      message: `Are you sure you want to delete this user?`
    },
    active_account_exists: `An active account already exists with this email address`,
    unarchivable: `The user can not be unarchived`,
    user_details: `User details`,
    stats: `Users stats`,
    total: `Total`,
    archived: `Archived`,
    blocked: `Blocked`,
    instructions: `
      Welcome to the users management page.<br/><br/>
      Use the search bar to find users.<br/>
      Type <b>'*'</b> to retrieve all users or enter a specific term to filter the results.<br/><br/>
      You can add a new user using the <b>'+ Add User'</b> button on the left panel.`,
    add_user: `Add user`,
    search_user: `Search user`,
    users: `Users`,
    use_filter: `Please use the filter`,
    no_results: `No results`,
  },
  transcription: {
    status: {
      waiting: `Waiting`,
      processing: `Processing`,
      done: `Done`,
      error: `Error`
    },
    transcription: `Transcription`,
    transcriptions: `Transcriptions`,
    add_new_transcription: `Add new transcription`,
    uploader_title: `Upload an audio/video file`,
    transcription_language: `Transcription language`,
    select_file_descritpion: `Select one or more media files or drag and drop in the space below:`,
    max_file_size: `The maximum file size is <b>4GB</b>`,
    upload_success: `Your file has been successfully uploaded! You will receive an email when the transcription is finished.`,
    upload_failed: `Your file upload has failed. Please try again later. and contact support if the problem persists.`,
    upload_rejected: `The file is not supported.`,
  },
  validation: {  
    name: {
      mandatory: `The name is mandatory`,
      maxLength: `Maximum length is 255 characters`,
    },
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

export default en
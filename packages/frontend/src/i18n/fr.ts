import { TranslationSchema } from "./TranslationSchema";

const fr: TranslationSchema = {
  login_page: {
    connect_with_local_account: `Se connecter avec un compte local`,
    login_button: `Connexion`,
    login_page_title: `Page de connexion`,
  },
  misc: {
    appearance: `Apparence`,
    language: `Langue`,
    settings: `Paramètres`
  },
  user: {
    email: `Adresse email`,
    password: `Mot de passe`
  },
  validation: {
    email: {
      mandatory: `L'adresse email est obligatoire`,
      maxLength: `La longueur maximale est de 255 caractères`,
      valid: `Adresse email valide requise`
    },
    password: {
      mandatory: `Le mot de passe est obligatoire`,
      length: `La taille du mot de passe doit être entre 6 et 255 caractères`
    }
  },

  failed: `failed_fr`,
  success: `success_fr`
}

export default fr;
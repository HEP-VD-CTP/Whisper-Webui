import { TranslationSchema } from "./TranslationSchema";

const fr: TranslationSchema = {
  login_page: {
    connect_with_local_account: `Se connecter avec un compte local`,
    login_button: `Connexion`,
    logout_button: `Déconnexion`,
    login_page_title: `Page de connexion`,
    invalid: `Identifiants invalides`,
    sessionExpired: `Votre session a expiré. Veuillez vous reconnecter.`
  },
  misc: {
    alert: `Alerte`,
    appearance: `Apparence`,
    cancel: `Annuler`,
    close: `Fermer`,
    error: `Erreur`,
    language: `Langue`,
    settings: `Paramètres`,
  },
  user: {
    email: `Adresse email`,
    password: `Mot de passe`,
    user_account: `Compte utilisateur`,
    change_password: `Changer le mot de passe`
  },
  users: {
    add_user: `Ajouter un utilisateur`,
    search_user: `Rechercher un utilisateur`,
    users: `Utilisateurs`,
    use_filter: `Veuillez utiliser le filtre`,
    no_results: `Aucun résultat`
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
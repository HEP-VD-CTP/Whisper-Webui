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
    delete: `Supprimer`,
    error: `Erreur`,
    language: `Langue`,
    settings: `Paramètres`,
    created_at: `Créé le`,
    wrong_input: `Mauvaise entrée`
  },
  user: {
    firstname: `Prénom`,
    lastname: `Nom`,
    email: `Adresse email`,
    password: `Mot de passe`,
    user_account: `Compte utilisateur`,
    change_password: `Changer le mot de passe`
  },
  users: {
    admin_role: {
      title: `Rôle administrateur`,
      description: `Le rôle administrateur permet à l'utilisateur de gérer pleinement l'application`
    },
    archived_role: {
      title: `Utilisateur archivé`,
      description: `Une adresse e-mail peut être associée à plusieurs utilisateurs, mais un seul d'entre eux peut être actif à la fois. Tous les autres doivent être archivés.`
    },
    blocked_role: {
      title: `Utilisateur bloqué`,
      description: `Un utilisateur bloqué ne peut pas se connecter à l'application`
    },
    delete: {
      title: `Supprimer l'utilisateur`,
      message: `Êtes-vous sûr de vouloir supprimer cet utilisateur?`
    },
    unarchivable: `L'utilisateur ne peut pas être désarchivé`,
    user_details: `Détails de l'utilisateur`,
    stats: `Statistiques utilisateurs`,
    total: `Total`,
    archived: `Archivés`,
    blocked: `Bloqués`,
    instructions: `
      Bienvenue sur la page de gestion des utilisateurs.<br/><br/>
      Utilisez la barre de recherche pour trouver des utilisateurs.<br/>
      Tapez <b>'*'</b> pour récupérer tous les utilisateurs ou entrez un terme spécifique pour filtrer les résultats.<br/><br/>
      Vous pouvez ajouter un nouvel utilisateur en utilisant le bouton <b>'+ Ajouter un utilisateur'</b> dans le panneau de gauche.`,
    add_user: `Ajouter un utilisateur`,
    search_user: `Rechercher un utilisateur`,
    users: `Utilisateurs`,
    use_filter: `Veuillez utiliser le filtre`,
    no_results: `Aucun résultat`,
  },
  validation: {
    name: {
      mandatory: `Le nom est obligatoire`,
      maxLength: `La longueur maximale est de 255 caractères`,
    },
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
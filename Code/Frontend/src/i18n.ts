import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

// In browser environments we'll use our custom hooks, but for flexibility of framework, this maintains the i18n standard
const i18n = createInstance();

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: {
      translation: {
        "app": {
          "title": "AI Scientist",
          "subtitle": "Automated Scientific Discovery Platform"
        },
        "nav": {
          "dashboard": "Dashboard",
          "pipeline": "Pipeline",
          "ideas": "Ideas",
          "experiments": "Experiments",
          "papers": "Papers",
          "reviews": "Reviews",
          "settings": "Settings"
        },
        "dashboard": {
          "title": "AI Scientist Dashboard",
          "overview": "Research Overview",
          "stats": {
            "title": "Statistics",
            "ideas": "Total Ideas",
            "experiments": "Experiments",
            "papers": "Papers",
            "reviews": "Reviews"
          },
          "recent_activity": "Recent Activity",
          "pipeline_status": "Active Pipelines",
          "empty_title": "No Recent Activity",
          "empty_description": "Your research activities will appear here"
        },
        "ideas": {
          "title": "Research Ideas",
          "generate_modal": {
            "title": "Generate New Ideas",
            "field": {
              "domain": "Research Domain",
              "domain_placeholder": "e.g., computer vision, quantum computing",
              "count": "Number of Ideas",
              "count_placeholder": "How many ideas to generate?"
            }
          },
          "filter": {
            "show_all": "All Status",
            "new": "New",
            "planned": "Planned",
            "in_progress": "In Progress",
            "completed": "Completed",
            "rejected": "Rejected"
          },
          "table": {
            "title": "Title",
            "domain": "Domain",
            "status": "Status",
            "novelty": "Novelty",
            "created": "Created"
          },
          "empty_message": "No research ideas yet. Generate your first idea!"
        },
        "experiments": {
          "title": "Experiments",
          "status": "Status",
          "progress": "Progress",
          "run_experiment": "Run Experiment",
          "logs": "Experiment Logs",
          "no_logs": "No logs available",
          "empty_title": "No Experiments",
          "empty_description": "Your experiments will appear here once created"
        },
        "papers": {
          "title": "Research Papers",
          "download_pdf": "Download PDF",
          "empty_title": "No Papers",
          "empty_description": "Your research papers will appear here when generated"
        },
        "reviews": {
          "title": "Paper Reviews",
          "overall_score": "Overall Score",
          "radar_labels": {
            "relevance": "Relevance",
            "novelty": "Novelty",
            "methodology": "Methodology",
            "validity": "Validity",
            "presentation": "Presentation",
            "impact": "Impact",
            "ethics": "Ethics"
          },
          "empty_title": "No Reviews",
          "empty_description": "Paper reviews will be available once created"
        },
        "pipeline": {
          "title": "Research Pipeline",
          "domain": "Research Domain",
          "iterations": "Iterations",
          "launch_pipeline": "Launch Pipeline",
          "step": {
            "idea_gen": "Idea Generation",
            "experiment_planning": "Planning",
            "experiment_execution": "Execution",
            "validation": "Validation",
            "analysis": "Analysis"
          }
        },
        "settings": {
          "title": "Settings",
          "llm_config": "LLM Configuration",
          "provider": "Provider",
          "model": "Model",
          "temperature": "Temperature",
          "api_key": "API Key",
          "display": "Display",
          "theme": "Theme",
          "language": "Language",
          "save": "Save Settings",
          "saved_success": "Settings saved successfully!"
        },
        "common": {
          "loading": "Loading...",
          "save": "Save",
          "cancel": "Cancel",
          "view_details": "View Details",
          "status": {
            "pending": "Pending",
            "running": "Running",
            "completed": "Completed",
            "failed": "Failed",
            "idle": "Idle",
            "initializing": "Initializing",
            "in_progress": "In Progress"
          }
        }
      }
    },
    fr: {
      translation: {
        "app": {
          "title": "Scientifique IA",
          "subtitle": "Plateforme de Découverte Scientifique Automatisée"
        },
        "nav": {
          "dashboard": "Tableau de bord",
          "pipeline": "Pipeline",
          "ideas": "Idées",
          "experiments": "Expériences",
          "papers": "Articles",
          "reviews": "Évaluations",
          "settings": "Paramètres"
        },
        "dashboard": {
          "title": "Tableau de Bord Scientifique IA",
          "overview": "Vue d'Ensemble de la Recherche",
          "stats": {
            "title": "Statistiques",
            "ideas": "Idées Total",
            "experiments": "Expériences",
            "papers": "Articles",
            "reviews": "Évaluations"
          },
          "recent_activity": "Activité Récente",
          "pipeline_status": "Pipelines Actifs",
          "empty_title": "Aucune Activité Récente",
          "empty_description": "Vos activités de recherche apparaîtront ici"
        },
        "ideas": {
          "title": "Idées de Recherche",
          "generate_modal": {
            "title": "Générer de Nouvelles Idées",
            "field": {
              "domain": "Domaine de Recherche",
              "domain_placeholder": "ex: vision par ordinateur, informatique quantique",
              "count": "Nombre d'idées",
              "count_placeholder": "Combien d'idées générer?"
            }
          },
          "filter": {
            "show_all": "Tous Statuts",
            "new": "Nouveau",
            "planned": "Planifié",
            "in_progress": "En Cours",
            "completed": "Complété",
            "rejected": "Rejeté"
          },
          "table": {
            "title": "Titre",
            "domain": "Domaine",
            "status": "Statut",
            "novelty": "Originalité",
            "created": "Créé"
          },
          "empty_message": "Aucune idée de recherche. Générez votre première idée !"
        },
        "experiments": {
          "title": "Expériences",
          "status": "Statut",
          "progress": "Progression",
          "run_experiment": "Lancer Expérience",
          "logs": "Journaux Expérience",
          "no_logs": "Aucun journal disponible",
          "empty_title": "Aucune Expérience",
          "empty_description": "Vos expériences apparaîtront ici dès leur création"
        },
        "papers": {
          "title": "Articles de Recherche",
          "download_pdf": "Télécharger PDF",
          "empty_title": "Aucun Article",
          "empty_description": "Vos articles de recherche apparaîtront ici lorsqu'ils seront générés"
        },
        "reviews": {
          "title": "Évaluations d'Articles",
          "overall_score": "Score Global",
          "radar_labels": {
            "relevance": "Pertinence",
            "novelty": "Originalité",
            "methodology": "Méthodologie",
            "validity": "Validité",
            "presentation": "Présentation",
            "impact": "Impact",
            "ethics": "Éthique"
          },
          "empty_title": "Aucune Évaluation",
          "empty_description": "Les évaluations d'article seront disponibles une fois créées"
        },
        "pipeline": {
          "title": "Pipeline de Recherche",
          "domain": "Domaine de Recherche",
          "iterations": "Itérations",
          "launch_pipeline": "Lancer Pipeline",
          "step": {
            "idea_gen": "Génération Idée",
            "experiment_planning": "Planification",
            "experiment_execution": "Exécution",
            "validation": "Validation",
            "analysis": "Analyse"
          }
        },
        "settings": {
          "title": "Paramètres",
          "llm_config": "Configuration LLM",
          "provider": "Fournisseur",
          "model": "Modèle",
          "temperature": "Température",
          "api_key": "Clé API",
          "display": "Affichage",
          "theme": "Thème",
          "language": "Langue",
          "save": "Enregistrer Paramètres",
          "saved_success": "Paramètres enregistrés avec succès !"
        },
        "common": {
          "loading": "Chargement...",
          "save": "Enregistrer",
          "cancel": "Annuler",
          "view_details": "Voir Détails",
          "status": {
            "pending": "En attente",
            "running": "En cours",
            "completed": "Terminé",
            "failed": "Échoué",
            "idle": "Inactif",
            "initializing": "Initialisation",
            "in_progress": "En cours"
          }
        }
      }
    }
  },
  interpolation: {
    escapeValue: false // react already safes from xss
  }
});

export default i18n;
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Textes de l'interface (le contenu du CV vient de MongoDB). FR et EN gardes synchrones.
const resources = {
    fr: {
        translation: {
            nav: {
                experiences: "Expériences",
                skills: "Compétences",
                education: "Formation",
                certifications: "Certifications",
                projects: "Projets",
                contact: "Contact",
                principale: "Navigation principale",
                ouvrirMenu: "Ouvrir le menu",
                fermerMenu: "Fermer le menu",
                accueil: "Retour en haut de page",
            },
            theme: {versSombre: "Activer le mode sombre", versClair: "Activer le mode clair"},
            langue: {basculer: "Passer le site en anglais", code: "EN"},
            downloadCv: "Télécharger le CV",
            hero: {
                seeProjects: "Voir mes projets",
                contactMe: "Me contacter",
                lieu: "Lieu",
                langues: "Langues",
                portrait: "Portrait de {{nom}}",
            },
            experiences: {
                title: "Expériences",
                intro: "Stages, missions et engagements, du plus récent au plus ancien.",
                seeDetail: "Voir le détail",
                hideDetail: "Masquer le détail",
            },
            skills: {
                title: "Compétences",
                intro: "Ce avec quoi je construis, regroupé par domaine.",
                seeDetail: "Voir le détail",
                hideDetail: "Masquer le détail",
                categories: {
                    ai: "IA et machine learning",
                    data_engineering: "Data engineering",
                    software_engineering: "Génie logiciel",
                    cloud_mlops: "Cloud et MLOps",
                    databases: "Bases de données",
                    visualization: "Visualisation",
                    math_foundations: "Fondements mathématiques",
                    tools: "Outils",
                },
            },
            education: {
                title: "Formation",
                enCours: "En cours",
                seeDetail: "Voir le détail",
                hideDetail: "Masquer le détail",
            },
            certifications: {
                title: "Certifications",
                verify: "Vérifier le certificat",
            },
            projects: {
                title: "Projets",
                intro: "Projets d’école et projets personnels, l’IA et la finance en premier.",
                filtres: "Filtrer les projets",
                tous: "Tous",
                "ia-data": "IA & Data",
                systemes: "Systèmes",
                web: "Web",
                personnel: "Personnel",
                seeProject: "Voir le projet",
                seeAll: "Voir les {{count}} projets",
                seeLess: "Afficher moins",
                lien: "Ouvrir le dépôt ou le site",
                fermer: "Fermer",
                aucun: "Aucun projet dans cette catégorie.",
            },
            footer: {
                title: "Travaillons ensemble",
                text: "Un stage, une collaboration ou une question : écrivez-moi.",
                droits: "Tous droits réservés.",
            },
            scrollTop: "Retour en haut",
            contenu: "Aller au contenu",
        }
    },
    en: {
        translation: {
            nav: {
                experiences: "Experience",
                skills: "Skills",
                education: "Education",
                certifications: "Certifications",
                projects: "Projects",
                contact: "Contact",
                principale: "Main navigation",
                ouvrirMenu: "Open menu",
                fermerMenu: "Close menu",
                accueil: "Back to top",
            },
            theme: {versSombre: "Enable dark mode", versClair: "Enable light mode"},
            langue: {basculer: "Switch website to French", code: "FR"},
            downloadCv: "Download CV",
            hero: {
                seeProjects: "See my projects",
                contactMe: "Contact me",
                lieu: "Location",
                langues: "Languages",
                portrait: "Portrait of {{nom}}",
            },
            experiences: {
                title: "Experience",
                intro: "Internships, assignments and commitments, most recent first.",
                seeDetail: "See details",
                hideDetail: "Hide details",
            },
            skills: {
                title: "Skills",
                intro: "What I build with, grouped by field.",
                seeDetail: "See details",
                hideDetail: "Hide details",
                categories: {
                    ai: "AI and machine learning",
                    data_engineering: "Data engineering",
                    software_engineering: "Software engineering",
                    cloud_mlops: "Cloud and MLOps",
                    databases: "Databases",
                    visualization: "Visualization",
                    math_foundations: "Mathematical foundations",
                    tools: "Tools",
                },
            },
            education: {
                title: "Education",
                enCours: "Ongoing",
                seeDetail: "See details",
                hideDetail: "Hide details",
            },
            certifications: {
                title: "Certifications",
                verify: "Verify certificate",
            },
            projects: {
                title: "Projects",
                intro: "School and personal projects, AI and finance first.",
                filtres: "Filter projects",
                tous: "All",
                "ia-data": "AI & Data",
                systemes: "Systems",
                web: "Web",
                personnel: "Personal",
                seeProject: "View project",
                seeAll: "See all {{count}} projects",
                seeLess: "Show less",
                lien: "Open repository or website",
                fermer: "Close",
                aucun: "No project in this category.",
            },
            footer: {
                title: "Let’s work together",
                text: "An internship, a collaboration or a question: write to me.",
                droits: "All rights reserved.",
            },
            scrollTop: "Back to top",
            contenu: "Skip to content",
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        // Langue fixe au premier rendu : le serveur et le client produisent le meme HTML
        // (pas d'erreur d'hydratation). La detection reelle est relancee apres montage
        // dans app/AccueilClient.jsx via i18n.changeLanguage().
        lng: "fr",
        supportedLngs: ["fr", "en"],
        nonExplicitSupportedLngs: true,
        fallbackLng: "en",
        detection: {
            order: ["querystring", "localStorage", "cookie", "navigator", "htmlTag"],
            caches: ["localStorage", "cookie"],
        },
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
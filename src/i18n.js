import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
    fr: {
        translation: {
            home: "Accueil",
            skills: "Compétences",
            experiences: "Expériences",
            education: "Éducation",
            projectsNav: "Projets",
            downloadCv: "Télécharger mon CV",
            welcome: "Bienvenue sur mon portfolio !",
            brand: "Mon Portfolio",
            available: "Disponible pour de nouvelles opportunités",
            seeProjects: "Voir mes projets",
            contactMe: "Me contacter",
            experiencesTitle: "Expériences professionnelles",
            skillsCategories: {
                ai: "IA / Machine Learning",
                databases: "Bases de données",
                mathFoundations: "Fondements mathématiques",
            },
            projects: {
                title: "Projets réalisés",
                previous: "Précédent",
                next: "Suivant",
                filterBySchool: "Filtrer par école",
                filterByTags: "Filtrer par compétences",
                tagsSelected: "Compétences sélectionnées",
                viewMore: "Voir plus",
                countLabel: "projets",
                searchPlaceholder: "Rechercher un projet, technologie...",
                clearFilters: "Effacer",
            }
        }
    },
    en: {
        translation: {
            home: "Home",
            skills: "Skills",
            experiences: "Experiences",
            education: "Education",
            projectsNav: "Projects",
            downloadCv: "Download my CV",
            welcome: "Welcome to my portfolio!",
            brand: "My Portfolio",
            available: "Open to new opportunities",
            seeProjects: "See my projects",
            contactMe: "Contact me",
            experiencesTitle: "Work Experiences",
            skillsCategories: {
                ai: "AI / Machine Learning",
                databases: "Databases",
                mathFoundations: "Mathematical Foundations",
            },
            projects: {
                title: "Completed Projects",
                previous: "Previous",
                next: "Next",
                filterBySchool: "Filter by school",
                filterByTags: "Filter by skills",
                tagsSelected: "Skills selected",
                viewMore: "View more",
                countLabel: "projects",
                searchPlaceholder: "Search projects, technologies...",
                clearFilters: "Clear",
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
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
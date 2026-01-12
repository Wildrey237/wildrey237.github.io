import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
    fr: {
        translation: {
            home: "Accueil",
            skills: "Compétences",
            experiences: "Expériences",
            downloadCv: "Télécharger mon CV",
            welcome: "Bienvenue sur mon portfolio !",
            brand: "Mon Portfolio",
            projects: {
                title: "Projets réalisés",
                previous: "Précédent",
                next: "Suivant",
                filterBySchool: "Filtrer par école",
                filterByTags: "Filtrer par compétences",
                tagsSelected: "Compétences sélectionnées"
            }
        }
    },
    en: {
        translation: {
            home: "Home",
            skills: "Skills",
            experiences: "Experiences",
            downloadCv: "Download my CV",
            welcome: "Welcome to my portfolio!",
            brand: "My Portfolio",
            projects: {
                title: "Completed Projects",
                previous: "Previous",
                next: "Next",
                filterBySchool: "Filter by school",
                filterByTags: "Filter by skills",
                tagsSelected: "Skills selected"
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
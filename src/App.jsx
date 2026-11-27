'use client'

// Accueil (CV) : en-tete collant, hero, experiences, competences, formation,
// certifications, projets, pied de page (contact). Tout est rendu cote serveur.
import {useEffect, useState} from "react";
import {Box, IconButton, Link} from "@chakra-ui/react";
import {ArrowUp} from "lucide-react";
import {useTranslation} from "react-i18next";
import Entete from "./components/accueil/Entete";
import Hero from "./components/accueil/Hero";
import Experiences from "./components/accueil/Experiences";
import Competences from "./components/accueil/Competences";
import Formation from "./components/accueil/Formation";
import Certifications from "./components/accueil/Certifications";
import Projets from "./components/accueil/Projets";
import PiedDePage from "./components/accueil/PiedDePage";
import {useApparition} from "./lib/apparition";
import {useDonnees} from "./data/DonneesContext";

// Sections deplacables (ordre lu dans le profil) ; hero en premier, contact en dernier.
const COMPOSANTS = {
    experiences: Experiences, formation: Formation, competences: Competences,
    certifications: Certifications, projets: Projets,
};

function RetourEnHaut() {
    const {t} = useTranslation();
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const surDefilement = () => setVisible(window.scrollY > 600);
        window.addEventListener("scroll", surDefilement, {passive: true});
        return () => window.removeEventListener("scroll", surDefilement);
    }, []);
    if (!visible) return null;
    return (
        <IconButton
            aria-label={t("scrollTop")}
            icon={<ArrowUp size={18}/>}
            onClick={() => window.scrollTo({top: 0, behavior: "smooth"})}
            position="fixed" bottom={6} right={6} zIndex={90}
            variant="contour" bg="surface" borderRadius="full" boxShadow="0 6px 20px rgba(21,22,26,0.12)"
        />
    );
}

export default function App() {
    const {t} = useTranslation();
    useApparition();
    const {sections} = useDonnees();
    return (
        <>
            <Link href="#contenu" position="absolute" left="-9999px" top={2} zIndex={200} bg="accent" color="accent.contrast"
                  px={4} py={2} borderRadius="8px" _focus={{left: 2}}>
                {t("contenu")}
            </Link>
            <Entete/>
            <Box as="main" id="contenu">
                <Hero/>
                {sections.map(id => {
                    const Composant = COMPOSANTS[id];
                    return Composant ? <Composant key={id}/> : null;
                })}
            </Box>
            <PiedDePage/>
            <RetourEnHaut/>
        </>
    );
}

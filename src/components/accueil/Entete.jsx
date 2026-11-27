'use client'

// En-tete collant : nom, liens de section (le lien actif suit la section visible),
// bouton theme, bascule FR/EN, bouton "Telecharger le CV", menu repliable sur mobile.
import {useEffect, useMemo, useState} from "react";
import {Box, Button, Container, Flex, IconButton, Link, useColorMode, useDisclosure} from "@chakra-ui/react";
import {Download, Menu, Moon, Sun, X} from "lucide-react";
import {useTranslation} from "react-i18next";
import {useDonnees} from "../../data/DonneesContext";
import {LARGEUR, MARGES, lienCv, suivreCv} from "./communs";

// Ordre par defaut ; l'ordre reel vient du profil (donnees.sections), contact toujours en dernier.
export const SECTIONS = ["experiences", "formation", "competences", "certifications", "projets", "contact"];
const CLES = {
    experiences: "nav.experiences", competences: "nav.skills", formation: "nav.education",
    certifications: "nav.certifications", projets: "nav.projects", contact: "nav.contact",
};

// Section active : la derniere dont le haut a depasse la ligne de lecture (sous l'en-tete).
// Calcul direct a chaque defilement, plus fiable qu'un IntersectionObserver pour des
// sections de hauteurs tres differentes.
function useSectionActive(sections) {
    const [active, setActive] = useState(null);
    useEffect(() => {
        let attente = null;
        const calculer = () => {
            attente = null;
            const ligne = window.innerHeight * 0.3;
            let courante = null;
            for (const id of sections) {
                const el = document.getElementById(id);
                if (el && el.getBoundingClientRect().top <= ligne) courante = id;
            }
            // Bas de page atteint : la derniere section (contact) est active.
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) courante = "contact";
            setActive(courante);
        };
        const surDefilement = () => {
            if (!attente) attente = requestAnimationFrame(calculer);
        };
        calculer();
        window.addEventListener("scroll", surDefilement, {passive: true});
        window.addEventListener("resize", surDefilement);
        return () => {
            window.removeEventListener("scroll", surDefilement);
            window.removeEventListener("resize", surDefilement);
            if (attente) cancelAnimationFrame(attente);
        };
    }, [sections]);
    return active;
}

function LienSection({id, actif, onClick, mobile = false}) {
    const {t} = useTranslation();
    return (
        <Link
            href={`#${id}`}
            onClick={onClick}
            aria-current={actif ? "location" : undefined}
            display="inline-flex"
            alignItems="center"
            minH="44px"
            px={mobile ? 0 : 3}
            fontSize={mobile ? "18px" : "14px"}
            fontWeight={actif ? 600 : 500}
            color={actif ? "accent" : "fg.muted"}
            position="relative"
            _hover={{color: "accent", textDecoration: "none"}}
            _after={!mobile && actif ? {
                content: '""', position: "absolute", left: 3, right: 3, bottom: "8px",
                height: "2px", bg: "accent", borderRadius: "2px",
            } : undefined}
        >
            {t(CLES[id])}
        </Link>
    );
}

function BoutonTheme() {
    const {colorMode, toggleColorMode} = useColorMode();
    const {t} = useTranslation();
    // Libelle calcule apres montage : le HTML serveur ne connait pas le theme du visiteur.
    const [monte, setMonte] = useState(false);
    useEffect(() => setMonte(true), []);
    const sombre = monte && colorMode === "dark";
    return (
        <IconButton
            variant="discret"
            onClick={toggleColorMode}
            aria-label={sombre ? t("theme.versClair") : t("theme.versSombre")}
            // Icone choisie en CSS selon la classe du theme : correcte des le premier affichage.
            icon={
                <Box as="span" sx={{
                    ".icone-soleil": {display: "none"},
                    ".chakra-ui-dark & .icone-soleil": {display: "block"},
                    ".chakra-ui-dark & .icone-lune": {display: "none"},
                }}>
                    <Moon className="icone-lune" size={18} aria-hidden="true"/>
                    <Sun className="icone-soleil" size={18} aria-hidden="true"/>
                </Box>
            }
        />
    );
}

export default function Entete() {
    const {t, i18n} = useTranslation();
    const {profile, sections: ordre} = useDonnees();
    const sections = useMemo(() => [...(ordre ?? SECTIONS.slice(0, -1)), "contact"], [ordre]);
    const active = useSectionActive(sections);
    const menu = useDisclosure();
    const langue = i18n.language === "fr" ? "fr" : "en";

    const boutonCv = (props) => (
        <Button as="a" href={lienCv(langue)} target="_blank" rel="noopener noreferrer"
                onClick={() => suivreCv(langue)} leftIcon={<Download size={16} aria-hidden="true"/>} {...props}>
            {t("downloadCv")}
        </Button>
    );

    return (
        <Box as="header" position="sticky" top={0} zIndex={100} bg="chrome.bg" backdropFilter="saturate(180%) blur(12px)"
             borderBottom="1px solid" borderColor="line.subtle">
            <Container maxW={LARGEUR} px={MARGES}>
                <Flex h="64px" align="center" gap={4}>
                    <Link href="#haut" aria-label={t("nav.accueil")} fontFamily="heading" fontWeight="700"
                          fontSize="17px" color="fg.default" whiteSpace="nowrap" minH="44px" display="inline-flex"
                          alignItems="center" _hover={{color: "accent", textDecoration: "none"}}>
                        {profile.name}
                    </Link>

                    <Flex as="nav" aria-label={t("nav.principale")} display={{base: "none", xl: "flex"}} flex="1" justify="center">
                        {sections.map(id => <LienSection key={id} id={id} actif={active === id}/>)}
                    </Flex>

                    <Flex align="center" gap={1} ml="auto">
                        <BoutonTheme/>
                        <Button variant="discret" fontFamily="mono" fontSize="13px"
                                onClick={() => i18n.changeLanguage(langue === "fr" ? "en" : "fr")}
                                aria-label={t("langue.basculer")}>
                            {t("langue.code")}
                        </Button>
                        <Box display={{base: "none", md: "block"}} ml={2}>{boutonCv()}</Box>
                        <IconButton
                            display={{base: "inline-flex", xl: "none"}}
                            variant="discret"
                            icon={menu.isOpen ? <X size={20}/> : <Menu size={20}/>}
                            aria-label={menu.isOpen ? t("nav.fermerMenu") : t("nav.ouvrirMenu")}
                            aria-expanded={menu.isOpen}
                            aria-controls="menu-mobile"
                            onClick={menu.onToggle}
                        />
                    </Flex>
                </Flex>
            </Container>

            {menu.isOpen && (
                <Box id="menu-mobile" display={{xl: "none"}} borderTop="1px solid" borderColor="line.subtle" bg="canvas">
                    <Container maxW={LARGEUR} px={MARGES} py={4}>
                        <Flex as="nav" aria-label={t("nav.principale")} direction="column">
                            {sections.map(id => (
                                <LienSection key={id} id={id} actif={active === id} mobile onClick={menu.onClose}/>
                            ))}
                        </Flex>
                        <Box mt={4} display={{md: "none"}}>{boutonCv({w: "100%"})}</Box>
                    </Container>
                </Box>
            )}
        </Box>
    );
}

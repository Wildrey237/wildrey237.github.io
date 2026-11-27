'use client'

// Projets du CV :
// - en tete, un carrousel "Projets phares" (projets.phare) : defilement horizontal avec
//   scroll-snap, carte suivante a moitie visible, fleches precedent / suivant, doigt, trackpad et
//   clavier ; aucun defilement automatique ;
// - en dessous, "Voir les N projets" ouvre la grille complete avec les filtres.
// Toutes les cartes sont dans le HTML (lisibles sans JavaScript).
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    Box, Button, Flex, Grid, Heading, IconButton, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader,
    ModalOverlay, Text, useDisclosure,
} from "@chakra-ui/react";
import {ArrowUpRight, ChevronLeft, ChevronRight} from "lucide-react";
import {useTranslation} from "react-i18next";
import {useDonnees} from "../../data/DonneesContext";
import {APPARITION, Etiquette, Puces, Section, TexteRiche} from "./communs";

const FILTRES = ["tous", "ia-data", "systemes", "web", "personnel"];
const ECART = 16;

function correspond(projet, filtre) {
    if (filtre === "tous") return true;
    if (filtre === "personnel") return projet.personal;
    return projet.domain === filtre;
}

function CarteProjet({projet, onOuvrir, ...props}) {
    const {t} = useTranslation();
    return (
        <Box as="li" display="flex" flexDirection="column" bg="surface" border="1px solid" borderColor="line.strong"
             borderRadius="14px" p={5} _hover={{borderColor: "accent"}} {...props}>
            <Etiquette as="p">{projet.school}</Etiquette>
            <Heading as="h3" mt={2} fontSize="18px" lineHeight="1.35">{projet.title}</Heading>
            {/* Description complete dans le HTML, tronquee a l'ecran. */}
            <Text mt={2} fontSize="14px" lineHeight="1.6" color="fg.muted" noOfLines={3}>{projet.description}</Text>
            <Puces items={projet.tags.slice(0, 3)} mt={4}/>
            {/* Pousse le bouton en bas : boutons alignes d'une carte a l'autre. */}
            <Box flex="1" minH={5}/>
            <Button variant="contour" alignSelf="flex-start" onClick={() => onOuvrir(projet)} aria-haspopup="dialog"
                    aria-label={`${t("projects.seeProject")} – ${projet.title}`}>
                {t("projects.seeProject")}
            </Button>
        </Box>
    );
}

// Carrousel : 1,2 carte visible en mobile, 2,5 en tablette, 3,5 des 1440px, 4,5 des 1920px
// (la carte suivante reste a moitie visible).
function Carrousel({projets, onOuvrir}) {
    const {t} = useTranslation();
    const piste = useRef(null);
    const [bords, setBords] = useState({debut: true, fin: false});

    const mettreAJour = useCallback(() => {
        const el = piste.current;
        if (!el) return;
        setBords({debut: el.scrollLeft <= 2, fin: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2});
    }, []);
    useEffect(() => {
        mettreAJour();
        window.addEventListener("resize", mettreAJour);
        return () => window.removeEventListener("resize", mettreAJour);
    }, [mettreAJour]);

    // Une fleche avance d'une carte.
    const defiler = sens => {
        const el = piste.current;
        const carte = el?.querySelector("li");
        if (!el || !carte) return;
        el.scrollBy({left: sens * (carte.getBoundingClientRect().width + ECART), behavior: "smooth"});
    };

    return (
        <Box as="section" aria-labelledby="phares-titre" mb={12}>
            <Flex justify="space-between" align="center" mb={4} gap={3}>
                <Heading as="h3" id="phares-titre" fontSize={{base: "20px", md: "22px"}}>{t("projects.phares")}</Heading>
                <Flex gap={2}>
                    <IconButton variant="contour" icon={<ChevronLeft size={18}/>} aria-label={t("projects.precedent")}
                                aria-controls="phares-piste" isDisabled={bords.debut} onClick={() => defiler(-1)}/>
                    <IconButton variant="contour" icon={<ChevronRight size={18}/>} aria-label={t("projects.suivant")}
                                aria-controls="phares-piste" isDisabled={bords.fin} onClick={() => defiler(1)}/>
                </Flex>
            </Flex>
            {/* Piste focalisable : les fleches du clavier la font defiler. */}
            <Box as="ul" id="phares-piste" ref={piste} onScroll={mettreAJour} tabIndex={0} role="region"
                 aria-label={t("projects.phares")} listStyleType="none" p={0} m={0} pb={3}
                 display="flex" gap={`${ECART}px`} overflowX="auto" overscrollBehaviorX="contain"
                 _focusVisible={{outline: "2px solid", outlineColor: "accent", outlineOffset: "4px", borderRadius: "14px"}}
                 sx={{
                     scrollSnapType: "x mandatory",
                     scrollPaddingInline: "0px",
                     "--k": "1.2",
                     "@media (min-width: 768px)": {"--k": "2.5"},
                     "@media (min-width: 1440px)": {"--k": "3.5"},
                     "@media (min-width: 1920px)": {"--k": "4.5"},
                     "& > li": {
                         flex: `0 0 calc((100% - (var(--k) - 1) * ${ECART}px) / var(--k))`,
                         scrollSnapAlign: "start",
                     },
                 }}>
                {projets.map(p => <CarteProjet key={p.id ?? p.title} projet={p} onOuvrir={onOuvrir}/>)}
            </Box>
        </Box>
    );
}

export default function Projets() {
    const {t} = useTranslation();
    const {projects} = useDonnees();
    const [filtre, setFiltre] = useState("tous");
    const [ouverteListe, setOuverteListe] = useState(false);
    const [ouvert, setOuvert] = useState(null);
    const fenetre = useDisclosure();

    // Projets phares (6 a 8 choisis dans l'admin) ; a defaut, les 6 premiers.
    const phares = useMemo(() => {
        const choisis = projects.filter(p => p.featured);
        return choisis.length ? choisis : projects.slice(0, 6);
    }, [projects]);
    const filtres = useMemo(
        () => FILTRES.filter(f => f === "tous" || projects.some(p => correspond(p, f))),
        [projects],
    );
    const liste = useMemo(() => projects.filter(p => correspond(p, filtre)), [projects, filtre]);

    const ouvrir = projet => {
        setOuvert(projet);
        fenetre.onOpen();
    };

    return (
        <Section id="projets" titre={t("projects.title")} intro={t("projects.intro")}>
            <Carrousel projets={phares} onOuvrir={ouvrir}/>

            <Flex justify="center">
                <Button variant="contour" size="lg" onClick={() => setOuverteListe(v => !v)} aria-expanded={ouverteListe}
                        aria-controls="projets-liste">
                    {ouverteListe ? t("projects.masquer") : t("projects.seeAll", {count: projects.length})}
                </Button>
            </Flex>

            {/* Grille complete : dans le HTML, affichee a la demande. */}
            <Box id="projets-liste" display={ouverteListe ? "block" : "none"} mt={8}>
                <Flex role="group" aria-label={t("projects.filtres")} gap={2} wrap="wrap" mb={8}>
                    {filtres.map(f => {
                        const actif = filtre === f;
                        return (
                            <Button key={f} aria-pressed={actif} borderRadius="999px" fontSize="14px" fontWeight="600"
                                    variant={actif ? "plein" : "contour"} onClick={() => setFiltre(f)}>
                                {t(`projects.${f}`)}
                            </Button>
                        );
                    })}
                </Flex>
                {liste.length === 0 ? (
                    <Text color="fg.muted">{t("projects.aucun")}</Text>
                ) : (
                    <Grid as="ul" listStyleType="none" p={0} m={0} templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
                        {liste.map(p => <CarteProjet key={p.id ?? p.title} projet={p} onOuvrir={ouvrir} {...APPARITION}/>)}
                    </Grid>
                )}
            </Box>

            <Modal isOpen={fenetre.isOpen} onClose={fenetre.onClose} size="2xl" scrollBehavior="inside" isCentered>
                <ModalOverlay bg="blackAlpha.600"/>
                {ouvert && (
                    <ModalContent bg="surface" color="fg.default" borderRadius="16px" mx={4}>
                        <ModalHeader pr={14}>
                            <Etiquette as="p">{ouvert.school}</Etiquette>
                            <Heading as="h3" mt={2} fontSize="22px">{ouvert.title}</Heading>
                        </ModalHeader>
                        <ModalCloseButton aria-label={t("projects.fermer")} w="44px" h="44px" top={3} right={3}/>
                        <ModalBody pb={6}>
                            <TexteRiche texte={ouvert.description}/>
                            <Puces items={ouvert.tags} mt={5}/>
                            {ouvert.link && ouvert.link !== "#" && (
                                <Button as={Link} href={ouvert.link} isExternal mt={6} rightIcon={<ArrowUpRight size={16}/>}
                                        _hover={{textDecoration: "none", bg: "accent.hover"}}>
                                    {t("projects.lien")}
                                </Button>
                            )}
                        </ModalBody>
                    </ModalContent>
                )}
            </Modal>
        </Section>
    );
}

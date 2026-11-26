'use client'

// Projets du CV : filtres en pastilles, grille de cartes, 6 affiches puis "Voir les N projets".
// Toutes les cartes sont dans le HTML (lisibles sans JavaScript) ; celles au-dela de 6 sont
// seulement masquees a l'affichage tant que la liste n'est pas depliee.
import {useMemo, useState} from "react";
import {
    Box, Button, Flex, Grid, Heading, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader,
    ModalOverlay, Text, useDisclosure,
} from "@chakra-ui/react";
import {ArrowUpRight} from "lucide-react";
import {useTranslation} from "react-i18next";
import {useDonnees} from "../../data/DonneesContext";
import {Etiquette, Puces, Section, TexteRiche} from "./communs";

const FILTRES = ["tous", "ia-data", "systemes", "web", "personnel"];
const VISIBLES = 6;

function correspond(projet, filtre) {
    if (filtre === "tous") return true;
    if (filtre === "personnel") return projet.personal;
    return projet.domain === filtre;
}

function CarteProjet({projet, masquee, onOuvrir}) {
    const {t} = useTranslation();
    return (
        <Box as="li" display={masquee ? "none" : "flex"} flexDirection="column" bg="surface" border="1px solid"
             borderColor="line.strong" borderRadius="14px" p={5} transition="border-color .15s ease"
             _hover={{borderColor: "accent"}}>
            <Etiquette as="p">{projet.school}</Etiquette>
            <Heading as="h3" mt={2} fontSize="18px" lineHeight="1.35">{projet.title}</Heading>
            {/* Description complete dans le HTML, tronquee a l'ecran. */}
            <Text mt={2} fontSize="14px" lineHeight="1.6" color="fg.muted" noOfLines={3}>{projet.description}</Text>
            <Puces items={projet.tags.slice(0, 3)} mt={4}/>
            {/* Pousse le bouton en bas : boutons alignes d'une carte a l'autre. */}
            <Box flex="1" minH={5}/>
            <Button variant="contour" alignSelf="flex-start" onClick={() => onOuvrir(projet)}
                    aria-haspopup="dialog"
                    aria-label={`${t("projects.seeProject")} – ${projet.title}`}>
                {t("projects.seeProject")}
            </Button>
        </Box>
    );
}

export default function Projets() {
    const {t} = useTranslation();
    const {projects} = useDonnees();
    const [filtre, setFiltre] = useState("tous");
    const [tout, setTout] = useState(false);
    const [ouvert, setOuvert] = useState(null);
    const fenetre = useDisclosure();

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
            <Flex role="group" aria-label={t("projects.filtres")} gap={2} wrap="wrap" mb={8}>
                {filtres.map(f => {
                    const actif = filtre === f;
                    return (
                        <Button key={f} aria-pressed={actif} borderRadius="999px" fontSize="14px" fontWeight="600"
                                variant={actif ? "plein" : "contour"}
                                onClick={() => {
                                    setFiltre(f);
                                    setTout(false);
                                }}>
                            {t(`projects.${f}`)}
                        </Button>
                    );
                })}
            </Flex>

            {liste.length === 0 ? (
                <Text color="fg.muted">{t("projects.aucun")}</Text>
            ) : (
                <Grid as="ul" listStyleType="none" p={0} m={0} templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
                    {liste.map((p, i) => (
                        <CarteProjet key={p.id ?? p.title} projet={p} masquee={!tout && i >= VISIBLES} onOuvrir={ouvrir}/>
                    ))}
                </Grid>
            )}

            {liste.length > VISIBLES && (
                <Flex justify="center" mt={8}>
                    <Button variant="contour" size="lg" onClick={() => setTout(v => !v)} aria-expanded={tout}>
                        {tout ? t("projects.seeLess") : t("projects.seeAll", {count: liste.length})}
                    </Button>
                </Flex>
            )}

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

// Elements partages de la page parcours : couleurs, style des cartes selon leur statut, pastille de
// statut, legende et roles de surbrillance (noeud selectionne, amont, aval, reste).
import {Box, Flex} from "@chakra-ui/react";
import {BANDES_CARTE} from "../../lib/parcours/modele";

export const ETIQUETTES = {"en-cours": "Tu es ici", ensuite: "Ensuite", maitrise: "Maîtrisé"};
export const LIBELLES_STATUT = {"en-cours": "En cours", ensuite: "Ensuite", "plus-tard": "Plus tard", maitrise: "Maîtrisé"};

// Couleurs des etats et de la surbrillance.
export const JAUNE = {fond: "#FDF0D5", bord: "#E2A42E", halo: "rgba(226,164,46,0.22)"};
export const VERT = "#1D8A55";
export const AMBRE = "#E2A42E";                        // liens et noeuds en amont (prerequis)
export const ACCENT = "var(--chakra-colors-accent)";   // liens et noeuds en aval (ce que le noeud debloque)
export const NOM_BANDE = Object.fromEntries(BANDES_CARTE.map(b => [b.id, b]));

export function styleCarte(statut, estProjet, selection, fantome) {
    const base = {
        "en-cours": {bg: JAUNE.fond, color: "#15161A", border: `2px solid ${JAUNE.bord}`, boxShadow: `0 0 0 5px ${JAUNE.halo}`},
        ensuite: {bg: "surface", color: "fg.default", border: "2px solid", borderColor: "accent"},
        "plus-tard": {bg: "plustard.bg", color: "plustard.fg", border: "1px solid", borderColor: "plustard.bord"},
        maitrise: {bg: "surface", color: "fg.default", border: `2px solid ${VERT}`},
    }[statut];
    return {
        ...base,
        // Projet d'apprentissage ou prerequis fantome (autre bande) : bordure pointillee.
        borderStyle: estProjet || fantome ? "dashed" : "solid",
        ...(fantome ? {opacity: 0.35, boxShadow: "none"} : {}),
        ...(selection ? {outline: "3px solid", outlineColor: "accent", outlineOffset: "3px"} : {outline: "0"}),
    };
}

export function Pastille({statut}) {
    const couleurs = {
        "en-cours": {bg: JAUNE.fond, color: "#7A5207", borderColor: JAUNE.bord},
        ensuite: {bg: "chip.bg", color: "chip.fg", borderColor: "accent"},
        "plus-tard": {bg: "plustard.bg", color: "plustard.fg", borderColor: "plustard.bord"},
        maitrise: {bg: "success.bg", color: "success.fg", borderColor: VERT},
    }[statut];
    return (
        <Box as="span" display="inline-block" px={2} py="1px" fontSize="12px" fontWeight="600" borderRadius="999px"
             border="1px solid" {...couleurs}>
            {LIBELLES_STATUT[statut]}
        </Box>
    );
}

export function Legende() {
    return (
        <Box fontSize="12px" color="fg.muted">
            <Flex gap={2} wrap="wrap" align="center">
                {["en-cours", "ensuite", "plus-tard", "maitrise"].map(s => <Pastille key={s} statut={s}/>)}
                <Box as="span" px={2} py="1px" border="1px dashed" borderColor="fg.faint" borderRadius="6px">projet d’apprentissage</Box>
            </Flex>
            <Flex gap={4} wrap="wrap" align="center" mt={2}>
                <Flex as="span" align="center" gap={2}><Box as="span" w="16px" h="3px" bg={AMBRE} borderRadius="2px"/>prérequis</Flex>
                <Flex as="span" align="center" gap={2}><Box as="span" w="16px" h="3px" bg="accent" borderRadius="2px"/>débloque</Flex>
                <Flex as="span" align="center" gap={2}><Box as="span" w="16px" borderTop="2px dashed" borderColor="fg.faint"/>prérequis externe</Flex>
            </Flex>
        </Box>
    );
}

// Role d'un noeud ou d'un lien dans la surbrillance courante.
export function roleNoeud(id, focus) {
    if (!focus) return null;
    if (id === focus.id) return "centre";
    if (focus.amont.has(id)) return "amont";
    if (focus.aval.has(id)) return "aval";
    return "autre";
}
export function roleLien({source, target}, focus) {
    if (!focus) return null;
    const {id, amont, aval} = focus;
    if ((target === id || amont.has(target)) && amont.has(source)) return "amont";
    if ((source === id || aval.has(source)) && aval.has(target)) return "aval";
    return "autre";
}

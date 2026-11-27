'use client'

// Parcours (/parcours) : public mais non reference (noindex, hors sitemap et hors menu).
// Avancement par rail, carte en graphe sur les bandes d'origine (vue "Autour de moi" ou carte
// complete), filtre par bande, surbrillance des connexions au clic (et au survol, en plus leger),
// fiche du noeud en panneau lateral (feuille en bas sur mobile). Etat dans l'URL :
// ?bandes=math,ml&noeud=ml1. Le changement d'etat est reserve a la session admin (401 sinon).
// Les projets de la carte sont des projets d'apprentissage, sans lien avec ceux du CV.
//
// Ordinateur (>= 1024px) : plein ecran. La page ne defile pas ; la carte occupe toute la place
// sous l'en-tete et la bande des rails, et se deplace (glisser) et se zoome (molette, pincement,
// boutons, 50 % a 200 %). Controles en surimpression. Mobile : liste par bande, sans pan/zoom.
import {memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition} from "react";
import {Box, Button, Checkbox, CloseButton, Flex, Heading, Link, Text} from "@chakra-ui/react";
import NextLink from "next/link";
import {
    BANDES_CARTE, RAILS, autourDeMoi, avancement, construireModele, decouperTitre, filtrerParBandes, noeudsDuRail,
    voisinage,
} from "../../lib/parcours/modele";
import {CARTE, disposer, disposerAutour} from "../../lib/parcours/disposition";

const ETATS = [
    {valeur: "non commence", libelle: "Non commencé"},
    {valeur: "en cours", libelle: "En cours"},
    {valeur: "maitrise", libelle: "Maîtrisé"},
];
const ETIQUETTES = {"en-cours": "Tu es ici", ensuite: "Ensuite", maitrise: "Maîtrisé"};
const LIBELLES_STATUT = {"en-cours": "En cours", ensuite: "Ensuite", "plus-tard": "Plus tard", maitrise: "Maîtrisé"};

// Couleurs des etats et de la surbrillance.
const JAUNE = {fond: "#FDF0D5", bord: "#E2A42E", halo: "rgba(226,164,46,0.22)"};
const VERT = "#1D8A55";
const AMBRE = "#E2A42E";                 // liens et noeuds en amont (prerequis)
const ACCENT = "var(--chakra-colors-accent)"; // liens et noeuds en aval (ce que le noeud debloque)
const LARGEUR_PANNEAU = 400;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2;
const ZOOM_CADRAGE_MAX = 1.25; // cadrage automatique : pas de gros plan demesure sur 2 ou 3 noeuds
const MARGE_ZONE = 12;         // marge entre les controles en surimpression et les noeuds cadres
// Fond des controles en surimpression : semi-opaque, flou derriere.
const VERRE = {
    bg: "color-mix(in srgb, var(--chakra-colors-surface) 84%, transparent)",
    backdropFilter: "blur(10px)", border: "1px solid", borderColor: "line.strong", borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(21,22,26,.08)",
};
const borner = (v, min, max) => Math.min(max, Math.max(min, v));

const BANDES_DU_RAIL = Object.fromEntries(RAILS.map(r => [r.id, r.bandes]));
const NOM_BANDE = Object.fromEntries(BANDES_CARTE.map(b => [b.id, b]));
const memesBandes = (a, b) => a.length === b.length && a.every(x => b.includes(x));

function styleCarte(statut, estProjet, selection, fantome) {
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

function Pastille({statut}) {
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

// Role d'un noeud ou d'un lien dans la surbrillance courante.
function roleNoeud(id, focus) {
    if (!focus) return null;
    if (id === focus.id) return "centre";
    if (focus.amont.has(id)) return "amont";
    if (focus.aval.has(id)) return "aval";
    return "autre";
}
function roleLien(a, focus) {
    if (!focus) return null;
    const {id, amont, aval} = focus;
    if ((a.vers === id || amont.has(a.vers)) && amont.has(a.de)) return "amont";
    if ((a.de === id || aval.has(a.de)) && aval.has(a.vers)) return "aval";
    return "autre";
}

// ---------- graphe ----------

// Contenu de la carte a sa taille naturelle (le cadre l'agrandit / le deplace par transform).
// Memorise : deplacer ou zoomer ne redessine pas les 74 noeuds.
const Graphe = memo(function Graphe({modele, disposition: d, selection, focus, choisir, survoler}) {
    const chemin = pts => pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
    const attenuation = focus ? (focus.leger ? 0.45 : 0.2) : null;
    return (
            <Box position="relative" w={`${d.largeur}px`} h={`${d.hauteur}px`}>
                {d.bandes.map(b => (
                    <Box key={b.bande} data-bande={b.bande} position="absolute" left={0} top={`${b.y}px`} w="100%" h={`${b.hauteur}px`}
                         borderTop="1px solid" borderColor="line.subtle" borderLeft="4px solid" borderLeftColor={`bande.${b.bande}`}
                         opacity={b.fantome ? 0.6 : 1}>
                        <Text display="inline-block" mt={2} ml={4} fontFamily="mono"
                              fontSize="12px" letterSpacing="0.08em" textTransform="uppercase" color={`bande.${b.bande}`} fontWeight="600">
                            {b.fantome ? `Prérequis externes · ${b.nom}` : b.nom}
                        </Text>
                    </Box>
                ))}
                <svg width={d.largeur} height={d.hauteur} style={{position: "absolute", inset: 0}} aria-hidden="true">
                    <defs>
                        {[["gris", "var(--chakra-colors-fg-faint)"], ["accent", ACCENT], ["ambre", AMBRE]].map(([c, couleur]) => (
                            <marker key={c} id={`fleche-${c}`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6"
                                    markerHeight="6" orient="auto">
                                <path d="M0,0 L8,4 L0,8 z" fill={couleur}/>
                            </marker>
                        ))}
                    </defs>
                    {/* Liens en surbrillance dessines en dernier (au-dessus des autres). */}
                    {[...d.aretes].sort((a, b) => Number(roleLien(a, focus) !== "autre") - Number(roleLien(b, focus) !== "autre")).map(a => {
                        const role = roleLien(a, focus);
                        const allume = role === "amont" || role === "aval";
                        const couleur = role === "amont" ? AMBRE : role === "aval" ? ACCENT
                            : a.accent ? ACCENT : "var(--chakra-colors-line-strong)";
                        const opacite = role === "autre" ? attenuation : allume ? 1 : a.attenue ? 0.35 : 1;
                        return (
                            <path key={a.cle} data-lien={a.cle} data-role={role ?? undefined} d={chemin(a.points)} fill="none"
                                  opacity={opacite} strokeDasharray={a.fantome && !allume ? "4 4" : undefined} stroke={couleur}
                                  strokeWidth={allume ? (focus.leger ? 2.5 : 3) : a.accent ? 2 : 1.5} strokeLinejoin="round"
                                  style={allume && !focus.leger ? {filter: `drop-shadow(0 0 3px ${role === "amont" ? "rgba(226,164,46,.6)" : "rgba(31,63,209,.45)"})`} : undefined}
                                  markerEnd={`url(#fleche-${role === "amont" ? "ambre" : allume || a.accent ? "accent" : "gris"})`}/>
                        );
                    })}
                </svg>
                {d.cartes.map(c => {
                    const n = modele.parId.get(c.id);
                    const {code, nom} = decouperTitre(n.titre);
                    const estProjet = n.bande === "proj";
                    const role = roleNoeud(c.id, focus);
                    const surbrillance = role === "amont" ? {borderColor: AMBRE, borderStyle: "solid", opacity: 1}
                        : role === "aval" ? {borderColor: "accent", borderStyle: "solid", opacity: 1}
                            : role === "autre" ? {opacity: attenuation} : {};
                    return (
                        <Box key={c.cle} as="button" type="button" data-noeud={c.id} data-fantome={c.fantome ? "" : undefined}
                             data-role={role ?? undefined}
                             onClick={() => choisir(c.id)} onMouseEnter={() => survoler(c.id)} onMouseLeave={() => survoler(null)}
                             aria-pressed={selection === c.id}
                             aria-label={`${n.titre} – ${LIBELLES_STATUT[c.statut]}${estProjet ? ", projet d’apprentissage" : ""}${c.fantome ? `, prérequis externe (${NOM_BANDE[n.bande].nom})` : ""}`}
                             position="absolute" left={`${c.x}px`} top={`${c.y}px`} w={`${CARTE.largeur}px`}
                             h={`${c.h}px`} borderRadius="10px" px={3} py={2} textAlign="left" overflow="hidden"
                             borderLeftWidth="4px" borderLeftColor={`bande.${n.bande}`}
                             transition="opacity .15s ease, transform .12s ease" _hover={{transform: "translateY(-1px)"}}
                             {...styleCarte(c.statut, estProjet, selection === c.id, c.fantome)} {...surbrillance}
                             borderWidth={role === "amont" || role === "aval" ? "2px" : undefined}>
                            <Flex justify="space-between" align="center" gap={2}>
                                <Text as="span" fontFamily="mono" fontSize="11px" fontWeight="600" opacity={0.8}>
                                    {code}{estProjet && " · projet"}
                                </Text>
                                {ETIQUETTES[c.statut] && !c.fantome && (
                                    <Text as="span" fontSize="10px" fontWeight="700" textTransform="uppercase" letterSpacing="0.04em"
                                          color={c.statut === "en-cours" ? "#7A5207" : c.statut === "maitrise" ? "success.fg" : "accent"}>
                                        {ETIQUETTES[c.statut]}
                                    </Text>
                                )}
                            </Flex>
                            {/* Titre entier, jamais tronque (la carte est dimensionnee pour 2 lignes). */}
                            <Text as="span" data-titre="" display="block" mt="2px" fontSize="13px" fontWeight="600" lineHeight="1.3">
                                {nom}
                            </Text>
                        </Box>
                    );
                })}
            </Box>
    );
});

// ---------- filtre par bande ----------

function FiltreBandes({bandes, basculer, tout, externes, setExternes}) {
    const pastille = (actif, libelle, onClick, couleur) => (
        <Button key={libelle} variant="unstyled" onClick={onClick} aria-pressed={actif} display="inline-flex" alignItems="center"
                gap={2} h={{base: "44px", lg: "36px"}} px={{base: 4, lg: 3}} borderRadius="999px" border="1px solid"
                fontSize={{base: "14px", lg: "13px"}} fontWeight="600"
                borderColor={actif ? (couleur ?? "accent") : "line.strong"} bg={actif ? "chip.bg" : "transparent"}
                color={actif ? "fg.default" : "fg.muted"}>
            {couleur && <Box as="span" w="10px" h="10px" borderRadius="full" bg={couleur} aria-hidden="true"/>}
            {libelle}
        </Button>
    );
    return (
        <Flex gap={{base: 4, lg: 3}} wrap="wrap" align="center">
            <Flex role="group" aria-label="Filtrer la carte par bande" gap={{base: 2, lg: "6px"}} wrap="wrap">
                {pastille(bandes.length === 0, "Tout", tout)}
                {BANDES_CARTE.map(b => pastille(bandes.includes(b.id), b.court, () => basculer(b.id), `bande.${b.id}`))}
            </Flex>
            {/* Decochee par defaut : les autres bandes disparaissent completement. */}
            <Checkbox isChecked={externes} onChange={e => setExternes(e.target.checked)} isDisabled={!bandes.length}
                      minH={{base: "44px", lg: "36px"}} colorScheme="brand" fontSize="14px">
                Afficher les prérequis externes
            </Checkbox>
        </Flex>
    );
}

// ---------- liste par bande (mobile, vue "Autour de moi") ----------

function ListeParBande({modele, ids, choisir, selection}) {
    const ordreStatut = {"en-cours": 0, ensuite: 1, maitrise: 2, "plus-tard": 3};
    return (
        <Box>
            {BANDES_CARTE.map(b => {
                const membres = ids.filter(id => modele.parId.get(id).bande === b.id)
                    .sort((x, y) => ordreStatut[modele.statuts.get(x)] - ordreStatut[modele.statuts.get(y)] || modele.ordre(x, y));
                if (!membres.length) return null;
                return (
                    <Box key={b.id} as="section" mb={6} data-liste-bande={b.id}>
                        <Heading as="h3" fontSize="15px" mb={2} color={`bande.${b.id}`}>{b.nom}</Heading>
                        <Box as="ul" listStyleType="none" p={0} m={0}>
                            {membres.map(id => {
                                const n = modele.parId.get(id);
                                const statut = modele.statuts.get(id);
                                return (
                                    <Box as="li" key={id} mb={2}>
                                        <Box as="button" type="button" data-noeud={id} onClick={() => choisir(id)} w="100%" minH="56px"
                                             textAlign="left" px={3} py={2} borderRadius="10px" aria-pressed={selection === id}
                                             borderLeftWidth="4px" borderLeftColor={`bande.${b.id}`}
                                             {...styleCarte(statut, n.bande === "proj", selection === id, false)}>
                                            <Flex justify="space-between" gap={2} align="center">
                                                <Text as="span" fontSize="14px" fontWeight="600">{n.titre}</Text>
                                                <Pastille statut={statut}/>
                                            </Flex>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
}

// ---------- panneau lateral (fiche du noeud) ----------

function LienNoeud({id, modele, choisir}) {
    const n = modele.parId.get(id);
    if (!n) return null;
    return (
        <Box as="li" mb={1}>
            <Box as="button" type="button" onClick={() => choisir(id, {garder: true})} display="flex" alignItems="center" gap={2}
                 minH="40px" textAlign="left" color="fg.default" _hover={{color: "accent"}}>
                <Pastille statut={modele.statuts.get(id)}/>
                <Text as="span" fontSize="14px">{n.titre}</Text>
            </Box>
        </Box>
    );
}

function Panneau({modele, id, ouvert, fermer, choisir, changerEtat, enCours, message, estAdmin, chaine, setChaine}) {
    const titre = useRef(null);
    const n = modele.parId.get(id);
    // A l'ouverture, le focus va au titre de la fiche (lecteurs d'ecran, clavier).
    useEffect(() => {
        if (ouvert) titre.current?.focus({preventScroll: true});
    }, [ouvert, id]);
    const statut = n && modele.statuts.get(id);
    const {code, nom} = n ? decouperTitre(n.titre) : {};
    const projetsLies = n ? [...modele.successeurs.get(id)].filter(s => modele.parId.get(s).bande === "proj").sort(modele.ordre) : [];
    return (
        <Box as="aside" aria-labelledby="fiche-titre" aria-hidden={!ouvert} data-panneau="" data-ouvert={ouvert ? "" : undefined}
             position="fixed" zIndex={50} bg="surface" borderColor="line.strong" boxShadow="0 10px 40px rgba(21,22,26,.18)"
             transition="transform .2s ease" visibility={ouvert ? "visible" : "hidden"}
             // Ordinateur : panneau a droite, pleine hauteur. Mobile : feuille qui monte du bas (80 %).
             top={{base: "auto", lg: 0}} bottom={0} right={0} left={{base: 0, lg: "auto"}}
             w={{base: "100%", lg: `${LARGEUR_PANNEAU}px`}} h={{base: "80dvh", lg: "100dvh"}}
             borderLeft={{lg: "1px solid"}} borderTop={{base: "1px solid", lg: "none"}}
             borderTopRadius={{base: "18px", lg: 0}}
             transform={ouvert ? "translate(0, 0)" : {base: "translateY(100%)", lg: "translateX(100%)"}}
             display="flex" flexDirection="column">
            {n && (
                <>
                    <Flex justify="space-between" align="flex-start" gap={3} p={5} pb={3} borderBottom="1px solid" borderColor="line.subtle">
                        <Box minW={0}>
                            <Text fontFamily="mono" fontSize="12px" color={`bande.${n.bande}`} fontWeight="600" textTransform="uppercase" letterSpacing="0.08em">
                                {code} · {NOM_BANDE[n.bande].nom}
                            </Text>
                            <Heading as="h2" id="fiche-titre" ref={titre} tabIndex={-1} fontSize="20px" mt={1} _focus={{outline: "none"}}>{nom}</Heading>
                            <Box mt={2}><Pastille statut={statut}/></Box>
                        </Box>
                        <CloseButton size="lg" w="44px" h="44px" onClick={fermer} aria-label="Fermer la fiche"/>
                    </Flex>
                    <Box p={5} overflowY="auto" flex="1">
                        {/* Changement d'etat : session admin uniquement. */}
                        {estAdmin && (
                            <Box mb={5}>
                                <Box role="group" aria-label="État du nœud" display="inline-flex" border="1px solid"
                                     borderColor="line.strong" borderRadius="10px" overflow="hidden">
                                    {ETATS.map((e, i) => {
                                        const actif = n.etat === e.valeur;
                                        return (
                                            <Button key={e.valeur} variant="unstyled" h="44px" px={3} borderRadius={0} fontSize="14px"
                                                    fontWeight="600" aria-pressed={actif} isDisabled={enCours}
                                                    borderLeft={i ? "1px solid" : "none"} borderColor="line.strong"
                                                    bg={actif ? "accent" : "transparent"} color={actif ? "accent.contrast" : "fg.muted"}
                                                    _hover={actif ? {} : {bg: "chip.bg", color: "accent"}}
                                                    onClick={() => !actif && changerEtat(id, e.valeur)}>
                                                {e.libelle}
                                            </Button>
                                        );
                                    })}
                                </Box>
                                <Text role="status" aria-live="polite" fontSize="13px" color="fg.faint" mt={2} minH="20px">{message}</Text>
                            </Box>
                        )}
                        <Checkbox isChecked={chaine} onChange={e => setChaine(e.target.checked)} minH="44px" colorScheme="brand">
                            Chaîne complète (tous les prérequis en amont et tout ce qui est débloqué en aval)
                        </Checkbox>

                        <Heading as="h3" fontSize="14px" mt={5} mb={2} display="flex" alignItems="center" gap={2}>
                            <Box as="span" w="12px" h="3px" bg={AMBRE} borderRadius="2px" aria-hidden="true"/>Prérequis
                        </Heading>
                        {n.prerequis.length ? (
                            <Box as="ul" listStyleType="none" p={0} m={0}>
                                {n.prerequis.map(p => <LienNoeud key={p} id={p} modele={modele} choisir={choisir}/>)}
                            </Box>
                        ) : <Text fontSize="14px" color="fg.faint">Aucun : point d’entrée.</Text>}

                        <Heading as="h3" fontSize="14px" mt={5} mb={2} display="flex" alignItems="center" gap={2}>
                            <Box as="span" w="12px" h="3px" bg="accent" borderRadius="2px" aria-hidden="true"/>Débloque
                        </Heading>
                        {modele.successeurs.get(id).length ? (
                            <Box as="ul" listStyleType="none" p={0} m={0}>
                                {[...modele.successeurs.get(id)].sort(modele.ordre).map(s => <LienNoeud key={s} id={s} modele={modele} choisir={choisir}/>)}
                            </Box>
                        ) : <Text fontSize="14px" color="fg.faint">Rien : fin de chemin.</Text>}

                        {n.notions.length > 0 && (
                            <Box mt={5}>
                                <Heading as="h3" fontSize="14px" mb={2}>Notions</Heading>
                                <Flex as="ul" listStyleType="none" p={0} m={0} wrap="wrap" gap={2}>
                                    {n.notions.map(x => (
                                        <Box as="li" key={x} bg="chip.bg" color="chip.fg" px="10px" py="4px" borderRadius="6px" fontSize="13px">{x}</Box>
                                    ))}
                                </Flex>
                            </Box>
                        )}
                        {(projetsLies.length > 0 || n.livrables.length > 0) && (
                            <Box mt={5}>
                                <Heading as="h3" fontSize="14px" mb={2}>Projets liés</Heading>
                                {projetsLies.length > 0 && (
                                    <Box as="ul" listStyleType="none" p={0} m={0}>
                                        {projetsLies.map(p => <LienNoeud key={p} id={p} modele={modele} choisir={choisir}/>)}
                                    </Box>
                                )}
                                {n.livrables.length > 0 && (
                                    <Box as="ul" pl={5} mt={2} fontSize="14px" color="fg.muted">
                                        {n.livrables.map(l => <li key={l.nom}><strong>{l.nom}</strong> – {l.detail}</li>)}
                                    </Box>
                                )}
                            </Box>
                        )}
                        {n.etatModifieLe && (
                            <Text mt={5} fontSize="12px" color="fg.faint">
                                État modifié le {new Date(n.etatModifieLe).toLocaleDateString("fr-FR", {day: "numeric", month: "long", year: "numeric"})}
                            </Text>
                        )}
                    </Box>
                </>
            )}
        </Box>
    );
}

// ---------- deplacement et zoom de la carte (ordinateur) ----------

// Rectangle englobant des cartes dont l'id est dans `ids` (toutes si ids est absent).
function englobant(disposition, ids) {
    const cartes = disposition.cartes.filter(c => !ids || ids.has(c.id));
    if (!cartes.length) return null;
    return {
        x0: Math.min(...cartes.map(c => c.x)), y0: Math.min(...cartes.map(c => c.y)),
        x1: Math.max(...cartes.map(c => c.x + CARTE.largeur)), y1: Math.max(...cartes.map(c => c.y + c.h)),
    };
}

// Transformation {x, y, k} du contenu dans le cadre : glisser, molette, pincement, boutons.
// `zone()` donne la partie du cadre non couverte par les controles en surimpression.
function usePanZoom(cadreRef, taille, zone) {
    const [t, setT] = useState({x: 0, y: 0, k: 1});
    const [anime, setAnime] = useState(false);

    // Le contenu ne sort jamais entierement du cadre (80px restent visibles).
    const limiter = useCallback(({x, y, k}) => {
        const el = cadreRef.current;
        if (!el) return {x, y, k};
        const m = 80;
        return {k, x: borner(x, m - taille.largeur * k, el.clientWidth - m), y: borner(y, m - taille.hauteur * k, el.clientHeight - m)};
    }, [cadreRef, taille.largeur, taille.hauteur]);

    const appliquer = useCallback((suivant, animer = false) => {
        setAnime(animer);
        setT(c => limiter(typeof suivant === "function" ? suivant(c) : suivant));
    }, [limiter]);

    // Zoom autour d'un point du cadre (px, py), qui reste fixe a l'ecran.
    const zoomer = useCallback((facteur, px, py, animer = false) => appliquer(c => {
        const k = borner(c.k * facteur, ZOOM_MIN, ZOOM_MAX);
        return {k, x: px - ((px - c.x) * k) / c.k, y: py - ((py - c.y) * k) / c.k};
    }, animer), [appliquer]);

    const zoomerCentre = useCallback(facteur => {
        const z = zone();
        if (z) zoomer(facteur, z.gauche + z.l / 2, z.haut + z.h / 2, true);
    }, [zone, zoomer]);

    // Cadre un rectangle du contenu dans la zone libre. Trop grand meme a 50 % : aligne en haut a
    // gauche (sens de lecture), sinon centre.
    const cadrer = useCallback((r, {kMax = ZOOM_CADRAGE_MAX, animer = true} = {}) => {
        const z = zone();
        if (!z || !r) return;
        const pad = 24;
        const bw = r.x1 - r.x0 + 2 * pad, bh = r.y1 - r.y0 + 2 * pad;
        const k = borner(Math.min(z.l / bw, z.h / bh, kMax), ZOOM_MIN, ZOOM_MAX);
        const x = z.gauche + Math.max((z.l - bw * k) / 2, 0) - (r.x0 - pad) * k;
        const y = z.haut + Math.max((z.h - bh * k) / 2, 0) - (r.y0 - pad) * k;
        appliquer({x, y, k}, animer);
    }, [zone, appliquer]);

    // Garde un rectangle visible dans la zone libre (sans changer le zoom) : recentre s'il en sort.
    const montrer = useCallback(r => {
        if (!r) return;
        appliquer(c => {
            const z = zone();
            if (!z) return c;
            const sx0 = r.x0 * c.k + c.x, sx1 = r.x1 * c.k + c.x, sy0 = r.y0 * c.k + c.y, sy1 = r.y1 * c.k + c.y;
            const dedans = sx0 >= z.gauche && sx1 <= z.gauche + z.l && sy0 >= z.haut && sy1 <= z.haut + z.h;
            if (dedans) return c;
            return {
                k: c.k,
                x: z.gauche + z.l / 2 - ((r.x0 + r.x1) / 2) * c.k,
                y: z.haut + z.h / 2 - ((r.y0 + r.y1) / 2) * c.k,
            };
        }, true);
    }, [zone, appliquer]);

    // Gestes : glisser (souris, doigt, stylet), pincement a deux doigts, molette / pave tactile.
    const gestes = useRef({});
    gestes.current = {appliquer, zoomer};
    useEffect(() => {
        const el = cadreRef.current;
        if (!el) return undefined;
        const pointeurs = new Map();
        let glisse = false, depart = null, pincement = null, ignorerClic = false;
        const pos = e => {
            const r = el.getBoundingClientRect();
            return {x: e.clientX - r.left, y: e.clientY - r.top};
        };
        const mesure = () => {
            const [a, b] = [...pointeurs.values()];
            return {d: Math.hypot(a.x - b.x, a.y - b.y) || 1, c: {x: (a.x + b.x) / 2, y: (a.y + b.y) / 2}};
        };
        const bas = e => {
            if (e.pointerType === "mouse" && e.button !== 0) return;
            ignorerClic = false;
            pointeurs.set(e.pointerId, pos(e));
            if (pointeurs.size === 1) {
                depart = pos(e);
                glisse = false;
            } else if (pointeurs.size === 2) {
                pincement = mesure();
                glisse = true;
            }
        };
        const deplacement = e => {
            if (!pointeurs.has(e.pointerId)) return;
            const p = pos(e), avant = pointeurs.get(e.pointerId);
            pointeurs.set(e.pointerId, p);
            if (pointeurs.size === 1) {
                // Seuil de 4px : en dessous, c'est un clic (selection d'un noeud).
                if (!glisse && Math.hypot(p.x - depart.x, p.y - depart.y) > 4) {
                    glisse = true;
                    el.setPointerCapture?.(e.pointerId);
                }
                if (glisse) gestes.current.appliquer(c => ({...c, x: c.x + p.x - avant.x, y: c.y + p.y - avant.y}));
            } else if (pointeurs.size === 2 && pincement) {
                const m = mesure(), prec = pincement;
                pincement = m;
                gestes.current.appliquer(c => {
                    const k = borner((c.k * m.d) / prec.d, ZOOM_MIN, ZOOM_MAX);
                    return {k, x: m.c.x - ((prec.c.x - c.x) * k) / c.k, y: m.c.y - ((prec.c.y - c.y) * k) / c.k};
                });
            }
        };
        const haut = e => {
            if (!pointeurs.delete(e.pointerId)) return;
            if (pointeurs.size < 2) pincement = null;
            if (pointeurs.size === 1) depart = [...pointeurs.values()][0];
            if (!pointeurs.size && glisse) ignorerClic = true;
        };
        // Apres un glisser, le clic qui suit n'est pas une selection.
        const clic = e => {
            if (!ignorerClic) return;
            ignorerClic = false;
            e.stopPropagation();
            e.preventDefault();
        };
        const molette = e => {
            e.preventDefault();
            const unite = e.deltaMode === 1 ? 16 : 1;
            // Pincement sur pave tactile = molette avec ctrlKey (pas plus fins).
            const facteur = Math.exp(-e.deltaY * unite * (e.ctrlKey ? 0.01 : 0.0015));
            const p = pos(e);
            gestes.current.zoomer(facteur, p.x, p.y);
        };
        // Focus clavier sur un noeud hors champ : le navigateur fait defiler le cadre ; on convertit
        // ce defilement en deplacement de la carte.
        const defilement = () => {
            const {scrollLeft: sl, scrollTop: st} = el;
            if (!sl && !st) return;
            el.scrollLeft = 0;
            el.scrollTop = 0;
            gestes.current.appliquer(c => ({...c, x: c.x - sl, y: c.y - st}));
        };
        el.addEventListener("pointerdown", bas);
        el.addEventListener("pointermove", deplacement);
        el.addEventListener("pointerup", haut);
        el.addEventListener("pointercancel", haut);
        el.addEventListener("click", clic, true);
        el.addEventListener("wheel", molette, {passive: false});
        el.addEventListener("scroll", defilement);
        return () => {
            el.removeEventListener("pointerdown", bas);
            el.removeEventListener("pointermove", deplacement);
            el.removeEventListener("pointerup", haut);
            el.removeEventListener("pointercancel", haut);
            el.removeEventListener("click", clic, true);
            el.removeEventListener("wheel", molette);
            el.removeEventListener("scroll", defilement);
        };
    }, [cadreRef]);

    return {t, anime, cadrer, montrer, zoomerCentre};
}

// Taille courante d'un element (ResizeObserver).
function useTaille(ref) {
    const [taille, setTaille] = useState({l: 0, h: 0});
    useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        const ro = new ResizeObserver(([e]) => setTaille({l: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height)}));
        ro.observe(el);
        return () => ro.disconnect();
    }, [ref]);
    return taille;
}

// ---------- bande des rails ----------

// Une ligne par rail : nom (clic = filtre), compteur, barre fine, prochaine seance. Repliable.
function BandeRails({modele, bandes, filtrerRail, choisir}) {
    const [ouverte, setOuverte] = useState(true);
    const lignes = RAILS.map(r => {
        const a = avancement(modele, r.id);
        return {r, a, pct: a.total ? Math.round((100 * a.maitrises) / a.total) : 0, actif: memesBandes(bandes, BANDES_DU_RAIL[r.id])};
    });
    return (
        <Box as="section" aria-label="Avancement par rail" borderTop="1px solid" borderBottom="1px solid" borderColor="line.subtle"
             px="clamp(16px, 2.5vw, 40px)" py={1}>
            <Flex align="center" gap={3}>
                <Button variant="unstyled" display="inline-flex" alignItems="center" gap={2} h="28px" fontSize="12px"
                        fontFamily="mono" textTransform="uppercase" letterSpacing="0.08em" color="fg.muted"
                        aria-expanded={ouverte} aria-controls="rails-detail" onClick={() => setOuverte(o => !o)}>
                    <Box as="span" aria-hidden="true" display="inline-block" transition="transform .15s ease"
                         transform={ouverte ? "rotate(90deg)" : "none"}>›</Box>
                    Avancement
                </Button>
                {/* Repliee : resume en une ligne. */}
                {!ouverte && (
                    <Text fontSize="13px" color="fg.muted" fontFamily="mono">
                        {lignes.map(({r, a}) => `${r.nom} ${a.maitrises}/${a.total}`).join(" · ")}
                    </Text>
                )}
            </Flex>
            <Box id="rails-detail" hidden={!ouverte} as="ul" listStyleType="none" p={0} m={0} pb={1}>
                {lignes.map(({r, a, pct, actif}) => {
                    const prochaine = a.prochaine && modele.parId.get(a.prochaine);
                    return (
                        <Box as="li" key={r.id} display="grid" alignItems="center" columnGap={4} rowGap={1} py={{base: "6px", lg: "1px"}}
                             gridTemplateColumns={{base: "minmax(0, 1fr) auto", lg: "120px 64px minmax(120px, 280px) minmax(0, 1fr)"}}>
                            <Box as="button" type="button" onClick={() => filtrerRail(r.id)} aria-pressed={actif}
                                 aria-label={`Filtrer la carte sur ${r.nom}`} textAlign="left" fontFamily="heading" fontWeight="700"
                                 fontSize="14px" minH="28px" color={actif ? "accent" : "fg.default"} _hover={{color: "accent"}}
                                 textDecoration={actif ? "underline" : "none"} textUnderlineOffset="4px">
                                {r.nom}
                            </Box>
                            <Text fontFamily="mono" fontSize="13px" color="fg.muted" data-compteur={r.id}>{a.maitrises} / {a.total}</Text>
                            <Box h="4px" bg="line.subtle" borderRadius="999px" overflow="hidden" role="progressbar"
                                 gridColumn={{base: "1 / -1", lg: "auto"}}
                                 aria-valuemin={0} aria-valuemax={a.total} aria-valuenow={a.maitrises}
                                 aria-label={`${r.nom} : ${a.maitrises} nœuds de cours maîtrisés sur ${a.total}`}>
                                <Box h="100%" w={`${pct}%`} bg={VERT} borderRadius="999px"/>
                            </Box>
                            <Text fontSize="13px" color="fg.muted" gridColumn={{base: "1 / -1", lg: "auto"}} noOfLines={1}>
                                Prochaine séance :{" "}
                                {prochaine ? (
                                    <Box as="button" type="button" color="accent" fontWeight="600" textAlign="left"
                                         onClick={() => choisir(a.prochaine, {garder: true})}>{prochaine.titre}</Box>
                                ) : "rien de débloqué"}
                                <Box as="span" color="fg.faint"> · {a.enCours} en cours · {pct} %</Box>
                            </Text>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}

// ---------- legende ----------

function Legende() {
    return (
        <Box as="details" open fontSize="12px" color="fg.muted">
            <Box as="summary" cursor="pointer" fontFamily="mono" textTransform="uppercase" letterSpacing="0.08em" minH="28px"
                 display="flex" alignItems="center">
                Légende
            </Box>
            <Flex gap={2} wrap="wrap" align="center" mt={2}>
                {["en-cours", "ensuite", "plus-tard", "maitrise"].map(s => <Pastille key={s} statut={s}/>)}
                <Box as="span" px={2} py="1px" border="1px dashed" borderColor="fg.faint" borderRadius="6px">projet d’apprentissage</Box>
            </Flex>
            <Flex gap={4} wrap="wrap" align="center" mt={2}>
                <Flex as="span" align="center" gap={2}><Box as="span" w="16px" h="3px" bg={AMBRE} borderRadius="2px"/>prérequis</Flex>
                <Flex as="span" align="center" gap={2}><Box as="span" w="16px" h="3px" bg="accent" borderRadius="2px"/>débloque</Flex>
            </Flex>
        </Box>
    );
}

// ---------- page ----------

export default function Parcours({noeudsInitiaux, estAdmin = false, bandesInitiales = [], noeudInitial = null}) {
    const [noeuds, setNoeuds] = useState(noeudsInitiaux);
    const modele = useMemo(() => construireModele(noeuds), [noeuds]);
    const autour = useMemo(() => autourDeMoi(modele), [modele]);
    const [vue, setVue] = useState("autour");
    const [bandes, setBandes] = useState(bandesInitiales);
    const [externes, setExternes] = useState(false);
    const [selection, setSelection] = useState(noeudInitial && modele.parId.has(noeudInitial) ? noeudInitial : null);
    const [survol, setSurvol] = useState(null);
    const [chaine, setChaine] = useState(false);
    const [message, setMessage] = useState("");
    const [enCours, demarrer] = useTransition();
    const cadreRef = useRef(null);
    const hautRef = useRef(null);
    const legendeRef = useRef(null);
    const zoomRef = useRef(null);

    // Disposition de la vue courante, combinee au filtre par bande.
    const disposition = useMemo(() => {
        if (vue === "autour") return disposerAutour(modele, autour.centres, {bandes, externes});
        const {ids, fantomes} = filtrerParBandes(modele, noeuds.map(n => n.id), bandes, {externes});
        return disposer(modele, ids, {fantomes});
    }, [vue, modele, autour, bandes, externes, noeuds]);
    // Mobile : liste par bande (meme filtre), "Autour de moi" ou toute la carte.
    const idsListe = useMemo(() => {
        const base = vue === "autour" ? autour.ids : noeuds.map(n => n.id);
        return base.filter(id => !bandes.length || bandes.includes(modele.parId.get(id).bande));
    }, [vue, autour, noeuds, bandes, modele]);

    // Surbrillance : selection (pleine) ou survol (legere).
    const focus = useMemo(() => {
        const id = selection ?? survol;
        if (!id) return null;
        return {id, ...voisinage(modele, id, selection ? chaine : false), leger: !selection};
    }, [selection, survol, chaine, modele]);

    // Etat dans l'URL : ?bandes=math,ml&noeud=ml1 (partage et rechargement de la vue).
    useEffect(() => {
        const url = new URL(window.location.href);
        if (bandes.length) url.searchParams.set("bandes", bandes.join(","));
        else url.searchParams.delete("bandes");
        if (selection) url.searchParams.set("noeud", selection);
        else url.searchParams.delete("noeud");
        window.history.replaceState(window.history.state, "", url);
    }, [bandes, selection]);

    const vider = useCallback(() => setSelection(null), []);

    // Echap annule la selection et ferme le panneau.
    useEffect(() => {
        const surTouche = e => { if (e.key === "Escape") vider(); };
        document.addEventListener("keydown", surTouche);
        return () => document.removeEventListener("keydown", surTouche);
    }, [vider]);

    // ----- deplacement / zoom -----
    const tailleCadre = useTaille(cadreRef);
    // Zone libre du cadre : sans la surimpression du haut (filtres) ni celles du bas (legende, zoom).
    const zone = useCallback(() => {
        const el = cadreRef.current;
        if (!el || !el.clientWidth) return null;
        const r = el.getBoundingClientRect();
        const haut = hautRef.current ? hautRef.current.getBoundingClientRect().bottom - r.top + MARGE_ZONE : MARGE_ZONE;
        const bas = Math.max(MARGE_ZONE, ...[legendeRef, zoomRef].map(ref => (ref.current ? r.bottom - ref.current.getBoundingClientRect().top + MARGE_ZONE : 0)));
        return {gauche: MARGE_ZONE, haut, l: r.width - 2 * MARGE_ZONE, h: Math.max(r.height - haut - bas, 80)};
    }, []);
    const taille = useMemo(() => ({largeur: disposition.largeur, hauteur: disposition.hauteur}), [disposition]);
    const {t, anime, cadrer, montrer, zoomerCentre} = usePanZoom(cadreRef, taille, zone);

    // Cadrage automatique (chargement, changement de vue ou de filtre) : noeuds en cours et ce
    // qu'ils debloquent ; sinon toute la carte. Le noeud de l'URL (?noeud=) est inclus.
    const cible = useMemo(() => {
        const ids = new Set();
        for (const n of noeuds) {
            if (modele.statuts.get(n.id) !== "en-cours") continue;
            ids.add(n.id);
            for (const s of modele.successeurs.get(n.id)) ids.add(s);
        }
        return englobant(disposition, ids) ?? englobant(disposition);
    }, [noeuds, modele, disposition]);
    const cleCadrage = `${vue}|${bandes.join(",")}|${externes}`;
    const dernierCadrage = useRef(null);
    useLayoutEffect(() => {
        if (!tailleCadre.l || dernierCadrage.current === cleCadrage) return;
        const premier = dernierCadrage.current === null;
        dernierCadrage.current = cleCadrage;
        cadrer(cible, {animer: !premier});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cleCadrage, tailleCadre.l]);

    // Noeud selectionne : reste visible a cote du panneau (la carte se recadre si besoin).
    useEffect(() => {
        if (!selection || !tailleCadre.l) return;
        montrer(englobant(disposition, new Set([selection])));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selection, tailleCadre.l, tailleCadre.h, cleCadrage]);

    const basculer = id => setBandes(liste => {
        const nouvelle = liste.includes(id) ? liste.filter(b => b !== id) : [...liste, id];
        return BANDES_CARTE.map(b => b.id).filter(b => nouvelle.includes(b));
    });
    const filtrerRail = rail => setBandes(liste => (memesBandes(liste, BANDES_DU_RAIL[rail]) ? [] : BANDES_DU_RAIL[rail]));

    // Clic sur un noeud : selectionne ; re-cliquer annule. Depuis le panneau, on garde la selection.
    const choisir = useCallback((id, {garder = false} = {}) => {
        setMessage("");
        setSelection(courante => (courante === id && !garder ? null : id));
    }, []);

    // Changement d'etat (admin) : route d'API protegee ; mise a jour optimiste, annulee en cas d'echec.
    const changerEtat = (id, etat) => {
        const avant = noeuds;
        setNoeuds(liste => liste.map(n => (n.id === id ? {...n, etat} : n)));
        setMessage("Enregistrement…");
        demarrer(async () => {
            let r = null;
            try {
                const rep = await fetch("/api/parcours/etat", {
                    method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({id, etat}),
                });
                r = await rep.json();
            } catch {
                r = {ok: false, erreur: "réseau indisponible"};
            }
            if (r?.ok) {
                setNoeuds(liste => liste.map(n => (n.id === id ? {...n, ...r.noeud} : n)));
                setMessage("Enregistré.");
            } else {
                setNoeuds(avant);
                setMessage(`Échec : ${r?.erreur ?? "erreur inconnue"}`);
            }
        });
    };

    const ouvert = Boolean(selection);
    const vide = disposition.cartes.length === 0;
    const boutonZoom = {variant: "unstyled", h: "36px", minW: "36px", px: 2, fontSize: "16px", fontWeight: "600",
        display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", _hover: {bg: "chip.bg"}};

    return (
        // Ordinateur : exactement la hauteur de la fenetre, sans defilement de page. Panneau ouvert :
        // la page se reduit pour lui laisser la place (pas de recouvrement).
        <Box as="main" display="flex" flexDirection="column" minH="100dvh" h={{lg: "100dvh"}} overflow={{lg: "hidden"}}
             pb={{base: ouvert ? "82dvh" : 16, lg: 0}} pr={{lg: ouvert ? `${LARGEUR_PANNEAU}px` : 0}}>
            {/* En-tete : une ligne sur ordinateur. */}
            <Flex as="header" px="clamp(16px, 2.5vw, 40px)" pt={{base: 6, lg: 3}} pb={{base: 4, lg: 3}} gap={3}
                  direction={{base: "column-reverse", lg: "row"}} align={{base: "stretch", lg: "center"}} justify="space-between">
                <Heading as="h1" fontSize={{base: "36px", lg: "24px"}}>Où j’en suis</Heading>
                <Flex justify="space-between" align="center" gap={4} wrap="wrap" fontSize="14px">
                    <Flex gap={4}>
                        {estAdmin && <Link as={NextLink} href="/admin">← Admin</Link>}
                        <Link as={NextLink} href="/">Voir le site</Link>
                    </Flex>
                    <Box as="span" fontFamily="mono" fontSize="12px" px={3} py={1} borderRadius="999px" bg="chip.bg" color="chip.fg">
                        Non référencé · hors CV{estAdmin ? " · mode édition" : ""}
                    </Box>
                </Flex>
            </Flex>

            <BandeRails modele={modele} bandes={bandes} filtrerRail={filtrerRail} choisir={choisir}/>

            {/* Zone de la carte : tout le reste de la fenetre (ordinateur). */}
            <Box position="relative" flex={{lg: "1"}} minH={0} display="flex" flexDirection="column"
                 px={{base: "clamp(16px, 2.5vw, 40px)", lg: 0}}>
                {/* Surimpression haut-gauche : vue et filtres. */}
                <Box ref={hautRef} data-surimpression="" position={{lg: "absolute"}} top={3} left={3} zIndex={5}
                     maxW={{lg: "calc(100% - 24px)"}} mt={{base: 4, lg: 0}} p={{lg: 3}}
                     sx={{"@media (min-width: 1024px)": VERRE}}>
                    <Flex gap={3} wrap="wrap" align="center">
                        <Box role="group" aria-label="Vue de la carte" display="inline-flex" border="1px solid" borderColor="line.strong"
                             borderRadius="10px" overflow="hidden" flexShrink={0}>
                            {[["autour", "Autour de moi"], ["complete", `Carte complète · ${noeuds.length}`]].map(([v, libelle], i) => (
                                <Button key={v} variant="unstyled" h={{base: "44px", lg: "36px"}} px={{base: 4, lg: 3}} borderRadius={0}
                                        fontSize={{base: "14px", lg: "13px"}} fontWeight="600"
                                        aria-pressed={vue === v} onClick={() => setVue(v)} borderLeft={i ? "1px solid" : "none"}
                                        borderColor="line.strong" bg={vue === v ? "accent" : "transparent"}
                                        color={vue === v ? "accent.contrast" : "fg.muted"}>
                                    {libelle}
                                </Button>
                            ))}
                        </Box>
                        <FiltreBandes bandes={bandes} basculer={basculer} tout={() => setBandes([])} externes={externes} setExternes={setExternes}/>
                    </Flex>
                    {vue === "autour" && autour.sansEnCours && (
                        <Text mt={2} fontSize="13px" color="fg.muted">
                            Aucun nœud en cours : voici les points d’entrée et ce qu’ils débloquent.
                        </Text>
                    )}
                </Box>

                {/* Legende : en bas a gauche sur ordinateur, sous les filtres sur mobile. */}
                <Box ref={legendeRef} data-surimpression="" position={{lg: "absolute"}} bottom={3} left={3} zIndex={5}
                     maxW={{lg: "min(520px, calc(100% - 200px))"}} mt={{base: 3, lg: 0}} px={{lg: 3}} py={{lg: 2}}
                     sx={{"@media (min-width: 1024px)": VERRE}}>
                    <Legende/>
                </Box>

                {/* Carte deplacable (ordinateur). */}
                <Box ref={cadreRef} data-carte-cadre="" display={{base: "none", lg: "block"}} position="absolute" inset={0}
                     overflow="hidden" bg="canvas" cursor="grab" _active={{cursor: "grabbing"}}
                     sx={{touchAction: "none", overscrollBehavior: "contain"}}
                     onClick={e => { if (!e.target.closest("[data-noeud]")) vider(); }}>
                    {vide ? (
                        <Flex h="100%" align="center" justify="center">
                            <Text color="fg.muted">Rien à afficher pour ce filtre dans cette vue.</Text>
                        </Flex>
                    ) : (
                        <Box data-carte-contenu="" position="absolute" top={0} left={0} transformOrigin="0 0"
                             style={{
                                 transform: `translate(${t.x}px, ${t.y}px) scale(${t.k})`,
                                 transition: anime ? "transform .25s ease" : "none",
                                 willChange: "transform",
                             }}>
                            <Graphe modele={modele} disposition={disposition} selection={selection} focus={focus}
                                    choisir={choisir} survoler={setSurvol}/>
                        </Box>
                    )}
                </Box>

                {/* Zoom : en bas a droite. */}
                <Flex ref={zoomRef} data-surimpression="" display={{base: "none", lg: "flex"}} position="absolute" bottom={3} right={3}
                      zIndex={5} align="center" gap={1} p={1} role="group" aria-label="Zoom de la carte" {...VERRE}>
                    <Button {...boutonZoom} onClick={() => zoomerCentre(1 / 1.25)} aria-label="Dézoomer" isDisabled={t.k <= ZOOM_MIN + 0.001}>−</Button>
                    <Text as="span" fontFamily="mono" fontSize="12px" minW="44px" textAlign="center" color="fg.muted" aria-live="polite">
                        {Math.round(t.k * 100)} %
                    </Text>
                    <Button {...boutonZoom} onClick={() => zoomerCentre(1.25)} aria-label="Zoomer" isDisabled={t.k >= ZOOM_MAX - 0.001}>+</Button>
                    <Button {...boutonZoom} px={3} fontSize="13px" onClick={() => cadrer(englobant(disposition), {kMax: 1})}>Ajuster</Button>
                </Flex>

                {/* Mobile : liste par bande, sans deplacement ni zoom. */}
                <Box display={{base: "block", lg: "none"}} mt={6}>
                    {idsListe.length
                        ? <ListeParBande modele={modele} ids={idsListe} choisir={choisir} selection={selection}/>
                        : <Text py={8} color="fg.muted">Rien à afficher pour ce filtre dans cette vue.</Text>}
                </Box>
            </Box>

            {/* Prochains pas (mobile ; sur ordinateur, la bande des rails donne la prochaine seance). */}
            <Box as="section" aria-labelledby="prochains-pas" mt={8} px="clamp(16px, 2.5vw, 40px)" display={{base: "block", lg: "none"}}>
                <Heading as="h2" id="prochains-pas" fontSize="20px" mb={4}>Prochains pas</Heading>
                {RAILS.map(r => {
                    const suivants = noeudsDuRail(modele, r.id, "ensuite").slice(0, 5);
                    return (
                        <Box key={r.id} mb={6}>
                            <Text fontFamily="mono" fontSize="12px" color="fg.faint" textTransform="uppercase" letterSpacing="0.08em" mb={2}>
                                {r.nom}
                            </Text>
                            {suivants.length ? (
                                <Box as="ul" listStyleType="none" p={0} m={0}>
                                    {suivants.map(id => <LienNoeud key={id} id={id} modele={modele} choisir={choisir}/>)}
                                </Box>
                            ) : <Text fontSize="14px" color="fg.faint">Rien de débloqué pour l’instant.</Text>}
                        </Box>
                    );
                })}
            </Box>

            <Panneau modele={modele} id={selection} ouvert={ouvert} fermer={vider} choisir={choisir} changerEtat={changerEtat}
                     enCours={enCours} message={message} estAdmin={estAdmin} chaine={chaine} setChaine={setChaine}/>
        </Box>
    );
}

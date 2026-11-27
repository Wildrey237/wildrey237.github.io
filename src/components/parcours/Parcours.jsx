'use client'

// Parcours (/parcours) : public mais non reference (noindex, hors sitemap et hors menu).
// Avancement par rail, carte en graphe sur les bandes d'origine (vue "Autour de moi" ou carte
// complete), filtre par bande, surbrillance des connexions au clic (et au survol, en plus leger),
// fiche du noeud en panneau lateral (feuille en bas sur mobile). Etat dans l'URL :
// ?bandes=math,ml&noeud=ml1. Le changement d'etat est reserve a la session admin (401 sinon).
// Les projets de la carte sont des projets d'apprentissage, sans lien avec ceux du CV.
import {useCallback, useEffect, useMemo, useRef, useState, useTransition} from "react";
import {Box, Button, Checkbox, CloseButton, Container, Flex, Grid, Heading, Link, Text} from "@chakra-ui/react";
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

function Graphe({modele, disposition: d, selection, focus, choisir, survoler, vider, cadreRef}) {
    const chemin = pts => pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
    const attenuation = focus ? (focus.leger ? 0.45 : 0.2) : null;
    return (
        // Hauteur naturelle (suit la page) : seul le defilement horizontal est autorise.
        <Box ref={cadreRef} data-carte-cadre="" overflowX="auto" overflowY="hidden" border="1px solid" borderColor="line.strong"
             borderRadius="14px" bg="canvas">
            {/* Clic dans le vide (hors carte) : annule la selection. */}
            <Box position="relative" w={`${d.largeur}px`} h={`${d.hauteur}px`}
                 onClick={e => { if (!e.target.closest("[data-noeud]")) vider(); }}>
                {d.bandes.map(b => (
                    <Box key={b.bande} data-bande={b.bande} position="absolute" left={0} top={`${b.y}px`} w="100%" h={`${b.hauteur}px`}
                         borderTop="1px solid" borderColor="line.subtle" borderLeft="4px solid" borderLeftColor={`bande.${b.bande}`}
                         opacity={b.fantome ? 0.6 : 1}>
                        <Text position="sticky" left={4} display="inline-block" mt={2} ml={4} fontFamily="mono"
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
        </Box>
    );
}

// ---------- filtre par bande ----------

function FiltreBandes({bandes, basculer, tout, externes, setExternes}) {
    const pastille = (actif, libelle, onClick, couleur) => (
        <Button key={libelle} variant="unstyled" onClick={onClick} aria-pressed={actif} display="inline-flex" alignItems="center"
                gap={2} h="44px" px={4} borderRadius="999px" border="1px solid" fontSize="14px" fontWeight="600"
                borderColor={actif ? (couleur ?? "accent") : "line.strong"} bg={actif ? "chip.bg" : "transparent"}
                color={actif ? "fg.default" : "fg.muted"}>
            {couleur && <Box as="span" w="10px" h="10px" borderRadius="full" bg={couleur} aria-hidden="true"/>}
            {libelle}
        </Button>
    );
    return (
        <Flex gap={4} wrap="wrap" align="center" mb={4}>
            <Flex role="group" aria-label="Filtrer la carte par bande" gap={2} wrap="wrap">
                {pastille(bandes.length === 0, "Tout", tout)}
                {BANDES_CARTE.map(b => pastille(bandes.includes(b.id), b.court, () => basculer(b.id), `bande.${b.id}`))}
            </Flex>
            {/* Decochee par defaut : les autres bandes disparaissent completement. */}
            <Checkbox isChecked={externes} onChange={e => setExternes(e.target.checked)} isDisabled={!bandes.length}
                      minH="44px" colorScheme="brand">
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
             top={{base: "auto", md: 0}} bottom={0} right={0} left={{base: 0, md: "auto"}}
             w={{base: "100%", md: `${LARGEUR_PANNEAU}px`}} h={{base: "80dvh", md: "100dvh"}}
             borderLeft={{md: "1px solid"}} borderTop={{base: "1px solid", md: "none"}}
             borderTopRadius={{base: "18px", md: 0}}
             transform={ouvert ? "translate(0, 0)" : {base: "translateY(100%)", md: "translateX(100%)"}}
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

    // Disposition de la vue courante, combinee au filtre par bande.
    const disposition = useMemo(() => {
        if (vue === "autour") return disposerAutour(modele, autour.centres, {bandes, externes});
        const {ids, fantomes} = filtrerParBandes(modele, noeuds.map(n => n.id), bandes, {externes});
        return disposer(modele, ids, {fantomes});
    }, [vue, modele, autour, bandes, externes, noeuds]);
    const idsListe = useMemo(
        () => autour.ids.filter(id => !bandes.length || bandes.includes(modele.parId.get(id).bande)),
        [autour, bandes, modele],
    );

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

    // Noeud selectionne : reste visible a cote du panneau (defilement automatique si besoin).
    useEffect(() => {
        if (!selection) return;
        const id = requestAnimationFrame(() => {
            const carte = cadreRef.current?.querySelector(`[data-noeud="${selection}"]`);
            carte?.scrollIntoView({behavior: "smooth", block: "nearest", inline: "nearest"});
        });
        return () => cancelAnimationFrame(id);
    }, [selection, vue, bandes]);

    const basculer = id => setBandes(liste => {
        const nouvelle = liste.includes(id) ? liste.filter(b => b !== id) : [...liste, id];
        return BANDES_CARTE.map(b => b.id).filter(b => nouvelle.includes(b));
    });
    const filtrerRail = rail => setBandes(liste => (memesBandes(liste, BANDES_DU_RAIL[rail]) ? [] : BANDES_DU_RAIL[rail]));

    // Clic sur un noeud : selectionne ; re-cliquer annule. Depuis le panneau, on garde la selection.
    const choisir = (id, {garder = false} = {}) => {
        setMessage("");
        setSelection(courante => (courante === id && !garder ? null : id));
    };

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
    const proprietesGraphe = {modele, disposition, selection, focus, choisir, survoler: setSurvol, vider, cadreRef};

    return (
        // Panneau ouvert (ordinateur) : la page se reduit pour lui laisser la place, sans recouvrement.
        <Box as="main" minH="100dvh" pb={ouvert ? {base: "82dvh", md: 16} : 16}
             pr={{md: ouvert ? `${LARGEUR_PANNEAU}px` : 0}} transition="padding .2s ease">
            <Container maxW="1600px" px="clamp(24px, 5vw, 96px)" pt={{base: 6, md: 10}}>
                <Flex justify="space-between" align="center" gap={3} wrap="wrap">
                    <Flex gap={4} fontSize="14px">
                        {estAdmin && <Link as={NextLink} href="/admin">← Admin</Link>}
                        <Link as={NextLink} href="/">Voir le site</Link>
                    </Flex>
                    <Box as="span" fontFamily="mono" fontSize="12px" px={3} py={1} borderRadius="999px" bg="chip.bg" color="chip.fg">
                        Non référencé · hors CV{estAdmin ? " · mode édition" : ""}
                    </Box>
                </Flex>
                <Heading as="h1" mt={6} fontSize={{base: "36px", md: "48px"}}>Où j’en suis</Heading>

                {/* Avancement par rail ; un clic sur la carte filtre la carte sur ce rail. */}
                <Grid mt={6} templateColumns={{base: "1fr", lg: "repeat(3, 1fr)"}} gap={4}>
                    {RAILS.map(r => {
                        const a = avancement(modele, r.id);
                        const pct = a.total ? Math.round((100 * a.maitrises) / a.total) : 0;
                        const prochaine = a.prochaine && modele.parId.get(a.prochaine);
                        const actif = memesBandes(bandes, BANDES_DU_RAIL[r.id]);
                        return (
                            <Box key={r.id} position="relative" bg="surface" border="1px solid"
                                 borderColor={actif ? "accent" : "line.strong"} borderRadius="14px" p={5}
                                 _hover={{borderColor: "accent"}}>
                                <Flex justify="space-between" align="baseline">
                                    <Box as="button" type="button" onClick={() => filtrerRail(r.id)} aria-pressed={actif}
                                         aria-label={`Filtrer la carte sur ${r.nom}`} textAlign="left" fontFamily="heading"
                                         fontWeight="700" fontSize="18px" color="fg.default"
                                         _after={{content: '""', position: "absolute", inset: 0, borderRadius: "14px"}}
                                         _focusVisible={{outline: "none", _after: {outline: "2px solid", outlineColor: "accent"}}}>
                                        {r.nom}
                                    </Box>
                                    <Text fontFamily="mono" fontSize="13px" color="fg.muted" data-compteur={r.id}>{a.maitrises} / {a.total}</Text>
                                </Flex>
                                <Box mt={3} h="8px" bg="line.subtle" borderRadius="999px" overflow="hidden" role="progressbar"
                                     aria-valuemin={0} aria-valuemax={a.total} aria-valuenow={a.maitrises}
                                     aria-label={`${r.nom} : ${a.maitrises} nœuds de cours maîtrisés sur ${a.total}`}>
                                    <Box h="100%" w={`${pct}%`} bg={VERT} borderRadius="999px"/>
                                </Box>
                                <Text mt={2} fontSize="13px" color="fg.faint">{a.enCours} en cours · {pct} % maîtrisé</Text>
                                <Text mt={3} fontSize="14px" color="fg.muted" position="relative" zIndex={1}>
                                    Prochaine séance :{" "}
                                    {prochaine ? (
                                        <Box as="button" type="button" color="accent" fontWeight="600" textAlign="left"
                                             onClick={() => choisir(a.prochaine, {garder: true})}>{prochaine.titre}</Box>
                                    ) : "rien de débloqué"}
                                </Text>
                            </Box>
                        );
                    })}
                </Grid>

                {/* Choix de la vue */}
                <Flex mt={8} mb={4} justify="space-between" align="center" gap={3} wrap="wrap">
                    <Box role="group" aria-label="Vue de la carte" display="inline-flex" border="1px solid" borderColor="line.strong"
                         borderRadius="10px" overflow="hidden">
                        {[["autour", "Autour de moi"], ["complete", `Carte complète · ${noeuds.length}`]].map(([v, libelle], i) => (
                            <Button key={v} variant="unstyled" h="44px" px={4} borderRadius={0} fontSize="14px" fontWeight="600"
                                    aria-pressed={vue === v} onClick={() => setVue(v)} borderLeft={i ? "1px solid" : "none"}
                                    borderColor="line.strong" bg={vue === v ? "accent" : "transparent"}
                                    color={vue === v ? "accent.contrast" : "fg.muted"}>
                                {libelle}
                            </Button>
                        ))}
                    </Box>
                    <Flex gap={3} wrap="wrap" fontSize="12px" color="fg.muted" align="center">
                        {["en-cours", "ensuite", "plus-tard", "maitrise"].map(s => <Pastille key={s} statut={s}/>)}
                        <Box as="span" px={2} py="1px" border="1px dashed" borderColor="fg.faint" borderRadius="6px">projet d’apprentissage</Box>
                    </Flex>
                </Flex>
                <FiltreBandes bandes={bandes} basculer={basculer} tout={() => setBandes([])} externes={externes} setExternes={setExternes}/>
                {vue === "autour" && autour.sansEnCours && (
                    <Text mb={3} fontSize="14px" color="fg.muted">
                        Aucun nœud en cours : voici les points d’entrée et ce qu’ils débloquent.
                    </Text>
                )}

                {vide ? (
                    <Text py={8} color="fg.muted">Rien à afficher pour ce filtre dans cette vue.</Text>
                ) : vue === "autour" ? (
                    <>
                        {/* Mobile : la vue "Autour de moi" passe en liste par bande (meme filtre). */}
                        <Box display={{base: "block", md: "none"}}>
                            <ListeParBande modele={modele} ids={idsListe} choisir={choisir} selection={selection}/>
                        </Box>
                        <Box display={{base: "none", md: "block"}}><Graphe {...proprietesGraphe}/></Box>
                    </>
                ) : (
                    <Graphe {...proprietesGraphe}/>
                )}

                {/* Prochains pas */}
                <Box as="section" aria-labelledby="prochains-pas" mt={8}>
                    <Heading as="h2" id="prochains-pas" fontSize="20px" mb={4}>Prochains pas</Heading>
                    <Grid templateColumns={{base: "1fr", md: "repeat(3, 1fr)"}} gap={6}>
                        {RAILS.map(r => {
                            const suivants = noeudsDuRail(modele, r.id, "ensuite").slice(0, 5);
                            return (
                                <Box key={r.id}>
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
                    </Grid>
                </Box>
            </Container>

            <Panneau modele={modele} id={selection} ouvert={ouvert} fermer={vider} choisir={choisir} changerEtat={changerEtat}
                     enCours={enCours} message={message} estAdmin={estAdmin} chaine={chaine} setChaine={setChaine}/>
        </Box>
    );
}

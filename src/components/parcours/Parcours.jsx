'use client'

// Parcours prive (/parcours) : avancement par rail, carte en graphe (vue "Autour de moi" ou
// carte complete), prochains pas et fiche du noeud selectionne (etat modifiable en un clic).
// Les projets de la carte sont des projets d'apprentissage, sans lien avec ceux du CV.
import {useEffect, useMemo, useRef, useState, useTransition} from "react";
import {Box, Button, Container, Flex, Grid, Heading, Link, Text} from "@chakra-ui/react";
import NextLink from "next/link";
import {RAILS, autourDeMoi, avancement, construireModele, decouperTitre, noeudsDuRail} from "../../lib/parcours/modele";
import {CARTE, disposer} from "../../lib/parcours/disposition";
import {definirEtat} from "../../../app/parcours/actions";

const ETATS = [
    {valeur: "non commence", libelle: "Non commencé"},
    {valeur: "en cours", libelle: "En cours"},
    {valeur: "maitrise", libelle: "Maîtrisé"},
];
const ETIQUETTES = {"en-cours": "Tu es ici", ensuite: "Ensuite", maitrise: "Maîtrisé"};
const LIBELLES_STATUT = {"en-cours": "En cours", ensuite: "Ensuite", "plus-tard": "Plus tard", maitrise: "Maîtrisé"};

// Couleurs des etats (charte de la carte).
const JAUNE = {fond: "#FDF0D5", bord: "#E2A42E", halo: "rgba(226,164,46,0.22)"};
const VERT = "#1D8A55";

function styleCarte(statut, estProjet, selection) {
    const base = {
        "en-cours": {bg: JAUNE.fond, color: "#15161A", border: `2px solid ${JAUNE.bord}`, boxShadow: `0 0 0 5px ${JAUNE.halo}`},
        ensuite: {bg: "surface", color: "fg.default", border: "2px solid", borderColor: "accent"},
        "plus-tard": {bg: "canvas", color: "fg.faint", border: "1px solid", borderColor: "line.strong"},
        maitrise: {bg: "surface", color: "fg.default", border: `2px solid ${VERT}`},
    }[statut];
    return {
        ...base,
        borderStyle: estProjet ? "dashed" : "solid",
        // Anneau de selection uniquement sur la carte choisie.
        ...(selection ? {outline: "3px solid", outlineColor: "accent", outlineOffset: "3px"} : {outline: "0"}),
    };
}

function Pastille({statut}) {
    const couleurs = {
        "en-cours": {bg: JAUNE.fond, color: "#7A5207", borderColor: JAUNE.bord},
        ensuite: {bg: "chip.bg", color: "chip.fg", borderColor: "accent"},
        "plus-tard": {bg: "canvas", color: "fg.faint", borderColor: "line.strong"},
        maitrise: {bg: "success.bg", color: "success.fg", borderColor: VERT},
    }[statut];
    return (
        <Box as="span" display="inline-block" px={2} py="1px" fontSize="12px" fontWeight="600" borderRadius="999px"
             border="1px solid" {...couleurs}>
            {LIBELLES_STATUT[statut]}
        </Box>
    );
}

// ---------- graphe ----------

function Graphe({modele, ids, selection, choisir, cadreRef}) {
    const d = useMemo(() => disposer(modele, ids), [modele, ids]);
    const chemin = pts => pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
    return (
        <Box ref={cadreRef} overflow="auto" maxH={{base: "70vh", md: "72vh"}} border="1px solid" borderColor="line.strong"
             borderRadius="14px" bg="canvas" sx={{overscrollBehavior: "contain"}}>
            <Box position="relative" w={`${d.largeur}px`} h={`${d.hauteur}px`}>
                {/* Bandes : une par rail */}
                {d.bandes.map(b => (
                    <Box key={b.rail} position="absolute" left={0} top={`${b.y}px`} w="100%" h={`${b.hauteur}px`}
                         borderTop="1px solid" borderColor="line.subtle">
                        <Text position="sticky" left={4} display="inline-block" mt={2} ml={4} fontFamily="mono"
                              fontSize="12px" letterSpacing="0.08em" textTransform="uppercase" color="fg.faint">
                            {b.nom}
                        </Text>
                    </Box>
                ))}
                <svg width={d.largeur} height={d.hauteur} style={{position: "absolute", inset: 0}} aria-hidden="true">
                    <defs>
                        {["gris", "accent"].map(c => (
                            <marker key={c} id={`fleche-${c}`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7"
                                    markerHeight="7" orient="auto">
                                <path d="M0,0 L8,4 L0,8 z"
                                      fill={c === "accent" ? "var(--chakra-colors-accent)" : "var(--chakra-colors-fg-faint)"}/>
                            </marker>
                        ))}
                    </defs>
                    {d.aretes.map(a => (
                        <path key={`${a.de}-${a.vers}`} d={chemin(a.points)} fill="none"
                              stroke={a.accent ? "var(--chakra-colors-accent)" : "var(--chakra-colors-line-strong)"}
                              strokeWidth={a.accent ? 2 : 1.5} strokeLinejoin="round"
                              markerEnd={`url(#fleche-${a.accent ? "accent" : "gris"})`}/>
                    ))}
                </svg>
                {d.cartes.map(c => {
                    const n = modele.parId.get(c.id);
                    const {code, nom} = decouperTitre(n.titre);
                    const estProjet = n.bande === "proj";
                    return (
                        <Box key={c.id} as="button" type="button" data-noeud={c.id} onClick={() => choisir(c.id)}
                             aria-pressed={selection === c.id}
                             aria-label={`${n.titre} – ${LIBELLES_STATUT[c.statut]}${estProjet ? ", projet d’apprentissage" : ""}`}
                             position="absolute" left={`${c.x}px`} top={`${c.y}px`} w={`${CARTE.largeur}px`}
                             h={`${CARTE.hauteur}px`} borderRadius="10px" px={3} py={2} textAlign="left"
                             transition="transform .12s ease" _hover={{transform: "translateY(-1px)"}}
                             {...styleCarte(c.statut, estProjet, selection === c.id)}>
                            <Flex justify="space-between" align="center" gap={2}>
                                <Text as="span" fontFamily="mono" fontSize="11px" fontWeight="600" opacity={0.8}>
                                    {code}{estProjet && " · projet"}
                                </Text>
                                {ETIQUETTES[c.statut] && (
                                    <Text as="span" fontSize="10px" fontWeight="700" textTransform="uppercase"
                                          letterSpacing="0.04em"
                                          color={c.statut === "en-cours" ? "#7A5207" : c.statut === "maitrise" ? "success.fg" : "accent"}>
                                        {ETIQUETTES[c.statut]}
                                    </Text>
                                )}
                            </Flex>
                            <Text as="span" display="block" mt="2px" fontSize="13px" fontWeight="600" lineHeight="1.25" noOfLines={2}>
                                {nom}
                            </Text>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}

// ---------- liste par rail (mobile, vue "Autour de moi") ----------

function ListeParRail({modele, ids, choisir, selection}) {
    const ordreStatut = {"en-cours": 0, ensuite: 1, maitrise: 2, "plus-tard": 3};
    return (
        <Box>
            {RAILS.map(r => {
                const membres = ids.filter(id => modele.rails.get(id) === r.id)
                    .sort((a, b) => ordreStatut[modele.statuts.get(a)] - ordreStatut[modele.statuts.get(b)] || modele.ordre(a, b));
                if (!membres.length) return null;
                return (
                    <Box key={r.id} as="section" mb={6}>
                        <Heading as="h3" fontSize="15px" mb={2}>{r.nom}</Heading>
                        <Box as="ul" listStyleType="none" p={0} m={0}>
                            {membres.map(id => {
                                const n = modele.parId.get(id);
                                const statut = modele.statuts.get(id);
                                return (
                                    <Box as="li" key={id} mb={2}>
                                        <Box as="button" type="button" onClick={() => choisir(id)} w="100%" minH="56px"
                                             textAlign="left" px={3} py={2} borderRadius="10px" aria-pressed={selection === id}
                                             {...styleCarte(statut, n.bande === "proj", selection === id)}>
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

// ---------- fiche du noeud ----------

function LienNoeud({id, modele, choisir}) {
    const n = modele.parId.get(id);
    if (!n) return null;
    return (
        <Box as="li" mb={1}>
            <Box as="button" type="button" onClick={() => choisir(id)} display="flex" alignItems="center" gap={2}
                 minH="36px" textAlign="left" color="fg.default" _hover={{color: "accent"}}>
                <Pastille statut={modele.statuts.get(id)}/>
                <Text as="span" fontSize="14px">{n.titre}</Text>
            </Box>
        </Box>
    );
}

function Fiche({modele, id, choisir, changerEtat, enCours, message}) {
    const n = modele.parId.get(id);
    if (!n) return null;
    const statut = modele.statuts.get(id);
    const successeurs = modele.successeurs.get(id);
    const rail = RAILS.find(r => r.id === modele.rails.get(id));
    return (
        <Box as="section" aria-labelledby="fiche-titre" bg="surface" border="1px solid" borderColor="line.strong"
             borderRadius="14px" p={5}>
            <Flex justify="space-between" align="flex-start" gap={3} wrap="wrap">
                <Box>
                    <Text fontFamily="mono" fontSize="12px" color="fg.faint" textTransform="uppercase" letterSpacing="0.08em">
                        {rail?.nom}{n.bande === "proj" && " · projet d’apprentissage"}
                    </Text>
                    <Heading as="h2" id="fiche-titre" fontSize="20px" mt={1}>{n.titre}</Heading>
                </Box>
                <Pastille statut={statut}/>
            </Flex>

            <Box role="group" aria-label="État du nœud" display="inline-flex" mt={4} border="1px solid"
                 borderColor="line.strong" borderRadius="10px" overflow="hidden">
                {ETATS.map((e, i) => {
                    const actif = n.etat === e.valeur;
                    return (
                        <Button key={e.valeur} variant="unstyled" h="44px" px={4} borderRadius={0} fontSize="14px"
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

            <Grid templateColumns={{base: "1fr", md: "1fr 1fr"}} gap={6} mt={3}>
                <Box>
                    <Heading as="h3" fontSize="14px" mb={2}>Prérequis</Heading>
                    {n.prerequis.length ? (
                        <Box as="ul" listStyleType="none" p={0} m={0}>
                            {n.prerequis.map(p => <LienNoeud key={p} id={p} modele={modele} choisir={choisir}/>)}
                        </Box>
                    ) : <Text fontSize="14px" color="fg.faint">Aucun : point d’entrée.</Text>}
                </Box>
                <Box>
                    <Heading as="h3" fontSize="14px" mb={2}>Débloque</Heading>
                    {successeurs.length ? (
                        <Box as="ul" listStyleType="none" p={0} m={0}>
                            {[...successeurs].sort(modele.ordre).map(s => <LienNoeud key={s} id={s} modele={modele} choisir={choisir}/>)}
                        </Box>
                    ) : <Text fontSize="14px" color="fg.faint">Rien : fin de chemin.</Text>}
                </Box>
            </Grid>

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
            {n.livrables.length > 0 && (
                <Box mt={5}>
                    <Heading as="h3" fontSize="14px" mb={2}>Livrables</Heading>
                    <Box as="ul" pl={5} fontSize="14px" color="fg.muted">
                        {n.livrables.map(l => <li key={l.nom}><strong>{l.nom}</strong> – {l.detail}</li>)}
                    </Box>
                </Box>
            )}
            {n.etatModifieLe && (
                <Text mt={4} fontSize="12px" color="fg.faint">
                    État modifié le {new Date(n.etatModifieLe).toLocaleDateString("fr-FR", {day: "numeric", month: "long", year: "numeric"})}
                </Text>
            )}
        </Box>
    );
}

// ---------- page ----------

export default function Parcours({noeudsInitiaux}) {
    const [noeuds, setNoeuds] = useState(noeudsInitiaux);
    const modele = useMemo(() => construireModele(noeuds), [noeuds]);
    const autour = useMemo(() => autourDeMoi(modele), [modele]);
    const [vue, setVue] = useState("autour");
    const premier = autour.ids.find(id => modele.statuts.get(id) === "en-cours") ?? autour.ids[0];
    const [selection, setSelection] = useState(premier);
    const [message, setMessage] = useState("");
    const [enCours, demarrer] = useTransition();
    const cadreRef = useRef(null);
    const ficheRef = useRef(null);

    const ids = vue === "autour" ? autour.ids : noeuds.map(n => n.id);

    // A l'ouverture d'une vue : centre le cadre sur le noeud selectionne (ou le premier en cours).
    useEffect(() => {
        const cadre = cadreRef.current;
        const carte = cadre?.querySelector(`[data-noeud="${selection}"]`) ?? cadre?.querySelector("[data-noeud]");
        if (!cadre || !carte) return;
        cadre.scrollTo({
            left: Math.max(0, carte.offsetLeft - cadre.clientWidth / 2 + CARTE.largeur / 2),
            top: Math.max(0, carte.offsetTop - cadre.clientHeight / 3),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vue]);

    const choisir = id => {
        setSelection(id);
        setMessage("");
        // Sur petit ecran, la fiche est sous la carte : on y descend.
        if (window.matchMedia("(max-width: 767px)").matches) ficheRef.current?.scrollIntoView({behavior: "smooth", block: "start"});
    };

    const changerEtat = (id, etat) => {
        const avant = noeuds;
        // Mise a jour optimiste, annulee en cas d'echec.
        setNoeuds(liste => liste.map(n => (n.id === id ? {...n, etat} : n)));
        setMessage("Enregistrement…");
        demarrer(async () => {
            const r = await definirEtat(id, etat);
            if (r?.ok) {
                setNoeuds(liste => liste.map(n => (n.id === id ? {...n, ...r.noeud} : n)));
                setMessage("Enregistré.");
            } else {
                setNoeuds(avant);
                setMessage(`Échec : ${r?.erreur ?? "erreur inconnue"}`);
            }
        });
    };

    return (
        <Box as="main" minH="100dvh" pb={16}>
            <Container maxW="1320px" px={{base: 5, md: 8}} pt={{base: 6, md: 10}}>
                <Flex justify="space-between" align="center" gap={3} wrap="wrap">
                    <Flex gap={4} fontSize="14px">
                        <Link as={NextLink} href="/admin">← Admin</Link>
                        <Link as={NextLink} href="/" target="_blank">Voir le site</Link>
                    </Flex>
                    <Box as="span" fontFamily="mono" fontSize="12px" px={3} py={1} borderRadius="999px" bg="chip.bg" color="chip.fg">
                        Privé · non indexé · hors CV
                    </Box>
                </Flex>
                <Heading as="h1" mt={6} fontSize={{base: "36px", md: "48px"}}>Où j’en suis</Heading>

                {/* Avancement par rail */}
                <Grid mt={6} templateColumns={{base: "1fr", md: "repeat(3, 1fr)"}} gap={4}>
                    {RAILS.map(r => {
                        const a = avancement(modele, r.id);
                        const pct = a.total ? Math.round((100 * a.maitrises) / a.total) : 0;
                        const prochaine = a.prochaine && modele.parId.get(a.prochaine);
                        return (
                            <Box key={r.id} bg="surface" border="1px solid" borderColor="line.strong" borderRadius="14px" p={5}>
                                <Flex justify="space-between" align="baseline">
                                    <Heading as="h2" fontSize="18px">{r.nom}</Heading>
                                    <Text fontFamily="mono" fontSize="13px" color="fg.muted">{a.maitrises} / {a.total}</Text>
                                </Flex>
                                <Box mt={3} h="8px" bg="line.subtle" borderRadius="999px" overflow="hidden" role="progressbar"
                                     aria-valuemin={0} aria-valuemax={a.total} aria-valuenow={a.maitrises}
                                     aria-label={`${r.nom} : ${a.maitrises} nœuds maîtrisés sur ${a.total}`}>
                                    <Box h="100%" w={`${pct}%`} bg={VERT} borderRadius="999px"/>
                                </Box>
                                <Text mt={2} fontSize="13px" color="fg.faint">
                                    {a.enCours} en cours · {pct} % maîtrisé
                                </Text>
                                <Text mt={3} fontSize="14px" color="fg.muted">
                                    Prochaine séance :{" "}
                                    {prochaine ? (
                                        <Box as="button" type="button" color="accent" fontWeight="600" textAlign="left"
                                             onClick={() => choisir(a.prochaine)}>{prochaine.titre}</Box>
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
                {vue === "autour" && autour.sansEnCours && (
                    <Text mb={3} fontSize="14px" color="fg.muted">
                        Aucun nœud en cours : voici les points d’entrée et ce qu’ils débloquent.
                    </Text>
                )}

                {/* Mobile : la vue "Autour de moi" passe en liste par rail. */}
                {vue === "autour" ? (
                    <>
                        <Box display={{base: "block", md: "none"}}>
                            <ListeParRail modele={modele} ids={autour.ids} choisir={choisir} selection={selection}/>
                        </Box>
                        <Box display={{base: "none", md: "block"}}>
                            <Graphe modele={modele} ids={ids} selection={selection} choisir={choisir} cadreRef={cadreRef}/>
                        </Box>
                    </>
                ) : (
                    <Graphe modele={modele} ids={ids} selection={selection} choisir={choisir} cadreRef={cadreRef}/>
                )}

                {/* Prochains pas et fiche */}
                <Grid mt={8} templateColumns={{base: "1fr", lg: "minmax(0, 1fr) minmax(0, 1.4fr)"}} gap={6} alignItems="start">
                    <Box as="section" aria-labelledby="prochains-pas">
                        <Heading as="h2" id="prochains-pas" fontSize="20px" mb={4}>Prochains pas</Heading>
                        {RAILS.map(r => {
                            const suivants = noeudsDuRail(modele, r.id, "ensuite").slice(0, 5);
                            return (
                                <Box key={r.id} mb={5}>
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
                    <Box ref={ficheRef} sx={{scrollMarginTop: "16px"}}>
                        <Fiche modele={modele} id={selection} choisir={choisir} changerEtat={changerEtat} enCours={enCours} message={message}/>
                    </Box>
                </Grid>
            </Container>
        </Box>
    );
}

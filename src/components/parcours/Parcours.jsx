'use client'

// Parcours (/parcours) : public mais non reference (noindex, hors sitemap et hors menu).
// Carte en graphe (React Flow, voir CarteFlux.jsx) sur les bandes d'origine, vue "Autour de moi"
// ou carte complete, filtre par bande, recherche d'un noeud, surbrillance des connexions au clic
// (et au survol, en plus leger), fiche du noeud en panneau lateral (feuille en bas sur mobile).
// Etat dans l'URL : ?bandes=math,ml&noeud=ml1. Le changement d'etat est reserve a la session admin
// (401 sinon). Les projets de la carte sont des projets d'apprentissage, sans lien avec ceux du CV.
//
// Ordinateur (>= 1024px) : plein ecran, la page ne defile pas. En-tete (44px) avec l'avancement
// replie en une ligne, une barre d'outils (44px), puis la carte sur tout le reste (>= 85 % de
// l'ecran). Mobile : liste par bande, sans carte.
import {useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, useTransition} from "react";
import dynamic from "next/dynamic";
import {Box, Button, Checkbox, CloseButton, Flex, Heading, Input, Link, Text} from "@chakra-ui/react";
import NextLink from "next/link";
import {
    BANDES_CARTE, RAILS, autourDeMoi, avancement, construireModele, decouperTitre, filtrerParBandes, noeudsDuRail,
    voisinage,
} from "../../lib/parcours/modele";
import {disposerFlux} from "../../lib/parcours/flux";
import {AMBRE, NOM_BANDE, Pastille, VERT, styleCarte} from "./communs";

// React Flow ne s'affiche que sur ordinateur et uniquement cote navigateur.
const CarteFlux = dynamic(() => import("./CarteFlux"), {ssr: false});

const ETATS = [
    {valeur: "non commence", libelle: "Non commencé"},
    {valeur: "en cours", libelle: "En cours"},
    {valeur: "maitrise", libelle: "Maîtrisé"},
];
const LARGEUR_PANNEAU = 400;
const BANDES_DU_RAIL = Object.fromEntries(RAILS.map(r => [r.id, r.bandes]));
const memesBandes = (a, b) => a.length === b.length && a.every(x => b.includes(x));
const MARGE_X = "clamp(12px, 1.6vw, 24px)";

// Ordinateur (>= 1024px), lu cote navigateur ; faux au rendu serveur (la liste mobile est alors
// affichee par CSS sur mobile, la carte apparait apres hydratation sur ordinateur).
const REQUETE_BUREAU = "(min-width: 1024px)";
function useEstBureau() {
    return useSyncExternalStore(
        rappel => {
            const m = window.matchMedia(REQUETE_BUREAU);
            m.addEventListener("change", rappel);
            return () => m.removeEventListener("change", rappel);
        },
        () => window.matchMedia(REQUETE_BUREAU).matches,
        () => false,
    );
}

const sansAccents = s => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

// ---------- barre d'outils ----------

function FiltreBandes({bandes, basculer, tout, externes, setExternes, nbProjets}) {
    const pastille = (actif, libelle, onClick, couleur) => (
        <Button key={libelle} variant="unstyled" onClick={onClick} aria-pressed={actif} display="inline-flex" alignItems="center"
                gap="6px" h={{base: "44px", lg: "30px"}} px={{base: 4, lg: "10px"}} borderRadius="999px" border="1px solid"
                fontSize="13px" fontWeight="600" flexShrink={0}
                borderColor={actif ? (couleur ?? "accent") : "line.strong"} bg={actif ? "chip.bg" : "transparent"}
                color={actif ? "fg.default" : "fg.muted"}>
            {couleur && <Box as="span" w="9px" h="9px" borderRadius="full" bg={couleur} aria-hidden="true"/>}
            {libelle}
        </Button>
    );
    return (
        <>
            <Flex role="group" aria-label="Filtrer la carte par bande" gap="6px" wrap={{base: "wrap", lg: "nowrap"}}>
                {pastille(bandes.length === 0, "Tout", tout)}
                {/* "Projets" : nombre de projets visibles (rattaches aux bandes choisies). */}
                {BANDES_CARTE.map(b => pastille(bandes.includes(b.id), b.id === "proj" ? `${b.court} · ${nbProjets}` : b.court,
                    () => basculer(b.id), `bande.${b.id}`))}
            </Flex>
            {/* Toujours active ; decochee par defaut : les autres bandes disparaissent completement. */}
            <Checkbox isChecked={externes} onChange={e => setExternes(e.target.checked)} minH={{base: "44px", lg: "30px"}}
                      colorScheme="brand" flexShrink={0} sx={{".chakra-checkbox__label": {fontSize: "13px", whiteSpace: "nowrap"}}}>
                Prérequis externes
            </Checkbox>
        </>
    );
}

// Recherche d'un noeud par code ("ML1") ou titre ; Entree = premier resultat.
function Recherche({noeuds, aller}) {
    const [texte, setTexte] = useState("");
    const [ouverte, setOuverte] = useState(false);
    const resultats = useMemo(() => {
        const q = sansAccents(texte.trim());
        if (!q) return [];
        return noeuds.map(n => {
            const {code, nom} = decouperTitre(n.titre);
            const c = sansAccents(code), t = sansAccents(nom);
            const rang = c === q ? 0 : c.startsWith(q) ? 1 : t.startsWith(q) ? 2 : t.includes(q) ? 3 : 9;
            return {n, rang};
        }).filter(x => x.rang < 9).sort((a, b) => a.rang - b.rang || a.n.titre.localeCompare(b.n.titre, "fr")).slice(0, 8).map(x => x.n);
    }, [texte, noeuds]);
    const choisir = id => {
        aller(id);
        setOuverte(false);
        setTexte("");
    };
    return (
        <Box position="relative" flexShrink={0} w={{base: "100%", lg: "220px"}}>
            <Input size="sm" h={{base: "44px", lg: "30px"}} borderRadius="999px" placeholder="Rechercher (ex. ML1)"
                   aria-label="Rechercher un nœud" role="combobox" aria-expanded={ouverte && resultats.length > 0}
                   aria-controls="recherche-resultats" aria-autocomplete="list"
                   value={texte} onChange={e => { setTexte(e.target.value); setOuverte(true); }}
                   onFocus={() => setOuverte(true)} onBlur={() => setTimeout(() => setOuverte(false), 150)}
                   onKeyDown={e => {
                       if (e.key === "Enter" && resultats[0]) { e.preventDefault(); choisir(resultats[0].id); }
                       if (e.key === "Escape") { setOuverte(false); setTexte(""); }
                   }}/>
            {ouverte && resultats.length > 0 && (
                <Box as="ul" id="recherche-resultats" role="listbox" position="absolute" top="calc(100% + 6px)" right={0} zIndex={20}
                     w="320px" maxH="60vh" overflowY="auto" listStyleType="none" m={0} p={1} bg="surface" border="1px solid"
                     borderColor="line.strong" borderRadius="10px" boxShadow="0 8px 24px rgba(21,22,26,.14)">
                    {resultats.map((n, i) => (
                        <Box as="li" key={n.id} role="option" aria-selected={i === 0}>
                            <Box as="button" type="button" w="100%" textAlign="left" px={3} py={2} borderRadius="8px" fontSize="14px"
                                 bg={i === 0 ? "chip.bg" : "transparent"} _hover={{bg: "chip.bg"}}
                                 onMouseDown={e => e.preventDefault()} onClick={() => choisir(n.id)}>
                                <Text as="span" fontFamily="mono" fontSize="12px" color={`bande.${n.bande}`} mr={2}>{NOM_BANDE[n.bande].court}</Text>
                                {n.titre}
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
}

// ---------- avancement (une ligne repliable) ----------

function Avancement({modele, bandes, filtrerRail, choisir, ouvert}) {
    return (
        <Box id="avancement-detail" hidden={!ouvert} as="ul" listStyleType="none" m={0} px={MARGE_X} py={2}
             borderBottom="1px solid" borderColor="line.subtle">
            {RAILS.map(r => {
                const a = avancement(modele, r.id);
                const pct = a.total ? Math.round((100 * a.maitrises) / a.total) : 0;
                const actif = memesBandes(bandes, BANDES_DU_RAIL[r.id]);
                const prochaine = a.prochaine && modele.parId.get(a.prochaine);
                return (
                    <Box as="li" key={r.id} display="grid" alignItems="center" columnGap={4} rowGap={1} py="2px"
                         gridTemplateColumns={{base: "minmax(0, 1fr) auto", lg: "110px 64px minmax(120px, 260px) minmax(0, 1fr)"}}>
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
    const [avancementOuvert, setAvancementOuvert] = useState(false);
    const [enCours, demarrer] = useTransition();
    const bureau = useEstBureau();

    // Noeuds affiches : vue courante, puis filtre par bande (les autres bandes disparaissent ;
    // prerequis externes en fantomes si la case est cochee).
    const affiches = useMemo(() => {
        const base = vue === "autour" ? autour.ids : noeuds.map(n => n.id);
        return filtrerParBandes(modele, base, bandes, {externes});
    }, [vue, autour, noeuds, modele, bandes, externes]);
    const disposition = useMemo(() => disposerFlux(modele, affiches.ids, {fantomes: affiches.fantomes}), [modele, affiches]);
    // Projets visibles (hors fantomes), pour le compteur de la pastille "Projets".
    const nbProjets = useMemo(() => affiches.ids.filter(id => !affiches.fantomes.has(id) && modele.parId.get(id).bande === "proj").length,
        [affiches, modele]);
    // Mobile : liste par bande (meme filtre, sans fantomes).
    const idsListe = useMemo(() => affiches.ids.filter(id => !affiches.fantomes.has(id)), [affiches]);

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

    // Recherche : centre et selectionne le noeud ; s'il n'est pas affiche, passe en carte complete
    // sans filtre.
    const affichesRef = useRef(affiches);
    affichesRef.current = affiches;
    const aller = useCallback(id => {
        if (!affichesRef.current.ids.includes(id)) {
            setVue("complete");
            setBandes([]);
        }
        setMessage("");
        setSelection(id);
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
    const resume = RAILS.map(r => {
        const a = avancement(modele, r.id);
        return `${r.nom} ${a.maitrises}/${a.total}`;
    }).join(" · ");

    return (
        // Ordinateur : exactement la hauteur de la fenetre, sans defilement de page. Panneau ouvert :
        // la page (et donc la vue React Flow) se reduit pour lui laisser la place.
        <Box as="main" display="flex" flexDirection="column" minH="100dvh" h={{lg: "100dvh"}} overflow={{lg: "hidden"}}
             pb={{base: ouvert ? "82dvh" : 16, lg: 0}} pr={{lg: ouvert ? `${LARGEUR_PANNEAU}px` : 0}}>
            {/* En-tete (44px sur ordinateur) : titre, avancement replie, liens. */}
            <Flex as="header" minH="44px" px={MARGE_X} py={{base: 3, lg: 0}} gap={{base: 2, lg: 4}} align={{lg: "center"}}
                  direction={{base: "column", lg: "row"}} borderBottom="1px solid" borderColor="line.subtle">
                <Heading as="h1" fontSize={{base: "28px", lg: "18px"}} flexShrink={0}>Où j’en suis</Heading>
                <Button variant="unstyled" display="inline-flex" alignItems="center" gap={2} h="32px" minW={0} fontWeight="400"
                        aria-expanded={avancementOuvert} aria-controls="avancement-detail"
                        onClick={() => setAvancementOuvert(o => !o)}>
                    <Box as="span" aria-hidden="true" transition="transform .15s ease"
                         transform={avancementOuvert ? "rotate(90deg)" : "none"}>›</Box>
                    <Text as="span" fontFamily="mono" fontSize="12px" textTransform="uppercase" letterSpacing="0.08em" color="fg.muted">
                        Avancement
                    </Text>
                    <Text as="span" fontSize="13px" color="fg.muted" noOfLines={1}>{resume}</Text>
                </Button>
                {vue === "autour" && autour.sansEnCours && (
                    <Text fontSize="13px" color="fg.faint" noOfLines={1} minW={0}>
                        Aucun nœud en cours : points d’entrée et ce qu’ils débloquent.
                    </Text>
                )}
                <Flex ml={{lg: "auto"}} gap={4} align="center" fontSize="14px" flexShrink={0}>
                    {estAdmin && <Link as={NextLink} href="/admin">← Admin</Link>}
                    <Link as={NextLink} href="/">Voir le site</Link>
                    <Box as="span" fontFamily="mono" fontSize="12px" px={3} py={1} borderRadius="999px" bg="chip.bg" color="chip.fg">
                        Non référencé · hors CV{estAdmin ? " · mode édition" : ""}
                    </Box>
                </Flex>
            </Flex>
            <Avancement modele={modele} bandes={bandes} filtrerRail={filtrerRail} choisir={choisir} ouvert={avancementOuvert}/>

            {/* Barre d'outils (44px sur ordinateur, defile horizontalement si la place manque). */}
            <Flex minH="44px" px={MARGE_X} py={{base: 3, lg: "7px"}} gap={3} align="center" wrap={{base: "wrap", lg: "nowrap"}}
                  overflowX={{lg: "auto"}} borderBottom="1px solid" borderColor="line.subtle" bg="surface"
                  sx={{scrollbarWidth: "thin"}}>
                <Box role="group" aria-label="Vue de la carte" display="inline-flex" border="1px solid" borderColor="line.strong"
                     borderRadius="999px" overflow="hidden" flexShrink={0}>
                    {[["autour", "Autour de moi"], ["complete", `Carte complète · ${noeuds.length}`]].map(([v, libelle], i) => (
                        <Button key={v} variant="unstyled" h={{base: "44px", lg: "30px"}} px={3} borderRadius={0} fontSize="13px"
                                fontWeight="600" aria-pressed={vue === v} onClick={() => setVue(v)} borderLeft={i ? "1px solid" : "none"}
                                borderColor="line.strong" bg={vue === v ? "accent" : "transparent"}
                                color={vue === v ? "accent.contrast" : "fg.muted"} whiteSpace="nowrap">
                            {libelle}
                        </Button>
                    ))}
                </Box>
                <FiltreBandes bandes={bandes} basculer={basculer} tout={() => setBandes([])} externes={externes} setExternes={setExternes}
                              nbProjets={nbProjets}/>
                <Box ml={{lg: "auto"}} w={{base: "100%", lg: "auto"}}><Recherche noeuds={noeuds} aller={aller}/></Box>
            </Flex>

            {/* Carte : tout le reste de la fenetre (ordinateur). */}
            <Box position="relative" flex={{lg: "1"}} minH={0} display={{base: "none", lg: "block"}}>
                {bureau && (disposition.noeuds.length ? (
                    <CarteFlux modele={modele} disposition={disposition} focus={focus} selection={selection} choisir={choisir}
                               survoler={setSurvol} vider={vider} cleCadrage={`${vue}|${bandes.join(",")}|${externes}`}/>
                ) : (
                    <Flex h="100%" align="center" justify="center" data-carte-cadre="">
                        <Text color="fg.muted">Rien à afficher pour ce filtre dans cette vue.</Text>
                    </Flex>
                ))}
            </Box>

            {/* Mobile : liste par bande, sans carte. */}
            <Box display={{base: "block", lg: "none"}} px={MARGE_X} mt={4}>
                {idsListe.length
                    ? <ListeParBande modele={modele} ids={idsListe} choisir={choisir} selection={selection}/>
                    : <Text py={8} color="fg.muted">Rien à afficher pour ce filtre dans cette vue.</Text>}
                <Box as="section" aria-labelledby="prochains-pas" mt={8}>
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
            </Box>

            <Panneau modele={modele} id={selection} ouvert={ouvert} fermer={vider} choisir={choisir} changerEtat={changerEtat}
                     enCours={enCours} message={message} estAdmin={estAdmin} chaine={chaine} setChaine={setChaine}/>
        </Box>
    );
}

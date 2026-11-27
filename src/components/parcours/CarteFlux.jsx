'use client'

// Carte du parcours rendue avec React Flow (@xyflow/react).
// - Positions calculees par src/lib/parcours/flux.js (bandes en lignes, colonnes = col d'origine).
// - Fonds de bande : noeuds "bande" non selectionnables, sous les cartes, etiquette = nom de bande.
// - Liens "smoothstep" a angles arrondis : un port et un couloir par lien, fleche a l'arrivee.
// - Clic sur une carte : surbrillance des liens directs (amont ambre, aval accent, 3px, animes),
//   le reste a 20 % ; recadrage doux (400 ms) sur le noeud et ses voisins.
// - Cadrage au chargement (et a chaque changement de vue ou de filtre) : noeuds en cours et leurs
//   voisins, sinon la premiere colonne ; zoom initial jamais sous 80 % (texte lisible).
// - Couleurs : variables CSS du theme Chakra (clair / sombre sans JavaScript), voir carte.css.
import {memo, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    Handle, MiniMap, Panel, Position, ReactFlow, ReactFlowProvider, getSmoothStepPath, useReactFlow, useViewport,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./carte.css";
import {Box, Button, Flex, Text} from "@chakra-ui/react";
import {decouperTitre} from "../../lib/parcours/modele";
import {CARTE, cibleInitiale, englobant, hauteurPort, vuePour, vueSelection} from "../../lib/parcours/flux";
import {ACCENT, AMBRE, ETIQUETTES, LIBELLES_STATUT, Legende, NOM_BANDE, roleLien, roleNoeud, styleCarte} from "./communs";

export const ZOOM_MIN = 0.3;
export const ZOOM_MAX = 2;
const ZOOM_LISIBLE = 0.8;      // zoom initial minimal : texte des cartes lisible sans zoomer
const DUREE = 400;

// ---------- noeuds ----------

const NoeudCarte = memo(function NoeudCarte({data}) {
    const {n, statut, fantome, role, selection, attenuation, ports, choisir, survoler} = data;
    const {code, nom} = decouperTitre(n.titre);
    const estProjet = n.bande === "proj";
    const depart = useRef(null);
    const surbrillance = role === "amont" ? {borderColor: AMBRE, borderStyle: "solid", opacity: 1}
        : role === "aval" ? {borderColor: "accent", borderStyle: "solid", opacity: 1}
            : role === "autre" ? {opacity: attenuation} : {};
    return (
        <>
            {Array.from({length: ports.entrees}, (_, i) => (
                <Handle key={`t${i}`} id={`t${i}`} type="target" position={Position.Left} isConnectable={false}
                        style={{top: hauteurPort(i, ports.entrees)}}/>
            ))}
            <Box as="button" type="button" data-noeud={n.id} data-fantome={fantome ? "" : undefined} data-role={role ?? undefined}
                 aria-pressed={selection}
                 aria-label={`${n.titre} – ${LIBELLES_STATUT[statut]}${estProjet ? ", projet d’apprentissage" : ""}${fantome ? `, prérequis externe (${NOM_BANDE[n.bande].nom})` : ""}`}
                 // Le cadre React Flow ne recoit pas les evenements (noeud non selectionnable) : la carte, si.
                 style={{pointerEvents: "all"}}
                 onPointerDown={e => { depart.current = {x: e.clientX, y: e.clientY}; }}
                 // Un glisser (deplacement de la carte) qui finit sur une carte n'est pas un clic.
                 onClick={e => {
                     const d = depart.current;
                     if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 4) return;
                     choisir(n.id);
                 }}
                 onMouseEnter={() => survoler(n.id)} onMouseLeave={() => survoler(null)}
                 display="block" w={`${CARTE.largeur}px`} h={`${CARTE.hauteur}px`} borderRadius="10px" px={3} py="6px"
                 textAlign="left" overflow="hidden" cursor="pointer"
                 borderLeftWidth="4px" borderLeftColor={`bande.${n.bande}`}
                 transition="opacity .2s ease, box-shadow .2s ease"
                 {...styleCarte(statut, estProjet, selection, fantome)} {...surbrillance}
                 borderWidth={role === "amont" || role === "aval" ? "2px" : undefined}>
                <Flex justify="space-between" align="center" gap={2} lineHeight="18px">
                    <Text as="span" fontFamily="mono" fontSize="13px" fontWeight="600" opacity={0.85}>
                        {code}{estProjet && " · projet"}
                    </Text>
                    {ETIQUETTES[statut] && !fantome && (
                        <Text as="span" fontSize="13px" fontWeight="700"
                              color={statut === "en-cours" ? "#7A5207" : statut === "maitrise" ? "success.fg" : "accent"}>
                            {ETIQUETTES[statut]}
                        </Text>
                    )}
                </Flex>
                {/* Titre entier sur 2 lignes au plus (titre le plus long : 44 caracteres). */}
                <Text as="span" data-titre="" display="block" mt="2px" fontSize="14px" fontWeight="600" lineHeight="18px">
                    {nom}
                </Text>
            </Box>
            {Array.from({length: ports.sorties}, (_, i) => (
                <Handle key={`s${i}`} id={`s${i}`} type="source" position={Position.Right} isConnectable={false}
                        style={{top: hauteurPort(i, ports.sorties)}}/>
            ))}
        </>
    );
});

// Fond de bande : sous les cartes, ne capte aucun evenement (clic dans le vide = pane).
const NoeudBande = memo(function NoeudBande({data}) {
    return (
        <Box data-bande={data.bande} w="100%" h="100%" borderTop="1px solid" borderColor="line.subtle"
             borderLeft="4px solid" borderLeftColor={`bande.${data.bande}`} bg={`color-mix(in srgb, var(--chakra-colors-bande-${data.bande}) 4%, transparent)`}
             opacity={data.fantome ? 0.6 : 1}>
            <Text display="inline-block" mt={2} ml={4} fontFamily="mono" fontSize="13px" letterSpacing="0.08em"
                  textTransform="uppercase" color={`bande.${data.bande}`} fontWeight="600">
                {data.fantome ? `Prérequis externes · ${data.nom}` : data.nom}
            </Text>
        </Box>
    );
});

// ---------- liens ----------

const LienFlux = memo(function LienFlux({id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data}) {
    const [d] = getSmoothStepPath({
        sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, borderRadius: 10, offset: 16,
        ...(data.centreX !== undefined ? {centerX: data.centreX} : {}),
    });
    const {role, leger} = data;
    const allume = role === "amont" || role === "aval";
    const couleur = role === "amont" ? AMBRE : role === "aval" ? ACCENT
        : data.accent ? ACCENT : "var(--chakra-colors-line-strong)";
    const opacite = role === "autre" ? data.attenuation : allume ? 1 : data.attenue ? 0.35 : 1;
    const fleche = role === "amont" ? "ambre" : allume || data.accent ? "accent" : "gris";
    return (
        <path d={d} data-lien={id} data-role={role ?? undefined} className="react-flow__edge-path" fill="none"
              markerEnd={`url(#parcours-fleche-${fleche})`}
              style={{
                  stroke: couleur, opacity: opacite, strokeLinejoin: "round",
                  strokeWidth: allume ? (leger ? 2.5 : 3) : data.accent ? 2 : 1.5,
                  // Liens en surbrillance : animes (tirets qui avancent vers la cible).
                  strokeDasharray: allume && !leger ? "8 5" : data.fantome ? "4 4" : undefined,
                  animation: allume && !leger ? "dashdraw .6s linear infinite" : undefined,
                  transition: "opacity .2s ease",
              }}/>
    );
});

const TYPES_NOEUDS = {carte: NoeudCarte, bande: NoeudBande};
const TYPES_LIENS = {lien: LienFlux};

// ---------- controles ----------

function Zoom({ajuster}) {
    const rf = useReactFlow();
    const {zoom} = useViewport();
    const bouton = {variant: "unstyled", h: "32px", minW: "32px", px: 2, fontSize: "16px", fontWeight: "600",
        display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", _hover: {bg: "chip.bg"}};
    return (
        <Flex role="group" aria-label="Zoom de la carte" align="center" gap={1} p={1} bg="surface" border="1px solid"
              borderColor="line.strong" borderRadius="10px">
            <Button {...bouton} aria-label="Dézoomer" isDisabled={zoom <= ZOOM_MIN + 0.001} onClick={() => rf.zoomOut({duration: 200})}>−</Button>
            <Text as="span" fontFamily="mono" fontSize="12px" minW="44px" textAlign="center" color="fg.muted">{Math.round(zoom * 100)} %</Text>
            <Button {...bouton} aria-label="Zoomer" isDisabled={zoom >= ZOOM_MAX - 0.001} onClick={() => rf.zoomIn({duration: 200})}>+</Button>
            <Button {...bouton} px={3} fontSize="13px" onClick={ajuster}>Ajuster</Button>
        </Flex>
    );
}

function BoutonLegende() {
    const [ouverte, setOuverte] = useState(false);
    return (
        <Box position="relative">
            {ouverte && (
                <Box id="legende-carte" position="absolute" bottom="44px" left={0} w="360px" p={3} bg="surface" border="1px solid"
                     borderColor="line.strong" borderRadius="10px" boxShadow="0 8px 24px rgba(21,22,26,.12)">
                    <Legende/>
                </Box>
            )}
            <Button variant="unstyled" w="36px" h="36px" borderRadius="full" bg="surface" border="1px solid" borderColor="line.strong"
                    fontWeight="700" aria-label="Légende" aria-expanded={ouverte} aria-controls="legende-carte"
                    onClick={() => setOuverte(o => !o)}>?</Button>
        </Box>
    );
}

// ---------- carte ----------

function Carte({modele, disposition, focus, selection, choisir, survoler, vider, cleCadrage}) {
    const rf = useReactFlow();
    const cadreRef = useRef(null);
    const attenuation = focus ? (focus.leger ? 0.45 : 0.2) : null;

    const nodes = useMemo(() => [
        ...disposition.bandes.map(b => ({
            id: `bande-${b.bande}`, type: "bande", position: {x: 0, y: b.y}, data: b, zIndex: -1,
            width: disposition.largeur, height: b.hauteur, selectable: false, draggable: false, focusable: false,
        })),
        ...disposition.noeuds.map(c => ({
            id: c.id, type: "carte", position: {x: c.x, y: c.y}, width: CARTE.largeur, height: CARTE.hauteur,
            selectable: false, draggable: false, focusable: false,
            data: {
                n: modele.parId.get(c.id), statut: c.statut, fantome: c.fantome, ports: c.ports, role: roleNoeud(c.id, focus),
                selection: selection === c.id, attenuation, choisir, survoler,
            },
        })),
    ], [disposition, modele, focus, selection, attenuation, choisir, survoler]);

    // Liens en surbrillance dessines en dernier : au-dessus des autres liens, mais sous les cartes.
    const edges = useMemo(() => disposition.liens.map(l => {
        const role = roleLien(l, focus);
        return {
            id: l.id, type: "lien", source: l.source, target: l.target, sourceHandle: `s${l.sortie}`, targetHandle: `t${l.entree}`,
            selectable: false, focusable: false, data: {...l, role, attenuation, leger: focus?.leger},
        };
    }).sort((a, b) => Number(["amont", "aval"].includes(a.data.role)) - Number(["amont", "aval"].includes(b.data.role))),
    [disposition, focus, attenuation]);

    // Taille de la zone visible de la carte.
    const taille = () => {
        const el = cadreRef.current;
        return el ? {l: el.clientWidth, h: el.clientHeight} : null;
    };

    // Cadrage au chargement et a chaque changement de vue / filtre (anime, 400 ms).
    useEffect(() => {
        const id = requestAnimationFrame(() => {
            const t = taille();
            const cible = cibleInitiale(modele, disposition.noeuds);
            const r = englobant(disposition.noeuds, cible);
            if (!t || !r) return;
            // Sans noeud en cours, la cible est la premiere colonne : calee a gauche.
            const premiereColonne = !disposition.noeuds.some(n => n.statut === "en-cours" && !n.fantome);
            rf.setViewport(vuePour(r, t.l, t.h, {zoomMin: ZOOM_LISIBLE, aGauche: premiereColonne}), {duration: DUREE});
        });
        return () => cancelAnimationFrame(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cleCadrage]);

    // Selection : recadrage doux sur le noeud et ses voisins directs, apres le redimensionnement du
    // a l'ouverture du panneau.
    useEffect(() => {
        if (!selection) return undefined;
        const presents = new Set(disposition.noeuds.map(n => n.id));
        if (!presents.has(selection)) return undefined;
        const voisins = new Set([selection, ...modele.parId.get(selection).prerequis, ...modele.successeurs.get(selection)]
            .filter(id => presents.has(id)));
        const minuterie = setTimeout(() => {
            const t = taille();
            if (!t) return;
            const vue = vueSelection(englobant(disposition.noeuds, voisins), englobant(disposition.noeuds, new Set([selection])),
                t.l, t.h, rf.getZoom(), {zoomMin: ZOOM_LISIBLE});
            rf.setViewport(vue, {duration: DUREE});
        }, 60);
        return () => clearTimeout(minuterie);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selection, cleCadrage]);

    const ajuster = useCallback(() => rf.fitView({duration: DUREE, padding: 0.05, minZoom: ZOOM_MIN, maxZoom: 1}), [rf]);

    return (
        <Box ref={cadreRef} data-carte-cadre="" className="parcours-flux" position="absolute" inset={0} bg="canvas">
            {/* Fleches des liens (couleurs du theme via style, clair et sombre). */}
            <svg width="0" height="0" style={{position: "absolute"}} aria-hidden="true">
                <defs>
                    {[["gris", "var(--chakra-colors-fg-faint)"], ["accent", ACCENT], ["ambre", AMBRE]].map(([c, couleur]) => (
                        <marker key={c} id={`parcours-fleche-${c}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7"
                                markerHeight="7" orient="auto-start-reverse">
                            <path d="M0,0 L10,5 L0,10 z" style={{fill: couleur}}/>
                        </marker>
                    ))}
                </defs>
            </svg>
            <ReactFlow nodes={nodes} edges={edges} nodeTypes={TYPES_NOEUDS} edgeTypes={TYPES_LIENS}
                       minZoom={ZOOM_MIN} maxZoom={ZOOM_MAX} defaultViewport={{x: 0, y: 0, zoom: 1}}
                       nodesDraggable={false} nodesConnectable={false} elementsSelectable={false}
                       nodesFocusable={false} edgesFocusable={false} deleteKeyCode={null} selectionKeyCode={null}
                       multiSelectionKeyCode={null} zoomOnDoubleClick={false} onPaneClick={vider}
                       aria-label="Carte du parcours">
                <Panel position="bottom-left"><BoutonLegende/></Panel>
                <MiniMap position="bottom-right" pannable zoomable ariaLabel="Mini-carte"
                         nodeColor={n => (n.type === "bande" ? "transparent" : `var(--chakra-colors-bande-${n.data.n.bande})`)}
                         nodeStrokeColor="transparent" nodeBorderRadius={4}
                         style={{width: 200, height: 130}}/>
                <Panel position="bottom-right" style={{marginRight: 230}}><Zoom ajuster={ajuster}/></Panel>
            </ReactFlow>
        </Box>
    );
}

export default function CarteFlux(props) {
    return (
        <ReactFlowProvider>
            <Carte {...props}/>
        </ReactFlowProvider>
    );
}

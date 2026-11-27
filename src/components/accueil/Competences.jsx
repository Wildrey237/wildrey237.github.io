'use client'

// Competences : une carte par categorie (hauteur selon le contenu). Chaque competence est une
// pastille (<button>) qui ouvre une bulle avec son explication :
// - ordinateur : au survol (~150 ms) et au focus clavier ;
// - ecran tactile : au toucher, fermeture en touchant ailleurs ;
// - Echap ferme ; une seule bulle ouverte a la fois ;
// - au-dessus de la pastille, en dessous s'il n'y a pas la place, jamais hors de l'ecran (320px max).
// Le texte des bulles est toujours present dans le HTML (masque), donc lisible sans JavaScript.
import {useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
import {Box, Grid, Heading} from "@chakra-ui/react";
import {useTranslation} from "react-i18next";
import {useDonnees} from "../../data/DonneesContext";
import {APPARITION, Section} from "./communs";
import {IconeTechno, iconeCompetence} from "./icones";

const DELAI_SURVOL = 150;
const VISIBLES = 8;
const MARGE = 8;
const LARGEUR_MAX = 320;

function Pastille({competence, ouverte, ouvrir, fermer}) {
    const bouton = useRef(null);
    const bulle = useRef(null);
    const minuterie = useRef(null);
    const dernierPointeur = useRef("mouse");
    // Vrai entre pointerdown et click : le focus vient alors d'un pointeur, pas du clavier.
    const pointeurAppuye = useRef(false);
    const [position, setPosition] = useState(null);
    const id = `bulle-${competence.id}`;
    // Pastille "+N" : la bulle liste les competences restantes (avec leur explication).
    const reste = competence.reste;
    const explication = reste?.length ? "reste" : competence.desc?.trim();
    const icone = reste ? null : iconeCompetence(competence.name);

    const annuler = () => clearTimeout(minuterie.current);

    // Placement : au-dessus si possible, sinon en dessous ; borne horizontalement a l'ecran.
    const placer = useCallback(() => {
        if (!bouton.current || !bulle.current) return;
        const r = bouton.current.getBoundingClientRect();
        const largeur = Math.min(LARGEUR_MAX, window.innerWidth - 2 * MARGE);
        bulle.current.style.width = `${largeur}px`;
        const hauteur = bulle.current.offsetHeight;
        const dessus = r.top - hauteur - MARGE >= MARGE;
        const left = Math.min(Math.max(r.left + r.width / 2 - largeur / 2, MARGE), window.innerWidth - largeur - MARGE);
        setPosition({top: dessus ? r.top - hauteur - MARGE : r.bottom + MARGE, left, dessus});
    }, []);

    useLayoutEffect(() => {
        if (ouverte) placer();
        else setPosition(null);
    }, [ouverte, placer]);

    // Bulle ouverte : suit le defilement, se ferme avec Echap ou un toucher ailleurs.
    useEffect(() => {
        if (!ouverte) return;
        const surTouche = e => {
            if (e.key === "Escape") fermer(competence.id);
        };
        const surPointeur = e => {
            if (!bouton.current?.contains(e.target) && !bulle.current?.contains(e.target)) fermer(competence.id);
        };
        window.addEventListener("scroll", placer, {passive: true});
        window.addEventListener("resize", placer);
        document.addEventListener("keydown", surTouche);
        document.addEventListener("pointerdown", surPointeur);
        return () => {
            window.removeEventListener("scroll", placer);
            window.removeEventListener("resize", placer);
            document.removeEventListener("keydown", surTouche);
            document.removeEventListener("pointerdown", surPointeur);
        };
    }, [ouverte, placer, fermer, competence.id]);

    useEffect(() => annuler, []);

    const contenu = (
        <>
            <IconeTechno icone={icone}/>
            <span>{competence.name}</span>
            {/* Indicateur discret : cette pastille a une explication. */}
            {explication && !reste && <Box as="span" w="5px" h="5px" borderRadius="full" bg="currentColor" opacity={0.45} aria-hidden="true"/>}
        </>
    );
    const styles = {
        display: "inline-flex", alignItems: "center", gap: "6px", bg: "chip.bg", color: "chip.fg",
        px: "10px", py: "6px", minH: "32px", borderRadius: "6px", fontSize: "13px", fontWeight: "500",
        lineHeight: "1.35", textAlign: "left",
    };

    if (!explication) return <Box as="li" {...styles}>{contenu}</Box>;

    return (
        // <li> ordinaire (pas display: contents, qui casse la semantique de liste dans Safari).
        <Box as="li">
            <Box
                as="button"
                type="button"
                ref={bouton}
                aria-expanded={ouverte}
                aria-describedby={id}
                aria-label={reste ? `${competence.name} : ${reste.length} autre${reste.length > 1 ? "s" : ""} compétence${reste.length > 1 ? "s" : ""}` : undefined}
                {...styles}
                cursor="help"
                transition="box-shadow .15s ease"
                _hover={{boxShadow: "inset 0 0 0 1px currentColor"}}
                _focusVisible={{outline: "2px solid", outlineColor: "accent", outlineOffset: "2px"}}
                onPointerDown={e => {
                    dernierPointeur.current = e.pointerType;
                    pointeurAppuye.current = true;
                }}
                onPointerEnter={e => {
                    if (e.pointerType !== "mouse") return;
                    annuler();
                    minuterie.current = setTimeout(() => ouvrir(competence.id), DELAI_SURVOL);
                }}
                onPointerLeave={e => {
                    if (e.pointerType !== "mouse") return;
                    annuler();
                    minuterie.current = setTimeout(() => fermer(competence.id), 120);
                }}
                // Focus clavier uniquement (souris : survol ; toucher : clic).
                onFocus={() => {
                    if (!pointeurAppuye.current) ouvrir(competence.id);
                }}
                onBlur={() => fermer(competence.id)}
                onClick={() => {
                    // Toucher : bascule. Souris et clavier : deja ouverte par survol / focus.
                    if (pointeurAppuye.current && dernierPointeur.current !== "mouse") {
                        if (ouverte) fermer(competence.id);
                        else ouvrir(competence.id);
                    }
                    pointeurAppuye.current = false;
                    dernierPointeur.current = "mouse";
                }}
            >
                {contenu}
            </Box>
            <Box
                ref={bulle}
                id={id}
                role="tooltip"
                hidden={!ouverte}
                position="fixed"
                zIndex={150}
                top={position ? `${position.top}px` : "-9999px"}
                left={position ? `${position.left}px` : "-9999px"}
                visibility={position ? "visible" : "hidden"}
                bg="surface"
                color="fg.muted"
                border="1px solid"
                borderColor="line.strong"
                borderRadius="10px"
                boxShadow="0 8px 24px rgba(21,22,26,0.12)"
                px={4}
                py={3}
                fontSize="14px"
                lineHeight="1.6"
                onPointerEnter={e => e.pointerType === "mouse" && annuler()}
                onPointerLeave={e => {
                    if (e.pointerType === "mouse") minuterie.current = setTimeout(() => fermer(competence.id), 120);
                }}
            >
                {reste ? (
                    <Box as="ul" listStyleType="none" p={0} m={0} maxH="50vh" overflowY="auto">
                        {reste.map(r => (
                            <Box as="li" key={r.id ?? r.name} _notFirst={{mt: 3}}>
                                <Box as="strong" display="flex" alignItems="center" gap="6px" color="fg.default" fontWeight="600">
                                    <IconeTechno icone={iconeCompetence(r.name)}/>{r.name}
                                </Box>
                                {r.desc}
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <>
                        <Box as="strong" display="block" color="fg.default" fontWeight="600" mb={1}>{competence.name}</Box>
                        {explication}
                    </>
                )}
            </Box>
        </Box>
    );
}

export default function Competences() {
    const {t} = useTranslation();
    const {skills} = useDonnees();
    const categories = Object.entries(skills).filter(([, liste]) => liste.length);
    // Une seule bulle ouverte a la fois.
    const [ouverte, setOuverte] = useState(null);
    const ouvrir = useCallback(id => setOuverte(id), []);
    const fermer = useCallback(id => setOuverte(courante => (courante === id ? null : courante)), []);

    return (
        <Section id="competences" titre={t("skills.title")} intro={t("skills.intro")}>
            {/* 1 colonne en mobile, 2 des 768px, 3 des 1024px, 4 des 1440px ; cartes d'une meme
                rangee a la meme hauteur. */}
            <Grid gap={4} alignItems="stretch" templateColumns="1fr" sx={{
                "@media (min-width: 768px)": {gridTemplateColumns: "repeat(2, minmax(0, 1fr))"},
                "@media (min-width: 1024px)": {gridTemplateColumns: "repeat(3, minmax(0, 1fr))"},
                "@media (min-width: 1440px)": {gridTemplateColumns: "repeat(4, minmax(0, 1fr))"},
            }}>
                {categories.map(([categorie, liste]) => (
                    <Box key={categorie} as="article" bg="surface" border="1px solid" borderColor="line.strong"
                         borderRadius="14px" p={5} {...APPARITION}>
                        <Heading as="h3" fontSize="17px">{t(`skills.categories.${categorie}`)}</Heading>
                        <Box as="ul" listStyleType="none" display="flex" flexWrap="wrap" gap={2} p={0} m={0} mt={4}>
                            {/* 8 competences au plus ; au-dela, une pastille "+N" ouvre le reste dans une bulle. */}
                            {[...liste.slice(0, VISIBLES),
                                ...(liste.length > VISIBLES
                                    ? [{id: `${categorie}-reste`, name: `+${liste.length - VISIBLES}`, reste: liste.slice(VISIBLES)}]
                                    : []),
                            ].map(s => (
                                <Pastille key={s.id ?? s.name} competence={s} ouverte={ouverte === (s.id ?? s.name)}
                                          ouvrir={ouvrir} fermer={fermer}/>
                            ))}
                        </Box>
                    </Box>
                ))}
            </Grid>
        </Section>
    );
}

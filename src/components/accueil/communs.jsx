'use client'

// Briques communes de l'accueil : section, etiquette monospace, puces, texte riche, CV.
import {Box, Container, Grid, Heading, Text} from "@chakra-ui/react";

export const LARGEUR = "1200px";
export const MARGES = {base: 5, md: 8};

// Etiquette en JetBrains Mono, petites capitales 11-12px.
export function Etiquette({children, ...props}) {
    return (
        <Text as="span" display="block" fontFamily="mono" fontSize="12px" fontWeight="500"
              letterSpacing="0.08em" textTransform="uppercase" color="fg.faint" {...props}>
            {children}
        </Text>
    );
}

// Periode (experiences, formation) : monospace, minuscules, sur une ligne a partir de md.
export function Periode({children, ...props}) {
    return (
        <Text as="p" fontFamily="mono" fontSize="13px" color="fg.faint" lineHeight="1.6"
              whiteSpace={{md: "nowrap"}} {...props}>
            {children}
        </Text>
    );
}

// Attribut des elements animes a l'apparition (voir src/lib/apparition.js).
export const APPARITION = {"data-apparition": ""};

// Liste de puces (tags).
export function Puces({items, ...props}) {
    if (!items?.length) return null;
    return (
        <Box as="ul" listStyleType="none" display="flex" flexWrap="wrap" gap={2} p={0} m={0} {...props}>
            {items.map(item => (
                <Box as="li" key={item} bg="chip.bg" color="chip.fg" px="10px" py="4px"
                     borderRadius="6px" fontSize="13px" fontWeight="500" lineHeight="1.4">
                    {item}
                </Box>
            ))}
        </Box>
    );
}

// Texte du CV : paragraphes separes par une ligne vide ; lignes "•" ou "-" en liste a puces.
export function TexteRiche({texte, ...props}) {
    if (!texte) return null;
    const blocs = texte.split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
    return (
        <Box color="fg.muted" fontSize="15px" lineHeight="1.7" {...props}>
            {blocs.map((bloc, i) => {
                const lignes = bloc.split("\n").map(l => l.trim()).filter(Boolean);
                const puces = lignes.filter(l => /^[•\-–]\s*/.test(l));
                const autres = lignes.filter(l => !/^[•\-–]\s*/.test(l));
                return (
                    <Box key={i} mt={i ? 3 : 0}>
                        {autres.map((l, j) => <Text key={j} mt={j ? 1 : 0}>{l}</Text>)}
                        {puces.length > 0 && (
                            <Box as="ul" pl={5} mt={autres.length ? 2 : 0} sx={{"li + li": {mt: 1.5}}}>
                                {puces.map((l, j) => <li key={j}>{l.replace(/^[•\-–]\s*/, "")}</li>)}
                            </Box>
                        )}
                    </Box>
                );
            })}
        </Box>
    );
}

// Premier paragraphe d'un texte (resume court) et le reste (detail).
export function couper(texte) {
    const blocs = (texte ?? "").split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
    return {resume: blocs[0] ?? "", suite: blocs.slice(1).join("\n\n")};
}

// "Voir le detail" depliable, natif (<details>) : fonctionne sans JavaScript.
export function Detail({libelle, children}) {
    return (
        <Box as="details" mt={3} sx={{
            "& > summary": {
                listStyle: "none", cursor: "pointer", display: "inline-flex", alignItems: "center",
                minH: "44px", color: "accent", fontWeight: 600, fontSize: "14px",
            },
            "& > summary::-webkit-details-marker": {display: "none"},
            "& > summary::after": {content: '"+"', ml: 2, fontFamily: "mono"},
            "&[open] > summary::after": {content: '"−"'},
            "& > summary:focus-visible": {outline: "2px solid", outlineColor: "accent", outlineOffset: "2px", borderRadius: "4px"},
        }}>
            <summary>{libelle}</summary>
            <Box pt={1}>{children}</Box>
        </Box>
    );
}

// Section de l'accueil. colonnes : titre a gauche (colle en haut), contenu a droite.
export function Section({id, titre, intro, colonnes = false, children, ...props}) {
    const entete = (
        <Box mb={colonnes ? 0 : {base: 8, md: 10}} maxW="60ch" {...APPARITION}>
            <Heading as="h2" id={`${id}-titre`} fontSize={{base: "28px", md: "36px"}} lineHeight="1.15">
                {titre}
            </Heading>
            {intro && <Text mt={3} color="fg.muted" fontSize="16px">{intro}</Text>}
        </Box>
    );
    return (
        <Box as="section" id={id} aria-labelledby={`${id}-titre`} py={{base: 14, md: 20}}
             borderTop="1px solid" borderColor="line.subtle" {...props}>
            <Container maxW={LARGEUR} px={MARGES}>
                {colonnes ? (
                    <Grid templateColumns={{base: "1fr", lg: "260px 1fr"}} gap={{base: 8, lg: 16}}>
                        <Box><Box position={{lg: "sticky"}} top="96px">{entete}</Box></Box>
                        <Box minW={0}>{children}</Box>
                    </Grid>
                ) : (
                    <>{entete}{children}</>
                )}
            </Container>
        </Box>
    );
}

// CV en PDF selon la langue, avec l'evenement GA4 "download_cv".
export function lienCv(langue) {
    return langue === "fr" ? "/cv/cv-francais.pdf" : "/cv/cv-anglais.pdf";
}

export function suivreCv(langue) {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
        window.gtag("event", "download_cv", {event_category: "engagement", event_label: `CV ${langue.toUpperCase()}`, value: 1});
    }
}

'use client'

// Experiences : titre a gauche, liste a droite, dates en monospace dans une colonne fixe.
// Resume court (premier paragraphe) + "Voir le detail" qui deplie le texte complet.
import {Box, Grid, Heading, Link, Text} from "@chakra-ui/react";
import {useTranslation} from "react-i18next";
import {useDonnees} from "../../data/DonneesContext";
import Logo from "./Logo";
import {APPARITION, Detail, Periode, Puces, Section, TexteRiche, couper} from "./communs";

const TAGS_VISIBLES = 6;

function Experience({exp}) {
    const {t} = useTranslation();
    const {resume, suite} = couper(exp.description);
    const detail = [suite, exp.descriptionMore].filter(Boolean).join("\n\n");
    const tags = exp.tags ?? [];
    const tagsCaches = tags.slice(TAGS_VISIBLES);
    // Zones : mobile empile ; tablette date | logo + contenu ; a partir de 1280px trois colonnes
    // (date et logo | contenu | tags). Une seule copie de chaque element dans le HTML.
    return (
        <Grid as="li" py={8} borderTop="1px solid" borderColor="line.subtle" _first={{borderTop: "none", pt: 0}}
              columnGap={{base: 4, md: 6}} rowGap={2} alignItems="start" {...APPARITION}
              templateColumns={{base: "40px minmax(0, 1fr)", md: "190px 40px minmax(0, 1fr)", xl: "190px minmax(0, 1fr) 280px"}}
              templateAreas={{
                  base: `"date date" "logo titre" "corps corps" "tags tags"`,
                  md: `"date logo titre" ". corps corps" ". tags tags"`,
                  xl: `"date titre tags" "date corps tags"`,
              }}>
            {/* A partir de 1280px, le logo est sous la date (meme cellule) ; avant, a cote du titre.
                Logo decoratif (alt vide) : sa presence en double dans le HTML est sans effet. */}
            <Box gridArea="date">
                <Periode pt={{md: "3px"}}>{exp.dates}</Periode>
                <Box display={{base: "none", xl: "block"}} mt={3}><Logo src={exp.logo} nom={exp.company}/></Box>
            </Box>
            <Box gridArea="logo" display={{base: "block", xl: "none"}}><Logo src={exp.logo} nom={exp.company}/></Box>
            <Box gridArea="titre" minW={0}>
                <Heading as="h3" fontSize="20px" lineHeight="1.3">{exp.title}</Heading>
                <Text mt={1} color="fg.muted" fontSize="15px">
                    {exp.website ? (
                        <Link href={exp.website} isExternal fontWeight="600">{exp.company}</Link>
                    ) : (
                        <Box as="span" fontWeight="600" color="fg.default">{exp.company}</Box>
                    )}
                    {exp.city && <> · {exp.city}</>}
                </Text>
            </Box>
            <Box gridArea="corps" minW={0}>
                <TexteRiche texte={resume} mt={{base: 1, xl: 2}}/>
                {(detail || tagsCaches.length > 0) && (
                    <Detail libelle={t("experiences.seeDetail")}>
                        {detail && <TexteRiche texte={detail}/>}
                        <Puces items={tagsCaches} mt={detail ? 4 : 1}/>
                    </Detail>
                )}
            </Box>
            <Box gridArea="tags" pt={{xl: 1}}>
                <Puces items={tags.slice(0, TAGS_VISIBLES)} mt={{base: 2, xl: 0}}/>
            </Box>
        </Grid>
    );
}

export default function Experiences() {
    const {t} = useTranslation();
    const {experiences} = useDonnees();
    return (
        <Section id="experiences" titre={t("experiences.title")} intro={t("experiences.intro")} colonnes>
            <Box as="ol" listStyleType="none" p={0} m={0}>
                {experiences.map(exp => <Experience key={exp.id ?? exp.title} exp={exp}/>)}
            </Box>
        </Section>
    );
}

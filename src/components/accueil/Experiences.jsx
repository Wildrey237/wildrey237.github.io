'use client'

// Experiences : titre a gauche, liste a droite, dates en monospace dans une colonne fixe.
// Resume court (premier paragraphe) + "Voir le detail" qui deplie le texte complet.
import {Box, Flex, Grid, Heading, Link, Text} from "@chakra-ui/react";
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
    return (
        <Grid as="li" templateColumns={{base: "1fr", md: "190px minmax(0, 1fr)"}} gap={{base: 2, md: 6}}
              py={8} borderTop="1px solid" borderColor="line.subtle" _first={{borderTop: "none", pt: 0}} {...APPARITION}>
            <Periode pt={{md: "3px"}}>{exp.dates}</Periode>
            <Box>
                <Flex gap={4} align="flex-start">
                    <Logo src={exp.logo} nom={exp.company}/>
                    <Box minW={0}>
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
                </Flex>
                <TexteRiche texte={resume} mt={3}/>
                <Puces items={tags.slice(0, TAGS_VISIBLES)} mt={4}/>
                {(detail || tagsCaches.length > 0) && (
                    <Detail libelle={t("experiences.seeDetail")}>
                        {detail && <TexteRiche texte={detail}/>}
                        <Puces items={tagsCaches} mt={detail ? 4 : 1}/>
                    </Detail>
                )}
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

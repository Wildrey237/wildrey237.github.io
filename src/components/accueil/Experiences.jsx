'use client'

// Experiences : titre a gauche, liste a droite, dates en monospace dans une colonne fixe.
// Resume court (premier paragraphe) + "Voir le detail" qui deplie le texte complet.
import {Box, Grid, Heading, Link, Text} from "@chakra-ui/react";
import {useTranslation} from "react-i18next";
import {useDonnees} from "../../data/DonneesContext";
import {Detail, Etiquette, Puces, Section, TexteRiche, couper} from "./communs";

function Experience({exp}) {
    const {t} = useTranslation();
    const {resume, suite} = couper(exp.description);
    const detail = [suite, exp.descriptionMore].filter(Boolean).join("\n\n");
    return (
        <Grid as="li" templateColumns={{base: "1fr", md: "170px minmax(0, 1fr)"}} gap={{base: 2, md: 8}}
              py={8} borderTop="1px solid" borderColor="line.subtle" _first={{borderTop: "none", pt: 0}}>
            <Etiquette as="p" pt={{md: "5px"}} lineHeight="1.6">{exp.dates}</Etiquette>
            <Box>
                <Heading as="h3" fontSize="20px" lineHeight="1.3">{exp.title}</Heading>
                <Text mt={1} color="fg.muted" fontSize="15px">
                    {exp.website ? (
                        <Link href={exp.website} isExternal fontWeight="600">{exp.company}</Link>
                    ) : (
                        <Box as="span" fontWeight="600" color="fg.default">{exp.company}</Box>
                    )}
                    {exp.city && <> · {exp.city}</>}
                </Text>
                <TexteRiche texte={resume} mt={3}/>
                {detail && (
                    <Detail libelle={t("experiences.seeDetail")}>
                        <TexteRiche texte={detail}/>
                    </Detail>
                )}
                <Puces items={exp.tags} mt={4}/>
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

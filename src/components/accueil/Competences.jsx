'use client'

// Competences : une carte par categorie (grille auto-fill, 260px minimum).
import {Box, Grid, Heading} from "@chakra-ui/react";
import {useTranslation} from "react-i18next";
import {useDonnees} from "../../data/DonneesContext";
import {APPARITION, Puces, Section} from "./communs";

export default function Competences() {
    const {t} = useTranslation();
    const {skills} = useDonnees();
    const categories = Object.entries(skills).filter(([, liste]) => liste.length);
    return (
        <Section id="competences" titre={t("skills.title")} intro={t("skills.intro")}>
            <Grid templateColumns="repeat(auto-fill, minmax(260px, 1fr))" gap={4} alignItems="start">
                {categories.map(([categorie, liste]) => (
                    <Box key={categorie} as="article" bg="surface" border="1px solid" borderColor="line.strong"
                         borderRadius="14px" p={5} {...APPARITION}>
                        <Heading as="h3" fontSize="17px">{t(`skills.categories.${categorie}`)}</Heading>
                        <Puces items={liste.map(s => s.name)} mt={4}/>
                    </Box>
                ))}
            </Grid>
        </Section>
    );
}

'use client'

// Competences : une carte par categorie (grille auto-fill, 260px minimum).
import {Box, Grid, Heading, Text} from "@chakra-ui/react";
import {useTranslation} from "react-i18next";
import {useDonnees} from "../../data/DonneesContext";
import {Detail, Puces, Section} from "./communs";

export default function Competences() {
    const {t} = useTranslation();
    const {skills} = useDonnees();
    const categories = Object.entries(skills).filter(([, liste]) => liste.length);
    return (
        <Section id="competences" titre={t("skills.title")} intro={t("skills.intro")}>
            <Grid templateColumns="repeat(auto-fill, minmax(260px, 1fr))" gap={4}>
                {categories.map(([categorie, liste]) => (
                    <Box key={categorie} as="article" bg="surface" border="1px solid" borderColor="line.strong"
                         borderRadius="14px" p={5} display="flex" flexDirection="column">
                        <Heading as="h3" fontSize="17px">{t(`skills.categories.${categorie}`)}</Heading>
                        <Puces items={liste.map(s => s.name)} mt={4}/>
                        {liste.some(s => s.desc) && (
                            <Box mt="auto" pt={2}>
                                <Detail libelle={t("skills.seeDetail")}>
                                    <Box as="dl" fontSize="14px" lineHeight="1.6">
                                        {liste.map(s => (
                                            <Box key={s.id ?? s.name} mt={3}>
                                                <Text as="dt" fontWeight="600" color="fg.default">{s.name}</Text>
                                                <Text as="dd" color="fg.muted" ml={0}>{s.desc}</Text>
                                            </Box>
                                        ))}
                                    </Box>
                                </Detail>
                            </Box>
                        )}
                    </Box>
                ))}
            </Grid>
        </Section>
    );
}

'use client'

// Formation : lignes date / ecole / diplome, details depliables.
import {Box, Grid, Heading, Link, Text} from "@chakra-ui/react";
import {useTranslation} from "react-i18next";
import {useDonnees} from "../../data/DonneesContext";
import {APPARITION, Detail, Periode, Section, TexteRiche} from "./communs";

export default function Formation() {
    const {t} = useTranslation();
    const {education} = useDonnees();
    return (
        <Section id="formation" titre={t("education.title")}>
            <Box as="ol" listStyleType="none" p={0} m={0} borderTop="1px solid" borderColor="line.strong">
                {education.map(f => (
                    <Grid as="li" key={f.id ?? f.school}
                          templateColumns={{base: "1fr", md: "190px minmax(0, 1fr) minmax(0, 1.3fr)"}}
                          gap={{base: 1, md: 6}} py={6} borderBottom="1px solid" borderColor="line.strong" {...APPARITION}>
                        <Box>
                            <Periode pt={{md: "2px"}}>{f.years}</Periode>
                            {/* Pastille seulement si la periode ne dit pas deja "en cours". */}
                            {f.current && !/(en cours|present)$/.test(f.years) && (
                                <Text as="span" display="inline-block" mt={1} fontSize="12px" fontWeight="600"
                                      color="success.fg" bg="success.bg" px={2} py="1px" borderRadius="999px">
                                    {t("education.enCours")}
                                </Text>
                            )}
                        </Box>
                        <Heading as="h3" fontSize="17px" lineHeight="1.4">
                            {f.website ? <Link href={f.website} isExternal color="fg.default">{f.school}</Link> : f.school}
                        </Heading>
                        <Box>
                            <Text color="fg.muted" fontSize="15px" lineHeight="1.6">{f.degree}</Text>
                            {f.details && (
                                <Detail libelle={t("education.seeDetail")}>
                                    <TexteRiche texte={f.details} fontSize="14px"/>
                                </Detail>
                            )}
                        </Box>
                    </Grid>
                ))}
            </Box>
        </Section>
    );
}

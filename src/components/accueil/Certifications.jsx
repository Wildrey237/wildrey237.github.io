'use client'

// Certifications : une carte par certification, lien de verification externe.
import {Box, Flex, Grid, Heading, Link, Text} from "@chakra-ui/react";
import {ArrowUpRight, BadgeCheck} from "lucide-react";
import {IconeTechno, iconePour} from "./icones";
import {useTranslation} from "react-i18next";
import {useDonnees} from "../../data/DonneesContext";
import {APPARITION, Etiquette, Section} from "./communs";

export default function Certifications() {
    const {t, i18n} = useTranslation();
    const {certifications} = useDonnees();
    if (!certifications?.length) return null;
    const formatDate = d => new Date(d).toLocaleDateString(i18n.language === "fr" ? "fr-FR" : "en-GB", {month: "long", year: "numeric", timeZone: "UTC"});
    return (
        <Section id="certifications" titre={t("certifications.title")}>
            <Grid as="ul" listStyleType="none" p={0} m={0} templateColumns="repeat(auto-fill, minmax(260px, 1fr))" gap={4}>
                {certifications.map(c => (
                    <Box as="li" key={c.id} bg="surface" border="1px solid" borderColor="line.strong" borderRadius="14px"
                         p={5} display="flex" flexDirection="column" {...APPARITION}>
                        <Flex align="center" gap={2} color="fg.faint">
                            {/* Logo de l'organisme s'il existe dans simple-icons, sinon un badge. */}
                            {iconePour(c.issuer) ? <IconeTechno icone={iconePour(c.issuer)} taille={16}/> : <BadgeCheck size={16} aria-hidden="true"/>}
                            <Etiquette as="p">{c.issuer}</Etiquette>
                        </Flex>
                        <Heading as="h3" mt={2} fontSize="18px">{c.name}</Heading>
                        {c.date && <Text mt={1} fontSize="14px" color="fg.faint">{formatDate(c.date)}</Text>}
                        {c.link && (
                            <Link href={c.link} isExternal mt="auto" pt={4} display="inline-flex" alignItems="center"
                                  gap={1} minH="44px" fontWeight="600" fontSize="14px"
                                  aria-label={`${t("certifications.verify")} – ${c.name}`}>
                                {t("certifications.verify")} <ArrowUpRight size={16} aria-hidden="true"/>
                            </Link>
                        )}
                    </Box>
                ))}
            </Grid>
        </Section>
    );
}

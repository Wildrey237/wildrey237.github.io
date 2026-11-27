'use client'

// Hero : badge de disponibilite, nom sur deux lignes, sous-titre, presentation, actions ;
// a droite, portrait 4:5 puis encarts Lieu / Langues.
import Image from "next/image";
import {Box, Button, Container, Flex, Grid, Heading, Text} from "@chakra-ui/react";
import {useTranslation} from "react-i18next";
import Contacts from "./Contacts";
import {useDonnees} from "../../data/DonneesContext";
import {Etiquette, LARGEUR, MARGES} from "./communs";

function Encart({titre, children}) {
    return (
        <Box bg="surface" border="1px solid" borderColor="line.strong" borderRadius="12px" px={4} py={3}>
            <Etiquette>{titre}</Etiquette>
            <Text mt={1} fontSize="14px" color="fg.default" fontWeight="500">{children}</Text>
        </Box>
    );
}

export default function Hero() {
    const {t} = useTranslation();
    const {profile} = useDonnees();
    // Nom sur deux lignes : premier mot, puis le reste.
    const [ligne1, ...reste] = profile.name.split(" ");

    return (
        <Box as="section" id="haut" aria-labelledby="hero-nom" pt={{base: 6, md: 12}} pb={{base: 14, md: 20}}>
            <Container maxW={LARGEUR} px={MARGES}>
                <Grid templateColumns={{base: "1fr", lg: "minmax(0, 7fr) minmax(0, 5fr)"}}
                      gap={{base: 10, lg: 16}} alignItems="center">
                    <Box>
                        {profile.availability && (
                            <Flex as="p" display="inline-flex" align="center" gap={2} bg="success.bg" color="success.fg"
                                  px={3} py="6px" borderRadius="999px" fontSize="13px" fontWeight="600">
                                <Box as="span" w="8px" h="8px" borderRadius="full" bg="success.fg" aria-hidden="true"/>
                                {profile.availability}
                            </Flex>
                        )}
                        <Heading as="h1" id="hero-nom" mt={{base: 4, md: 6}} fontSize={{base: "44px", md: "60px", lg: "72px", "2xl": "88px"}}
                                 lineHeight="1.02" letterSpacing="-0.035em">
                            <Box as="span" display="block">{ligne1}</Box>
                            <Box as="span" display="block">{reste.join(" ")}</Box>
                        </Heading>
                        <Text mt={5} fontFamily="heading" fontWeight="600" fontSize={{base: "19px", md: "22px"}} color="accent">
                            {profile.title}
                        </Text>
                        <Text mt={5} fontSize={{base: "16px", md: "17px"}} lineHeight="1.7" color="fg.muted" maxW="60ch">
                            {profile.summary}
                        </Text>
                        <Flex mt={{base: 6, md: 8}} gap={3} wrap="wrap">
                            <Button as="a" href="#projets" size="lg">{t("hero.seeProjects")}</Button>
                            <Button as="a" href="#contact" size="lg" variant="contour">{t("hero.contactMe")}</Button>
                        </Flex>
                        {/* Contacts directs, visibles sans defiler. */}
                        <Contacts/>
                    </Box>

                    <Box maxW={{base: "420px", lg: "480px"}} w="100%" mx={{base: "auto", lg: 0}} ml={{lg: "auto"}}>
                        {profile.link_picture && (
                            <Box position="relative" borderRadius="16px" overflow="hidden" border="1px solid"
                                 borderColor="line.strong" bg="surface" sx={{aspectRatio: "4 / 5"}}>
                                <Image
                                    src={profile.link_picture}
                                    alt={t("hero.portrait", {nom: profile.name})}
                                    fill
                                    priority
                                    // Une URL externe (saisie dans /admin) n'est pas optimisee par Next.
                                    unoptimized={/^https?:\/\//.test(profile.link_picture)}
                                    sizes="(min-width: 992px) 420px, 90vw"
                                    style={{objectFit: "cover", objectPosition: "50% 30%"}}
                                />
                            </Box>
                        )}
                        <Grid mt={3} templateColumns="1fr 1fr" gap={3}>
                            {profile.location && <Encart titre={t("hero.lieu")}>{profile.location}</Encart>}
                            {profile.languages && <Encart titre={t("hero.langues")}>{profile.languages}</Encart>}
                        </Grid>
                    </Box>
                </Grid>
            </Container>
        </Box>
    );
}

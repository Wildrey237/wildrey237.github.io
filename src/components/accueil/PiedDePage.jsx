'use client'

// Pied de page sombre (dans les deux modes) : appel au contact, email, LinkedIn, GitHub, CV.
import {Box, Button, Container, Flex, Heading, Link, Text} from "@chakra-ui/react";
import {Download} from "lucide-react";
import {FaGithub, FaLinkedin} from "react-icons/fa";
import {useTranslation} from "react-i18next";
import {useDonnees} from "../../data/DonneesContext";
import {LARGEUR, MARGES, lienCv, suivreCv} from "./communs";

// Palette sombre de la charte, fixe quel que soit le mode.
const S = {fond: "#0F1115", bord: "#22262F", texte: "#EDEDEA", doux: "#B7B9C1", discret: "#8E919B", accent: "#8EA2FF"};

function BoutonSombre({children, ...props}) {
    return (
        <Button variant="unstyled" display="inline-flex" alignItems="center" gap={2} h="44px" px={4}
                border="1px solid" borderColor={S.bord} borderRadius="10px" color={S.texte} fontWeight="600"
                _hover={{borderColor: S.accent, color: S.accent}} {...props}>
            {children}
        </Button>
    );
}

export default function PiedDePage() {
    const {t, i18n} = useTranslation();
    const {profile} = useDonnees();
    const langue = i18n.language === "fr" ? "fr" : "en";
    return (
        <Box as="footer" id="contact" aria-labelledby="contact-titre" bg={S.fond} color={S.texte}
             borderTop="1px solid" borderColor={S.bord}>
            <Container maxW={LARGEUR} px={MARGES} py={{base: 16, md: 24}}>
                <Text fontFamily="mono" fontSize="12px" letterSpacing="0.08em" textTransform="uppercase" color={S.discret}>
                    {t("nav.contact")}
                </Text>
                <Heading as="h2" id="contact-titre" mt={3} color={S.texte} fontSize={{base: "36px", md: "56px"}} lineHeight="1.05">
                    {t("footer.title")}
                </Heading>
                <Text mt={4} color={S.doux} fontSize="17px" maxW="50ch">{t("footer.text")}</Text>
                <Link href={`mailto:${profile.email}`} display="inline-block" mt={8} color={S.accent}
                      fontFamily="heading" fontWeight="600" fontSize={{base: "20px", md: "28px"}} wordBreak="break-all"
                      _hover={{textDecoration: "underline", textUnderlineOffset: "6px"}}>
                    {profile.email}
                </Link>
                <Flex mt={8} gap={3} wrap="wrap">
                    <BoutonSombre as="a" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                        <FaLinkedin aria-hidden="true"/> LinkedIn
                    </BoutonSombre>
                    <BoutonSombre as="a" href={profile.github} target="_blank" rel="noopener noreferrer">
                        <FaGithub aria-hidden="true"/> GitHub
                    </BoutonSombre>
                    <BoutonSombre as="a" href={lienCv(langue)} target="_blank" rel="noopener noreferrer"
                                  onClick={() => suivreCv(langue)}>
                        <Download size={16} aria-hidden="true"/> {t("downloadCv")}
                    </BoutonSombre>
                </Flex>
                <Text mt={16} pt={6} borderTop="1px solid" borderColor={S.bord} fontSize="13px" color={S.discret}>
                    © {new Date().getFullYear()} {profile.name}. {t("footer.droits")}
                </Text>
            </Container>
        </Box>
    );
}

'use client'

// Ligne de contacts directs du hero : LinkedIn, e-mail (avec bouton Copier) et GitHub.
// Les liens viennent de la collection profil.
import {useEffect, useRef, useState} from "react";
import {Box, Button, Flex, Link} from "@chakra-ui/react";
import {Mail} from "lucide-react";
import {FaLinkedin} from "react-icons/fa";
import {siGithub} from "simple-icons";
import {useTranslation} from "react-i18next";
import {useDonnees} from "../../data/DonneesContext";
import {IconeTechno} from "./icones";

function LienContact({href, children, ...props}) {
    return (
        <Link href={href} display="inline-flex" alignItems="center" gap={2} minH="44px" color="fg.muted" fontWeight="500"
              fontSize="15px" _hover={{color: "accent", textDecoration: "none"}} {...props}>
            {children}
        </Link>
    );
}

export default function Contacts() {
    const {t} = useTranslation();
    const {profile} = useDonnees();
    const [copie, setCopie] = useState(false);
    const minuterie = useRef(null);
    useEffect(() => () => clearTimeout(minuterie.current), []);

    const copier = async () => {
        try {
            await navigator.clipboard.writeText(profile.email);
        } catch {
            // Repli : selection manuelle impossible ici ; on n'affiche pas "Copie".
            return;
        }
        setCopie(true);
        clearTimeout(minuterie.current);
        minuterie.current = setTimeout(() => setCopie(false), 2000);
    };

    return (
        <Flex as="ul" aria-label={t("hero.contacts")} listStyleType="none" p={0} m={0} mt={{base: 4, md: 6}}
              gap={{base: 1, md: 6}} columnGap={6} wrap="wrap" align="center">
            {profile.linkedin && (
                <li><LienContact href={profile.linkedin} isExternal><FaLinkedin aria-hidden="true" size={16}/> LinkedIn</LienContact></li>
            )}
            {profile.email && (
                <Flex as="li" align="center" gap={1}>
                    <LienContact href={`mailto:${profile.email}`}>
                        <Mail size={16} aria-hidden="true"/> {profile.email}
                    </LienContact>
                    <Button variant="discret" size="md" px={3} fontSize="13px" onClick={copier}
                            aria-label={copie ? t("hero.copie") : t("hero.copierEmail")}>
                        {copie ? t("hero.copie") : t("hero.copier")}
                    </Button>
                    <Box as="span" role="status" aria-live="polite" position="absolute" w="1px" h="1px" overflow="hidden"
                         clipPath="inset(50%)">{copie ? t("hero.copie") : ""}</Box>
                </Flex>
            )}
            {profile.github && (
                <li><LienContact href={profile.github} isExternal><IconeTechno icone={siGithub} taille={16}/> GitHub</LienContact></li>
            )}
        </Flex>
    );
}

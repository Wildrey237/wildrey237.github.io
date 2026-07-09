import {Box, HStack, IconButton, Button, Text} from "@chakra-ui/react";
import {FaGithub, FaLinkedin, FaEnvelope} from "react-icons/fa";
import {useTranslation} from "react-i18next";
import {motion} from "framer-motion";
import frData from "../data/data-fr.json";
import enData from "../data/data-en.json";

const MotionIconButton = motion(IconButton);

export default function Footer() {
    const {t, i18n} = useTranslation();
    const data = i18n.language === "fr" ? frData : enData;

    const cvLink = i18n.language === "fr" ? "/cv/cv-francais.pdf" : "/cv/cv-anglais.pdf";

    const socials = [
        {label: "Email", icon: FaEnvelope, href: `mailto:${data.profile.email}`},
        {label: "GitHub", icon: FaGithub, href: data.profile.github},
        {label: "LinkedIn", icon: FaLinkedin, href: data.profile.linkedin},
    ];

    return (
        <Box
            as="footer"
            position="fixed"
            bottom="0"
            left="0"
            w="100%"
            bg="chrome.bg"
            backdropFilter="blur(12px)"
            borderTop="1px solid"
            borderColor="line.subtle"
            py={2.5}
            px={{base: 4, md: 8}}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            zIndex="999"
        >
            <HStack spacing={{base: 1, md: 3}} align="center">
                {socials.map(({label, icon, href}) => (
                    <MotionIconButton
                        key={label}
                        as="a"
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        icon={<Box as={icon} fontSize="17px"/>}
                        variant="ghost"
                        size="sm"
                        color="fg.muted"
                        whileHover={{y: -2}}
                        _hover={{color: "accent", bg: "transparent"}}
                    />
                ))}
                <Text
                    display={{base: "none", md: "block"}}
                    fontFamily="mono"
                    fontSize="11px"
                    color="fg.faint"
                    pl={3}
                    letterSpacing="0.02em"
                >
                    © {new Date().getFullYear()} {data.profile.name}
                </Text>
            </HStack>

            <Button
                as="a"
                href={cvLink}
                target="_blank"
                rel="noopener noreferrer"
                colorScheme="brand"
                size="sm"
                borderRadius="sm"
                px={4}
                fontFamily="mono"
                fontSize="xs"
                fontWeight="500"
                _hover={{transform: "translateY(-1px)"}}
                transition="transform 0.2s ease"
                onClick={() => {
                    if (typeof window.gtag === "function") {
                        window.gtag("event", "download_cv", {
                            event_category: "engagement",
                            event_label: `CV ${i18n.language.toUpperCase()}`,
                            value: 1,
                        });
                    }
                }}
            >
                {t("downloadCv")} ↓
            </Button>
        </Box>
    );
}

import {
    Box,
    HStack,
    IconButton,
    Button,
    useColorMode,
    useColorModeValue,
} from "@chakra-ui/react";
import {FaGithub, FaLinkedin, FaEnvelope} from "react-icons/fa";
import {useTranslation} from "react-i18next";
import {motion} from "framer-motion";
import frData from "../data/data-fr.json";
import enData from "../data/data-en.json";

const MotionIconButton = motion(IconButton);

export default function Footer() {
    const {colorMode} = useColorMode();
    const {t, i18n} = useTranslation();

    const data = i18n.language === "fr" ? frData : enData;
    const isDark = colorMode === "dark";

    const footerBg = useColorModeValue("rgba(255,255,255,0.92)", "rgba(5,8,22,0.92)");
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
    const iconColor = useColorModeValue("gray.700", "white");
    const iconHover = useColorModeValue("#319795", "#4FD1C5");

    const cvLink =
        i18n.language === "fr" ? "/cv/cv-francais.pdf" : "/cv/cv-anglais.pdf";

    return (
        <Box
            as="footer"
            position="fixed"
            bottom="0"
            left="0"
            width="100%"
            bg={footerBg}
            backdropFilter="blur(10px)"
            borderTop="1px solid"
            borderColor={borderColor}
            boxShadow={
                isDark
                    ? "0 -6px 24px rgba(0,0,0,0.25)"
                    : "0 -2px 10px rgba(0,0,0,0.08)"
            }
            py={2}
            px={{base: 3, md: 5}}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            zIndex="999"
        >
            <HStack spacing={{base: 2, md: 4}}>
                <MotionIconButton
                    as="a"
                    href={`mailto:${data.profile.email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Email"
                    icon={<FaEnvelope/>}
                    variant="ghost"
                    size="lg"
                    color={iconColor}
                    whileHover={{scale: 1.15, color: iconHover}}
                    whileTap={{scale: 0.95}}
                />

                <MotionIconButton
                    as="a"
                    href={data.profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    icon={<FaGithub/>}
                    variant="ghost"
                    size="lg"
                    color={iconColor}
                    whileHover={{scale: 1.15, color: iconHover}}
                    whileTap={{scale: 0.95}}
                />

                <MotionIconButton
                    as="a"
                    href={data.profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    icon={<FaLinkedin/>}
                    variant="ghost"
                    size="lg"
                    color={iconColor}
                    whileHover={{scale: 1.15, color: iconHover}}
                    whileTap={{scale: 0.95}}
                />
            </HStack>

            <Button
                as="a"
                href={cvLink}
                target="_blank"
                rel="noopener noreferrer"
                colorScheme="teal"
                size="sm"
                borderRadius="full"
                px={4}
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
                {t("downloadCv")}
            </Button>
        </Box>
    );
}
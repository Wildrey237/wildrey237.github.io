import {
    Box,
    HStack,
    IconButton,
    Button,
    useColorMode,
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
    console.log("EMAIL:", data.profile.email);
    console.log("GITHUB:", data.profile.github);
    console.log("LINKEDIN:", data.profile.linkedin);
    console.log("CV:", data.profile.cvLink);
    return (
        <Box
            as="footer"
            position="fixed"
            bottom="0"
            left="0"
            width="100%"
            // fond semi-transparent selon le mode
            bg={colorMode === "light" ? "rgba(255,255,255,0.7)" : "rgba(26,32,44,0.8)"}
            backdropFilter="blur(8px)"
            boxShadow="0 -2px 5px rgba(0,0,0,0.1)"
            py={2}
            px={4}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            zIndex="999"
        >
            <HStack spacing={4}>
                {/* Icône Email */}
                <MotionIconButton
                    as="a"
                    href={`mailto:${data.profile.email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Email"
                    icon={<FaEnvelope/>}
                    variant="ghost"
                    size="lg"
                    color={colorMode === "light" ? "gray.800" : "white"}
                    whileHover={{scale: 1.2, color: "#319795"}}
                    whileTap={{scale: 0.95}}
                />
                {/* Icône GitHub */}
                <MotionIconButton
                    as="a"
                    href={data.profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    icon={<FaGithub/>}
                    variant="ghost"
                    size="lg"
                    color={colorMode === "light" ? "gray.800" : "white"}
                    whileHover={{scale: 1.2, color: "#319795"}}
                    whileTap={{scale: 0.95}}
                />
                {/* Icône LinkedIn */}
                <MotionIconButton
                    as="a"
                    href={data.profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    icon={<FaLinkedin/>}
                    variant="ghost"
                    size="lg"
                    color={colorMode === "light" ? "gray.800" : "white"}
                    whileHover={{scale: 1.2, color: "#319795"}}
                    whileTap={{scale: 0.95}}
                />
            </HStack>

            <Button
                as="a"
                href={data.profile.cvLink}
                target="_blank"
                rel="noopener noreferrer"
                colorScheme="teal"
                size="sm"
            >
                {t("downloadCv")}
            </Button>
        </Box>
    );
}
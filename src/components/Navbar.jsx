import {
    Box,
    Flex,
    IconButton,
    Stack,
    Button,
    HStack,
    useColorMode,
    useDisclosure,
} from "@chakra-ui/react";
import {HamburgerIcon, CloseIcon, SunIcon, MoonIcon} from "@chakra-ui/icons";
import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";
import {motion, AnimatePresence} from "framer-motion";
import LogoMark from "./LogoMark";

const MotionBox = motion(Box);

const SECTIONS = ["home", "skills", "experiences", "education", "projects"];

export default function Navbar() {
    const {colorMode, toggleColorMode} = useColorMode();
    const {isOpen, onOpen, onClose} = useDisclosure();
    const {t, i18n} = useTranslation();

    const [activeSection, setActiveSection] = useState("home");
    const [iconRotate, setIconRotate] = useState(0);

    const scrollToId = (id) => {
        onClose();
        if (id === "home") {
            window.scrollTo({top: 0, behavior: "smooth"});
            return;
        }
        document.getElementById(id)?.scrollIntoView({behavior: "smooth"});
    };

    useEffect(() => {
        const handleScroll = () => {
            // Near the top the layout may not be measured yet — pin to home.
            if (window.scrollY < 200) {
                setActiveSection("home");
                return;
            }
            let current = "home";
            SECTIONS.forEach((sec) => {
                const el = document.getElementById(sec);
                if (el) {
                    const top = el.offsetTop - 120;
                    if (window.scrollY >= top && window.scrollY < top + el.offsetHeight) {
                        current = sec;
                    }
                }
            });
            setActiveSection(current);
        };
        window.addEventListener("scroll", handleScroll, {passive: true});
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const renderLink = (id, label) => {
        const isActive = activeSection === id;
        return (
            <Box position="relative" key={id} px={1}>
                <Button
                    onClick={() => scrollToId(id)}
                    variant="unstyled"
                    height="auto"
                    minW="auto"
                    px={0}
                    py={1}
                    fontFamily="mono"
                    fontSize="xs"
                    fontWeight={isActive ? "600" : "400"}
                    letterSpacing="0.04em"
                    textTransform="uppercase"
                    color={isActive ? "fg.default" : "fg.muted"}
                    _hover={{color: "accent"}}
                    transition="color 0.2s ease"
                    aria-current={isActive ? "page" : undefined}
                >
                    {label}
                </Button>
                {isActive && (
                    <MotionBox
                        layoutId="nav-underline"
                        position="absolute"
                        bottom="-2px"
                        left="0"
                        right="0"
                        h="2px"
                        bg="accent"
                        transition={{type: "spring", bounce: 0.15, duration: 0.5}}
                    />
                )}
            </Box>
        );
    };

    return (
        <Box as="nav" role="navigation">
            <Flex
                as="header"
                position="fixed"
                top="0"
                w="100%"
                bg="chrome.bg"
                backdropFilter="blur(12px)"
                borderBottom="1px solid"
                borderColor="line.subtle"
                px={{base: 5, md: 8}}
                py={3}
                align="center"
                justify="space-between"
                zIndex="999"
            >
                <HStack
                    spacing={2}
                    onClick={() => scrollToId("home")}
                    aria-label={i18n.language === "fr" ? "Retour à l'accueil" : "Go to home"}
                >
                    <LogoMark/>
                </HStack>

                <Flex display={{base: "none", md: "flex"}} gap={7} align="center">
                    {renderLink("home", t("home"))}
                    {renderLink("skills", t("skills"))}
                    {renderLink("experiences", t("experiences"))}
                    {renderLink("education", t("education"))}
                    {renderLink("projects", t("projectsNav"))}
                </Flex>

                <Flex align="center" gap={{base: 1, md: 3}}>
                    <IconButton
                        aria-label={colorMode === "light" ? "Activer le mode sombre" : "Activer le mode clair"}
                        icon={
                            <motion.span
                                animate={{rotate: iconRotate}}
                                transition={{duration: 0.5, ease: [0.22, 1, 0.36, 1]}}
                                style={{display: "inline-flex"}}
                            >
                                {colorMode === "light" ? <MoonIcon boxSize={3.5}/> : <SunIcon boxSize={3.5}/>}
                            </motion.span>
                        }
                        onClick={() => {
                            toggleColorMode();
                            setIconRotate((r) => r + 180);
                        }}
                        variant="ghost"
                        size="sm"
                        color="fg.muted"
                        _hover={{color: "accent", bg: "transparent"}}
                    />
                    <Button
                        onClick={() => i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr")}
                        variant="unstyled"
                        height="auto"
                        minW="auto"
                        px={0}
                        fontFamily="mono"
                        fontSize="xs"
                        fontWeight="500"
                        letterSpacing="0.06em"
                        color="fg.muted"
                        borderBottom="1px solid"
                        borderColor="transparent"
                        _hover={{color: "accent", borderColor: "accent.line"}}
                        aria-label={i18n.language === "fr" ? "Passer le site en anglais" : "Switch website to French"}
                    >
                        {i18n.language === "fr" ? "EN" : "FR"}
                    </Button>
                    <IconButton
                        aria-label="Ouvrir ou fermer le menu mobile"
                        icon={isOpen ? <CloseIcon boxSize={2.5}/> : <HamburgerIcon boxSize={3.5}/>}
                        display={{base: "inline-flex", md: "none"}}
                        onClick={isOpen ? onClose : onOpen}
                        variant="ghost"
                        size="sm"
                        color="fg.muted"
                        _hover={{color: "accent", bg: "transparent"}}
                    />
                </Flex>
            </Flex>

            <AnimatePresence>
                {isOpen && (
                    <MotionBox
                        as="nav"
                        position="fixed"
                        top="57px"
                        left="0"
                        right="0"
                        bg="chrome.bg"
                        backdropFilter="blur(12px)"
                        borderBottom="1px solid"
                        borderColor="line.subtle"
                        p={5}
                        display={{md: "none"}}
                        zIndex="998"
                        initial={{opacity: 0, y: -8}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -8}}
                        transition={{duration: 0.2, ease: [0.22, 1, 0.36, 1]}}
                    >
                        <Stack spacing={4}>
                            {renderLink("home", t("home"))}
                            {renderLink("skills", t("skills"))}
                            {renderLink("experiences", t("experiences"))}
                            {renderLink("education", t("education"))}
                            {renderLink("projects", t("projectsNav"))}
                        </Stack>
                    </MotionBox>
                )}
            </AnimatePresence>
        </Box>
    );
}

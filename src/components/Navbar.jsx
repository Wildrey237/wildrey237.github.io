import {
    Box,
    Flex,
    IconButton,
    Stack,
    Button,
    HStack,
    useColorMode,
    useDisclosure,
    useColorModeValue,
} from "@chakra-ui/react";
import {HamburgerIcon, CloseIcon, SunIcon, MoonIcon} from "@chakra-ui/icons";
import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";
import {motion, AnimatePresence} from "framer-motion";
import LogoMark from "./LogoMark";

const MotionBox = motion(Box);

export default function Navbar() {
    const {colorMode, toggleColorMode} = useColorMode();
    const {isOpen, onOpen, onClose} = useDisclosure();
    const {t, i18n} = useTranslation();

    const [activeSection, setActiveSection] = useState("home");
    const [iconRotate, setIconRotate] = useState(0);

    const isDark = colorMode === "dark";

    const navBg = useColorModeValue("rgba(255,255,255,0.92)", "rgba(5,8,22,0.9)");
    const navBorder = useColorModeValue("gray.200", "whiteAlpha.200");
    const textColor = useColorModeValue("gray.700", "gray.300");
    const activeTextColor = useColorModeValue("teal.700", "teal.200");
    const pillBg = useColorModeValue("teal.50", "rgba(45,212,191,0.12)");
    const mobileBg = useColorModeValue("rgba(255,255,255,0.96)", "rgba(11,16,32,0.96)");

    const scrollToId = (id) => {
        if (id === "home") {
            window.scrollTo({top: 0, behavior: "smooth"});
            onClose();
            return;
        }
        const section = document.getElementById(id);
        if (section) {
            section.scrollIntoView({behavior: "smooth"});
            onClose();
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const sections = ["home", "skills", "experiences", "education", "projects"];
            let current = "home";
            sections.forEach((sec) => {
                const element = document.getElementById(sec);
                if (element) {
                    const top = element.offsetTop - 120;
                    const height = element.offsetHeight;
                    if (window.scrollY >= top && window.scrollY < top + height) {
                        current = sec;
                    }
                }
            });
            setActiveSection(current);
        };
        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const renderButton = (id, label) => {
        const isActive = activeSection === id;
        return (
            <Box position="relative" key={id}>
                {isActive && (
                    <MotionBox
                        layoutId="nav-pill"
                        position="absolute"
                        inset="0"
                        borderRadius="full"
                        bg={pillBg}
                        transition={{type: "spring", bounce: 0.2, duration: 0.4}}
                    />
                )}
                <Button
                    onClick={() => scrollToId(id)}
                    variant="ghost"
                    color={isActive ? activeTextColor : textColor}
                    fontWeight={isActive ? "semibold" : "medium"}
                    fontSize="sm"
                    position="relative"
                    zIndex={1}
                    _hover={{color: "teal.500", bg: "transparent"}}
                    _active={{bg: "transparent"}}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={`Go to section ${label}`}
                >
                    {label}
                </Button>
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
                bg={navBg}
                backdropFilter="blur(10px)"
                borderBottom="1px solid"
                borderColor={navBorder}
                px={6}
                py={3}
                align="center"
                justify="space-between"
                boxShadow={isDark ? "0 6px 24px rgba(0,0,0,0.18)" : "0 2px 10px rgba(0,0,0,0.05)"}
                zIndex="999"
            >
                {/* Logo */}
                <HStack
                    spacing={2}
                    cursor="pointer"
                    onClick={() => window.scrollTo({top: 0, behavior: "smooth"})}
                    aria-label={i18n.language === "fr" ? "Retour à l'accueil" : "Go to home"}
                >
                    <LogoMark/>
                </HStack>

                {/* Menu Desktop */}
                <Flex display={{base: "none", md: "flex"}} gap="1" align="center">
                    {renderButton("home", t("home"))}
                    {renderButton("skills", t("skills"))}
                    {renderButton("experiences", i18n.language === "fr" ? "Expériences" : "Experiences")}
                    {renderButton("education", i18n.language === "fr" ? "Éducation" : "Education")}
                    {renderButton("projects", i18n.language === "fr" ? "Projets" : "Projects")}
                </Flex>

                {/* Actions */}
                <Flex align="center" gap={1}>
                    <IconButton
                        aria-label={colorMode === "light" ? "Activer le mode sombre" : "Activer le mode clair"}
                        icon={
                            <motion.span
                                animate={{ rotate: iconRotate }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                style={{ display: "inline-flex" }}
                            >
                                {colorMode === "light" ? <MoonIcon/> : <SunIcon/>}
                            </motion.span>
                        }
                        onClick={() => { toggleColorMode(); setIconRotate(r => r + 180); }}
                        variant="ghost"
                        color={textColor}
                        _hover={{color: "teal.400", bg: "transparent"}}
                    />
                    <Button
                        onClick={() => i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr")}
                        colorScheme="teal"
                        variant="solid"
                        size="sm"
                        borderRadius="full"
                        aria-label={i18n.language === "fr" ? "Passer le site en anglais" : "Switch website to French"}
                    >
                        {i18n.language === "fr" ? "EN" : "FR"}
                    </Button>
                    <IconButton
                        aria-label="Ouvrir ou fermer le menu mobile"
                        icon={isOpen ? <CloseIcon/> : <HamburgerIcon/>}
                        display={{base: "inline-flex", md: "none"}}
                        onClick={isOpen ? onClose : onOpen}
                        variant="ghost"
                        color={textColor}
                        _hover={{color: "teal.400", bg: "transparent"}}
                    />
                </Flex>
            </Flex>

            {/* Menu Mobile */}
            <AnimatePresence>
                {isOpen && (
                    <MotionBox
                        as="nav"
                        position="fixed"
                        top="57px"
                        left="0"
                        right="0"
                        bg={mobileBg}
                        backdropFilter="blur(10px)"
                        borderBottom="1px solid"
                        borderColor={navBorder}
                        p={4}
                        display={{md: "none"}}
                        zIndex="998"
                        boxShadow={isDark ? "0 12px 24px rgba(0,0,0,0.25)" : "0 8px 20px rgba(0,0,0,0.08)"}
                        initial={{opacity: 0, y: -8}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -8}}
                        transition={{duration: 0.18}}
                    >
                        <Stack spacing={1}>
                            {renderButton("home", t("home"))}
                            {renderButton("skills", t("skills"))}
                            {renderButton("experiences", i18n.language === "fr" ? "Expériences" : "Experiences")}
                            {renderButton("education", i18n.language === "fr" ? "Éducation" : "Education")}
                            {renderButton("projects", i18n.language === "fr" ? "Projets" : "Projects")}
                        </Stack>
                    </MotionBox>
                )}
            </AnimatePresence>
        </Box>
    );
}

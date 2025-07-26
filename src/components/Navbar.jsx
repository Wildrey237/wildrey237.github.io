import {
    Box,
    Flex,
    IconButton,
    Stack,
    Button,
    useColorMode,
    useDisclosure,
} from "@chakra-ui/react";
import {HamburgerIcon, CloseIcon, SunIcon, MoonIcon} from "@chakra-ui/icons";
import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";

export default function Navbar() {
    const {colorMode, toggleColorMode} = useColorMode();
    const {isOpen, onOpen, onClose} = useDisclosure();
    const {t, i18n} = useTranslation();

    const [activeSection, setActiveSection] = useState("home");

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
            const sections = ["home", "skills", "experiences"];
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
                <Button
                    onClick={() => scrollToId(id)}
                    variant="ghost"
                    color={colorMode === "light" ? "gray.800" : "white"}
                    _hover={{color: "teal.500"}}
                >
                    {label}
                </Button>
                {/* Barre animée sous le bouton actif */}
                <Box
                    position="absolute"
                    bottom="0"
                    left="0"
                    right="0"
                    height="2px"
                    bg="teal.400"
                    borderRadius="full"
                    transition="transform 0.3s ease, opacity 0.3s ease"
                    transform={isActive ? "scaleX(1)" : "scaleX(0)"}
                    opacity={isActive ? 1 : 0}
                />
            </Box>
        );
    };

    return (
        <Box>
            <Flex
                as="header"
                position="fixed"
                top="0"
                w="100%"
                bg={
                    colorMode === "light"
                        ? "rgba(255,255,255,0.7)"
                        : "rgba(26,32,44,0.8)"
                }
                backdropFilter="blur(8px)"
                p={4}
                align="center"
                justify="space-between"
                boxShadow="sm"
                zIndex="999"
            >
                {/* Logo */}
                <Box
                    fontWeight="bold"
                    fontSize="xl"
                    cursor="pointer"
                    onClick={() => window.scrollTo({top: 0, behavior: "smooth"})}
                    color={colorMode === "light" ? "gray.800" : "white"}
                    _hover={{color: "teal.500"}}
                >
                    {t("brand")}
                </Box>

                {/* Menu Desktop */}
                <Flex display={{base: "none", md: "flex"}} gap="6" align="center">
                    {renderButton("home", t("home"))}
                    {renderButton("skills", t("skills"))}
                    {renderButton(
                        "experiences",
                        i18n.language === "fr" ? "Expériences" : "Experiences"
                    )}
                </Flex>

                {/* Actions */}
                <Flex align="center">
                    <IconButton
                        aria-label="Toggle theme"
                        icon={colorMode === "light" ? <MoonIcon/> : <SunIcon/>}
                        onClick={toggleColorMode}
                        mr={2}
                        color={colorMode === "light" ? "gray.800" : "white"}
                        _hover={{color: "teal.500"}}
                    />
                    <Button
                        onClick={() =>
                            i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr")
                        }
                        mr={2}
                        colorScheme="teal"
                        variant="solid"
                    >
                        {i18n.language === "fr" ? "EN" : "FR"}
                    </Button>
                    <IconButton
                        aria-label="Menu"
                        icon={isOpen ? <CloseIcon/> : <HamburgerIcon/>}
                        display={{base: "inline-flex", md: "none"}}
                        onClick={isOpen ? onClose : onOpen}
                        color={colorMode === "light" ? "gray.800" : "white"}
                        _hover={{color: "teal.500"}}
                    />
                </Flex>
            </Flex>

            {/* Menu Mobile */}
            {isOpen && (
                <Stack
                    as="nav"
                    position="fixed"
                    top="60px"
                    left="0"
                    right="0"
                    bg={colorMode === "light" ? "whiteAlpha.900" : "gray.800"}
                    backdropFilter="blur(8px)"
                    p={4}
                    display={{md: "none"}}
                    spacing={3}
                >
                    {renderButton("home", t("home"))}
                    {renderButton("skills", t("skills"))}
                    {renderButton(
                        "experiences",
                        i18n.language === "fr" ? "Expériences" : "Experiences"
                    )}
                </Stack>
            )}
        </Box>
    );
}
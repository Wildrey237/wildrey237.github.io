import {
    Box,
    Heading,
    VStack,
    HStack,
    Text,
    Tag,
    Link,
    Image,
    Button,
    Collapse,
    useColorMode,
    useColorModeValue,
    useDisclosure,
} from "@chakra-ui/react";
import { ExternalLinkIcon, ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import frData from "../data/data-fr.json";
import enData from "../data/data-en.json";

const MotionBox = motion(Box);

const SCHOOL_LOGOS = {
    epita: "https://www.epita.fr/wp-content/themes/epita-refonte-theme/assets/images/logo-epita-sans-baseline.png",
    ece: "https://www.ece.fr/wp-content/uploads/2024/01/logo-ece.svg",
    epsi: "https://www.epsi.fr/images/logo-navbar.svg",
    usj: "https://institutsaintjean.org/wp-content/uploads/2022/12/Logo-Institut-USJ-INGENIEUR-transparent-768x301.png",
};

const SCHOOL_COLORS = [
    { light: "teal.400",   dark: "teal.300"   },
    { light: "blue.400",   dark: "blue.300"   },
    { light: "purple.400", dark: "purple.300" },
    { light: "orange.400", dark: "orange.300" },
    { light: "pink.400",   dark: "pink.300"   },
];

function getSchoolLogo(schoolName) {
    const s = schoolName.toLowerCase();
    if (s.includes("epita")) return SCHOOL_LOGOS.epita;
    if (s.includes("ece"))   return SCHOOL_LOGOS.ece;
    if (s.includes("epsi"))  return SCHOOL_LOGOS.epsi;
    if (s.includes("saint jean") || s.includes("yaounde") || s.includes("yaoundé")) return SCHOOL_LOGOS.usj;
    return null;
}

function getCampusBadge(schoolName) {
    const s = schoolName.toLowerCase();
    if (s.includes("lyon"))                          return { label: "Lyon",    scheme: "teal"   };
    if (s.includes("paris") || s.includes("kremlin")) return { label: "Paris",   scheme: "blue"   };
    if (s.includes("rennes"))                        return { label: "Rennes",  scheme: "purple" };
    if (s.includes("yaounde") || s.includes("yaoundé")) return { label: "Yaoundé", scheme: "orange" };
    return null;
}

function isCurrent(edu) {
    return edu.current === true;
}

function EducationCard({ edu, idx, isDark, lang }) {
    const { isOpen, onToggle } = useDisclosure();

    const cardBg     = useColorModeValue("white", "#111827");
    const cardBorder = useColorModeValue("gray.200", "whiteAlpha.100");
    const textMain   = useColorModeValue("gray.800", "white");
    const textSoft   = useColorModeValue("gray.500", "gray.400");
    const detailBg   = useColorModeValue("gray.50", "#0d1424");
    const accent     = SCHOOL_COLORS[idx % SCHOOL_COLORS.length];
    const accentVal  = isDark ? accent.dark : accent.light;
    const logo       = getSchoolLogo(edu.school);
    const campus     = getCampusBadge(edu.school);
    const current    = isCurrent(edu);

    return (
        <MotionBox
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
        >
            <Box
                bg={cardBg}
                border="1px solid"
                borderColor={cardBorder}
                borderLeft="4px solid"
                borderLeftColor={accentVal}
                borderRadius="xl"
                overflow="hidden"
                boxShadow={isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.06)"}
                transition="all 0.2s ease"
                _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 24px rgba(0,0,0,0.1)",
                    borderLeftColor: accentVal,
                }}
            >
                {/* Card header */}
                <HStack p={{ base: 5, md: 7 }} spacing={5} align="flex-start">
                    {/* Logo */}
                    <Box
                        flexShrink={0}
                        w={{ base: "64px", md: "80px" }}
                        h={{ base: "64px", md: "80px" }}
                        borderRadius="xl"
                        bg={isDark ? "white" : "gray.50"}
                        border="1px solid"
                        borderColor={cardBorder}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        p={2}
                        overflow="hidden"
                    >
                        {logo ? (
                            <Image
                                src={logo}
                                alt={edu.school}
                                objectFit="contain"
                                w="100%"
                                h="100%"
                                onError={(e) => { e.target.style.display = "none"; }}
                            />
                        ) : (
                            <Text fontWeight="black" fontSize="xl" color={accentVal}>
                                {edu.school[0]}
                            </Text>
                        )}
                    </Box>

                    {/* Content */}
                    <Box flex="1" minW={0}>
                        <HStack spacing={2} mb={1} flexWrap="wrap">
                            {current && (
                                <HStack
                                    px={2}
                                    py={0.5}
                                    borderRadius="full"
                                    bg="green.50"
                                    border="1px solid"
                                    borderColor="green.200"
                                    spacing={1.5}
                                    _dark={{ bg: "rgba(72,187,120,0.1)", borderColor: "rgba(72,187,120,0.3)" }}
                                >
                                    <Box position="relative" w="6px" h="6px">
                                        <Box
                                            position="absolute"
                                            inset="0"
                                            borderRadius="full"
                                            bg="green.400"
                                            sx={{
                                                "@keyframes ping": {
                                                    "0%":   { transform: "scale(1)", opacity: 0.8 },
                                                    "100%": { transform: "scale(2.4)", opacity: 0 },
                                                },
                                                animation: "ping 1.6s ease-out infinite",
                                            }}
                                        />
                                        <Box position="absolute" inset="0" borderRadius="full" bg="green.400" />
                                    </Box>
                                    <Text fontSize="xs" fontWeight="semibold" color="green.600" _dark={{ color: "green.300" }}>
                                        {lang === "fr" ? "En cours" : "In progress"}
                                    </Text>
                                </HStack>
                            )}
                            {campus && (
                                <Tag colorScheme={campus.scheme} size="sm" borderRadius="full">
                                    {campus.label}
                                </Tag>
                            )}
                        </HStack>

                        <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }} color={textMain} lineHeight="1.3" noOfLines={2}>
                            {edu.degree}
                        </Text>

                        <HStack mt={1} spacing={2} flexWrap="wrap">
                            <Text fontSize={{ base: "sm", md: "md" }} fontWeight="semibold" color={accentVal}>
                                {edu.school.replace(/ (FR|CMR)$/, "")}
                            </Text>
                            {edu.website && (
                                <Link href={edu.website} isExternal color={textSoft} _hover={{ color: "teal.400" }}>
                                    <ExternalLinkIcon boxSize={3} mb="2px" />
                                </Link>
                            )}
                        </HStack>

                        <Text fontSize="xs" color={textSoft} mt={0.5} fontWeight="medium">
                            {edu.years}
                        </Text>
                    </Box>
                </HStack>

                {/* Expandable details */}
                {edu.details && (
                    <>
                        <Box px={{ base: 5, md: 7 }} pb={3}>
                            <Button
                                size="xs"
                                variant="ghost"
                                colorScheme="teal"
                                rightIcon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                onClick={onToggle}
                                fontWeight="medium"
                                px={2}
                            >
                                {isOpen
                                    ? (lang === "fr" ? "Réduire" : "Show less")
                                    : (lang === "fr" ? "Voir les détails" : "See details")}
                            </Button>
                        </Box>

                        <Collapse in={isOpen} animateOpacity>
                            <Box px={{ base: 5, md: 7 }} pb={6} bg={detailBg} borderTop="1px solid" borderColor={cardBorder}>
                                <Text fontSize="sm" color={textSoft} lineHeight="1.7" pt={4}>
                                    {edu.details}
                                </Text>
                            </Box>
                        </Collapse>
                    </>
                )}
            </Box>
        </MotionBox>
    );
}

export default function EducationSection() {
    const { i18n } = useTranslation();
    const { colorMode } = useColorMode();
    const data = i18n.language === "fr" ? frData : enData;

    const isDark = colorMode === "dark";

    const bgMain      = useColorModeValue("white", "#0d1424");
    const titleColor  = useColorModeValue("gray.800", "white");
    const accentColor = useColorModeValue("teal.500", "teal.400");

    return (
        <Box
            id="education"
            px={{ base: 4, md: 8 }}
            py={16}
            bg={bgMain}
            position="relative"
            overflow="hidden"
        >
            {isDark && (
                <>
                    <Box
                        position="absolute"
                        inset="0"
                        opacity={0.05}
                        backgroundImage="linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)"
                        backgroundSize="48px 48px"
                        pointerEvents="none"
                    />
                    <Box
                        position="absolute"
                        top="-120px"
                        right="-120px"
                        w="320px"
                        h="320px"
                        bg="teal.400"
                        opacity={0.08}
                        filter="blur(120px)"
                        borderRadius="full"
                        pointerEvents="none"
                    />
                </>
            )}

            <VStack spacing={3} mb={12} position="relative" zIndex={1}>
                <Heading
                    textAlign="center"
                    fontSize={["2xl", "3xl", "4xl"]}
                    color={titleColor}
                    fontWeight="black"
                    letterSpacing="-0.03em"
                >
                    {i18n.language === "fr" ? "Parcours scolaire" : "Education"}
                </Heading>
                <Box w="48px" h="4px" bg={accentColor} borderRadius="full" />
            </VStack>

            <Box position="relative" zIndex={1} maxW="1300px" mx="auto">
                <VStack spacing={5} align="stretch">
                    {data.education && data.education.map((edu, idx) => (
                        <EducationCard
                            key={idx}
                            edu={edu}
                            idx={idx}
                            isDark={isDark}
                            lang={i18n.language}
                        />
                    ))}
                </VStack>
            </Box>
        </Box>
    );
}

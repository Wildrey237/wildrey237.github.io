import {
    Box,
    Heading,
    SimpleGrid,
    Text,
    useColorMode,
    Tooltip,
    useBreakpointValue,
    HStack,
    VStack,
    Icon,
    Wrap,
    WrapItem,
    useColorModeValue,
} from "@chakra-ui/react";
import {useTranslation} from "react-i18next";
import {motion} from "framer-motion";
import frData from "../data/data-fr.json";
import enData from "../data/data-en.json";
import {
    FaBrain,
    FaDatabase,
    FaCode,
    FaCloud,
    FaServer,
    FaSquareRootAlt,
} from "react-icons/fa";

const MotionBox = motion(Box);

const categoryIcons = {
    ai: FaBrain,
    data_engineering: FaServer,
    software_engineering: FaCode,
    cloud_mlop: FaCloud,
    databases: FaDatabase,
    math_foundations: FaSquareRootAlt,
};

const categoryColors = {
    ai: { light: "purple.50", border: "purple.200", text: "purple.700", darkText: "purple.200", icon: "purple.500", accent: "purple.400" },
    data_engineering: { light: "orange.50", border: "orange.200", text: "orange.700", darkText: "orange.200", icon: "orange.500", accent: "orange.400" },
    software_engineering: { light: "blue.50", border: "blue.200", text: "blue.700", darkText: "blue.200", icon: "blue.500", accent: "blue.400" },
    cloud_mlop: { light: "cyan.50", border: "cyan.200", text: "cyan.700", darkText: "cyan.200", icon: "cyan.500", accent: "cyan.400" },
    databases: { light: "green.50", border: "green.200", text: "green.700", darkText: "green.200", icon: "green.500", accent: "green.400" },
    math_foundations: { light: "teal.50", border: "teal.200", text: "teal.700", darkText: "teal.200", icon: "teal.500", accent: "teal.400" },
};

function CategoryCard({title, items, icon, categoryKey, colorMode, idx}) {
    const isDark = colorMode === "dark";
    const colors = categoryColors[categoryKey] || categoryColors.software_engineering;

    const cardBg = useColorModeValue("white", "#111827");
    const cardBorder = useColorModeValue("gray.200", "whiteAlpha.100");
    const titleColor = useColorModeValue("gray.800", "white");
    const iconColor = useColorModeValue(colors.icon, colors.darkText);
    const chipBg = useColorModeValue(colors.light, "whiteAlpha.100");
    const chipText = useColorModeValue(colors.text, colors.darkText);
    const chipBorder = useColorModeValue(colors.border, "whiteAlpha.200");
    const accentBorder = useColorModeValue(colors.accent, colors.darkText);

    return (
        <MotionBox
            borderWidth="1px"
            borderRadius="2xl"
            p={5}
            bg={cardBg}
            borderColor={cardBorder}
            borderTop="3px solid"
            borderTopColor={accentBorder}
            boxShadow={isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.06)"}
            position="relative"
            overflow="hidden"
            initial={{opacity: 0, y: 30}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.2}}
            transition={{duration: 0.5, delay: idx * 0.08, ease: "easeOut"}}
            _hover={{
                transform: "translateY(-3px)",
                boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 24px rgba(0,0,0,0.1)",
                "& .shimmer": { left: "150%" },
            }}
        >
            <Box
                className="shimmer"
                position="absolute"
                top="0"
                left="-100%"
                w="60%"
                h="100%"
                background={isDark
                    ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)"
                    : "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)"
                }
                transform="skewX(-20deg)"
                transition="left 0.55s ease"
                pointerEvents="none"
                zIndex={0}
            />
            <HStack mb={4} spacing={3} position="relative" zIndex={1}>
                <Box
                    p={2}
                    borderRadius="lg"
                    bg={chipBg}
                >
                    <Icon as={icon} color={iconColor} boxSize={4}/>
                </Box>
                <Heading
                    size="sm"
                    color={titleColor}
                    fontWeight="bold"
                    letterSpacing="-0.01em"
                >
                    {title}
                </Heading>
            </HStack>

            <Wrap spacing={2} position="relative" zIndex={1}>
                {items.map((skill, sIdx) => (
                    <WrapItem key={sIdx}>
                        <Tooltip
                            label={skill.desc}
                            placement="top"
                            borderRadius="lg"
                            px={3}
                            py={2}
                            fontSize="xs"
                            maxW="220px"
                            hasArrow
                        >
                            <Box
                                px={3}
                                py={1.5}
                                fontSize="xs"
                                fontWeight="medium"
                                borderRadius="full"
                                bg={chipBg}
                                color={chipText}
                                border="1px solid"
                                borderColor={chipBorder}
                                cursor="default"
                                transition="all 0.15s"
                                _hover={{
                                    transform: "scale(1.05)",
                                    boxShadow: "sm",
                                }}
                            >
                                {skill.name}
                            </Box>
                        </Tooltip>
                    </WrapItem>
                ))}
            </Wrap>
        </MotionBox>
    );
}

export default function SkillsSection() {
    const {colorMode} = useColorMode();
    const {i18n} = useTranslation();
    const data = i18n.language === "fr" ? frData : enData;

    const isDark = colorMode === "dark";

    const bgMain = useColorModeValue("white", "#0d1424");
    const titleColor = useColorModeValue("gray.800", "white");
    const accentColor = useColorModeValue("teal.500", "teal.400");

    const categoryLabels = {
        ai: i18n.language === "fr" ? "IA / Machine Learning" : "AI / Machine Learning",
        data_engineering: "Data Engineering",
        software_engineering: "Software Engineering",
        cloud_mlop: "Cloud & MLOps",
        databases: i18n.language === "fr" ? "Bases de données" : "Databases",
        math_foundations: i18n.language === "fr" ? "Fondements mathématiques" : "Mathematical Foundations",
    };

    const categories = Object.keys(data.skills);

    return (
        <MotionBox
            id="skills"
            px={{base: 4, md: 8}}
            py={16}
            bg={bgMain}
            position="relative"
            overflow="hidden"
            initial={{opacity: 0, y: 50}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.2}}
            transition={{duration: 0.6, ease: "easeOut"}}
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
                        bottom="-120px"
                        right="-120px"
                        w="320px"
                        h="320px"
                        bg="purple.500"
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
                    {i18n.language === "fr" ? "Compétences" : "Skills"}
                </Heading>
                <Box w="48px" h="4px" bg={accentColor} borderRadius="full" />
            </VStack>

            <SimpleGrid columns={[1, 2, 3]} spacing={5} position="relative" zIndex={1}>
                {categories.map((categoryKey, idx) => (
                    <CategoryCard
                        key={categoryKey}
                        title={categoryLabels[categoryKey] || categoryKey}
                        items={data.skills[categoryKey]}
                        icon={categoryIcons[categoryKey] || FaCode}
                        categoryKey={categoryKey}
                        colorMode={colorMode}
                        idx={idx}
                    />
                ))}
            </SimpleGrid>
        </MotionBox>
    );
}

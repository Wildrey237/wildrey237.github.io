import {
    Box,
    Heading,
    SimpleGrid,
    Text,
    useColorMode,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverCloseButton,
    PopoverBody,
    useBreakpointValue,
    HStack,
    Icon,
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
    FaChartBar,
    FaServer,
} from "react-icons/fa";

const MotionBox = motion(Box);
const MotionHStack = motion(HStack);

const categoryIcons = {
    ai: FaBrain,
    data_engineering: FaServer,
    software_engineering: FaCode,
    cloud_mlop: FaCloud,
    databases: FaDatabase,
    dataviz: FaChartBar,
};

function CategoryCard({title, items, icon, colorMode, triggerMode, idx}) {
    const isDark = colorMode === "dark";

    const cardBg = useColorModeValue("whiteAlpha.700", "whiteAlpha.50");
    const cardBorder = useColorModeValue("blackAlpha.100", "whiteAlpha.200");
    const titleColor = useColorModeValue("teal.600", "teal.300");
    const textColor = useColorModeValue("gray.700", "gray.100");
    const iconColor = useColorModeValue("teal.500", "teal.300");
    const popoverBg = useColorModeValue("teal.600", "#122033");

    return (
        <MotionBox
            borderWidth="1px"
            borderRadius="xl"
            p={6}
            bg={cardBg}
            borderColor={cardBorder}
            backdropFilter="blur(10px)"
            boxShadow={
                isDark
                    ? "0 0 0 1px rgba(255,255,255,0.04), 0 10px 40px rgba(0,0,0,0.25)"
                    : "md"
            }
            initial={{opacity: 0, y: 30}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.2}}
            transition={{duration: 0.5, delay: idx * 0.08, ease: "easeOut"}}
            _hover={{
                transform: "translateY(-4px)",
                boxShadow: isDark
                    ? "0 0 0 1px rgba(255,255,255,0.06), 0 14px 36px rgba(0,0,0,0.35)"
                    : "0 8px 20px rgba(0,0,0,0.12)",
                borderColor: isDark ? "teal.400" : "teal.300",
            }}
        >
            <HStack mb={4} spacing={3}>
                <Icon as={icon} color={iconColor} boxSize={5}/>
                <Heading
                    size="md"
                    fontFamily="monospace"
                    color={titleColor}
                    letterSpacing="-0.02em"
                >
                    {title}
                </Heading>
            </HStack>

            {items.map((skill, sIdx) => (
                <Popover key={sIdx} trigger={triggerMode} placement="top-start">
                    <PopoverTrigger>
                        <MotionHStack
                            spacing={2}
                            align="start"
                            fontFamily="monospace"
                            fontSize="sm"
                            mb={2}
                            color={textColor}
                            whileHover={{scale: 1.03}}
                            whileTap={{scale: 0.98}}
                            style={{cursor: "pointer"}}
                        >
                            <Box pt="2px" color={iconColor}>
                                <FaCode/>
                            </Box>
                            <Text as="span">{skill.name}</Text>
                        </MotionHStack>
                    </PopoverTrigger>

                    <PopoverContent
                        bg={popoverBg}
                        color="white"
                        borderRadius="lg"
                        p={2}
                        maxW="260px"
                        fontSize="sm"
                        borderColor={isDark ? "whiteAlpha.200" : "teal.500"}
                        boxShadow="xl"
                    >
                        <PopoverArrow bg={popoverBg}/>
                        <PopoverCloseButton/>
                        <PopoverBody>{skill.desc}</PopoverBody>
                    </PopoverContent>
                </Popover>
            ))}
        </MotionBox>
    );
}

export default function SkillsSection() {
    const {colorMode} = useColorMode();
    const {i18n} = useTranslation();
    const data = i18n.language === "fr" ? frData : enData;
    const triggerMode = useBreakpointValue({base: "click", md: "hover"});

    const isDark = colorMode === "dark";

    const bgMain = useColorModeValue("gray.50", "#050816");
    const titleColor = useColorModeValue("teal.600", "teal.300");

    const categoryLabels = {
        ai: i18n.language === "fr" ? "IA / Machine Learning" : "AI / Machine Learning",
        data_engineering: "Data engineering",
        software_engineering: "Software engineering",
        cloud_mlop: "Cloud & MLOps",
        databases: i18n.language === "fr" ? "Bases de données" : "Databases",
        dataviz: i18n.language === "fr" ? "Visualisation" : "Visualization",
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
                        opacity={0.08}
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
                        bg="blue.500"
                        opacity={0.12}
                        filter="blur(120px)"
                        borderRadius="full"
                    />
                </>
            )}

            <Heading
                mb={12}
                textAlign="center"
                fontSize={["2xl", "3xl", "4xl"]}
                color={titleColor}
                fontFamily="monospace"
                position="relative"
                zIndex={1}
            >
                {i18n.language === "fr" ? "Compétences" : "Skills"}
            </Heading>

            <SimpleGrid columns={[1, 2, 3]} spacing={6} position="relative" zIndex={1}>
                {categories.map((categoryKey, idx) => (
                    <CategoryCard
                        key={categoryKey}
                        title={categoryLabels[categoryKey] || categoryKey}
                        items={data.skills[categoryKey]}
                        icon={categoryIcons[categoryKey] || FaCode}
                        colorMode={colorMode}
                        triggerMode={triggerMode}
                        idx={idx}
                    />
                ))}
            </SimpleGrid>
        </MotionBox>
    );
}
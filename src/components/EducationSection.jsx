import {
    Box,
    Heading,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Text,
    useColorMode,
    Stack,
    HStack,
    Tag,
    Link,
    useColorModeValue,
    Icon,
} from "@chakra-ui/react";
import {ExternalLinkIcon} from "@chakra-ui/icons";
import {FaGraduationCap} from "react-icons/fa";
import {useTranslation} from "react-i18next";
import {motion} from "framer-motion";
import frData from "../data/data-fr.json";
import enData from "../data/data-en.json";

const MotionBox = motion(Box);

export default function EducationSection() {
    const {i18n} = useTranslation();
    const {colorMode} = useColorMode();
    const data = i18n.language === "fr" ? frData : enData;

    const isDark = colorMode === "dark";

    const bgMain = useColorModeValue("gray.50", "#050816");
    const titleColor = useColorModeValue("teal.600", "teal.300");
    const cardBg = useColorModeValue("white", "#243147");
    const cardBorder = useColorModeValue("gray.200", "whiteAlpha.200");
    const textMain = useColorModeValue("gray.800", "white");
    const textSoft = useColorModeValue("gray.600", "gray.300");
    const subCardBg = useColorModeValue("gray.50", "#1B2436");
    const iconColor = useColorModeValue("teal.500", "teal.300");

    const getCampusBadge = (schoolName) => {
        if (!schoolName) return null;
        const name = schoolName.toLowerCase();

        if (name.includes("lyon")) {
            return <Tag colorScheme="teal" size="sm">Lyon</Tag>;
        }
        if (name.includes("paris") || name.includes("kremlin")) {
            return <Tag colorScheme="blue" size="sm">Paris</Tag>;
        }
        if (name.includes("rennes")) {
            return <Tag colorScheme="purple" size="sm">Rennes</Tag>;
        }
        if (name.includes("yaoundé") || name.includes("yaounde")) {
            return <Tag colorScheme="red" size="sm">Yaoundé</Tag>;
        }
        return null;
    };

    return (
        <Box
            id="education"
            px={{base: 4, md: 8}}
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
                        opacity={0.08}
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
                        opacity={0.1}
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
                {i18n.language === "fr" ? "Parcours scolaire" : "Education"}
            </Heading>

            <Accordion allowMultiple position="relative" zIndex={1}>
                {data.education &&
                    data.education.map((edu, idx) => (
                        <MotionBox
                            key={idx}
                            initial={{opacity: 0, y: 30}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true, amount: 0.2}}
                            transition={{duration: 0.4, delay: idx * 0.1, ease: "easeOut"}}
                        >
                            <AccordionItem
                                border="1px solid"
                                borderColor={cardBorder}
                                borderRadius="xl"
                                mb={4}
                                overflow="hidden"
                                bg={cardBg}
                                boxShadow={
                                    isDark
                                        ? "0 0 0 1px rgba(255,255,255,0.04), 0 10px 40px rgba(0,0,0,0.25)"
                                        : "md"
                                }
                                _hover={{
                                    borderColor: isDark ? "teal.400" : "teal.300",
                                    boxShadow: isDark
                                        ? "0 0 0 1px rgba(255,255,255,0.06), 0 14px 36px rgba(0,0,0,0.35)"
                                        : "0 10px 24px rgba(0,0,0,0.12)",
                                }}
                            >
                                <h2>
                                    <AccordionButton
                                        px={5}
                                        py={4}
                                        _expanded={{
                                            bg: isDark ? "#1B2436" : "teal.50",
                                            color: textMain,
                                        }}
                                    >
                                        <HStack flex="1" textAlign="left" spacing={3} align="start">
                                            <Box pt="2px">
                                                <Icon as={FaGraduationCap} color={iconColor} boxSize={5}/>
                                            </Box>

                                            <Box flex="1">
                                                <Text fontWeight="bold" color={textMain}>
                                                    {edu.degree}
                                                </Text>

                                                <HStack spacing={2} flexWrap="wrap" mt={1}>
                                                    <Text fontSize="sm" color={textSoft}>
                                                        {edu.school} • {edu.years}
                                                    </Text>

                                                    {getCampusBadge(edu.school)}

                                                    {edu.website && edu.website.trim() !== "" && (
                                                        <Link
                                                            href={edu.website}
                                                            isExternal
                                                            color={textSoft}
                                                            _hover={{color: "teal.400"}}
                                                        >
                                                            <ExternalLinkIcon mb="3px"/>
                                                        </Link>
                                                    )}
                                                </HStack>
                                            </Box>
                                        </HStack>

                                        <AccordionIcon color={iconColor}/>
                                    </AccordionButton>
                                </h2>

                                <AccordionPanel pb={5} px={5}>
                                    <Text
                                        fontSize="sm"
                                        color={textSoft}
                                        mb={4}
                                    >
                                        {edu.details}
                                    </Text>

                                    {edu.projects && edu.projects.length > 0 && (
                                        <Stack spacing={3}>
                                            {edu.projects.map((proj, pIdx) => (
                                                <Box
                                                    key={pIdx}
                                                    p={4}
                                                    borderRadius="lg"
                                                    bg={subCardBg}
                                                    border="1px solid"
                                                    borderColor={cardBorder}
                                                    boxShadow="sm"
                                                    _hover={{
                                                        transform: "translateY(-2px)",
                                                        borderColor: isDark ? "teal.400" : "teal.300",
                                                    }}
                                                    transition="all 0.2s ease"
                                                >
                                                    <Text
                                                        fontWeight="semibold"
                                                        color={textMain}
                                                        mb={1}
                                                    >
                                                        {proj.title}
                                                    </Text>
                                                    <Text fontSize="sm" color={textSoft}>
                                                        {proj.description}
                                                    </Text>
                                                </Box>
                                            ))}
                                        </Stack>
                                    )}
                                </AccordionPanel>
                            </AccordionItem>
                        </MotionBox>
                    ))}
            </Accordion>
        </Box>
    );
}
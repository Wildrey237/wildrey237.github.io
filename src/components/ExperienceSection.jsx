import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Circle,
    useColorMode,
    Tag,
    Wrap,
    WrapItem,
    useColorModeValue,
} from "@chakra-ui/react";
import {motion} from "framer-motion";
import frData from "../data/data-fr.json";
import enData from "../data/data-en.json";
import {useTranslation} from "react-i18next";

const MotionBox = motion(Box);
const MotionTag = motion(Tag);

export default function ExperienceSection() {
    const {i18n} = useTranslation();
    const {colorMode} = useColorMode();
    const data = i18n.language === "fr" ? frData : enData;

    const isDark = colorMode === "dark";

    const bgMain = useColorModeValue("gray.50", "#050816");
    const titleColor = useColorModeValue("teal.600", "teal.300");
    const cardBg = useColorModeValue("white", "#0f172a"); // dark bleu profond
    const cardBorder = useColorModeValue("gray.200", "whiteAlpha.200");
    const textMain = useColorModeValue("gray.800", "white");
    const textSoft = useColorModeValue("gray.600", "gray.300");
    const companyColor = useColorModeValue("blue.500", "blue.300");
    const dateColor = useColorModeValue("teal.500", "teal.300");
    const lineColor = useColorModeValue("teal.300", "teal.500");
    const pointColor = useColorModeValue("teal.400", "teal.300");

    return (
        <Box
            id="experiences"
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
                        left="-120px"
                        w="320px"
                        h="320px"
                        bg="purple.500"
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
                {i18n.language === "fr" ? "Expériences professionnelles" : "Work Experiences"}
            </Heading>

            <VStack spacing={10} position="relative" align="stretch" zIndex={1}>
                <Box
                    position="absolute"
                    top="0"
                    left={{base: "12px", md: "50%"}}
                    transform={{base: "none", md: "translateX(-50%)"}}
                    width="4px"
                    height="100%"
                    bg={lineColor}
                    borderRadius="full"
                    opacity={0.8}
                    zIndex={0}
                />

                {data.experiences.map((exp, idx) => (
                    <HStack
                        key={idx}
                        align="flex-start"
                        spacing={4}
                        position="relative"
                        zIndex={1}
                        flexDirection={{
                            base: "row",
                            md: idx % 2 === 0 ? "row" : "row-reverse",
                        }}
                    >
                        <Circle
                            size="16px"
                            bg={pointColor}
                            mt={2}
                            flexShrink={0}
                            boxShadow={isDark ? "0 0 10px rgba(129,230,217,0.5)" : "none"}
                        />

                        <MotionBox
                            p={6}
                            flex="1"
                            bg={cardBg}
                            border="1px solid"
                            borderColor={cardBorder}
                            borderRadius="xl"
                            backdropFilter="blur(10px)"
                            boxShadow={
                                isDark
                                    ? "0 0 0 1px rgba(255,255,255,0.04), 0 10px 40px rgba(0,0,0,0.25)"
                                    : "lg"
                            }
                            initial={{opacity: 0, x: idx % 2 === 0 ? -80 : 80}}
                            whileInView={{opacity: 1, x: 0}}
                            viewport={{once: true, amount: 0.2}}
                            transition={{duration: 0.6, delay: idx * 0.1, ease: "easeOut"}}
                            whileHover={{
                                scale: 1.02,
                                borderColor: isDark ? "teal.400" : "teal.300",
                                boxShadow: isDark
                                    ? "0 0 0 1px rgba(255,255,255,0.06), 0 14px 36px rgba(0,0,0,0.35)"
                                    : "0 10px 24px rgba(0,0,0,0.12)",
                            }}
                        >
                            <Text fontSize="sm" fontWeight="bold" color={dateColor} mb={2}>
                                {exp.dates}
                            </Text>

                            <Text fontSize="xl" fontWeight="bold" color={textMain}>
                                {exp.title}
                            </Text>

                            <Text
                                fontSize="md"
                                fontWeight="semibold"
                                color={companyColor}
                                mb={3}
                            >
                                {exp.company}
                            </Text>

                            <Text fontSize="sm" color={textSoft} mb={4}>
                                {exp.description}
                            </Text>

                            {exp.tags && (
                                <Wrap spacing={3}>
                                    {exp.tags.map((tag, tagIdx) => (
                                        <WrapItem key={tagIdx}>
                                            <MotionTag
                                                size="md"
                                                bg={isDark ? "whiteAlpha.100" : "teal.50"}
                                                color={isDark ? "teal.200" : "teal.700"}
                                                border="1px solid"
                                                borderColor={isDark ? "whiteAlpha.200" : "teal.200"}
                                                borderRadius="full"
                                                whileHover={{scale: 1.08}}
                                                whileTap={{scale: 0.96}}
                                            >
                                                {tag}
                                            </MotionTag>
                                        </WrapItem>
                                    ))}
                                </Wrap>
                            )}
                        </MotionBox>
                    </HStack>
                ))}
            </VStack>
        </Box>
    );
}
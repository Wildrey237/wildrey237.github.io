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
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import frData from "../data/data-fr.json";
import enData from "../data/data-en.json";
import { useTranslation } from "react-i18next";

const MotionBox = motion(Box);

export default function ExperienceSection() {
    const { i18n } = useTranslation();
    const { colorMode } = useColorMode();
    const data = i18n.language === "fr" ? frData : enData;

    return (
        <Box
            id="experiences"
            px={[4, 8]}
            py={12}
            bg={colorMode === "light" ? "gray.100" : "gray.800"}
            position="relative"
        >
            <Heading
                mb={12}
                textAlign="center"
                fontSize={["2xl", "3xl", "4xl"]}
                color={colorMode === "light" ? "gray.800" : "white"}
            >
                {i18n.language === "fr" ? "Expériences professionnelles" : "Work Experiences"}
            </Heading>

            <VStack spacing={10} position="relative" align="stretch">
                {/* Ligne verticale */}
                <Box
                    position="absolute"
                    top="0"
                    left={["12px", "50%"]}
                    transform={["none", "translateX(-50%)"]}
                    width="4px"
                    height="100%"
                    bg={colorMode === "light" ? "teal.300" : "teal.500"}
                    borderRadius="full"
                    zIndex={0}
                />

                {data.experiences.map((exp, idx) => (
                    <HStack
                        key={idx}
                        align="flex-start"
                        spacing={4}
                        position="relative"
                        zIndex={1}
                        flexDirection={["row", idx % 2 === 0 ? "row" : "row-reverse"]}
                    >
                        <Circle
                            size="16px"
                            bg={colorMode === "light" ? "teal.400" : "teal.300"}
                            mt={2}
                            flexShrink={0}
                        />
                        <MotionBox
                            p={6}
                            flex="1"
                            bg={colorMode === "light" ? "white" : "gray.700"}
                            borderRadius="xl"
                            boxShadow="lg"
                            initial={{ opacity: 0, x: idx % 2 === 0 ? -80 : 80 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
                            whileHover={{
                                scale: 1.03,
                                boxShadow: `0 0 15px ${
                                    colorMode === "light" ? "teal.400" : "teal.200"
                                }`,
                            }}
                        >
                            <Text fontSize="sm" fontWeight="bold" color="teal.400" mb={2}>
                                {exp.dates}
                            </Text>
                            <Text
                                fontSize="xl"
                                fontWeight="bold"
                                color={colorMode === "light" ? "gray.800" : "white"}
                            >
                                {exp.title}
                            </Text>
                            <Text
                                fontSize="md"
                                fontWeight="semibold"
                                color="blue.400"
                                mb={3}
                            >
                                {exp.company}
                            </Text>
                            <Text
                                fontSize="sm"
                                color={colorMode === "light" ? "gray.600" : "gray.200"}
                                mb={4}
                            >
                                {exp.description}
                            </Text>

                            {/* Tags */}
                            {exp.tags && (
                                <Wrap spacing={3}>
                                    {exp.tags.map((tag, tagIdx) => (
                                        <WrapItem key={tagIdx}>
                                            <Tag
                                                size="md"
                                                colorScheme="teal"
                                                variant="subtle"
                                                borderRadius="full"
                                                transition="transform 0.2s ease"
                                                _hover={{ transform: "scale(1.1)" }}
                                            >
                                                {tag}
                                            </Tag>
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
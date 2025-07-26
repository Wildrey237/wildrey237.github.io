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
} from "@chakra-ui/react";
import {ExternalLinkIcon} from "@chakra-ui/icons";
import {FaGraduationCap} from "react-icons/fa";
import {useTranslation} from "react-i18next";
import {motion} from "framer-motion";
import frData from "../data/data-fr.json";
import enData from "../data/data-en.json";

// On crée un composant animé à partir de Box
const MotionBox = motion(Box);

export default function EducationSection() {
    const {i18n} = useTranslation();
    const {colorMode} = useColorMode();
    const data = i18n.language === "fr" ? frData : enData;

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
            px={[4, 8]}
            py={12}
            bg={colorMode === "light" ? "gray.50" : "gray.800"}
        >
            <Heading
                mb={12}
                textAlign="center"
                fontSize={["2xl", "3xl", "4xl"]}
                color={colorMode === "light" ? "teal.600" : "teal.300"}
                fontFamily="monospace"
            >
                {i18n.language === "fr" ? "Parcours scolaire" : "Education"}
            </Heading>

            <Accordion allowMultiple>
                {data.education && data.education.map((edu, idx) => (
                    <MotionBox
                        key={idx}
                        initial={{opacity: 0, y: 30}}
                        whileInView={{opacity: 1, y: 0}}
                        viewport={{once: true, amount: 0.2}}
                        transition={{duration: 0.4, delay: idx * 0.1, ease: "easeOut"}}
                    >
                        <AccordionItem
                            border="1px solid"
                            borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                            borderRadius="md"
                            mb={4}
                            overflow="hidden"
                            bg={colorMode === "light" ? "white" : "gray.700"}
                            _hover={{
                                boxShadow:
                                    colorMode === "light"
                                        ? "0 4px 12px rgba(0,0,0,0.1)"
                                        : "0 4px 12px rgba(0,0,0,0.5)",
                            }}
                        >
                            <h2>
                                <AccordionButton _expanded={{bg: "teal.500", color: "white"}}>
                                    <HStack flex="1" textAlign="left" spacing={3}>
                                        <Box color={colorMode === "light" ? "teal.500" : "teal.200"}>
                                            <FaGraduationCap size={20}/>
                                        </Box>
                                        <Box>
                                            <Text fontWeight="bold">{edu.degree}</Text>
                                            <HStack spacing={2}>
                                                <Text fontSize="sm" color="gray.500">
                                                    {edu.school} • {edu.years}
                                                </Text>
                                                {getCampusBadge(edu.school)}
                                                {edu.website && edu.website.trim() !== "" && (
                                                    <Link
                                                        href={edu.website}
                                                        isExternal
                                                        color={colorMode === "light" ? "gray.400" : "gray.300"}
                                                        _hover={{color: "teal.400"}}
                                                    >
                                                        <ExternalLinkIcon mb="3px"/>
                                                    </Link>
                                                )}
                                            </HStack>
                                        </Box>
                                    </HStack>
                                    <AccordionIcon/>
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                                <Text
                                    fontSize="sm"
                                    color={colorMode === "light" ? "gray.700" : "gray.200"}
                                    mb={4}
                                >
                                    {edu.details}
                                </Text>
                                {edu.projects && edu.projects.length > 0 && (
                                    <Stack spacing={3}>
                                        {edu.projects.map((proj, pIdx) => (
                                            <Box
                                                key={pIdx}
                                                p={3}
                                                borderRadius="md"
                                                bg={colorMode === "light" ? "gray.100" : "gray.600"}
                                                boxShadow="sm"
                                                transition="transform 0.2s ease"
                                                _hover={{transform: "scale(1.02)"}}
                                            >
                                                <Text fontWeight="semibold">{proj.title}</Text>
                                                <Text fontSize="sm">{proj.description}</Text>
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
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
} from "@chakra-ui/react";
import {useTranslation} from "react-i18next";
import frData from "../data/data-fr.json";
import enData from "../data/data-en.json";
import {FaCode} from "react-icons/fa";

function CategoryCard({title, items, colorMode, triggerMode}) {
    return (
        <Box
            borderWidth="1px"
            borderRadius="lg"
            p={5}
            bg={colorMode === "light" ? "white" : "gray.700"}
            boxShadow="md"
            transition="transform 0.2s ease, box-shadow 0.2s ease"
            _hover={{
                transform: "translateY(-4px)",
                boxShadow:
                    colorMode === "light"
                        ? "0 4px 12px rgba(0,0,0,0.2)"
                        : "0 4px 12px rgba(0,0,0,0.6)",
            }}
        >
            <Heading
                size="md"
                mb={3}
                fontFamily="monospace"
                color={colorMode === "light" ? "teal.600" : "teal.300"}
            >
                {title}
            </Heading>
            {items.map((skill, idx) => (
                <Popover key={idx} trigger={triggerMode} placement="top">
                    <PopoverTrigger>
                        <HStack
                            spacing={2}
                            fontFamily="monospace"
                            fontSize="sm"
                            mb={1}
                            color={colorMode === "light" ? "gray.700" : "gray.100"}
                            transition="color 0.2s ease"
                            _hover={{
                                color: "teal.400",
                                textDecoration: "none",
                                cursor: "pointer",
                            }}
                        >
                            <FaCode/>
                            <Text as="span">{skill.name}</Text>
                        </HStack>
                    </PopoverTrigger>
                    <PopoverContent
                        bg="teal.600"
                        color="white"
                        borderRadius="md"
                        p={2}
                        maxW="220px"
                        fontSize="sm"
                    >
                        <PopoverArrow/>
                        <PopoverCloseButton/>
                        <PopoverBody>{skill.desc}</PopoverBody>
                    </PopoverContent>
                </Popover>
            ))}
        </Box>
    );
}

export default function SkillsSection() {
    const {colorMode} = useColorMode();
    const {i18n} = useTranslation();
    const data = i18n.language === "fr" ? frData : enData;
    const triggerMode = useBreakpointValue({base: "click", md: "hover"});

    return (
        <Box
            id="skills"
            px={[4, 8]}
            py={12}
            bg={colorMode === "light" ? "gray.100" : "gray.800"}
        >
            <Heading
                mb={12}
                textAlign="center"
                fontSize={["2xl", "3xl", "4xl"]}
                color={colorMode === "light" ? "teal.600" : "teal.300"}
                fontFamily="monospace"
            >
                {i18n.language === "fr" ? "Compétences" : "Skills"}
            </Heading>

            <SimpleGrid columns={[1, 2, 3]} spacing={6}>
                <CategoryCard
                    title={i18n.language === "fr" ? "Développement" : "Development"}
                    items={data.skills.development}
                    colorMode={colorMode}
                    triggerMode={triggerMode}
                />
                <CategoryCard
                    title={i18n.language === "fr" ? "Environnements" : "Environments"}
                    items={data.skills.environments}
                    colorMode={colorMode}
                    triggerMode={triggerMode}
                />
                <CategoryCard
                    title={i18n.language === "fr" ? "Bases de données" : "Databases"}
                    items={data.skills.databases}
                    colorMode={colorMode}
                    triggerMode={triggerMode}
                />
                <CategoryCard
                    title="AI / ML"
                    items={data.skills.ai}
                    colorMode={colorMode}
                    triggerMode={triggerMode}
                />
                <CategoryCard
                    title="Big Data"
                    items={data.skills.bigdata}
                    colorMode={colorMode}
                    triggerMode={triggerMode}
                />
            </SimpleGrid>
        </Box>
    );
}
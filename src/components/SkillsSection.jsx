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
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import frData from "../data/data-fr.json";
import enData from "../data/data-en.json";
import { FaCode } from "react-icons/fa";

const MotionBox = motion(Box);
const MotionHStack = motion(HStack);

function CategoryCard({ title, items, colorMode, triggerMode, idx }) {
    return (
        <MotionBox
            borderWidth="1px"
            borderRadius="lg"
            p={5}
            bg={colorMode === "light" ? "white" : "gray.700"}
            boxShadow="md"
            sx={{ transition: "transform 0.2s ease, box-shadow 0.2s ease" }} // CSS ici au lieu de prop
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
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
            {items.map((skill, sIdx) => (
                <Popover key={sIdx} trigger={triggerMode} placement="top">
                    <PopoverTrigger>
                        <MotionHStack
                            spacing={2}
                            fontFamily="monospace"
                            fontSize="sm"
                            mb={1}
                            color={colorMode === "light" ? "gray.700" : "gray.100"}
                            transition="color 0.2s ease"
                            whileHover={{ scale: 1.08, color: "#319795" }}
                            whileTap={{ scale: 0.95 }}
                            style={{ cursor: "pointer" }}
                        >
                            <FaCode />
                            <Text as="span">{skill.name}</Text>
                        </MotionHStack>
                    </PopoverTrigger>
                    <PopoverContent
                        bg="teal.600"
                        color="white"
                        borderRadius="md"
                        p={2}
                        maxW="220px"
                        fontSize="sm"
                    >
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverBody>{skill.desc}</PopoverBody>
                    </PopoverContent>
                </Popover>
            ))}
        </MotionBox>
    );
}

export default function SkillsSection() {
    const { colorMode } = useColorMode();
    const { i18n } = useTranslation();
    const data = i18n.language === "fr" ? frData : enData;
    const triggerMode = useBreakpointValue({ base: "click", md: "hover" });

    const categories = Object.keys(data.skills);

    return (
        <MotionBox
            id="skills"
            px={[4, 8]}
            py={12}
            bg={colorMode === "light" ? "gray.100" : "gray.800"}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
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
                {categories.map((categoryKey, idx) => {
                    const formattedTitle = categoryKey
                        .replace(/_/g, " ")
                        .replace(/^\w/, (c) => c.toUpperCase());

                    return (
                        <CategoryCard
                            key={categoryKey}
                            title={formattedTitle}
                            items={data.skills[categoryKey]}
                            colorMode={colorMode}
                            triggerMode={triggerMode}
                            idx={idx}
                        />
                    );
                })}
            </SimpleGrid>
        </MotionBox>
    );
}
import React, { useState } from "react";
import {
    Box,
    Text,
    VStack,
    HStack,
    Icon,
    Wrap,
    WrapItem,
    Select,
    Button,
    Menu,
    MenuButton,
    MenuList,
    Checkbox,
    CheckboxGroup,
    useColorModeValue,
    SimpleGrid,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Heading,
    IconButton,
    Spacer,
} from "@chakra-ui/react";
import * as LucideIcons from "lucide-react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import dataFr from "../data/data-fr.json";
import dataEn from "../data/data-en.json";

const MotionBox = motion(Box);
const MotionTag = motion(Box);

const ProjectCard = ({ project, index, onOpenProject, isDark }) => {
    const IconComponent = LucideIcons[project.icon] || LucideIcons["FileText"];

    const cardBg = useColorModeValue("whiteAlpha.700", "whiteAlpha.50");
    const cardBorder = useColorModeValue("blackAlpha.100", "whiteAlpha.200");
    const titleColor = useColorModeValue("gray.800", "white");
    const textColor = useColorModeValue("gray.700", "gray.100");
    const schoolColor = useColorModeValue("gray.500", "gray.300");
    const iconColor = useColorModeValue("teal.500", "teal.300");
    const tagBg = useColorModeValue("teal.50", "whiteAlpha.100");
    const tagColor = useColorModeValue("teal.700", "teal.200");
    const tagBorder = useColorModeValue("teal.200", "whiteAlpha.200");

    return (
        <MotionBox
            p={6}
            borderWidth="1px"
            borderRadius="xl"
            bg={cardBg}
            borderColor={cardBorder}
            backdropFilter="blur(10px)"
            boxShadow={
                isDark
                    ? "0 0 0 1px rgba(255,255,255,0.04), 0 10px 40px rgba(0,0,0,0.25)"
                    : "md"
            }
            cursor="pointer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
            _hover={{
                transform: "translateY(-4px)",
                boxShadow: isDark
                    ? "0 0 0 1px rgba(255,255,255,0.06), 0 14px 36px rgba(0,0,0,0.35)"
                    : "0 8px 20px rgba(0,0,0,0.12)",
                borderColor: isDark ? "teal.400" : "teal.300",
            }}
            h="100%"
            onClick={() => onOpenProject(project)}
        >
            <VStack align="start" spacing={3} h="100%">
                <HStack spacing={3} align="start" w="100%">
                    <Icon as={IconComponent} color={iconColor} boxSize={5} mt="2px" />
                    <Text
                        fontWeight="bold"
                        fontSize="lg"
                        color={titleColor}
                        noOfLines={2}
                    >
                        {project.title}
                    </Text>
                </HStack>

                <Text fontSize="sm" color={schoolColor}>
                    {project.school}
                </Text>

                <Text fontSize="sm" color={textColor} noOfLines={4}>
                    {project.description}
                </Text>

                <Box flex="1" />

                {project.tags && project.tags.length > 0 && (
                    <Wrap spacing={2} pt={2} w="100%">
                        {project.tags.slice(0, 5).map((tag, i) => (
                            <WrapItem key={i}>
                                <MotionTag
                                    px={3}
                                    py={1}
                                    fontSize="xs"
                                    borderRadius="md"
                                    bg={tagBg}
                                    color={tagColor}
                                    border="1px solid"
                                    borderColor={tagBorder}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    {tag}
                                </MotionTag>
                            </WrapItem>
                        ))}
                    </Wrap>
                )}

                <HStack w="100%" pt={2}>
                    <Spacer />
                    <IconButton
                        aria-label="Open project"
                        icon={<Plus size={16} />}
                        size="sm"
                        borderRadius="full"
                        colorScheme="teal"
                        variant={isDark ? "subtle" : "solid"}
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenProject(project);
                        }}
                    />
                </HStack>
            </VStack>
        </MotionBox>
    );
};

const ProjectsSection = () => {
    const { t, i18n } = useTranslation();
    const data = i18n.language === "fr" ? dataFr : dataEn;

    const [schoolFilter, setSchoolFilter] = useState("");
    const [tagFilter, setTagFilter] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);

    const { isOpen, onOpen, onClose } = useDisclosure();

    const allProjects = data.projects;
    const schools = [...new Set(allProjects.map((p) => p.school))];
    const tags = [...new Set(allProjects.flatMap((p) => p.tags || []))];

    const filteredProjects = allProjects.filter((p) => {
        const matchSchool = schoolFilter ? p.school === schoolFilter : true;
        const matchTags =
            tagFilter.length > 0
                ? tagFilter.some((tag) => p.tags?.includes(tag))
                : true;
        return matchSchool && matchTags;
    });

    const openProjectModal = (project) => {
        setSelectedProject(project);
        onOpen();
    };

    const closeProjectModal = () => {
        setSelectedProject(null);
        onClose();
    };

    const selectedIcon =
        selectedProject && LucideIcons[selectedProject.icon]
            ? LucideIcons[selectedProject.icon]
            : LucideIcons.FileText;

    const isDark = useColorModeValue(false, true);

    const bgMain = useColorModeValue("gray.50", "#050816");
    const titleColor = useColorModeValue("teal.600", "teal.300");

    const cardBg = useColorModeValue("whiteAlpha.700", "whiteAlpha.50");
    const cardBorder = useColorModeValue("blackAlpha.100", "whiteAlpha.200");

    const modalBg = useColorModeValue("white", "#122033");
    const modalText = useColorModeValue("gray.800", "white");
    const modalSubText = useColorModeValue("gray.600", "gray.300");

    const inputBg = useColorModeValue("whiteAlpha.900", "whiteAlpha.100");
    const tagBg = useColorModeValue("teal.50", "whiteAlpha.100");
    const tagColor = useColorModeValue("teal.700", "teal.200");
    const tagBorder = useColorModeValue("teal.200", "whiteAlpha.200");

    return (
        <MotionBox
            id="projects"
            px={{ base: 4, md: 8 }}
            py={16}
            bg={bgMain}
            position="relative"
            overflow="hidden"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
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
                {t("projects.title")}
            </Heading>

            <HStack
                spacing={4}
                mb={8}
                justify="center"
                flexWrap="wrap"
                position="relative"
                zIndex={1}
            >
                <Select
                    placeholder={t("projects.filterBySchool")}
                    maxW="260px"
                    value={schoolFilter}
                    onChange={(e) => setSchoolFilter(e.target.value)}
                    bg={inputBg}
                    borderColor={cardBorder}
                    _hover={{ borderColor: "teal.300" }}
                    _focus={{ borderColor: "teal.400", boxShadow: "none" }}
                >
                    {schools.map((school, idx) => (
                        <option key={idx} value={school}>
                            {school}
                        </option>
                    ))}
                </Select>

                <Menu closeOnSelect={false}>
                    <MenuButton
                        as={Button}
                        maxW="260px"
                        bg={inputBg}
                        border="1px solid"
                        borderColor={cardBorder}
                        _hover={{ borderColor: "teal.300" }}
                    >
                        {tagFilter.length > 0
                            ? `${t("projects.tagsSelected")} (${tagFilter.length})`
                            : t("projects.filterByTags")}
                    </MenuButton>

                    <MenuList
                        maxH="300px"
                        overflowY="auto"
                        p={2}
                        bg={cardBg}
                        borderColor={cardBorder}
                    >
                        <CheckboxGroup value={tagFilter} onChange={setTagFilter}>
                            <VStack align="start" spacing={2}>
                                {tags.map((tag, idx) => (
                                    <Checkbox key={idx} value={tag} colorScheme="teal">
                                        {tag}
                                    </Checkbox>
                                ))}
                            </VStack>
                        </CheckboxGroup>
                    </MenuList>
                </Menu>
            </HStack>

            <SimpleGrid
                columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
                spacing={6}
                position="relative"
                zIndex={1}
            >
                {filteredProjects.map((project, index) => (
                    <ProjectCard
                        key={index}
                        project={project}
                        index={index}
                        onOpenProject={openProjectModal}
                        isDark={isDark}
                    />
                ))}
            </SimpleGrid>

            <Modal isOpen={isOpen} onClose={closeProjectModal} size="3xl" isCentered>
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent
                    bg={modalBg}
                    color={modalText}
                    mx={4}
                    border="1px solid"
                    borderColor={cardBorder}
                >
                    <ModalHeader>
                        {selectedProject && (
                            <HStack spacing={3} align="start">
                                <Icon as={selectedIcon} boxSize={6} color="teal.400" mt={1} />
                                <Box>
                                    <Text fontSize="2xl" fontWeight="bold">
                                        {selectedProject.title}
                                    </Text>
                                    <Text fontSize="sm" color={modalSubText} mt={1}>
                                        {selectedProject.school}
                                    </Text>
                                </Box>
                            </HStack>
                        )}
                    </ModalHeader>

                    <ModalCloseButton />

                    <ModalBody>
                        {selectedProject && (
                            <VStack align="start" spacing={5}>
                                <Box>
                                    <Text fontWeight="bold" mb={2}>
                                        {t("projects.description", "Description")}
                                    </Text>
                                    <Text color={modalSubText}>
                                        {selectedProject.description}
                                    </Text>
                                </Box>

                                {selectedProject.tags && selectedProject.tags.length > 0 && (
                                    <Box>
                                        <Text fontWeight="bold" mb={2}>
                                            {t("projects.skillsAndTech", "Skills and technologies")}
                                        </Text>
                                        <Wrap spacing={2}>
                                            {selectedProject.tags.map((tag, i) => (
                                                <WrapItem key={i}>
                                                    <Box
                                                        px={3}
                                                        py={1}
                                                        fontSize="sm"
                                                        borderRadius="md"
                                                        bg={tagBg}
                                                        color={tagColor}
                                                        border="1px solid"
                                                        borderColor={tagBorder}
                                                    >
                                                        {tag}
                                                    </Box>
                                                </WrapItem>
                                            ))}
                                        </Wrap>
                                    </Box>
                                )}
                            </VStack>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <HStack spacing={3}>
                            {selectedProject?.link && selectedProject.link !== "#" && (
                                <Button
                                    as="a"
                                    href={selectedProject.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    colorScheme="teal"
                                >
                                    {t("projects.openProject", "Open project")}
                                </Button>
                            )}
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </MotionBox>
    );
};

export default ProjectsSection;
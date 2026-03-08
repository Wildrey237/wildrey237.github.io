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
} from "@chakra-ui/react";
import * as LucideIcons from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import dataFr from "../data/data-fr.json";
import dataEn from "../data/data-en.json";

const MotionBox = motion(Box);
const MotionTag = motion(Box);

const ProjectCard = ({ project, index, onOpenProject, t }) => {
    const IconComponent = LucideIcons[project.icon] || LucideIcons["FileText"];
    const cardBg = useColorModeValue("gray.100", "gray.700");
    const cardColor = useColorModeValue("gray.800", "white");

    return (
        <MotionBox
            p={5}
            borderRadius="xl"
            bg={cardBg}
            color={cardColor}
            boxShadow="md"
            cursor="pointer"
            whileHover={{ scale: 1.03, boxShadow: "lg", y: -4 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            height="100%"
            onClick={() => onOpenProject(project)}
        >
            <VStack align="start" spacing={3} h="100%">
                <HStack spacing={2} align="start">
                    <Icon as={IconComponent} boxSize={5} color="teal.400" mt={1} />
                    <Text fontWeight="bold" fontSize="lg" noOfLines={2}>
                        {project.title}
                    </Text>
                </HStack>

                <Text fontSize="sm" color="gray.500">
                    {project.school}
                </Text>

                <Text fontSize="sm" noOfLines={4}>
                    {project.description}
                </Text>

                {project.tags && (
                    <Wrap pt={2} spacing={2}>
                        {project.tags.slice(0, 5).map((tag, i) => (
                            <WrapItem key={i}>
                                <MotionTag
                                    px={3}
                                    py={1}
                                    fontSize="xs"
                                    borderRadius="md"
                                    bg="teal.100"
                                    color="teal.800"
                                    whileHover={{ scale: 1.08 }}
                                >
                                    {tag}
                                </MotionTag>
                            </WrapItem>
                        ))}
                    </Wrap>
                )}

                <Text
                    mt="auto"
                    fontSize="sm"
                    fontWeight="semibold"
                    color="teal.400"
                >
                    {t("projects.viewMore")}
                </Text>
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

    const modalBg = useColorModeValue("white", "gray.800");
    const modalText = useColorModeValue("gray.800", "white");
    const modalSubText = useColorModeValue("gray.600", "gray.300");

    return (
        <Box id="projects" py={10} px={{ base: 4, md: 10 }}>
            <HStack spacing={4} mb={8} justify="center" flexWrap="wrap">
                <Select
                    placeholder={t("projects.filterBySchool")}
                    maxW="260px"
                    value={schoolFilter}
                    onChange={(e) => setSchoolFilter(e.target.value)}
                >
                    {schools.map((school, idx) => (
                        <option key={idx} value={school}>
                            {school}
                        </option>
                    ))}
                </Select>

                <Menu closeOnSelect={false}>
                    <MenuButton as={Button} maxW="260px">
                        {tagFilter.length > 0
                            ? `${t("projects.tagsSelected")} (${tagFilter.length})`
                            : t("projects.filterByTags")}
                    </MenuButton>
                    <MenuList maxH="300px" overflowY="auto" p={2}>
                        <CheckboxGroup value={tagFilter} onChange={setTagFilter}>
                            <VStack align="start" spacing={2}>
                                {tags.map((tag, idx) => (
                                    <Checkbox key={idx} value={tag}>
                                        {tag}
                                    </Checkbox>
                                ))}
                            </VStack>
                        </CheckboxGroup>
                    </MenuList>
                </Menu>
            </HStack>

            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
                {filteredProjects.map((project, index) => (
                    <ProjectCard
                        key={index}
                        project={project}
                        index={index}
                        onOpenProject={openProjectModal}
                        t={t}
                    />
                ))}
            </SimpleGrid>

            <Modal isOpen={isOpen} onClose={closeProjectModal} size="3xl" isCentered>
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent bg={modalBg} color={modalText} mx={4}>
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
                                                        bg="teal.100"
                                                        color="teal.800"
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
        </Box>
    );
};

export default ProjectsSection;
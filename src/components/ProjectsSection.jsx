import React, { useState, useEffect } from "react";
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
    useBreakpointValue,
    Input,
    InputGroup,
    InputLeftElement,
} from "@chakra-ui/react";
import * as LucideIcons from "lucide-react";
import { Plus, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import dataFr from "../data/data-fr.json";
import dataEn from "../data/data-en.json";

const MotionBox = motion(Box);
const MotionTag = motion(Box);

const ProjectCard = ({ project, index, onOpenProject, isDark }) => {
    const IconComponent = LucideIcons[project.icon] || LucideIcons["FileText"];

    const cardBg = useColorModeValue("white", "whiteAlpha.50");
    const cardBorder = useColorModeValue("gray.200", "whiteAlpha.200");
    const titleColor = useColorModeValue("gray.800", "white");
    const textColor = useColorModeValue("gray.600", "gray.300");
    const schoolColor = useColorModeValue("gray.400", "gray.400");
    const iconColor = useColorModeValue("teal.500", "teal.300");
    const tagBg = useColorModeValue("teal.50", "whiteAlpha.100");
    const tagColor = useColorModeValue("teal.700", "teal.200");
    const tagBorder = useColorModeValue("teal.200", "whiteAlpha.200");

    return (
        <Box
            p={6}
            borderWidth="1px"
            borderRadius="2xl"
            bg={cardBg}
            borderColor={cardBorder}
            boxShadow={isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.06)"}
            cursor="pointer"
            transition="all 0.2s ease"
            position="relative"
            overflow="hidden"
            _hover={{
                transform: "translateY(-4px)",
                boxShadow: isDark
                    ? "0 8px 32px rgba(0,0,0,0.4)"
                    : "0 8px 24px rgba(0,0,0,0.1)",
                borderColor: isDark ? "teal.500" : "teal.300",
                "& .shimmer": { left: "150%" },
            }}
            h="400px"
            onClick={() => onOpenProject(project)}
        >
            {/* Shimmer */}
            <Box
                className="shimmer"
                position="absolute"
                top="0"
                left="-100%"
                w="60%"
                h="100%"
                background={isDark
                    ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)"
                    : "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)"
                }
                transform="skewX(-20deg)"
                transition="left 0.55s ease"
                pointerEvents="none"
                zIndex={0}
            />
            <VStack align="start" spacing={3} h="100%" position="relative" zIndex={1}>
                <HStack spacing={3} align="start" w="100%">
                    <Box
                        p={2}
                        borderRadius="lg"
                        bg={useColorModeValue("teal.50", "whiteAlpha.100")}
                        flexShrink={0}
                    >
                        <Icon as={IconComponent} color={iconColor} boxSize={5} />
                    </Box>
                    <Text fontWeight="bold" fontSize="md" color={titleColor} noOfLines={2} lineHeight="1.3">
                        {project.title}
                    </Text>
                </HStack>

                <Text fontSize="xs" color={schoolColor} fontWeight="medium" letterSpacing="0.02em">
                    {project.school}
                </Text>

                <Text fontSize="sm" color={textColor} noOfLines={7} flex="1">
                    {project.description}
                </Text>

                {project.tags && project.tags.length > 0 && (
                    <Wrap spacing={1.5} pt={1} w="100%">
                        {project.tags.slice(0, 4).map((tag, i) => (
                            <WrapItem key={i}>
                                <MotionTag
                                    px={2}
                                    py={0.5}
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
                        {project.tags.length > 4 && (
                            <WrapItem>
                                <Box px={2} py={0.5} fontSize="xs" borderRadius="md" color={schoolColor}>
                                    +{project.tags.length - 4}
                                </Box>
                            </WrapItem>
                        )}
                    </Wrap>
                )}

                <HStack w="100%" pt={1}>
                    <Spacer />
                    <IconButton
                        aria-label="Open project"
                        icon={<Plus size={14} />}
                        size="xs"
                        borderRadius="full"
                        colorScheme="teal"
                        variant={isDark ? "ghost" : "solid"}
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenProject(project);
                        }}
                    />
                </HStack>
            </VStack>
        </Box>
    );
};

const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: "easeOut" } },
    exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0, transition: { duration: 0.25, ease: "easeIn" } }),
};

const ProjectsSection = () => {
    const { t, i18n } = useTranslation();
    const data = i18n.language === "fr" ? dataFr : dataEn;

    const [schoolFilter, setSchoolFilter] = useState("");
    const [tagFilter, setTagFilter] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProject, setSelectedProject] = useState(null);
    const [page, setPage] = useState(0);
    const [direction, setDirection] = useState(1);

    const { isOpen, onOpen, onClose } = useDisclosure();

    const cardsPerPage = useBreakpointValue({ base: 1, sm: 2, lg: 4 }) ?? 4;
    const [isHovered, setIsHovered] = useState(false);

    const allProjects = data.projects;
    const schools = [...new Set(allProjects.map((p) => p.school))];
    const tags = [...new Set(allProjects.flatMap((p) => p.tags || []))];

    const filteredProjects = allProjects.filter((p) => {
        const matchSchool = schoolFilter ? p.school === schoolFilter : true;
        const matchTags = tagFilter.length > 0 ? tagFilter.some((tag) => p.tags?.includes(tag)) : true;
        const q = searchQuery.toLowerCase().trim();
        const matchSearch = q
            ? p.title.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q) ||
              p.tags?.some((t) => t.toLowerCase().includes(q))
            : true;
        return matchSchool && matchTags && matchSearch;
    });

    const totalPages = Math.max(1, Math.ceil(filteredProjects.length / cardsPerPage));
    const clampedPage = Math.min(page, totalPages - 1);
    const visibleProjects = filteredProjects.slice(clampedPage * cardsPerPage, (clampedPage + 1) * cardsPerPage);

    useEffect(() => {
        setPage(0);
    }, [schoolFilter, tagFilter, searchQuery, cardsPerPage]);

    useEffect(() => {
        if (isHovered || totalPages <= 1) return;
        const timer = setInterval(() => {
            setDirection(1);
            setPage((p) => (p + 1) % totalPages);
        }, 3500);
        return () => clearInterval(timer);
    }, [isHovered, totalPages]);

    useEffect(() => {
        const onKey = (e) => {
            if (isOpen) return;
            if (e.key === "ArrowRight") paginate(1);
            if (e.key === "ArrowLeft") paginate(-1);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, totalPages]);

    const paginate = (dir) => {
        setDirection(dir);
        setPage((p) => (p + dir + totalPages) % totalPages);
    };

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

    const bgMain = useColorModeValue("white", "#080d1a");
    const titleColor = useColorModeValue("gray.800", "white");
    const accentColor = useColorModeValue("teal.500", "teal.400");
    const cardBg = useColorModeValue("white", "whiteAlpha.50");
    const cardBorder = useColorModeValue("gray.200", "whiteAlpha.200");
    const modalBg = useColorModeValue("white", "#122033");
    const modalText = useColorModeValue("gray.800", "white");
    const modalSubText = useColorModeValue("gray.600", "gray.300");
    const inputBg = useColorModeValue("white", "whiteAlpha.100");
    const tagBg = useColorModeValue("teal.50", "whiteAlpha.100");
    const tagColor = useColorModeValue("teal.700", "teal.200");
    const tagBorder = useColorModeValue("teal.200", "whiteAlpha.200");
    const dotActive = useColorModeValue("teal.500", "teal.400");
    const dotInactive = useColorModeValue("gray.300", "whiteAlpha.300");
    const navBtnBg = useColorModeValue("white", "whiteAlpha.100");
    const navBtnBorder = useColorModeValue("gray.200", "whiteAlpha.200");
    const counterColor = useColorModeValue("gray.500", "gray.400");

    return (
        <Box
            id="projects"
            px={{ base: 4, md: 8 }}
            py={20}
            bg={bgMain}
            position="relative"
            overflow="hidden"
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
                        bg="teal.500"
                        opacity={0.08}
                        filter="blur(120px)"
                        borderRadius="full"
                        pointerEvents="none"
                    />
                </>
            )}

            {/* Section title */}
            <VStack spacing={3} mb={10} position="relative" zIndex={1}>
                <Heading
                    textAlign="center"
                    fontSize={["2xl", "3xl", "4xl"]}
                    color={titleColor}
                    fontWeight="black"
                    letterSpacing="-0.03em"
                >
                    {t("projects.title")}
                </Heading>
                <Box w="48px" h="4px" bg={accentColor} borderRadius="full" />
                <Text color={counterColor} fontSize="sm">
                    {filteredProjects.length} {i18n.language === "fr" ? "projets" : "projects"}
                </Text>
            </VStack>

            {/* Filters */}
            <VStack spacing={3} mb={8} position="relative" zIndex={1}>
            <InputGroup maxW="480px" w="100%">
                <InputLeftElement pointerEvents="none">
                    <Search size={16} color="gray" />
                </InputLeftElement>
                <Input
                    placeholder={i18n.language === "fr" ? "Rechercher un projet, technologie..." : "Search projects, technologies..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    bg={inputBg}
                    borderRadius="full"
                    borderColor={cardBorder}
                    size="sm"
                    _hover={{ borderColor: "teal.300" }}
                    _focus={{ borderColor: "teal.400", boxShadow: "none" }}
                />
            </InputGroup>
            <HStack spacing={3} justify="center" flexWrap="wrap">
                <Select
                    placeholder={t("projects.filterBySchool")}
                    maxW="240px"
                    size="sm"
                    borderRadius="full"
                    value={schoolFilter}
                    onChange={(e) => setSchoolFilter(e.target.value)}
                    bg={inputBg}
                    borderColor={cardBorder}
                    _hover={{ borderColor: "teal.300" }}
                    _focus={{ borderColor: "teal.400", boxShadow: "none" }}
                >
                    {schools.map((school, idx) => (
                        <option key={idx} value={school}>{school}</option>
                    ))}
                </Select>

                <Menu closeOnSelect={false}>
                    <MenuButton
                        as={Button}
                        size="sm"
                        borderRadius="full"
                        bg={inputBg}
                        border="1px solid"
                        borderColor={cardBorder}
                        _hover={{ borderColor: "teal.300" }}
                        fontWeight="normal"
                    >
                        {tagFilter.length > 0
                            ? `${t("projects.tagsSelected")} (${tagFilter.length})`
                            : t("projects.filterByTags")}
                    </MenuButton>
                    <MenuList maxH="280px" overflowY="auto" p={2} bg={isDark ? "#122033" : "white"} borderColor={cardBorder}>
                        <CheckboxGroup value={tagFilter} onChange={setTagFilter}>
                            <VStack align="start" spacing={2}>
                                {tags.map((tag, idx) => (
                                    <Checkbox key={idx} value={tag} colorScheme="teal" fontSize="sm">{tag}</Checkbox>
                                ))}
                            </VStack>
                        </CheckboxGroup>
                    </MenuList>
                </Menu>

                {(schoolFilter || tagFilter.length > 0 || searchQuery) && (
                    <Button
                        size="sm"
                        borderRadius="full"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => { setSchoolFilter(""); setTagFilter([]); setSearchQuery(""); }}
                    >
                        {i18n.language === "fr" ? "Effacer" : "Clear"}
                    </Button>
                )}
            </HStack>
            </VStack>

            {/* Carousel */}
            <Box
                position="relative"
                zIndex={1}
                maxW="1200px"
                mx="auto"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Navigation arrows */}
                {totalPages > 1 && (
                    <>
                        <IconButton
                            aria-label="Previous"
                            icon={<ChevronLeft size={20} />}
                            position="absolute"
                            left={{ base: "-2px", md: "-52px" }}
                            top="50%"
                            transform="translateY(-50%)"
                            zIndex={2}
                            borderRadius="full"
                            bg={navBtnBg}
                            border="1px solid"
                            borderColor={navBtnBorder}
                            boxShadow="md"
                            onClick={() => paginate(-1)}
                            _hover={{ borderColor: "teal.400", color: "teal.400" }}
                            size="md"
                        />
                        <IconButton
                            aria-label="Next"
                            icon={<ChevronRight size={20} />}
                            position="absolute"
                            right={{ base: "-2px", md: "-52px" }}
                            top="50%"
                            transform="translateY(-50%)"
                            zIndex={2}
                            borderRadius="full"
                            bg={navBtnBg}
                            border="1px solid"
                            borderColor={navBtnBorder}
                            boxShadow="md"
                            onClick={() => paginate(1)}
                            _hover={{ borderColor: "teal.400", color: "teal.400" }}
                            size="md"
                        />
                    </>
                )}

                {/* Cards with slide animation */}
                <Box px={{ base: 6, md: 0 }} overflow="hidden">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={`${clampedPage}-${schoolFilter}-${tagFilter.join(",")}`}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                        >
                            <SimpleGrid
                                columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
                                spacing={5}
                                alignItems="stretch"
                            >
                                {visibleProjects.map((project, index) => (
                                    <ProjectCard
                                        key={`${project.title}-${index}`}
                                        project={project}
                                        index={index}
                                        onOpenProject={openProjectModal}
                                        isDark={isDark}
                                    />
                                ))}
                            </SimpleGrid>
                        </motion.div>
                    </AnimatePresence>
                </Box>

                {/* Dot indicators + page counter */}
                {totalPages > 1 && (
                    <VStack spacing={2} mt={8}>
                        <HStack spacing={2} justify="center">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <Box
                                    key={i}
                                    w={i === clampedPage ? "24px" : "8px"}
                                    h="8px"
                                    borderRadius="full"
                                    bg={i === clampedPage ? dotActive : dotInactive}
                                    cursor="pointer"
                                    transition="all 0.25s ease"
                                    onClick={() => {
                                        setDirection(i > clampedPage ? 1 : -1);
                                        setPage(i);
                                    }}
                                />
                            ))}
                        </HStack>
                        <Text fontSize="xs" color={counterColor}>
                            {clampedPage + 1} / {totalPages}
                        </Text>
                    </VStack>
                )}
            </Box>

            {/* Project detail modal */}
            <Modal isOpen={isOpen} onClose={closeProjectModal} size="3xl" isCentered>
                <ModalOverlay backdropFilter="blur(6px)" bg="blackAlpha.600" />
                <ModalContent bg={modalBg} color={modalText} mx={4} borderRadius="2xl" border="1px solid" borderColor={cardBorder}>
                    <ModalHeader>
                        {selectedProject && (
                            <HStack spacing={3} align="start">
                                <Box p={2} borderRadius="lg" bg={isDark ? "whiteAlpha.100" : "teal.50"}>
                                    <Icon as={selectedIcon} boxSize={6} color="teal.400" />
                                </Box>
                                <Box>
                                    <Text fontSize="xl" fontWeight="bold">{selectedProject.title}</Text>
                                    <Text fontSize="xs" color={modalSubText} mt={0.5} fontWeight="medium">
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
                                    <Text fontWeight="semibold" mb={2} fontSize="sm" color={modalSubText} textTransform="uppercase" letterSpacing="0.05em">
                                        {t("projects.description", "Description")}
                                    </Text>
                                    <Text color={modalText} lineHeight="1.7">
                                        {selectedProject.description}
                                    </Text>
                                </Box>
                                {selectedProject.tags && selectedProject.tags.length > 0 && (
                                    <Box>
                                        <Text fontWeight="semibold" mb={3} fontSize="sm" color={modalSubText} textTransform="uppercase" letterSpacing="0.05em">
                                            {t("projects.skillsAndTech", "Skills and technologies")}
                                        </Text>
                                        <Wrap spacing={2}>
                                            {selectedProject.tags.map((tag, i) => (
                                                <WrapItem key={i}>
                                                    <Box px={3} py={1} fontSize="sm" borderRadius="full" bg={tagBg} color={tagColor} border="1px solid" borderColor={tagBorder}>
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
                        {selectedProject?.link && selectedProject.link !== "#" && (
                            <Button as="a" href={selectedProject.link} target="_blank" rel="noopener noreferrer" colorScheme="teal" borderRadius="full">
                                {t("projects.openProject", "Open project")}
                            </Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default ProjectsSection;

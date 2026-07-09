import {useState, useEffect} from "react";
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
import {ArrowUpRight, ChevronLeft, ChevronRight, Search, ChevronDown} from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";
import {useTranslation} from "react-i18next";
import dataFr from "../data/data-fr.json";
import dataEn from "../data/data-en.json";
import SectionHeader from "./SectionHeader";

const MotionBox = motion(Box);
const ease = [0.22, 1, 0.36, 1];

const PALETTE = ["syntax.blue", "syntax.purple", "syntax.green", "syntax.amber", "syntax.pink", "syntax.cyan"];

// Stable color per project (hash of title) so a project keeps its hue across pages.
function colorFor(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return PALETTE[h % PALETTE.length];
}

const ProjectCard = ({project, onOpenProject, viewLabel}) => {
    const IconComponent = LucideIcons[project.icon] || LucideIcons.FileText;
    const color = colorFor(project.title);

    return (
        <Box
            as="article"
            p={6}
            border="1px solid"
            borderColor="line.subtle"
            borderTop="3px solid"
            borderTopColor={color}
            borderRadius="md"
            bg="surface"
            cursor="pointer"
            transition="all 0.22s ease"
            position="relative"
            _hover={{
                transform: "translateY(-4px)",
                borderColor: color,
                borderTopColor: color,
                boxShadow: "0 14px 34px rgba(0,0,0,0.28)",
            }}
            h="380px"
            onClick={() => onOpenProject(project)}
        >
            {project.badge && (
                <Text
                    position="absolute"
                    top={5}
                    right={6}
                    fontFamily="mono"
                    fontSize="10px"
                    fontWeight="600"
                    textTransform="uppercase"
                    letterSpacing="0.1em"
                    color={color}
                >
                    {project.badge}
                </Text>
            )}

            <VStack align="start" spacing={4} h="100%">
                <Box
                    p={2.5}
                    borderRadius="md"
                    bg="surface.raised"
                    border="1px solid"
                    borderColor="line.subtle"
                    flexShrink={0}
                >
                    <Icon as={IconComponent} color={color} boxSize={5} strokeWidth={1.75}/>
                </Box>

                <Box>
                    <Heading
                        as="h3"
                        fontFamily="heading"
                        fontWeight="600"
                        fontSize="lg"
                        letterSpacing="-0.01em"
                        color="fg.default"
                        lineHeight="1.25"
                        noOfLines={2}
                        pr={project.badge ? 12 : 0}
                    >
                        {project.title}
                    </Heading>
                    <Text fontFamily="mono" fontSize="11px" color="fg.faint" mt={1.5} letterSpacing="0.02em">
                        {project.school}
                    </Text>
                </Box>

                <Text fontSize="sm" color="fg.muted" noOfLines={5} lineHeight="1.6" flex="1">
                    {project.description}
                </Text>

                {project.tags?.length > 0 && (
                    <Wrap spacing={1.5} w="100%">
                        {project.tags.slice(0, 4).map((tag, i) => (
                            <WrapItem key={i}>
                                <Box
                                    px={2}
                                    py={0.5}
                                    fontFamily="mono"
                                    fontSize="10px"
                                    borderRadius="sm"
                                    border="1px solid"
                                    borderColor="line.subtle"
                                    color="fg.muted"
                                >
                                    {tag}
                                </Box>
                            </WrapItem>
                        ))}
                        {project.tags.length > 4 && (
                            <WrapItem>
                                <Box px={1} py={0.5} fontFamily="mono" fontSize="10px" color="fg.faint">
                                    +{project.tags.length - 4}
                                </Box>
                            </WrapItem>
                        )}
                    </Wrap>
                )}

                <HStack w="100%" pt={1}>
                    <Spacer/>
                    <HStack spacing={1.5} color={color} fontFamily="mono" fontSize="xs" fontWeight="500">
                        <Text>{viewLabel}</Text>
                        <Icon as={ArrowUpRight} boxSize={4}/>
                    </HStack>
                </HStack>
            </VStack>
        </Box>
    );
};

const slideVariants = {
    enter: (dir) => ({x: dir > 0 ? 60 : -60, opacity: 0}),
    center: {x: 0, opacity: 1, transition: {duration: 0.4, ease}},
    exit: (dir) => ({x: dir > 0 ? -60 : 60, opacity: 0, transition: {duration: 0.28, ease: "easeIn"}}),
};

const ProjectsSection = () => {
    const {t, i18n} = useTranslation();
    const data = i18n.language === "fr" ? dataFr : dataEn;
    const isFr = i18n.language === "fr";

    const [schoolFilter, setSchoolFilter] = useState("");
    const [tagFilter, setTagFilter] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProject, setSelectedProject] = useState(null);
    const [page, setPage] = useState(0);
    const [direction, setDirection] = useState(1);
    const [isHovered, setIsHovered] = useState(false);

    const {isOpen, onOpen, onClose} = useDisclosure();
    const cardsPerPage = useBreakpointValue({base: 1, sm: 2, lg: 3}) ?? 3;

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
              p.tags?.some((tg) => tg.toLowerCase().includes(q))
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
        if (isHovered || totalPages <= 1 || isOpen) return;
        const timer = setInterval(() => {
            setDirection(1);
            setPage((p) => (p + 1) % totalPages);
        }, 4000);
        return () => clearInterval(timer);
    }, [isHovered, totalPages, isOpen]);

    const paginate = (dir) => {
        setDirection(dir);
        setPage((p) => (p + dir + totalPages) % totalPages);
    };

    useEffect(() => {
        const onKey = (e) => {
            if (isOpen) return;
            if (e.key === "ArrowRight") paginate(1);
            if (e.key === "ArrowLeft") paginate(-1);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, totalPages]);

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
    const selectedColor = selectedProject ? colorFor(selectedProject.title) : "accent";

    const hasFilters = schoolFilter || tagFilter.length > 0 || searchQuery;

    return (
        <Box id="projects" as="section" px={{base: 6, md: 10, lg: 16}} py={{base: 20, md: 28}} bg="canvas">
            <SectionHeader
                index="04"
                label={`${t("projectsNav")} · ${filteredProjects.length}`}
                title={isFr ? "Ce que j'ai construit" : "Things I have built"}
                accent="syntax.amber"
            />

            {/* Filters */}
            <VStack spacing={3} mb={10} maxW="1200px" mx="auto">
                <InputGroup maxW="480px" w="100%">
                    <InputLeftElement pointerEvents="none">
                        <Search size={15} color="currentColor" style={{opacity: 0.5}}/>
                    </InputLeftElement>
                    <Input
                        placeholder={t("projects.searchPlaceholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        bg="surface"
                        borderColor="line.subtle"
                        borderRadius="sm"
                        fontFamily="mono"
                        fontSize="sm"
                        size="md"
                        _hover={{borderColor: "line.strong"}}
                        _focusVisible={{borderColor: "accent", boxShadow: "none"}}
                    />
                </InputGroup>

                <HStack spacing={3} justify="center" flexWrap="wrap">
                    <Select
                        placeholder={t("projects.filterBySchool")}
                        maxW="220px"
                        size="sm"
                        borderRadius="sm"
                        fontFamily="mono"
                        fontSize="xs"
                        value={schoolFilter}
                        onChange={(e) => setSchoolFilter(e.target.value)}
                        bg="surface"
                        borderColor="line.subtle"
                        _hover={{borderColor: "line.strong"}}
                        _focusVisible={{borderColor: "accent", boxShadow: "none"}}
                    >
                        {schools.map((school, idx) => (
                            <option key={idx} value={school}>{school}</option>
                        ))}
                    </Select>

                    <Menu closeOnSelect={false}>
                        <MenuButton
                            as={Button}
                            size="sm"
                            borderRadius="sm"
                            bg="surface"
                            border="1px solid"
                            borderColor="line.subtle"
                            fontFamily="mono"
                            fontSize="xs"
                            fontWeight="400"
                            color="fg.muted"
                            rightIcon={<ChevronDown size={14}/>}
                            _hover={{borderColor: "line.strong", bg: "surface"}}
                            _active={{bg: "surface"}}
                        >
                            {tagFilter.length > 0
                                ? `${t("projects.tagsSelected")} (${tagFilter.length})`
                                : t("projects.filterByTags")}
                        </MenuButton>
                        <MenuList maxH="280px" overflowY="auto" p={2} bg="surface.raised" borderColor="line.subtle">
                            <CheckboxGroup value={tagFilter} onChange={setTagFilter}>
                                <VStack align="start" spacing={2}>
                                    {tags.map((tag, idx) => (
                                        <Checkbox key={idx} value={tag} colorScheme="brand" fontFamily="mono" fontSize="sm">
                                            {tag}
                                        </Checkbox>
                                    ))}
                                </VStack>
                            </CheckboxGroup>
                        </MenuList>
                    </Menu>

                    {hasFilters && (
                        <Button
                            size="sm"
                            borderRadius="sm"
                            variant="unstyled"
                            height="auto"
                            px={2}
                            fontFamily="mono"
                            fontSize="xs"
                            color="fg.faint"
                            _hover={{color: "accent"}}
                            onClick={() => {setSchoolFilter(""); setTagFilter([]); setSearchQuery("");}}
                        >
                            {t("projects.clearFilters")} ✕
                        </Button>
                    )}
                </HStack>
            </VStack>

            {/* Carousel */}
            <Box
                position="relative"
                maxW="1200px"
                mx="auto"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {totalPages > 1 && (
                    <>
                        <IconButton
                            aria-label={t("projects.previous")}
                            icon={<ChevronLeft size={18}/>}
                            position="absolute"
                            left={{base: "-2px", md: "-56px"}}
                            top="50%"
                            transform="translateY(-50%)"
                            zIndex={2}
                            borderRadius="sm"
                            bg="surface"
                            border="1px solid"
                            borderColor="line.subtle"
                            color="fg.muted"
                            onClick={() => paginate(-1)}
                            _hover={{borderColor: "accent.line", color: "accent"}}
                            size="md"
                        />
                        <IconButton
                            aria-label={t("projects.next")}
                            icon={<ChevronRight size={18}/>}
                            position="absolute"
                            right={{base: "-2px", md: "-56px"}}
                            top="50%"
                            transform="translateY(-50%)"
                            zIndex={2}
                            borderRadius="sm"
                            bg="surface"
                            border="1px solid"
                            borderColor="line.subtle"
                            color="fg.muted"
                            onClick={() => paginate(1)}
                            _hover={{borderColor: "accent.line", color: "accent"}}
                            size="md"
                        />
                    </>
                )}

                <Box px={{base: 6, md: 0}} overflow="hidden">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={`${clampedPage}-${schoolFilter}-${tagFilter.join(",")}-${searchQuery}`}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                        >
                            <SimpleGrid columns={{base: 1, sm: 2, md: 2, lg: 3}} spacing={5} alignItems="stretch">
                                {visibleProjects.map((project, index) => (
                                    <ProjectCard
                                        key={`${project.title}-${index}`}
                                        project={project}
                                        onOpenProject={openProjectModal}
                                        viewLabel={t("projects.viewMore")}
                                    />
                                ))}
                            </SimpleGrid>
                        </motion.div>
                    </AnimatePresence>
                </Box>

                {totalPages > 1 && (
                    <VStack spacing={3} mt={9} display={{base: "none", sm: "flex"}}>
                        <HStack spacing={2} justify="center">
                            {Array.from({length: totalPages}).map((_, i) => (
                                <Box
                                    key={i}
                                    w={i === clampedPage ? "22px" : "7px"}
                                    h="7px"
                                    borderRadius="full"
                                    bg={i === clampedPage ? "accent" : "line.strong"}
                                    cursor="pointer"
                                    transition="all 0.25s ease"
                                    onClick={() => {
                                        setDirection(i > clampedPage ? 1 : -1);
                                        setPage(i);
                                    }}
                                />
                            ))}
                        </HStack>
                        <Text fontFamily="mono" fontSize="xs" color="fg.faint" className="tabular">
                            {String(clampedPage + 1).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
                        </Text>
                    </VStack>
                )}
            </Box>

            {/* Detail modal */}
            <Modal isOpen={isOpen} onClose={closeProjectModal} size="2xl" isCentered>
                <ModalOverlay backdropFilter="blur(6px)" bg="blackAlpha.500"/>
                <ModalContent bg="surface.raised" color="fg.default" mx={4} borderRadius="md" border="1px solid" borderColor="line.subtle">
                    <ModalHeader>
                        {selectedProject && (
                            <HStack spacing={3} align="start">
                                <Box p={2.5} borderRadius="md" bg="surface" border="1px solid" borderColor="line.subtle">
                                    <Icon as={selectedIcon} boxSize={5} color={selectedColor} strokeWidth={1.75}/>
                                </Box>
                                <Box>
                                    <Heading fontFamily="heading" fontWeight="600" fontSize="xl" letterSpacing="-0.015em">
                                        {selectedProject.title}
                                    </Heading>
                                    <Text fontFamily="mono" fontSize="xs" color="fg.faint" mt={1}>
                                        {selectedProject.school}
                                    </Text>
                                </Box>
                            </HStack>
                        )}
                    </ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        {selectedProject && (
                            <VStack align="start" spacing={6}>
                                <Box>
                                    <Text fontFamily="mono" fontSize="11px" color="fg.faint" textTransform="uppercase" letterSpacing="0.14em" mb={2}>
                                        {isFr ? "Description" : "Description"}
                                    </Text>
                                    <Text color="fg.muted" lineHeight="1.75">
                                        {selectedProject.description}
                                    </Text>
                                </Box>
                                {selectedProject.tags?.length > 0 && (
                                    <Box w="100%">
                                        <Text fontFamily="mono" fontSize="11px" color="fg.faint" textTransform="uppercase" letterSpacing="0.14em" mb={3}>
                                            {isFr ? "Compétences & technologies" : "Skills & technologies"}
                                        </Text>
                                        <Wrap spacing={2}>
                                            {selectedProject.tags.map((tag, i) => (
                                                <WrapItem key={i}>
                                                    <Box px={3} py={1} fontFamily="mono" fontSize="xs" borderRadius="sm" border="1px solid" borderColor="line.subtle" color="fg.muted">
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
                            <Button
                                as="a"
                                href={selectedProject.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                colorScheme="brand"
                                borderRadius="sm"
                                fontSize="sm"
                                rightIcon={<ArrowUpRight size={16}/>}
                            >
                                {isFr ? "Ouvrir le projet" : "Open project"}
                            </Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default ProjectsSection;

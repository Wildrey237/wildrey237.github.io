import React, {useState, useEffect, useRef} from "react";
import {
    Box, Text, VStack, HStack, Icon, Wrap, WrapItem, Select,
    Button, Menu, MenuButton, MenuList, Checkbox, CheckboxGroup,
    useColorModeValue, Spinner
} from "@chakra-ui/react";
import * as LucideIcons from "lucide-react";
import {motion} from "framer-motion";
import {useTranslation} from "react-i18next";
import {ChevronLeft, ChevronRight} from "lucide-react";

import dataFr from "../data/data-fr.json";
import dataEn from "../data/data-en.json";

const MotionBox = motion(Box);
const MotionTag = motion(Box);

const ProjectCard = ({project}) => {
    const IconComponent = LucideIcons[project.icon] || LucideIcons["FileText"];
    const cardBg = useColorModeValue("gray.100", "gray.700");
    const cardColor = useColorModeValue("gray.800", "white");

    return (
        <MotionBox
            minW="300px"
            maxW="300px"
            minH="250px"
            maxH="auto"
            p={5}
            mx={2}
            bg={cardBg}
            color={cardColor}
            borderRadius="xl"
            boxShadow="md"
            whileHover={{scale: 1.03, boxShadow: "lg"}}
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.4}}
        >
            <VStack align="start" spacing={3} h="100%">
                <HStack spacing={2}>
                    <Icon as={IconComponent} boxSize={5} color="teal.400"/>
                    <Text fontWeight="bold" fontSize="md">{project.title}</Text>
                </HStack>
                <Text fontSize="sm" color="gray.500">{project.school}</Text>
                <Text fontSize="sm" noOfLines={4}>{project.description}</Text>
                {project.tags && (
                    <Wrap pt={2} spacing={2}>
                        {project.tags.map((tag, i) => (
                            <WrapItem key={i}>
                                <MotionTag
                                    px={3} py={1} fontSize="xs"
                                    borderRadius="md"
                                    bg="teal.100" color="teal.800"
                                    whileHover={{scale: 1.1}}
                                >
                                    {tag}
                                </MotionTag>
                            </WrapItem>
                        ))}
                    </Wrap>
                )}
            </VStack>
        </MotionBox>
    );
};

const ProjectsSection = () => {
    const {t, i18n} = useTranslation();
    const [schoolFilter, setSchoolFilter] = useState("");
    const [tagFilter, setTagFilter] = useState([]);

    const scrollContainerRef1 = useRef(null);
    const scrollContainerRef2 = useRef(null);
    const scrollIntervalRef = useRef(null);

    const scroll = (ref, direction) => {
        if (ref.current) {
            ref.current.scrollBy({
                left: direction === "left" ? -300 : 300,
                behavior: "smooth",
            });
        }
    };

    const startAutoScroll = () => {
        stopAutoScroll();
        scrollIntervalRef.current = setInterval(() => {
            scroll(scrollContainerRef1, "right");
            scroll(scrollContainerRef2, "right");
        }, 5000);
    };

    const stopAutoScroll = () => {
        if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };

    useEffect(() => {
        startAutoScroll();
        return stopAutoScroll;
    }, []);

    // Choisir le bon fichier JSON en fonction de la langue
    const data = i18n.language === "fr" ? dataFr : dataEn;

    if (!data) {
        return <Spinner size="xl" thickness="4px" speed="0.65s" color="teal.400"/>;
    }

    const allProjects = data.projects;
    const schools = [...new Set(allProjects.map((p) => p.school))];
    const tags = [...new Set(allProjects.flatMap((p) => p.tags || []))];

    const filteredProjects = allProjects.filter((p) => {
        const matchSchool = schoolFilter ? p.school === schoolFilter : true;
        const matchTags = tagFilter.length > 0 ? tagFilter.some((tag) => p.tags?.includes(tag)) : true;
        return matchSchool && matchTags;
    });

    const midIndex = Math.ceil(filteredProjects.length / 2);
    const firstLineProjects = filteredProjects.slice(0, midIndex);
    const secondLineProjects = filteredProjects.slice(midIndex);

    return (
        <Box id="projects" py={10} px={{base: 4, md: 10}}>
            {/* Filtres */}
            <HStack spacing={4} mb={6} justify="center" flexWrap="wrap">
                <Select
                    placeholder={t("projects.filterBySchool")}
                    maxW="250px"
                    value={schoolFilter}
                    onChange={(e) => setSchoolFilter(e.target.value)}
                >
                    {schools.map((school, idx) => (
                        <option key={idx} value={school}>{school}</option>
                    ))}
                </Select>

                <Menu closeOnSelect={false}>
                    <MenuButton as={Button} maxW="250px">
                        {tagFilter.length > 0
                            ? `${t("projects.tagsSelected")} (${tagFilter.length})`
                            : t("projects.filterByTags")}
                    </MenuButton>
                    <MenuList maxH="300px" overflowY="auto" p={2}>
                        <CheckboxGroup value={tagFilter} onChange={setTagFilter}>
                            <VStack align="start" spacing={2}>
                                {tags.map((tag, idx) => (
                                    <Checkbox key={idx} value={tag}>{tag}</Checkbox>
                                ))}
                            </VStack>
                        </CheckboxGroup>
                    </MenuList>
                </Menu>
            </HStack>

            {/* Contrôles */}
            <HStack justify="center" mb={4} spacing={6}>
                <Button onClick={() => {
                    scroll(scrollContainerRef1, "left");
                    scroll(scrollContainerRef2, "left");
                }} leftIcon={<ChevronLeft/>} variant="ghost">
                    {t("projects.previous")}
                </Button>
                <Button onClick={() => {
                    scroll(scrollContainerRef1, "right");
                    scroll(scrollContainerRef2, "right");
                }} rightIcon={<ChevronRight/>} variant="ghost">
                    {t("projects.next")}
                </Button>
            </HStack>

            {/* Carrousels */}
            {[firstLineProjects, secondLineProjects].map((lineProjects, i) => (
                <Box
                    key={i}
                    overflowX="auto"
                    ref={i === 0 ? scrollContainerRef1 : scrollContainerRef2}
                    onMouseEnter={stopAutoScroll}
                    onMouseLeave={startAutoScroll}
                    css={{scrollbarWidth: "none"}}
                    mb={6}
                >
                    <HStack spacing={4} minW="full" pb={4}>
                        {lineProjects.map((project, index) => (
                            <ProjectCard key={index} project={project}/>
                        ))}
                    </HStack>
                </Box>
            ))}
        </Box>
    );
};

export default ProjectsSection;
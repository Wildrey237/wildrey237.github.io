import React, {useState, useEffect} from "react";
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
    Spinner,
    SimpleGrid,
} from "@chakra-ui/react";
import * as LucideIcons from "lucide-react";
import {motion} from "framer-motion";
import {useTranslation} from "react-i18next";

const MotionBox = motion(Box);
const MotionTag = motion(Box);

const ProjectCard = ({project, index}) => {
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
            whileHover={{scale: 1.03, boxShadow: "lg"}}
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.4, delay: index * 0.05}}
        >
            <VStack align="start" spacing={3} h="100%">
                <HStack spacing={2}>
                    <Icon as={IconComponent} boxSize={5} color="teal.400"/>
                    <Text fontWeight="bold">{project.title}</Text>
                </HStack>
                <Text fontSize="sm" color="gray.500">{project.school}</Text>
                <Text fontSize="sm" noOfLines={4}>{project.description}</Text>
                {project.tags && (
                    <Wrap pt={2} spacing={2}>
                        {project.tags.map((tag, i) => (
                            <WrapItem key={i}>
                                <MotionTag
                                    px={3}
                                    py={1}
                                    fontSize="xs"
                                    borderRadius="md"
                                    bg="teal.100"
                                    color="teal.800"
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
    const [data, setData] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            const json = await import(`../data/data-${i18n.language}.json`);
            setData(json.default);
        };
        loadData();
    }, [i18n.language]);

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

    return (
        <Box id="projects" py={10} px={{base: 4, md: 10}}>
            <HStack spacing={4} mb={6} justify="center" flexWrap="wrap">
                <Select
                    placeholder={t("projects.filterBySchool", "Filtrer par école")}
                    maxW="250px"
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
                    <MenuButton as={Button} maxW="250px">
                        {tagFilter.length > 0
                            ? `${t("projects.tagsSelected", "Compétences sélectionnées")} (${tagFilter.length})`
                            : t("projects.filterByTags", "Filtrer par compétences")}
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

            <SimpleGrid columns={{base: 1, sm: 2, md: 3}} spacing={6}>
                {filteredProjects.map((project, index) => (
                    <ProjectCard key={index} project={project} index={index}/>
                ))}
            </SimpleGrid>
        </Box>
    );
};

export default ProjectsSection;
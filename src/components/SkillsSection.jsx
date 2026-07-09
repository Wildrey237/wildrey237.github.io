import {
    Box,
    Grid,
    GridItem,
    Heading,
    Text,
    Tooltip,
    HStack,
    Wrap,
    WrapItem,
    Icon,
} from "@chakra-ui/react";
import {useTranslation} from "react-i18next";
import {motion} from "framer-motion";
import frData from "../data/data-fr.json";
import enData from "../data/data-en.json";
import SectionHeader from "./SectionHeader";
import {
    FaBrain,
    FaDatabase,
    FaCode,
    FaCloud,
    FaServer,
    FaSquareRootAlt,
} from "react-icons/fa";

const MotionBox = motion(Box);
const ease = [0.22, 1, 0.36, 1];

const CATEGORY_ICONS = {
    ai: FaBrain,
    data_engineering: FaServer,
    software_engineering: FaCode,
    cloud_mlop: FaCloud,
    databases: FaDatabase,
    math_foundations: FaSquareRootAlt,
};

// One curated color per category — joyful, but assigned by role.
const CATEGORY_COLORS = {
    ai: "syntax.purple",
    data_engineering: "syntax.amber",
    software_engineering: "syntax.blue",
    cloud_mlop: "syntax.cyan",
    databases: "syntax.green",
    math_foundations: "syntax.pink",
};

function SkillChip({skill, color}) {
    return (
        <Tooltip
            label={skill.desc}
            placement="top"
            hasArrow
            borderRadius="md"
            bg="fg.default"
            color="canvas"
            px={3}
            py={2}
            fontSize="xs"
            fontFamily="body"
            maxW="240px"
        >
            <Box
                px={3}
                py={1.5}
                fontFamily="mono"
                fontSize="xs"
                fontWeight="400"
                letterSpacing="0.01em"
                borderRadius="md"
                bg="surface"
                color="fg.muted"
                border="1px solid"
                borderColor="line.subtle"
                cursor="default"
                transition="all 0.18s ease"
                _hover={{
                    color: color,
                    borderColor: color,
                    transform: "translateY(-2px)",
                }}
            >
                {skill.name}
            </Box>
        </Tooltip>
    );
}

function CategoryRow({index, title, items, icon, color, idx}) {
    return (
        <MotionBox
            initial={{opacity: 0, y: 20}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.3}}
            transition={{duration: 0.6, delay: idx * 0.06, ease}}
            borderTop="1px solid"
            borderColor="line.subtle"
            py={{base: 6, md: 8}}
        >
            <Grid templateColumns={{base: "1fr", md: "280px 1fr"}} gap={{base: 4, md: 10}}>
                <GridItem>
                    <HStack spacing={3} align="center">
                        <Text
                            fontFamily="mono"
                            fontSize="xs"
                            fontWeight="600"
                            color={color}
                            className="tabular"
                        >
                            {index}
                        </Text>
                        <Box
                            p={1.5}
                            borderRadius="md"
                            bg="surface"
                            border="1px solid"
                            borderColor="line.subtle"
                            display="inline-flex"
                        >
                            <Icon as={icon} color={color} boxSize={3.5}/>
                        </Box>
                        <Heading
                            as="h3"
                            fontFamily="heading"
                            fontWeight="600"
                            fontSize={{base: "lg", md: "xl"}}
                            letterSpacing="-0.02em"
                            color="fg.default"
                            lineHeight="1.15"
                        >
                            {title}
                        </Heading>
                    </HStack>
                </GridItem>

                <GridItem>
                    <Wrap spacing={2}>
                        {items.map((skill, i) => (
                            <WrapItem key={i}>
                                <SkillChip skill={skill} color={color}/>
                            </WrapItem>
                        ))}
                    </Wrap>
                </GridItem>
            </Grid>
        </MotionBox>
    );
}

export default function SkillsSection() {
    const {t, i18n} = useTranslation();
    const data = i18n.language === "fr" ? frData : enData;
    const isFr = i18n.language === "fr";

    const categoryLabels = {
        ai: t("skillsCategories.ai"),
        data_engineering: "Data Engineering",
        software_engineering: "Software Engineering",
        cloud_mlop: "Cloud & MLOps",
        databases: t("skillsCategories.databases"),
        math_foundations: t("skillsCategories.mathFoundations"),
    };

    const categories = Object.keys(data.skills);

    return (
        <Box id="skills" as="section" px={{base: 6, md: 10, lg: 16}} py={{base: 20, md: 28}} bg="canvas.alt">
            <SectionHeader
                index="01"
                label={t("skills")}
                title={isFr ? "Ce avec quoi je construis" : "What I build with"}
                accent="syntax.blue"
            />

            <Box maxW="1200px" mx="auto" borderBottom="1px solid" borderColor="line.subtle">
                {categories.map((categoryKey, idx) => (
                    <CategoryRow
                        key={categoryKey}
                        index={`0${idx + 1}`}
                        title={categoryLabels[categoryKey] || categoryKey}
                        items={data.skills[categoryKey]}
                        icon={CATEGORY_ICONS[categoryKey] || FaCode}
                        color={CATEGORY_COLORS[categoryKey] || "accent"}
                        idx={idx}
                    />
                ))}
            </Box>
        </Box>
    );
}

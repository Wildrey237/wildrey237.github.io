import {
    Box,
    VStack,
    HStack,
    Text,
    Link,
    Image,
    Button,
    Heading,
    Collapse,
    useColorModeValue,
    useDisclosure,
} from "@chakra-ui/react";
import {ExternalLinkIcon, ChevronDownIcon, ChevronUpIcon} from "@chakra-ui/icons";
import {useTranslation} from "react-i18next";
import {motion} from "framer-motion";
import frData from "../data/data-fr.json";
import enData from "../data/data-en.json";
import SectionHeader from "./SectionHeader";

const MotionBox = motion(Box);
const ease = [0.22, 1, 0.36, 1];

const PALETTE = ["syntax.green", "syntax.blue", "syntax.purple", "syntax.amber", "syntax.pink"];

const SCHOOL_LOGOS = {
    epita: "https://www.epita.fr/wp-content/themes/epita-refonte-theme/assets/images/logo-epita-sans-baseline.png",
    ece: "https://www.ece.fr/wp-content/uploads/2024/01/logo-ece.svg",
    epsi: "https://www.epsi.fr/images/logo-navbar.svg",
    usj: "https://institutsaintjean.org/wp-content/uploads/2022/12/Logo-Institut-USJ-INGENIEUR-transparent-768x301.png",
};

function getSchoolLogo(schoolName) {
    const s = schoolName.toLowerCase();
    if (s.includes("epita")) return SCHOOL_LOGOS.epita;
    if (s.includes("ece")) return SCHOOL_LOGOS.ece;
    if (s.includes("epsi")) return SCHOOL_LOGOS.epsi;
    if (s.includes("saint jean") || s.includes("yaounde") || s.includes("yaoundé")) return SCHOOL_LOGOS.usj;
    return null;
}

function getCampus(schoolName) {
    const s = schoolName.toLowerCase();
    if (s.includes("lyon")) return "Lyon";
    if (s.includes("paris") || s.includes("kremlin")) return "Paris";
    if (s.includes("rennes")) return "Rennes";
    if (s.includes("yaounde") || s.includes("yaoundé")) return "Yaoundé";
    return null;
}

function EducationCard({edu, idx, lang, color}) {
    const {isOpen, onToggle} = useDisclosure();
    const logoBg = useColorModeValue("gray.50", "white");
    const logo = getSchoolLogo(edu.school);
    const campus = getCampus(edu.school);
    const current = edu.current === true;

    return (
        <MotionBox
            initial={{opacity: 0, y: 20}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.25}}
            transition={{duration: 0.55, delay: idx * 0.06, ease}}
            bg="surface"
            border="1px solid"
            borderColor="line.subtle"
            borderLeft="3px solid"
            borderLeftColor={color}
            borderRadius="md"
            overflow="hidden"
            _hover={{borderColor: color, borderLeftColor: color, transform: "translateY(-2px)"}}
            sx={{transition: "border-color 0.2s ease, transform 0.2s ease"}}
        >
            <HStack p={{base: 5, md: 6}} spacing={5} align="flex-start">
                <Box
                    flexShrink={0}
                    w={{base: "56px", md: "68px"}}
                    h={{base: "56px", md: "68px"}}
                    borderRadius="sm"
                    bg={logoBg}
                    border="1px solid"
                    borderColor="line.subtle"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    p={2}
                    overflow="hidden"
                >
                    {logo ? (
                        <Image
                            src={logo}
                            alt={edu.school}
                            objectFit="contain"
                            w="100%"
                            h="100%"
                            onError={(e) => {(e.target.style.display = "none");}}
                        />
                    ) : (
                        <Text fontFamily="heading" fontWeight="700" fontSize="2xl" color={color}>
                            {edu.school[0]}
                        </Text>
                    )}
                </Box>

                <Box flex="1" minW={0}>
                    <HStack spacing={3} mb={2} flexWrap="wrap">
                        {current && (
                            <HStack spacing={1.5}>
                                <Box position="relative" w="6px" h="6px">
                                    <Box
                                        position="absolute"
                                        inset="0"
                                        borderRadius="full"
                                        bg="green.400"
                                        sx={{
                                            "@keyframes ping": {
                                                "0%": {transform: "scale(1)", opacity: 0.7},
                                                "100%": {transform: "scale(2.6)", opacity: 0},
                                            },
                                            animation: "ping 1.8s ease-out infinite",
                                        }}
                                    />
                                    <Box position="absolute" inset="0" borderRadius="full" bg="green.500"/>
                                </Box>
                                <Text
                                    fontFamily="mono"
                                    fontSize="10px"
                                    fontWeight="500"
                                    textTransform="uppercase"
                                    letterSpacing="0.14em"
                                    color="fg.muted"
                                >
                                    {lang === "fr" ? "En cours" : "In progress"}
                                </Text>
                            </HStack>
                        )}
                        {campus && (
                            <Text
                                fontFamily="mono"
                                fontSize="10px"
                                fontWeight="500"
                                textTransform="uppercase"
                                letterSpacing="0.14em"
                                color="fg.faint"
                            >
                                {campus}
                            </Text>
                        )}
                    </HStack>

                    <Heading
                        as="h3"
                        fontFamily="heading"
                        fontWeight="600"
                        fontSize={{base: "md", md: "lg"}}
                        letterSpacing="-0.01em"
                        color="fg.default"
                        lineHeight="1.25"
                        noOfLines={2}
                    >
                        {edu.degree}
                    </Heading>

                    <HStack mt={1.5} spacing={2} flexWrap="wrap">
                        <Text fontFamily="mono" fontSize="sm" fontWeight="500" color={color}>
                            {edu.school.replace(/ (FR|CMR)$/, "")}
                        </Text>
                        {edu.website && (
                            <Link href={edu.website} isExternal color="fg.faint" _hover={{color: color}}>
                                <ExternalLinkIcon boxSize={3} mb="2px"/>
                            </Link>
                        )}
                    </HStack>

                    <Text fontFamily="mono" fontSize="xs" color="fg.faint" mt={1} className="tabular">
                        {edu.years}
                    </Text>
                </Box>
            </HStack>

            {edu.details && (
                <>
                    <Box px={{base: 5, md: 6}} pb={3}>
                        <Button
                            size="xs"
                            variant="unstyled"
                            height="auto"
                            display="inline-flex"
                            alignItems="center"
                            gap={1.5}
                            fontFamily="mono"
                            fontSize="xs"
                            fontWeight="500"
                            color={color}
                            _hover={{opacity: 0.7}}
                            rightIcon={isOpen ? <ChevronUpIcon/> : <ChevronDownIcon/>}
                            onClick={onToggle}
                        >
                            {isOpen
                                ? (lang === "fr" ? "Réduire" : "Show less")
                                : (lang === "fr" ? "Voir les détails" : "See details")}
                        </Button>
                    </Box>
                    <Collapse in={isOpen} animateOpacity>
                        <Box px={{base: 5, md: 6}} pb={6} bg="canvas.alt" borderTop="1px solid" borderColor="line.subtle">
                            <Text fontSize="sm" color="fg.muted" lineHeight="1.7" pt={4}>
                                {edu.details}
                            </Text>
                        </Box>
                    </Collapse>
                </>
            )}
        </MotionBox>
    );
}

export default function EducationSection() {
    const {t, i18n} = useTranslation();
    const data = i18n.language === "fr" ? frData : enData;
    const isFr = i18n.language === "fr";

    return (
        <Box id="education" as="section" px={{base: 6, md: 10, lg: 16}} py={{base: 20, md: 28}} bg="canvas.alt">
            <SectionHeader
                index="03"
                label={t("education")}
                title={isFr ? "Mon parcours académique" : "My academic path"}
                accent="syntax.green"
            />

            <Box maxW="900px" mx="auto">
                <VStack spacing={5} align="stretch">
                    {data.education?.map((edu, idx) => (
                        <EducationCard
                            key={idx}
                            edu={edu}
                            idx={idx}
                            lang={i18n.language}
                            color={PALETTE[idx % PALETTE.length]}
                        />
                    ))}
                </VStack>
            </Box>
        </Box>
    );
}

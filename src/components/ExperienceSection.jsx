import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Image,
    Wrap,
    WrapItem,
    Link,
    Button,
    Collapse,
    useColorMode,
} from "@chakra-ui/react";
import {ExternalLinkIcon, AddIcon, MinusIcon} from "@chakra-ui/icons";
import {useState} from "react";
import {motion} from "framer-motion";
import frData from "../data/data-fr.json";
import enData from "../data/data-en.json";
import {useTranslation} from "react-i18next";
import {MdLocationOn} from "react-icons/md";
import SectionHeader from "./SectionHeader";

const MotionBox = motion(Box);
const ease = [0.22, 1, 0.36, 1];

function renderDescription(text) {
    const paragraphs = text.split(/\n\n/);
    return (
        <VStack align="start" spacing={3}>
            {paragraphs.map((para, i) => {
                const lines = para.split("\n");
                const hasBullets = lines.some((l) => l.trim().startsWith("•"));
                if (hasBullets) {
                    const title = lines.find((l) => !l.trim().startsWith("•") && l.trim());
                    const bullets = lines.filter((l) => l.trim().startsWith("•"));
                    return (
                        <Box key={i} w="100%">
                            {title && (
                                <Text fontSize="sm" fontWeight="600" color="fg.default" mb={2}>
                                    {title.trim()}
                                </Text>
                            )}
                            <VStack align="start" spacing={1.5} pl={1}>
                                {bullets.map((b, j) => (
                                    <HStack key={j} align="start" spacing={2.5}>
                                        <Box w="4px" h="4px" borderRadius="1px" bg="accent" mt="8px" flexShrink={0}/>
                                        <Text fontSize="sm" color="fg.muted" lineHeight="1.65">
                                            {b.replace(/^•\s*/, "").trim()}
                                        </Text>
                                    </HStack>
                                ))}
                            </VStack>
                        </Box>
                    );
                }
                return (
                    <Text key={i} fontSize="sm" color="fg.muted" lineHeight="1.7">
                        {para.trim()}
                    </Text>
                );
            })}
        </VStack>
    );
}

function ExperienceEntry({exp, idx}) {
    const {t} = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <MotionBox
            position="relative"
            pl={{base: 9, md: 14}}
            pb={{base: 12, md: 14}}
            initial={{opacity: 0, y: 24}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.2}}
            transition={{duration: 0.6, delay: idx * 0.05, ease}}
        >
            {/* Node marker on the rail */}
            <Box
                position="absolute"
                left={{base: "0", md: "1px"}}
                top="2px"
                transform="translateX(-50%)"
                w="34px"
                h="34px"
                borderRadius="sm"
                bg="surface.raised"
                border="1px solid"
                borderColor="line.strong"
                display="flex"
                alignItems="center"
                justifyContent="center"
                overflow="hidden"
                boxShadow="0 2px 10px rgba(28,27,24,0.06)"
            >
                {exp.logo ? (
                    <Image src={exp.logo} alt={exp.company} boxSize="24px" objectFit="contain"/>
                ) : (
                    <Box w="8px" h="8px" bg="accent" borderRadius="1px" transform="rotate(45deg)"/>
                )}
            </Box>

            <Text
                fontFamily="mono"
                fontSize="xs"
                fontWeight="500"
                letterSpacing="0.04em"
                color="accent"
                mb={2}
                className="tabular"
            >
                {exp.dates}
            </Text>

            <Heading
                as="h3"
                fontFamily="heading"
                fontWeight="600"
                fontSize={{base: "xl", md: "2xl"}}
                letterSpacing="-0.015em"
                color="fg.default"
                lineHeight="1.2"
                mb={1.5}
            >
                {exp.title}
            </Heading>

            <HStack spacing={3} mb={1} flexWrap="wrap">
                <Text fontFamily="mono" fontSize="sm" fontWeight="500" color="fg.default">
                    {exp.company}
                </Text>
                {exp.website && (
                    <Link href={exp.website} isExternal color="fg.faint" _hover={{color: "accent"}}>
                        <ExternalLinkIcon mb="2px" boxSize={3}/>
                    </Link>
                )}
                {exp.city && (
                    <HStack spacing={1} color="fg.faint">
                        <MdLocationOn size={13}/>
                        <Text fontSize="xs" fontFamily="mono">{exp.city}</Text>
                    </HStack>
                )}
            </HStack>

            <Box mt={4}>
                {renderDescription(exp.description)}

                {exp.descriptionMore && (
                    <>
                        <Collapse in={open} animateOpacity>
                            <Box mt={3}>{renderDescription(exp.descriptionMore)}</Box>
                        </Collapse>
                        <Button
                            mt={3}
                            size="sm"
                            variant="unstyled"
                            height="auto"
                            display="inline-flex"
                            alignItems="center"
                            gap={2}
                            fontFamily="mono"
                            fontSize="xs"
                            fontWeight="500"
                            letterSpacing="0.03em"
                            color="accent"
                            _hover={{opacity: 0.7}}
                            leftIcon={open ? <MinusIcon boxSize={2.5}/> : <AddIcon boxSize={2.5}/>}
                            onClick={() => setOpen((v) => !v)}
                        >
                            {open ? t("experienceSeeLess") : t("experienceSeeMore")}
                        </Button>
                    </>
                )}
            </Box>

            {exp.tags && (
                <Wrap spacing={2} mt={5}>
                    {exp.tags.map((tag, i) => (
                        <WrapItem key={i}>
                            <Box
                                px={2.5}
                                py={1}
                                fontFamily="mono"
                                fontSize="11px"
                                color="fg.muted"
                                border="1px solid"
                                borderColor="line.subtle"
                                borderRadius="sm"
                                transition="all 0.18s ease"
                                _hover={{borderColor: "accent.line", color: "fg.default"}}
                            >
                                {tag}
                            </Box>
                        </WrapItem>
                    ))}
                </Wrap>
            )}
        </MotionBox>
    );
}

export default function ExperienceSection() {
    const {t, i18n} = useTranslation();
    useColorMode();
    const data = i18n.language === "fr" ? frData : enData;
    const isFr = i18n.language === "fr";

    return (
        <Box id="experiences" as="section" px={{base: 6, md: 10, lg: 16}} py={{base: 20, md: 28}} bg="canvas">
            <SectionHeader
                index="02"
                label={t("experiences")}
                title={isFr ? "Là où j'ai appris en produisant" : "Where I learned by shipping"}
            />

            <Box maxW="820px" mx="auto" position="relative">
                {/* Continuous rail */}
                <Box
                    position="absolute"
                    top="6px"
                    bottom="40px"
                    left={{base: "0", md: "1px"}}
                    w="1px"
                    bg="line.strong"
                />
                {data.experiences.map((exp, idx) => (
                    <ExperienceEntry key={idx} exp={exp} idx={idx}/>
                ))}
            </Box>
        </Box>
    );
}

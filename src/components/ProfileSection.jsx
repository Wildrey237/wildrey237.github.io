import {
    Box,
    Heading,
    Text,
    Stack,
    Link,
    HStack,
    VStack,
    Button,
    Image,
    useColorMode,
    useColorModeValue,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import frData from "../data/data-fr.json";
import enData from "../data/data-en.json";
import { MdLocationOn, MdEmail } from "react-icons/md";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";
import LogoMark from "./LogoMark";

const MotionBox = motion(Box);
const MotionHStack = motion(HStack);

export default function ProfileSection() {
    const { i18n } = useTranslation();
    const { colorMode } = useColorMode();
    const data = i18n.language === "fr" ? frData : enData;

    const isDark = colorMode === "dark";

    const bgMain = useColorModeValue("gray.50", "#050816");
    const textMain = useColorModeValue("gray.900", "white");
    const textSoft = useColorModeValue("gray.600", "gray.300");
    const badgeBg = useColorModeValue("teal.50", "whiteAlpha.100");
    const badgeBorder = useColorModeValue("teal.200", "whiteAlpha.200");
    const badgeText = useColorModeValue("teal.700", "teal.200");
    const cardBg = useColorModeValue("whiteAlpha.700", "whiteAlpha.50");
    const cardBorder = useColorModeValue("blackAlpha.100", "whiteAlpha.200");

    const hasPicture =
        data.profile.link_picture &&
        data.profile.link_picture.trim() !== "";

    const showSearchBadge =
        data.profile.search &&
        data.profile.search.toLowerCase() === "yes";

    return (
        <MotionBox
            id="home"
            px={{ base: 6, md: 12 }}
            py={{ base: 20, md: 28 }}
            bg={bgMain}
            position="relative"
            overflow="hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            {/* Ambient background */}
            {isDark && (
                <>
                    <Box
                        position="absolute"
                        top="-120px"
                        left="-120px"
                        w="320px"
                        h="320px"
                        bg="purple.500"
                        opacity={0.12}
                        filter="blur(120px)"
                        borderRadius="full"
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
                    <Box
                        position="absolute"
                        inset="0"
                        opacity={0.08}
                        backgroundImage="linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)"
                        backgroundSize="48px 48px"
                        pointerEvents="none"
                    />
                </>
            )}

            <Stack
                direction={{ base: "column", lg: "row" }}
                align="center"
                justify="space-between"
                spacing={{ base: 12, lg: 16 }}
                position="relative"
                zIndex={1}
                maxW="1400px"
                mx="auto"
                minH={{ base: "auto", lg: "70vh" }}
            >
                {/* Left content */}
                <VStack
                    align={{ base: "center", lg: "start" }}
                    textAlign={{ base: "center", lg: "left" }}
                    spacing={6}
                    flex="1"
                    maxW="720px"
                >
                    {showSearchBadge && (
                        <Box
                            px={4}
                            py={2}
                            borderRadius="full"
                            bg={badgeBg}
                            border="1px solid"
                            borderColor={badgeBorder}
                            color={badgeText}
                            fontSize="sm"
                            fontWeight="medium"
                            backdropFilter="blur(8px)"
                        >
                            {i18n.language === "fr"
                                ? "Disponible pour de nouvelles opportunités"
                                : "Open to new opportunities"}
                        </Box>
                    )}

                    <Heading
                        as="h1"
                        fontSize={{ base: "4xl", md: "6xl", xl: "7xl" }}
                        lineHeight="0.95"
                        color={textMain}
                        fontWeight="black"
                        letterSpacing="-0.04em"
                    >
                        {data.profile.name}
                    </Heading>

                    <Text
                        fontSize={{ base: "lg", md: "2xl" }}
                        color={textSoft}
                        maxW="850px"
                    >
                        {data.profile.title}
                    </Text>

                    <Text
                        fontSize={{ base: "md", md: "lg" }}
                        color={textSoft}
                        maxW="760px"
                    >
                        {data.profile.summary}
                    </Text>

                    <HStack spacing={4} pt={2} flexWrap="wrap" justify={{ base: "center", lg: "flex-start" }}>
                        <Button
                            as="a"
                            href="#projects"
                            colorScheme="teal"
                            size="lg"
                        >
                            {i18n.language === "fr" ? "Voir mes projets" : "See my projects"}
                        </Button>

                        <Button
                            as="a"
                            href={`mailto:${data.profile.email}`}
                            variant="outline"
                            size="lg"
                        >
                            {i18n.language === "fr" ? "Me contacter" : "Contact me"}
                        </Button>
                    </HStack>

                    <HStack
                        spacing={6}
                        pt={2}
                        flexWrap="wrap"
                        justify={{ base: "center", lg: "flex-start" }}
                        color={textSoft}
                    >
                        <MotionHStack whileHover={{ scale: 1.05 }} spacing={2}>
                            <MdLocationOn />
                            <Text fontSize="sm">{data.profile.location}</Text>
                        </MotionHStack>

                        <MotionHStack whileHover={{ scale: 1.05 }} spacing={2}>
                            <MdEmail />
                            <Link href={`mailto:${data.profile.email}`}>{data.profile.email}</Link>
                        </MotionHStack>

                        <MotionHStack whileHover={{ scale: 1.05 }} spacing={2}>
                            <FaLinkedin />
                            <Link href={data.profile.linkedin} target="_blank" rel="noopener noreferrer">
                                LinkedIn
                            </Link>
                        </MotionHStack>

                        <MotionHStack whileHover={{ scale: 1.05 }} spacing={2}>
                            <FaGithub />
                            <Link href={data.profile.github} target="_blank" rel="noopener noreferrer">
                                GitHub
                            </Link>
                        </MotionHStack>
                    </HStack>
                </VStack>

                {/* Right visual */}
                <Box
                    flexShrink={0}
                    position="relative"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Box
                        position="absolute"
                        w={{ base: "220px", md: "300px" }}
                        h={{ base: "220px", md: "300px" }}
                        bg={isDark ? "teal.400" : "teal.100"}
                        opacity={isDark ? 0.12 : 0.25}
                        filter="blur(70px)"
                        borderRadius="full"
                    />

                    <Box
                        w={{ base: "220px", md: "300px" }}
                        h={{ base: "220px", md: "300px" }}
                        borderRadius="32px"
                        overflow="hidden"
                        bg={cardBg}
                        border="1px solid"
                        borderColor={cardBorder}
                        backdropFilter="blur(10px)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        boxShadow={isDark ? "0 0 0 1px rgba(255,255,255,0.04), 0 10px 40px rgba(0,0,0,0.45)" : "xl"}
                    >
                        {hasPicture ? (
                            <Image
                                src={data.profile.link_picture}
                                alt={data.profile.name}
                                objectFit="cover"
                                w="100%"
                                h="100%"
                            />
                        ) : (
                            <Box transform="scale(2.2)">
                                <LogoMark />
                            </Box>
                        )}
                    </Box>
                </Box>
            </Stack>
        </MotionBox>
    );
}
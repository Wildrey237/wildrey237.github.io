import {
    Box,
    Heading,
    Text,
    Grid,
    GridItem,
    HStack,
    VStack,
    Button,
    Image,
    Link,
    useToast,
} from "@chakra-ui/react";
import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {motion, AnimatePresence} from "framer-motion";
import frData from "../data/data-fr.json";
import enData from "../data/data-en.json";
import LogoMark from "./LogoMark";

const MotionBox = motion(Box);

const ease = [0.22, 1, 0.36, 1];

function RoleRotator({roles}) {
    const [i, setI] = useState(0);
    useEffect(() => {
        if (roles.length < 2) return;
        const t = setInterval(() => setI((x) => (x + 1) % roles.length), 2800);
        return () => clearInterval(t);
    }, [roles.length]);

    return (
        <Box h="1.6em" overflow="hidden" position="relative">
            <AnimatePresence mode="wait">
                <motion.div
                    key={i}
                    initial={{opacity: 0, y: "0.5em"}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: "-0.5em"}}
                    transition={{duration: 0.4, ease}}
                >
                    <Text
                        fontFamily="mono"
                        fontSize={{base: "sm", md: "md"}}
                        fontWeight="500"
                        letterSpacing="0.02em"
                        color="accent"
                    >
                        {roles[i]}
                    </Text>
                </motion.div>
            </AnimatePresence>
        </Box>
    );
}

function MetaLink({href, children, onClick, isExternal}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            isExternal={isExternal}
            fontFamily="mono"
            fontSize="xs"
            fontWeight="400"
            color="fg.muted"
            letterSpacing="0.01em"
            borderBottom="1px solid"
            borderColor="transparent"
            pb="1px"
            transition="all 0.18s ease"
            _hover={{color: "accent", borderColor: "accent.line"}}
        >
            {children}
        </Link>
    );
}

export default function ProfileSection() {
    const {t, i18n} = useTranslation();
    const data = i18n.language === "fr" ? frData : enData;
    const toast = useToast();

    const {profile} = data;
    const hasPicture = profile.link_picture && profile.link_picture.trim() !== "";
    const showAvailable = profile.search && profile.search.toLowerCase() === "yes";
    const roles = profile.typewriter_roles?.length ? profile.typewriter_roles : [profile.title];

    const copyEmail = (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(profile.email);
        toast({
            title: i18n.language === "fr" ? "Email copié" : "Email copied",
            status: "success",
            duration: 1800,
            isClosable: false,
            position: "bottom",
        });
    };

    return (
        <Box
            id="home"
            as="section"
            px={{base: 6, md: 10, lg: 16}}
            pt={{base: 16, md: 24}}
            pb={{base: 20, md: 28}}
            bg="canvas"
        >
            <Grid
                maxW="1200px"
                mx="auto"
                templateColumns={{base: "1fr", lg: "1.35fr 1fr"}}
                gap={{base: 14, lg: 20}}
                alignItems="center"
                minH={{lg: "72vh"}}
            >
                {/* Left — editorial text block */}
                <GridItem>
                    <MotionBox
                        initial={{opacity: 0, y: 24}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.8, ease}}
                    >
                        {showAvailable && (
                            <HStack spacing={2.5} mb={7}>
                                <Box position="relative" w="7px" h="7px">
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
                                    fontSize="xs"
                                    fontWeight="500"
                                    textTransform="uppercase"
                                    letterSpacing="0.18em"
                                    color="fg.muted"
                                >
                                    {t("available")}
                                </Text>
                            </HStack>
                        )}

                        <Heading
                            as="h1"
                            fontFamily="heading"
                            fontWeight="700"
                            fontSize={{base: "5xl", md: "6xl", xl: "7xl"}}
                            lineHeight="0.94"
                            letterSpacing="-0.035em"
                            color="fg.default"
                            mb={5}
                            sx={{textWrap: "balance"}}
                        >
                            {profile.name}
                            <Box as="span" color="accent">.</Box>
                        </Heading>

                        <Box mb={7}>
                            <RoleRotator roles={roles}/>
                        </Box>

                        <Text
                            fontSize={{base: "md", md: "lg"}}
                            lineHeight="1.75"
                            color="fg.muted"
                            maxW="60ch"
                            mb={9}
                            sx={{textWrap: "pretty"}}
                        >
                            {profile.summary}
                        </Text>

                        <HStack spacing={7} mb={10} flexWrap="wrap">
                            <Button
                                as="a"
                                href="#projects"
                                colorScheme="brand"
                                size="lg"
                                borderRadius="lg"
                                px={7}
                                fontSize="sm"
                                letterSpacing="0.01em"
                                _hover={{transform: "translateY(-2px)"}}
                                _active={{transform: "translateY(0)"}}
                                transition="transform 0.2s ease"
                            >
                                {t("seeProjects")}
                            </Button>
                            <Link
                                href={`mailto:${profile.email}`}
                                fontFamily="mono"
                                fontSize="sm"
                                fontWeight="500"
                                color="fg.default"
                                borderBottom="1px solid"
                                borderColor="fg.default"
                                pb="2px"
                                transition="all 0.2s ease"
                                _hover={{color: "accent", borderColor: "accent"}}
                            >
                                {t("contactMe")} →
                            </Link>
                        </HStack>

                        <HStack
                            spacing={{base: 4, md: 6}}
                            flexWrap="wrap"
                            rowGap={2}
                            pt={6}
                            borderTop="1px solid"
                            borderColor="line.subtle"
                        >
                            <Text fontFamily="mono" fontSize="xs" color="fg.faint" letterSpacing="0.01em">
                                {profile.location}
                            </Text>
                            <MetaLink href={`mailto:${profile.email}`} onClick={copyEmail}>
                                {profile.email}
                            </MetaLink>
                            <MetaLink href={profile.linkedin} isExternal>
                                LinkedIn ↗
                            </MetaLink>
                            <MetaLink href={profile.github} isExternal>
                                GitHub ↗
                            </MetaLink>
                        </HStack>
                    </MotionBox>
                </GridItem>

                {/* Right — framed portrait with layered depth */}
                <GridItem justifySelf={{base: "center", lg: "end"}}>
                    <MotionBox
                        position="relative"
                        w={{base: "260px", sm: "300px", md: "340px"}}
                        initial={{opacity: 0, scale: 0.96}}
                        animate={{opacity: 1, scale: 1}}
                        transition={{duration: 0.9, ease, delay: 0.15}}
                    >
                        {/* Colorful glow — joyful, single, soft */}
                        <Box
                            aria-hidden
                            position="absolute"
                            inset="-24px"
                            borderRadius="2xl"
                            opacity={0.55}
                            filter="blur(56px)"
                            bgGradient="linear(135deg, syntax.blue, syntax.purple, syntax.pink)"
                            _light={{opacity: 0.28}}
                        />
                        {/* Offset accent frame — depth via layering */}
                        <Box
                            aria-hidden
                            position="absolute"
                            top="16px"
                            left="16px"
                            right="-16px"
                            bottom="-16px"
                            border="1px solid"
                            borderColor="accent.line"
                            borderRadius="lg"
                        />
                        <Box
                            position="relative"
                            borderRadius="lg"
                            overflow="hidden"
                            border="1px solid"
                            borderColor="line.strong"
                            bg="surface"
                            sx={{aspectRatio: "4 / 5"}}
                            role="group"
                        >
                            {hasPicture ? (
                                <Image
                                    src={profile.link_picture}
                                    alt={`Portrait de ${profile.name}`}
                                    objectFit="cover"
                                    w="100%"
                                    h="100%"
                                    transition="transform 0.6s ease"
                                    _groupHover={{transform: "scale(1.04)"}}
                                />
                            ) : (
                                <Box
                                    w="100%"
                                    h="100%"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Box transform="scale(2.4)">
                                        <LogoMark/>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                        <Text
                            mt={5}
                            fontFamily="mono"
                            fontSize="11px"
                            letterSpacing="0.08em"
                            textTransform="uppercase"
                            color="fg.faint"
                        >
                            {`— ${profile.location}`}
                        </Text>
                    </MotionBox>
                </GridItem>
            </Grid>
        </Box>
    );
}

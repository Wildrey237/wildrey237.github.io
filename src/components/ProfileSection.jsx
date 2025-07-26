import {
    Box,
    Heading,
    Text,
    Stack,
    Link,
    HStack,
    useColorMode,
} from "@chakra-ui/react";
import {useTranslation} from "react-i18next";
import frData from "../data/data-fr.json";
import enData from "../data/data-en.json";
import {MdLocationOn, MdEmail} from "react-icons/md";
import {FaLinkedin, FaGithub} from "react-icons/fa";
import {Typewriter} from "react-simple-typewriter";
import {motion} from "framer-motion";

// Composants animés
const MotionBox = motion(Box);
const MotionHStack = motion(HStack);

export default function ProfileSection() {
    const {i18n} = useTranslation();
    const {colorMode} = useColorMode();
    const data = i18n.language === "fr" ? frData : enData;

    return (
        <MotionBox
            id="home"
            px={[4, 8]}
            py={12}
            bg={colorMode === "light" ? "gray.50" : "gray.800"}
            textAlign="center"
            initial={{opacity: 0, y: 50}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.2}}
            transition={{duration: 0.6, ease: "easeOut"}}
        >
            {/* Nom avec effet machine à écrire */}
            <Heading
                fontSize={["2xl", "3xl", "4xl"]}
                mb={3}
                color={colorMode === "light" ? "teal.600" : "teal.300"}
            >
                <Typewriter
                    words={[data.profile.name]}
                    loop={true}
                    cursor
                    cursorStyle="_"
                    typeSpeed={100}
                    deleteSpeed={50}
                    delaySpeed={2000}
                />
            </Heading>

            {/* Titre */}
            <Text
                fontSize="lg"
                fontWeight="semibold"
                mb={4}
                color={colorMode === "light" ? "gray.700" : "gray.200"}
            >
                {data.profile.title}
            </Text>

            {/* Résumé */}
            <Text
                fontSize="md"
                maxW="800px"
                mx="auto"
                color={colorMode === "light" ? "gray.600" : "gray.300"}
                mb={6}
            >
                {data.profile.summary}
            </Text>

            {/* Infos clés */}
            <Stack
                direction={["column", "row"]}
                justify="center"
                spacing={6}
                fontSize="sm"
                color={colorMode === "light" ? "gray.700" : "gray.200"}
            >
                <MotionHStack
                    spacing={2}
                    whileHover={{scale: 1.05, color: "#319795"}}
                    transition={{type: "spring", stiffness: 300}}
                >
                    <MdLocationOn size={18}/>
                    <Text>{data.profile.location}</Text>
                </MotionHStack>

                <MotionHStack
                    spacing={2}
                    whileHover={{scale: 1.05, color: "#319795"}}
                    transition={{type: "spring", stiffness: 300}}
                >
                    <MdEmail size={18}/>
                    <Link
                        href={`mailto:${data.profile.email}`}
                        _hover={{color: "teal.500"}}
                    >
                        {data.profile.email}
                    </Link>
                </MotionHStack>

                <MotionHStack
                    spacing={2}
                    whileHover={{scale: 1.05, color: "#319795"}}
                    transition={{type: "spring", stiffness: 300}}
                >
                    <FaLinkedin size={18}/>
                    <Link
                        href={data.profile.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        _hover={{color: "teal.500"}}
                    >
                        LinkedIn
                    </Link>
                </MotionHStack>

                <MotionHStack
                    spacing={2}
                    whileHover={{scale: 1.05, color: "#319795"}}
                    transition={{type: "spring", stiffness: 300}}
                >
                    <FaGithub size={18}/>
                    <Link
                        href={data.profile.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        _hover={{color: "teal.500"}}
                    >
                        GitHub
                    </Link>
                </MotionHStack>
            </Stack>
        </MotionBox>
    );
}
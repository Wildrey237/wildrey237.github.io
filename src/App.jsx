import {Box, IconButton, useColorMode, useColorModeValue} from "@chakra-ui/react";
import {motion, AnimatePresence} from "framer-motion";
import {useState, useEffect} from "react";
import {ChevronUp} from "lucide-react";
import Navbar from "./components/Navbar";
import SkillsSection from "./components/SkillsSection";
import ExperienceSection from "./components/ExperienceSection";
import EducationSection from "./components/EducationSection";
import ProjectsSection from "./components/ProjectsSection";
import Footer from "./components/Footer";
import ProfileSection from "./components/ProfileSection";
import ScrollProgressBar from "./components/ScrollProgressBar";

const MotionBox = motion(Box);

const sectionAnim = {
    initial: {opacity: 0, y: 40},
    whileInView: {opacity: 1, y: 0},
    viewport: {once: true, amount: 0.15},
    transition: {duration: 0.55, ease: "easeOut"},
};

function SectionDivider({colorMode}) {
    const isDark = colorMode === "dark";
    return (
        <Box
            h="1px"
            mx={{base: 6, md: 16}}
            bg={isDark
                ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)"
                : "linear-gradient(90deg, transparent, rgba(0,0,0,0.07), transparent)"
            }
        />
    );
}

function ScrollToTopButton() {
    const [visible, setVisible] = useState(false);
    const btnBg = useColorModeValue("white", "#1a2744");
    const btnBorder = useColorModeValue("gray.200", "whiteAlpha.200");

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 300);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{opacity: 0, y: 16}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: 16}}
                    transition={{duration: 0.2}}
                    style={{position: "fixed", bottom: "72px", right: "24px", zIndex: 998}}
                >
                    <IconButton
                        aria-label="Retour en haut"
                        icon={<ChevronUp size={20}/>}
                        onClick={() => window.scrollTo({top: 0, behavior: "smooth"})}
                        borderRadius="full"
                        size="md"
                        bg={btnBg}
                        border="1px solid"
                        borderColor={btnBorder}
                        boxShadow="lg"
                        _hover={{borderColor: "teal.400", color: "teal.400", transform: "translateY(-2px)"}}
                        transition="all 0.2s"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function App() {
    const {colorMode} = useColorMode();
    const isDark = colorMode === "dark";
    const pageBg = isDark ? "#050816" : "gray.50";

    return (
        <Box minH="100vh" bg={pageBg}>
            <ScrollProgressBar/>
            <Navbar/>
            <Box mt="64px" pb="72px">
                <MotionBox {...sectionAnim}>
                    <ProfileSection/>
                </MotionBox>

                <SectionDivider colorMode={colorMode}/>

                <MotionBox {...sectionAnim}>
                    <SkillsSection/>
                </MotionBox>

                <SectionDivider colorMode={colorMode}/>

                <MotionBox {...sectionAnim}>
                    <ExperienceSection/>
                </MotionBox>

                <SectionDivider colorMode={colorMode}/>

                <MotionBox {...sectionAnim}>
                    <EducationSection/>
                </MotionBox>

                <SectionDivider colorMode={colorMode}/>

                <MotionBox {...sectionAnim}>
                    <ProjectsSection/>
                </MotionBox>
            </Box>
            <Footer/>
            <ScrollToTopButton/>
        </Box>
    );
}

export default App;

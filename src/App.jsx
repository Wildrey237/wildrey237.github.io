import {Box, IconButton} from "@chakra-ui/react";
import {motion, AnimatePresence} from "framer-motion";
import {useState, useEffect} from "react";
import {ArrowUp} from "lucide-react";
import Navbar from "./components/Navbar";
import SkillsSection from "./components/SkillsSection";
import ExperienceSection from "./components/ExperienceSection";
import EducationSection from "./components/EducationSection";
import ProjectsSection from "./components/ProjectsSection";
import Footer from "./components/Footer";
import ProfileSection from "./components/ProfileSection";
import ScrollProgressBar from "./components/ScrollProgressBar";
import GrainOverlay from "./components/GrainOverlay";

const MotionBox = motion(Box);

// Staggered, GPU-friendly scroll-in. Cinematic easing, no bounce.
const sectionAnim = {
    initial: {opacity: 0, y: 32},
    whileInView: {opacity: 1, y: 0},
    viewport: {once: true, amount: 0.12},
    transition: {duration: 0.7, ease: [0.22, 1, 0.36, 1]},
};

function ScrollToTopButton() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 400);
        window.addEventListener("scroll", onScroll, {passive: true});
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: 12}}
                    transition={{duration: 0.25, ease: [0.22, 1, 0.36, 1]}}
                    style={{position: "fixed", bottom: "80px", right: "24px", zIndex: 998}}
                >
                    <IconButton
                        aria-label="Retour en haut"
                        icon={<ArrowUp size={18}/>}
                        onClick={() => window.scrollTo({top: 0, behavior: "smooth"})}
                        size="md"
                        bg="surface.raised"
                        color="fg.muted"
                        border="1px solid"
                        borderColor="line.subtle"
                        boxShadow="0 6px 24px rgba(28,27,24,0.12)"
                        borderRadius="sm"
                        _hover={{color: "accent", borderColor: "accent.line", transform: "translateY(-2px)"}}
                        _active={{transform: "translateY(0)"}}
                        transition="all 0.2s ease"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function App() {
    return (
        <Box minH="100dvh" bg="canvas" color="fg.default" position="relative">
            <GrainOverlay/>
            <ScrollProgressBar/>
            <Navbar/>
            <Box as="main" mt="64px" pb="72px" position="relative" zIndex={2}>
                <ProfileSection/>

                <MotionBox {...sectionAnim}>
                    <SkillsSection/>
                </MotionBox>

                <MotionBox {...sectionAnim}>
                    <ExperienceSection/>
                </MotionBox>

                <MotionBox {...sectionAnim}>
                    <EducationSection/>
                </MotionBox>

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

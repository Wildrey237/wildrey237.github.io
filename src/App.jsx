import {Box, useColorMode} from "@chakra-ui/react";
import {motion} from "framer-motion";
import Navbar from "./components/Navbar";
import SkillsSection from "./components/SkillsSection";
import ExperienceSection from "./components/ExperienceSection";
import EducationSection from "./components/EducationSection";
import ProjectsSection from "./components/ProjectsSection";
import Footer from "./components/Footer";
import ProfileSection from "./components/ProfileSection";
import ScrollProgressBar from "./components/ScrollProgressBar";

const MotionBox = motion(Box);

function App() {
    const {colorMode} = useColorMode();

    const sectionAnim = {
        initial: {opacity: 0, y: 50},
        whileInView: {opacity: 1, y: 0},
        viewport: {once: true, amount: 0.2},
        transition: {duration: 0.6, ease: "easeOut"},
    };

    return (
        <Box minH="100vh" bg={colorMode === "light" ? "gray.50" : "gray.800"}>
            <ScrollProgressBar/>
            <Navbar/>
            <Box mt="80px" pb="80px">
                <MotionBox {...sectionAnim}>
                    <ProfileSection/>
                </MotionBox>
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
        </Box>
    );
}

export default App;
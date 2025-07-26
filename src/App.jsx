import {Box, useColorMode} from "@chakra-ui/react";
import {motion} from "framer-motion";
import Navbar from "./components/Navbar";
import SkillsSection from "./components/SkillsSection";
import ExperienceSection from "./components/ExperienceSection";
import EducationSection from "./components/EducationSection";
import Footer from "./components/Footer";
import ProfileSection from "./components/ProfileSection";
import ScrollProgressBar from "./components/ScrollProgressBar"; // <== ajoute ce composant

// Boîte animée pour les sections
const MotionBox = motion(Box);

function App() {
    const {colorMode} = useColorMode();

    // animation pour chaque section
    const sectionAnim = {
        initial: {opacity: 0, y: 50},
        whileInView: {opacity: 1, y: 0},
        viewport: {once: true, amount: 0.2},
        transition: {duration: 0.6, ease: "easeOut"},
    };

    return (
        <Box minH="100vh" bg={colorMode === "light" ? "gray.50" : "gray.800"}>
            {/* Barre de progression du scroll */}
            <ScrollProgressBar/>

            {/* Navbar */}
            <Navbar/>

            {/* Contenu principal */}
            <Box mt="80px" pb="80px">
                {/* Section Profil */}
                <MotionBox {...sectionAnim}>
                    <ProfileSection/>
                </MotionBox>

                {/* Section Compétences */}
                <MotionBox {...sectionAnim}>
                    <SkillsSection/>
                </MotionBox>

                {/* Section Expériences */}
                <MotionBox {...sectionAnim}>
                    <ExperienceSection/>
                </MotionBox>

                {/* Section Éducation */}
                <MotionBox {...sectionAnim}>
                    <EducationSection/>
                </MotionBox>
            </Box>

            {/* Footer */}
            <Footer/>
        </Box>
    );
}

export default App;
import { Box, useColorMode } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import Navbar from "./components/Navbar";
import SkillsSection from "./components/SkillsSection";
import ExperienceSection from "./components/ExperienceSection";
import Footer from "./components/Footer";
import ProfileSection from "./components/ProfileSection"; // ➡️ Nouveau composant profil

function App() {
    const { colorMode } = useColorMode();

    return (
        <Box minH="100vh" bg={colorMode === "light" ? "gray.50" : "gray.800"}>
            {/* Navbar */}
            <Navbar />

            {/* Contenu principal avec un padding-bottom pour laisser place au footer */}
            <Box mt="80px" pb="80px">
                {/* Section Profil */}
                <ProfileSection />

                {/* Section Compétences */}
                <SkillsSection />

                {/* Section Expériences */}
                <ExperienceSection />
            </Box>

            {/* Footer fixe */}
            <Footer />
        </Box>
    );
}

export default App;
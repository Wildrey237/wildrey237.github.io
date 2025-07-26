// src/components/ScrollProgressBar.jsx
import { Box, useColorMode } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function ScrollProgressBar() {
    const { colorMode } = useColorMode();
    const [scrollWidth, setScrollWidth] = useState(0);

    const handleScroll = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrolled = (scrollTop / docHeight) * 100;
        setScrollWidth(scrolled);
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <Box
            position="fixed"
            top="0"
            left="0"
            height="3px"
            bg={colorMode === "light" ? "teal.400" : "teal.200"}
            width={`${scrollWidth}%`}
            zIndex="1000"
            transition="width 0.2s ease"
        />
    );
}
import {Box} from "@chakra-ui/react";
import {useEffect, useState} from "react";

export default function ScrollProgressBar() {
    const [scrollWidth, setScrollWidth] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            setScrollWidth(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
        };
        window.addEventListener("scroll", handleScroll, {passive: true});
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <Box
            position="fixed"
            top="0"
            left="0"
            height="2px"
            bg="accent"
            width={`${scrollWidth}%`}
            zIndex="1000"
            transition="width 0.1s linear"
        />
    );
}

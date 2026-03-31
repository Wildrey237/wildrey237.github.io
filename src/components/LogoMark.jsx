import { Box, Text, useColorModeValue } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

export default function LogoMark() {
    const primary = useColorModeValue("gray.900", "white");
    const accent = useColorModeValue("teal.500", "teal.300");
    useColorModeValue("gray.400", "gray.500");
    return (
        <MotionBox
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            cursor="pointer"
            whileHover={{
                scale: 1.08,
                y: -1,
            }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15 }}
        >
            <Box
                display="flex"
                alignItems="center"
                fontFamily="'JetBrains Mono', 'Fira Code', monospace"
                fontWeight="900"
                lineHeight="1"
                letterSpacing="-0.05em"
            >
                <Text color={accent} fontSize="lg" mx="1px">{'<'}</Text>
                <Text color={primary} fontSize="lg" mx="1px">W</Text>
                <Text color={accent} fontSize="lg" mx="1px">/</Text>
                <Text color={primary} fontSize="lg" mx="1px">B</Text>
                <Text color={accent} fontSize="lg" mx="1px">{'>'}</Text>
            </Box>
        </MotionBox>
    );
}
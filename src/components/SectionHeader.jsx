import {Box, Heading, HStack, Text} from "@chakra-ui/react";
import {motion} from "framer-motion";

const MotionBox = motion(Box);

/**
 * Section header: a colored mono index + label on a hairline rule, with a
 * Space Grotesk title beneath. Left-aligned, tech-modern, not a code comment.
 */
export default function SectionHeader({index, label, title, accent = "accent", maxW = "1200px"}) {
    return (
        <Box maxW={maxW} mx="auto" mb={{base: 10, md: 14}} px={{base: 1, md: 2}}>
            <HStack spacing={3} align="center" mb={4}>
                <Box w="9px" h="9px" borderRadius="2px" bg={accent} flexShrink={0}/>
                <Text
                    as="span"
                    fontFamily="mono"
                    fontSize="xs"
                    fontWeight="600"
                    letterSpacing="0.04em"
                    color={accent}
                    className="tabular"
                >
                    {index}
                </Text>
                <Text
                    as="span"
                    fontFamily="mono"
                    fontSize="xs"
                    fontWeight="500"
                    textTransform="uppercase"
                    letterSpacing="0.22em"
                    color="fg.muted"
                    whiteSpace="nowrap"
                >
                    {label}
                </Text>
                <Box flex="1" h="1px" bg="line.subtle"/>
            </HStack>

            <MotionBox
                initial={{opacity: 0, y: 16}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true, amount: 0.6}}
                transition={{duration: 0.6, ease: [0.22, 1, 0.36, 1]}}
            >
                <Heading
                    as="h2"
                    fontFamily="heading"
                    fontWeight="700"
                    fontSize={{base: "3xl", md: "4xl", lg: "5xl"}}
                    lineHeight="1.04"
                    letterSpacing="-0.03em"
                    color="fg.default"
                    maxW="20ch"
                    sx={{textWrap: "balance"}}
                >
                    {title}
                </Heading>
            </MotionBox>
        </Box>
    );
}

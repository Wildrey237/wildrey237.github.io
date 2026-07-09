import {Box, Heading, HStack, Text} from "@chakra-ui/react";
import {motion} from "framer-motion";

const MotionBox = motion(Box);

/**
 * Editorial section header: a mono index + label sitting on a hairline rule,
 * with a Fraunces serif title beneath. Left-aligned, asymmetric — replaces the
 * repeated centered "title + underline bar" pattern.
 */
export default function SectionHeader({index, label, title, maxW = "1200px"}) {
    return (
        <Box maxW={maxW} mx="auto" mb={{base: 10, md: 14}} px={{base: 1, md: 2}}>
            <HStack spacing={4} align="center" mb={4}>
                <Text
                    as="span"
                    fontFamily="mono"
                    fontSize="xs"
                    fontWeight="500"
                    letterSpacing="0.06em"
                    color="accent"
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
                    fontWeight="600"
                    fontSize={{base: "3xl", md: "4xl", lg: "5xl"}}
                    lineHeight="1.02"
                    letterSpacing="-0.025em"
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

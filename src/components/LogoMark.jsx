import {Box, HStack, Text} from "@chakra-ui/react";
import {motion} from "framer-motion";

const MotionHStack = motion(HStack);

export default function LogoMark() {
    return (
        <MotionHStack
            spacing={2}
            display="inline-flex"
            alignItems="center"
            cursor="pointer"
            whileHover={{y: -1}}
            whileTap={{scale: 0.97}}
            transition={{duration: 0.15}}
        >
            <Box
                w="8px"
                h="8px"
                bg="accent"
                borderRadius="1px"
                transform="rotate(45deg)"
                flexShrink={0}
            />
            <Text
                fontFamily="mono"
                fontWeight="600"
                fontSize="sm"
                letterSpacing="0.02em"
                color="fg.default"
            >
                W<Box as="span" color="accent">.</Box>B
            </Text>
        </MotionHStack>
    );
}

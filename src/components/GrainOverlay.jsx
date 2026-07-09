import {Box} from "@chakra-ui/react";

// A fixed, non-interactive film grain. Replaces the per-section blurred blobs
// and grid patterns with one consistent, subtle texture across the whole page.
const NOISE =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'>
          <filter id='n'>
            <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/>
            <feColorMatrix type='saturate' values='0'/>
          </filter>
          <rect width='100%' height='100%' filter='url(#n)'/>
        </svg>`
    );

export default function GrainOverlay() {
    return (
        <Box
            aria-hidden
            position="fixed"
            inset="0"
            zIndex={1}
            pointerEvents="none"
            backgroundImage={`url("${NOISE}")`}
            backgroundSize="140px 140px"
            opacity={{base: 0.035, md: 0.05}}
            mixBlendMode="multiply"
            _dark={{opacity: 0.06, mixBlendMode: "overlay"}}
        />
    );
}

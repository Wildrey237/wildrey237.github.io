import {Box} from "@chakra-ui/react";

// Fixed, non-interactive blueprint grid + faint grain. Gives the whole page a
// subtle "terminal canvas" texture without the per-section blobs.
const NOISE =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>
          <filter id='n'>
            <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
            <feColorMatrix type='saturate' values='0'/>
          </filter>
          <rect width='100%' height='100%' filter='url(#n)'/>
        </svg>`
    );

export default function GrainOverlay() {
    return (
        <>
            {/* Blueprint grid */}
            <Box
                aria-hidden
                position="fixed"
                inset="0"
                zIndex={0}
                pointerEvents="none"
                backgroundImage={`
                    linear-gradient(to right, currentColor 1px, transparent 1px),
                    linear-gradient(to bottom, currentColor 1px, transparent 1px)
                `}
                backgroundSize="64px 64px"
                color="fg.default"
                opacity={{base: 0.02, md: 0.028}}
                _dark={{opacity: 0.035}}
            />
            {/* Film grain */}
            <Box
                aria-hidden
                position="fixed"
                inset="0"
                zIndex={0}
                pointerEvents="none"
                backgroundImage={`url("${NOISE}")`}
                backgroundSize="120px 120px"
                opacity={{base: 0.03, md: 0.04}}
                mixBlendMode="overlay"
            />
        </>
    );
}

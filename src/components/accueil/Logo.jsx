'use client'

// Logo d'entreprise ou d'ecole : carre 40px, coins arrondis, fond neutre.
// Sans logo, ou si l'image ne se charge pas : monogramme (initiales), jamais d'image cassee.
import {useState} from "react";
import {Box} from "@chakra-ui/react";

const MOTS_VIDES = new Set(["de", "du", "des", "la", "le", "les", "et", "&", "of", "the", "and"]);

// "Credit Agricole CIB" -> "CA" ; "EPITA – Specialisation..." -> "E" ; "COMUTITRES (Ile-de-France...)" -> "C".
export function initiales(nom) {
    const base = nom.split(/\s[–-]\s|\(/)[0];
    const mots = base.split(/\s+/).filter(m => m && !MOTS_VIDES.has(m.toLowerCase()));
    return mots.slice(0, 2).map(m => m[0]).join("").toUpperCase() || "?";
}

export default function Logo({src, nom}) {
    const [echec, setEchec] = useState(false);
    const cadre = {
        w: "40px", h: "40px", flexShrink: 0, borderRadius: "10px", border: "1px solid", borderColor: "line.strong",
        bg: "surface", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
    };
    if (src && !echec) {
        return (
            <Box {...cadre} bg="#FFFFFF">
                {/* <img> simple : logos de 40px, fichiers locaux ou Vercel Blob. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" width={40} height={40} loading="lazy" onError={() => setEchec(true)}
                     style={{width: "100%", height: "100%", objectFit: "contain", padding: 4}}/>
            </Box>
        );
    }
    return (
        <Box {...cadre} bg="line.subtle" color="fg.muted" fontFamily="heading" fontWeight="700" fontSize="14px"
             aria-hidden="true">
            {initiales(nom)}
        </Box>
    );
}

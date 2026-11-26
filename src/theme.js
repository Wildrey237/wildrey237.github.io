import {extendTheme} from '@chakra-ui/react'

// Mode de couleur : choix memorise dans un cookie (chakra-ui-color-mode), sinon preference
// systeme (prefers-color-scheme). Le script ColorModeScript (type "cookie") pose la classe
// avant le premier affichage : pas de flash, et la page reste statique (ISR).
const config = {
    initialColorMode: 'system',
    useSystemColorMode: false,
    disableTransitionOnChange: true,
}

// Accent de la charte (echelle pour colorScheme).
const brand = {
    50: '#EEF1FD',
    100: '#D9E0FB',
    200: '#B4C2FF',
    300: '#8EA2FF',
    400: '#5F78F0',
    500: '#1F3FD1',
    600: '#1A35B0',
    700: '#152B8F',
    800: '#10216E',
    900: '#0B174D',
}

const theme = extendTheme({
    config,
    fonts: {
        heading: "var(--font-space-grotesk), system-ui, sans-serif",
        body: "var(--font-inter), system-ui, -apple-system, sans-serif",
        mono: "var(--font-jetbrains-mono), ui-monospace, monospace",
    },
    colors: {brand},
    semanticTokens: {
        colors: {
            // Fonds et surfaces
            canvas: {default: '#F6F5F1', _dark: '#0F1115'},
            surface: {default: '#FFFFFF', _dark: '#171A21'},
            // Bordures (line.strong) et separateurs (line.subtle)
            'line.strong': {default: '#E2E0D8', _dark: '#2A2E38'},
            'line.subtle': {default: '#ECEAE3', _dark: '#22262F'},
            // Texte : principal, secondaire, discret
            'fg.default': {default: '#15161A', _dark: '#EDEDEA'},
            'fg.muted': {default: '#3D3F47', _dark: '#B7B9C1'},
            'fg.faint': {default: '#6B6D75', _dark: '#8E919B'},
            // Accent, et texte pose sur l'accent
            accent: {default: '#1F3FD1', _dark: '#8EA2FF'},
            'accent.contrast': {default: '#FFFFFF', _dark: '#0F1115'},
            'accent.hover': {default: '#1A35B0', _dark: '#A9B8FF'},
            // Puces (tags)
            'chip.bg': {default: '#EEF1FD', _dark: '#1E2542'},
            'chip.fg': {default: '#1F3FD1', _dark: '#B4C2FF'},
            // Badge vert (disponibilite)
            'success.bg': {default: '#E3F1E8', _dark: '#12321F'},
            'success.fg': {default: '#1D6B45', _dark: '#8FDCAE'},
            // En-tete translucide
            'chrome.bg': {default: 'rgba(246,245,241,0.88)', _dark: 'rgba(15,17,21,0.88)'},
            // Compatibilite avec les pages non refondues (404)
            'canvas.alt': {default: '#FFFFFF', _dark: '#171A21'},
            'surface.raised': {default: '#FFFFFF', _dark: '#171A21'},
            'accent.soft': {default: '#EEF1FD', _dark: '#1E2542'},
            'accent.line': {default: '#B4C2FF', _dark: '#3A4677'},
        },
    },
    styles: {
        global: {
            'html, body': {
                bg: 'canvas',
                color: 'fg.default',
            },
            '::placeholder': {color: 'fg.faint'},
            // Ancres : compense l'en-tete collant.
            'section[id], footer[id]': {scrollMarginTop: '80px'},
        },
    },
    components: {
        Heading: {
            baseStyle: {fontWeight: '700', letterSpacing: '-0.02em', color: 'fg.default'},
        },
        Button: {
            baseStyle: {fontWeight: '600', borderRadius: '10px'},
            sizes: {
                // Cibles tactiles >= 44px
                md: {h: '44px', minW: '44px', px: 5, fontSize: '15px'},
                lg: {h: '48px', minW: '48px', px: 6, fontSize: '16px'},
            },
            variants: {
                plein: {
                    bg: 'accent', color: 'accent.contrast',
                    _hover: {bg: 'accent.hover'},
                    _active: {bg: 'accent.hover'},
                },
                contour: {
                    bg: 'transparent', color: 'fg.default', border: '1px solid', borderColor: 'line.strong',
                    _hover: {borderColor: 'accent', color: 'accent'},
                },
                discret: {
                    bg: 'transparent', color: 'fg.muted',
                    _hover: {bg: 'chip.bg', color: 'accent'},
                },
            },
            defaultProps: {variant: 'plein', size: 'md'},
        },
        Link: {
            baseStyle: {
                color: 'accent',
                _hover: {textDecoration: 'underline', textUnderlineOffset: '3px'},
            },
        },
    },
})

export default theme

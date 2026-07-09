import React from 'react'
import ReactDOM from 'react-dom/client'
import './i18n';
import './index.css'
import App from './App'
import {ChakraProvider, ColorModeScript, extendTheme} from '@chakra-ui/react'

const config = {
    initialColorMode: 'light',
    useSystemColorMode: false,
}

// Ink-blue accent scale — one considered accent, no teal, no AI gradient.
const brand = {
    50:  '#eef2f9',
    100: '#d6e0f1',
    200: '#b4c6e4',
    300: '#8ba7d3',
    400: '#5c7cb0',
    500: '#2f4a7c',
    600: '#284067',
    700: '#213453',
    800: '#1b2a42',
    900: '#151f30',
}

const theme = extendTheme({
    config,
    fonts: {
        heading: "'Fraunces', Georgia, 'Times New Roman', serif",
        body: "'IBM Plex Sans', system-ui, -apple-system, sans-serif",
        mono: "'IBM Plex Mono', ui-monospace, monospace",
    },
    colors: {
        brand,
    },
    semanticTokens: {
        colors: {
            // Surfaces — warm paper in light, warm ink in dark. Consistent throughout.
            canvas:            {default: '#f7f4ef', _dark: '#161519'},
            'canvas.alt':      {default: '#efeae1', _dark: '#1b1a20'},
            surface:           {default: '#fffdf9', _dark: '#201e26'},
            'surface.raised':  {default: '#ffffff', _dark: '#27242d'},
            // Borders / hairlines
            'line.subtle':     {default: '#e7dfd2', _dark: 'rgba(255,255,255,0.09)'},
            'line.strong':     {default: '#d7cdbc', _dark: 'rgba(255,255,255,0.16)'},
            // Text
            'fg.default':      {default: '#1c1b18', _dark: '#f3f0ea'},
            'fg.muted':        {default: '#6c665c', _dark: '#a6a199'},
            'fg.faint':        {default: '#948d81', _dark: '#7d776e'},
            // Accent
            accent:            {default: 'brand.500', _dark: 'brand.300'},
            'accent.soft':     {default: 'rgba(47,74,124,0.10)', _dark: 'rgba(157,180,224,0.14)'},
            'accent.line':     {default: 'rgba(47,74,124,0.28)', _dark: 'rgba(157,180,224,0.32)'},
            // Translucent chrome (navbar / footer over blurred backdrop)
            'chrome.bg':       {default: 'rgba(247,244,239,0.82)', _dark: 'rgba(22,21,25,0.82)'},
        },
    },
    styles: {
        global: {
            'html, body': {
                bg: 'canvas',
                color: 'fg.default',
            },
            '::placeholder': {
                color: 'fg.faint',
            },
        },
    },
    components: {
        Heading: {
            baseStyle: {
                fontWeight: '600',
                letterSpacing: '-0.02em',
            },
        },
        Button: {
            baseStyle: {
                fontWeight: '500',
                letterSpacing: '0',
            },
            defaultProps: {
                colorScheme: 'brand',
            },
        },
        Link: {
            baseStyle: {
                _hover: {textDecoration: 'none'},
            },
        },
    },
})

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ChakraProvider theme={theme}>
            <ColorModeScript initialColorMode={theme.config.initialColorMode}/>
            <App/>
        </ChakraProvider>
    </React.StrictMode>,
)

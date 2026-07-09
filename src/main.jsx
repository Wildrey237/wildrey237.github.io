import React from 'react'
import ReactDOM from 'react-dom/client'
import './i18n';
import './index.css'
import App from './App'
import {ChakraProvider, ColorModeScript, extendTheme} from '@chakra-ui/react'

const config = {
    initialColorMode: 'dark',
    useSystemColorMode: false,
}

// Primary accent — an electric periwinkle blue (functions/links in a code theme).
const brand = {
    50:  '#eef1ff',
    100: '#dbe2ff',
    200: '#b9c6ff',
    300: '#8fa2ff',
    400: '#6d82ff',
    500: '#4f66f5',
    600: '#3d51db',
    700: '#3040ad',
    800: '#28368a',
    900: '#232f6e',
}

const theme = extendTheme({
    config,
    fonts: {
        heading: "'Space Grotesk', system-ui, sans-serif",
        body: "'IBM Plex Sans', system-ui, -apple-system, sans-serif",
        mono: "'JetBrains Mono', ui-monospace, monospace",
    },
    colors: {
        brand,
    },
    semanticTokens: {
        colors: {
            // Surfaces — deep ink terminal in dark, clean light IDE in light.
            canvas:            {default: '#f6f7fb', _dark: '#0b0d14'},
            'canvas.alt':      {default: '#eef0f7', _dark: '#0f1220'},
            surface:           {default: '#ffffff', _dark: '#151826'},
            'surface.raised':  {default: '#ffffff', _dark: '#1b1f30'},
            // Hairlines
            'line.subtle':     {default: '#e4e7f0', _dark: 'rgba(255,255,255,0.08)'},
            'line.strong':     {default: '#d3d7e6', _dark: 'rgba(255,255,255,0.15)'},
            // Text
            'fg.default':      {default: '#171a26', _dark: '#e8e9f4'},
            'fg.muted':        {default: '#565b73', _dark: '#9497b3'},
            'fg.faint':        {default: '#8b8fa8', _dark: '#5f6480'},
            // Primary accent
            accent:            {default: '#3d51db', _dark: 'brand.300'},
            'accent.soft':     {default: 'rgba(79,102,245,0.10)', _dark: 'rgba(143,162,255,0.14)'},
            'accent.line':     {default: 'rgba(79,102,245,0.30)', _dark: 'rgba(143,162,255,0.34)'},
            // Curated syntax palette — joyful but assigned by role, like code highlighting.
            'syntax.green':    {default: '#1a7f37', _dark: '#7ee787'},
            'syntax.blue':     {default: '#0969da', _dark: '#79b8ff'},
            'syntax.purple':   {default: '#8250df', _dark: '#c297ff'},
            'syntax.amber':    {default: '#bc4c00', _dark: '#ffbf5f'},
            'syntax.pink':     {default: '#bf3989', _dark: '#ff9ec7'},
            'syntax.cyan':     {default: '#1b7c83', _dark: '#66d9e8'},
            'syntax.red':      {default: '#cf222e', _dark: '#ff7b72'},
            // Translucent chrome (navbar / footer)
            'chrome.bg':       {default: 'rgba(246,247,251,0.82)', _dark: 'rgba(11,13,20,0.82)'},
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

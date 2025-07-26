import React from 'react'
import ReactDOM from 'react-dom/client'
import './i18n'; // AJOUTE CETTE LIGNE AVANT App
import App from './App'
import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react'

// Thème avec support du mode sombre activé par défaut
const config = {
    initialColorMode: 'light',
    useSystemColorMode: false,
}

const theme = extendTheme({ config })

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ChakraProvider theme={theme}>
            <ColorModeScript initialColorMode={theme.config.initialColorMode} />
            <App />
        </ChakraProvider>
    </React.StrictMode>,
)
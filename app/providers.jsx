'use client'

import {CacheProvider} from '@chakra-ui/next-js'
import {ChakraProvider, ColorModeScript, cookieStorageManager} from '@chakra-ui/react'
import theme from '../src/theme'
import '../src/i18n'

export function Providers({children}) {
    return (
        <CacheProvider>
            {/* Script bloquant : lit le cookie (sinon prefers-color-scheme) et pose la classe
                du theme avant l'affichage, pour eviter le flash clair/sombre. */}
            <ColorModeScript initialColorMode={theme.config.initialColorMode} type="cookie"/>
            <ChakraProvider theme={theme} colorModeManager={cookieStorageManager}>
                {children}
            </ChakraProvider>
        </CacheProvider>
    )
}

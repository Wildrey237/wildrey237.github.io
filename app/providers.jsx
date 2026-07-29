'use client'

import {CacheProvider} from '@chakra-ui/next-js'
import {ChakraProvider, ColorModeScript} from '@chakra-ui/react'
import theme from '../src/theme'
import '../src/i18n'

export function Providers({children}) {
    return (
        <CacheProvider>
            <ColorModeScript initialColorMode={theme.config.initialColorMode}/>
            <ChakraProvider theme={theme}>
                {children}
            </ChakraProvider>
        </CacheProvider>
    )
}

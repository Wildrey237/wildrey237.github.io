'use client'

import {useEffect, useState} from 'react'
import App from '../src/App'

export default function Page() {
    // i18next detects the language on the client (navigator/localStorage). The
    // server has no such context, so we render the translated tree only after
    // mount to avoid a hydration mismatch. Matches the previous CSR behaviour.
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    if (!mounted) {
        // Dark canvas placeholder (matches initialColorMode 'dark') — no white flash.
        return <div style={{minHeight: '100dvh', background: '#0b0d14'}} aria-hidden="true"/>
    }

    return <App/>
}

'use client'

import {useEffect} from 'react'
import App from '../src/App'
import i18n from '../src/i18n'
import {DonneesProvider} from '../src/data/DonneesContext'

export default function AccueilClient({donnees}) {
    // Le HTML est rendu cote serveur en francais (lng fixe dans src/i18n.js), donc lisible
    // sans JavaScript. Apres montage, changeLanguage() sans argument relance le detecteur
    // (querystring, localStorage, cookie, navigateur) et bascule si besoin vers l'anglais.
    useEffect(() => {
        i18n.changeLanguage()
    }, [])

    return (
        <DonneesProvider donnees={donnees}>
            <App/>
        </DonneesProvider>
    )
}

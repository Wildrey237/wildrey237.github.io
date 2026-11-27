'use client'

import {createContext, useContext} from 'react'
import {useTranslation} from 'react-i18next'

// Donnees de l'accueil lues cote serveur (MongoDB) et transmises au client : {fr, en}.
const DonneesContext = createContext(null)

export function DonneesProvider({donnees, children}) {
    return <DonneesContext.Provider value={donnees}>{children}</DonneesContext.Provider>
}

// Donnees de la langue active, au meme format que les anciens data-fr.json / data-en.json.
export function useDonnees() {
    const donnees = useContext(DonneesContext)
    const {i18n} = useTranslation()
    if (!donnees) throw new Error('useDonnees doit etre utilise sous <DonneesProvider>')
    return i18n.language === 'fr' ? donnees.fr : donnees.en
}

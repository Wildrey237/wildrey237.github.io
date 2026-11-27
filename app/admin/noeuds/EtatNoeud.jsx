'use client'

// Bouton segmente a 3 choix : enregistre l'etat au clic.
// Avec JavaScript : appel direct (pas de rechargement) et retour immediat.
// Sans JavaScript : chaque choix est un bouton d'envoi du formulaire (action serveur classique).
import {useState, useTransition} from 'react'
import {changerEtatNoeud} from '../actions'

const CHOIX = [['non commence', 'Non commencé'], ['en cours', 'En cours'], ['maitrise', 'Maîtrisé']]

export default function EtatNoeud({id, titre, etatInitial}) {
    const [etat, setEtat] = useState(etatInitial)
    const [statut, setStatut] = useState('')
    const [enCours, demarrer] = useTransition()

    const choisir = (e, valeur) => {
        e.preventDefault()
        if (valeur === etat) return
        const avant = etat
        setEtat(valeur)
        setStatut('Enregistrement…')
        demarrer(async () => {
            // Route d'API protegee (401 sans session), partagee avec /parcours.
            let r = null
            try {
                const rep = await fetch('/api/parcours/etat', {
                    method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({id, etat: valeur}),
                })
                r = await rep.json()
            } catch {
                r = {ok: false, erreur: 'réseau indisponible'}
            }
            if (r?.ok) setStatut('Enregistré')
            else {
                setEtat(avant)
                setStatut(`Échec : ${r?.erreur ?? 'erreur inconnue'}`)
            }
        })
    }

    return (
        <form action={changerEtatNoeud} className="admin-ligne" style={{gap: 12}}>
            <input type="hidden" name="id" value={id}/>
            <div className="admin-segmente" role="group" aria-label={`État de ${titre}`}>
                {CHOIX.map(([valeur, libelle]) => (
                    <button key={valeur} type="submit" name="etat" value={valeur} aria-pressed={etat === valeur}
                            disabled={enCours} onClick={e => choisir(e, valeur)}>
                        {libelle}
                    </button>
                ))}
            </div>
            <span className="admin-statut" role="status" aria-live="polite">{statut}</span>
        </form>
    )
}

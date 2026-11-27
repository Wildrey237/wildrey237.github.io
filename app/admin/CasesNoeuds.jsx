import {BANDES} from '../../src/lib/donnees/schemas'

const NOMS_BANDES = {
    math: 'Mathématiques', ml: 'Machine / Deep Learning', graph: 'ML sur graphe',
    algo: 'Algorithmique', data: 'Données et production', proj: 'Projets d’apprentissage (carte)',
}

// Cases a cocher des noeuds de la carte, groupees par bande (formulaire sans JavaScript).
// noeuds : [{_id, bande, titre}] ; coches : ids deja selectionnes.
export default function CasesNoeuds({noeuds, coches = []}) {
    const selection = new Set(coches)
    return BANDES.map(bande => {
        const liste = noeuds.filter(n => n.bande === bande)
        if (!liste.length) return null
        const nb = liste.filter(n => selection.has(n._id)).length
        return (
            <details key={bande} className="admin-repli" open={nb > 0}>
                <summary>{NOMS_BANDES[bande]}{nb > 0 && ` (${nb})`}</summary>
                <div className="admin-cases">
                    {liste.map(n => (
                        <label key={n._id}>
                            <input type="checkbox" name="noeuds" value={n._id} defaultChecked={selection.has(n._id)}/>
                            {n.titre.fr}&nbsp;<code>{n._id}</code>
                        </label>
                    ))}
                </div>
            </details>
        )
    })
}

export {NOMS_BANDES}

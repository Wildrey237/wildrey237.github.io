import Link from 'next/link'
import {getDb} from '../../../src/lib/mongodb'
import {exigerSession} from '../../../src/lib/admin/garde'
import {BANDES} from '../../../src/lib/donnees/schemas'
import Message from '../Message'
import {NOMS_BANDES} from '../CasesNoeuds'
import EtatNoeud from './EtatNoeud'

const formatDate = d => d ? new Date(d).toLocaleDateString('fr-FR', {timeZone: 'Europe/Paris'}) : '–'

export default async function AdminNoeuds({searchParams}) {
    await exigerSession()
    const {ok, erreur} = await searchParams
    const db = await getDb()
    const [noeuds, publies] = await Promise.all([
        db.collection('noeuds')
            .find({}, {projection: {bande: 1, titre: 1, etat: 1, etatModifieLe: 1, col: 1, row: 1}})
            .sort({col: 1, row: 1}).toArray(),
        // Projets du CV issus d'un projet d'apprentissage (action manuelle explicite).
        db.collection('projets').find({noeudOrigine: {$ne: null}}, {projection: {noeudOrigine: 1, titre: 1}}).toArray(),
    ])
    const dansLeCv = new Map(publies.filter(p => p.noeudOrigine).map(p => [p.noeudOrigine, p]))
    return (
        <>
            <h1>État des nœuds</h1>
            <p className="admin-doux">Un clic sur un état l’enregistre. Les projets d’apprentissage ne passent dans
                les projets du CV que par l’action « Ajouter aux projets du CV… ».</p>
            <Message ok={ok} erreur={erreur}/>
            {BANDES.map(bande => (
                <section key={bande} aria-labelledby={`bande-${bande}`}>
                    <h2 className="admin-titre-section" id={`bande-${bande}`}>{NOMS_BANDES[bande]}</h2>
                    <div className="admin-table-cadre">
                        <table>
                            <thead><tr><th>Nœud</th><th>État</th><th>Modifié le</th>{bande === 'proj' && <th>CV</th>}</tr></thead>
                            <tbody>
                            {noeuds.filter(n => n.bande === bande).map(n => (
                                <tr key={n._id}>
                                    <td>{n.titre.fr} <code>{n._id}</code></td>
                                    <td><EtatNoeud id={n._id} titre={n.titre.fr} etatInitial={n.etat}/></td>
                                    <td className="admin-doux">{formatDate(n.etatModifieLe)}</td>
                                    {bande === 'proj' && (
                                        <td>
                                            {dansLeCv.has(n._id) ? (
                                                <Link href={`/admin/projets/${encodeURIComponent(dansLeCv.get(n._id)._id)}`}>
                                                    Dans le CV : {dansLeCv.get(n._id).titre.fr}
                                                </Link>
                                            ) : (
                                                <Link className="admin-bouton-lien secondaire"
                                                      href={`/admin/projets/nouveau?depuis=${encodeURIComponent(n._id)}`}>
                                                    Ajouter aux projets du CV…
                                                </Link>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            ))}
        </>
    )
}

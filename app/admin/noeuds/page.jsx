import {getDb} from '../../../src/lib/mongodb'
import {exigerSession} from '../../../src/lib/admin/garde'
import {BANDES, ETATS_NOEUD} from '../../../src/lib/donnees/schemas'
import {changerEtatNoeud} from '../actions'
import Message from '../Message'
import {NOMS_BANDES} from '../CasesNoeuds'

const formatDate = d => d ? new Date(d).toLocaleDateString('fr-FR', {timeZone: 'Europe/Paris'}) : '-'
const classeEtat = e => e === 'en cours' ? 'en-cours' : e === 'maitrise' ? 'maitrise' : ''

export default async function AdminNoeuds({searchParams}) {
    await exigerSession()
    const {ok, erreur} = await searchParams
    const db = await getDb()
    const noeuds = await db.collection('noeuds')
        .find({}, {projection: {bande: 1, titre: 1, etat: 1, etatModifieLe: 1, col: 1, row: 1}})
        .sort({col: 1, row: 1}).toArray()
    return (
        <>
            <h1>Etat des noeuds</h1>
            <Message ok={ok} erreur={erreur}/>
            {BANDES.map(bande => (
                <section key={bande}>
                    <h2 id={bande}>{NOMS_BANDES[bande]}</h2>
                    <table>
                        <thead><tr><th>Noeud</th><th>Etat</th><th>Modifie le</th><th>Changer</th></tr></thead>
                        <tbody>
                        {noeuds.filter(n => n.bande === bande).map(n => (
                            <tr key={n._id}>
                                <td>{n.titre.fr} <code>{n._id}</code></td>
                                <td><span className={`admin-etat ${classeEtat(n.etat)}`}>{n.etat}</span></td>
                                <td className="admin-doux">{formatDate(n.etatModifieLe)}</td>
                                <td>
                                    <form action={changerEtatNoeud} className="admin-ligne">
                                        <input type="hidden" name="id" value={n._id}/>
                                        <select name="etat" defaultValue={n.etat} aria-label={`Etat de ${n._id}`}>
                                            {ETATS_NOEUD.map(e => <option key={e} value={e}>{e}</option>)}
                                        </select>
                                        <button type="submit" className="secondaire">OK</button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>
            ))}
        </>
    )
}

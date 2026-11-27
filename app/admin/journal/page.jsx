import {getDb} from '../../../src/lib/mongodb'
import {exigerSession} from '../../../src/lib/admin/garde'
import {enregistrerJournal, supprimerJournal} from '../actions'
import Message from '../Message'
import CasesNoeuds from '../CasesNoeuds'

// Date du jour a Paris, au format AAAA-MM-JJ.
const aujourdhui = () => new Intl.DateTimeFormat('fr-CA', {timeZone: 'Europe/Paris'}).format(new Date())

export default async function AdminJournal({searchParams}) {
    await exigerSession()
    const {ok, erreur} = await searchParams
    const db = await getDb()
    const [noeuds, entrees] = await Promise.all([
        db.collection('noeuds').find({}, {projection: {bande: 1, titre: 1}}).sort({col: 1, row: 1}).toArray(),
        db.collection('journal').find().sort({_id: -1}).limit(60).toArray(),
    ])
    const titres = Object.fromEntries(noeuds.map(n => [n._id, n.titre.fr]))
    return (
        <>
            <h1>Journal</h1>
            <Message ok={ok} erreur={erreur}/>
            <form action={enregistrerJournal} className="admin-carte">
                <p className="admin-doux">Une entree par jour : une nouvelle saisie sur une date existante la remplace.</p>
                <div className="admin-deux">
                    <div>
                        <label htmlFor="date">Date</label>
                        <input id="date" name="date" type="date" defaultValue={aujourdhui()} required/>
                    </div>
                    <div>
                        <label htmlFor="minutes">Minutes travaillees</label>
                        <input id="minutes" name="minutes" type="number" min="0" max="1440" step="5" required/>
                    </div>
                </div>
                <label>Noeuds travailles</label>
                <CasesNoeuds noeuds={noeuds}/>
                <label htmlFor="commentaire">Commentaire (prive)</label>
                <textarea id="commentaire" name="commentaire"/>
                <p><button type="submit">Enregistrer</button></p>
            </form>

            <h2>60 dernieres entrees</h2>
            <table>
                <thead><tr><th>Date</th><th>Minutes</th><th>Noeuds</th><th>Commentaire</th><th></th></tr></thead>
                <tbody>
                {entrees.length === 0 && <tr><td colSpan={5} className="admin-doux">Aucune entree.</td></tr>}
                {entrees.map(e => (
                    <tr key={e._id}>
                        <td><code>{e._id}</code></td>
                        <td>{e.minutes}</td>
                        <td>{e.noeuds.map(id => <span key={id} title={titres[id]}><code>{id}</code> </span>)}</td>
                        <td className="admin-doux">{e.commentaire}</td>
                        <td>
                            <form action={supprimerJournal}>
                                <input type="hidden" name="date" value={e._id}/>
                                <button type="submit" className="danger">Supprimer</button>
                            </form>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </>
    )
}

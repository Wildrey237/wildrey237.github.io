import Link from 'next/link'
import {getDb} from '../../../src/lib/mongodb'
import {exigerSession} from '../../../src/lib/admin/garde'
import Message from '../Message'

const STATUTS = {'a faire': 'À faire', 'en cours': 'En cours', livre: 'Livré'}

export default async function AdminProjets({searchParams}) {
    await exigerSession()
    const {ok, erreur} = await searchParams
    const db = await getDb()
    const projets = await db.collection('projets')
        .find({}, {projection: {titre: 1, cadre: 1, statut: 1, noeuds: 1, ordre: 1, noeudOrigine: 1}})
        .sort({ordre: 1}).toArray()
    return (
        <>
            <h1>Projets du CV</h1>
            <Message ok={ok} erreur={erreur}/>
            <p><Link href="/admin/projets/nouveau">+ Nouveau projet</Link></p>
            <div className="admin-table-cadre"><table>
                <thead><tr><th>#</th><th>Projet</th><th>Cadre</th><th>Statut</th><th>Nœuds</th><th>Origine</th></tr></thead>
                <tbody>
                {projets.map(p => (
                    <tr key={p._id}>
                        <td className="admin-doux">{p.ordre}</td>
                        <td><Link href={`/admin/projets/${encodeURIComponent(p._id)}`}>{p.titre.fr}</Link></td>
                        <td className="admin-doux">{p.cadre.fr}</td>
                        <td>{STATUTS[p.statut] ?? p.statut}</td>
                        <td className="admin-doux">{p.noeuds.length}</td>
                        <td className="admin-doux">{p.noeudOrigine ? <code>{p.noeudOrigine}</code> : 'saisi'}</td>
                    </tr>
                ))}
                </tbody>
            </table></div>
        </>
    )
}

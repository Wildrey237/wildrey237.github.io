import Link from 'next/link'
import {getDb} from '../../../src/lib/mongodb'
import {exigerSession} from '../../../src/lib/admin/garde'

export default async function AdminProjets() {
    await exigerSession()
    const db = await getDb()
    const projets = await db.collection('projets')
        .find({}, {projection: {titre: 1, cadre: 1, statut: 1, noeuds: 1, ordre: 1}})
        .sort({ordre: 1}).toArray()
    return (
        <>
            <h1>Projets de l&apos;accueil</h1>
            <table>
                <thead><tr><th>#</th><th>Projet</th><th>Cadre</th><th>Statut</th><th>Noeuds</th></tr></thead>
                <tbody>
                {projets.map(p => (
                    <tr key={p._id}>
                        <td className="admin-doux">{p.ordre}</td>
                        <td><Link href={`/admin/projets/${encodeURIComponent(p._id)}`}>{p.titre.fr}</Link></td>
                        <td className="admin-doux">{p.cadre.fr}</td>
                        <td>{p.statut}</td>
                        <td className="admin-doux">{p.noeuds.length}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </>
    )
}

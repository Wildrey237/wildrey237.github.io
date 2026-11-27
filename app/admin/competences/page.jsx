import Link from 'next/link'
import {getDb} from '../../../src/lib/mongodb'
import {exigerSession} from '../../../src/lib/admin/garde'
import Message from '../Message'
import {CATEGORIES_COMPETENCES} from '../../../src/lib/donnees/schemas'

export default async function AdminCompetences({searchParams}) {
    await exigerSession()
    const {ok, erreur} = await searchParams
    const db = await getDb()
    const competences = await db.collection('competences').find().sort({categorie: 1, ordre: 1}).toArray()
    return (
        <>
            <h1>Compétences</h1>
            <Message ok={ok} erreur={erreur}/>
            {CATEGORIES_COMPETENCES.map(c => (
                <section key={c}>
                    <h2>{c} <Link href={`/admin/competences/nouveau?categorie=${c}`} style={{fontSize: '.8rem', textTransform: 'none'}}>+ ajouter</Link></h2>
                    <div className="admin-table-cadre"><table>
                        <thead><tr><th>#</th><th>Compétence</th><th>Nœuds qui la prouvent</th></tr></thead>
                        <tbody>
                        {competences.filter(s => s.categorie === c).map(s => (
                            <tr key={s._id}>
                                <td className="admin-doux">{s.ordre}</td>
                                <td><Link href={`/admin/competences/${encodeURIComponent(s._id)}`}>{s.nom.fr}</Link></td>
                                <td className="admin-doux">{s.noeuds.join(', ') || '-'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table></div>
                </section>
            ))}
        </>
    )
}

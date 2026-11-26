import Link from 'next/link'
import {getDb} from '../../../src/lib/mongodb'
import {exigerSession} from '../../../src/lib/admin/garde'
import {CATEGORIES_COMPETENCES} from '../../../src/lib/donnees/schemas'

export default async function AdminCompetences() {
    await exigerSession()
    const db = await getDb()
    const competences = await db.collection('competences').find().sort({categorie: 1, ordre: 1}).toArray()
    return (
        <>
            <h1>Competences</h1>
            {CATEGORIES_COMPETENCES.map(c => (
                <section key={c}>
                    <h2>{c}</h2>
                    <table>
                        <thead><tr><th>#</th><th>Competence</th><th>Noeuds qui la prouvent</th></tr></thead>
                        <tbody>
                        {competences.filter(s => s.categorie === c).map(s => (
                            <tr key={s._id}>
                                <td className="admin-doux">{s.ordre}</td>
                                <td><Link href={`/admin/competences/${encodeURIComponent(s._id)}`}>{s.nom.fr}</Link></td>
                                <td className="admin-doux">{s.noeuds.join(', ') || '-'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>
            ))}
        </>
    )
}

import Link from 'next/link'
import {getDb} from '../../../src/lib/mongodb'
import {exigerSession} from '../../../src/lib/admin/garde'
import {formaterPeriode} from '../../../src/lib/donnees/dates'
import Message from '../Message'

export default async function AdminExperiences({searchParams}) {
    await exigerSession()
    const {ok, erreur} = await searchParams
    const liste = await (await getDb()).collection('experiences').find().sort({ordre: 1}).toArray()
    return (
        <>
            <h1>Experiences</h1>
            <Message ok={ok} erreur={erreur}/>
            <p><Link href="/admin/experiences/nouveau">+ Nouvelle experience</Link></p>
            <table>
                <thead><tr><th>#</th><th>Poste</th><th>Entreprise</th><th>Periode</th></tr></thead>
                <tbody>
                {liste.map(e => (
                    <tr key={e._id}>
                        <td className="admin-doux">{e.ordre}</td>
                        <td><Link href={`/admin/experiences/${encodeURIComponent(e._id)}`}>{e.poste.fr}</Link></td>
                        <td>{e.entreprise.fr}</td>
                        <td className="admin-doux">{formaterPeriode(e.debut, e.fin, 'fr')}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </>
    )
}

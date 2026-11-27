import Link from 'next/link'
import {getDb} from '../../../src/lib/mongodb'
import {exigerSession} from '../../../src/lib/admin/garde'
import {formaterPeriode} from '../../../src/lib/donnees/dates'
import Message from '../Message'

export default async function AdminFormations({searchParams}) {
    await exigerSession()
    const {ok, erreur} = await searchParams
    const liste = await (await getDb()).collection('formations').find().sort({ordre: 1}).toArray()
    return (
        <>
            <h1>Formations</h1>
            <Message ok={ok} erreur={erreur}/>
            <p><Link href="/admin/formations/nouveau">+ Nouvelle formation</Link></p>
            <div className="admin-table-cadre"><table>
                <thead><tr><th>#</th><th>École</th><th>Diplôme</th><th>Période</th></tr></thead>
                <tbody>
                {liste.map(f => (
                    <tr key={f._id}>
                        <td className="admin-doux">{f.ordre}</td>
                        <td><Link href={`/admin/formations/${encodeURIComponent(f._id)}`}>{f.ecole.fr}</Link></td>
                        <td className="admin-doux">{f.diplome.fr}</td>
                        <td className="admin-doux">{formaterPeriode(f.debut, f.fin, 'fr')}{f.enCours && ' (en cours)'}</td>
                    </tr>
                ))}
                </tbody>
            </table></div>
        </>
    )
}

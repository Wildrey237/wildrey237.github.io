import Link from 'next/link'
import {getDb} from '../../../src/lib/mongodb'
import {exigerSession} from '../../../src/lib/admin/garde'
import Message from '../Message'

export default async function AdminCertifications({searchParams}) {
    await exigerSession()
    const {ok, erreur} = await searchParams
    const liste = await (await getDb()).collection('certifications').find().sort({ordre: 1}).toArray()
    return (
        <>
            <h1>Certifications</h1>
            <Message ok={ok} erreur={erreur}/>
            <p><Link href="/admin/certifications/nouveau">+ Nouvelle certification</Link></p>
            <table>
                <thead><tr><th>#</th><th>Certification</th><th>Organisme</th><th>Lien</th></tr></thead>
                <tbody>
                {liste.map(c => (
                    <tr key={c._id}>
                        <td className="admin-doux">{c.ordre}</td>
                        <td><Link href={`/admin/certifications/${encodeURIComponent(c._id)}`}>{c.nom}</Link></td>
                        <td className="admin-doux">{c.organisme}</td>
                        <td className="admin-doux">{c.lien ? 'oui' : '-'}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </>
    )
}

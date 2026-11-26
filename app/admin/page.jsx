import Link from 'next/link'
import {getDb} from '../../src/lib/mongodb'
import {exigerSession} from '../../src/lib/admin/garde'
import {ETATS_NOEUD} from '../../src/lib/donnees/schemas'

export default async function TableauDeBord() {
    await exigerSession()
    const db = await getDb()
    // Compteurs calcules a la lecture (jamais stockes).
    const [parEtat, journal, projets, competences] = await Promise.all([
        db.collection('noeuds').aggregate([{$group: {_id: '$etat', n: {$sum: 1}}}]).toArray(),
        db.collection('journal').aggregate([{$group: {_id: null, jours: {$sum: 1}, minutes: {$sum: '$minutes'}}}]).toArray(),
        db.collection('projets').countDocuments(),
        db.collection('competences').countDocuments(),
    ])
    const etats = Object.fromEntries(parEtat.map(e => [e._id, e.n]))
    const j = journal[0] ?? {jours: 0, minutes: 0}
    return (
        <>
            <h1>Tableau de bord</h1>
            <div className="admin-grille">
                {ETATS_NOEUD.map(e => (
                    <Link key={e} href="/admin/noeuds" className="admin-carte">
                        <span className="admin-chiffre">{etats[e] ?? 0}</span>noeuds &laquo; {e} &raquo;
                    </Link>
                ))}
                <Link href="/admin/journal" className="admin-carte">
                    <span className="admin-chiffre">{j.jours}</span>jours, {Math.round(j.minutes / 60)} h au journal
                </Link>
                <Link href="/admin/projets" className="admin-carte"><span className="admin-chiffre">{projets}</span>projets</Link>
                <Link href="/admin/competences" className="admin-carte"><span className="admin-chiffre">{competences}</span>competences</Link>
            </div>
        </>
    )
}

import Link from 'next/link'
import {getDb} from '../../src/lib/mongodb'
import {exigerSession} from '../../src/lib/admin/garde'

// Date AAAA-MM-JJ a Paris, decalee de "jours" jours.
function jourParis(decalage = 0) {
    const d = new Date(Date.now() + decalage * 86400000)
    return new Intl.DateTimeFormat('fr-CA', {timeZone: 'Europe/Paris'}).format(d)
}

const CV = [
    ['experiences', 'Expériences', '/admin/experiences'],
    ['formations', 'Formations', '/admin/formations'],
    ['projets', 'Projets du CV', '/admin/projets'],
    ['competences', 'Compétences', '/admin/competences'],
    ['certifications', 'Certifications', '/admin/certifications'],
]

export default async function TableauDeBord() {
    await exigerSession()
    const db = await getDb()
    const debut = jourParis(-29)
    // Compteurs calcules a la lecture (jamais stockes).
    const [enCours, maitrises, journal, ...comptes] = await Promise.all([
        db.collection('noeuds').find({etat: 'en cours'}, {projection: {titre: 1, bande: 1}}).sort({etatModifieLe: -1}).toArray(),
        db.collection('noeuds').aggregate([
            {$match: {etat: 'maitrise'}},
            {$group: {_id: {$eq: ['$bande', 'proj']}, n: {$sum: 1}}},
        ]).toArray(),
        db.collection('journal').find({_id: {$gte: debut}}).sort({_id: 1}).toArray(),
        ...CV.map(([c]) => db.collection(c).countDocuments()),
    ])
    const totalCours = await db.collection('noeuds').countDocuments({bande: {$ne: 'proj'}})
    const maitrisesCours = maitrises.find(m => m._id === false)?.n ?? 0
    const maitrisesProjets = maitrises.find(m => m._id === true)?.n ?? 0

    // Journal : une barre par jour sur 30 jours (vide = aucun travail ce jour-la).
    const parJour = new Map(journal.map(j => [j._id, j.minutes]))
    const jours = Array.from({length: 30}, (_, i) => jourParis(i - 29))
    const max = Math.max(60, ...journal.map(j => j.minutes))
    const minutes = journal.reduce((s, j) => s + j.minutes, 0)

    return (
        <>
            <h1>Tableau de bord</h1>
            <div className="admin-grille">
                <section className="admin-carte" aria-labelledby="tb-en-cours">
                    <span className="admin-etiquette" id="tb-en-cours">Nœuds en cours</span>
                    <span className="admin-chiffre">{enCours.length}</span>
                    {enCours.length ? (
                        <ul className="admin-liste-simple">
                            {enCours.slice(0, 5).map(n => <li key={n._id}>{n.titre.fr}</li>)}
                        </ul>
                    ) : <p className="admin-doux">Aucun nœud en cours.</p>}
                    <p style={{marginBottom: 0}}><Link href="/parcours">Voir la carte</Link></p>
                </section>

                <section className="admin-carte" aria-labelledby="tb-maitrises">
                    <span className="admin-etiquette" id="tb-maitrises">Nœuds maîtrisés</span>
                    <span className="admin-chiffre">{maitrisesCours} <small style={{fontSize: 16, fontWeight: 500}}>/ {totalCours}</small></span>
                    <p className="admin-doux" style={{margin: 0}}>
                        nœuds de cours{maitrisesProjets > 0 && `, plus ${maitrisesProjets} projet(s) d’apprentissage`}
                    </p>
                    <p style={{marginBottom: 0}}><Link href="/admin/noeuds">Gérer les nœuds</Link></p>
                </section>

                <section className="admin-carte" aria-labelledby="tb-journal">
                    <span className="admin-etiquette" id="tb-journal">Journal · 30 derniers jours</span>
                    <span className="admin-chiffre">{journal.length} <small style={{fontSize: 16, fontWeight: 500}}>jour(s)</small></span>
                    <p className="admin-doux" style={{margin: 0}}>{Math.floor(minutes / 60)} h {minutes % 60} min travaillées</p>
                    <div className="admin-barres" role="img"
                         aria-label={`Minutes travaillées par jour sur 30 jours, du ${jours[0]} au ${jours[29]}`}>
                        {jours.map(j => {
                            const m = parJour.get(j) ?? 0
                            return <span key={j} title={`${j} : ${m} min`} data-vide={m ? undefined : ''}
                                         style={{height: `${m ? Math.max(8, (100 * m) / max) : 4}%`}}/>
                        })}
                    </div>
                    <p style={{marginBottom: 0}}><Link href="/admin/journal">Ajouter une entrée</Link></p>
                </section>

                <section className="admin-carte" aria-labelledby="tb-cv">
                    <span className="admin-etiquette" id="tb-cv">Contenu du CV</span>
                    <ul className="admin-liste-simple">
                        {CV.map(([c, libelle, href], i) => (
                            <li key={c} className="admin-ligne" style={{justifyContent: 'space-between'}}>
                                <Link href={href}>{libelle}</Link><strong>{comptes[i]}</strong>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </>
    )
}

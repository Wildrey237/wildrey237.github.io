import Link from 'next/link'
import {notFound} from 'next/navigation'
import {getDb} from '../../../../src/lib/mongodb'
import {exigerSession} from '../../../../src/lib/admin/garde'
import {STATUTS_PROJET} from '../../../../src/lib/donnees/schemas'
import {modifierProjet} from '../../actions'
import Message from '../../Message'
import ChampBilingue from '../../ChampBilingue'
import CasesNoeuds from '../../CasesNoeuds'

export default async function ModifierProjet({params, searchParams}) {
    await exigerSession()
    const {id} = await params
    const {ok, erreur} = await searchParams
    const db = await getDb()
    const [p, noeuds] = await Promise.all([
        db.collection('projets').findOne({_id: decodeURIComponent(id)}),
        db.collection('noeuds').find({}, {projection: {bande: 1, titre: 1}}).sort({col: 1, row: 1}).toArray(),
    ])
    if (!p) notFound()
    return (
        <>
            <p><Link href="/admin/projets">&larr; Projets</Link></p>
            <h1>{p.titre.fr}</h1>
            <Message ok={ok} erreur={erreur}/>
            <form action={modifierProjet} className="admin-carte">
                <input type="hidden" name="id" value={p._id}/>
                <p className="admin-doux">Identifiant : <code>{p._id}</code></p>
                <ChampBilingue nom="titre" libelle="Titre" valeur={p.titre}/>
                <ChampBilingue nom="description" libelle="Description" valeur={p.description} long/>
                <ChampBilingue nom="cadre" libelle="Cadre" valeur={p.cadre}/>
                <ChampBilingue nom="tags" libelle="Tags" valeur={p.tags} liste/>
                <div className="admin-deux">
                    <div>
                        <label htmlFor="statut">Statut</label>
                        <select id="statut" name="statut" defaultValue={p.statut}>
                            {STATUTS_PROJET.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="ordre">Ordre d&apos;affichage</label>
                        <input id="ordre" name="ordre" type="number" min="0" defaultValue={p.ordre} required/>
                    </div>
                    <div>
                        <label htmlFor="badge">Badge (vide = aucun)</label>
                        <input id="badge" name="badge" defaultValue={p.badge ?? ''}/>
                    </div>
                    <div>
                        <label htmlFor="icone">Icone (nom Lucide)</label>
                        <input id="icone" name="icone" defaultValue={p.icone} required/>
                    </div>
                </div>
                <label htmlFor="lien">Lien (vide = aucun)</label>
                <input id="lien" name="lien" type="url" defaultValue={p.lien ?? ''}/>
                <label>Noeuds mobilises</label>
                <CasesNoeuds noeuds={noeuds} coches={p.noeuds}/>
                <p><button type="submit">Enregistrer</button></p>
            </form>
        </>
    )
}

import Link from 'next/link'
import {notFound} from 'next/navigation'
import {getDb} from '../../../../src/lib/mongodb'
import {exigerSession} from '../../../../src/lib/admin/garde'
import {CATEGORIES_COMPETENCES} from '../../../../src/lib/donnees/schemas'
import {modifierCompetence} from '../../actions'
import Message from '../../Message'
import ChampBilingue from '../../ChampBilingue'
import CasesNoeuds from '../../CasesNoeuds'

export default async function ModifierCompetence({params, searchParams}) {
    await exigerSession()
    const {id} = await params
    const {ok, erreur} = await searchParams
    const db = await getDb()
    const [s, noeuds] = await Promise.all([
        db.collection('competences').findOne({_id: decodeURIComponent(id)}),
        db.collection('noeuds').find({}, {projection: {bande: 1, titre: 1}}).sort({col: 1, row: 1}).toArray(),
    ])
    if (!s) notFound()
    return (
        <>
            <p><Link href="/admin/competences">&larr; Competences</Link></p>
            <h1>{s.nom.fr}</h1>
            <Message ok={ok} erreur={erreur}/>
            <form action={modifierCompetence} className="admin-carte">
                <input type="hidden" name="id" value={s._id}/>
                <p className="admin-doux">Identifiant : <code>{s._id}</code></p>
                <ChampBilingue nom="nom" libelle="Nom" valeur={s.nom}/>
                <ChampBilingue nom="description" libelle="Description" valeur={s.description} long/>
                <div className="admin-deux">
                    <div>
                        <label htmlFor="categorie">Categorie</label>
                        <select id="categorie" name="categorie" defaultValue={s.categorie}>
                            {CATEGORIES_COMPETENCES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="ordre">Ordre dans la categorie</label>
                        <input id="ordre" name="ordre" type="number" min="0" defaultValue={s.ordre} required/>
                    </div>
                </div>
                <label>Noeuds qui prouvent cette competence</label>
                <CasesNoeuds noeuds={noeuds} coches={s.noeuds}/>
                <p><button type="submit">Enregistrer</button></p>
            </form>
        </>
    )
}

import Link from 'next/link'
import {notFound} from 'next/navigation'
import {getDb} from '../../../../src/lib/mongodb'
import {exigerSession} from '../../../../src/lib/admin/garde'
import {listeNoeuds} from '../../../../src/lib/admin/pages'
import {CATEGORIES_COMPETENCES} from '../../../../src/lib/donnees/schemas'
import {enregistrerCompetence} from '../../actions'
import Message from '../../Message'
import ChampBilingue from '../../ChampBilingue'
import CasesNoeuds from '../../CasesNoeuds'
import Suppression from '../../Suppression'

export default async function FicheCompetence({params, searchParams}) {
    await exigerSession()
    const id = decodeURIComponent((await params).id)
    const {ok, erreur, categorie} = await searchParams
    const nouveau = id === 'nouveau'
    const [s, noeuds] = await Promise.all([
        nouveau
            ? {categorie: CATEGORIES_COMPETENCES.includes(categorie) ? categorie : 'ai', ordre: 99, noeuds: []}
            : (async () => (await getDb()).collection('competences').findOne({_id: id}))(),
        listeNoeuds(),
    ])
    if (!s) notFound()
    return (
        <>
            <p><Link href="/admin/competences">&larr; Compétences</Link></p>
            <h1>{nouveau ? 'Nouvelle compétence' : s.nom.fr}</h1>
            <Message ok={ok} erreur={erreur}/>
            <form action={enregistrerCompetence} className="admin-carte">
                <input type="hidden" name="id" value={nouveau ? '' : s._id}/>
                {!nouveau && <p className="admin-doux">Identifiant : <code>{s._id}</code></p>}
                <ChampBilingue nom="nom" libelle="Nom" valeur={s.nom}/>
                <ChampBilingue nom="description" libelle="Description" valeur={s.description} long/>
                <div className="admin-deux">
                    <div>
                        <label htmlFor="categorie">Catégorie</label>
                        <select id="categorie" name="categorie" defaultValue={s.categorie}>
                            {CATEGORIES_COMPETENCES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="ordre">Ordre dans la catégorie</label>
                        <input id="ordre" name="ordre" type="number" min="0" defaultValue={s.ordre} required/>
                    </div>
                </div>
                <label>Nœuds qui prouvent cette compétence</label>
                <CasesNoeuds noeuds={noeuds} coches={s.noeuds}/>
                <p><button type="submit">{nouveau ? 'Créer' : 'Enregistrer'}</button></p>
            </form>
            {!nouveau && <Suppression collection="competences" id={s._id} libelle={`"${s.nom.fr}"`}/>}
        </>
    )
}

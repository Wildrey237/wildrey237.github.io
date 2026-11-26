import Link from 'next/link'
import {notFound} from 'next/navigation'
import {getDb} from '../../../../src/lib/mongodb'
import {exigerSession} from '../../../../src/lib/admin/garde'
import {listeNoeuds, ordreSuivant} from '../../../../src/lib/admin/pages'
import {STATUTS_PROJET} from '../../../../src/lib/donnees/schemas'
import {enregistrerProjet} from '../../actions'
import Message from '../../Message'
import ChampBilingue from '../../ChampBilingue'
import CasesNoeuds from '../../CasesNoeuds'
import Suppression from '../../Suppression'

export default async function FicheProjet({params, searchParams}) {
    await exigerSession()
    const id = decodeURIComponent((await params).id)
    const {ok, erreur} = await searchParams
    const nouveau = id === 'nouveau'
    const [p, noeuds] = await Promise.all([
        nouveau
            ? ordreSuivant('projets').then(ordre => ({ordre, statut: 'livre', noeuds: []}))
            : (async () => (await getDb()).collection('projets').findOne({_id: id}))(),
        listeNoeuds(),
    ])
    if (!p) notFound()
    return (
        <>
            <p><Link href="/admin/projets">&larr; Projets</Link></p>
            <h1>{nouveau ? 'Nouveau projet' : p.titre.fr}</h1>
            <Message ok={ok} erreur={erreur}/>
            <form action={enregistrerProjet} className="admin-carte">
                <input type="hidden" name="id" value={nouveau ? '' : p._id}/>
                {!nouveau && <p className="admin-doux">Identifiant : <code>{p._id}</code></p>}
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
                        <label htmlFor="ordre">Ordre d&apos;affichage (0 = en premier)</label>
                        <input id="ordre" name="ordre" type="number" min="0" defaultValue={p.ordre} required/>
                    </div>
                    <div>
                        <label htmlFor="badge">Badge (vide = aucun)</label>
                        <input id="badge" name="badge" defaultValue={p.badge ?? ''}/>
                    </div>
                    <div>
                        <label htmlFor="icone">Icone (nom Lucide, ex. Brain)</label>
                        <input id="icone" name="icone" defaultValue={p.icone ?? ''} required/>
                    </div>
                </div>
                <label htmlFor="lien">Lien (vide = aucun)</label>
                <input id="lien" name="lien" defaultValue={p.lien ?? ''}/>
                <label>Noeuds mobilises</label>
                <CasesNoeuds noeuds={noeuds} coches={p.noeuds}/>
                <p><button type="submit">{nouveau ? 'Creer' : 'Enregistrer'}</button></p>
            </form>
            {!nouveau && <Suppression collection="projets" id={p._id} libelle={`"${p.titre.fr}"`}/>}
        </>
    )
}

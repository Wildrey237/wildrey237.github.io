import Link from 'next/link'
import {notFound} from 'next/navigation'
import {getDb} from '../../../../src/lib/mongodb'
import {exigerSession} from '../../../../src/lib/admin/garde'
import {ordreSuivant} from '../../../../src/lib/admin/pages'
import {enregistrerExperience} from '../../actions'
import Message from '../../Message'
import ChampBilingue from '../../ChampBilingue'
import ChampPeriode from '../../ChampPeriode'
import Suppression from '../../Suppression'

export default async function FicheExperience({params, searchParams}) {
    await exigerSession()
    const id = decodeURIComponent((await params).id)
    const {ok, erreur} = await searchParams
    const nouveau = id === 'nouveau'
    const e = nouveau
        ? {ordre: await ordreSuivant('experiences')}
        : await (await getDb()).collection('experiences').findOne({_id: id})
    if (!e) notFound()
    return (
        <>
            <p><Link href="/admin/experiences">&larr; Experiences</Link></p>
            <h1>{nouveau ? 'Nouvelle experience' : e.poste.fr}</h1>
            <Message ok={ok} erreur={erreur}/>
            <form action={enregistrerExperience} className="admin-carte">
                <input type="hidden" name="id" value={nouveau ? '' : e._id}/>
                {!nouveau && <p className="admin-doux">Identifiant : <code>{e._id}</code></p>}
                <ChampBilingue nom="poste" libelle="Poste" valeur={e.poste}/>
                <ChampBilingue nom="entreprise" libelle="Entreprise" valeur={e.entreprise}/>
                <ChampPeriode debut={e.debut} fin={e.fin}/>
                <div className="admin-deux">
                    <div>
                        <label htmlFor="ville">Ville</label>
                        <input id="ville" name="ville" defaultValue={e.ville ?? ''} required/>
                    </div>
                    <div>
                        <label htmlFor="ordre">Ordre d&apos;affichage (0 = en haut)</label>
                        <input id="ordre" name="ordre" type="number" min="0" defaultValue={e.ordre} required/>
                    </div>
                    <div>
                        <label htmlFor="siteWeb">Site web (vide = aucun)</label>
                        <input id="siteWeb" name="siteWeb" defaultValue={e.siteWeb ?? ''}/>
                    </div>
                    <div>
                        <label htmlFor="logo">Logo (/logos/xxx.png ou URL)</label>
                        <input id="logo" name="logo" defaultValue={e.logo ?? ''}/>
                    </div>
                </div>
                <ChampBilingue nom="description" libelle="Description" valeur={e.description} long/>
                <ChampBilingue nom="descriptionDetail" libelle="Detail (bouton Voir le detail)" valeur={e.descriptionDetail} long requis={false}/>
                <ChampBilingue nom="tags" libelle="Tags" valeur={e.tags} liste/>
                <p><button type="submit">{nouveau ? 'Creer' : 'Enregistrer'}</button></p>
            </form>
            {!nouveau && <Suppression collection="experiences" id={e._id} libelle={`"${e.poste.fr}"`}/>}
        </>
    )
}

import Link from 'next/link'
import {notFound} from 'next/navigation'
import {getDb} from '../../../../src/lib/mongodb'
import {exigerSession} from '../../../../src/lib/admin/garde'
import {ordreSuivant} from '../../../../src/lib/admin/pages'
import {enregistrerFormation} from '../../actions'
import Message from '../../Message'
import ChampBilingue from '../../ChampBilingue'
import ChampPeriode from '../../ChampPeriode'
import Suppression from '../../Suppression'
import ChampLogo from '../../ChampLogo'

export default async function FicheFormation({params, searchParams}) {
    await exigerSession()
    const id = decodeURIComponent((await params).id)
    const {ok, erreur} = await searchParams
    const nouveau = id === 'nouveau'
    const f = nouveau
        ? {ordre: await ordreSuivant('formations'), enCours: false}
        : await (await getDb()).collection('formations').findOne({_id: id})
    if (!f) notFound()
    return (
        <>
            <p><Link href="/admin/formations">&larr; Formations</Link></p>
            <h1>{nouveau ? 'Nouvelle formation' : f.ecole.fr}</h1>
            <Message ok={ok} erreur={erreur}/>
            <form action={enregistrerFormation} className="admin-carte">
                <input type="hidden" name="id" value={nouveau ? '' : f._id}/>
                {!nouveau && <p className="admin-doux">Identifiant : <code>{f._id}</code></p>}
                <ChampBilingue nom="ecole" libelle="École" valeur={f.ecole}/>
                <ChampBilingue nom="diplome" libelle="Diplôme" valeur={f.diplome}/>
                <ChampPeriode debut={f.debut} fin={f.fin}/>
                <label style={{display: 'flex', alignItems: 'center'}}>
                    <input type="checkbox" name="enCours" defaultChecked={f.enCours}/> Formation en cours
                </label>
                <div className="admin-deux">
                    <div>
                        <label htmlFor="ordre">Ordre d’affichage (0 = en haut)</label>
                        <input id="ordre" name="ordre" type="number" min="0" defaultValue={f.ordre} required/>
                    </div>
                    <div>
                        <label htmlFor="siteWeb">Site web (vide = aucun)</label>
                        <input id="siteWeb" name="siteWeb" defaultValue={f.siteWeb ?? ''}/>
                    </div>
                </div>
                <ChampLogo valeur={f.logo}/>
                <ChampBilingue nom="details" libelle="Détails" valeur={f.details} long/>
                <p><button type="submit">{nouveau ? 'Créer' : 'Enregistrer'}</button></p>
            </form>
            {!nouveau && <Suppression collection="formations" id={f._id} libelle={`"${f.ecole.fr}"`}/>}
        </>
    )
}

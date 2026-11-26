import Link from 'next/link'
import {notFound} from 'next/navigation'
import {getDb} from '../../../../src/lib/mongodb'
import {exigerSession} from '../../../../src/lib/admin/garde'
import {ordreSuivant} from '../../../../src/lib/admin/pages'
import {versSaisieDate} from '../../../../src/lib/donnees/dates'
import {enregistrerCertification} from '../../actions'
import Message from '../../Message'
import Suppression from '../../Suppression'

export default async function FicheCertification({params, searchParams}) {
    await exigerSession()
    const id = decodeURIComponent((await params).id)
    const {ok, erreur} = await searchParams
    const nouveau = id === 'nouveau'
    const c = nouveau
        ? {ordre: await ordreSuivant('certifications'), organisme: 'Dataiku Academy'}
        : await (await getDb()).collection('certifications').findOne({_id: id})
    if (!c) notFound()
    return (
        <>
            <p><Link href="/admin/certifications">&larr; Certifications</Link></p>
            <h1>{nouveau ? 'Nouvelle certification' : c.nom}</h1>
            <Message ok={ok} erreur={erreur}/>
            <form action={enregistrerCertification} className="admin-carte">
                <input type="hidden" name="id" value={nouveau ? '' : c._id}/>
                {!nouveau && <p className="admin-doux">Identifiant : <code>{c._id}</code></p>}
                <div className="admin-deux">
                    <div>
                        <label htmlFor="nom">Nom</label>
                        <input id="nom" name="nom" defaultValue={c.nom ?? ''} required/>
                    </div>
                    <div>
                        <label htmlFor="organisme">Organisme</label>
                        <input id="organisme" name="organisme" defaultValue={c.organisme ?? ''} required/>
                    </div>
                    <div>
                        <label htmlFor="date">Date d’obtention (AAAA-MM ou AAAA, vide = inconnue)</label>
                        <input id="date" name="date" defaultValue={versSaisieDate(c.date)} pattern="\d{4}(-(0[1-9]|1[0-2]))?"/>
                    </div>
                    <div>
                        <label htmlFor="ordre">Ordre d’affichage</label>
                        <input id="ordre" name="ordre" type="number" min="0" defaultValue={c.ordre} required/>
                    </div>
                </div>
                <label htmlFor="lien">Lien de vérification</label>
                <input id="lien" name="lien" type="url" defaultValue={c.lien ?? ''}/>
                <p><button type="submit">{nouveau ? 'Créer' : 'Enregistrer'}</button></p>
            </form>
            {!nouveau && <Suppression collection="certifications" id={c._id} libelle={`"${c.nom}"`}/>}
        </>
    )
}

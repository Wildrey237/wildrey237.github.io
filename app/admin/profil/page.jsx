import {getDb} from '../../../src/lib/mongodb'
import {exigerSession} from '../../../src/lib/admin/garde'
import {modifierProfil} from '../actions'
import Message from '../Message'
import ChampBilingue from '../ChampBilingue'

export default async function AdminProfil({searchParams}) {
    await exigerSession()
    const {ok, erreur} = await searchParams
    const p = (await (await getDb()).collection('profil').findOne({_id: 'profil'})) ?? {}
    const simple = (nom, libelle, type = 'text') => (
        <div>
            <label htmlFor={nom}>{libelle}</label>
            <input id={nom} name={nom} type={type} defaultValue={p[nom] ?? ''} required/>
        </div>
    )
    return (
        <>
            <h1>Profil</h1>
            <Message ok={ok} erreur={erreur}/>
            <form action={modifierProfil} className="admin-carte">
                <div className="admin-deux">
                    {simple('nom', 'Nom affiche')}
                    {simple('localisation', 'Localisation')}
                    {simple('email', 'Email', 'email')}
                    {simple('photoUrl', 'Photo (URL ou /fichier du site)')}
                    {simple('linkedin', 'LinkedIn (URL)')}
                    {simple('github', 'GitHub (URL)')}
                </div>
                <ChampBilingue nom="titre" libelle="Titre" valeur={p.titre}/>
                <ChampBilingue nom="resume" libelle="Resume" valeur={p.resume} long/>
                <ChampBilingue nom="cvUrl" libelle="Lien du CV" valeur={p.cvUrl}/>
                <ChampBilingue nom="recherche" libelle="Badge de disponibilité (vide = masqué)" valeur={p.recherche} requis={false}/>
                <ChampBilingue nom="langues" libelle="Langues (encart du hero)" valeur={p.langues} requis={false}/>
                <ChampBilingue nom="rolesTypewriter" libelle="Rôles (non affichés depuis la refonte)" valeur={p.rolesTypewriter} liste/>
                <p><button type="submit">Enregistrer</button></p>
            </form>
        </>
    )
}

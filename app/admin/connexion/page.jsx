import {redirect} from 'next/navigation'
import {sessionValide} from '../../../src/lib/admin/garde'

const ERREURS = {
    motdepasse: 'Mot de passe incorrect.',
    config: 'ADMIN_PASSWORD n’est pas configurée sur ce déploiement.',
}

export default async function Connexion({searchParams}) {
    const {erreur, suite} = await searchParams
    if (await sessionValide()) redirect('/admin')
    return (
        <div className="admin-carte" style={{maxWidth: 380, margin: '10vh auto'}}>
            <h1>Connexion</h1>
            {erreur && <p className="admin-message erreur" role="alert">{ERREURS[erreur] ?? 'Erreur.'}</p>}
            <form method="post" action="/admin/connexion/valider">
                <input type="hidden" name="suite" value={typeof suite === 'string' ? suite : '/admin'}/>
                <label htmlFor="motDePasse">Mot de passe</label>
                <input id="motDePasse" name="motDePasse" type="password" autoComplete="current-password" required autoFocus/>
                <p><button type="submit">Se connecter</button></p>
            </form>
        </div>
    )
}

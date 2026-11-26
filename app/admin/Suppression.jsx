import {supprimerElement} from './actions'

// Suppression confirmee sans JavaScript : la case doit etre cochee.
export default function Suppression({collection, id, libelle}) {
    return (
        <form action={supprimerElement} className="admin-carte" style={{marginTop: 24, borderColor: 'var(--a-erreur)'}}>
            <input type="hidden" name="collection" value={collection}/>
            <input type="hidden" name="id" value={id}/>
            <label style={{display: 'flex', alignItems: 'center', margin: '0 0 10px'}}>
                <input type="checkbox" name="confirmer" required/> Je confirme la suppression definitive de {libelle}
            </label>
            <button type="submit" className="danger">Supprimer</button>
        </form>
    )
}

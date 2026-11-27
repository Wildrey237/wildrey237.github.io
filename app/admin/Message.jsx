// Bandeau de retour apres une action (?ok=... ou ?erreur=... dans l'URL).
export default function Message({ok, erreur}) {
    if (erreur) return <p className="admin-message erreur" role="alert">{erreur}</p>
    if (ok) return <p className="admin-message ok" role="status">{ok}</p>
    return null
}

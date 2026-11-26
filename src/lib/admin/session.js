// Session d'administration : jeton signe HMAC-SHA256 avec ADMIN_PASSWORD, stocke dans un
// cookie httpOnly. Format du jeton : "<expiration en secondes>.<signature base64url>".
// Aucun etat cote serveur : changer ADMIN_PASSWORD invalide toutes les sessions ouvertes.
// Web Crypto uniquement, pour fonctionner dans le middleware comme dans les actions serveur.

export const COOKIE_SESSION = 'admin_session'
export const DUREE_SESSION = 8 * 60 * 60 // 8 heures

const encodeur = new TextEncoder()

function versBase64url(octets) {
    let binaire = ''
    for (const o of new Uint8Array(octets)) binaire += String.fromCharCode(o)
    return btoa(binaire).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function depuisBase64url(texte) {
    const b64 = texte.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (texte.length % 4)) % 4)
    const binaire = atob(b64)
    return Uint8Array.from(binaire, c => c.charCodeAt(0))
}

function cle(secret) {
    return crypto.subtle.importKey('raw', encodeur.encode(secret), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign', 'verify'])
}

export async function creerJeton(secret) {
    const expiration = Math.floor(Date.now() / 1000) + DUREE_SESSION
    const signature = await crypto.subtle.sign('HMAC', await cle(secret), encodeur.encode(`admin.${expiration}`))
    return `${expiration}.${versBase64url(signature)}`
}

// Vrai si le jeton est bien signe avec ce secret et n'a pas expire.
// crypto.subtle.verify compare la signature en temps constant.
export async function jetonValide(jeton, secret) {
    if (!jeton || !secret) return false
    const [expiration, signature] = jeton.split('.')
    if (!/^\d+$/.test(expiration ?? '') || !signature) return false
    if (Number(expiration) < Math.floor(Date.now() / 1000)) return false
    try {
        return await crypto.subtle.verify('HMAC', await cle(secret), depuisBase64url(signature), encodeur.encode(`admin.${expiration}`))
    } catch {
        return false
    }
}

// Compare deux chaines en temps constant (via leurs empreintes HMAC de meme longueur).
export async function egaliteSure(a, b) {
    const k = await cle('comparaison')
    const [ha, hb] = await Promise.all([a, b].map(v => crypto.subtle.sign('HMAC', k, encodeur.encode(String(v)))))
    const va = new Uint8Array(ha), vb = new Uint8Array(hb)
    let diff = 0
    for (let i = 0; i < va.length; i++) diff |= va[i] ^ vb[i]
    return diff === 0
}

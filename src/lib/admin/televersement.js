// Televersement des logos (experiences, formations) vers Vercel Blob.
// Le jeton BLOB_READ_WRITE_TOKEN est fourni par Vercel quand un store Blob est connecte au projet.
import {put} from '@vercel/blob'

const TYPES = {'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/svg+xml': 'svg'}
const TAILLE_MAX = 1024 * 1024 // 1 Mo

export class ErreurTeleversement extends Error {}

// Renvoie l'URL publique du fichier, ou null si aucun fichier n'a ete choisi.
export async function televerserLogo(fichier, prefixe) {
    if (!fichier || typeof fichier === 'string' || fichier.size === 0) return null
    const extension = TYPES[fichier.type]
    if (!extension) throw new ErreurTeleversement('Logo : formats acceptés PNG, JPEG, WebP ou SVG')
    if (fichier.size > TAILLE_MAX) throw new ErreurTeleversement('Logo : 1 Mo maximum')
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        throw new ErreurTeleversement('Téléversement indisponible : connecter un store Vercel Blob au projet '
            + '(ou déposer le fichier dans public/logos et saisir son chemin, ex. /logos/epita.png)')
    }
    const {url} = await put(`logos/${prefixe}-${Date.now()}.${extension}`, fichier, {
        access: 'public',
        contentType: fichier.type,
    })
    return url
}

// Changement d'etat d'un noeud (partage par /admin/noeuds et /parcours).
// L'etat n'est stocke que dans la collection noeuds : etat, date du changement, historique.
import {ETATS_NOEUD} from './schemas.js'

export class ErreurEtat extends Error {}

// Renvoie {change, noeud: {id, etat, etatModifieLe}} ; aucun historique si l'etat ne change pas.
export async function appliquerEtat(db, id, etat) {
    if (!ETATS_NOEUD.includes(etat)) throw new ErreurEtat(`Etat inconnu : ${etat}`)
    const col = db.collection('noeuds')
    const maintenant = new Date()
    const r = await col.updateOne(
        {_id: id, etat: {$ne: etat}},
        {$set: {etat, etatModifieLe: maintenant}, $push: {historique: {etat, date: maintenant}}},
    )
    const noeud = await col.findOne({_id: id}, {projection: {etat: 1, etatModifieLe: 1}})
    if (!noeud) throw new ErreurEtat(`Noeud inconnu : ${id}`)
    return {change: r.modifiedCount > 0, noeud: {id, etat: noeud.etat, etatModifieLe: noeud.etatModifieLe?.toISOString() ?? null}}
}

'use server'

// Action du parcours prive : changement d'etat d'un noeud en un clic.
// Renvoie un resultat (pas de redirection) pour une mise a jour immediate de la carte.
import {revalidatePath} from 'next/cache'
import {getDb} from '../../src/lib/mongodb'
import {sessionValide} from '../../src/lib/admin/garde'
import {ErreurEtat, appliquerEtat} from '../../src/lib/donnees/noeuds'

export async function definirEtat(id, etat) {
    if (!(await sessionValide())) return {ok: false, erreur: 'Session expirée : reconnecte-toi.'}
    try {
        const {noeud} = await appliquerEtat(await getDb(), String(id), String(etat))
        revalidatePath('/parcours')
        revalidatePath('/admin/noeuds')
        return {ok: true, noeud}
    } catch (e) {
        if (e instanceof ErreurEtat) return {ok: false, erreur: e.message}
        throw e
    }
}

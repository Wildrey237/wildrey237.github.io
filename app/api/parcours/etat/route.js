// Changement d'etat d'un noeud du parcours : reserve a la session admin.
// POST {id, etat} -> 200 {ok, noeud} ; 401 sans session valide ; 400 si la saisie est invalide.
import {NextResponse} from 'next/server'
import {revalidatePath} from 'next/cache'
import {getDb} from '../../../../src/lib/mongodb'
import {sessionValide} from '../../../../src/lib/admin/garde'
import {ErreurEtat, appliquerEtat} from '../../../../src/lib/donnees/noeuds'

export async function POST(requete) {
    if (!(await sessionValide())) {
        return NextResponse.json({ok: false, erreur: 'Session admin requise'}, {status: 401})
    }
    // Appel depuis ce site uniquement.
    const origine = requete.headers.get('origin')
    if (origine && origine !== new URL(requete.url).origin) {
        return NextResponse.json({ok: false, erreur: 'Origine refusée'}, {status: 403})
    }
    let corps
    try {
        corps = await requete.json()
    } catch {
        return NextResponse.json({ok: false, erreur: 'Corps JSON attendu'}, {status: 400})
    }
    try {
        const {noeud} = await appliquerEtat(await getDb(), String(corps?.id ?? ''), String(corps?.etat ?? ''))
        revalidatePath('/parcours')
        revalidatePath('/admin/noeuds')
        return NextResponse.json({ok: true, noeud})
    } catch (e) {
        if (e instanceof ErreurEtat) return NextResponse.json({ok: false, erreur: e.message}, {status: 400})
        throw e
    }
}

import {getDb} from '../../src/lib/mongodb'
import {sessionValide} from '../../src/lib/admin/garde'
import {lireBandes} from '../../src/lib/parcours/modele'
import Parcours from '../../src/components/parcours/Parcours'

// Parcours : public en lecture mais non reference (noindex ici et en-tete X-Robots-Tag dans
// next.config.mjs, hors sitemap, hors menu public). L'edition reste reservee a la session admin.
export const metadata = {
    title: 'Où j’en suis – parcours',
    robots: {index: false, follow: false, nocache: true, googleBot: {index: false, follow: false}},
}
export const dynamic = 'force-dynamic'

export default async function PageParcours({searchParams}) {
    const [{bandes, noeud}, estAdmin] = await Promise.all([searchParams, sessionValide()])
    const docs = await (await getDb()).collection('noeuds')
        .find({}, {projection: {historique: 0}})
        .toArray()
    // Donnees simples pour le client (textes en francais, dates en ISO).
    const noeuds = docs.map(n => ({
        id: n._id,
        bande: n.bande,
        col: n.col,
        row: n.row,
        titre: n.titre.fr,
        notions: n.notions.fr,
        prerequis: n.prerequis,
        livrables: n.livrables.map(l => ({nom: l.nom.fr, detail: l.detail.fr})),
        etat: n.etat,
        etatModifieLe: n.etatModifieLe ? n.etatModifieLe.toISOString() : null,
    }))
    return <Parcours noeudsInitiaux={noeuds} estAdmin={estAdmin} bandesInitiales={lireBandes(bandes)}
                     noeudInitial={typeof noeud === 'string' ? noeud : null}/>
}

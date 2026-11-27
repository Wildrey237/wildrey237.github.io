import Link from 'next/link'
import {notFound} from 'next/navigation'
import {getDb} from '../../../../src/lib/mongodb'
import {exigerSession} from '../../../../src/lib/admin/garde'
import {listeNoeuds, ordreSuivant} from '../../../../src/lib/admin/pages'
import {DOMAINES_PROJET, STATUTS_PROJET} from '../../../../src/lib/donnees/schemas'
import {enregistrerProjet} from '../../actions'
import Message from '../../Message'
import ChampBilingue from '../../ChampBilingue'
import CasesNoeuds from '../../CasesNoeuds'
import Suppression from '../../Suppression'

const NOMS_DOMAINES = {'ia-data': 'IA & Data', systemes: 'Systèmes', web: 'Web'}
const NOMS_STATUTS = {'a faire': 'À faire', 'en cours': 'En cours', livre: 'Livré'}

// Brouillon d'un projet du CV a partir d'un projet d'apprentissage de la carte.
// Rien n'est enregistre tant que le formulaire n'est pas envoye ("Creer").
async function brouillonDepuis(db, idNoeud) {
    const n = await db.collection('noeuds').findOne({_id: idNoeud})
    if (!n || n.bande !== 'proj') return null
    const sansPrefixe = t => t.replace(/^P · /, '')
    const livrables = n.livrables.map(l => `${l.nom.fr} : ${l.detail.fr}`).join('\n')
    return {
        noeud: n,
        projet: {
            ordre: await ordreSuivant('projets'),
            titre: {fr: sansPrefixe(n.titre.fr), en: sansPrefixe(n.titre.en)},
            description: {fr: livrables || n.notions.fr.join(', '), en: ''},
            cadre: {fr: 'EPITA – Spécialisation SCIA-G (Campus de Lyon)', en: 'EPITA – SCIA-G Specialization (Lyon Campus)'},
            tags: {fr: [], en: []},
            statut: 'en cours',
            domaine: 'ia-data',
            icone: 'Brain',
            // Noeuds de cours mobilises : les prerequis du projet d'apprentissage.
            noeuds: n.prerequis,
        },
    }
}

export default async function FicheProjet({params, searchParams}) {
    await exigerSession()
    const id = decodeURIComponent((await params).id)
    const {ok, erreur, depuis} = await searchParams
    const nouveau = id === 'nouveau'
    const db = await getDb()
    const brouillon = nouveau && typeof depuis === 'string' ? await brouillonDepuis(db, depuis) : null
    const [p, noeuds] = await Promise.all([
        nouveau
            ? (brouillon?.projet ?? ordreSuivant('projets').then(ordre => ({ordre, statut: 'livre', noeuds: []})))
            : db.collection('projets').findOne({_id: id}),
        listeNoeuds(),
    ])
    if (!p) notFound()
    const origine = brouillon?.noeud._id ?? p.noeudOrigine
    return (
        <>
            <p><Link href="/admin/projets">&larr; Projets du CV</Link></p>
            <h1>{nouveau ? 'Nouveau projet du CV' : p.titre.fr}</h1>
            <Message ok={ok} erreur={erreur}/>
            {brouillon && (
                <p className="admin-message ok" role="note">
                    Pré-rempli depuis le projet d’apprentissage « {brouillon.noeud.titre.fr} ». Rien n’est publié dans le
                    CV tant que vous ne cliquez pas sur « Créer ». Complétez la description et la version anglaise.
                </p>
            )}
            {!nouveau && origine && (
                <p className="admin-doux">Issu du projet d’apprentissage <code>{origine}</code> de la carte.</p>
            )}
            <form action={enregistrerProjet} className="admin-carte">
                <input type="hidden" name="id" value={nouveau ? '' : p._id}/>
                {brouillon && <input type="hidden" name="noeudOrigine" value={brouillon.noeud._id}/>}
                {!nouveau && <p className="admin-doux">Identifiant : <code>{p._id}</code></p>}
                <ChampBilingue nom="titre" libelle="Titre" valeur={p.titre}/>
                <ChampBilingue nom="description" libelle="Description" valeur={p.description} long/>
                <ChampBilingue nom="cadre" libelle="Cadre" valeur={p.cadre}/>
                <ChampBilingue nom="tags" libelle="Tags" valeur={p.tags} liste/>
                <div className="admin-deux">
                    <div>
                        <label htmlFor="statut">Statut</label>
                        <select id="statut" name="statut" defaultValue={p.statut}>
                            {STATUTS_PROJET.map(s => <option key={s} value={s}>{NOMS_STATUTS[s]}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="ordre">Ordre d’affichage (0 = en premier)</label>
                        <input id="ordre" name="ordre" type="number" min="0" defaultValue={p.ordre} required/>
                    </div>
                    <div>
                        <label htmlFor="domaine">Domaine (filtre de l’accueil)</label>
                        <select id="domaine" name="domaine" defaultValue={p.domaine ?? ''}>
                            <option value="">Aucun (seulement sous « Tous »)</option>
                            {DOMAINES_PROJET.map(d => <option key={d} value={d}>{NOMS_DOMAINES[d]}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{display: 'flex', alignItems: 'center', marginTop: 40}}>
                            <input type="checkbox" name="personnel" defaultChecked={Boolean(p.personnel)}/> Projet personnel (filtre « Personnel »)
                        </label>
                        <label style={{display: 'flex', alignItems: 'center'}}>
                            <input type="checkbox" name="phare" defaultChecked={Boolean(p.phare)}/> Projet phare (carrousel, 6 à 8 conseillés)
                        </label>
                    </div>
                    <div>
                        <label htmlFor="badge">Badge (vide = aucun)</label>
                        <input id="badge" name="badge" defaultValue={p.badge ?? ''}/>
                    </div>
                    <div>
                        <label htmlFor="icone">Icône (nom Lucide, ex. Brain)</label>
                        <input id="icone" name="icone" defaultValue={p.icone ?? ''} required/>
                    </div>
                </div>
                <label htmlFor="lien">Lien (vide = aucun)</label>
                <input id="lien" name="lien" defaultValue={p.lien ?? ''}/>
                <label>Nœuds mobilisés</label>
                <CasesNoeuds noeuds={noeuds} coches={p.noeuds}/>
                <p><button type="submit">{nouveau ? 'Créer' : 'Enregistrer'}</button></p>
            </form>
            {!nouveau && <Suppression collection="projets" id={p._id} libelle={`« ${p.titre.fr} »`}/>}
        </>
    )
}

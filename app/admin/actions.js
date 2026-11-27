'use server'

// Actions serveur de /admin. Chacune verifie la session, valide ses entrees,
// ecrit dans MongoDB (les validateurs $jsonSchema font office de dernier filet),
// invalide le cache des pages publiques concernees puis redirige avec un message.
// MongoDB est la source de verite du site : tout le contenu de l'accueil se modifie ici.

import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'
import {revalidatePath} from 'next/cache'
import {getDb} from '../../src/lib/mongodb'
import {exigerSession} from '../../src/lib/admin/garde'
import {COOKIE_SESSION} from '../../src/lib/admin/session'
import {CATEGORIES_COMPETENCES, DOMAINES_PROJET, SECTIONS_ACCUEIL, STATUTS_PROJET} from '../../src/lib/donnees/schemas'
import {lireSaisieDate} from '../../src/lib/donnees/dates'
import {slug} from '../../src/lib/donnees/depuisJson'
import {ErreurTeleversement, televerserLogo} from '../../src/lib/admin/televersement'
import {ErreurEtat, appliquerEtat} from '../../src/lib/donnees/noeuds'

// ---------- utilitaires de saisie ----------

class ErreurSaisie extends Error {}

const texte = (fd, nom) => String(fd.get(nom) ?? '').trim()
const texteOuNull = (fd, nom) => texte(fd, nom) || null
// Une valeur par ligne (tags, roles...) : lignes vides ignorees.
const lignes = (fd, nom) => texte(fd, nom).split(/\r?\n/).map(l => l.trim()).filter(Boolean)
const bilingue = (fd, nom) => ({fr: texte(fd, `${nom}_fr`), en: texte(fd, `${nom}_en`)})
const bilingueLignes = (fd, nom) => ({fr: lignes(fd, `${nom}_fr`), en: lignes(fd, `${nom}_en`)})

function obligatoire(valeur, nom) {
    if (!valeur) throw new ErreurSaisie(`« ${nom} » est obligatoire`)
    return valeur
}

// Texte traduisible obligatoire dans les deux langues (FR et EN gardes synchrones).
function bilingueObligatoire(fd, nom) {
    const v = bilingue(fd, nom)
    if (!v.fr || !v.en) throw new ErreurSaisie(`« ${nom} » est obligatoire en FR et en EN`)
    return v
}

function entier(fd, nom, {min = 0, max = 100000} = {}) {
    const v = Number(texte(fd, nom))
    if (!Number.isInteger(v) || v < min || v > max) throw new ErreurSaisie(`« ${nom} » doit être un entier entre ${min} et ${max}`)
    return v
}

function url(fd, nom) {
    const v = texte(fd, nom)
    if (v && !/^https?:\/\//.test(v) && !v.startsWith('/')) {
        throw new ErreurSaisie(`« ${nom} » doit commencer par https://, http:// ou / (fichier du site)`)
    }
    return v || null
}

function date(fd, nom) {
    try {
        return lireSaisieDate(texte(fd, nom))
    } catch (e) {
        throw new ErreurSaisie(`« ${nom} » : ${e.message}`)
    }
}

// Periode debut / fin : fin vide = en cours.
function periode(fd) {
    const debut = obligatoire(date(fd, 'debut'), 'debut')
    const fin = date(fd, 'fin')
    if (fin && fin < debut) throw new ErreurSaisie('La fin est antérieure au début')
    return {debut, fin}
}

// Ne garde que des ids de noeuds existants (cases cochees dans le formulaire).
async function noeudsValides(db, fd) {
    const demandes = [...new Set(fd.getAll('noeuds').map(String))]
    if (!demandes.length) return []
    const existants = await db.collection('noeuds').find({_id: {$in: demandes}}, {projection: {_id: 1}}).toArray()
    const ok = new Set(existants.map(n => n._id))
    const inconnus = demandes.filter(id => !ok.has(id))
    if (inconnus.length) throw new ErreurSaisie(`Nœuds inconnus : ${inconnus.join(', ')}`)
    return demandes
}

// _id lisible et stable pour un nouveau document ("detection-fraude", "manssuetude-2026"...).
async function nouvelId(collection, base) {
    const racine = slug(base) || 'element'
    if (racine === 'nouveau') return nouvelId(collection, `${racine}-1`)
    let id = racine
    for (let i = 2; await collection.countDocuments({_id: id}, {limit: 1}); i++) id = `${racine}-${i}`
    return id
}

const avecMessage = (chemin, cle, valeur) => `${chemin}?${new URLSearchParams({[cle]: valeur})}`

// Execute une ecriture et transforme les erreurs attendues en message affiche sur la page.
// ecriture() renvoie {message, chemin?} ; chemin permet de rediriger ailleurs (apres creation).
async function executer(chemin, ecriture) {
    let resultat
    try {
        resultat = await ecriture()
    } catch (e) {
        if (e instanceof ErreurSaisie || e instanceof ErreurTeleversement) redirect(avecMessage(chemin, 'erreur', e.message))
        if (e?.code === 121) redirect(avecMessage(chemin, 'erreur', 'Refusé par le validateur MongoDB (champ manquant ou valeur interdite)'))
        throw e
    }
    redirect(avecMessage(resultat.chemin ?? chemin, 'ok', resultat.message))
}

// Pages publiques qui affichent le contenu de l'accueil.
function rafraichirSite() {
    revalidatePath('/')
}

// ---------- connexion ----------

export async function seDeconnecter() {
    const jar = await cookies()
    jar.delete({name: COOKIE_SESSION, path: '/'})
    // Anciennes sessions, posees avant l'extension du cookie a tout le site.
    jar.delete({name: COOKIE_SESSION, path: '/admin'})
    redirect('/admin/connexion')
}

// ---------- profil ----------

export async function modifierProfil(formData) {
    await exigerSession()
    await executer('/admin/profil', async () => {
        const champs = {
            nom: obligatoire(texte(formData, 'nom'), 'nom'),
            titre: bilingueObligatoire(formData, 'titre'),
            resume: bilingueObligatoire(formData, 'resume'),
            localisation: obligatoire(texte(formData, 'localisation'), 'localisation'),
            email: obligatoire(texte(formData, 'email'), 'email'),
            linkedin: obligatoire(url(formData, 'linkedin'), 'linkedin'),
            github: obligatoire(url(formData, 'github'), 'github'),
            cvUrl: bilingueObligatoire(formData, 'cvUrl'),
            photoUrl: obligatoire(url(formData, 'photoUrl'), 'photoUrl'),
            recherche: bilingue(formData, 'recherche'),
            langues: bilingue(formData, 'langues'),
            rolesTypewriter: bilingueLignes(formData, 'rolesTypewriter'),
        }
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(champs.email)) throw new ErreurSaisie('Adresse e-mail invalide')
        const db = await getDb()
        await db.collection('profil').updateOne({_id: 'profil'}, {$set: champs}, {upsert: true})
        rafraichirSite()
        return {message: 'Profil enregistré'}
    })
}

// ---------- organisation de l'accueil ----------

// Appelee depuis le composant client de /admin/organisation (glisser-deposer ou boutons).
// Renvoie un resultat au lieu de rediriger : l'enregistrement est automatique.
export async function enregistrerOrdreSections(ordre) {
    await exigerSession()
    const valide = Array.isArray(ordre) && ordre.length === SECTIONS_ACCUEIL.length
        && SECTIONS_ACCUEIL.every(s => ordre.includes(s))
    if (!valide) return {ok: false, erreur: 'Ordre invalide'}
    const db = await getDb()
    await db.collection('profil').updateOne({_id: 'profil'}, {$set: {ordreSections: ordre}})
    rafraichirSite()
    return {ok: true}
}

// ---------- experiences ----------

function champsExperience(fd) {
    return {
        ordre: entier(fd, 'ordre'),
        poste: bilingueObligatoire(fd, 'poste'),
        entreprise: bilingueObligatoire(fd, 'entreprise'),
        ville: obligatoire(texte(fd, 'ville'), 'ville'),
        siteWeb: url(fd, 'siteWeb'),
        logo: url(fd, 'logo'),
        ...periode(fd),
        description: bilingueObligatoire(fd, 'description'),
        descriptionDetail: bilingue(fd, 'descriptionDetail'),
        tags: bilingueLignes(fd, 'tags'),
    }
}

export async function enregistrerExperience(formData) {
    await exigerSession()
    const id = texte(formData, 'id')
    await executer(`/admin/experiences/${encodeURIComponent(id || 'nouveau')}`, async () => {
        const champs = champsExperience(formData)
        champs.logo = (await televerserLogo(formData.get('fichierLogo'), slug(champs.entreprise.fr))) ?? champs.logo
        const col = (await getDb()).collection('experiences')
        rafraichirSite()
        if (!id) {
            const _id = await nouvelId(col, `${champs.entreprise.fr}-${champs.debut.getUTCFullYear()}`)
            await col.insertOne({_id, ...champs})
            return {message: 'Expérience créée', chemin: `/admin/experiences/${encodeURIComponent(_id)}`}
        }
        const r = await col.updateOne({_id: id}, {$set: champs})
        if (!r.matchedCount) throw new ErreurSaisie(`Expérience inconnue : ${id}`)
        return {message: 'Expérience enregistrée'}
    })
}

// ---------- formations ----------

function champsFormation(fd) {
    return {
        ordre: entier(fd, 'ordre'),
        ecole: bilingueObligatoire(fd, 'ecole'),
        diplome: bilingueObligatoire(fd, 'diplome'),
        ...periode(fd),
        enCours: fd.get('enCours') === 'on',
        details: bilingueObligatoire(fd, 'details'),
        siteWeb: url(fd, 'siteWeb'),
        logo: url(fd, 'logo'),
    }
}

export async function enregistrerFormation(formData) {
    await exigerSession()
    const id = texte(formData, 'id')
    await executer(`/admin/formations/${encodeURIComponent(id || 'nouveau')}`, async () => {
        const champs = champsFormation(formData)
        champs.logo = (await televerserLogo(formData.get('fichierLogo'), slug(champs.ecole.fr))) ?? champs.logo
        const col = (await getDb()).collection('formations')
        rafraichirSite()
        if (!id) {
            const _id = await nouvelId(col, `${champs.ecole.fr}-${champs.debut.getUTCFullYear()}`)
            await col.insertOne({_id, ...champs})
            return {message: 'Formation créée', chemin: `/admin/formations/${encodeURIComponent(_id)}`}
        }
        const r = await col.updateOne({_id: id}, {$set: champs})
        if (!r.matchedCount) throw new ErreurSaisie(`Formation inconnue : ${id}`)
        return {message: 'Formation enregistrée'}
    })
}

// ---------- projets ----------

export async function enregistrerProjet(formData) {
    await exigerSession()
    const id = texte(formData, 'id')
    await executer(`/admin/projets/${encodeURIComponent(id || 'nouveau')}`, async () => {
        const statut = texte(formData, 'statut')
        if (!STATUTS_PROJET.includes(statut)) throw new ErreurSaisie(`Statut inconnu : ${statut}`)
        const db = await getDb()
        const champs = {
            ordre: entier(formData, 'ordre'),
            titre: bilingueObligatoire(formData, 'titre'),
            description: bilingueObligatoire(formData, 'description'),
            cadre: bilingueObligatoire(formData, 'cadre'),
            badge: texteOuNull(formData, 'badge'),
            icone: obligatoire(texte(formData, 'icone'), 'icône (nom Lucide, ex. « Brain »)'),
            tags: bilingueLignes(formData, 'tags'),
            lien: url(formData, 'lien'),
            statut,
            noeuds: await noeudsValides(db, formData),
            personnel: formData.get('personnel') === 'on',
            phare: formData.get('phare') === 'on',
        }
        const domaine = texte(formData, 'domaine')
        if (domaine && !DOMAINES_PROJET.includes(domaine)) throw new ErreurSaisie(`Domaine inconnu : ${domaine}`)
        const col = db.collection('projets')
        rafraichirSite()
        if (!id) {
            // Issu d'un projet d'apprentissage de la carte : verifie le noeud et l'absence de doublon.
            const origine = texte(formData, 'noeudOrigine')
            if (origine) {
                const noeud = await db.collection('noeuds').findOne({_id: origine}, {projection: {bande: 1}})
                if (noeud?.bande !== 'proj') throw new ErreurSaisie(`« ${origine} » n’est pas un projet d’apprentissage de la carte`)
                const existant = await col.findOne({noeudOrigine: origine}, {projection: {_id: 1}})
                if (existant) throw new ErreurSaisie(`Ce projet d’apprentissage est déjà dans le CV : ${existant._id}`)
            }
            const _id = await nouvelId(col, champs.titre.fr)
            await col.insertOne({_id, ...champs, ...(domaine ? {domaine} : {}), ...(origine ? {noeudOrigine: origine} : {})})
            return {message: 'Projet créé', chemin: `/admin/projets/${encodeURIComponent(_id)}`}
        }
        // Domaine vide = retire (le projet n'apparait alors que sous "Tous").
        const r = await col.updateOne({_id: id}, domaine ? {$set: {...champs, domaine}} : {$set: champs, $unset: {domaine: ''}})
        if (!r.matchedCount) throw new ErreurSaisie(`Projet inconnu : ${id}`)
        return {message: 'Projet enregistré'}
    })
}

// ---------- competences ----------

export async function enregistrerCompetence(formData) {
    await exigerSession()
    const id = texte(formData, 'id')
    await executer(`/admin/competences/${encodeURIComponent(id || 'nouveau')}`, async () => {
        const categorie = texte(formData, 'categorie')
        if (!CATEGORIES_COMPETENCES.includes(categorie)) throw new ErreurSaisie(`Catégorie inconnue : ${categorie}`)
        const db = await getDb()
        const champs = {
            categorie,
            ordre: entier(formData, 'ordre'),
            nom: bilingueObligatoire(formData, 'nom'),
            description: bilingueObligatoire(formData, 'description'),
            noeuds: await noeudsValides(db, formData),
        }
        const col = db.collection('competences')
        rafraichirSite()
        if (!id) {
            const _id = await nouvelId(col, `${categorie}-${champs.nom.fr}`)
            await col.insertOne({_id, ...champs})
            return {message: 'Compétence créée', chemin: `/admin/competences/${encodeURIComponent(_id)}`}
        }
        const r = await col.updateOne({_id: id}, {$set: champs})
        if (!r.matchedCount) throw new ErreurSaisie(`Compétence inconnue : ${id}`)
        return {message: 'Compétence enregistrée'}
    })
}

// ---------- certifications ----------

export async function enregistrerCertification(formData) {
    await exigerSession()
    const id = texte(formData, 'id')
    await executer(`/admin/certifications/${encodeURIComponent(id || 'nouveau')}`, async () => {
        const champs = {
            ordre: entier(formData, 'ordre'),
            nom: obligatoire(texte(formData, 'nom'), 'nom'),
            organisme: obligatoire(texte(formData, 'organisme'), 'organisme'),
            date: date(formData, 'date'),
            lien: url(formData, 'lien'),
        }
        const col = (await getDb()).collection('certifications')
        rafraichirSite()
        if (!id) {
            const _id = await nouvelId(col, champs.nom)
            await col.insertOne({_id, ...champs})
            return {message: 'Certification créée', chemin: `/admin/certifications/${encodeURIComponent(_id)}`}
        }
        const r = await col.updateOne({_id: id}, {$set: champs})
        if (!r.matchedCount) throw new ErreurSaisie(`Certification inconnue : ${id}`)
        return {message: 'Certification enregistrée'}
    })
}

// ---------- suppression (experiences, formations, projets, competences, certifications) ----------

const SUPPRIMABLES = {
    experiences: 'Expérience', formations: 'Formation', projets: 'Projet', competences: 'Compétence',
    certifications: 'Certification',
}

export async function supprimerElement(formData) {
    await exigerSession()
    const collection = texte(formData, 'collection')
    const id = texte(formData, 'id')
    if (!SUPPRIMABLES[collection]) throw new Error(`Collection non supprimable : ${collection}`)
    await executer(`/admin/${collection}/${encodeURIComponent(id)}`, async () => {
        // Confirmation sans JavaScript : case a cocher obligatoire.
        if (formData.get('confirmer') !== 'on') throw new ErreurSaisie('Cochez la case de confirmation pour supprimer')
        const r = await (await getDb()).collection(collection).deleteOne({_id: id})
        if (!r.deletedCount) throw new ErreurSaisie(`${SUPPRIMABLES[collection]} introuvable : ${id}`)
        rafraichirSite()
        return {message: `${SUPPRIMABLES[collection]} « ${id} » supprimé(e)`, chemin: `/admin/${collection}`}
    })
}

// ---------- noeuds : changement d'etat ----------

const LIBELLES_ETAT = {'non commence': 'non commencé', 'en cours': 'en cours', maitrise: 'maîtrisé'}

export async function changerEtatNoeud(formData) {
    await exigerSession()
    const id = texte(formData, 'id')
    const etat = texte(formData, 'etat')
    await executer('/admin/noeuds', async () => {
        let resultat
        try {
            resultat = await appliquerEtat(await getDb(), id, etat)
        } catch (e) {
            if (e instanceof ErreurEtat) throw new ErreurSaisie(e.message)
            throw e
        }
        if (!resultat.change) return {message: `${id} : déjà « ${LIBELLES_ETAT[etat]} »`}
        revalidatePath('/parcours')
        return {message: `${id} : « ${LIBELLES_ETAT[etat]} »`}
    })
}

// ---------- journal ----------

export async function enregistrerJournal(formData) {
    await exigerSession()
    await executer('/admin/journal', async () => {
        const jour = texte(formData, 'date')
        if (!/^\d{4}-\d{2}-\d{2}$/.test(jour) || Number.isNaN(Date.parse(`${jour}T00:00:00Z`))) {
            throw new ErreurSaisie('Date invalide (format AAAA-MM-JJ)')
        }
        const minutes = entier(formData, 'minutes', {min: 0, max: 24 * 60})
        const db = await getDb()
        const noeuds = await noeudsValides(db, formData)
        const commentaire = texteOuNull(formData, 'commentaire')
        // Un document par jour : une nouvelle saisie pour la meme date remplace la precedente.
        const r = await db.collection('journal').replaceOne({_id: jour}, {minutes, noeuds, commentaire}, {upsert: true})
        rafraichirSite()
        return {message: r.upsertedCount ? `Journal du ${jour} ajouté` : `Journal du ${jour} remplacé`}
    })
}

export async function supprimerJournal(formData) {
    await exigerSession()
    const jour = texte(formData, 'date')
    await executer('/admin/journal', async () => {
        const r = await (await getDb()).collection('journal').deleteOne({_id: jour})
        if (!r.deletedCount) throw new ErreurSaisie(`Aucune entrée pour ${jour}`)
        rafraichirSite()
        return {message: `Journal du ${jour} supprimé`}
    })
}

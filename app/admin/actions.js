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
import {COOKIE_SESSION, DUREE_SESSION, creerJeton, egaliteSure} from '../../src/lib/admin/session'
import {CATEGORIES_COMPETENCES, ETATS_NOEUD, STATUTS_PROJET} from '../../src/lib/donnees/schemas'
import {lireSaisieDate} from '../../src/lib/donnees/dates'
import {slug} from '../../src/lib/donnees/depuisJson'

// ---------- utilitaires de saisie ----------

class ErreurSaisie extends Error {}

const texte = (fd, nom) => String(fd.get(nom) ?? '').trim()
const texteOuNull = (fd, nom) => texte(fd, nom) || null
// Une valeur par ligne (tags, roles...) : lignes vides ignorees.
const lignes = (fd, nom) => texte(fd, nom).split(/\r?\n/).map(l => l.trim()).filter(Boolean)
const bilingue = (fd, nom) => ({fr: texte(fd, `${nom}_fr`), en: texte(fd, `${nom}_en`)})
const bilingueLignes = (fd, nom) => ({fr: lignes(fd, `${nom}_fr`), en: lignes(fd, `${nom}_en`)})

function obligatoire(valeur, nom) {
    if (!valeur) throw new ErreurSaisie(`"${nom}" est obligatoire`)
    return valeur
}

// Texte traduisible obligatoire dans les deux langues (FR et EN gardes synchrones).
function bilingueObligatoire(fd, nom) {
    const v = bilingue(fd, nom)
    if (!v.fr || !v.en) throw new ErreurSaisie(`"${nom}" est obligatoire en FR et en EN`)
    return v
}

function entier(fd, nom, {min = 0, max = 100000} = {}) {
    const v = Number(texte(fd, nom))
    if (!Number.isInteger(v) || v < min || v > max) throw new ErreurSaisie(`"${nom}" doit etre un entier entre ${min} et ${max}`)
    return v
}

function url(fd, nom) {
    const v = texte(fd, nom)
    if (v && !/^https?:\/\//.test(v) && !v.startsWith('/')) {
        throw new ErreurSaisie(`"${nom}" doit commencer par https://, http:// ou / (fichier du site)`)
    }
    return v || null
}

function date(fd, nom) {
    try {
        return lireSaisieDate(texte(fd, nom))
    } catch (e) {
        throw new ErreurSaisie(`"${nom}" : ${e.message}`)
    }
}

// Periode debut / fin : fin vide = en cours.
function periode(fd) {
    const debut = obligatoire(date(fd, 'debut'), 'debut')
    const fin = date(fd, 'fin')
    if (fin && fin < debut) throw new ErreurSaisie('La fin est anterieure au debut')
    return {debut, fin}
}

// Ne garde que des ids de noeuds existants (cases cochees dans le formulaire).
async function noeudsValides(db, fd) {
    const demandes = [...new Set(fd.getAll('noeuds').map(String))]
    if (!demandes.length) return []
    const existants = await db.collection('noeuds').find({_id: {$in: demandes}}, {projection: {_id: 1}}).toArray()
    const ok = new Set(existants.map(n => n._id))
    const inconnus = demandes.filter(id => !ok.has(id))
    if (inconnus.length) throw new ErreurSaisie(`Noeuds inconnus : ${inconnus.join(', ')}`)
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
        if (e instanceof ErreurSaisie) redirect(avecMessage(chemin, 'erreur', e.message))
        if (e?.code === 121) redirect(avecMessage(chemin, 'erreur', 'Refuse par le validateur MongoDB (champ manquant ou valeur interdite)'))
        throw e
    }
    redirect(avecMessage(resultat.chemin ?? chemin, 'ok', resultat.message))
}

// Pages publiques qui affichent le contenu de l'accueil.
function rafraichirSite() {
    revalidatePath('/')
}

// ---------- connexion ----------

export async function seConnecter(formData) {
    const motDePasse = String(formData.get('motDePasse') ?? '')
    const suiteDemandee = String(formData.get('suite') ?? '')
    // Redirection interne a /admin uniquement (pas de redirection ouverte).
    const suite = /^\/admin(\/[\w\-\/]*)?$/.test(suiteDemandee) && suiteDemandee !== '/admin/connexion' ? suiteDemandee : '/admin'

    const attendu = process.env.ADMIN_PASSWORD
    if (!attendu) redirect('/admin/connexion?erreur=config')

    if (!motDePasse || !(await egaliteSure(motDePasse, attendu))) {
        // Ralentit les essais en serie.
        await new Promise(r => setTimeout(r, 1000))
        redirect(`/admin/connexion?${new URLSearchParams({erreur: 'motdepasse', suite})}`)
    }

    const jar = await cookies()
    jar.set(COOKIE_SESSION, await creerJeton(attendu), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/admin',
        maxAge: DUREE_SESSION,
    })
    redirect(suite)
}

export async function seDeconnecter() {
    const jar = await cookies()
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
            rolesTypewriter: bilingueLignes(formData, 'rolesTypewriter'),
        }
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(champs.email)) throw new ErreurSaisie('Email invalide')
        const db = await getDb()
        await db.collection('profil').updateOne({_id: 'profil'}, {$set: champs}, {upsert: true})
        rafraichirSite()
        return {message: 'Profil enregistre'}
    })
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
        const col = (await getDb()).collection('experiences')
        rafraichirSite()
        if (!id) {
            const _id = await nouvelId(col, `${champs.entreprise.fr}-${champs.debut.getUTCFullYear()}`)
            await col.insertOne({_id, ...champs})
            return {message: 'Experience creee', chemin: `/admin/experiences/${encodeURIComponent(_id)}`}
        }
        const r = await col.updateOne({_id: id}, {$set: champs})
        if (!r.matchedCount) throw new ErreurSaisie(`Experience inconnue : ${id}`)
        return {message: 'Experience enregistree'}
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
    }
}

export async function enregistrerFormation(formData) {
    await exigerSession()
    const id = texte(formData, 'id')
    await executer(`/admin/formations/${encodeURIComponent(id || 'nouveau')}`, async () => {
        const champs = champsFormation(formData)
        const col = (await getDb()).collection('formations')
        rafraichirSite()
        if (!id) {
            const _id = await nouvelId(col, `${champs.ecole.fr}-${champs.debut.getUTCFullYear()}`)
            await col.insertOne({_id, ...champs})
            return {message: 'Formation creee', chemin: `/admin/formations/${encodeURIComponent(_id)}`}
        }
        const r = await col.updateOne({_id: id}, {$set: champs})
        if (!r.matchedCount) throw new ErreurSaisie(`Formation inconnue : ${id}`)
        return {message: 'Formation enregistree'}
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
            icone: obligatoire(texte(formData, 'icone'), 'icone (nom Lucide, ex. "Brain")'),
            tags: bilingueLignes(formData, 'tags'),
            lien: url(formData, 'lien'),
            statut,
            noeuds: await noeudsValides(db, formData),
        }
        const col = db.collection('projets')
        rafraichirSite()
        if (!id) {
            const _id = await nouvelId(col, champs.titre.fr)
            await col.insertOne({_id, ...champs})
            return {message: 'Projet cree', chemin: `/admin/projets/${encodeURIComponent(_id)}`}
        }
        const r = await col.updateOne({_id: id}, {$set: champs})
        if (!r.matchedCount) throw new ErreurSaisie(`Projet inconnu : ${id}`)
        return {message: 'Projet enregistre'}
    })
}

// ---------- competences ----------

export async function enregistrerCompetence(formData) {
    await exigerSession()
    const id = texte(formData, 'id')
    await executer(`/admin/competences/${encodeURIComponent(id || 'nouveau')}`, async () => {
        const categorie = texte(formData, 'categorie')
        if (!CATEGORIES_COMPETENCES.includes(categorie)) throw new ErreurSaisie(`Categorie inconnue : ${categorie}`)
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
            return {message: 'Competence creee', chemin: `/admin/competences/${encodeURIComponent(_id)}`}
        }
        const r = await col.updateOne({_id: id}, {$set: champs})
        if (!r.matchedCount) throw new ErreurSaisie(`Competence inconnue : ${id}`)
        return {message: 'Competence enregistree'}
    })
}

// ---------- suppression (experiences, formations, projets, competences) ----------

const SUPPRIMABLES = {
    experiences: 'Experience', formations: 'Formation', projets: 'Projet', competences: 'Competence',
}

export async function supprimerElement(formData) {
    await exigerSession()
    const collection = texte(formData, 'collection')
    const id = texte(formData, 'id')
    if (!SUPPRIMABLES[collection]) throw new Error(`Collection non supprimable : ${collection}`)
    await executer(`/admin/${collection}/${encodeURIComponent(id)}`, async () => {
        // Confirmation sans JavaScript : case a cocher obligatoire.
        if (formData.get('confirmer') !== 'on') throw new ErreurSaisie('Coche la case de confirmation pour supprimer')
        const r = await (await getDb()).collection(collection).deleteOne({_id: id})
        if (!r.deletedCount) throw new ErreurSaisie(`${SUPPRIMABLES[collection]} introuvable : ${id}`)
        rafraichirSite()
        return {message: `${SUPPRIMABLES[collection]} "${id}" supprime(e)`, chemin: `/admin/${collection}`}
    })
}

// ---------- noeuds : changement d'etat ----------

export async function changerEtatNoeud(formData) {
    await exigerSession()
    const id = texte(formData, 'id')
    const etat = texte(formData, 'etat')
    await executer('/admin/noeuds', async () => {
        if (!ETATS_NOEUD.includes(etat)) throw new ErreurSaisie(`Etat inconnu : ${etat}`)
        const db = await getDb()
        const maintenant = new Date()
        // Le filtre sur l'etat evite d'empiler un historique quand rien ne change.
        const r = await db.collection('noeuds').updateOne(
            {_id: id, etat: {$ne: etat}},
            {$set: {etat, etatModifieLe: maintenant}, $push: {historique: {etat, date: maintenant}}},
        )
        if (!r.matchedCount) {
            const existe = await db.collection('noeuds').countDocuments({_id: id})
            if (!existe) throw new ErreurSaisie(`Noeud inconnu : ${id}`)
            return {message: `${id} : deja "${etat}"`}
        }
        revalidatePath('/ml-map')
        rafraichirSite()
        return {message: `${id} : "${etat}"`}
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
        return {message: r.upsertedCount ? `Journal du ${jour} ajoute` : `Journal du ${jour} remplace`}
    })
}

export async function supprimerJournal(formData) {
    await exigerSession()
    const jour = texte(formData, 'date')
    await executer('/admin/journal', async () => {
        const r = await (await getDb()).collection('journal').deleteOne({_id: jour})
        if (!r.deletedCount) throw new ErreurSaisie(`Aucune entree pour ${jour}`)
        rafraichirSite()
        return {message: `Journal du ${jour} supprime`}
    })
}

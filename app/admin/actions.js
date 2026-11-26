'use server'

// Actions serveur de /admin. Chacune verifie la session, valide ses entrees,
// ecrit dans MongoDB (les validateurs $jsonSchema font office de dernier filet),
// invalide le cache des pages publiques concernees puis redirige avec un message.

import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'
import {revalidatePath} from 'next/cache'
import {getDb} from '../../src/lib/mongodb'
import {exigerSession} from '../../src/lib/admin/garde'
import {COOKIE_SESSION, DUREE_SESSION, creerJeton, egaliteSure} from '../../src/lib/admin/session'
import {CATEGORIES_COMPETENCES, ETATS_NOEUD, STATUTS_PROJET} from '../../src/lib/donnees/schemas'

// ---------- utilitaires ----------

const texte = (fd, nom) => String(fd.get(nom) ?? '').trim()
// Une valeur par ligne (tags, roles...) : lignes vides ignorees.
const lignes = (fd, nom) => texte(fd, nom).split(/\r?\n/).map(l => l.trim()).filter(Boolean)
const bilingue = (fd, nom) => ({fr: texte(fd, `${nom}_fr`), en: texte(fd, `${nom}_en`)})
const bilingueLignes = (fd, nom) => ({fr: lignes(fd, `${nom}_fr`), en: lignes(fd, `${nom}_en`)})

function entier(fd, nom, {min = 0, max = 100000} = {}) {
    const v = Number(texte(fd, nom))
    if (!Number.isInteger(v) || v < min || v > max) throw new ErreurSaisie(`"${nom}" doit etre un entier entre ${min} et ${max}`)
    return v
}

class ErreurSaisie extends Error {}

function exigerBilingue(valeur, nom) {
    if (!valeur.fr || !valeur.en) throw new ErreurSaisie(`"${nom}" est obligatoire en FR et en EN`)
    return valeur
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

function message(chemin, cle, valeur) {
    return `${chemin}?${new URLSearchParams({[cle]: valeur})}`
}

// Execute une ecriture et transforme les erreurs attendues en message affiche sur la page.
async function executer(chemin, ecriture) {
    let ok
    try {
        ok = await ecriture()
    } catch (e) {
        if (e instanceof ErreurSaisie) redirect(message(chemin, 'erreur', e.message))
        if (e?.code === 121) redirect(message(chemin, 'erreur', 'Refuse par le validateur MongoDB (champ manquant ou valeur interdite)'))
        throw e
    }
    redirect(message(chemin, 'ok', ok))
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
            return `${id} : deja "${etat}"`
        }
        revalidatePath('/ml-map')
        revalidatePath('/')
        return `${id} : "${etat}"`
    })
}

// ---------- journal ----------

export async function enregistrerJournal(formData) {
    await exigerSession()
    await executer('/admin/journal', async () => {
        const date = texte(formData, 'date')
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
            throw new ErreurSaisie('Date invalide (format AAAA-MM-JJ)')
        }
        const minutes = entier(formData, 'minutes', {min: 0, max: 24 * 60})
        const db = await getDb()
        const noeuds = await noeudsValides(db, formData)
        const commentaire = texte(formData, 'commentaire') || null
        // Un document par jour : une nouvelle saisie pour la meme date remplace la precedente.
        const r = await db.collection('journal').replaceOne(
            {_id: date},
            {minutes, noeuds, commentaire},
            {upsert: true},
        )
        revalidatePath('/')
        return r.upsertedCount ? `Journal du ${date} ajoute` : `Journal du ${date} remplace`
    })
}

export async function supprimerJournal(formData) {
    await exigerSession()
    const date = texte(formData, 'date')
    await executer('/admin/journal', async () => {
        const db = await getDb()
        const r = await db.collection('journal').deleteOne({_id: date})
        if (!r.deletedCount) throw new ErreurSaisie(`Aucune entree pour ${date}`)
        revalidatePath('/')
        return `Journal du ${date} supprime`
    })
}

// ---------- projets ----------

export async function modifierProjet(formData) {
    await exigerSession()
    const id = texte(formData, 'id')
    const chemin = `/admin/projets/${encodeURIComponent(id)}`
    await executer(chemin, async () => {
        const statut = texte(formData, 'statut')
        if (!STATUTS_PROJET.includes(statut)) throw new ErreurSaisie(`Statut inconnu : ${statut}`)
        const lien = texte(formData, 'lien')
        if (lien && !/^https?:\/\//.test(lien)) throw new ErreurSaisie('Le lien doit commencer par http:// ou https://')
        const icone = texte(formData, 'icone')
        if (!icone) throw new ErreurSaisie('Icone obligatoire (nom Lucide, ex. "Brain")')
        const db = await getDb()
        const champs = {
            ordre: entier(formData, 'ordre'),
            titre: exigerBilingue(bilingue(formData, 'titre'), 'titre'),
            description: exigerBilingue(bilingue(formData, 'description'), 'description'),
            cadre: exigerBilingue(bilingue(formData, 'cadre'), 'cadre'),
            badge: texte(formData, 'badge') || null,
            icone,
            tags: bilingueLignes(formData, 'tags'),
            lien: lien || null,
            statut,
            noeuds: await noeudsValides(db, formData),
        }
        const r = await db.collection('projets').updateOne({_id: id}, {$set: champs})
        if (!r.matchedCount) throw new ErreurSaisie(`Projet inconnu : ${id}`)
        revalidatePath('/')
        return 'Projet enregistre'
    })
}

// ---------- competences ----------

export async function modifierCompetence(formData) {
    await exigerSession()
    const id = texte(formData, 'id')
    const chemin = `/admin/competences/${encodeURIComponent(id)}`
    await executer(chemin, async () => {
        const categorie = texte(formData, 'categorie')
        if (!CATEGORIES_COMPETENCES.includes(categorie)) throw new ErreurSaisie(`Categorie inconnue : ${categorie}`)
        const db = await getDb()
        const champs = {
            categorie,
            ordre: entier(formData, 'ordre'),
            nom: exigerBilingue(bilingue(formData, 'nom'), 'nom'),
            description: exigerBilingue(bilingue(formData, 'description'), 'description'),
            noeuds: await noeudsValides(db, formData),
        }
        const r = await db.collection('competences').updateOne({_id: id}, {$set: champs})
        if (!r.matchedCount) throw new ErreurSaisie(`Competence inconnue : ${id}`)
        revalidatePath('/')
        return 'Competence enregistree'
    })
}

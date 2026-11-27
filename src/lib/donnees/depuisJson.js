// Construit les documents MongoDB a partir des sources historiques :
// data-fr.json, data-en.json et prereqMapData.js.
// Utilise par le script de migration, et comme repli de lecture quand MONGODB_URI est absent.

import {lirePeriode} from './dates.js'
import {CATEGORIES_COMPETENCES} from './schemas.js'

// "Classification d’Images de Galaxies" -> "classification-d-images-de-galaxies"
export function slug(texte) {
    return texte
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
}

const bilingue = (fr, en) => ({fr, en})

// Dans data-en.json, deux paires de projets sont dans un ordre different de data-fr.json.
// Index FR -> index EN pour ces projets ; tous les autres sont alignes par position.
const PROJETS_EN_DECALES = {3: 4, 4: 3, 10: 19, 19: 10}

// Ecarts FR/EN detectes sur des champs non traduisibles (remplie par construireDocuments).
let avertissements = []

// Champ non traduisible : le FR fait reference ; un ecart avec l'EN est signale, pas bloquant.
function identique(contexte, champ, valeurFr, valeurEn) {
    if (JSON.stringify(valeurFr) !== JSON.stringify(valeurEn)) {
        avertissements.push(`${contexte} : "${champ}" FR=${JSON.stringify(valeurFr)} / EN=${JSON.stringify(valeurEn)} -> FR conserve`)
    }
    return valeurFr
}

function verifierLongueurs(nom, fr, en) {
    if (fr.length !== en.length) throw new Error(`${nom} : ${fr.length} elements en FR, ${en.length} en EN`)
}

// Garantit des _id uniques en suffixant les collisions (-2, -3...).
function idUnique(base, deja) {
    let id = base
    for (let i = 2; deja.has(id); i++) id = `${base}-${i}`
    deja.add(id)
    return id
}

export function construireDocuments(fr, en, carte) {
    const {TRACKS, NODES, PROJ} = carte
    avertissements = []

    // ---- profil ----
    const pf = fr.profile, pe = en.profile
    const profil = {
        _id: 'profil',
        nom: identique('profil', 'name', pf.name, pe.name),
        titre: bilingue(pf.title, pe.title),
        resume: bilingue(pf.summary, pe.summary),
        localisation: identique('profil', 'location', pf.location, pe.location),
        email: identique('profil', 'email', pf.email, pe.email),
        linkedin: identique('profil', 'linkedin', pf.linkedin, pe.linkedin),
        github: identique('profil', 'github', pf.github, pe.github),
        cvUrl: bilingue(pf.cvLink, pe.cvLink),
        photoUrl: identique('profil', 'link_picture', pf.link_picture, pe.link_picture),
        recherche: bilingue(pf.search, pe.search),
        rolesTypewriter: bilingue(pf.typewriter_roles, pe.typewriter_roles),
    }

    // ---- experiences ----
    verifierLongueurs('experiences', fr.experiences, en.experiences)
    const idsExp = new Set()
    const experiences = fr.experiences.map((f, i) => {
        const e = en.experiences[i]
        const ctx = `experience ${i}`
        const {debut, fin} = lirePeriode(f.dates)
        return {
            _id: idUnique(`${slug(f.company)}-${debut.getUTCFullYear()}`, idsExp),
            ordre: i,
            poste: bilingue(f.title, e.title),
            entreprise: bilingue(f.company, e.company),
            ville: identique(ctx, 'city', f.city, e.city),
            siteWeb: identique(ctx, 'website', f.website, e.website) || null,
            logo: identique(ctx, 'logo', f.logo, e.logo) || null,
            debut, fin,
            description: bilingue(f.description, e.description),
            descriptionDetail: bilingue(f.descriptionMore ?? '', e.descriptionMore ?? ''),
            tags: bilingue(f.tags ?? [], e.tags ?? []),
        }
    })

    // ---- formations ----
    verifierLongueurs('formations', fr.education, en.education)
    const idsForm = new Set()
    const formations = fr.education.map((f, i) => {
        const e = en.education[i]
        const ctx = `formation ${i}`
        const {debut, fin} = lirePeriode(f.years)
        return {
            _id: idUnique(`${slug(f.school)}-${debut.getUTCFullYear()}`, idsForm),
            ordre: i,
            ecole: bilingue(f.school, e.school),
            diplome: bilingue(f.degree, e.degree),
            debut, fin,
            enCours: Boolean(identique(ctx, 'current', f.current ?? false, e.current ?? false)),
            details: bilingue(f.details, e.details),
            siteWeb: identique(ctx, 'website', f.website, e.website) || null,
        }
    })

    // ---- projets (uniquement ceux de l'accueil : la carte est un monde separe) ----
    verifierLongueurs('projets', fr.projects, en.projects)
    const idsProj = new Set()
    const projets = fr.projects.map((f, i) => {
        const e = en.projects[PROJETS_EN_DECALES[i] ?? i]
        const ctx = `projet ${i} (${f.title})`
        return {
            _id: idUnique(slug(f.title), idsProj),
            ordre: i,
            titre: bilingue(f.title, e.title),
            description: bilingue(f.description, e.description),
            cadre: bilingue(f.school, e.school),
            badge: identique(ctx, 'badge', f.badge ?? null, e.badge ?? null),
            icone: identique(ctx, 'icon', f.icon, e.icon),
            tags: bilingue(f.tags ?? [], e.tags ?? []),
            // "#" ou absent = pas de lien public (null) ; sinon le lien connu dans l'une des deux langues.
            lien: [f.link, e.link].find(u => u && u !== '#') ?? null,
            statut: 'livre',
            noeuds: [],
        }
    })

    // ---- competences ----
    const competences = []
    const idsComp = new Set()
    for (const categorie of CATEGORIES_COMPETENCES) {
        const lf = fr.skills[categorie] ?? [], le = en.skills[categorie] ?? []
        verifierLongueurs(`competences ${categorie}`, lf, le)
        lf.forEach((f, i) => {
            const e = le[i]
            competences.push({
                _id: idUnique(`${categorie}-${slug(f.name)}`, idsComp),
                categorie,
                nom: bilingue(f.name, e.name),
                description: bilingue(f.desc, e.desc),
                ordre: i,
                noeuds: [],
            })
        })
    }
    const inconnues = Object.keys(fr.skills).filter(c => !CATEGORIES_COMPETENCES.includes(c))
    if (inconnues.length) throw new Error(`Categories de competences inconnues : ${inconnues.join(', ')}`)

    // ---- noeuds (les 74 cases de la carte, bande "proj" comprise) ----
    // Pas encore de version anglaise : en = fr provisoirement.
    const idsNoeuds = new Set(NODES.map(n => n.id))
    const noeuds = NODES.map(n => {
        if (!TRACKS[n.tk]) throw new Error(`Noeud ${n.id} : bande inconnue "${n.tk}"`)
        const absents = (n.p ?? []).filter(p => !idsNoeuds.has(p))
        if (absents.length) throw new Error(`Noeud ${n.id} : prerequis inconnus ${absents.join(', ')}`)
        return {
            _id: n.id,
            bande: n.tk,
            col: n.col,
            row: n.row,
            titre: bilingue(n.t, n.t),
            notions: bilingue(n.n ?? [], n.n ?? []),
            prerequis: n.p ?? [],
            livrables: (PROJ[n.id] ?? []).map(l => ({nom: bilingue(l.n, l.n), detail: bilingue(l.w, l.w)})),
            etat: 'non commence',
            etatModifieLe: null,
            historique: [],
        }
    })
    const livrablesOrphelins = Object.keys(PROJ).filter(id => !idsNoeuds.has(id))
    if (livrablesOrphelins.length) throw new Error(`PROJ reference des noeuds inconnus : ${livrablesOrphelins.join(', ')}`)

    return {
        documents: {profil: [profil], experiences, formations, projets, competences, noeuds, journal: []},
        avertissements,
    }
}

// Champs d'etat modifies plus tard depuis /admin : poses a la creation du document,
// jamais ecrases par une nouvelle execution de la migration.
export const CHAMPS_ETAT = {
    projets: ['statut', 'noeuds'],
    competences: ['noeuds'],
    noeuds: ['etat', 'etatModifieLe', 'historique'],
}

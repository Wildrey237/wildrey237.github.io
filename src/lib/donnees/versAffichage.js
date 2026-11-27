// Convertit les documents MongoDB vers la forme attendue par les composants de l'accueil
// (meme structure que les anciens data-fr.json / data-en.json), pour une langue donnee.
// Les dates sont formatees ici : seuls des objets simples sont transmis au client.

import {formaterPeriode} from './dates.js'
import {CATEGORIES_COMPETENCES, SECTIONS_ACCUEIL} from './schemas.js'

const parOrdre = (a, b) => a.ordre - b.ordre

// Ordre des sections : celui du profil, complete par les sections manquantes (ordre par defaut).
function ordreSections(ordre) {
    const connues = (ordre ?? []).filter(s => SECTIONS_ACCUEIL.includes(s))
    return [...new Set([...connues, ...SECTIONS_ACCUEIL])]
}

function pourLangue(docs, l) {
    const p = docs.profil
    const competences = [...docs.competences].sort(parOrdre)
    return {
        profile: {
            name: p.nom,
            title: p.titre[l],
            summary: p.resume[l],
            location: p.localisation,
            email: p.email,
            linkedin: p.linkedin,
            github: p.github,
            cvLink: p.cvUrl[l],
            // Texte du badge de disponibilite (vide = pas de badge).
            availability: p.recherche?.[l] ?? '',
            languages: p.langues?.[l] ?? '',
            link_picture: p.photoUrl,
            typewriter_roles: p.rolesTypewriter[l],
        },
        experiences: [...docs.experiences].sort(parOrdre).map(e => ({
            id: e._id,
            title: e.poste[l],
            company: e.entreprise[l],
            city: e.ville,
            website: e.siteWeb ?? '',
            logo: e.logo ?? '',
            dates: formaterPeriode(e.debut, e.fin, l),
            description: e.description[l],
            descriptionMore: e.descriptionDetail[l],
            tags: e.tags[l],
        })),
        skills: Object.fromEntries(
            CATEGORIES_COMPETENCES.map(c => [
                c,
                competences.filter(s => s.categorie === c).map(s => ({
                    id: s._id, name: s.nom[l], desc: s.description[l], noeuds: s.noeuds,
                })),
            ]),
        ),
        education: [...docs.formations].sort(parOrdre).map(f => ({
            id: f._id,
            school: f.ecole[l],
            degree: f.diplome[l],
            years: formaterPeriode(f.debut, f.fin, l),
            current: f.enCours,
            logo: f.logo ?? null,
            details: f.details[l],
            website: f.siteWeb ?? '',
        })),
        projects: [...docs.projets].sort(parOrdre).map(pr => ({
            id: pr._id,
            title: pr.titre[l],
            description: pr.description[l],
            school: pr.cadre[l],
            badge: pr.badge ?? undefined,
            icon: pr.icone,
            tags: pr.tags[l],
            link: pr.lien ?? '#',
            status: pr.statut,
            noeuds: pr.noeuds,
            domain: pr.domaine ?? null,
            featured: Boolean(pr.phare),
            personal: Boolean(pr.personnel),
        })),
        sections: ordreSections(p.ordreSections),
        certifications: [...(docs.certifications ?? [])].sort(parOrdre).map(c => ({
            id: c._id,
            name: c.nom,
            issuer: c.organisme,
            date: c.date ? new Date(c.date).toISOString().slice(0, 10) : null,
            link: c.lien ?? null,
        })),
    }
}

// docs : {profil, experiences, formations, projets, competences, certifications} -> {fr, en}
export function versAffichage(docs) {
    return {fr: pourLangue(docs, 'fr'), en: pourLangue(docs, 'en')}
}

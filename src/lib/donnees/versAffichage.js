// Convertit les documents MongoDB vers la forme attendue par les composants de l'accueil
// (meme structure que les anciens data-fr.json / data-en.json), pour une langue donnee.
// Les dates sont formatees ici : seuls des objets simples sont transmis au client.

import {formaterPeriode} from './dates.js'
import {CATEGORIES_COMPETENCES} from './schemas.js'

const parOrdre = (a, b) => a.ordre - b.ordre

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
            search: p.recherche[l],
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
        })),
    }
}

// docs : {profil, experiences, formations, projets, competences} -> {fr, en}
export function versAffichage(docs) {
    return {fr: pourLangue(docs, 'fr'), en: pourLangue(docs, 'en')}
}

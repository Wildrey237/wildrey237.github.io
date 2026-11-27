// Correctifs de donnees versionnes, appliques par scripts/migrer-mongodb.mjs.
// Chaque correctif ne s'applique qu'une fois (trace dans la collection _migrations) et reste
// idempotent : le rejouer (apres un --resync) donne le meme resultat, sans doublon.
// Une base neuve est d'abord remplie depuis les JSON historiques, puis recoit tous les correctifs.

const ia = 'ia-data', sys = 'systemes', web = 'web'

// Ordre d'affichage et domaine des projets du CV : IA et finance d'abord.
const ORDRE_PROJETS = [
    ['neuro-graph-trader-hedge-fund-autonome-par-gnn-rl', ia],
    ['prevision-boursiere-et-gestion-du-risque-par-gnn', ia],
    ['detection-de-fraude-et-blanchiment-en-temps-reel-aml', ia],
    ['rl-trading-agent-environnement-de-trading-par-mdp', ia],
    ['modelisation-black-scholes-finance-quantitative', ia],
    ['llm-society-simulation-multi-agents', ia],
    ['ddpm-generation-pixel-art-par-diffusion', ia],
    ['prediction-de-liens-graphe-de-connaissances-rdf', ia],
    ['cybersecurite-ml-detection-d-anomalies-industrielles', ia],
    ['ia-explicable-xai', ia],
    ['moteur-de-programmation-differentiable', ia],
    ['ia-medicale-segmentation-3d', ia],
    ['classification-d-images-de-galaxies', ia],
    ['filtrage-de-cv-via-nlp', ia],
    ['systemes-de-recommandation', ia],
    ['analyse-et-prediction-des-accidents-routiers', ia],
    ['classification-de-donnees-medicales', ia],
    ['ai-job-tracker-ats-personnel-intelligent', ia],
    ['deneigement-de-montreal-probleme-du-postier-chinois', ia],
    ['projet-d-analyse-de-donnees', ia],
    ['prevision-boursiere-gestion-du-risque-par-gnn', ia],
    ['plateforme-microservices-tinyx', sys],
    ['tiger-compilateur-en-c-epita-lrde', sys],
    ['42sh-shell-posix-en-c', sys],
    ['malloc-allocateur-memoire-en-c', sys],
    ['machine-de-turing-electromecanique', sys],
    ['leach-reseaux-de-capteurs-sans-fil-wsn', sys],
    ['systeme-de-stationnement-intelligent-arduino', sys],
    ['voiture-telecommandee-par-gestes', sys],
    ['serveur-web-linux', sys],
    ['administration-reseau', sys],
    ['eplace-canvas-collaboratif-temps-reel', web],
    ['ping-ide-theme-clash-of-clans', web],
    ['portfolio-personnel-react-chakra-ui', web],
    ['reservation-de-billets-de-cinema-spring-mvc', web],
    ['mini-leboncoin-marketplace-php', web],
    ['applications-flask-php-python', web],
]

import {restaurerAccents} from './accents.js'

// Emojis (dont les drapeaux) : interdits par la charte.
const EMOJI = /[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu

// Seules les chaines contenant un emoji sont touchees : on retire l'emoji et l'espace
// qu'il laisse en double ("Cameroun 🇨🇲 à" -> "Cameroun à"). La typographie francaise
// (espace avant ":") n'est jamais modifiee ailleurs.
function sansEmoji(valeur) {
    if (typeof valeur === 'string') {
        if (valeur.search(EMOJI) === -1) return valeur
        return valeur.replace(new RegExp(`[ \\t]?(?:${EMOJI.source})+`, 'gu'), '').replace(/ {2,}/g, ' ')
    }
    if (Array.isArray(valeur)) return valeur.map(sansEmoji)
    if (valeur && typeof valeur === 'object' && !(valeur instanceof Date)) {
        return Object.fromEntries(Object.entries(valeur).map(([k, v]) => [k, sansEmoji(v)]))
    }
    return valeur
}

export const CORRECTIFS = [
    {
        id: '2026-11-27-experience-ca-cib',
        description: 'Ajout du stage Data Scientist chez Credit Agricole CIB, en tete des experiences',
        async appliquer(db) {
            const col = db.collection('experiences')
            const _id = 'credit-agricole-cib-2026'
            if (await col.countDocuments({_id})) return 'deja presente'
            // Decale les experiences existantes pour placer celle-ci en premier.
            await col.updateMany({}, {$inc: {ordre: 1}})
            await col.insertOne({
                _id,
                ordre: 0,
                poste: {fr: 'Data Scientist (stage)', en: 'Data Scientist (internship)'},
                entreprise: {fr: 'Crédit Agricole CIB', en: 'Crédit Agricole CIB'},
                ville: 'Montrouge, Île-de-France',
                siteWeb: null,
                logo: null,
                debut: new Date(Date.UTC(2026, 8, 1)),
                fin: null,
                description: {
                    fr: '• Détection de failles de sécurité par des tests de prompts selon le référentiel OWASP, et renforcement du modèle.\n'
                        + '• Production et automatisation des métriques de performance du modèle, et enrichissement des données de référence à chaque nouveau breach type.\n'
                        + '• Extension du périmètre fonctionnel : ajout de nouveaux types de dépassements de limites de risque (breach types).',
                    en: '• Detection of security vulnerabilities through prompt testing against the OWASP framework, and model hardening.\n'
                        + '• Production and automation of model performance metrics, and enrichment of the reference data with each new breach type.\n'
                        + '• Extension of the functional scope: new types of risk limit breaches (breach types).',
                },
                descriptionDetail: {fr: '', en: ''},
                tags: {
                    fr: ['IA générative', 'Prompt engineering', 'OWASP', 'Évaluation de modèles', 'Python'],
                    en: ['Generative AI', 'Prompt engineering', 'OWASP', 'Model evaluation', 'Python'],
                },
            })
            return 'ajoutee'
        },
    },
    {
        id: '2026-11-27-certifications-dataiku',
        description: 'Trois certifications Dataiku Academy',
        async appliquer(db) {
            const certifs = [
                ['dataiku-ml-practitioner', 'Dataiku ML Practitioner', 'https://verify.skilljar.com/c/ce6wvfk34kb4'],
                ['dataiku-developer', 'Dataiku Developer', 'https://verify.skilljar.com/c/on2nktqf6q4j'],
                ['dataiku-core-designer', 'Dataiku Core Designer', 'https://verify.skilljar.com/c/5dgicbut9kjh'],
            ]
            const r = await db.collection('certifications').bulkWrite(certifs.map(([_id, nom, lien], ordre) => ({
                updateOne: {
                    filter: {_id},
                    update: {$setOnInsert: {ordre, nom, organisme: 'Dataiku Academy', date: null, lien}},
                    upsert: true,
                },
            })))
            return `${r.upsertedCount} ajoutee(s)`
        },
    },
    {
        id: '2026-11-27-hero',
        description: 'Hero : sous-titre, fin du resume, badge de disponibilite, langues, portrait recadre',
        async appliquer(db) {
            await db.collection('profil').updateOne({_id: 'profil'}, {
                $set: {
                    titre: {fr: 'Ingénieur IA & Data · EPITA SCIA-G', en: 'AI & Data Engineer · EPITA SCIA-G'},
                    resume: {
                        fr: 'Du Cameroun à EPITA Lyon, j’ai construit des compilateurs, entraîné des réseaux de neurones '
                            + 'et optimisé des pipelines de données en production. Passionné d’IA et de recherche appliquée, '
                            + 'j’ai récemment découvert une vraie fascination pour la finance quantitative et les marchés financiers. '
                            + 'Je cherche un stage de 6 mois à partir de mars 2027.',
                        en: 'From Cameroon to EPITA Lyon, I’ve built compilers, trained neural networks and optimized data '
                            + 'pipelines in production. Passionate about AI and applied research, I’ve recently developed a real '
                            + 'fascination for quantitative finance and financial markets. '
                            + 'I’m looking for a 6-month internship starting in March 2027.',
                    },
                    recherche: {fr: 'Disponible pour un stage dès mars 2027', en: 'Available for an internship from March 2027'},
                    langues: {fr: 'Français (natif) · Anglais (courant, TOEIC en cours)', en: 'French (native) · English (fluent, TOEIC in progress)'},
                    photoUrl: '/portrait.jpg',
                },
            })
            return 'profil mis a jour'
        },
    },
    {
        id: '2026-11-27-sans-emoji',
        description: 'Suppression des emojis et drapeaux dans tout le contenu',
        async appliquer(db) {
            let n = 0
            for (const nom of ['profil', 'experiences', 'formations', 'projets', 'competences', 'certifications']) {
                const col = db.collection(nom)
                for (const doc of await col.find().toArray()) {
                    const {_id, ...champs} = doc
                    const nettoye = sansEmoji(champs)
                    if (JSON.stringify(nettoye) !== JSON.stringify(champs)) {
                        await col.replaceOne({_id}, nettoye)
                        n++
                    }
                }
            }
            return `${n} document(s) nettoye(s)`
        },
    },
    {
        id: '2026-11-27-ecoles-sans-code-pays',
        description: 'Formations : retrait des codes pays en fin de nom d ecole (restes de drapeaux : " FR", " CMR")',
        async appliquer(db) {
            const col = db.collection('formations')
            let n = 0
            for (const f of await col.find().toArray()) {
                const ecole = {fr: f.ecole.fr.replace(/\s+(FR|CMR)$/, ''), en: f.ecole.en.replace(/\s+(FR|CMR)$/, '')}
                if (ecole.fr !== f.ecole.fr || ecole.en !== f.ecole.en) {
                    await col.updateOne({_id: f._id}, {$set: {ecole}})
                    n++
                }
            }
            return `${n} ecole(s) corrigee(s)`
        },
    },
    {
        id: '2026-11-27-projets-domaines-ordre',
        description: 'Projets du CV : domaine (filtres), indicateur personnel, ordre IA et finance d abord',
        async appliquer(db) {
            const col = db.collection('projets')
            const connus = new Set(ORDRE_PROJETS.map(([id]) => id))
            const ops = ORDRE_PROJETS.map(([_id, domaine], ordre) => ({updateOne: {filter: {_id}, update: {$set: {domaine, ordre}}}}))
            // Projets ajoutes depuis /admin : places apres, dans leur ordre actuel.
            const autres = await col.find({_id: {$nin: [...connus]}}).sort({ordre: 1}).toArray()
            autres.forEach((p, i) => ops.push({updateOne: {filter: {_id: p._id}, update: {$set: {ordre: ORDRE_PROJETS.length + i}}}}))
            await col.bulkWrite(ops)
            // "Personnel" : deduit du cadre actuel, modifiable ensuite dans /admin.
            await col.updateMany({'cadre.fr': 'Projet Personnel'}, {$set: {personnel: true}})
            await col.updateMany({'cadre.fr': {$ne: 'Projet Personnel'}}, {$set: {personnel: false}})
            return `${ORDRE_PROJETS.length + autres.length} projet(s) ordonne(s)`
        },
    },
    {
        id: '2026-11-27-scia-g-en-cours',
        description: 'Formation SCIA-G : fin inconnue (null), affichee "2024 – en cours"',
        async appliquer(db) {
            const r = await db.collection('formations').updateOne(
                {'ecole.fr': {$regex: '^EPITA – Spécialisation SCIA'}},
                {$set: {fin: null, enCours: true}},
            )
            return r.matchedCount ? 'formation mise a jour' : 'formation SCIA-G introuvable'
        },
    },
    {
        id: '2026-11-27-doublon-prevision-boursiere',
        description: 'Suppression du doublon "Prevision boursiere et gestion du risque par GNN" (garde la description la plus complete)',
        async appliquer(db) {
            const col = db.collection('projets')
            const doublons = await col.find({_id: {$in: [
                'prevision-boursiere-et-gestion-du-risque-par-gnn',
                'prevision-boursiere-gestion-du-risque-par-gnn',
            ]}}).toArray()
            if (doublons.length < 2) return 'plus de doublon'
            // La plus complete : la description FR + EN la plus longue.
            const longueur = p => p.description.fr.length + p.description.en.length
            doublons.sort((a, b) => longueur(b) - longueur(a))
            const [garde, retire] = doublons
            // Le projet garde reprend la place la plus haute des deux, et les noeuds lies a l'autre.
            await col.updateOne({_id: garde._id}, {
                $set: {ordre: Math.min(garde.ordre, retire.ordre)},
                $addToSet: {noeuds: {$each: retire.noeuds ?? []}},
            })
            await col.deleteOne({_id: retire._id})
            return `garde ${garde._id} (${longueur(garde)} car.), supprime ${retire._id} (${longueur(retire)} car.)`
        },
    },
    {
        id: '2026-11-27-accents-carte',
        description: 'Carte : accents et apostrophes retablis dans les titres, notions et livrables des 74 noeuds',
        async appliquer(db) {
            const col = db.collection('noeuds')
            const bi = v => ({fr: restaurerAccents(v.fr), en: restaurerAccents(v.en)})
            const biListe = v => ({fr: v.fr.map(restaurerAccents), en: v.en.map(restaurerAccents)})
            let n = 0
            for (const noeud of await col.find().toArray()) {
                const champs = {
                    titre: bi(noeud.titre),
                    notions: biListe(noeud.notions),
                    livrables: noeud.livrables.map(l => ({nom: bi(l.nom), detail: bi(l.detail)})),
                }
                if (JSON.stringify(champs) === JSON.stringify({titre: noeud.titre, notions: noeud.notions, livrables: noeud.livrables})) continue
                await col.updateOne({_id: noeud._id}, {$set: champs})
                n++
            }
            return `${n} noeud(s) corrige(s)`
        },
    },
    {
        id: '2026-11-27-projets-phares',
        description: 'Projets phares initiaux : les 6 premiers projets (IA et finance), si aucun n est encore phare',
        async appliquer(db) {
            const col = db.collection('projets')
            if (await col.countDocuments({phare: true})) return 'projets phares deja choisis'
            const premiers = await col.find({}, {projection: {_id: 1}}).sort({ordre: 1}).limit(6).toArray()
            await col.updateMany({_id: {$in: premiers.map(p => p._id)}}, {$set: {phare: true}})
            return `${premiers.length} projet(s) phare(s)`
        },
    },
]

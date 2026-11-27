// Schemas de validation ($jsonSchema) et index des collections MongoDB.
// Partage entre le script de migration (creation / mise a jour des validateurs)
// et le code applicatif (valeurs autorisees des enums).

export const ETATS_NOEUD = ['non commence', 'en cours', 'maitrise']
export const STATUTS_PROJET = ['a faire', 'en cours', 'livre']
export const BANDES = ['math', 'ml', 'graph', 'algo', 'data', 'proj']
// Ordre d'affichage des categories de competences sur l'accueil.
export const CATEGORIES_COMPETENCES = [
    'ai', 'data_engineering', 'software_engineering', 'cloud_mlops',
    'databases', 'visualization', 'math_foundations', 'tools',
]

// Texte traduisible : {fr, en}, les deux obligatoires (FR et EN gardes synchrones).
const texte = {
    bsonType: 'object',
    required: ['fr', 'en'],
    additionalProperties: false,
    properties: {fr: {bsonType: 'string'}, en: {bsonType: 'string'}},
}
// Liste traduisible : {fr: [], en: []}.
const listeTexte = {
    bsonType: 'object',
    required: ['fr', 'en'],
    additionalProperties: false,
    properties: {
        fr: {bsonType: 'array', items: {bsonType: 'string'}},
        en: {bsonType: 'array', items: {bsonType: 'string'}},
    },
}
const chaine = {bsonType: 'string'}
const chaineOuNull = {bsonType: ['string', 'null']}
const entier = {bsonType: ['int', 'long']}
const dateOuNull = {bsonType: ['date', 'null']}
const ids = {bsonType: 'array', items: {bsonType: 'string'}}

function schema(required, properties) {
    return {$jsonSchema: {bsonType: 'object', required, additionalProperties: false, properties: {_id: chaine, ...properties}}}
}

export const COLLECTIONS = {
    profil: {
        validateur: schema(
            ['nom', 'titre', 'resume', 'localisation', 'email', 'linkedin', 'github', 'cvUrl', 'photoUrl', 'recherche', 'rolesTypewriter'],
            {
                nom: chaine, titre: texte, resume: texte, localisation: chaine, email: chaine,
                linkedin: chaine, github: chaine,
                // Un CV par langue : l'URL est donc traduisible.
                cvUrl: texte,
                photoUrl: chaine, recherche: texte, rolesTypewriter: listeTexte,
            },
        ),
        index: [],
    },
    experiences: {
        validateur: schema(
            ['ordre', 'poste', 'entreprise', 'ville', 'debut', 'fin', 'description', 'descriptionDetail', 'tags'],
            {
                ordre: entier, poste: texte,
                // Le nom peut etre traduit (ex. "Associes" / "Associates").
                entreprise: texte,
                ville: chaine, siteWeb: chaineOuNull, logo: chaineOuNull,
                debut: {bsonType: 'date'}, fin: dateOuNull,
                description: texte, descriptionDetail: texte,
                tags: listeTexte,
            },
        ),
        index: [{cle: {ordre: 1}}],
    },
    formations: {
        validateur: schema(
            ['ordre', 'ecole', 'diplome', 'debut', 'fin', 'enCours', 'details'],
            {
                ordre: entier, ecole: texte, diplome: texte,
                debut: {bsonType: 'date'}, fin: dateOuNull, enCours: {bsonType: 'bool'},
                details: texte, siteWeb: chaineOuNull,
            },
        ),
        index: [{cle: {ordre: 1}}],
    },
    projets: {
        validateur: schema(
            ['ordre', 'titre', 'description', 'cadre', 'icone', 'tags', 'statut', 'noeuds'],
            {
                ordre: entier, titre: texte, description: texte, cadre: texte,
                badge: chaineOuNull, icone: chaine, tags: listeTexte, lien: chaineOuNull,
                statut: {enum: STATUTS_PROJET},
                noeuds: ids,
            },
        ),
        index: [{cle: {noeuds: 1}}, {cle: {ordre: 1}}],
    },
    competences: {
        validateur: schema(
            ['categorie', 'nom', 'description', 'ordre', 'noeuds'],
            {
                categorie: {enum: CATEGORIES_COMPETENCES},
                nom: texte, description: texte, ordre: entier, noeuds: ids,
            },
        ),
        index: [{cle: {categorie: 1, ordre: 1}}, {cle: {noeuds: 1}}],
    },
    noeuds: {
        validateur: schema(
            ['bande', 'col', 'row', 'titre', 'notions', 'prerequis', 'livrables', 'etat', 'etatModifieLe', 'historique'],
            {
                bande: {enum: BANDES},
                col: entier, row: entier,
                titre: texte, notions: listeTexte, prerequis: ids,
                // Livrables rattaches au noeud sur la carte (ex-table PROJ de prereqMapData.js).
                // Imbriques : quelques entrees, toujours lues avec le noeud, propres a la carte.
                livrables: {
                    bsonType: 'array',
                    items: {
                        bsonType: 'object', required: ['nom', 'detail'], additionalProperties: false,
                        properties: {nom: texte, detail: texte},
                    },
                },
                etat: {enum: ETATS_NOEUD},
                etatModifieLe: dateOuNull,
                historique: {
                    bsonType: 'array',
                    items: {
                        bsonType: 'object', required: ['etat', 'date'], additionalProperties: false,
                        properties: {etat: {enum: ETATS_NOEUD}, date: {bsonType: 'date'}},
                    },
                },
            },
        ),
        index: [{cle: {bande: 1}}, {cle: {etat: 1}}, {cle: {prerequis: 1}}],
    },
    journal: {
        validateur: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['_id', 'minutes', 'noeuds'],
                additionalProperties: false,
                properties: {
                    // Date du jour "AAAA-MM-JJ" : unique par construction.
                    _id: {bsonType: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$'},
                    minutes: {bsonType: ['int', 'long'], minimum: 0},
                    noeuds: ids,
                    commentaire: chaineOuNull,
                },
            },
        },
        index: [],
    },
}

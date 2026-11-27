'use client'

// Ordre des sections de l'accueil : glisser-deposer (dnd-kit) et boutons monter / descendre.
// Enregistrement automatique au lacher ; le hero et le contact restent fixes.
import {useState, useTransition} from 'react'
import Link from 'next/link'
import {DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors} from '@dnd-kit/core'
import {SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'
import {enregistrerOrdreSections} from '../actions'

const NOMS = {
    experiences: 'Expériences', formation: 'Formation', competences: 'Compétences',
    certifications: 'Certifications', projets: 'Projets',
}

// Annonces pour les lecteurs d'ecran (dnd-kit les fournit en anglais par defaut).
const ACCESSIBILITE = {
    screenReaderInstructions: {
        draggable: 'Pour déplacer une section, appuyer sur Espace, utiliser les flèches haut et bas, '
            + 'puis Espace pour déposer ou Échap pour annuler.',
    },
    announcements: {
        onDragStart: ({active}) => `${NOMS[active.id]} saisie.`,
        onDragOver: ({active, over}) => over ? `${NOMS[active.id]} au-dessus de ${NOMS[over.id]}.` : `${NOMS[active.id]} hors de la liste.`,
        onDragEnd: ({active, over}) => over ? `${NOMS[active.id]} déposée à la place de ${NOMS[over.id]}.` : `${NOMS[active.id]} déposée.`,
        onDragCancel: ({active}) => `Déplacement de ${NOMS[active.id]} annulé.`,
    },
}

function LigneFixe({libelle}) {
    return (
        <li className="admin-ordre-ligne admin-ordre-fixe">
            <span className="admin-ordre-poignee" aria-hidden="true">·</span>
            <span style={{flex: 1}}>{libelle}</span>
            <span className="admin-doux">non déplaçable</span>
        </li>
    )
}

function Ligne({id, index, total, deplacer, desactive}) {
    const {attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging} = useSortable({id})
    return (
        <li ref={setNodeRef} className={`admin-ordre-ligne${isDragging ? ' admin-ordre-glisse' : ''}`}
            style={{transform: CSS.Transform.toString(transform), transition}}>
            <button type="button" ref={setActivatorNodeRef} className="admin-ordre-poignee secondaire"
                    aria-label={`Déplacer ${NOMS[id]} (glisser, ou Espace puis flèches)`} {...attributes} {...listeners}>
                ⠿
            </button>
            <span style={{flex: 1}}>{NOMS[id]}</span>
            <button type="button" className="secondaire" disabled={desactive || index === 0}
                    onClick={() => deplacer(index, index - 1)} aria-label={`Monter ${NOMS[id]}`}>Monter</button>
            <button type="button" className="secondaire" disabled={desactive || index === total - 1}
                    onClick={() => deplacer(index, index + 1)} aria-label={`Descendre ${NOMS[id]}`}>Descendre</button>
        </li>
    )
}

export default function OrdreSections({ordreInitial}) {
    const [ordre, setOrdre] = useState(ordreInitial)
    const [statut, setStatut] = useState(null)
    const [modifie, setModifie] = useState(false)
    const [enCours, demarrer] = useTransition()
    const capteurs = useSensors(
        useSensor(PointerSensor, {activationConstraint: {distance: 4}}),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
    )

    const enregistrer = (nouvel, ancien) => {
        setOrdre(nouvel)
        setStatut('Enregistrement…')
        demarrer(async () => {
            const r = await enregistrerOrdreSections(nouvel)
            if (r?.ok) {
                setStatut('Ordre enregistré.')
                setModifie(true)
            } else {
                setOrdre(ancien)
                setStatut(`Échec : ${r?.erreur ?? 'erreur inconnue'}. Ordre précédent rétabli.`)
            }
        })
    }

    const deplacer = (de, vers) => {
        if (vers < 0 || vers >= ordre.length || de === vers) return
        enregistrer(arrayMove(ordre, de, vers), ordre)
    }

    const surLacher = ({active, over}) => {
        if (!over || active.id === over.id) return
        deplacer(ordre.indexOf(active.id), ordre.indexOf(over.id))
    }

    return (
        <>
            <ol className="admin-ordre">
                <LigneFixe libelle="Hero (toujours en premier)"/>
                <DndContext sensors={capteurs} collisionDetection={closestCenter} onDragEnd={surLacher} accessibility={ACCESSIBILITE}>
                    <SortableContext items={ordre} strategy={verticalListSortingStrategy}>
                        {ordre.map((id, i) => (
                            <Ligne key={id} id={id} index={i} total={ordre.length} deplacer={deplacer} desactive={enCours}/>
                        ))}
                    </SortableContext>
                </DndContext>
                <LigneFixe libelle="Contact (toujours en dernier)"/>
            </ol>
            <p role="status" aria-live="polite" id="ordre-statut" className="admin-doux" style={{minHeight: 24}}>{statut}</p>
            {modifie && (
                <p><Link href="/" target="_blank" rel="noreferrer">Voir le site avec le nouvel ordre ↗</Link></p>
            )}
        </>
    )
}

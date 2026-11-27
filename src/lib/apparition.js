'use client'

// Animations d'apparition des elements marques data-apparition (voir src/index.css).
// - 0,3 s maximum, declenchees des qu'un bord de l'element entre a l'ecran (threshold 0) ;
// - jamais pour un element deja visible au chargement (pas de clignotement) ;
// - aucune avec prefers-reduced-motion ou sans JavaScript : le contenu reste toujours visible.
// L'etat est un attribut pose hors de React (data-apparition-etat), que React ne reecrit pas.
import {useEffect} from 'react'

export function useApparition() {
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        if (!('IntersectionObserver' in window)) return

        const observateur = new IntersectionObserver(entrees => {
            for (const entree of entrees) {
                if (!entree.isIntersecting) continue
                entree.target.removeAttribute('data-apparition-etat')
                observateur.unobserve(entree.target)
            }
        }, {threshold: 0})

        const hauteur = window.innerHeight
        for (const el of document.querySelectorAll('[data-apparition]')) {
            const r = el.getBoundingClientRect()
            // Deja a l'ecran, ou non affiche (carte masquee) : laisse tel quel.
            if (r.height === 0 || (r.top < hauteur && r.bottom > 0)) continue
            el.setAttribute('data-apparition-etat', 'attente')
            observateur.observe(el)
        }
        return () => observateur.disconnect()
    }, [])
}

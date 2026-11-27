// Icones de technologies (simple-icons, licence CC0), en une seule couleur qui suit le texte.
// Correspondance explicite nom de competence -> icone. Rien pour les notions abstraites
// (GNN, XAI, Optimisation...) ni pour les marques absentes de simple-icons (AWS, Tableau,
// Power BI, Matplotlib, Seaborn) : pas d'icone plutot qu'une icone inventee.
import {
    siApacheairflow, siApachespark, siDataiku, siDocker, siGit, siGitlab, siGnubash, siHuggingface, siJupyter,
    siKubernetes, siLanggraph, siLinux, siMlflow, siMongodb, siMysql, siNeo4j, siPostgresql, siPython, siPytorch, siR,
    siReact, siScikitlearn, siStreamlit, siTypescript,
} from "simple-icons";

// Premier motif qui correspond au nom (FR ou EN) -> icone.
const CORRESPONDANCES = [
    [/^python/i, siPython],
    [/^pytorch/i, siPytorch],
    [/^scikit-learn/i, siScikitlearn],
    [/^apache airflow/i, siApacheairflow],
    [/^spark/i, siApachespark],
    [/^r$/i, siR],
    [/^javascript, typescript|^typescript/i, siTypescript],
    [/^react/i, siReact],
    [/^docker/i, siDocker],
    [/^kubernetes/i, siKubernetes],
    [/^gitlab/i, siGitlab],
    [/^mysql/i, siMysql],
    [/^postgresql/i, siPostgresql],
    [/^mongodb/i, siMongodb],
    [/^neo4j/i, siNeo4j],
    [/^linux/i, siLinux],
    [/^git$/i, siGit],
    [/^bash/i, siGnubash],
    [/^jupyter/i, siJupyter],
    [/^hugging face/i, siHuggingface],
    [/^mlflow/i, siMlflow],
    [/^langgraph/i, siLanggraph],
    [/^streamlit/i, siStreamlit],
    [/^dataiku/i, siDataiku],
];

export function iconePour(nom) {
    return CORRESPONDANCES.find(([motif]) => motif.test(nom.trim()))?.[1] ?? null;
}

// Icone SVG monochrome (couleur du texte), decorative.
export function IconeTechno({icone, taille = 14}) {
    if (!icone) return null;
    return (
        <svg viewBox="0 0 24 24" width={taille} height={taille} fill="currentColor" aria-hidden="true"
             focusable="false" style={{flexShrink: 0}}>
            <path d={icone.path}/>
        </svg>
    );
}

// Icones de technologies, en une seule couleur qui suit le texte.
// - iconePour : logo de la marque (simple-icons, licence CC0 ; AWS via react-icons), sinon rien.
// - iconeCompetence : logo de la marque, sinon une icone generique Lucide qui evoque la notion
//   (GNN, XAI, Optimisation...) ou l'usage (Tableau, Power BI, Matplotlib, Seaborn n'ont pas de
//   logo disponible : icone de graphique, jamais un faux logo).
import {
    Activity, Bot, Braces, Brain, ChartArea, ChartBar, ChartColumn, ChartLine, ChartScatter, Database, Dices, Eye,
    Grid3x3, Infinity as Boucle, Languages, MessageSquareText, Network, Sparkles, Target, TrendingDown, Workflow,
} from "lucide-react";
import {FaAws} from "react-icons/fa6";
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
    [/^aws$/i, FaAws],
];

// Notions sans marque (FR ou EN) -> icone generique.
const NOTIONS = [
    [/^machine learning/i, Brain],
    [/^graph neural/i, Network],
    [/^reinforcement/i, Target],
    [/^explainable|^ia explicable/i, Eye],
    [/^gan$/i, Sparkles],
    [/^llm/i, MessageSquareText],
    [/^nlp/i, Languages],
    [/multi-agent/i, Bot],
    [/^mlops/i, Boucle],
    [/^sql$/i, Database],
    [/pipelines|etl/i, Workflow],
    [/^alg[eè]bre lin|^linear algebra/i, Grid3x3],
    [/probabilit/i, Dices],
    [/^optimi[sz]ation/i, TrendingDown],
    [/stochasti/i, Activity],
    [/^s[eé]ries temporelles|^time series/i, ChartLine],
    [/^api rest|^rest api/i, Braces],
    [/^tableau$/i, ChartBar],
    [/^power bi/i, ChartColumn],
    [/^matplotlib/i, ChartScatter],
    [/^seaborn/i, ChartArea],
];

// Icones Lucide (trait) : trait epaissi pour peser autant que les logos pleins a 14px.
const A_TRAIT = new Set(NOTIONS.map(([, icone]) => icone))

const chercher = (liste, nom) => liste.find(([motif]) => motif.test(nom.trim()))?.[1] ?? null;

export function iconePour(nom) {
    return chercher(CORRESPONDANCES, nom);
}

export function iconeCompetence(nom) {
    return iconePour(nom) ?? chercher(NOTIONS, nom);
}

// Icone SVG monochrome (couleur du texte), decorative.
export function IconeTechno({icone, taille = 14}) {
    if (!icone) return null;
    // Composant React (Lucide, react-icons) plutot qu'un trace simple-icons.
    if (!icone.path) {
        const Icone = icone;
        return <Icone size={taille} aria-hidden="true" focusable="false" style={{flexShrink: 0}}
                      {...(A_TRAIT.has(icone) ? {strokeWidth: 2.6} : {})}/>;
    }
    return (
        <svg viewBox="0 0 24 24" width={taille} height={taille} fill="currentColor" aria-hidden="true"
             focusable="false" style={{flexShrink: 0}}>
            <path d={icone.path}/>
        </svg>
    );
}

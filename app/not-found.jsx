import Link from 'next/link'

export default function NotFound() {
    return (
        <div
            style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                background: '#0b0d14',
                color: '#e8e9f4',
                minHeight: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '24px',
                textAlign: 'center',
                padding: '24px',
            }}
        >
            <div style={{fontSize: '5rem', fontWeight: 700, color: '#8fa2ff', lineHeight: 1}}>404</div>
            <div style={{fontSize: '1.1rem', color: '#9497b3', maxWidth: '360px', lineHeight: 1.6}}>
                {"Cette page n'existe pas — ou n'existe plus."}
            </div>
            <Link
                href="/"
                style={{
                    marginTop: '8px',
                    padding: '10px 28px',
                    background: '#4f66f5',
                    color: '#fff',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: 500,
                }}
            >
                {"Retour à l'accueil"}
            </Link>
        </div>
    )
}

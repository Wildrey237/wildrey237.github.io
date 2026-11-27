/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // L'ancienne carte /ml-map est remplacee par le parcours prive.
    // /parcours : public mais jamais indexe (la meta robots est aussi posee par la page).
    async headers() {
        return [{source: '/parcours', headers: [{key: 'X-Robots-Tag', value: 'noindex, nofollow'}]}]
    },
    async redirects() {
        return [{source: '/ml-map', destination: '/parcours', permanent: true}]
    },
    experimental: {
        // Televersement de logos depuis /admin (1 Mo par fichier, plus le reste du formulaire).
        serverActions: {bodySizeLimit: '2mb'},
    },
};

export default nextConfig;

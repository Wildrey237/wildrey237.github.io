/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        // Televersement de logos depuis /admin (1 Mo par fichier, plus le reste du formulaire).
        serverActions: {bodySizeLimit: '2mb'},
    },
};

export default nextConfig;

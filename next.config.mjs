/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
            },
        ],
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // undici is a node-only library, we don't need it in the browser
            config.resolve.fallback = {
                ...config.resolve.fallback,
                undici: false,
            };
        }
        return config;
    },
};

export default nextConfig;
